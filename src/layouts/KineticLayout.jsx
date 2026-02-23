import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
   Animation Variants
   ───────────────────────────────────────────── */

const slideFromLeft = {
  hidden: { x: -40, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
};

const slideFromRight = {
  hidden: { x: 40, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
};

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
};

const letterReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5 },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const staggerFast = {
  visible: { transition: { staggerChildren: 0.06 } },
};


/* ─────────────────────────────────────────────
   Utility
   ───────────────────────────────────────────── */

const pad = (n) => String(n).padStart(2, '0');

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

const weddingDate = new Date(weddingConfig.date);
const dateMonth = pad(weddingDate.getMonth() + 1);
const dateDay = pad(weddingDate.getDate());
const dateYear = weddingDate.getFullYear();
const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const dateDow = dayNames[weddingDate.getDay()];
const dateHour = weddingDate.getHours();
const dateMin = pad(weddingDate.getMinutes());
const dateAmPm = dateHour >= 12 ? 'PM' : 'AM';
const dateHour12 = dateHour > 12 ? dateHour - 12 : dateHour;


/* =============================================================
   COVER
   ============================================================= */

function CoverSection() {
  const groomChars = weddingConfig.groom.name.split('');
  const brideChars = weddingConfig.bride.name.split('');

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen flex flex-col justify-center px-6 overflow-hidden"
    >
      {/* Main name composition */}
      <div className="relative flex items-center justify-between mt-16 px-2">
        {/* Groom - vertical */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerFast}
          className="font-serif text-warm-800"
          style={{ writingMode: 'vertical-rl', fontSize: '48px', lineHeight: 1, letterSpacing: '0.15em' }}
        >
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          >
            {groomChars.map((char, i) => (
              <motion.span key={i} variants={letterReveal} custom={i} className="block">
                {char}
              </motion.span>
            ))}
          </motion.span>
        </motion.div>

        {/* Center ampersand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-warm-300 text-xs tracking-[0.3em] uppercase">Wedding</span>
          <span className="font-serif text-warm-500 text-2xl">&</span>
          <span className="text-warm-300 text-xs tracking-[0.3em] uppercase">Invitation</span>
        </motion.div>

        {/* Bride - vertical */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerFast}
          className="font-serif text-warm-800"
          style={{ writingMode: 'vertical-rl', fontSize: '48px', lineHeight: 1, letterSpacing: '0.15em' }}
        >
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.5 }}
          >
            {brideChars.map((char, i) => (
              <motion.span key={i} variants={letterReveal} custom={i + 3} className="block">
                {char}
              </motion.span>
            ))}
          </motion.span>
        </motion.div>
      </div>

      {/* Date display */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        className="mt-20 flex items-end gap-3"
      >
        <span className="font-serif text-warm-800" style={{ fontSize: '96px', lineHeight: 0.85 }}>
          {dateMonth}.{dateDay}
        </span>
        <div className="pb-2 flex flex-col gap-0.5">
          <span className="text-warm-400 text-xs tracking-widest">{dateYear}</span>
          <span className="text-warm-400 text-xs tracking-widest">{dateDow}</span>
          <span className="text-warm-400 text-xs tracking-widest">{dateAmPm} {dateHour12}:{dateMin}</span>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-warm-300 text-[10px] tracking-[0.4em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="w-px h-8 bg-warm-300"
        />
      </motion.div>
    </motion.section>
  );
}


/* =============================================================
   GREETING
   ============================================================= */

