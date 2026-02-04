import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VisionOverlayProps {
  onUpload: (file: File) => void;
}

export default function VisionOverlay({ onUpload }: VisionOverlayProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
     if (acceptedFiles.length > 0) {
       onUpload(acceptedFiles[0]);
     }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    noClick: true,
    noKeyboard: true
  });

  return (
    <div {...getRootProps()} className="absolute inset-0 z-50 pointer-events-none">
       <input {...getInputProps()} />
       <AnimatePresence>
         {isDragActive && (
           <motion.div
             initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
             animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
             exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
             className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto transition-all"
           >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className="w-[32rem] h-80 rounded-3xl border border-white/10 bg-black/50 flex flex-col items-center justify-center gap-6 p-8 shadow-[0_0_100px_rgba(6,182,212,0.2)]"
             >
                <div className="relative">
                   <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
                   <div className="relative p-6 rounded-full bg-black/50 border border-cyan-500/30 text-cyan-400">
                     <Eye className="w-16 h-16" />
                   </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Visual Analysis Link</h3>
                  <p className="text-gray-400">Release to transmit visual data to the Hive Mind.</p>
                </div>
                
                <div className="flex items-center gap-3 text-xs font-mono text-cyan-300/70 bg-cyan-950/30 px-4 py-2 rounded-full border border-cyan-500/20">
                   <UploadCloud className="w-4 h-4" />
                   <span>VLM-1 ENABLED • SECURE UPLOAD</span>
                </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}
