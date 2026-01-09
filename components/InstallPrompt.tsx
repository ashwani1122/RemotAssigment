'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Detect if user is on iOS
    const userAgent = window.navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));
    
    // Detect if the app is already installed/running in standalone mode
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  // Don't show if already installed or if the user dismissed it
  if (isStandalone || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 inset-x-6 z-50"
      >
        <div className="bg-blue-600 p-4 rounded-2xl shadow-2xl border border-blue-400 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Download className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-white font-sans">Install VideoVault</p>
              <p className="text-[11px] text-blue-100 font-sans leading-tight">
                {isIOS 
                  ? 'Tap "Share" then "Add to Home Screen"' 
                  : 'Install for offline recording & full screen'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={18} className="text-blue-200" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}