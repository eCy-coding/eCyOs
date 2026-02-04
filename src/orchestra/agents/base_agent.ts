import { ActionContext } from '../context_manager';
import { ArtifactManager, Artifact } from '../artifact_manager';
import { SafeFileSystem } from '../safe_fs';

export interface AgentResponse {
    success: boolean;
    message: string;
    artifacts: Artifact[];
    data?: any;
}

export interface LLMProvider {
    ask(prompt: string, system: string): Promise<string>;
}

export abstract class BaseAgent {
    protected name: string;
    protected role: string;
    protected artifactManager: ArtifactManager;
    protected llm: LLMProvider;
    protected safeFs: SafeFileSystem;

    constructor(
        name: string, 
        role: string, 
        artifactManager: ArtifactManager, 
        llm: LLMProvider,
        safeFs: SafeFileSystem
    ) {
        this.name = name;
        this.role = role;
        this.artifactManager = artifactManager;
        this.llm = llm;
        this.safeFs = safeFs;
    }

    public abstract execute(command: string, context?: ActionContext): Promise<AgentResponse>;

    protected createArtifact(title: string, content: string, type: Artifact['type'] = 'markdown'): Artifact {
        const artifact: Artifact = {
            id: `art_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            title,
            content,
            createdAt: Date.now()
        };
        
        // Persist immediately
        const path = this.artifactManager.save(artifact);
        artifact.path = path;
        
        return artifact;
    }

    public log(message: string): void {
        console.log(`[${this.role}: ${this.name}] ${message}`);
    }
}
