import React from 'react';
import { motion } from 'framer-motion';

export default function HelpModal({ title, content, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[75vh]"
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pt-8 px-8 pb-4 border-b border-white/5">
          <h2 className="text-2xl font-black text-primary text-center uppercase tracking-tight">
            {title}
          </h2>
        </div>

        {/* Content - Scrollable */}
        <div className="px-8 py-6 space-y-6 overflow-y-auto">
          {content.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-gold opacity-80">
                {item.heading}
              </h3>
              <p className="text-secondary text-[14px] leading-relaxed font-medium">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-8 pt-4">
          <button
            onClick={onClose}
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-primary font-black rounded-2xl border border-white/10 active:scale-[0.97] transition-all uppercase tracking-widest text-sm"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
