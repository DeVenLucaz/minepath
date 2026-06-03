import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RewardModal({ isOpen, title, message, rewardEmoji, onConfirm }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop modal-backdrop--visible" style={{ zIndex: 1000 }}>
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 40 }}
            className="modal-card"
            style={{ padding: '24px', textAlign: 'center', gap: '16px' }}
          >
            <div style={{ fontSize: '64px', marginBottom: '8px' }}>{rewardEmoji || '🎁'}</div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 900, 
              color: '#1a1a1a',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {title || 'REWARD!'}
            </h2>
            <p style={{ 
              fontSize: '16px', 
              color: '#666', 
              lineHeight: 1.5,
              margin: 0
            }}>
              {message}
            </p>
            <button 
              className="mo-btn mo-btn--retry" 
              style={{ width: '100%', margin: '8px 0 0' }}
              onClick={onConfirm}
            >
              AWESOME!
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
