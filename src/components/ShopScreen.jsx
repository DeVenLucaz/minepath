import React, { useState } from 'react';
import { gameStore } from '../store/gameStore';
import { playerStore } from '../store/playerStore';
import { CHICKEN_SKINS, TILE_STYLES, TRAIL_EFFECTS } from '../data/skins';
import { PETS } from '../data/pets';
import { audio } from '../audio/engine';
import TopBar from './TopBar';
import ChickenSVG from './ChickenSVG';
import PetSVG from './PetSVG';

// ─── TAB CONFIG ──────────────────────────────────────────
const TABS = [
  { id: 'skins',  label: 'Skins',  icon: '🐔' },
  { id: 'tiles',  label: 'Tiles',  icon: '🟦' },
  { id: 'trails', label: 'Trails', icon: '✨' },
  { id: 'pets',   label: 'Pets',   icon: '🐤' },
];

// ─── TILE PREVIEW ────────────────────────────────────────
function TilePreview({ style }) {
  return (
    <div className="sp-tile-preview">
      <div className="sp-tp-tile" style={{ background: style.hiddenColor, borderColor: style.borderColor }}>?</div>
      <div className="sp-tp-tile" style={{ background: style.safeColor,   borderColor: style.borderColor }}>✓</div>
      <div className="sp-tp-tile" style={{ background: style.mineColor,   borderColor: style.borderColor }}>💣</div>
    </div>
  );
}

