# Antigravity Orchestra Internal API 🎻

The "Orchestra" is the TypeScript backend running within the VS Code Extension, managing the Agent Logic (`AgentLogic.ts`), Memory (`Hippocampus`), and Bridges (`AgentBridge`).

## 🧠 Brain Process

The Brain communicates via IPC.

### `AgentBridge.ts`
- `ask(prompt: string, context?: string, model?: string): Promise<string>`
  - Blocking call to LLM.
- `askStream(prompt: string, onToken: (t) => void, model?: string): Promise<void>`
  - Streaming call to LLM.

## 💾 Hippocampus (Memory)
- **Vectors**: Uses specialized embedding model (`nomic-embed-text`) via Ollama.
- **Storage**: JSON-based persistent log in `.vscode/antigravity_memory.json`.

## 🤖 Automator Agent
- **Slash Commands**:
  - `/fix`: Analyzing AST and applying patch.
  - `/explain`: Generating architectural summary.
  - `/plan`: Decomposing goal into subtasks.

---
*Internal Engineering Document - Do Not Distribute*
