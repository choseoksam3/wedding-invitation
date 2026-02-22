import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { weddingConfig } from '../config/wedding';
import { useCountdown } from '../hooks/useCountdown';
import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
  limit,
} from 'firebase/firestore';


/* =====================================================
   PIXEL THEME CONSTANTS & UTILITIES
   ===================================================== */

const pad = (n) => String(n).padStart(2, '0');

const weddingDate = new Date(weddingConfig.date);
const dateYear = weddingDate.getFullYear();
const dateMonth = pad(weddingDate.getMonth() + 1);
const dateDay = pad(weddingDate.getDate());
const dayNamesKo = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const dateDowKo = dayNamesKo[weddingDate.getDay()];
const dateHour = weddingDate.getHours();
const dateMin = pad(weddingDate.getMinutes());
const dateAmPm = dateHour >= 12 ? '오후' : '오전';
const dateHour12 = dateHour > 12 ? dateHour - 12 : dateHour;

/** Color palette */
const C = {
  bg1: '#f0e6d3',
  bg2: '#e8dcc8',
  border: '#5c4a3a',
  text: '#3a2e24',
  textLight: '#6b5c4d',
  pink: '#e8828a',
  mint: '#7ecba1',
  yellow: '#f0c860',
  blue: '#6eb5ff',
  white: '#fdf8f0',
};

const CHARACTER_API_URL = import.meta.env.DEV ? 'http://52.79.132.179:3001' : '';

/** Kakao Map component using JS SDK */
function loadKakaoSDK() {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps?.load) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=1555e10139222227a86f7ed76f78e13e&autoload=false';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('SDK load failed'));
    document.head.appendChild(script);
  });
}

