
import React, { useEffect, useState } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { Mic, MicOff, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceCommandProps {
    onCommand: (text: string) => void;
}

const VoiceCommand: React.FC<VoiceCommandProps> = ({ onCommand }) => {
    const { isListening, transcript, interimTranscript, startListening, stopListening, isSupported } = useVoiceInput();
    const [lastProcessedLength, setLastProcessedLength] = useState(0);

    // Auto-process *final* commands
    useEffect(() => {
        // If transcript grew, we have a new final sentence
        if (transcript.length > lastProcessedLength) {
            const newPart = transcript.slice(lastProcessedLength).trim();
            if (newPart) {
                console.log("Voice Command Detected:", newPart);
                onCommand(newPart);
            }
            setLastProcessedLength(transcript.length);
        }
    }, [transcript, lastProcessedLength, onCommand]);

    if (!isSupported) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-auto">
            {/* Live Transcript Bubble */}
            <AnimatePresence>
                {(isListening && (transcript || interimTranscript)) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="bg-black/80 backdrop-blur-xl border border-cyan-500/30 p-4 rounded-2xl shadow-2xl max-w-xs mb-2"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Activity size={12} className="text-cyan-400 animate-pulse" />
                            <span className="text-[10px] uppercase font-mono text-cyan-500 tracking-widest">Listening...</span>
                        </div>
                        <p className="text-sm font-mono text-white">
                            <span className="opacity-50">{transcript}</span>
                            <span className="text-cyan-300">{interimTranscript}</span>
                            <span className="animate-blink">_</span>
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Mic Toggle Button */}
            <button
                onClick={isListening ? stopListening : startListening}
                className={`
                    relative group flex items-center justify-center w-14 h-14 rounded-full border transition-all duration-300 shadow-xl
                    ${isListening 
                        ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
                        : 'bg-black/60 border-white/10 text-white hover:bg-cyan-500/20 hover:border-cyan-500 hover:text-cyan-400'
                    }
                `}
            >
                {/* Ripple Effect when listening */}
                {isListening && (
                    <>
                        <span className="absolute inset-0 rounded-full border border-red-500/50 animate-ping opacity-75" />
                        <span className="absolute inset-0 rounded-full border border-red-500/30 animate-ping delay-150 opacity-50" />
                    </>
                )}

                {isListening ? <Mic size={24} /> : <MicOff size={24} />}
            </button>
        </div>
    );
};

export default VoiceCommand;
