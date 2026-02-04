import { BaseAgent, AgentResponse, LLMProvider } from './base_agent';
import { ActionContext } from '../context_manager';
import { ArtifactManager } from '../artifact_manager';
import { CodeArtisan } from './code_artisan';
import { QualitySentinel } from './quality_sentinel';
import { TestCommander } from './test_commander';
import { SafeFileSystem } from '../safe_fs';

export class AgentOrchestrator extends BaseAgent {
    private artisan: CodeArtisan;
    private sentinel: QualitySentinel;
    private commander: TestCommander;

    constructor(artifactManager: ArtifactManager, llm: LLMProvider, safeFs: SafeFileSystem) {
        super('Agent Orchestrator', 'Task Manager', artifactManager, llm, safeFs);
        // Initialize Workers with SafeFS
        this.artisan = new CodeArtisan(artifactManager, llm, safeFs);
        this.sentinel = new QualitySentinel(artifactManager, llm, safeFs);
        this.commander = new TestCommander(artifactManager, llm, safeFs);
    }

    public async execute(command: string, context?: ActionContext): Promise<AgentResponse> {
        this.log(`Received Command: ${command}`);

        if (command.includes('OPERATION SWARM') || command.includes('P2')) {
            return this.executeOperationSwarm(command);
        }
        
        // Direct Delegation Routing
        if (command.includes('CODE') || (command.includes('IMPLEMENT') && !command.includes('REVIEW'))) {
            this.log('Delegating to Code Artisan for implementation...');
            const artisanResponse = await this.artisan.execute(command, context);
            
            if (!artisanResponse.success || artisanResponse.artifacts.length === 0) {
                return artisanResponse;
            }

            // Sentinel Review Loop
            const artifactId = artisanResponse.artifacts[0].id;
            this.log(`Requesting Quality Review for Artifact: ${artifactId}`);
            
            const reviewCommand = `REVIEW Artifact:${artifactId} Content:${artisanResponse.artifacts[0].title}`;
            const sentinelResponse = await this.sentinel.execute(reviewCommand, context);

            if (sentinelResponse.success) {
                this.log('Quality Sentinel APPROVED. Returning artifacts.');
                // In a real system, we might "merge" or "apply" the artifact here.
                return {
                    success: true,
                    message: 'Implementation Approved by Sentinel.',
                    artifacts: [...artisanResponse.artifacts, ...sentinelResponse.artifacts]
                };
            } else {
                 return {
                    success: false,
                    message: 'Implementation REJECTED by Sentinel.',
                    artifacts: sentinelResponse.artifacts
                };
            }
        }
        
        if (command.includes('TEST') || command.includes('VERIFY')) {
             return this.commander.execute(command, context);
        }
        if (command.includes('AUDIT') || command.includes('LINT') || command.includes('REVIEW')) {
             return this.sentinel.execute(command, context);
        }

        return {
            success: false,
            message: `Orchestrator received unknown command: ${command}`,
            artifacts: []
        };
    }

    private async executeOperationSwarm(command: string): Promise<AgentResponse> {
        this.log('Initializing OPERATION SWARM...');
        
        const taskName = command.split('--task=')[1] || 'General Improvement';
        
        // Real LLM Generation (Deep Planning)
        this.log(`Asking LLM to decompose task: ${taskName}`);
        const prompt = `You are the Agent Orchestrator. The user wants to perform the task: "${taskName}".
        Break this task down into 3-5 atomic steps that can be handled by a coding agent.
        Format your response as a Markdown list.
        IMPORTANT: After the list, suggest which specialist agent (Code Artisan, Quality Sentinel, Test Commander) should handle each step.`;
        
        const system = "You are a senior technical project manager. specialize in HTN (Hierarchical Task Networks).";
        
        let planContent = await this.llm.ask(prompt, system);

        const planArtifact = this.createArtifact(
            `Swarm Plan: ${taskName}`,
            `# Swarm Plan for ${taskName}\n\n${planContent}\n\n## Delegation Strategy\n- **Implementation:** Delegated to Code Artisan.\n- **Quality:** Delegated to Quality Sentinel.\n- **Verification:** Delegated to Test Commander.`,
            'plan'
        );
        
        // [AUTO-DELEGATION SIMULATION]
        // In a full loop, we would parse the plan and call execute() on workers.
        // For Phase 81 verification, we will just prove routing capability via artifact.

        return {
            success: true,
            message: `Swarm Operation initialized for: ${taskName}. Plan created and delegation ready.`,
            artifacts: [planArtifact]
        };
    }
}