function KakaoMapView({ lat, lng, name }) {
  const mapRef = useRef(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadKakaoSDK()
      .then(() => {
        if (cancelled) return;
        window.kakao.maps.load(() => {
          if (cancelled || !mapRef.current) return;
          setSdkLoaded(true);
          const position = new window.kakao.maps.LatLng(lat, lng);
          const map = new window.kakao.maps.Map(mapRef.current, {
            center: position,
            level: 3,
          });
          const marker = new window.kakao.maps.Marker({ map, position });
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;white-space:nowrap;">${name}</div>`,
          });
          infowindow.open(map, marker);
          map.setDraggable(false);
          map.setZoomable(false);
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => { cancelled = true; };
  }, [lat, lng, name]);

  if (failed) {
    return (
      <a
        href={`https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', height: '200px', background: '#e8dcc8',
          flexDirection: 'column', gap: '8px', textDecoration: 'none',
        }}
      >
        <span style={{ fontSize: '32px' }}>🗺️</span>
        <span className="pixel-font" style={{ color: C.text, fontSize: '12px' }}>
          카카오맵에서 보기
        </span>
      </a>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '250px' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {!sdkLoaded && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', background: C.bg2,
        }}>
          <span className="pixel-font" style={{ color: C.textLight, fontSize: '11px' }}>
            지도 로딩중...
          </span>
        </div>
      )}
    </div>
  );
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
};

/** Build mini calendar for wedding month */
function buildCalendar() {
  const year = weddingDate.getFullYear();
  const month = weddingDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let week = new Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}
const calendarWeeks = buildCalendar();

/** Generate ICS file for calendar save */
function downloadICS() {
  const start = new Date(weddingConfig.date);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d) => {
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear().toString() + p(d.getMonth() + 1) + p(d.getDate()) + 'T' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
  };
  const now = new Date();
  const { groom, bride, location } = weddingConfig;
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding Invitation//KO', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`, `DTSTAMP:${fmt(now)}`,
    `UID:wedding-${fmt(now)}@wedding-invitation`,
    `SUMMARY:${groom.name} & ${bride.name} 결혼식`,
    `DESCRIPTION:${groom.name} & ${bride.name}의 결혼식\\n장소: ${location.name} ${location.hall}\\n주소: ${location.address}`,
    `LOCATION:${location.name} ${location.hall}, ${location.address}`,
    'STATUS:CONFIRMED', 'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', 'DESCRIPTION:Reminder', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${groom.name}_${bride.name}_결혼식.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* =====================================================
   ANIMATIONS
   ===================================================== */

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const viewportConfig = { once: true, margin: '-30px' };


/* =====================================================
   GLOBAL PIXEL STYLES (injected via <style>)
   ===================================================== */

const pixelStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Galmuri11&display=swap');

  .pixel-layout {
    font-family: 'Galmuri11', 'Press Start 2P', monospace;
    image-rendering: pixelated;
    -webkit-font-smoothing: none;
    -moz-osx-font-smoothing: unset;
  }

  .pixel-font-en {
    font-family: 'Press Start 2P', monospace;
  }

  .pixel-font {
    font-family: 'Galmuri11', monospace;
  }

  .pixel-border {
    border: 3px solid ${C.border};
    box-shadow:
      3px 3px 0 ${C.border},
      -1px -1px 0 ${C.border},
      3px -1px 0 ${C.border},
      -1px 3px 0 ${C.border};
  }

  .pixel-border-thin {
    border: 2px solid ${C.border};
    box-shadow:
      2px 2px 0 ${C.border};
  }

  .pixel-btn {
    font-family: 'Galmuri11', monospace;
    border: 3px solid ${C.border};
    box-shadow: 3px 3px 0 ${C.border};
    background: ${C.bg1};
    color: ${C.text};
    cursor: pointer;
    transition: all 0.1s;
    padding: 8px 16px;
    font-size: 13px;
  }

  .pixel-btn:active {
    box-shadow: 1px 1px 0 ${C.border};
    transform: translate(2px, 2px);
  }

  .pixel-btn:hover {
    background: ${C.yellow};
  }

  .pixel-dialog {
    background: ${C.white};
    border: 4px solid ${C.border};
    box-shadow:
      4px 4px 0 ${C.border},
      inset 0 0 0 2px ${C.bg2};
    border-radius: 4px;
    padding: 20px;
    position: relative;
  }

  @keyframes pixel-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .pixel-blink {
    animation: pixel-blink 1s step-start infinite;
  }

  @keyframes pixel-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  .pixel-float {
    animation: pixel-float 2s ease-in-out infinite;
  }

  @keyframes pixel-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  .pixel-bounce {
    animation: pixel-bounce 1.2s ease-in-out infinite;
  }

  @keyframes typing-cursor {
    0%, 100% { border-right-color: ${C.text}; }
    50% { border-right-color: transparent; }
  }

  .typing-cursor {
    border-right: 3px solid ${C.text};
    animation: typing-cursor 0.8s step-end infinite;
    padding-right: 2px;
  }

  .pixel-input {
    font-family: 'Galmuri11', monospace;
    background: ${C.white};
    border: 2px solid ${C.border};
    box-shadow: inset 2px 2px 0 rgba(92,74,58,0.15);
    color: ${C.text};
    padding: 8px 12px;
    font-size: 13px;
    outline: none;
    width: 100%;
  }

  .pixel-input:focus {
    box-shadow: inset 2px 2px 0 rgba(92,74,58,0.15), 0 0 0 2px ${C.yellow};
  }

  .pixel-input::placeholder {
    color: ${C.textLight};
    opacity: 0.6;
  }

  .pixel-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 0;
  }

  .pixel-divider::before,
  .pixel-divider::after {
    content: '';
    display: block;
    width: 40px;
    height: 3px;
    background: ${C.border};
  }

  .hp-bar-container {
    width: 100%;
    height: 20px;
    border: 3px solid ${C.border};
    background: ${C.bg2};
    position: relative;
    box-shadow: 2px 2px 0 ${C.border};
  }

  .hp-bar-fill {
    height: 100%;
    background: ${C.mint};
    transition: width 1s ease;
    position: relative;
  }

  .hp-bar-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: rgba(255,255,255,0.3);
  }
`;


/* =====================================================
   PIXEL ART COMPONENTS (CSS-based)
   ===================================================== */

/** Pixel heart */
function PixelHeart({ size = 16, color = C.pink, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 7" style={{ imageRendering: 'pixelated', ...style }}>
      <rect x="1" y="0" width="1" height="1" fill={color} />
      <rect x="2" y="0" width="1" height="1" fill={color} />
      <rect x="4" y="0" width="1" height="1" fill={color} />
      <rect x="5" y="0" width="1" height="1" fill={color} />
      <rect x="0" y="1" width="1" height="1" fill={color} />
      <rect x="1" y="1" width="1" height="1" fill={color} />
      <rect x="2" y="1" width="1" height="1" fill={color} />
      <rect x="3" y="1" width="1" height="1" fill={color} />
      <rect x="4" y="1" width="1" height="1" fill={color} />
      <rect x="5" y="1" width="1" height="1" fill={color} />
      <rect x="6" y="1" width="1" height="1" fill={color} />
      <rect x="0" y="2" width="1" height="1" fill={color} />
      <rect x="1" y="2" width="1" height="1" fill={color} />
      <rect x="2" y="2" width="1" height="1" fill={color} />
      <rect x="3" y="2" width="1" height="1" fill={color} />
      <rect x="4" y="2" width="1" height="1" fill={color} />
      <rect x="5" y="2" width="1" height="1" fill={color} />
      <rect x="6" y="2" width="1" height="1" fill={color} />
      <rect x="1" y="3" width="1" height="1" fill={color} />
      <rect x="2" y="3" width="1" height="1" fill={color} />
      <rect x="3" y="3" width="1" height="1" fill={color} />
      <rect x="4" y="3" width="1" height="1" fill={color} />
      <rect x="5" y="3" width="1" height="1" fill={color} />
      <rect x="2" y="4" width="1" height="1" fill={color} />
      <rect x="3" y="4" width="1" height="1" fill={color} />
      <rect x="4" y="4" width="1" height="1" fill={color} />
      <rect x="3" y="5" width="1" height="1" fill={color} />
    </svg>
  );
}

/** Pixel star decoration */
function PixelStar({ size = 12, color = C.yellow }) {
  return (
    <svg width={size} height={size} viewBox="0 0 5 5" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="0" width="1" height="1" fill={color} />
      <rect x="0" y="2" width="1" height="1" fill={color} />
      <rect x="1" y="1" width="1" height="1" fill={color} />
      <rect x="2" y="2" width="1" height="1" fill={color} />
      <rect x="3" y="1" width="1" height="1" fill={color} />
      <rect x="4" y="2" width="1" height="1" fill={color} />
      <rect x="1" y="3" width="1" height="1" fill={color} />
      <rect x="3" y="3" width="1" height="1" fill={color} />
      <rect x="2" y="4" width="1" height="1" fill={color} />
    </svg>
  );
}

/** Pixel character - Developer groom (with laptop) */
function PixelDeveloper() {
  const s = 6; // pixel size
  const pixels = [
    // Hair (dark brown)
    { x: 2, y: 0, c: '#4a3728' }, { x: 3, y: 0, c: '#4a3728' }, { x: 4, y: 0, c: '#4a3728' },
    { x: 1, y: 1, c: '#4a3728' }, { x: 2, y: 1, c: '#4a3728' }, { x: 3, y: 1, c: '#4a3728' }, { x: 4, y: 1, c: '#4a3728' }, { x: 5, y: 1, c: '#4a3728' },
    // Face
    { x: 2, y: 2, c: '#f5d0a9' }, { x: 3, y: 2, c: '#f5d0a9' }, { x: 4, y: 2, c: '#f5d0a9' },
    { x: 1, y: 3, c: '#f5d0a9' }, { x: 2, y: 3, c: '#3a2e24' }, { x: 3, y: 3, c: '#f5d0a9' }, { x: 4, y: 3, c: '#3a2e24' }, { x: 5, y: 3, c: '#f5d0a9' },
    { x: 2, y: 4, c: '#f5d0a9' }, { x: 3, y: 4, c: '#e8828a' }, { x: 4, y: 4, c: '#f5d0a9' },
    // Shirt (blue - developer)
    { x: 1, y: 5, c: '#6eb5ff' }, { x: 2, y: 5, c: '#6eb5ff' }, { x: 3, y: 5, c: '#6eb5ff' }, { x: 4, y: 5, c: '#6eb5ff' }, { x: 5, y: 5, c: '#6eb5ff' },
    { x: 0, y: 6, c: '#f5d0a9' }, { x: 1, y: 6, c: '#6eb5ff' }, { x: 2, y: 6, c: '#6eb5ff' }, { x: 3, y: 6, c: '#6eb5ff' }, { x: 4, y: 6, c: '#6eb5ff' }, { x: 5, y: 6, c: '#6eb5ff' }, { x: 6, y: 6, c: '#f5d0a9' },
    // Laptop
    { x: 0, y: 7, c: '#888' }, { x: 1, y: 7, c: '#aaa' }, { x: 2, y: 7, c: '#7ecba1' }, { x: 3, y: 7, c: '#aaa' },
    { x: 0, y: 8, c: '#666' }, { x: 1, y: 8, c: '#888' }, { x: 2, y: 8, c: '#888' }, { x: 3, y: 8, c: '#888' },
    // Pants
    { x: 2, y: 8, c: '#4a5568' }, { x: 3, y: 8, c: '#4a5568' }, { x: 4, y: 8, c: '#4a5568' },
    { x: 2, y: 9, c: '#4a5568' }, { x: 4, y: 9, c: '#4a5568' },
    // Shoes
    { x: 1, y: 10, c: '#3a2e24' }, { x: 2, y: 10, c: '#3a2e24' }, { x: 4, y: 10, c: '#3a2e24' }, { x: 5, y: 10, c: '#3a2e24' },
  ];

  return (
    <div style={{ position: 'relative', width: 7 * s, height: 11 * s }}>
      {pixels.map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: p.x * s, top: p.y * s, width: s, height: s, backgroundColor: p.c }} />
      ))}
    </div>
  );
}

/** Pixel character - Planner bride (with clipboard) */
function PixelPlanner() {
  const s = 6; // pixel size
  const pixels = [
    // Hair (dark brown, longer)
    { x: 2, y: 0, c: '#5c3a1e' }, { x: 3, y: 0, c: '#5c3a1e' }, { x: 4, y: 0, c: '#5c3a1e' },
    { x: 1, y: 1, c: '#5c3a1e' }, { x: 2, y: 1, c: '#5c3a1e' }, { x: 3, y: 1, c: '#5c3a1e' }, { x: 4, y: 1, c: '#5c3a1e' }, { x: 5, y: 1, c: '#5c3a1e' },
    { x: 1, y: 2, c: '#5c3a1e' }, { x: 5, y: 2, c: '#5c3a1e' },
    // Face
    { x: 2, y: 2, c: '#f5d0a9' }, { x: 3, y: 2, c: '#f5d0a9' }, { x: 4, y: 2, c: '#f5d0a9' },
    { x: 1, y: 3, c: '#5c3a1e' }, { x: 2, y: 3, c: '#3a2e24' }, { x: 3, y: 3, c: '#f5d0a9' }, { x: 4, y: 3, c: '#3a2e24' }, { x: 5, y: 3, c: '#5c3a1e' },
    { x: 2, y: 4, c: '#f5d0a9' }, { x: 3, y: 4, c: '#e8828a' }, { x: 4, y: 4, c: '#f5d0a9' },
    // Blouse (pink - planner)
    { x: 1, y: 5, c: '#e8828a' }, { x: 2, y: 5, c: '#e8828a' }, { x: 3, y: 5, c: '#e8828a' }, { x: 4, y: 5, c: '#e8828a' }, { x: 5, y: 5, c: '#e8828a' },
    { x: 0, y: 6, c: '#f5d0a9' }, { x: 1, y: 6, c: '#e8828a' }, { x: 2, y: 6, c: '#e8828a' }, { x: 3, y: 6, c: '#e8828a' }, { x: 4, y: 6, c: '#e8828a' }, { x: 5, y: 6, c: '#e8828a' }, { x: 6, y: 6, c: '#f5d0a9' },
    // Clipboard in right hand
    { x: 5, y: 7, c: '#c8a878' }, { x: 6, y: 7, c: '#c8a878' },
    { x: 5, y: 8, c: '#fdf8f0' }, { x: 6, y: 8, c: '#c8a878' },
    { x: 5, y: 9, c: '#fdf8f0' }, { x: 6, y: 9, c: '#c8a878' },
    // Skirt
    { x: 1, y: 7, c: '#f0c860' }, { x: 2, y: 7, c: '#f0c860' }, { x: 3, y: 7, c: '#f0c860' }, { x: 4, y: 7, c: '#f0c860' },
    { x: 1, y: 8, c: '#f0c860' }, { x: 2, y: 8, c: '#f0c860' }, { x: 3, y: 8, c: '#f0c860' }, { x: 4, y: 8, c: '#f0c860' },
    // Legs
    { x: 2, y: 9, c: '#f5d0a9' }, { x: 4, y: 9, c: '#f5d0a9' },
    // Shoes
    { x: 1, y: 10, c: '#e8828a' }, { x: 2, y: 10, c: '#e8828a' }, { x: 4, y: 10, c: '#e8828a' }, { x: 5, y: 10, c: '#e8828a' },
  ];

  return (
    <div style={{ position: 'relative', width: 7 * s, height: 11 * s }}>
      {pixels.map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: p.x * s, top: p.y * s, width: s, height: s, backgroundColor: p.c }} />
      ))}
    </div>
  );
}


/* =====================================================
   SECTION DIVIDER
   ===================================================== */

function PixelDivider() {
  return (
    <div className="pixel-divider" style={{ background: C.bg1 }}>
      <PixelHeart size={12} />
    </div>
  );
}


/* =============================================================
   SECTION 1 - COVER (Game Title Screen)
   ============================================================= */

function CoverSection() {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${C.bg2} 0%, ${C.bg1} 50%, ${C.bg2} 100%)` }}
    >
      {/* Floating pixel hearts decoration */}
      <div className="absolute top-8 left-6 pixel-float" style={{ animationDelay: '0s' }}>
        <PixelHeart size={14} color={C.pink} />
      </div>
      <div className="absolute top-16 right-10 pixel-float" style={{ animationDelay: '0.5s' }}>
        <PixelHeart size={10} color={C.pink} />
      </div>
      <div className="absolute top-24 left-1/4 pixel-float" style={{ animationDelay: '1s' }}>
        <PixelStar size={10} color={C.yellow} />
      </div>
      <div className="absolute top-12 right-1/4 pixel-float" style={{ animationDelay: '1.5s' }}>
        <PixelStar size={8} color={C.yellow} />
      </div>
      <div className="absolute top-32 right-8 pixel-float" style={{ animationDelay: '0.7s' }}>
        <PixelHeart size={12} color={C.pink} />
      </div>

      <motion.div
        className="text-center px-6"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Title label */}
        <motion.p
          variants={fadeIn}
          className="pixel-font-en text-xs mb-8"
          style={{ color: C.textLight, letterSpacing: '0.15em', fontSize: '9px' }}
        >
          - WEDDING INVITATION -
        </motion.p>

        {/* Pixel Characters */}
        <motion.div
          variants={fadeUp}
          className="flex items-end justify-center gap-4 mb-8"
        >
          <div className="pixel-float" style={{ animationDelay: '0.2s' }}>
            <PixelDeveloper />
          </div>
          <div className="pixel-bounce mb-4">
            <PixelHeart size={24} color={C.pink} />
          </div>
          <div className="pixel-float" style={{ animationDelay: '0.4s' }}>
            <PixelPlanner />
          </div>
        </motion.div>

        {/* Character labels */}
        <motion.div variants={fadeIn} className="flex justify-center gap-12 mb-6">
          <div className="text-center">
            <span className="pixel-font-en" style={{ fontSize: '7px', color: C.blue, letterSpacing: '0.1em' }}>DEV</span>
          </div>
          <div className="text-center">
            <span className="pixel-font-en" style={{ fontSize: '7px', color: C.pink, letterSpacing: '0.1em' }}>PM</span>
          </div>
        </motion.div>

        {/* Names */}
        <motion.h1
          variants={fadeUp}
          className="pixel-font mb-4"
          style={{ color: C.text, fontSize: '24px', letterSpacing: '0.1em' }}
        >
          {weddingConfig.groom.name}
          <span style={{ color: C.pink, margin: '0 8px' }}>&hearts;</span>
          {weddingConfig.bride.name}
        </motion.h1>

        {/* Date */}
        <motion.div
          variants={fadeIn}
          className="pixel-border-thin inline-block px-4 py-2 mb-6"
          style={{ background: C.white }}
        >
          <p className="pixel-font" style={{ color: C.text, fontSize: '12px' }}>
            {dateYear}. {dateMonth}. {dateDay}. {dateDowKo}
          </p>
          <p className="pixel-font" style={{ color: C.textLight, fontSize: '11px', marginTop: '2px' }}>
            {dateAmPm} {dateHour12}:{dateMin} | {weddingConfig.location.name}
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12"
        >
          <p className="pixel-font pixel-blink" style={{ color: C.textLight, fontSize: '11px' }}>
            ▼ SCROLL TO START ▼
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}


