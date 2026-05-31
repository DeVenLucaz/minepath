import React, { useState, useEffect } from 'react';
import { gameStore } from '../store/gameStore';
import { audio } from '../audio/engine';

export default function SettingsScreen({ onBack }) {
  const [settings, setSettings] = useState(gameStore.getSettings());

  const toggleBGM = () => {
    const newSettings = { ...settings, bgm: !settings.bgm };
    setSettings(newSettings);
    gameStore.setSettings(newSettings);
    if (newSettings.bgm) {
      audio.startBackground();
    } else {
      audio.stopBackground();
    }
  };

  const toggleSFX = () => {
    const newSettings = { ...settings, sfx: !settings.sfx };
    setSettings(newSettings);
    gameStore.setSettings(newSettings);
    if (newSettings.sfx) {
      audio.safeTap();
    }
  };

  const resetTutorial = () => {
    gameStore.setTutorialComplete(false);
    alert('Tutorial reset! Play to see it again.');
  };

  return (
    <div className="settings-screen">
      <div className="settings-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <div className="settings-title">⚙️ SETTINGS</div>
        <div style={{ width: '60px' }}></div>
      </div>

      <div className="settings-content">
        <div className="settings-group">
          <div className="settings-item">
            <div className="settings-info">
              <div className="settings-label">Background Music</div>
              <div className="settings-desc">Keep the beat going</div>
            </div>
            <button 
              className={`toggle-btn ${settings.bgm ? 'on' : 'off'}`}
              onClick={toggleBGM}
            >
              {settings.bgm ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="settings-item">
            <div className="settings-info">
              <div className="settings-label">Sound Effects</div>
              <div className="settings-desc">Feedback and pops</div>
            </div>
            <button 
              className={`toggle-btn ${settings.sfx ? 'on' : 'off'}`}
              onClick={toggleSFX}
            >
              {settings.sfx ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-item">
            <div className="settings-info">
              <div className="settings-label">Tutorial</div>
              <div className="settings-desc">Replay the First Flight</div>
            </div>
            <button className="btn-secondary" onClick={resetTutorial}>Reset</button>
          </div>
        </div>

        <div className="settings-footer">
          MINEPATH v0.1.0
        </div>
      </div>
    </div>
  );
}
