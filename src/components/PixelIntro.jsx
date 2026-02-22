import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* =====================================================
   PIXEL INTRO - PixelLab AI Character Sprites
   128x128 high-quality pixel art characters
   Anime-style intro sequence with walking + transformation
   ===================================================== */

const C = {
  dark: '#0e0c0a',
  panel: '#1a1714',
  cream: '#f0e6d3',
  pink: '#e8828a',
  blue: '#6eb5ff',
  yellow: '#f0c860',
  white: '#fdf8f0',
  border: '#5c4a3a',
};

// Sprite paths (relative to public/)
const SPRITES = {
  groomWalk: Array.from({ length: 6 }, (_, i) =>
    `/images/pixel-chars/groom-casual/animations/walking/east/frame_00${i}.png`
  ),
  groomIdle: Array.from({ length: 4 }, (_, i) =>
    `/images/pixel-chars/groom-casual/animations/breathing-idle/south/frame_00${i}.png`
  ),
  groomSouth: '/images/pixel-chars/groom-casual/rotations/south.png',
  brideWalk: Array.from({ length: 6 }, (_, i) =>
    `/images/pixel-chars/bride-casual/animations/walking/east/frame_00${i}.png`
  ),
  brideSouth: '/images/pixel-chars/bride-casual/rotations/south.png',
  groomFormal: Array.from({ length: 4 }, (_, i) =>
    `/images/pixel-chars/groom-formal/animations/breathing-idle/south/frame_00${i}.png`
  ),
  groomFormalSouth: '/images/pixel-chars/groom-formal/rotations/south.png',
  brideFormalSouth: '/images/pixel-chars/bride-formal/rotations/south.png',
};

// Collect all image paths for preloading
const ALL_IMAGES = [
  ...SPRITES.groomWalk,
  ...SPRITES.groomIdle,
  SPRITES.groomSouth,
  ...SPRITES.brideWalk,
  SPRITES.brideSouth,
  ...SPRITES.groomFormal,
  SPRITES.groomFormalSouth,
  SPRITES.brideFormalSouth,
];

/* =====================================================
   AnimatedSprite: cycles through frame images
   ===================================================== */
function AnimatedSprite({ frames, fps = 8, flip = false, style = {}, className = '' }) {
  const [frame, setFrame] = useState(0);
  const frameArray = Array.isArray(frames) ? frames : [frames];

  useEffect(() => {
    if (frameArray.length <= 1) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % frameArray.length);
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [frameArray, fps]);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        transform: flip ? 'scaleX(-1)' : 'none',
        width: 128,
        height: 128,
        ...style,
      }}
    >
      {frameArray.map((src, i) => (
        <div
          key={src}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            visibility: i === frame ? 'visible' : 'hidden',
          }}
        />
      ))}
    </div>
  );
}

/* =====================================================
   SparkleEffect: CSS sparkle/shine burst
   ===================================================== */
function SparkleEffect({ x, y, size = 40, color = C.yellow, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.2, 0.8, 0], rotate: [0, 180] }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        pointerEvents: 'none',
      }}
    >
      {/* 4-pointed star */}
      <svg viewBox="0 0 40 40" width={size} height={size}>
        <path
          d="M20 0 L23 17 L40 20 L23 23 L20 40 L17 23 L0 20 L17 17 Z"
          fill={color}
          opacity={0.9}
        />
      </svg>
    </motion.div>
  );
}

/* =====================================================
   HeartParticles: floating hearts for reveal scene
   ===================================================== */
function HeartParticles({ count = 12 }) {
  const particles = useRef(
    Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      size: 12 + Math.random() * 16,
      duration: 2 + Math.random() * 2,
    }))
  ).current;

  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 50, x: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: -200, x: (Math.random() - 0.5) * 60 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            bottom: '20%',
            fontSize: p.size,
            pointerEvents: 'none',
          }}
        >
          💖
        </motion.div>
      ))}
    </>
  );
}

/* =====================================================
   LoveGauge: heart gauge for battle scene
   ===================================================== */
function LoveGauge({ badge, color, filled = 0 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          fontFamily: "'Press Start 2P'",
          fontSize: 7,
          color: C.cream,
          backgroundColor: color + '44',
          padding: '2px 6px',
          border: `2px solid ${color}`,
          borderRadius: 2,
          letterSpacing: 1,
        }}
      >
        {badge}
      </span>
      <div style={{ display: 'flex', gap: 2 }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{
              scale: i < filled ? [1.4, 1] : 1,
              opacity: i < filled ? 1 : 0.3,
            }}
            transition={{ duration: 0.3 }}
            style={{ fontSize: 14, lineHeight: 1 }}
          >
            {i < filled ? '\u2764\uFE0F' : '\u{1F5A4}'}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   BattleScene: RPG boss battle between groom & bride
   Phase 0: BATTLE START!
   Phase 1: Groom attack (고백 ATTACK!)
   Phase 2: Bride counter (설렘 COUNTER!)
   Phase 3: Combo (사랑 COMBO!)
   Phase 4: LOVE WINS! → onComplete
   ===================================================== */
