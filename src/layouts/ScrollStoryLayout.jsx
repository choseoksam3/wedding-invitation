import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { weddingConfig, galleryPath } from '../config/wedding';
import { useCountdown } from '../hooks/useCountdown';
import CalendarSave from '../components/CalendarSave';
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
} from 'firebase/firestore';


/* ─────────────────────────────────────────────
   Constants & Utilities
   ───────────────────────────────────────────── */

const pad = (n) => String(n).padStart(2, '0');

const weddingDate = new Date(weddingConfig.date);
const dateYear = weddingDate.getFullYear();
const dateMonth = pad(weddingDate.getMonth() + 1);
const dateDay = pad(weddingDate.getDate());
const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const dayNamesKo = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const dateDow = dayNames[weddingDate.getDay()];
const dateDowKo = dayNamesKo[weddingDate.getDay()];
const dateHour = weddingDate.getHours();
const dateMin = pad(weddingDate.getMinutes());
const dateAmPm = dateHour >= 12 ? 'PM' : 'AM';
const dateHour12 = dateHour > 12 ? dateHour - 12 : dateHour;

/** Custom dark palette — refined charcoal tones for cinematic elegance */
const DARK = '#1F1C19';
const LIGHT = '#2A2622';
const BASE = '#1A1714';

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


/* ─────────────────────────────────────────────
   Animation Variants (simple & reliable)
   ───────────────────────────────────────────── */

const fadeUp = {
  hidden: { y: 40, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const viewportConfig = { once: true, margin: '-30px' };


/* ─────────────────────────────────────────────
   Section Divider — elegant ornamental element
   ───────────────────────────────────────────── */

function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-4" style={{ backgroundColor: BASE }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-px bg-warm-600/30" />
        <div className="w-1.5 h-1.5 rotate-45 border border-warm-500/30" />
        <div className="w-10 h-px bg-warm-600/30" />
      </div>
    </div>
  );
}


/* =============================================================
   SECTION - COVER
   ============================================================= */

function CoverSection() {
  const heroImage = weddingConfig.galleryImages[0] ? galleryPath(weddingConfig.galleryImages[0]) : null;

  return (
    <section className="min-h-screen relative flex flex-col items-center justify-end overflow-hidden">
      {/* Full-screen background image */}
      {heroImage ? (
        <div className="absolute inset-0">
          <img
            src={heroImage.full}
            alt="wedding cover"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${DARK} 0%, ${BASE} 60%, #000 100%)`,
          }}
        />
      )}

      {/* Dark gradient overlay — softer than before */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.10) 30%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.80) 100%)',
        }}
      />

      {/* Content at bottom */}
      <motion.div
        className="relative z-10 text-center pb-28 px-6"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Date small */}
        <motion.p
          variants={fadeIn}
          className="text-white/60 text-[10px] tracking-[0.6em] uppercase mb-6"
        >
          {dateYear}. {dateMonth}. {dateDay}. {dateDow}
        </motion.p>

        {/* Names */}
        <motion.h1
          variants={fadeUp}
          className="font-serif text-white mb-3"
          style={{ fontSize: '36px', letterSpacing: '0.08em', lineHeight: 1.2 }}
        >
          {weddingConfig.groom.name}
          <span className="inline-block mx-3 text-white/40 text-lg font-light">&amp;</span>
          {weddingConfig.bride.name}
        </motion.h1>

        {/* Venue */}
        <motion.p
          variants={fadeIn}
          className="text-white/50 text-xs tracking-[0.2em]"
        >
          {dateAmPm} {dateHour12}:{dateMin} &middot; {weddingConfig.location.name}
        </motion.p>
      </motion.div>

      {/* Scroll arrow */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-white/30 text-[8px] tracking-[0.5em] uppercase">Scroll</span>
        <motion.svg
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </motion.svg>
      </motion.div>
    </section>
  );
}


/* =============================================================
   SECTION - GREETING
   ============================================================= */

