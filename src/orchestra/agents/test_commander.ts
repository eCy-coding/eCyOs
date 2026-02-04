import { BaseAgent, AgentResponse, LLMProvider } from './base_agent';
import { ActionContext } from '../context_manager';
import { ArtifactManager } from '../artifact_manager';
import { SafeFileSystem } from '../safe_fs';

export class TestCommander extends BaseAgent {
    constructor(artifactManager: ArtifactManager, llm: LLMProvider, safeFs: SafeFileSystem) {
        super('Test Commander', 'Test Lead', artifactManager, llm, safeFs);
    }

    public async execute(command: string, context?: ActionContext): Promise<AgentResponse> {
        this.log(`Initiating Tests for: ${command}`);

        // Mocking a test run
        const testRes = `## Test Execution Log
- **Suite:** E2E / Unit
- **Status:** PASS
- **Duration:** 12ms (Simulated)
        `;

        const artifact = this.createArtifact(
            'Test Report',
            testRes,
            'markdown'
        );

        return {
            success: true,
            message: 'Test Suite Execution Successful.',
            artifacts: [artifact]
        };
    }
}
