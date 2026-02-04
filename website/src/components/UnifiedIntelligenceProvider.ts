
import { create } from 'zustand';

// --- Interfaces ---

interface AIModel {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

interface IntelligenceState {
  models: AIModel[];
  selectedModel: string;
  isFetchingModels: boolean;
  error: string | null;
  
  // Actions
  fetchModels: () => Promise<void>;
  selectModel: (modelId: string) => void;
  queryModel: (prompt: string) => Promise<string>;
}

// --- OpenRouter API Config --
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";
// NOTE: In a real production app, the key should be in a .env file and proxying through a backend.
// For this 'Self-Constructing' demo, we will rely on the user providing the key or using a public relay if available,
// but since the prompt asked for E2E integration, we'll setup the client structure properly.
// We will look for VITE_OPENROUTER_KEY in env, or ask user to input it.


export const useIntelligence = create<IntelligenceState>((set, get) => ({
  models: [],
  selectedModel: 'google/gemini-2.0-flash-exp:free', // Default to a free model
  isFetchingModels: false,
  error: null, // Initialize error state

  fetchModels: async () => {
    set({ isFetchingModels: true, error: null }); // Clear previous errors
    try {
      const response = await fetch(`${OPENROUTER_API_URL}/models`);
      const data = await response.json();
      
      // Transform OpenRouter data to our schema
      const availableModels: AIModel[] = data.data.map((m: OpenRouterModel) => ({
        id: m.id,
        name: m.name,
        context_length: m.context_length,
        pricing: m.pricing
      }));

      set({ models: availableModels, isFetchingModels: false });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error fetching models:', err.message);
      set({ error: err.message, isFetchingModels: false });
    }
  },

  selectModel: (modelId: string) => set({ selectedModel: modelId }),

  queryModel: async (prompt: string) => {
      const { selectedModel } = get();
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY; // Standard Env Var
      
      // Mock response if no key (Safe Mode)
      if (!apiKey) {
          return `[SYSTEM]: Simulation Mode Active.\n\nSimulated Response from ${selectedModel}:\n\n"I have analyzed the request: '${prompt}'. As an AI trained by Google DeepMind and OpenRouter contributors, I suggest implementing a recursive feedback loop..."\n\n(To activate Real Intelligence, set VITE_OPENROUTER_API_KEY in .env)`;
      }

      try {
        const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://antigravity.google", 
              "X-Title": "eCy OS"
            },
            body: JSON.stringify({
              "model": selectedModel,
              "messages": [
                {"role": "user", "content": prompt}
              ]
            })
          });
          
          const data = await response.json();
          
          if (data.error) {
              throw new Error(data.error.message || "Unknown API Error");
          }

          return data.choices?.[0]?.message?.content || "[ERROR] Empty response from Neural Cloud.";

      } catch (e) {
          const error = e as Error;
          console.error("OpenRouter Error:", error);
          return `[ERROR]: Neural Link to ${selectedModel} Failed.\nReason: ${error.message}`;
      }
  }
}));