/* =============================================================
   SECTION 2 - GREETING (RPG Dialog Box)
   ============================================================= */

const DIALOG_MESSAGES = [
  { speaker: 'groom', name: '조석삼', badge: 'DEV', color: C.blue,
    text: '서로 다른 길을 걸어온 두 사람이' },
  { speaker: 'bride', name: '박수인', badge: 'PM', color: C.pink,
    text: '같은 곳을 바라보며 함께 걸어가려 합니다.' },
  { speaker: 'groom', name: '조석삼', badge: 'DEV', color: C.blue,
    text: '살아가면서 소중한 것들을' },
  { speaker: 'bride', name: '박수인', badge: 'PM', color: C.pink,
    text: '함께 나누며 살겠습니다.' },
  { speaker: 'both', name: '석삼 & 수인', badge: '♥', color: C.yellow,
    text: '저희의 새로운 시작을\n축복해 주시면 감사하겠습니다.' },
];

function GreetingSection() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const sectionRef = useRef(null);
  const typingRef = useRef(null);

  const currentMsg = DIALOG_MESSAGES[messageIndex];
  const isLastMessage = messageIndex >= DIALOG_MESSAGES.length - 1;
  const showFamily = isLastMessage && isTypingDone;

  // Start typing when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  // Typing effect per message
  useEffect(() => {
    if (!hasStarted) return;
    setDisplayedText('');
    setIsTypingDone(false);

    const text = currentMsg.text;
    let i = 0;
    typingRef.current = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        setIsTypingDone(true);
        clearInterval(typingRef.current);
      }
    }, 40);

    return () => clearInterval(typingRef.current);
  }, [hasStarted, messageIndex, currentMsg.text]);

  const handleTap = () => {
    if (!hasStarted) return;
    if (!isTypingDone) {
      // Skip typing - show full text immediately
      clearInterval(typingRef.current);
      setDisplayedText(currentMsg.text);
      setIsTypingDone(true);
    } else if (!isLastMessage) {
      setMessageIndex((i) => i + 1);
    }
  };

  const isBride = currentMsg.speaker === 'bride';
  const isBoth = currentMsg.speaker === 'both';

  return (
    <section ref={sectionRef} className="py-16 px-5" style={{ background: C.bg2 }}>
      <motion.div
        className="max-w-md mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        {/* Section title */}
        <motion.div variants={fadeIn} className="text-center mb-6">
          <span className="pixel-font-en" style={{ fontSize: '8px', color: C.textLight, letterSpacing: '0.2em' }}>
            CHAPTER 1
          </span>
          <h2 className="pixel-font mt-2" style={{ color: C.text, fontSize: '16px' }}>
            💬 GREETING
          </h2>
        </motion.div>

        <motion.div variants={fadeUp}>
          {/* Speaker badge + name */}
          <AnimatePresence mode="wait">
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.25 }}
              className="mb-2 flex items-center gap-2"
              style={{ justifyContent: isBride ? 'flex-end' : 'flex-start' }}
            >
              {isBoth ? (
                <span style={{ fontSize: 14, lineHeight: 1 }}>💕</span>
              ) : currentMsg.speaker === 'groom' ? (
                <div style={{ width: 20, height: 20, overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ transform: 'scale(0.3)', transformOrigin: 'top left' }}>
                    <PixelDeveloper />
                  </div>
                </div>
              ) : (
                <div style={{ width: 20, height: 20, overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ transform: 'scale(0.3)', transformOrigin: 'top left' }}>
                    <PixelPlanner />
                  </div>
                </div>
              )}
              <span
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 7,
                  color: C.white,
                  backgroundColor: currentMsg.color,
                  padding: '2px 6px',
                  border: `2px solid ${C.border}`,
                  borderRadius: 2,
                }}
              >
                {currentMsg.badge}
              </span>
              <span className="pixel-font" style={{ fontSize: 12, color: C.text }}>
                {currentMsg.name}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Dialog box - tappable */}
          <div
            onClick={handleTap}
            className="pixel-dialog"
            style={{
              borderColor: currentMsg.color,
              boxShadow: `4px 4px 0 ${currentMsg.color}, inset 0 0 0 2px ${C.bg2}`,
              cursor: 'pointer',
              minHeight: 90,
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
          >
            {/* Dialog content with typing effect */}
            <div className="pt-1">
              <p
                className="pixel-font leading-relaxed whitespace-pre-wrap"
                style={{ color: C.text, fontSize: '13px', lineHeight: '2' }}
              >
                {displayedText}
                {!isTypingDone && <span className="typing-cursor">&nbsp;</span>}
              </p>
            </div>

            {/* Next indicator */}
            {isTypingDone && !isLastMessage && (
              <div className="text-right mt-2">
                <span className="pixel-blink pixel-font" style={{ color: C.textLight, fontSize: '12px' }}>▼</span>
              </div>
            )}
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-3">
            {DIALOG_MESSAGES.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: i <= messageIndex ? currentMsg.color : C.border,
                  opacity: i <= messageIndex ? 1 : 0.3,
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Parents info - shows after last dialog completes */}
        <AnimatePresence>
          {showFamily && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="pixel-dialog mt-6"
            >
              <div
                className="absolute -top-4 left-4 px-3 py-1"
                style={{ background: C.border, color: C.white }}
              >
                <span className="pixel-font" style={{ fontSize: '10px' }}>👪 FAMILY</span>
              </div>

              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="pixel-font" style={{ color: C.blue, fontSize: '10px' }}>▶</span>
                  <span className="pixel-font" style={{ color: C.textLight, fontSize: '12px' }}>
                    {weddingConfig.groom.father} &middot; {weddingConfig.groom.mother}
                    <span style={{ color: C.textLight }}> 의 아들 </span>
                    <span style={{ color: C.text, fontWeight: 'bold' }}>{weddingConfig.groom.name}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="pixel-font" style={{ color: C.pink, fontSize: '10px' }}>▶</span>
                  <span className="pixel-font" style={{ color: C.textLight, fontSize: '12px' }}>
                    {weddingConfig.bride.father} &middot; {weddingConfig.bride.mother}
                    <span style={{ color: C.textLight }}> 의 딸 </span>
                    <span style={{ color: C.text, fontWeight: 'bold' }}>{weddingConfig.bride.name}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}


/* =============================================================
   SECTION 3 - COUNTDOWN (Game Quest / HP Bar)
   ============================================================= */

function CountdownSection() {
  const { days, hours, minutes, seconds, passed } = useCountdown(weddingConfig.date);

  // Calculate progress percentage (from 100 days out)
  const totalDays = 100;
  const elapsed = totalDays - Math.min(days, totalDays);
  const progressPercent = Math.max(0, Math.min(100, (elapsed / totalDays) * 100));

  return (
    <section className="py-16 px-5" style={{ background: C.bg1 }}>
      <motion.div
        className="max-w-md mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        {/* Quest title */}
        <motion.div variants={fadeIn} className="text-center mb-6">
          <span className="pixel-font-en" style={{ fontSize: '8px', color: C.textLight, letterSpacing: '0.2em' }}>
            QUEST LOG
          </span>
        </motion.div>

        <motion.div variants={fadeUp} className="pixel-dialog">
          <div
            className="absolute -top-4 left-4 px-3 py-1"
            style={{ background: C.yellow, color: C.text }}
          >
            <span className="pixel-font" style={{ fontSize: '10px' }}>⚔️ QUEST: 결혼식까지</span>
          </div>

          {/* D-Day counter */}
          <div className="text-center pt-4 mb-6">
            <p className="pixel-font-en" style={{ color: C.pink, fontSize: '36px' }}>
              {passed ? 'CLEAR!' : `D-${days}`}
            </p>
            <p className="pixel-font mt-1" style={{ color: C.textLight, fontSize: '11px' }}>
              {passed ? '🎉 클리어! 결혼했습니다 🎉' : '목표까지 남은 시간'}
            </p>
          </div>

          {/* HP Bar style progress */}
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="pixel-font" style={{ color: C.text, fontSize: '10px' }}>PROGRESS</span>
              <span className="pixel-font" style={{ color: C.mint, fontSize: '10px' }}>{Math.round(progressPercent)}%</span>
            </div>
            <div className="hp-bar-container">
              <div className="hp-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Stat boxes */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { v: days, l: 'DAYS', icon: '📅' },
              { v: hours, l: 'HRS', icon: '⏰' },
              { v: minutes, l: 'MIN', icon: '⏱' },
              { v: seconds, l: 'SEC', icon: '⚡' },
            ].map((u) => (
              <div
                key={u.l}
                className="text-center pixel-border-thin p-2"
                style={{ background: C.white }}
              >
                <span className="pixel-font block" style={{ fontSize: '10px' }}>{u.icon}</span>
                <span className="pixel-font-en block mt-1" style={{ color: C.text, fontSize: '18px' }}>
                  {pad(u.v)}
                </span>
                <span className="pixel-font-en block mt-1" style={{ color: C.textLight, fontSize: '6px', letterSpacing: '0.1em' }}>
                  {u.l}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mini Calendar */}
        <motion.div variants={fadeUp} className="pixel-dialog mt-6">
          <div
            className="absolute -top-4 left-4 px-3 py-1"
            style={{ background: C.border, color: C.white }}
          >
            <span className="pixel-font" style={{ fontSize: '10px' }}>📅 CALENDAR</span>
          </div>

          <div className="pt-2">
            <p className="pixel-font text-center mb-3" style={{ color: C.text, fontSize: '13px' }}>
              {dateYear}년 {parseInt(dateMonth)}월
            </p>

            <table className="w-full text-center" style={{ borderCollapse: 'separate', borderSpacing: '2px' }}>
              <thead>
                <tr>
                  {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                    <th
                      key={i}
                      className="pixel-font py-1"
                      style={{ color: i === 0 ? C.pink : i === 6 ? C.blue : C.textLight, fontSize: '11px' }}
                    >{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calendarWeeks.map((week, wi) => (
                  <tr key={wi}>
                    {week.map((day, di) => {
                      const isWeddingDay = day === weddingDate.getDate();
                      return (
                        <td key={di} className="pixel-font py-1" style={{ fontSize: '12px' }}>
                          {isWeddingDay ? (
                            <span
                              className="inline-flex items-center justify-center"
                              style={{
                                width: 28, height: 28,
                                background: C.pink, color: C.white,
                                border: `2px solid ${C.border}`,
                                boxShadow: `2px 2px 0 ${C.border}`,
                              }}
                            >
                              {day}
                            </span>
                          ) : (
                            <span style={{ color: day ? (di === 0 ? C.pink : di === 6 ? C.blue : C.text) : 'transparent' }}>
                              {day || '.'}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="pixel-font text-center mt-3" style={{ color: C.textLight, fontSize: '11px' }}>
              {dateDowKo} {dateAmPm} {dateHour12}:{dateMin}
            </p>
          </div>
        </motion.div>

        {/* Calendar save button */}
        <motion.div variants={fadeUp} className="flex justify-center mt-5">
          <button
            onClick={downloadICS}
            className="pixel-btn flex items-center gap-2"
          >
            <span>💾</span>
            <span className="pixel-font" style={{ fontSize: '12px' }}>캘린더에 저장</span>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}


/* =============================================================
   SECTION 4 - GALLERY (Pixel Frame Photos)
   ============================================================= */

function GallerySection() {
  const images = weddingConfig.galleryImages;
  const [selectedIdx, setSelectedIdx] = useState(null);

  return (
    <section className="py-16 px-5" style={{ background: C.bg2 }}>
      <motion.div
        className="max-w-md mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        <motion.div variants={fadeIn} className="text-center mb-6">
          <span className="pixel-font-en" style={{ fontSize: '8px', color: C.textLight, letterSpacing: '0.2em' }}>
            CHAPTER 2
          </span>
          <h2 className="pixel-font mt-2" style={{ color: C.text, fontSize: '16px' }}>
            🎨 GALLERY
          </h2>
        </motion.div>

        {/* 2-column grid with pixel frames */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
          {images.map((src, i) => (
            <motion.button
              key={i}
              className="pixel-border relative overflow-hidden"
              style={{ background: C.white, padding: '4px' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedIdx(i)}
            >
              <img
                src={src}
                alt={`gallery ${i + 1}`}
                className="w-full aspect-square object-cover"
                style={{ imageRendering: 'auto' }}
                loading="lazy"
              />
              {/* Frame corner decorations */}
              <div className="absolute top-1 left-1 w-2 h-2" style={{ borderTop: `2px solid ${C.yellow}`, borderLeft: `2px solid ${C.yellow}` }} />
              <div className="absolute top-1 right-1 w-2 h-2" style={{ borderTop: `2px solid ${C.yellow}`, borderRight: `2px solid ${C.yellow}` }} />
              <div className="absolute bottom-1 left-1 w-2 h-2" style={{ borderBottom: `2px solid ${C.yellow}`, borderLeft: `2px solid ${C.yellow}` }} />
              <div className="absolute bottom-1 right-1 w-2 h-2" style={{ borderBottom: `2px solid ${C.yellow}`, borderRight: `2px solid ${C.yellow}` }} />
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(58,46,36,0.92)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIdx(null)}
          >
            <button
              className="absolute top-4 right-4 pixel-font-en z-10"
              style={{ color: C.white, fontSize: '16px' }}
              onClick={() => setSelectedIdx(null)}
            >
              [X]
            </button>

            <div className="absolute top-4 left-4 z-10">
              <span className="pixel-font" style={{ color: C.bg2, fontSize: '11px' }}>
                {selectedIdx + 1} / {images.length}
              </span>
            </div>

            <motion.div
              className="pixel-border p-1 mx-4"
              style={{ background: C.white, maxWidth: '90vw' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[selectedIdx]}
                alt={`gallery ${selectedIdx + 1}`}
                className="max-h-[75vh] object-contain"
                style={{ imageRendering: 'auto' }}
              />
            </motion.div>

            {/* Prev / Next */}
            <div
              className="absolute inset-y-0 left-0 w-1/3 z-5 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIdx((prev) => (prev - 1 + images.length) % images.length);
              }}
            />
            <div
              className="absolute inset-y-0 right-0 w-1/3 z-5 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIdx((prev) => (prev + 1) % images.length);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}


/* =============================================================
   SECTION 5 - LOCATION (World Map)
   ============================================================= */

function LocationSection() {
  const { location } = weddingConfig;

  return (
    <section className="py-16 px-5" style={{ background: C.bg1 }}>
      <motion.div
        className="max-w-md mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        <motion.div variants={fadeIn} className="text-center mb-6">
          <span className="pixel-font-en" style={{ fontSize: '8px', color: C.textLight, letterSpacing: '0.2em' }}>
            CHAPTER 3
          </span>
          <h2 className="pixel-font mt-2" style={{ color: C.text, fontSize: '16px' }}>
            📍 WORLD MAP
          </h2>
        </motion.div>

        {/* Kakao Map */}
        <motion.div variants={fadeUp} className="pixel-border overflow-hidden mb-5">
          <KakaoMapView lat={location.lat} lng={location.lng} name={location.name} />
        </motion.div>

        {/* Location info - terminal style */}
        <motion.div variants={fadeUp} className="pixel-dialog mb-5">
          <div
            className="absolute -top-4 left-4 px-3 py-1"
            style={{ background: C.border, color: C.white }}
          >
            <span className="pixel-font" style={{ fontSize: '10px' }}>💻 LOCATION INFO</span>
          </div>

          <div className="pt-2 space-y-2">
            <p className="pixel-font" style={{ color: C.mint, fontSize: '12px' }}>
              {'>'} location: <span style={{ color: C.text }}>{location.name}</span>
            </p>
            <p className="pixel-font" style={{ color: C.mint, fontSize: '12px' }}>
              {'>'} hall: <span style={{ color: C.text }}>{location.hall}</span>
            </p>
            <p className="pixel-font" style={{ color: C.mint, fontSize: '12px' }}>
              {'>'} address: <span style={{ color: C.text }}>{location.address}</span>
            </p>
            <p className="pixel-font" style={{ color: C.mint, fontSize: '12px' }}>
              {'>'} tel: <span style={{ color: C.text }}>{location.tel}</span>
            </p>
          </div>
        </motion.div>

        {/* Navigation button - game menu style */}
        <motion.div variants={fadeUp} className="flex justify-center">
          <a
            href={`https://map.kakao.com/link/to/${encodeURIComponent(location.name)},${location.lat},${location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-btn text-center block"
            style={{ fontSize: '12px', padding: '12px 24px' }}
          >
            📎 카카오맵으로 길찾기
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}


/* =============================================================
   SECTION 6 - TRANSPORTATION (Item Menu)
   ============================================================= */

function TransportationSection() {
  const { transportation } = weddingConfig;

  const items = [
    { icon: '\u{1F687}', label: '\uC9C0\uD558\uCCA0', content: transportation.subway, rarity: C.blue },
    { icon: '\u{1F68C}', label: '\uBC84\uC2A4', content: transportation.bus, rarity: C.mint },
    { icon: '\u{1F17F}\uFE0F', label: '\uC8FC\uCC28', content: transportation.parking, rarity: C.yellow },
  ];

  return (
    <section className="py-16 px-5" style={{ background: C.bg2 }}>
      <motion.div
        className="max-w-md mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        <motion.div variants={fadeIn} className="text-center mb-6">
          <span className="pixel-font-en" style={{ fontSize: '8px', color: C.textLight, letterSpacing: '0.2em' }}>
            INVENTORY
          </span>
          <h2 className="pixel-font mt-2" style={{ color: C.text, fontSize: '16px' }}>
            🎒 오시는 길
          </h2>
        </motion.div>

        <div className="space-y-4">
          {items.map((item) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              className="pixel-dialog"
            >
              {/* Item header */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="pixel-border-thin flex items-center justify-center"
                  style={{ width: 40, height: 40, background: C.white, fontSize: '20px' }}
                >
                  {item.icon}
                </div>
                <div>
                  <span className="pixel-font block" style={{ color: C.text, fontSize: '14px', fontWeight: 'bold' }}>
                    {item.label}
                  </span>
                  <span className="pixel-font-en" style={{ fontSize: '6px', color: item.rarity, letterSpacing: '0.1em' }}>
                    ★ ITEM INFO
                  </span>
                </div>
              </div>

              {/* Item description */}
              {item.content.split('\n').map((line, j) => (
                <p key={j} className="pixel-font" style={{ color: C.textLight, fontSize: '12px', lineHeight: '1.8' }}>
                  {line}
                </p>
              ))}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}


/* =============================================================
   SECTION 7 - ACCOUNT (Gold Shop)
   ============================================================= */

function AccountSection() {
  const [openGroup, setOpenGroup] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = async (acc, key) => {
    const text = `${acc.bank} ${acc.number} (${acc.holder})`;
    await copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const groups = [
    { key: 'groom', title: '\uC2E0\uB791\uCE21', name: weddingConfig.groom.name, color: C.blue, accounts: weddingConfig.accounts.groom },
    { key: 'bride', title: '\uC2E0\uBD80\uCE21', name: weddingConfig.bride.name, color: C.pink, accounts: weddingConfig.accounts.bride },
  ];

  return (
    <section className="py-16 px-5" style={{ background: C.bg1 }}>
      <motion.div
        className="max-w-md mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        <motion.div variants={fadeIn} className="text-center mb-6">
          <span className="pixel-font-en" style={{ fontSize: '8px', color: C.textLight, letterSpacing: '0.2em' }}>
            GOLD SHOP
          </span>
          <h2 className="pixel-font mt-2" style={{ color: C.text, fontSize: '16px' }}>
            💰 축의금
          </h2>
          <p className="pixel-font mt-2" style={{ color: C.textLight, fontSize: '11px' }}>
            축하의 마음을 전해주세요
          </p>
        </motion.div>

        <div className="space-y-4">
          {groups.map((group) => (
            <motion.div key={group.key} variants={fadeUp}>
              {/* Tab button */}
              <button
                onClick={() => setOpenGroup(openGroup === group.key ? null : group.key)}
                className="w-full pixel-dialog flex items-center justify-between"
                style={{ cursor: 'pointer' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="pixel-border-thin flex items-center justify-center"
                    style={{ width: 36, height: 36, background: group.color + '22' }}
                  >
                    <span style={{ fontSize: '16px' }}>{group.key === 'groom' ? '\u{1F468}\u200D\u{1F4BB}' : '\u{1F469}\u200D\u{1F4BC}'}</span>
                  </div>
                  <div className="text-left">
                    <span className="pixel-font block" style={{ color: group.color, fontSize: '10px' }}>{group.title}</span>
                    <span className="pixel-font block" style={{ color: C.text, fontSize: '14px' }}>{group.name}</span>
                  </div>
                </div>
                <span
                  className="pixel-font"
                  style={{ color: C.textLight, fontSize: '14px', transform: openGroup === group.key ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
                >
                  ▶
                </span>
              </button>

              {/* Account details */}
              <AnimatePresence>
                {openGroup === group.key && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 space-y-2">
                      {group.accounts.map((acc, i) => {
                        const key = `${group.key}-${i}`;
                        return (
                          <div
                            key={i}
                            className="pixel-border-thin p-3 flex items-center justify-between"
                            style={{ background: C.white }}
                          >
                            <div className="min-w-0 flex-1 mr-3">
                              <span className="pixel-font block" style={{ color: C.text, fontSize: '13px' }}>{acc.bank}</span>
                              <span className="pixel-font block" style={{ color: C.textLight, fontSize: '11px', letterSpacing: '0.05em' }}>{acc.number}</span>
                              <span className="pixel-font" style={{ color: C.textLight, fontSize: '10px' }}>{acc.holder}</span>
                            </div>
                            <button
                              onClick={() => handleCopy(acc, key)}
                              className="pixel-btn"
                              style={{
                                fontSize: '10px', padding: '6px 12px',
                                background: copiedKey === key ? C.mint : C.yellow,
                              }}
                            >
                              {copiedKey === key ? 'OK!' : 'GET!'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}


/* =============================================================
   SECTION 8 - GUESTBOOK (Retro BBS / Message Board)
   ============================================================= */

function GuestbookSection() {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !content.trim() || !password.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'guestbook'), {
        name: name.trim(),
        password: password.trim(),
        content: content.trim(),
        createdAt: serverTimestamp(),
      });
      setName('');
      setPassword('');
      setContent('');
    } catch (err) {
      console.error('Guestbook error:', err);
      alert('\uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (msg) => {
    const input = prompt('\uC0AD\uC81C\uD558\uB824\uBA74 \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD558\uC138\uC694.');
    if (!input) return;
    if (input !== msg.password) {
      alert('\uBE44\uBC00\uBC88\uD638\uAC00 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'guestbook', msg.id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('\uC0AD\uC81C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.');
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate();
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
  };

  return (
    <section className="py-16 px-5" style={{ background: C.bg2 }}>
      <motion.div
        className="max-w-md mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        <motion.div variants={fadeIn} className="text-center mb-6">
          <span className="pixel-font-en" style={{ fontSize: '8px', color: C.textLight, letterSpacing: '0.2em' }}>
            BBS
          </span>
          <h2 className="pixel-font mt-2" style={{ color: C.text, fontSize: '16px' }}>
            📝 MESSAGE BOARD
          </h2>
        </motion.div>

        {/* Write form - terminal style */}
        <motion.form
          variants={fadeUp}
          onSubmit={handleSubmit}
          className="pixel-dialog mb-6"
        >
          <div
            className="absolute -top-4 left-4 px-3 py-1"
            style={{ background: C.mint, color: C.text }}
          >
            <span className="pixel-font" style={{ fontSize: '10px' }}>✎️ WRITE</span>
          </div>

          <div className="pt-2 space-y-3">
            {/* Name & Password row */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="pixel-font block mb-1" style={{ color: C.mint, fontSize: '10px' }}>{'>'} name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  placeholder="_"
                  className="pixel-input"
                />
              </div>
              <div style={{ width: '100px' }}>
                <label className="pixel-font block mb-1" style={{ color: C.mint, fontSize: '10px' }}>{'>'} pw:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={10}
                  placeholder="_"
                  className="pixel-input"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="pixel-font block mb-1" style={{ color: C.mint, fontSize: '10px' }}>{'>'} message:</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="\uCD95\uD558 \uBA54\uC2DC\uC9C0\uB97C \uB0A8\uACB2\uC8FC\uC138\uC694..."
                className="pixel-input resize-none"
              />
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={submitting}
                className="pixel-btn"
                style={{ background: submitting ? C.bg2 : C.mint, fontSize: '12px' }}
              >
                {submitting ? 'SENDING...' : '▶ SEND'}
              </button>
            </div>
          </div>
        </motion.form>

        {/* Message list - BBS style */}
        <motion.div variants={fadeUp} className="space-y-3">
          {messages.length === 0 && (
            <div className="pixel-dialog text-center py-6">
              <p className="pixel-font" style={{ color: C.textLight, fontSize: '12px' }}>
                첫 번째 축하 메시지를 남겨주세요!
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="pixel-border-thin p-4"
              style={{ background: C.white }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="pixel-font" style={{ color: C.blue, fontSize: '10px' }}>▶</span>
                  <span className="pixel-font" style={{ color: C.text, fontSize: '13px', fontWeight: 'bold' }}>{msg.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="pixel-font" style={{ color: C.textLight, fontSize: '9px' }}>{formatDate(msg.createdAt)}</span>
                  <button
                    onClick={() => handleDelete(msg)}
                    className="pixel-font hover:opacity-70"
                    style={{ color: C.pink, fontSize: '9px' }}
                  >
                    [DEL]
                  </button>
                </div>
              </div>
              <p className="pixel-font break-words" style={{ color: C.text, fontSize: '12px', lineHeight: '1.7' }}>{msg.content}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}


/* =============================================================
   SECTION 9 - CHARACTER CREATOR (AI Guest Character)
   ============================================================= */

const DESCRIPTION_PRESETS = [
  '빨간 망토를 두른 용사',
  '마법 지팡이를 든 마법사',
  '귀여운 고양이 요정',
  '파란 갑옷의 기사',
  '꽃을 든 엘프',
  '별모양 모자 마녀',
];

function CharacterCreatorSection() {
  const [guestName, setGuestName] = useState('');
  const [descriptionKo, setDescriptionKo] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedChar, setGeneratedChar] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = useRef(null);

  // Load gallery from Firebase
  useEffect(() => {
    const q = query(
      collection(db, 'characters'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      setGallery(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleGenerate = async () => {
    if (!guestName.trim() || !descriptionKo.trim()) {
      setError('이름과 캐릭터 설명을 입력해주세요!');
      return;
    }
    // Duplicate name check
    if (gallery.some((c) => c.name === guestName.trim())) {
      setError('이미 같은 이름의 캐릭터가 있어요! 다른 이름을 사용해주세요.');
      return;
    }
    setError('');
    setGenerating(true);
    setGeneratedChar(null);
    setSaved(false);
    setElapsedSec(0);

    // Start elapsed timer
    timerRef.current = setInterval(() => setElapsedSec((s) => s + 1), 1000);

    try {
      const res = await fetch(`${CHARACTER_API_URL}/api/character`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guestName.trim(),
          description_ko: descriptionKo.trim(),
        }),
      });

      if (res.status === 429) {
        setError('요청이 너무 많습니다. 1분 후 다시 시도해주세요!');
        setGenerating(false);
        clearInterval(timerRef.current);
        return;
      }

      if (!res.ok) {
        throw new Error('Generation failed');
      }

      const data = await res.json();
      setGeneratedChar(data);
    } catch (err) {
      console.error('Character generation error:', err);
      setError('캐릭터 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
    clearInterval(timerRef.current);
    setGenerating(false);
  };

  const handleSave = async () => {
    if (!generatedChar || saved) return;
    try {
      await addDoc(collection(db, 'characters'), {
        name: generatedChar.name,
        description_ko: generatedChar.description_ko,
        image_url: generatedChar.image_url,
        storage_urls: generatedChar.storage_urls || {},
        character_id: generatedChar.character_id || '',
        createdAt: serverTimestamp(),
      });
      setSaved(true);
    } catch (err) {
      console.error('Save error:', err);
      setError('저장에 실패했습니다.');
    }
  };

  const handlePreset = (preset) => {
    setDescriptionKo(preset);
  };

  return (
    <section className="py-16 px-5" style={{ background: C.bg1 }}>
      <motion.div
        className="max-w-md mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        {/* Section title */}
        <motion.div variants={fadeIn} className="text-center mb-6">
          <span className="pixel-font-en" style={{ fontSize: '8px', color: C.textLight, letterSpacing: '0.2em' }}>
            CHARACTER SELECT
          </span>
          <h2 className="pixel-font mt-2" style={{ color: C.text, fontSize: '16px' }}>
            🎮 나만의 하객 캐릭터
          </h2>
          <p className="pixel-font mt-2" style={{ color: C.textLight, fontSize: '11px' }}>
            AI가 당신만의 픽셀 캐릭터를 만들어드려요!
          </p>
        </motion.div>

        {/* Creator form */}
        <motion.div variants={fadeUp} className="pixel-dialog mb-5">
          <div
            className="absolute -top-4 left-4 px-3 py-1"
            style={{ background: C.yellow, color: C.text }}
          >
            <span className="pixel-font" style={{ fontSize: '10px' }}>✨ CREATE</span>
          </div>

          <div className="pt-2 space-y-4">
            {/* Name input */}
            <div>
              <label className="pixel-font block mb-1" style={{ color: C.mint, fontSize: '10px' }}>
                {'>'} name:
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                maxLength={20}
                placeholder="이름을 입력하세요"
                className="pixel-input"
              />
            </div>

            {/* Description input */}
            <div>
              <label className="pixel-font block mb-1" style={{ color: C.mint, fontSize: '10px' }}>
                {'>'} description:
              </label>
              <textarea
                value={descriptionKo}
                onChange={(e) => setDescriptionKo(e.target.value)}
                maxLength={100}
                rows={2}
                placeholder="캐릭터를 설명해주세요 (예: 파란 모자를 쓴 마법사)"
                className="pixel-input resize-none"
              />
              <div className="flex justify-between mt-1">
                <span className="pixel-font" style={{ color: C.textLight, fontSize: '9px' }}>
                  한글로 설명하면 AI가 픽셀 캐릭터를 만들어요
                </span>
                <span className="pixel-font" style={{ color: C.textLight, fontSize: '9px' }}>
                  {descriptionKo.length}/100
                </span>
              </div>
            </div>

            {/* Preset buttons */}
            <div>
              <label className="pixel-font block mb-2" style={{ color: C.textLight, fontSize: '9px' }}>
                추천 캐릭터:
              </label>
              <div className="flex flex-wrap gap-2">
                {DESCRIPTION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePreset(preset)}
                    className="pixel-font"
                    style={{
                      fontSize: '10px',
                      padding: '4px 8px',
                      border: `2px solid ${C.border}`,
                      background: descriptionKo === preset ? C.yellow : C.white,
                      color: C.text,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="pixel-font" style={{ color: C.pink, fontSize: '11px' }}>
                ⚠ {error}
              </p>
            )}

            {/* Generate button */}
            <div className="text-center pt-1">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="pixel-btn"
                style={{
                  background: generating ? C.bg2 : C.mint,
                  fontSize: '13px',
                  padding: '10px 24px',
                }}
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <span className="pixel-blink">⏳</span> GENERATING... {elapsedSec}s
                  </span>
                ) : (
                  '🎨 캐릭터 생성!'
                )}
              </button>
              {generating && (
                <div className="mt-3 space-y-1">
                  <p className="pixel-font" style={{ color: C.textLight, fontSize: '10px' }}>
                    AI가 4방향 캐릭터를 만들고 있어요...
                  </p>
                  {/* Progress bar */}
                  <div style={{ width: '60%', margin: '0 auto', height: 8, border: `2px solid ${C.border}`, background: C.bg2 }}>
                    <motion.div
                      style={{ height: '100%', background: C.mint }}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 90, ease: 'linear' }}
                    />
                  </div>
                  <p className="pixel-font" style={{ color: C.textLight, fontSize: '9px' }}>
                    예상 소요시간: 약 1~2분
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Generated character result */}
        <AnimatePresence>
          {generatedChar && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="pixel-dialog mb-5"
            >
              <div
                className="absolute -top-4 left-4 px-3 py-1"
                style={{ background: C.pink, color: C.white }}
              >
                <span className="pixel-font" style={{ fontSize: '10px' }}>🎉 COMPLETE!</span>
              </div>

              <div className="pt-2 text-center">
                {/* Character image - south facing (front) */}
                <div
                  className="inline-block pixel-border-thin p-2 mb-3"
                  style={{ background: '#1a1a2e' }}
                >
                  <img
                    src={generatedChar.image_url}
                    alt={generatedChar.name}
                    style={{
                      width: 96,
                      height: 96,
                      imageRendering: 'pixelated',
                    }}
                    crossOrigin="anonymous"
                  />
                </div>

                {/* Character info */}
                <div className="mb-3">
                  <p className="pixel-font" style={{ color: C.text, fontSize: '14px', fontWeight: 'bold' }}>
                    {generatedChar.name}
                  </p>
                  <p className="pixel-font mt-1" style={{ color: C.textLight, fontSize: '11px' }}>
                    "{generatedChar.description_ko}"
                  </p>
                </div>

                {/* Save button */}
                <button
                  onClick={handleSave}
                  disabled={saved}
                  className="pixel-btn"
                  style={{
                    background: saved ? C.mint : C.yellow,
                    fontSize: '12px',
                  }}
                >
                  {saved ? '✓ 갤러리에 저장됨!' : '💾 갤러리에 저장'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guest character gallery */}
        {gallery.length > 0 && (
          <motion.div variants={fadeUp}>
            <button
              onClick={() => setShowGallery(!showGallery)}
              className="w-full pixel-dialog flex items-center justify-between mb-3"
              style={{ cursor: 'pointer' }}
            >
              <div className="flex items-center gap-2">
                <span className="pixel-font" style={{ color: C.text, fontSize: '13px' }}>
                  🏰 하객 캐릭터 갤러리
                </span>
                <span
                  className="pixel-font-en"
                  style={{
                    fontSize: '7px',
                    color: C.white,
                    backgroundColor: C.pink,
                    padding: '2px 6px',
                    border: `2px solid ${C.border}`,
                  }}
                >
                  {gallery.length}
                </span>
              </div>
              <span
                className="pixel-font"
                style={{
                  color: C.textLight,
                  fontSize: '14px',
                  transform: showGallery ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              >
                ▶
              </span>
            </button>

            <AnimatePresence>
              {showGallery && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-3 gap-3">
                    {gallery.map((char) => (
                      <div
                        key={char.id}
                        className="pixel-border-thin p-2 text-center"
                        style={{ background: C.white }}
                      >
                        <div
                          className="mx-auto mb-2"
                          style={{ background: '#1a1a2e', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <img
                            src={char.image_url || `data:image/png;base64,${char.image?.base64 || char.image || ''}`}
                            alt={char.name}
                            style={{
                              width: 48,
                              height: 48,
                              imageRendering: 'pixelated',
                            }}
                            crossOrigin="anonymous"
                          />
                        </div>
                        <p className="pixel-font truncate" style={{ color: C.text, fontSize: '10px' }}>
                          {char.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}


/* =============================================================
   SECTION 10 - SHARE & FOOTER (Game Ending / Credits)
   ============================================================= */

function ShareFooterSection() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await copyToClipboard(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 px-5" style={{ background: C.bg1 }}>
      <motion.div
        className="max-w-md mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        {/* Thank you banner */}
        <motion.div variants={fadeUp} className="mb-8">
          <div className="pixel-dialog inline-block px-8 py-6">
            <p className="pixel-font-en mb-2" style={{ color: C.yellow, fontSize: '10px', letterSpacing: '0.2em' }}>
              ☆ ☆ ☆
            </p>
            <h2 className="pixel-font-en" style={{ color: C.text, fontSize: '14px' }}>
              THANK YOU
            </h2>
            <h2 className="pixel-font-en" style={{ color: C.text, fontSize: '14px' }}>
              FOR PLAYING!
            </h2>
            <p className="pixel-font-en mt-2" style={{ color: C.yellow, fontSize: '10px', letterSpacing: '0.2em' }}>
              ☆ ☆ ☆
            </p>
          </div>
        </motion.div>

        {/* Share button */}
        <motion.div variants={fadeUp} className="flex justify-center mb-10">
          <button
            onClick={handleCopyLink}
            className="pixel-btn flex items-center gap-2"
            style={{ fontSize: '11px', background: copied ? C.mint : C.bg1 }}
          >
            <span>🔗</span> {copied ? 'Copied!' : 'URL \uBCF5\uC0AC'}
          </button>
        </motion.div>

        {/* Game credits */}
        <motion.div variants={fadeUp} className="space-y-1 mb-8">
          <div className="pixel-divider">
            <PixelHeart size={12} />
          </div>
        </motion.div>

        <motion.div variants={fadeIn} className="space-y-4">
          {/* Credits roll */}
          <div className="space-y-3 py-4">
            <div>
              <p className="pixel-font-en" style={{ color: C.blue, fontSize: '7px', letterSpacing: '0.15em' }}>DEVELOPED BY</p>
              <p className="pixel-font mt-1" style={{ color: C.text, fontSize: '15px' }}>{weddingConfig.groom.name}</p>
            </div>
            <div>
              <p className="pixel-font-en" style={{ color: C.pink, fontSize: '7px', letterSpacing: '0.15em' }}>PLANNED BY</p>
              <p className="pixel-font mt-1" style={{ color: C.text, fontSize: '15px' }}>{weddingConfig.bride.name}</p>
            </div>
            <div>
              <p className="pixel-font-en" style={{ color: C.yellow, fontSize: '7px', letterSpacing: '0.15em' }}>RELEASE DATE</p>
              <p className="pixel-font mt-1" style={{ color: C.text, fontSize: '13px' }}>
                {dateYear}.{dateMonth}.{dateDay}
              </p>
            </div>
          </div>

          {/* THE END */}
          <div className="pt-6 pb-2">
            <div className="flex items-center justify-center gap-3 mb-4">
              <PixelHeart size={14} color={C.pink} />
              <span className="pixel-font-en" style={{ color: C.text, fontSize: '12px', letterSpacing: '0.2em' }}>
                THE END
              </span>
              <PixelHeart size={14} color={C.pink} />
            </div>
            <p className="pixel-font" style={{ color: C.textLight, fontSize: '9px' }}>
              Made with ❤️ and pixels
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}


/* =============================================================
   MAIN LAYOUT
   ============================================================= */

export default function PixelLayout() {
  return (
    <>
      <style>{pixelStyles}</style>
      <div className="pixel-layout max-w-[480px] mx-auto" style={{ backgroundColor: C.bg1 }}>
        <CoverSection />
        <PixelDivider />
        <GreetingSection />
        <PixelDivider />
        <CountdownSection />
        <PixelDivider />
        <GallerySection />
        <PixelDivider />
        <LocationSection />
        <PixelDivider />
        <TransportationSection />
        <PixelDivider />
        <AccountSection />
        <PixelDivider />
        <GuestbookSection />
        <PixelDivider />
        <CharacterCreatorSection />
        <PixelDivider />
        <ShareFooterSection />
      </div>
    </>
  );
}