// ─── TRAIL VISUAL PREVIEW ────────────────────────────────
function TrailPreview({ trail }) {
  if (trail.id === 'none') {
    return <div className="sp-trail-preview sp-trail-none">✗</div>;
  }
  
  const isFlower = trail.id === 'flower';
  const isMusic  = trail.id === 'music';
  const isSparkle = trail.id === 'sparkle';
  const isBubble = trail.id === 'bubble';

  return (
    <div className="sp-trail-preview">
      <div className="sp-trail-dots">
        {[0,1,2,3,4].map(i => {
          const color = trail.particleColors[i % trail.particleColors.length];
          let content = null;
          let style = {
            background: color,
            opacity: 1 - i * 0.15,
            width: `${16 - i * 2}px`,
            height: `${16 - i * 2}px`,
            animationDelay: `${i * 0.12}s`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          };
          
          if (isFlower) {
            content = ['🌸', '🌼', '🌻'][i % 3];
            style.background = 'none';
            style.fontSize = `${16 - i * 2}px`;
          } else if (isMusic) {
            content = ['🎵', '🎶', '♪'][i % 3];
            style.background = 'none';
            style.color = color;
            style.fontSize = `${16 - i * 2}px`;
          } else if (isSparkle) {
            content = '✨';
            style.background = 'none';
            style.fontSize = `${16 - i * 2}px`;
          } else if (isBubble) {
            style.background = 'rgba(255,255,255,0.2)';
            style.border = `1.5px solid ${color}`;
            style.boxShadow = `inset -1px -1px 2px rgba(255,255,255,0.4)`;
          } else if (trail.id === 'rainbow') {
            style.boxShadow = `0 0 6px ${color}`;
          }

          return (
            <div key={i} className="sp-trail-dot" style={style}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BUY / EQUIP BUTTON ──────────────────────────────────
function ActionBtn({ owned, equipped, price, onPress, hasDiscount }) {
  const displayPrice = hasDiscount ? Math.floor(price * 0.9) : price;
  if (equipped) {
    return (
      <button className="sp-btn sp-btn--equipped" onClick={onPress}>
        <span>✓</span>
      </button>
    );
  }
  if (owned) {
    return (
      <button className="sp-btn sp-btn--equip" onClick={onPress}>
        Equip
      </button>
    );
  }
  return (
    <button className="sp-btn sp-btn--buy" onClick={onPress}>
      <span className="sp-btn-seed">🌾</span>
      <span>{displayPrice}</span>
    </button>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────
export default function ShopScreen({ onBack }) {
  const [tab, setTab]               = useState('skins');
  const [seeds, setSeeds]           = useState(gameStore.getSeeds());
  const [unlockedSkins, setUS]      = useState(gameStore.getUnlockedSkins());
  const [unlockedTiles, setUT]      = useState(gameStore.getUnlockedTiles());
  const [unlockedTrails, setUTr]    = useState(gameStore.getUnlockedTrails());
  const [unlockedPets, setUP]       = useState(gameStore.getUnlockedPets());
  const [equippedSkin, setES]       = useState(gameStore.getEquippedSkin());
  const [equippedTile, setETile]    = useState(gameStore.getEquippedTile());
  const [equippedTrail, setETrail]  = useState(gameStore.getEquippedTrail());
  const [equippedPet, setEPet]      = useState(gameStore.getEquippedPet());
  const [toast, setToast]           = useState('');

  const unlockedSkills = playerStore.getSkills();
  const hasDiscount = unlockedSkills.includes('shop_discount');

  const refresh = () => {
    setSeeds(gameStore.getSeeds());
    setUS(gameStore.getUnlockedSkins());
    setUT(gameStore.getUnlockedTiles());
    setUTr(gameStore.getUnlockedTrails());
    setUP(gameStore.getUnlockedPets());
    setES(gameStore.getEquippedSkin());
    setETile(gameStore.getEquippedTile());
    setETrail(gameStore.getEquippedTrail());
    setEPet(gameStore.getEquippedPet());
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const getPrice = (originalPrice) => {
    return hasDiscount ? Math.floor(originalPrice * 0.9) : originalPrice;
  };

  const buySkin = (skin) => {
    if (unlockedSkins.includes(skin.id)) {
      gameStore.setEquippedSkin(skin.id); setES(skin.id);
      showToast(`Equipped ${skin.name}!`);
    } else {
      const price = getPrice(skin.price);
      if (gameStore.spendSeeds(price)) {
        gameStore.unlockSkin(skin.id); gameStore.setEquippedSkin(skin.id);
        refresh(); audio.purchase(); showToast(`Unlocked ${skin.name}! 🎉`);
      } else showToast('Not enough seeds! 🌾');
    }
  };

  const buyTile = (style) => {
    if (unlockedTiles.includes(style.id)) {
      gameStore.setEquippedTile(style.id); setETile(style.id);
      showToast(`Equipped ${style.name}!`);
    } else {
      const price = getPrice(style.price);
      if (gameStore.spendSeeds(price)) {
        gameStore.unlockTile(style.id); gameStore.setEquippedTile(style.id);
        refresh(); audio.purchase(); showToast(`Unlocked ${style.name}! 🎉`);
      } else showToast('Not enough seeds! 🌾');
    }
  };

  const buyTrail = (trail) => {
    if (unlockedTrails.includes(trail.id)) {
      gameStore.setEquippedTrail(trail.id); setETrail(trail.id);
      showToast(`Equipped ${trail.name}!`);
    } else {
      const price = getPrice(trail.price);
      if (gameStore.spendSeeds(price)) {
        gameStore.unlockTrail(trail.id); gameStore.setEquippedTrail(trail.id);
        refresh(); audio.purchase(); showToast(`Unlocked ${trail.name}! 🎉`);
      } else showToast('Not enough seeds! 🌾');
    }
  };

  const buyPet = (pet) => {
    if (unlockedPets.includes(pet.id)) {
      const unequip = equippedPet === pet.id;
      const next = unequip ? null : pet.id;
      gameStore.setEquippedPet(next); setEPet(next);
      showToast(unequip ? 'Pet unequipped!' : `Equipped ${pet.name}!`);
    } else {
      const price = getPrice(pet.price);
      if (gameStore.spendSeeds(price)) {
        gameStore.unlockPet(pet.id); gameStore.setEquippedPet(pet.id);
        refresh(); audio.purchase(); showToast(`Unlocked ${pet.name}! 🎉`);
      } else showToast('Not enough seeds! 🌾');
    }
  };

  return (
    <div className="shop-screen">
      <TopBar title="SHOP" onBack={onBack} />

      {/* Toast */}
      {toast && <div className="sp-toast">{toast}</div>}

      {/* Tab bar */}
      <div className="sp-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`sp-tab ${tab === t.id ? 'sp-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="sp-tab-icon">{t.icon}</span>
            <span className="sp-tab-label">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className="sp-list">

        {/* ── SKINS ── */}
        {tab === 'skins' && CHICKEN_SKINS.map(skin => {
          const owned    = unlockedSkins.includes(skin.id);
          const equipped = equippedSkin === skin.id;
          const isNinja  = skin.id === 'ninja';
          return (
            <div
              key={skin.id}
              className={`sp-card ${equipped ? 'sp-card--equipped' : ''}`}
              style={{
                background: equipped
                  ? `linear-gradient(135deg, ${skin.cardColor}, ${skin.cardColor}dd)`
                  : owned ? `${skin.cardColor}aa` : 'rgba(255,255,255,0.07)',
                borderColor: equipped ? skin.cardBorder : owned ? `${skin.cardBorder}66` : 'rgba(255,255,255,0.1)',
              }}
            >
              {/* Chicken SVG preview */}
              <div className="sp-card-art">
                <ChickenSVG skinId={skin.id} mood="normal" size={72}/>
              </div>
              <div className="sp-card-info">
                <div className="sp-card-name" style={{ color: isNinja ? '#fff' : '#1a1a1a' }}>
                  {skin.name}
                </div>
                <div className="sp-card-desc" style={{ color: isNinja ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                  {skin.description}
                </div>
                {equipped && (
                  <div className="sp-equipped-badge">
                    <span>✅</span> Equipped
                  </div>
                )}
              </div>
              <ActionBtn
                owned={owned} equipped={equipped}
                price={skin.price} onPress={() => buySkin(skin)}
                hasDiscount={hasDiscount}
              />
            </div>
          );
        })}

        {/* ── TILES ── */}
        {tab === 'tiles' && TILE_STYLES.map(style => {
          const owned    = unlockedTiles.includes(style.id);
          const equipped = equippedTile === style.id;
          return (
            <div
              key={style.id}
              className={`sp-card ${equipped ? 'sp-card--equipped' : ''}`}
              style={{
                background: equipped ? 'rgba(255,215,0,0.15)' : owned ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)',
                borderColor: equipped ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.1)',
              }}
            >
              <TilePreview style={style}/>
              <div className="sp-card-info">
                <div className="sp-card-name">{style.name}</div>
                {equipped && <div className="sp-equipped-badge"><span>✅</span> Equipped</div>}
              </div>
              <ActionBtn
                owned={owned} equipped={equipped}
                price={style.price} onPress={() => buyTile(style)}
                hasDiscount={hasDiscount}
              />
            </div>
          );
        })}

        {/* ── TRAILS ── */}
        {tab === 'trails' && TRAIL_EFFECTS.map(trail => {
          const owned    = unlockedTrails.includes(trail.id);
          const equipped = equippedTrail === trail.id;
          return (
            <div
              key={trail.id}
              className={`sp-card ${equipped ? 'sp-card--equipped' : ''}`}
              style={{
                background: equipped
                  ? `${trail.cardAccent}22`
                  : owned ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)',
                borderColor: equipped ? `${trail.cardAccent}88` : 'rgba(255,255,255,0.1)',
              }}
            >
              <TrailPreview trail={trail}/>
              <div className="sp-card-info">
                <div className="sp-card-name">{trail.name}</div>
                <div className="sp-card-desc">{trail.description}</div>
                {equipped && <div className="sp-equipped-badge"><span>✅</span> Equipped</div>}
              </div>
              <ActionBtn
                owned={owned} equipped={equipped}
                price={trail.price} onPress={() => buyTrail(trail)}
                hasDiscount={hasDiscount}
              />
            </div>
          );
        })}

        {/* ── PETS ── */}
        {tab === 'pets' && PETS.map(pet => {
          const owned    = unlockedPets.includes(pet.id);
          const equipped = equippedPet === pet.id;
          return (
            <div
              key={pet.id}
              className={`sp-card ${equipped ? 'sp-card--equipped' : ''}`}
              style={{
                background: equipped
                  ? `${pet.cardAccent}22`
                  : owned ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)',
                borderColor: equipped ? `${pet.cardAccent}88` : 'rgba(255,255,255,0.1)',
              }}
            >
              <div className="sp-card-art">
                <PetSVG petId={pet.id} size={70}/>
              </div>
              <div className="sp-card-info">
                <div className="sp-card-name">{pet.name}</div>
                <div className="sp-card-desc">{pet.description}</div>
                <div className="sp-bonus-label">⚡ {pet.bonusLabel}</div>
                {equipped && <div className="sp-equipped-badge"><span>✅</span> Equipped</div>}
              </div>
              <ActionBtn
                owned={owned} equipped={equipped}
                price={pet.price} onPress={() => buyPet(pet)}
                hasDiscount={hasDiscount}
              />
            </div>
          );
        })}

      </div>
    </div>
  );
}
