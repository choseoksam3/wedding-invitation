import { motion } from 'framer-motion';
import { weddingConfig } from '../config/wedding';

/**
 * Generate an .ics (iCalendar) file content string and trigger download.
 * Compatible with Google Calendar, Apple Calendar, Outlook, and other
 * calendar apps that support the .ics standard.
 */
function generateICS() {
  const start = new Date(weddingConfig.date);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

  const formatDate = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return (
      d.getFullYear().toString() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      'T' +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  };

  const now = new Date();
  const uid = `wedding-${formatDate(now)}@wedding-invitation`;

  const { groom, bride, location } = weddingConfig;
  const summary = `${groom.name} & ${bride.name} 결혼식`;
  const locationStr = `${location.name} ${location.hall}, ${location.address}`;
  const description = `${groom.name} & ${bride.name}의 결혼식\\n장소: ${location.name} ${location.hall}\\n주소: ${location.address}\\nTel: ${location.tel}`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `DTSTAMP:${formatDate(now)}`,
    `UID:${uid}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${locationStr}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return ics;
}

function downloadICS() {
  const icsContent = generateICS();
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${weddingConfig.groom.name}_${weddingConfig.bride.name}_결혼식.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Calendar icon SVG (inline, no external deps) */
function CalendarIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

/**
 * CalendarSave component
 *
 * @param {Object} props
 * @param {'classic' | 'kinetic' | 'scrollstory'} props.variant - Layout variant for styling
 * @param {boolean} props.standalone - When true, self-animates with whileInView (for use outside a motion parent).
 *                                     When false (default), uses variants to animate as a child of a motion parent.
 */
export default function CalendarSave({ variant = 'classic', standalone = false }) {
  // Style presets per layout variant
  const styles = {
    classic: {
      wrapper: 'flex justify-center py-6 bg-warm-100/50',
      button:
        'inline-flex items-center gap-2 px-6 py-3 text-sm text-warm-600 border border-warm-300 rounded-full hover:bg-warm-200/50 active:scale-[0.97] transition-all duration-200',
      label: 'tracking-wider',
    },
    kinetic: {
      wrapper: 'flex justify-center mt-10',
      button:
        'inline-flex items-center gap-2 px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase text-warm-400 border border-warm-600 hover:bg-warm-700 hover:text-warm-200 active:scale-[0.97] transition-all duration-200',
      label: '',
    },
    scrollstory: {
      wrapper: 'flex justify-center mt-10',
      button:
        'inline-flex items-center gap-2 px-5 py-2.5 text-xs text-warm-200 border border-warm-600 hover:bg-white/[0.06] active:scale-[0.97] transition-all duration-200 rounded-lg',
      label: 'tracking-wider',
    },
  };

  const s = styles[variant] || styles.classic;

  // Standalone mode: self-trigger animation via whileInView
  // Nested mode: use variants to participate in parent stagger
  const motionProps = standalone
    ? {
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, margin: '-30px' },
        variants: fadeUp,
      }
    : {
        variants: fadeUp,
      };

  return (
    <motion.div
      {...motionProps}
      className={s.wrapper}
    >
      <button
        onClick={downloadICS}
        className={s.button}
      >
        <CalendarIcon />
        <span className={s.label}>
          {variant === 'kinetic' ? 'Save to Calendar' : '캘린더에 저장'}
        </span>
      </button>
    </motion.div>
  );
}
