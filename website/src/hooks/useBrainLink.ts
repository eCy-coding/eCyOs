import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useEffect } from 'react';
import { useCortexStore } from '../stores';

const SOCKET_URL = 'ws://localhost:8000/ws/brain';

interface BrainMessage {
  type: string;
  content?: string;
  agent?: string;
  cpu?: number;
  ram?: number;
  memory?: number;
  line?: string;
  agents?: number;
}

export const useBrainLink = () => {
    // Actions from Zustand CortexStore
    const setConnected = useCortexStore(state => state.setConnected);
    const addThought = useCortexStore(state => state.addThought);
    const setCode = useCortexStore(state => state.setCode);
    const updateTelemetry = useCortexStore(state => state.updateTelemetry);
    const addTerminalLine = useCortexStore(state => state.addTerminalLine);

    // Selectors for return
    const thoughtStream = useCortexStore(state => state.thoughtStream);
    const codeStream = useCortexStore(state => state.codeStream);
    const telemetry = useCortexStore(state => state.telemetry);
    const terminalLines = useCortexStore(state => state.terminalLines);

    const { lastJsonMessage, readyState, sendMessage } = useWebSocket<BrainMessage>(SOCKET_URL, {
        shouldReconnect: () => true,
        reconnectAttempts: 10, // Reduced from 100 to fail faster
        reconnectInterval: 3000,
        onOpen: () => {
            console.log('[BRAIN] Synapse Connected.');
            setConnected(true);
        },
        onClose: () => {
            console.warn('[BRAIN] Synapse Disconnected. Running in offline mode.');
            setConnected(false);
        },
        onError: (event) => {
            console.warn('[BRAIN] WebSocket error (backend may not be running):', event);
            // Don't crash - just continue in offline mode
        }
    });

    useEffect(() => {
        if (lastJsonMessage) {
            const msg = lastJsonMessage;
            const type = msg.type?.toUpperCase(); // Normalize to uppercase matches backend
            
            // 1. Thought Stream (Backend sends "THOUGHT")
            if (type === 'THOUGHT' || type === 'LOG') {
                const text = msg.agent ? `[${msg.agent}] ${msg.content}` : msg.content;
                if (text) addThought(text);
            }
            
            // 2. Code Streaming
            if (type === 'CODE') {
                if (msg.content) setCode(msg.content);
            }

            // 3. Telemetry (Backend sends "TELEMETRY")
            if (type === 'TELEMETRY') {
                updateTelemetry({ 
                    cpu: msg.cpu || 0, 
                    ram: msg.ram ? `${msg.ram}%` : msg.memory ? `${msg.memory}%` : "0%",
                    agents: msg.agents || 0
                });
            }

            // 4. Terminal Output
            if (type === 'TERMINAL') {
                if (msg.line) addTerminalLine(msg.line); 
            }
        }
    }, [lastJsonMessage, addThought, setCode, updateTelemetry, addTerminalLine]);

    return { 
        isConnected: readyState === ReadyState.OPEN,
        thoughtStream: thoughtStream.map(t => t.content), // Convert to string[] for backward compat
        codeStream, 
        telemetry, 
        terminalLines,
        sendMessage 
    };
};
