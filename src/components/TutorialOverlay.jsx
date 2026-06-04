import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameStore } from '../store/gameStore';
import ChickenSVG from './ChickenSVG';
import { PlayIcon, RevealIcon, ClockIcon } from './Icons';

export default function TutorialOverlay({ onComplete }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome, Chicken!",
      text: "Step carefully! The field is full of hidden mines. Your goal is the golden checkpoint.",
      icon: <ChickenSVG skinId="classic" size={72} />
    },
    {
      title: "Tap to Move",
      text: "Tap adjacent tiles to move. Numbers show how many mines are nearby.",
      icon: <PlayIcon size={64} className="text-gold mx-auto" />
    },
    {
      title: "Peek Carefully",
      text: "Long-press a tile to peek! It's safer but takes time.",
      icon: <RevealIcon size={64} className="text-gold mx-auto" />
    },
    {
      title: "Watch the Clock",
      text: "The sun is setting! Reach the checkpoint before time runs out.",
      icon: <ClockIcon size={64} className="text-gold mx-auto" />
    }
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      gameStore.setTutorialComplete(true);
      onComplete();
    }
  };

  return (
    <div className="tutorial-overlay">
      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="tutorial-card"
        >
          <div className="tutorial-icon flex items-center justify-center" style={{ minHeight: '80px' }}>{steps[step].icon}</div>
          <div className="tutorial-title">{steps[step].title}</div>
          <div className="tutorial-text">{steps[step].text}</div>
          
          <button className="mo-btn mo-btn--retry w-full mt-4" onClick={nextStep}>
            {step === steps.length - 1 ? "LET'S GO!" : "NEXT"}
          </button>
          
          <div className="tutorial-dots mt-6">
            {steps.map((_, i) => (
              <div key={i} className={`dot ${i === step ? 'active' : ''}`} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
