import { motion } from 'framer-motion';
import { useCountdown } from '../hooks/useCountdown';
import { weddingConfig } from '../config/wedding';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

function TimeBox({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-serif text-3xl text-warm-800 tabular-nums w-14 text-center">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-warm-400 text-xs mt-1 tracking-wider">{label}</span>
    </div>
  );
}

export default function Countdown() {
  const { days, hours, minutes, seconds, passed } = useCountdown(weddingConfig.date);
  const date = new Date(weddingConfig.date);

  // 달력 생성
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weddingDay = date.getDate();

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <motion.section
      className="py-20 px-8 bg-warm-100/50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      {/* 미니 달력 */}
      <motion.div variants={fadeInUp} className="max-w-xs mx-auto mb-12">
        <p className="font-serif text-center text-warm-600 text-lg mb-4">
          {year}년 {month + 1}월
        </p>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {dayNames.map((d) => (
            <div key={d} className={`font-serif text-xs py-1 ${d === '일' ? 'text-red-400' : d === '토' ? 'text-blue-400' : 'text-warm-400'}`}>
              {d}
            </div>
          ))}
          {cells.map((d, i) => (
            <div
              key={i}
              className={`py-1.5 text-sm rounded-full ${
                d === weddingDay
                  ? 'bg-warm-500 text-white font-bold'
                  : d
                  ? 'text-warm-700'
                  : ''
              }`}
            >
              {d || ''}
            </div>
          ))}
        </div>
      </motion.div>

      {/* 카운트다운 */}
      <motion.div variants={fadeInUp}>
        {passed ? (
          <p className="font-serif text-warm-500 text-center text-lg">
            우리의 새로운 시작을 축하해 주세요
          </p>
        ) : (
          <div className="flex justify-center gap-4">
            <TimeBox value={days} label="DAYS" />
            <span className="font-serif text-2xl text-warm-300 self-start mt-1">:</span>
            <TimeBox value={hours} label="HOURS" />
            <span className="font-serif text-2xl text-warm-300 self-start mt-1">:</span>
            <TimeBox value={minutes} label="MIN" />
            <span className="font-serif text-2xl text-warm-300 self-start mt-1">:</span>
            <TimeBox value={seconds} label="SEC" />
          </div>
        )}
      </motion.div>
    </motion.section>
  );
}
