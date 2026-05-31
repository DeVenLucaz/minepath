import React, { useState } from 'react';
import { gameStore } from '../store/gameStore';

export default function TutorialOverlay({ onComplete }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome, Chicken!",
      text: "Step carefully! The field is full of hidden mines. Your goal is the golden checkpoint.",
      icon: "🐔"
    },
    {
      title: "Tap to Move",
      text: "Tap adjacent tiles to move. Numbers show how many mines are nearby.",
      icon: "👆"
    },
    {
      title: "Peek Carefully",
      text: "Long-press a tile to peek! It's safer but takes time.",
      icon: "👁️"
    },
    {
      title: "Watch the Clock",
      text: "The sun is setting! Reach the checkpoint before time runs out.",
      icon: "⏰"
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
      <div className="tutorial-card">
        <div className="tutorial-icon">{steps[step].icon}</div>
        <div className="tutorial-title">{steps[step].title}</div>
        <div className="tutorial-text">{steps[step].text}</div>
        <button className="btn-primary" onClick={nextStep}>
          {step === steps.length - 1 ? "LET'S GO!" : "NEXT"}
        </button>
        <div className="tutorial-dots">
          {steps.map((_, i) => (
            <div key={i} className={`dot ${i === step ? 'active' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
