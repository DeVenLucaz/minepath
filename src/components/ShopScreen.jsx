import React, { useState } from 'react';
import { gameStore } from '../store/gameStore';
import { playerStore } from '../store/playerStore';
import { CHICKEN_SKINS, TILE_STYLES, TRAIL_EFFECTS } from '../data/skins';
import { PETS } from '../data/pets';
import { audio } from '../audio/engine';
import TopBar from './TopBar';
import ChickenSVG from './ChickenSVG';
import PetSVG from './PetSVG';
import HelpModal from './HelpModal';

// ─── TABS ────────────────────────────────────────────────
const TABS = [
  { id: 'skins',  label: 'Skins',  icon: '🐔' },
  { id: 'tiles',  label: 'Tiles',  icon: '🟦' },
  { id: 'trails', label: 'Trails', icon: '✨' },
  { id: 'pets',   label: 'Pets',   icon: '🐤' },
];

const STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 37.3 + 11) % 100}%`,
  top:  `${(i * 53.7 + 7)  % 100}%`,
  size: `${(i % 3) + 2}px`,
  delay: `${(i * 0.27) % 3}s`,
  dur:   `${1.6 + (i % 5) * 0.3}s`,
}));

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
function ActionBtn({ owned, equipped, price, onPress, hasDiscount, currentSeeds }) {
  const displayPrice = hasDiscount ? Math.floor(price * 0.9) : price;
  const canAfford = currentSeeds >= displayPrice;

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

  if (!canAfford) {
    return (
      <button 
        className="sp-btn" 
        style={{ 
          background: 'rgba(255,255,255,0.05)', 
          color: 'rgba(255,255,255,0.3)', 
          cursor: 'not-allowed',
          border: '1px solid rgba(255,255,255,0.1)',
          flexDirection: 'column',
          minHeight: '44px',
          width: '80px'
        }}
        disabled
      >
        <span style={{ fontSize: '9px', fontWeight: 'bold' }}>NEED</span>
        <span style={{ fontSize: '13px', fontWeight: '900' }}>{displayPrice}🌾</span>
      </button>
    );
  }

  return (
    <button className="sp-btn sp-btn--buy" onClick={onPress} style={{ flexDirection: 'column', minHeight: '44px', width: '80px' }}>
      {hasDiscount && (
        <span style={{ fontSize: '9px', textDecoration: 'line-through', opacity: 0.6, marginBottom: '-2px' }}>
          {price}
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        <span className="sp-btn-seed">🌾</span>
        <span>{displayPrice}</span>
      </div>
    </button>
  );
}

const RARITY_COLORS = {
  common: '#BDBDBD',
  rare: '#42A5F5',
  epic: '#AB47BC',
  legendary: '#FFA726'
};

function RarityBadge({ rarity }) {
  if (!rarity) return null;
  const colors = {
    common: 'text-slate-400 border-slate-400/30 bg-slate-400/10',
    rare: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    epic: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    legendary: 'text-gold border-gold/30 bg-gold/10'
  };
  return (
    <div className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border w-fit mb-1 tracking-wider ${colors[rarity] || colors.common}`}>
      {rarity}
    </div>
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
  const [showHelp, setShowHelp]     = useState(false);

  const unlockedSkills = playerStore.getSkills();
  const hasDiscount = unlockedSkills.includes('shop_discount');
  const hasRoyalCrown = unlockedSkills.includes('royal_golden_crown');
  const finalDiscount = hasRoyalCrown ? 0.20 : hasDiscount ? 0.10 : 0;

  const buildings = gameStore.getBuildings();
  const playgroundLvl = buildings.playground || 0;
  const abilityPower = 1 + (playgroundLvl * 0.25);

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
    return Math.floor(originalPrice * (1 - finalDiscount));
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
      <div className="stars-bg">
        {STARS.map(s => (
          <div key={s.id} className="star" style={{
            left: s.left, top: s.top,
            width: s.size, height: s.size,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}/>
        ))}
      </div>

      <TopBar title="SHOP" onBack={onBack} seeds={seeds} />

      <button 
        onClick={() => setShowHelp(true)}
        className="fixed bottom-[80px] right-4 w-8 h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg z-[110] active:scale-90 transition-transform"
        aria-label="Help"
      >
        ?
      </button>

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
          
          let rarity = 'common';
          if (skin.price >= 800) rarity = 'legendary';
          else if (skin.price >= 500) rarity = 'epic';
          else if (skin.price >= 300) rarity = 'rare';

          return (
            <div
              key={skin.id}
              className={`sp-card ${equipped ? 'sp-card--equipped' : ''}`}
            >
              {!owned && <div className="absolute top-2 right-3 text-xs opacity-20">🔒</div>}
              <div className="sp-card-art">
                <ChickenSVG skinId={skin.id} mood="normal" size={72} focus={equipped ? 'right' : null}/>
              </div>
              <div className="sp-card-info">
                <RarityBadge rarity={rarity} />
                <div className="sp-card-name">{skin.name}</div>
                <div className="sp-card-desc">{skin.description}</div>
                {equipped && <div className="sp-equipped-badge"><span>✅</span> Equipped</div>}
              </div>
              <ActionBtn
                owned={owned} equipped={equipped}
                price={skin.price} onPress={() => buySkin(skin)}
                hasDiscount={finalDiscount > 0}
                currentSeeds={seeds}
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
            >
              {!owned && <div className="absolute top-2 right-3 text-xs opacity-20">🔒</div>}
              <TilePreview style={style}/>
              <div className="sp-card-info">
                <div className="sp-card-name">{style.name}</div>
                {equipped && <div className="sp-equipped-badge"><span>✅</span> Equipped</div>}
              </div>
              <ActionBtn
                owned={owned} equipped={equipped}
                price={style.price} onPress={() => buyTile(style)}
                hasDiscount={finalDiscount > 0}
                currentSeeds={seeds}
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
            >
              {!owned && <div className="absolute top-2 right-3 text-xs opacity-20">🔒</div>}
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
                currentSeeds={seeds}
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
            >
              {!owned && <div className="absolute top-2 right-3 text-xs opacity-20">🔒</div>}
              <div className="sp-card-art">
                <PetSVG petId={pet.id} size={70} mood={equipped ? 'happy' : 'normal'}/>
              </div>
              <div className="sp-card-info">
                <RarityBadge rarity={pet.rarity} />
                <div className="sp-card-name">{pet.name}</div>
                <div className="sp-card-desc">{pet.description}</div>
                <div className="sp-bonus-label">
                  ⚡ {pet.bonus === 'seed_bonus' ? `+${Math.round(pet.bonusVal * abilityPower * 100)}% seeds` :
                     pet.bonus === 'time_bonus' ? `+${Math.round(pet.bonusVal * abilityPower)}s time` :
                     pet.bonusLabel}
                </div>
                {equipped && <div className="sp-equipped-badge"><span>✅</span> Equipped</div>}
              </div>
              <ActionBtn
                owned={owned} equipped={equipped}
                price={pet.price} onPress={() => buyPet(pet)}
                hasDiscount={hasDiscount}
                currentSeeds={seeds}
              />
            </div>
          );
        })}

      </div>

      {showHelp && (
        <HelpModal
          title="Shop Guide"
          onClose={() => setShowHelp(false)}
          content={[
            { heading: 'Skins', text: 'Cosmetic chicken skins. Each skin also unlocks unique skills in the Skill Tree.' },
            { heading: 'Tiles', text: 'Changes the visual theme of your game tiles.' },
            { heading: 'Trails', text: 'Adds a trail effect behind your chicken as it moves.' },
            { heading: 'Pets', text: 'Pets follow you and provide passive bonuses during gameplay. Each pet has a unique ability.' },
            { heading: 'Currency', text: 'Everything costs Seeds. Earn seeds by completing levels and hatching eggs.' },
          ]}
        />
      )}
    </div>
  );
}
