from typing import Dict, List, Optional
import os

class ModelRegistry:
    """
    Comprehensive Registry of AI Models available via OpenRouter and Local NPU.
    Acts as the central 'Phonebook' for the UnifiedIntelligenceProvider.
    """
    
    # --- PROPRIETARY GIANTS ---
    GPT_4O = "openai/gpt-4o"
    GPT_4_TURBO = "openai/gpt-4-turbo"
    GPT_3_5_TURBO = "openai/gpt-3.5-turbo"
    
    CLAUDE_3_5_SONNET = "anthropic/claude-3.5-sonnet"
    CLAUDE_3_OPUS = "anthropic/claude-3-opus"
    CLAUDE_3_HAIKU = "anthropic/claude-3-haiku"
    
    GEMINI_1_5_PRO = "google/gemini-pro-1.5"
    GEMINI_1_5_FLASH = "google/gemini-flash-1.5"
    
    # --- OPEN SOURCE HEROS (DeepSeek, Llama, Mistral) ---
    LLAMA_3_70B = "meta-llama/llama-3-70b-instruct"
    LLAMA_3_8B = "meta-llama/llama-3-8b-instruct"
    MISTRAL_LARGE = "mistralai/mistral-large"
    DEEPSEEK_CODER = "deepseek/deepseek-coder"
    DEEPSEEK_V2 = "deepseek/deepseek-chat"
    QWEN_110B = "qwen/qwen-1.5-110b-chat"
    
    # --- SPECIALIZED (Perplexity, Nous, Etc) ---
    PPLX_70B_ONLINE = "perplexity/llama-3-sonar-large-32k-online"
    NOUS_HERMES_2 = "nousresearch/nous-hermes-2-mixtral-8x7b-dpo"
    
    # --- LOCAL NPU CANDIDATES (Ollama) ---
    LOCAL_PHI3 = "phi3:latest"
    LOCAL_LLAMA3 = "llama3:latest"
    LOCAL_MISTRAL = "mistral:latest"
    LOCAL_GEMMA = "gemma:7b"

    @staticmethod
    def get_all_models() -> List[str]:
        """Returns a list of all registered model IDs."""
        return [
            v for k, v in ModelRegistry.__dict__.items() 
            if not k.startswith("__") and isinstance(v, str)
        ]

class ModelRouter:
    """
    The 'Cortex' that decides which AI model is best suited for a specific cognitive task.
    Implements a robust Mixture of Experts (MoE) routing strategy.
    """
    
    def __init__(self):
        self.registry = ModelRegistry()

    def get_model_for_role(self, role: str) -> str:
        """
        Returns the optimal model ID for a given debate role.
        """
        routing_table = {
            # PROPOSER: Needs high reasoning & creativity
            "Proposer": ModelRegistry.GPT_4O, 
            
            # CRITIC: Needs high nuance, skepticism, and large context (Claude excels here)
            "Critic": ModelRegistry.CLAUDE_3_5_SONNET, 
            
            # JUDGE: Needs massive context window to synthesize extensive debate history
            "Judge": ModelRegistry.GEMINI_1_5_PRO, 
            
            # EXECUTOR: Coding specialist
            "Executor": ModelRegistry.DEEPSEEK_CODER, 
            
            # FAST / GENERAL
            "General": ModelRegistry.GPT_3_5_TURBO,
            "Fast": ModelRegistry.CLAUDE_3_HAIKU,
            
            # LOCAL FALLBACKS
            "LocalReasoning": ModelRegistry.LOCAL_PHI3,
            "LocalAction": ModelRegistry.LOCAL_LLAMA3
        }
        
        return routing_table.get(role, ModelRegistry.GPT_4O)  # Default to best reasoner

    def resolve_model_alias(self, alias: str) -> str:
        """
        Resolves short aliases (e.g., 'gpt4', 'claude') to full OpenRouter IDs.
        """
        alias_map = {
            "gpt4": ModelRegistry.GPT_4O,
            "gpt4o": ModelRegistry.GPT_4O,
            "claude": ModelRegistry.CLAUDE_3_5_SONNET,
            "sonnet": ModelRegistry.CLAUDE_3_5_SONNET,
            "opus": ModelRegistry.CLAUDE_3_OPUS,
            "gemini": ModelRegistry.GEMINI_1_5_PRO,
            "flash": ModelRegistry.GEMINI_1_5_FLASH,
            "llama3": ModelRegistry.LLAMA_3_70B,
            "local": "local", # Special flag
        }
        return alias_map.get(alias.lower(), alias)
