import React from 'react';
import { motion } from 'framer-motion';

export default function HelpModal({ title, content, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/65 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[75vh]"
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pt-8 px-8 pb-2">
          <h2 className="text-2xl font-black text-gray-900 text-center uppercase tracking-tight">
            {title}
          </h2>
        </div>

        {/* Content - Scrollable */}
        <div className="px-8 py-4 space-y-6 overflow-y-auto">
          {content.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <h3 className="text-[13px] font-black uppercase tracking-[0.1em] text-blue-600">
                {item.heading}
              </h3>
              <p className="text-gray-600 text-[15px] leading-relaxed font-semibold">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-8 pt-2">
          <button
            onClick={onClose}
            className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl active:scale-[0.97] transition-transform uppercase tracking-widest text-sm"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
