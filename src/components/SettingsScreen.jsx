import React, { useState, useMemo } from 'react';
import { gameStore } from '../store/gameStore';
import { audio } from '../audio/engine';
import TopBar from './TopBar';

// Math question for parental gate — regenerated each mount
function makeQuestion() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const ops = [
    { sym: '+', ans: a + b },
    { sym: '−', ans: a - b + (a < b ? 10 : 0), a: a < b ? a + 10 : a },
    { sym: '×', ans: (a % 5 + 1) * (b % 4 + 1) },
  ];
  const op = ops[Math.floor(Math.random() * 2)]; // only + and −
  return { expr: `${op.a || a} ${op.sym} ${b} = ?`, ans: String(op.ans) };
}

// Toggle component matching the mockup style
function SettingToggle({ value, onChange }) {
  return (
    <button
      className={`st-toggle ${value ? 'st-toggle--on' : 'st-toggle--off'}`}
      onClick={onChange}
      onTouchStart={e => { e.preventDefault(); onChange(); }}
    >
      <span className="st-toggle-knob"/>
      <span className="st-toggle-label">{value ? 'ON' : 'OFF'}</span>
    </button>
  );
}

// Row card component
function SettingRow({ icon, label, value, onChange }) {
  return (
    <div className="st-row">
      <span className="st-row-icon">{icon}</span>
      <span className="st-row-label">{label}</span>
      <SettingToggle value={value} onChange={onChange}/>
    </div>
  );
}

const STARS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 51.3 + 5) % 100}%`,
  top:  `${(i * 63.7 + 9) % 100}%`,
  size: `${(i % 3) + 2}px`,
  delay: `${(i * 0.33) % 3}s`,
  dur:   `${1.8 + (i % 4) * 0.3}s`,
}));

export default function SettingsScreen({ onBack }) {
  const [settings, setSettings] = useState(gameStore.getSettings());
  const [gateInput, setGateInput]   = useState('');
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [gateError, setGateError]   = useState(false);
  const [resetMsg, setResetMsg]     = useState('');
  const question = useMemo(() => makeQuestion(), []);

  const update = (key, val) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    gameStore.setSettings(next);
  };

  const toggleBGM = () => {
    const next = !settings.bgm;
    update('bgm', next);
    if (next) audio.startBackground(); else audio.stopBackground();
  };

  const toggleSFX = () => {
    const next = !settings.sfx;
    update('sfx', next);
    if (next) audio.safeTap();
  };

  const toggleVibration = () => update('vibration', !settings.vibration);
  const toggleNotifs    = () => update('notifications', !settings.notifications);

  const tryUnlockGate = () => {
    if (gateInput.trim() === question.ans) {
      setGateUnlocked(true);
      setGateError(false);
    } else {
      setGateError(true);
      setGateInput('');
      setTimeout(() => setGateError(false), 1200);
    }
  };

  const resetProgress = () => {
    if (!gateUnlocked) return;
    if (window.confirm('Reset ALL progress? Seeds, skins, achievements will be lost!')) {
      localStorage.clear();
      setResetMsg('Progress reset! Restart the app.');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const resetTutorial = () => {
    gameStore.setTutorialComplete(false);
    setResetMsg('Tutorial reset!');
    setTimeout(() => setResetMsg(''), 2000);
  };

  return (
    <div className="settings-screen">

      {/* Stars */}
      <div className="stars-bg" aria-hidden="true">
        {STARS.map(s => (
          <div key={s.id} className="star" style={{
            left: s.left, top: s.top,
            width: s.size, height: s.size,
            animationDelay: s.delay, animationDuration: s.dur,
          }}/>
        ))}
      </div>

      <TopBar title="SETTINGS" onBack={onBack} showSeeds={false}/>

      <div className="st-content">

        {/* Toast */}
        {resetMsg && <div className="st-toast">{resetMsg}</div>}

        {/* ── SOUND SETTINGS ── */}
        <div className="st-section">
          <SettingRow icon="🎵" label="MUSIC"         value={settings.bgm}           onChange={toggleBGM}/>
          <SettingRow icon="📢" label="SOUND EFFECTS" value={settings.sfx}           onChange={toggleSFX}/>
          <SettingRow icon="🔔" label="NOTIFICATIONS" value={!!settings.notifications} onChange={toggleNotifs}/>
          <SettingRow icon="📳" label="VIBRATION"     value={!!settings.vibration}   onChange={toggleVibration}/>
        </div>

        {/* ── MISC ── */}
        <div className="st-section">
          <div className="st-row st-row--btn">
            <span className="st-row-icon">🎓</span>
            <span className="st-row-label">TUTORIAL</span>
            <button className="st-action-btn" onClick={resetTutorial}
              onTouchStart={e => { e.preventDefault(); resetTutorial(); }}>
              Reset
            </button>
          </div>
        </div>

        {/* ── PARENTAL GATE ── */}
        <div className={`st-gate ${gateUnlocked ? 'st-gate--open' : ''} ${gateError ? 'st-gate--error' : ''}`}>
          <div className="st-gate-title">
            <span>🔐</span>
            <span>PARENTAL GATE</span>
          </div>

          {!gateUnlocked ? (
            <div className="st-gate-body">
              <div className="st-gate-question">To access, solve: <strong>{question.expr}</strong></div>
              <div className="st-gate-row">
                <input
                  className="st-gate-input"
                  type="number"
                  inputMode="numeric"
                  value={gateInput}
                  onChange={e => setGateInput(e.target.value)}
                  placeholder="?"
                  maxLength={3}
                />
                <button className="st-gate-btn" onClick={tryUnlockGate}
                  onTouchStart={e => { e.preventDefault(); tryUnlockGate(); }}>
                  UNLOCK
                </button>
              </div>
              {gateError && <div className="st-gate-err">Wrong answer! Try again.</div>}
            </div>
          ) : (
            <div className="st-gate-body">
              <div className="st-gate-unlocked">✅ Gate unlocked!</div>
              <button className="st-danger-btn" onClick={resetProgress}>
                🗑️ Reset All Progress
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="st-footer">
          MINEPATH <span style={{ color: '#FFD700' }}>KIDS</span> SETTINGS &nbsp;·&nbsp; v3.0
        </div>

      </div>
    </div>
  );
}