function GreetingSection() {
  const lines = weddingConfig.greeting.split('\n').filter((l) => l.trim() !== '');
  const directions = [slideFromLeft, slideFromRight, slideFromLeft, slideFromRight, fadeUp, fadeUp];

  return (
    <motion.section
      className="py-32 px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: '-50px' }}
      variants={stagger}
    >
      <motion.p
        variants={fadeUp}
        className="text-warm-400 text-[10px] tracking-[0.5em] uppercase mb-8"
      >
        Invitation
      </motion.p>

      <div className="space-y-4">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            variants={directions[i % directions.length]}
            className="font-serif text-warm-700 leading-relaxed"
            style={{ fontSize: i === 0 ? '22px' : '16px' }}
          >
            {line}
          </motion.p>
        ))}
      </div>

      {/* Parents */}
      <motion.div variants={fadeUp} className="mt-20 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-warm-300 text-[10px] tracking-[0.3em]">GROOM</span>
          <span className="flex-1 h-px bg-warm-200" />
          <span className="font-serif text-warm-600 text-sm">
            {weddingConfig.groom.father} &middot; {weddingConfig.groom.mother}
            <span className="text-warm-400 text-xs ml-1">의 아들</span>
          </span>
          <span className="font-serif text-warm-800 text-lg font-bold">{weddingConfig.groom.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-warm-300 text-[10px] tracking-[0.3em]">BRIDE</span>
          <span className="flex-1 h-px bg-warm-200" />
          <span className="font-serif text-warm-600 text-sm">
            {weddingConfig.bride.father} &middot; {weddingConfig.bride.mother}
            <span className="text-warm-400 text-xs ml-1">의 딸</span>
          </span>
          <span className="font-serif text-warm-800 text-lg font-bold">{weddingConfig.bride.name}</span>
        </div>
      </motion.div>
    </motion.section>
  );
}


/* =============================================================
   COUNTDOWN
   ============================================================= */

