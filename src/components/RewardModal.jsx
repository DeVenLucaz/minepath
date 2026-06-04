import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SeedIcon, GiftIcon, GemIcon } from './Icons';

function RewardIcon({ emoji, size = 64 }) {
  if (!emoji) {
    return <GiftIcon size={size} className="text-primary mx-auto" />;
  }
  if (React.isValidElement(emoji)) {
    return emoji;
  }
  if (emoji === '🌾') {
    return <SeedIcon size={size} className="text-gold mx-auto" />;
  }
  if (emoji === '🎁') {
    return <GiftIcon size={size} className="text-primary mx-auto" />;
  }
  if (emoji === '💎') {
    return <GemIcon size={size} className="text-accent-blue mx-auto" />;
  }
  return <span style={{ fontSize: size }}>{emoji}</span>;
}

export default function RewardModal({ isOpen, title, message, rewardEmoji, onConfirm }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop modal-backdrop--visible" style={{ zIndex: 1000 }}>
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 40 }}
            className="modal-card p-6 text-center gap-4"
          >
            <div className="flex justify-center mb-2">
              <RewardIcon emoji={rewardEmoji} size={64} />
            </div>
            <h2 className="text-2xl font-black text-primary uppercase tracking-tight m-0" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
              {title || 'REWARD!'}
            </h2>
            <p className="text-base text-secondary leading-relaxed m-0 font-bold px-4">
              {message}
            </p>
            <button 
              className="mo-btn mo-btn--retry w-full mt-2" 
              onClick={onConfirm}
              style={{ textShadow: 'var(--text-stroke-white)' }}
            >
              AWESOME!
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