function GreetingSection() {
  const lines = weddingConfig.greeting.split('\n');

  return (
    <section className="py-24 px-6" style={{ backgroundColor: DARK }}>
      <motion.div
        className="max-w-md mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        {/* Section label */}
        <motion.p
          variants={fadeIn}
          className="text-warm-400 text-[10px] tracking-[0.6em] uppercase mb-10"
        >
          Invitation
        </motion.p>

        {/* Greeting lines */}
        <div className="space-y-1 mb-12">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              variants={fadeUp}
              className="font-serif text-warm-200 text-sm leading-[2.2]"
              style={{ minHeight: line.trim() === '' ? '1.5em' : 'auto' }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* Ornamental separator */}
        <motion.div variants={fadeIn} className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-px bg-warm-500/30" />
          <div className="w-1.5 h-1.5 rotate-45 border border-warm-400/40" />
          <div className="w-12 h-px bg-warm-500/30" />
        </motion.div>

        {/* Parents info */}
        <motion.div variants={fadeUp} className="space-y-3 text-xs">
          <p>
            <span className="text-warm-400">{weddingConfig.groom.father}</span>
            <span className="mx-1.5 text-warm-600">&middot;</span>
            <span className="text-warm-400">{weddingConfig.groom.mother}</span>
            <span className="ml-1.5 text-warm-500">의 아들</span>
            <span className="ml-2 font-serif text-warm-100 text-sm">{weddingConfig.groom.name}</span>
          </p>
          <p>
            <span className="text-warm-400">{weddingConfig.bride.father}</span>
            <span className="mx-1.5 text-warm-600">&middot;</span>
            <span className="text-warm-400">{weddingConfig.bride.mother}</span>
            <span className="ml-1.5 text-warm-500">의 딸</span>
            <span className="ml-2 font-serif text-warm-100 text-sm">{weddingConfig.bride.name}</span>
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}


/* =============================================================
   SECTION - COUNTDOWN (D-Day)
   ============================================================= */

function CountdownSection() {
  const { days, hours, minutes, seconds, passed } = useCountdown(weddingConfig.date);

  return (
    <section className="py-24 px-6" style={{ backgroundColor: LIGHT }}>
      <motion.div
        className="max-w-md mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        {/* D-day number */}
        <motion.div variants={fadeUp}>
          <p className="text-warm-400 text-[10px] tracking-[0.5em] uppercase mb-4">
            {passed ? 'We Are Married' : 'D-Day'}
          </p>
          <p
            className="font-serif text-warm-100 tabular-nums"
            style={{ fontSize: '72px', lineHeight: 0.9, letterSpacing: '-0.02em' }}
          >
            {passed ? 'D+0' : `D-${days}`}
          </p>
        </motion.div>

        {/* Countdown units */}
        <motion.div variants={fadeUp} className="flex justify-center gap-8 mt-10 mb-14">
          {[
            { v: hours, l: 'HRS' },
            { v: minutes, l: 'MIN' },
            { v: seconds, l: 'SEC' },
          ].map((u) => (
            <div key={u.l} className="text-center">
              <span
                className="font-serif text-warm-200 tabular-nums block"
                style={{ fontSize: '32px', lineHeight: 1 }}
              >
                {pad(u.v)}
              </span>
              <span className="text-warm-500 text-[9px] tracking-[0.4em] mt-2 block">
                {u.l}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Mini calendar */}
        <motion.div
          variants={fadeIn}
          className="inline-block rounded-xl px-6 py-5"
          style={{ backgroundColor: 'rgba(255,248,240,0.05)', border: '1px solid rgba(255,248,240,0.08)' }}
        >
          <p className="text-warm-400 text-[10px] tracking-[0.3em] uppercase text-center mb-3">
            {dateYear}. {dateMonth}
          </p>
          <table className="text-center mx-auto" style={{ borderSpacing: '6px' }}>
            <thead>
              <tr>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <th
                    key={i}
                    className="text-[9px] text-warm-500 font-normal pb-1"
                    style={{ width: 28 }}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarWeeks.map((week, wi) => (
                <tr key={wi}>
                  {week.map((day, di) => {
                    const isWeddingDay = day === weddingDate.getDate();
                    return (
                      <td
                        key={di}
                        className={`text-[11px] py-0.5 ${
                          isWeddingDay
                            ? 'text-warm-100 font-bold'
                            : day
                              ? 'text-warm-400/60'
                              : ''
                        }`}
                      >
                        {isWeddingDay ? (
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full"
                            style={{ backgroundColor: 'rgba(200,168,120,0.25)' }}
                          >
                            {day}
                          </span>
                        ) : (
                          day || ''
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-warm-400 text-[10px] text-center mt-3">
            {dateDowKo} {dateAmPm} {dateHour12}:{dateMin}
          </p>
        </motion.div>

        <CalendarSave variant="scrollstory" />
      </motion.div>
    </section>
  );
}


/* =============================================================
   SECTION - GALLERY (3-column grid)
   ============================================================= */

function GallerySection() {
  const images = weddingConfig.galleryImages.map(galleryPath);
  const [selectedIdx, setSelectedIdx] = useState(null);

  return (
    <section className="py-24 px-4" style={{ backgroundColor: DARK }}>
      <motion.div
        className="max-w-md mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        <motion.p
          variants={fadeIn}
          className="text-warm-400 text-[10px] tracking-[0.5em] uppercase mb-3 text-center"
        >
          Gallery
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-warm-100 text-center mb-8"
          style={{ fontSize: '24px' }}
        >
          Our Moments
        </motion.h2>

        {/* 3-column grid */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-1.5">
          {images.map((img, i) => (
            <motion.button
              key={i}
              className="relative aspect-square overflow-hidden rounded"
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedIdx(i)}
            >
              <img
                src={img.thumb}
                alt={`gallery ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Lightbox overlay */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIdx(null)}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-white/60 text-2xl z-10 w-10 h-10 flex items-center justify-center"
              onClick={() => setSelectedIdx(null)}
            >
              &times;
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-4 z-10">
              <span className="text-white/50 text-xs tabular-nums">
                {selectedIdx + 1} / {images.length}
              </span>
            </div>

            {/* Image */}
            <motion.img
              key={selectedIdx}
              src={images[selectedIdx].full}
              alt={`gallery ${selectedIdx + 1}`}
              className="max-w-[90vw] max-h-[80vh] object-contain rounded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Prev / Next tap areas */}
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
   SECTION - LOCATION
   ============================================================= */

function LocationSection() {
  const { location } = weddingConfig;

  return (
    <section className="py-24 px-6" style={{ backgroundColor: LIGHT }}>
      <motion.div
        className="max-w-md mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        <motion.p
          variants={fadeIn}
          className="text-warm-400 text-[10px] tracking-[0.5em] uppercase mb-3"
        >
          Location
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-warm-100 mb-1"
          style={{ fontSize: '24px' }}
        >
          {location.name}
        </motion.h2>

        <motion.p variants={fadeIn} className="text-warm-300 text-sm mb-1">
          {location.hall}
        </motion.p>

        <motion.p variants={fadeIn} className="text-warm-400 text-xs mb-1">
          {location.address}
        </motion.p>

        <motion.p variants={fadeIn} className="text-warm-500 text-[11px] mb-6">
          Tel. {location.tel}
        </motion.p>

        {/* Map */}
        <motion.div variants={fadeUp} className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-5">
          <iframe
            title="wedding-map"
            src={`https://map.kakao.com/link/map/${encodeURIComponent(location.name)},${location.lat},${location.lng}`}
            className="w-full h-full border-0"
            loading="lazy"
          />
        </motion.div>

        {/* Navigation buttons */}
        <motion.div variants={fadeUp} className="flex gap-2">
          <a
            href={`https://map.kakao.com/link/to/${encodeURIComponent(location.name)},${location.lat},${location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 text-center text-xs text-warm-200 border border-warm-600 hover:bg-white/[0.06] transition-colors rounded-lg"
          >
            카카오맵
          </a>
          <a
            href={`https://map.naver.com/v5/directions/-/-/-/transit?c=${location.lng},${location.lat},15,0,0,0,dh`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 text-center text-xs text-warm-200 border border-warm-600 hover:bg-white/[0.06] transition-colors rounded-lg"
          >
            네이버맵
          </a>
          <a
            href={`https://www.tmap.co.kr/tmap/app/routes?goalx=${location.lng}&goaly=${location.lat}&goalname=${encodeURIComponent(location.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 text-center text-xs text-warm-200 border border-warm-600 hover:bg-white/[0.06] transition-colors rounded-lg"
          >
            티맵
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}


/* =============================================================
   SECTION - TRANSPORTATION
   ============================================================= */

function TransportationSection() {
  const { transportation } = weddingConfig;

  const items = [
    { icon: '\u{1F687}', label: '지하철', content: transportation.subway },
    { icon: '\u{1F68C}', label: '버스', content: transportation.bus },
    { icon: '\u{1F17F}', label: '주차', content: transportation.parking },
  ];

  return (
    <section className="py-24 px-6" style={{ backgroundColor: DARK }}>
      <motion.div
        className="max-w-md mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        <motion.p
          variants={fadeIn}
          className="text-warm-400 text-[10px] tracking-[0.5em] uppercase mb-3"
        >
          Transportation
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-warm-100 mb-8"
          style={{ fontSize: '24px' }}
        >
          오시는 길
        </motion.h2>

        <div className="space-y-4">
          {items.map((item) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              className="rounded-xl p-5"
              style={{ backgroundColor: 'rgba(255,248,240,0.05)', border: '1px solid rgba(255,248,240,0.08)' }}
            >
              <h3 className="font-serif text-warm-200 text-sm mb-3 flex items-center gap-2">
                <span className="text-base">{item.icon}</span>
                {item.label}
              </h3>
              {item.content.split('\n').map((line, j) => (
                <p key={j} className="text-warm-300 text-xs leading-relaxed mb-0.5">
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
   SECTION - ACCOUNT
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
    { key: 'groom', title: '신랑측', name: weddingConfig.groom.name, accounts: weddingConfig.accounts.groom },
    { key: 'bride', title: '신부측', name: weddingConfig.bride.name, accounts: weddingConfig.accounts.bride },
  ];

  return (
    <section className="py-24 px-6" style={{ backgroundColor: LIGHT }}>
      <motion.div
        className="max-w-md mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        <motion.p
          variants={fadeIn}
          className="text-warm-400 text-[10px] tracking-[0.5em] uppercase mb-3"
        >
          Account
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-warm-100 mb-2"
          style={{ fontSize: '24px' }}
        >
          마음 전하실 곳
        </motion.h2>

        <motion.p variants={fadeIn} className="text-warm-500 text-xs mb-8">
          축하의 마음을 전해주세요
        </motion.p>

        <div className="space-y-4">
          {groups.map((group) => (
            <motion.div key={group.key} variants={fadeUp}>
              <button
                onClick={() => setOpenGroup(openGroup === group.key ? null : group.key)}
                className="w-full flex items-center justify-between py-4 border-b border-warm-600/40"
              >
                <div className="text-left">
                  <span className="text-warm-500 text-[10px] tracking-[0.3em] uppercase block">
                    {group.title}
                  </span>
                  <span className="font-serif text-warm-200 text-lg block mt-0.5">
                    {group.name}
                  </span>
                </div>
                <motion.span
                  animate={{ rotate: openGroup === group.key ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-warm-400 text-lg"
                >
                  +
                </motion.span>
              </button>

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
                            className="flex items-center justify-between rounded-xl p-4"
                            style={{ backgroundColor: 'rgba(255,248,240,0.05)', border: '1px solid rgba(255,248,240,0.08)' }}
                          >
                            <div className="min-w-0 flex-1 mr-3">
                              <span className="text-warm-200 text-sm block">{acc.bank}</span>
                              <span className="text-warm-400 text-xs tracking-wider block truncate">{acc.number}</span>
                              <span className="text-warm-500 text-[10px]">{acc.holder}</span>
                            </div>
                            <button
                              onClick={() => handleCopy(acc, key)}
                              className="text-[10px] tracking-wider uppercase text-warm-300 border border-warm-600 px-3 py-1.5 hover:bg-white/[0.06] transition-colors shrink-0 rounded-lg"
                            >
                              {copiedKey === key ? 'Copied!' : 'Copy'}
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
   SECTION - GUESTBOOK
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
      alert('저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (msg) => {
    const input = prompt('삭제하려면 비밀번호를 입력하세요.');
    if (!input) return;
    if (input !== msg.password) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'guestbook', msg.id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate();
    return `${d.getMonth() + 1}.${d.getDate()}`;
  };

  const inputStyle = {
    backgroundColor: 'rgba(255,248,240,0.06)',
    border: '1px solid rgba(255,248,240,0.10)',
  };

  return (
    <section className="py-24 px-6" style={{ backgroundColor: DARK }}>
      <motion.div
        className="max-w-md mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        <motion.p
          variants={fadeIn}
          className="text-warm-400 text-[10px] tracking-[0.5em] uppercase mb-3"
        >
          Guestbook
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-warm-100 mb-8"
          style={{ fontSize: '24px' }}
        >
          방명록
        </motion.h2>

        {/* Write form */}
        <motion.form
          variants={fadeUp}
          onSubmit={handleSubmit}
          className="rounded-xl p-5 mb-6 space-y-3"
          style={{ backgroundColor: 'rgba(255,248,240,0.06)', border: '1px solid rgba(255,248,240,0.08)' }}
        >
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="flex-1 text-warm-100 placeholder:text-warm-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-warm-500/50"
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={10}
              className="w-24 text-warm-100 placeholder:text-warm-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-warm-500/50"
              style={inputStyle}
            />
          </div>
          <div className="flex gap-3 items-end">
            <textarea
              placeholder="축하 메시지를 남겨주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={200}
              rows={2}
              className="flex-1 text-warm-100 placeholder:text-warm-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-warm-500/50 resize-none"
              style={inputStyle}
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 text-[10px] tracking-wider uppercase hover:opacity-80 transition-opacity disabled:opacity-50 shrink-0 rounded-lg font-medium"
              style={{ backgroundColor: 'rgba(200,168,120,0.25)', color: '#f0e8d8' }}
            >
              Post
            </button>
          </div>
        </motion.form>

        {/* Message list */}
        <motion.div variants={fadeUp} className="space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-warm-500 text-sm font-serif py-8">
              첫 번째 축하 메시지를 남겨주세요
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-xl p-4"
              style={{ backgroundColor: 'rgba(255,248,240,0.05)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif text-warm-200 text-sm font-bold">{msg.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-warm-500 text-[9px]">{formatDate(msg.createdAt)}</span>
                  <button
                    onClick={() => handleDelete(msg)}
                    className="text-warm-500 text-[9px] tracking-wider uppercase hover:text-warm-300 transition-colors"
                  >
                    Del
                  </button>
                </div>
              </div>
              <p className="text-warm-300 text-sm leading-relaxed break-words">{msg.content}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}


/* =============================================================
   SECTION - SHARE + FOOTER
   ============================================================= */

function ShareFooterSection() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await copyToClipboard(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKakaoShare = () => {
    if (window.Kakao && window.Kakao.Share) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `${weddingConfig.groom.name} & ${weddingConfig.bride.name} 결혼합니다`,
          description: `${dateYear}.${dateMonth}.${dateDay} ${weddingConfig.location.name}`,
          imageUrl: weddingConfig.galleryImages[0] ? galleryPath(weddingConfig.galleryImages[0]).full : '',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <section className="py-28 px-6" style={{ backgroundColor: LIGHT }}>
      <motion.div
        className="max-w-sm mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={stagger}
      >
        {/* Thank you */}
        <motion.p
          variants={fadeUp}
          className="font-serif text-warm-200 mb-6"
          style={{ fontSize: '32px', lineHeight: 1.3 }}
        >
          Thank You
        </motion.p>

        <motion.p variants={fadeIn} className="text-warm-400 text-sm mb-10 leading-relaxed">
          소중한 분들에게<br />청첩장을 전해주세요
        </motion.p>

        {/* Share buttons */}
        <motion.div variants={fadeUp} className="flex gap-3 mb-20">
          <button
            onClick={handleKakaoShare}
            className="flex-1 py-3.5 text-xs text-warm-200 border border-warm-600 hover:bg-white/[0.06] transition-colors rounded-lg"
          >
            카카오톡 공유
          </button>
          <button
            onClick={handleCopyLink}
            className="flex-1 py-3.5 text-xs text-warm-200 border border-warm-600 hover:bg-white/[0.06] transition-colors rounded-lg"
          >
            {copied ? 'Copied!' : 'URL 복사'}
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div variants={fadeIn} className="space-y-4">
          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-px bg-warm-600/30" />
            <div className="w-1.5 h-1.5 rotate-45 border border-warm-500/30" />
            <div className="w-10 h-px bg-warm-600/30" />
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="font-serif text-warm-300" style={{ fontSize: '18px' }}>
              {weddingConfig.groom.name}
            </span>
            <span className="text-warm-500 text-xs">&amp;</span>
            <span className="font-serif text-warm-300" style={{ fontSize: '18px' }}>
              {weddingConfig.bride.name}
            </span>
          </div>

          <p className="text-warm-500 text-[10px] tracking-[0.4em]">
            {dateYear}. {dateMonth}. {dateDay}. {dateDow}
          </p>

          <p className="text-warm-600 text-[9px] tracking-[0.2em] pt-6">
            Designed with love
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}


/* =============================================================
   MAIN LAYOUT
   ============================================================= */

export default function ScrollStoryLayout() {
  return (
    <div className="max-w-[480px] mx-auto" style={{ backgroundColor: BASE }}>
      <CoverSection />
      <SectionDivider />
      <GreetingSection />
      <SectionDivider />
      <CountdownSection />
      <SectionDivider />
      <GallerySection />
      <SectionDivider />
      <LocationSection />
      <SectionDivider />
      <TransportationSection />
      <SectionDivider />
      <AccountSection />
      <SectionDivider />
      <GuestbookSection />
      <SectionDivider />
      <ShareFooterSection />
    </div>
  );
}
