
import { contextBridge, ipcRenderer } from 'electron';


// Custom APIs for renderer
const api = {
    python: {
        execute: (action: string, payload: unknown): Promise<any> => ipcRenderer.invoke('PYTHON_EXECUTE', { action, payload })
    },
    vision: {
        browse: (url: string) => ipcRenderer.invoke('orchestra:vision:browse', url),
        act: (action: string, payload: unknown) => ipcRenderer.invoke('orchestra:vision:act', { action, payload })
    },
    diagnostics: {
        status: () => ipcRenderer.invoke('orchestra:diagnostics:status')
    },
    ai: {
        ask: (prompt: string, mode: 'local' | 'cloud' = 'local', options: unknown = {}) => ipcRenderer.invoke('orchestra:ai:ask', { prompt, mode, options }),
        remember: (text: string) => ipcRenderer.invoke('orchestra:ai:remember', { text }),
        recall: (query: string) => ipcRenderer.invoke('orchestra:ai:recall', { query }),
        status: () => ipcRenderer.invoke('orchestra:ai:status')
    },
    orchestra: {
        execute: (command: string) => ipcRenderer.invoke('orchestra:execute', command),
        task: {
            list: () => ipcRenderer.invoke('orchestra:task:list'),
            listOrdered: () => ipcRenderer.invoke('orchestra:task:list:ordered'),
            search: (query: string) => ipcRenderer.invoke('orchestra:task:search', query),
            add: (task: unknown) => ipcRenderer.invoke('orchestra:task:add', task),
            delete: (id: string) => ipcRenderer.invoke('orchestra:task:delete', id),
            dependency: {
                add: (dependentId: string, dependencyId: string) => 
                    ipcRenderer.invoke('orchestra:task:dependency:add', { dependentId, dependencyId })
            }
        },
        council: {
            summon: (topic: string) => ipcRenderer.invoke('orchestra:council:summon', { topic }),
            registerAgent: (name: string, role: string) => ipcRenderer.invoke('orchestra:council:register_agent', { name, role })
        },
        swarm: {
            spawn: (name: string, role: string, systemPrompt: string) => 
                ipcRenderer.invoke('orchestra:swarm:spawn', { name, role, systemPrompt })
        },
        system: {
            clipboard: () => ipcRenderer.invoke('orchestra:system:clipboard'),
            // Admin/Test tools
            killBrain: () => ipcRenderer.invoke('orchestra:admin:kill_brain')
        },
        workflow: {
            execute: (goal: string) => ipcRenderer.invoke('orchestra:workflow:execute', { goal })
        },
        code: {
            index: (rootDir?: string) => ipcRenderer.invoke('orchestra:code:index', { rootDir }),
            search: (query: string) => ipcRenderer.invoke('orchestra:code:search', { query })
        },

        permissions: {
            check: () => ipcRenderer.invoke('orchestra:permissions:check'),
            request: () => ipcRenderer.invoke('orchestra:permissions:request')
        }
    },
    silicon: {
        status: () => ipcRenderer.invoke('orchestra:silicon:status'),
        fibonacci: (n: number) => ipcRenderer.invoke('orchestra:silicon:fibonacci', { n }),
        vectorSum: (data: number[]) => ipcRenderer.invoke('orchestra:silicon:vectorsum', { data }),
        cosineSimilarity: (vec1: number[], vec2: number[]) => ipcRenderer.invoke('orchestra:silicon:cosine', { vec1, vec2 }),
        cleanText: (text: string) => ipcRenderer.invoke('orchestra:silicon:text:clean', { text })
    }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('stage', api);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.stage = api;
}