function CountdownSection() {
  const { days, hours, minutes, seconds, passed } = useCountdown(weddingConfig.date);

  const units = [
    { value: days, label: 'DAYS' },
    { value: hours, label: 'HRS' },
    { value: minutes, label: 'MIN' },
    { value: seconds, label: 'SEC' },
  ];

  return (
    <motion.section
      className="py-28 px-6 bg-warm-800 text-warm-50 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: '-50px' }}
      variants={stagger}
    >
      <motion.p
        variants={fadeUp}
        className="text-warm-400 text-[10px] tracking-[0.5em] uppercase mb-4"
      >
        {passed ? 'We Are Married' : 'Counting Down'}
      </motion.p>

      <div className="flex justify-between items-end">
        {units.map((u, i) => (
          <motion.div
            key={u.label}
            variants={fadeUp}
            className="flex flex-col items-center"
          >
            <motion.span
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: i * 0.3 }}
              className="font-serif text-warm-50 tabular-nums"
              style={{ fontSize: i === 0 ? '60px' : '48px', lineHeight: 0.9 }}
            >
              {pad(u.value)}
            </motion.span>
            <span className="text-warm-500 text-[9px] tracking-[0.4em] mt-3">
              {u.label}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={fadeUp}
        className="mt-16 text-center"
      >
        <span className="font-serif text-warm-400 text-sm">
          {dateYear}. {dateMonth}. {dateDay}. {dateDow} {dateAmPm} {dateHour12}:{dateMin}
        </span>
      </motion.div>

      <CalendarSave variant="kinetic" />
    </motion.section>
  );
}


/* =============================================================
   GALLERY (horizontal scroll strip)
   ============================================================= */

function GallerySection() {
  const scrollRef = useRef(null);

  return (
    <motion.section
      className="py-28 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: '-50px' }}
      variants={stagger}
    >
      <div className="px-8 mb-10">
        <motion.p
          variants={fadeUp}
          className="text-warm-400 text-[10px] tracking-[0.5em] uppercase mb-3"
        >
          Gallery
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-serif text-warm-800"
          style={{ fontSize: '42px', lineHeight: 1 }}
        >
          우리의 순간
        </motion.h2>
      </div>

      <motion.div
        variants={fadeUp}
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pl-8 pr-8 pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {weddingConfig.galleryImages.map((name, i) => (
          <div
            key={i}
            className="shrink-0 snap-center relative overflow-hidden rounded-sm"
            style={{ width: '200px', height: '260px' }}
          >
            <img
              src={galleryPath(name).thumb}
              alt={`gallery-${i + 1}`}
              loading="lazy"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
            <span className="absolute bottom-2 right-3 font-serif text-white/60 text-[10px]">
              {pad(i + 1)}
            </span>
          </div>
        ))}
        {/* Spacer so last image doesn't clip at right edge */}
        <div className="shrink-0 w-2" aria-hidden="true" />
      </motion.div>
    </motion.section>
  );
}


/* =============================================================
   LOCATION
   ============================================================= */

function LocationSection() {
  const { location } = weddingConfig;

  return (
    <motion.section
      className="py-28 px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: '-50px' }}
      variants={stagger}
    >
      <motion.p
        variants={fadeUp}
        className="text-warm-400 text-[10px] tracking-[0.5em] uppercase mb-3"
      >
        Location
      </motion.p>

      {/* Venue name - huge */}
      <motion.h2
        variants={fadeUp}
        className="font-serif text-warm-800 mb-2"
        style={{ fontSize: '40px', lineHeight: 1.1 }}
      >
        {location.name}
      </motion.h2>

      <motion.p
        variants={fadeUp}
        className="font-serif text-warm-500 text-lg mb-1"
      >
        {location.hall}
      </motion.p>

      <motion.p variants={fadeUp} className="text-warm-400 text-sm mb-2">
        {location.address}
      </motion.p>

      <motion.p variants={fadeUp} className="text-warm-300 text-xs mb-10">
        Tel. {location.tel}
      </motion.p>

      {/* Map */}
      <motion.div
        variants={scaleIn}
        className="w-full aspect-[4/3] bg-warm-100 rounded-sm overflow-hidden"
      >
        <iframe
          title="wedding-map"
          src={`https://map.kakao.com/link/map/${encodeURIComponent(location.name)},${location.lat},${location.lng}`}
          className="w-full h-full border-0"
          loading="lazy"
        />
      </motion.div>

      {/* Nav links */}
      <motion.div variants={fadeUp} className="flex gap-2 mt-4">
        <a
          href={`https://map.kakao.com/link/to/${encodeURIComponent(location.name)},${location.lat},${location.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 text-center text-sm text-warm-600 border border-warm-200 hover:bg-warm-100 transition-colors"
        >
          카카오내비
        </a>
        <a
          href={`https://map.naver.com/v5/directions/-/-/-/transit?c=${location.lng},${location.lat},15,0,0,0,dh`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 text-center text-sm text-warm-600 border border-warm-200 hover:bg-warm-100 transition-colors"
        >
          네이버지도
        </a>
        <a
          href={`https://www.tmap.co.kr/tmap/app/routes?goalx=${location.lng}&goaly=${location.lat}&goalname=${encodeURIComponent(location.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 text-center text-sm text-warm-600 border border-warm-200 hover:bg-warm-100 transition-colors"
        >
          티맵
        </a>
      </motion.div>
    </motion.section>
  );
}


/* =============================================================
   TRANSPORTATION
   ============================================================= */

function TransportationSection() {
  const { transportation } = weddingConfig;

  const items = [
    { icon: 'subway', label: '지하철', content: transportation.subway },
    { icon: 'bus', label: '버스', content: transportation.bus },
    { icon: 'car', label: '주차', content: transportation.parking },
  ];

  return (
    <motion.section
      className="py-28 px-8 bg-warm-100/40"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: '-50px' }}
      variants={stagger}
    >
      <motion.p
        variants={fadeUp}
        className="text-warm-400 text-[10px] tracking-[0.5em] uppercase mb-3"
      >
        Transportation
      </motion.p>

      <motion.h2
        variants={fadeUp}
        className="font-serif text-warm-800 mb-12"
        style={{ fontSize: '36px', lineHeight: 1 }}
      >
        오시는 길
      </motion.h2>

      <div className="space-y-8">
        {items.map((item, i) => (
          <motion.div key={item.label} variants={i % 2 === 0 ? slideFromLeft : slideFromRight}>
            <span
              className="font-serif text-warm-700 block mb-2"
              style={{ fontSize: '24px' }}
            >
              {item.label}
            </span>
            {item.content.split('\n').map((line, j) => (
              <p key={j} className="text-warm-500 text-sm leading-relaxed">
                {line}
              </p>
            ))}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}


/* =============================================================
   ACCOUNT
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
    { key: 'groom', title: '신랑측', titleLarge: weddingConfig.groom.name, accounts: weddingConfig.accounts.groom },
    { key: 'bride', title: '신부측', titleLarge: weddingConfig.bride.name, accounts: weddingConfig.accounts.bride },
  ];

  return (
    <motion.section
      className="py-28 px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: '-50px' }}
      variants={stagger}
    >
      <motion.p
        variants={fadeUp}
        className="text-warm-400 text-[10px] tracking-[0.5em] uppercase mb-3"
      >
        Account
      </motion.p>

      <motion.h2
        variants={fadeUp}
        className="font-serif text-warm-800 mb-2"
        style={{ fontSize: '36px', lineHeight: 1 }}
      >
        마음 전하실 곳
      </motion.h2>

      <motion.p variants={fadeUp} className="text-warm-400 text-xs mb-12">
        축하의 마음을 전해주세요
      </motion.p>

      <div className="space-y-6">
        {groups.map((group) => (
          <motion.div key={group.key} variants={fadeUp}>
            <button
              onClick={() => setOpenGroup(openGroup === group.key ? null : group.key)}
              className="w-full flex items-end justify-between pb-3 border-b border-warm-200"
            >
              <div className="text-left">
                <span className="text-warm-300 text-[10px] tracking-[0.3em] uppercase block">
                  {group.title}
                </span>
                <span
                  className="font-serif text-warm-700 block"
                  style={{ fontSize: '28px', lineHeight: 1.2 }}
                >
                  {group.titleLarge}
                </span>
              </div>
              <motion.span
                animate={{ rotate: openGroup === group.key ? 45 : 0 }}
                transition={{ duration: 0.25 }}
                className="text-warm-400 text-xl mb-1"
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
                  <div className="pt-4 space-y-3">
                    {group.accounts.map((acc, i) => {
                      const key = `${group.key}-${i}`;
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <span
                              className="font-serif text-warm-700 block"
                              style={{ fontSize: '20px' }}
                            >
                              {acc.bank}
                            </span>
                            <span className="text-warm-400 text-sm">
                              {acc.number}
                            </span>
                            <span className="text-warm-300 text-xs ml-2">
                              {acc.holder}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(acc, key)}
                            className="text-[10px] tracking-[0.2em] uppercase text-warm-500 border border-warm-300 px-3 py-1.5 hover:bg-warm-100 transition-colors shrink-0"
                          >
                            {copiedKey === key ? 'Copied' : 'Copy'}
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
    </motion.section>
  );
}


/* =============================================================
   GUESTBOOK
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
      console.error('방명록 저장 실패:', err);
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
      console.error('삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate();
    return `${d.getMonth() + 1}.${d.getDate()}`;
  };

  return (
    <motion.section
      className="py-28 px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: '-50px' }}
      variants={stagger}
    >
      <motion.p
        variants={fadeUp}
        className="text-warm-400 text-[10px] tracking-[0.5em] uppercase mb-3"
      >
        Guestbook
      </motion.p>

      <motion.h2
        variants={fadeUp}
        className="font-serif text-warm-800 mb-12"
        style={{ fontSize: '36px', lineHeight: 1 }}
      >
        방명록
      </motion.h2>

      {/* Form */}
      <motion.form
        variants={fadeUp}
        onSubmit={handleSubmit}
        className="max-w-sm mx-auto mb-12 space-y-4"
      >
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="flex-1 px-0 py-2 text-sm font-serif bg-transparent border-0 border-b border-warm-200 focus:outline-none focus:border-warm-500 text-warm-700 placeholder:text-warm-200"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={10}
            className="w-24 px-0 py-2 text-sm font-serif bg-transparent border-0 border-b border-warm-200 focus:outline-none focus:border-warm-500 text-warm-700 placeholder:text-warm-200"
          />
        </div>
        <div className="flex gap-3 items-end">
          <textarea
            placeholder="축하 메시지를 남겨주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={200}
            rows={2}
            className="flex-1 px-0 py-2 text-sm font-serif bg-transparent border-0 border-b border-warm-200 focus:outline-none focus:border-warm-500 text-warm-700 placeholder:text-warm-200 resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-warm-800 text-warm-50 text-[10px] tracking-[0.2em] uppercase hover:bg-warm-700 transition-colors disabled:opacity-50 shrink-0"
          >
            Post
          </button>
        </div>
      </motion.form>

      {/* Messages */}
      <motion.div variants={fadeUp} className="max-w-sm mx-auto space-y-0">
        {messages.length === 0 && (
          <p className="text-center text-warm-300 text-sm font-serif py-8">
            첫 번째 축하 메시지를 남겨주세요
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={msg.id} className="py-4 border-b border-warm-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-serif text-warm-700 text-sm font-bold">{msg.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-warm-300 text-[10px]">{formatDate(msg.createdAt)}</span>
                <button
                  onClick={() => handleDelete(msg)}
                  className="text-warm-300 text-[10px] tracking-wider uppercase hover:text-warm-500 transition-colors"
                >
                  Del
                </button>
              </div>
            </div>
            <p className="text-warm-500 text-sm leading-relaxed">{msg.content}</p>
          </div>
        ))}
      </motion.div>
    </motion.section>
  );
}


/* =============================================================
   SHARE
   ============================================================= */

function ShareSection() {
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
    <motion.section
      className="py-28 px-8 bg-warm-100/40"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: '-50px' }}
      variants={stagger}
    >
      <motion.p
        variants={fadeUp}
        className="text-warm-400 text-[10px] tracking-[0.5em] uppercase mb-3"
      >
        Share
      </motion.p>

      <motion.h2
        variants={fadeUp}
        className="font-serif text-warm-800 mb-12"
        style={{ fontSize: '36px', lineHeight: 1 }}
      >
        공유하기
      </motion.h2>

      <motion.div variants={fadeUp} className="max-w-sm mx-auto flex gap-3">
        <button
          onClick={handleKakaoShare}
          className="flex-1 py-4 text-sm text-warm-600 border border-warm-200 hover:bg-warm-100 transition-colors tracking-wider"
        >
          카카오톡
        </button>
        <button
          onClick={handleCopyLink}
          className="flex-1 py-4 text-sm text-warm-600 border border-warm-200 hover:bg-warm-100 transition-colors tracking-wider"
        >
          {copied ? 'Copied!' : 'URL 복사'}
        </button>
      </motion.div>
    </motion.section>
  );
}


/* =============================================================
   FOOTER
   ============================================================= */

function FooterSection() {
  return (
    <motion.footer
      className="py-20 px-8 text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false }}
      variants={stagger}
    >
      <motion.div variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <span className="font-serif text-warm-700" style={{ fontSize: '28px' }}>
            {weddingConfig.groom.name}
          </span>
          <span className="text-warm-300 text-xs">&</span>
          <span className="font-serif text-warm-700" style={{ fontSize: '28px' }}>
            {weddingConfig.bride.name}
          </span>
        </div>

        <p className="text-warm-300 text-[10px] tracking-[0.4em] uppercase">
          {dateYear}. {dateMonth}. {dateDay}. {dateDow}
        </p>

        <p className="text-warm-200 text-[10px] tracking-[0.3em] mt-8">
          Designed with love
        </p>
      </motion.div>
    </motion.footer>
  );
}


/* =============================================================
   MAIN LAYOUT
   ============================================================= */

export default function KineticLayout() {
  return (
    <div className="max-w-[480px] mx-auto bg-warm-50 min-h-screen overflow-hidden">
      <CoverSection />
      <GreetingSection />
      <CountdownSection />
      <GallerySection />
      <LocationSection />
      <TransportationSection />
      <AccountSection />
      <GuestbookSection />
      <ShareSection />
      <FooterSection />
    </div>
  );
}
