import { BaseAgent, AgentResponse, LLMProvider } from './base_agent';
import { ActionContext } from '../context_manager';
import { ArtifactManager } from '../artifact_manager';
import { SafeFileSystem } from '../safe_fs';

export class CodeArtisan extends BaseAgent {
    constructor(artifactManager: ArtifactManager, llm: LLMProvider, safeFs: SafeFileSystem) {
        super('Code Artisan', 'Software Engineer', artifactManager, llm, safeFs);
    }

    public async execute(command: string, context?: ActionContext): Promise<AgentResponse> {
        this.log(`Received Coding Task: ${command}`);

        // In a real scenario, this would manipulate files.
        // For now, it generates a "Code Design" artifact.
        
        const designPrompt = `You are a Code Artisan. Implement the following coding task: "${command}".
        Provide the implementation plan and the necessary code blocks.`;
        
        const codeContent = await this.llm.ask(designPrompt, "You are an expert TypeScript developer.");
        
        const artifact = this.createArtifact(
            'Implementation Draft',
            codeContent,
            'code'
        );

        return {
            success: true,
            message: 'Code Artisan has drafted the implementation.',
            artifacts: [artifact]
        };
    }
}