function BattleScene({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const [groomHearts, setGroomHearts] = useState(0);
  const [brideHearts, setBrideHearts] = useState(0);

  // Phase progression
  useEffect(() => {
    const durations = [500, 700, 700, 500, 600];
    if (phase >= durations.length) return;
    const timer = setTimeout(() => {
      if (phase === 4) {
        onComplete?.();
      } else {
        setPhase((p) => p + 1);
      }
    }, durations[phase]);
    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  // Heart fill effects
  useEffect(() => {
    let t;
    if (phase === 1) {
      t = setTimeout(() => setBrideHearts(1), 350);
    } else if (phase === 2) {
      t = setTimeout(() => setGroomHearts(1), 350);
    } else if (phase === 3) {
      t = setTimeout(() => {
        setGroomHearts(3);
        setBrideHearts(3);
      }, 200);
    }
    return () => clearTimeout(t);
  }, [phase]);

  const actionConfig = {
    0: { text: '\u2694 BATTLE START!', color: C.yellow, size: 14 },
    1: { text: 'SUPER EFFECTIVE!', color: C.pink, size: 11 },
    2: { text: 'CRITICAL HIT!', color: C.blue, size: 11 },
    3: { text: '\u2764 COMBO!', color: C.yellow, size: 13 },
    4: { text: '\u2764 LOVE WINS! \u2764', color: C.yellow, size: 16 },
  };
  const skillConfig = { 1: '\uACE0\uBC31 ATTACK!', 2: '\uC124\uB818 COUNTER!', 4: 'PERFECT MATCH!' };
  const at = actionConfig[phase];
  const skill = skillConfig[phase];

  return (
    <motion.div
      key="battle-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 8,
      }}
    >
      {/* Screen shake wrapper */}
      <motion.div
        animate={phase === 3 ? { x: [-3, 3, -3, 3, -2, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.5, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Love gauges - top */}
        <div
          style={{
            position: 'absolute',
            top: '18%',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}
        >
          <LoveGauge badge="DEV" color={C.blue} filled={groomHearts} />
          <LoveGauge badge="PM" color={C.pink} filled={brideHearts} />
        </div>

        {/* Action text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`action-${phase}`}
            initial={{ opacity: 0, scale: phase === 0 ? 2 : 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              top: '28%',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: at.size,
                color: at.color,
                textShadow: `0 0 20px ${at.color}, 0 0 40px ${at.color}80`,
                letterSpacing: 1,
              }}
            >
              {at.text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Characters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            position: 'relative',
          }}
        >
          {/* Groom */}
          <motion.div
            animate={{
              x: phase === 1 ? [0, 40, 0] : phase === 3 ? [0, 25] : 0,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <AnimatedSprite
              frames={SPRITES.groomIdle}
              fps={4}
              style={{ width: 128, height: 128 }}
            />
          </motion.div>

          {/* Sparkle area between characters */}
          <div style={{ position: 'relative', width: 24, height: 120 }}>
            {phase === 1 && (
              <>
                <SparkleEffect x={20} y={30} size={35} color={C.pink} />
                <SparkleEffect x={10} y={50} size={25} color={C.pink} delay={0.15} />
              </>
            )}
            {phase === 2 && (
              <>
                <SparkleEffect x={4} y={30} size={35} color={C.blue} />
                <SparkleEffect x={14} y={55} size={25} color={C.blue} delay={0.15} />
              </>
            )}
            {phase === 3 && (
              <>
                <SparkleEffect x={12} y={20} size={50} color={C.yellow} />
                <SparkleEffect x={0} y={50} size={35} color={C.pink} delay={0.1} />
                <SparkleEffect x={24} y={40} size={30} color={C.blue} delay={0.2} />
              </>
            )}
          </div>

          {/* Bride */}
          <motion.div
            animate={{
              x: phase === 2 ? [0, -40, 0] : phase === 3 ? [0, -25] : 0,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div
              style={{ backgroundImage: `url(${SPRITES.brideSouth})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', width: 128, height: 128 }}
            />
          </motion.div>
        </div>

        {/* Skill name - below characters */}
        <AnimatePresence mode="wait">
          {skill && (
            <motion.p
              key={`skill-${phase}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                bottom: '28%',
                fontFamily: "'Galmuri11', monospace",
                fontSize: 14,
                color: C.cream,
                textShadow: `0 0 8px rgba(240,230,211,0.5)`,
                textAlign: 'center',
                width: '100%',
              }}
            >
              {skill}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Victory heart particles */}
        {phase === 4 && <HeartParticles count={10} />}
      </motion.div>
    </motion.div>
  );
}

/* =====================================================
   Badge component: DEV / PM label
   ===================================================== */
function Badge({ text, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 9,
        color: C.dark,
        backgroundColor: color,
        padding: '3px 8px',
        borderRadius: 4,
        border: `2px solid ${C.dark}`,
        letterSpacing: 1,
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </motion.div>
  );
}

/* =====================================================
   PixelIntro: main component
   ===================================================== */
export default function PixelIntro({ onComplete }) {
  const [stage, setStage] = useState(-1); // -1 = preloading
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef(null);

  // Preload all images
  useEffect(() => {
    let mounted = true;
    const promises = ALL_IMAGES.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve; // proceed even on error
          img.src = src;
        })
    );
    Promise.all(promises).then(() => {
      if (mounted) {
        setLoaded(true);
        setStage(0);
      }
    });
    return () => { mounted = false; };
  }, []);

  // Stage progression timeline
  useEffect(() => {
    if (stage < 0) return;

    const timings = {
      0: 1000,  // LOADING → groom walk
      1: 1500,  // groom walk → groom pose
      2: 1200,  // groom pose → bride walk
      3: 1500,  // bride walk → bride pose
      4: 1000,  // bride pose → battle
      // 5: BattleScene handles its own timing via onComplete
      6: 700,   // transform → reveal
      7: 1800,  // reveal → press start
      // 8 = press start, waits for tap
    };

    const delay = timings[stage];
    if (delay != null) {
      timerRef.current = setTimeout(() => setStage((s) => s + 1), delay);
    }
    return () => clearTimeout(timerRef.current);
  }, [stage]);

  const handleSkip = useCallback(() => {
    if (stage >= 8) {
      onComplete?.();
    } else if (stage >= 0) {
      // Skip to press start
      clearTimeout(timerRef.current);
      setStage(8);
    }
  }, [stage, onComplete]);

  if (!loaded) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: C.dark,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: C.cream, opacity: 0.6 }}>
          LOADING...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key="pixel-intro"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={handleSkip}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: C.dark,
        overflow: 'hidden',
        cursor: 'pointer',
        touchAction: 'manipulation',
      }}
    >
      {/* Dark gradient ground */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '35%',
          background: `linear-gradient(to top, ${C.panel}, transparent)`,
        }}
      />


      {/* ===== STAGE 0: LOADING ===== */}
      <AnimatePresence>
        {stage === 0 && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
            }}
          >
            <motion.p
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: 14,
                color: C.cream,
                letterSpacing: 3,
              }}
            >
              NOW LOADING...
            </motion.p>
            <div style={{ width: 200, height: 8, border: `2px solid ${C.border}`, borderRadius: 2 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                style={{ height: '100%', backgroundColor: C.yellow, borderRadius: 1 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== STAGE 1: GROOM WALKS IN FROM RIGHT ===== */}
      <AnimatePresence>
        {(stage === 1 || stage === 2) && (
          <motion.div
            key="groom-walk-container"
            initial={{ x: '-100vw' }}
            animate={{ x: 'calc(50vw - 238px)' }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              position: 'absolute',
              bottom: '22%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              zIndex: 5,
            }}
          >
            {stage === 1 ? (
              <AnimatedSprite
                frames={SPRITES.groomWalk}
                fps={8}
                style={{ width: 256, height: 256 }}
              />
            ) : (
              <AnimatedSprite
                frames={SPRITES.groomIdle}
                fps={4}
                style={{ width: 256, height: 256 }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== STAGE 2: GROOM POSE + NAME ===== */}
      <AnimatePresence>
        {stage === 2 && (
          <motion.div
            key="groom-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{
              position: 'absolute',
              bottom: '10%',
              left: 'calc(50% - 150px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              zIndex: 6,
            }}
          >
            <Badge text="DEV" color={C.blue} />
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                fontFamily: "'Galmuri11', monospace",
                fontSize: 16,
                color: C.cream,
                textShadow: `0 0 10px ${C.blue}`,
              }}
            >
              조석삼
            </motion.p>
            {/* Glasses sparkle */}
            <SparkleEffect x={-30} y={-120} size={30} color={C.white} delay={0.4} />
            <SparkleEffect x={-15} y={-125} size={20} color={C.blue} delay={0.6} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== STAGE 3: BRIDE WALKS IN FROM LEFT ===== */}
      <AnimatePresence>
        {(stage === 3 || stage === 4) && (
          <motion.div
            key="bride-walk-container"
            initial={{ x: '100vw' }}
            animate={{ x: 'calc(50vw - 18px)' }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              position: 'absolute',
              bottom: '22%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              zIndex: 5,
            }}
          >
            {stage === 3 ? (
              <AnimatedSprite
                frames={SPRITES.brideWalk}
                fps={8}
                flip={true}
                style={{ width: 256, height: 256 }}
              />
            ) : (
              <div
                style={{ backgroundImage: `url(${SPRITES.brideSouth})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', width: 256, height: 256 }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Groom stays visible during bride's entrance ===== */}
      <AnimatePresence>
        {(stage === 3 || stage === 4) && (
          <motion.div
            key="groom-idle-stay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              bottom: '22%',
              left: 'calc(50% - 238px)',
              zIndex: 4,
            }}
          >
            <AnimatedSprite
              frames={SPRITES.groomIdle}
              fps={4}
              style={{ width: 256, height: 256 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== STAGE 4: BRIDE POSE + NAME ===== */}
      <AnimatePresence>
        {stage === 4 && (
          <motion.div
            key="bride-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{
              position: 'absolute',
              bottom: '10%',
              right: 'calc(50% - 150px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              zIndex: 6,
            }}
          >
            <Badge text="PM" color={C.pink} />
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                fontFamily: "'Galmuri11', monospace",
                fontSize: 16,
                color: C.cream,
                textShadow: `0 0 10px ${C.pink}`,
              }}
            >
              박수인
            </motion.p>
            {/* Fierce eye flash */}
            <SparkleEffect x={20} y={-115} size={25} color={C.pink} delay={0.5} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== STAGE 5: BATTLE SCENE ===== */}
      <AnimatePresence>
        {stage === 5 && (
          <BattleScene onComplete={() => setStage(6)} />
        )}
      </AnimatePresence>

      {/* ===== STAGE 6: TRANSFORMATION FLASH ===== */}
      <AnimatePresence>
        {stage === 6 && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.0, times: [0, 0.1, 0.5, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: C.white,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              animate={{ rotate: 360, scale: [0, 1.5, 0] }}
              transition={{ duration: 1 }}
              style={{ fontSize: 60 }}
            >
              ✨
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== STAGE 7: FORMAL REVEAL ===== */}
      <AnimatePresence>
        {(stage === 7 || stage === 8) && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 7,
            }}
          >
            {/* Characters side by side */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 10,
                marginBottom: 8,
              }}
            >
              {/* Groom formal */}
              <motion.div
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <AnimatedSprite
                  frames={SPRITES.groomFormal}
                  fps={3}
                  style={{ width: 256, height: 256 }}
                />
              </motion.div>

              {/* Heart between them */}
              <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: [0, 1.4, 1], y: [-20, -50, -40] }}
                transition={{ duration: 0.8, delay: 0.5 }}
                style={{
                  fontSize: 44,
                  marginLeft: -20,
                  marginRight: -20,
                  marginBottom: 70,
                  zIndex: 10,
                  filter: 'drop-shadow(0 0 12px rgba(232,130,138,0.7))',
                }}
              >
                💕
              </motion.div>

              {/* Bride formal */}
              <motion.div
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div
                  style={{ backgroundImage: `url(${SPRITES.brideFormalSouth})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', width: 256, height: 256 }}
                />
              </motion.div>
            </div>

            {/* Names */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontFamily: "'Galmuri11', monospace",
                fontSize: 18,
                color: C.cream,
              }}
            >
              <span style={{ textShadow: `0 0 8px ${C.blue}` }}>조석삼</span>
              <span style={{ color: C.pink, fontSize: 14 }}>&</span>
              <span style={{ textShadow: `0 0 8px ${C.pink}` }}>박수인</span>
            </motion.div>

            {/* Date */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: 10,
                color: C.yellow,
                marginTop: 12,
                letterSpacing: 2,
                textShadow: `0 0 10px rgba(240,200,96,0.4)`,
              }}
            >
              2026.05.23 SAT 11:00
            </motion.p>

            {/* Heart particles */}
            <HeartParticles count={10} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== STAGE 8: PRESS START ===== */}
      <AnimatePresence>
        {stage === 8 && (
          <motion.div
            key="press-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              position: 'absolute',
              bottom: '8%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 15,
              textAlign: 'center',
            }}
          >
            <motion.p
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: 11,
                color: C.cream,
                letterSpacing: 2,
                textShadow: `0 0 6px rgba(240,230,211,0.3)`,
              }}
            >
              TAP TO START
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip hint (early stages) */}
      {stage >= 0 && stage < 8 && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            right: 16,
            fontFamily: "'Galmuri11', monospace",
            fontSize: 10,
            color: 'rgba(240,230,211,0.25)',
            zIndex: 15,
          }}
        >
          TAP TO SKIP
        </div>
      )}
    </motion.div>
  );
}
