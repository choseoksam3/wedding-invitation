import { useState } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function Rsvp() {
  const [form, setForm] = useState({
    name: '',
    side: 'groom', // groom or bride
    attendance: 'yes',
    guestCount: '1',
    meal: 'yes',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'rsvp'), {
        ...form,
        name: form.name.trim(),
        guestCount: parseInt(form.guestCount, 10),
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('RSVP 저장 실패:', err);
      alert('전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <motion.section
        className="py-20 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center max-w-sm mx-auto">
          <p className="font-serif text-warm-600 text-lg mb-2">감사합니다</p>
          <p className="font-serif text-warm-400 text-sm">참석 여부가 전달되었습니다.</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="py-20 px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      <motion.h2
        variants={fadeInUp}
        className="font-serif text-center text-warm-600 text-lg mb-2 tracking-wider"
      >
        참석 여부
      </motion.h2>
      <motion.p
        variants={fadeInUp}
        className="font-serif text-center text-warm-400 text-xs mb-8"
      >
        식사 준비를 위해 참석 여부를 알려주세요
      </motion.p>

      <motion.form
        variants={fadeInUp}
        onSubmit={handleSubmit}
        className="max-w-sm mx-auto space-y-5"
      >
        {/* 이름 */}
        <div>
          <label className="block text-warm-600 text-xs mb-1.5">이름</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="홍길동"
            maxLength={20}
            className="w-full px-4 py-2.5 text-sm bg-white border border-warm-200 rounded-lg focus:outline-none focus:border-warm-400"
          />
        </div>

        {/* 신랑/신부측 */}
        <div>
          <label className="block text-warm-600 text-xs mb-1.5">구분</label>
          <div className="flex gap-2">
            {[
              { value: 'groom', label: '신랑측' },
              { value: 'bride', label: '신부측' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange('side', opt.value)}
                className={`flex-1 py-2.5 text-sm rounded-lg border transition-colors ${
                  form.side === opt.value
                    ? 'bg-warm-500 text-white border-warm-500'
                    : 'bg-white text-warm-600 border-warm-200 hover:bg-warm-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 참석 여부 */}
        <div>
          <label className="block text-warm-600 text-xs mb-1.5">참석 여부</label>
          <div className="flex gap-2">
            {[
              { value: 'yes', label: '참석' },
              { value: 'no', label: '불참' },
              { value: 'maybe', label: '미정' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange('attendance', opt.value)}
                className={`flex-1 py-2.5 text-sm rounded-lg border transition-colors ${
                  form.attendance === opt.value
                    ? 'bg-warm-500 text-white border-warm-500'
                    : 'bg-white text-warm-600 border-warm-200 hover:bg-warm-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 동반 인원 */}
        {form.attendance === 'yes' && (
          <div>
            <label className="block text-warm-600 text-xs mb-1.5">동반 인원 (본인 포함)</label>
            <select
              value={form.guestCount}
              onChange={(e) => handleChange('guestCount', e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-white border border-warm-200 rounded-lg focus:outline-none focus:border-warm-400"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}명</option>
              ))}
            </select>
          </div>
        )}

        {/* 식사 여부 */}
        {form.attendance === 'yes' && (
          <div>
            <label className="block text-warm-600 text-xs mb-1.5">식사 여부</label>
            <div className="flex gap-2">
              {[
                { value: 'yes', label: '예정' },
                { value: 'no', label: '안 함' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange('meal', opt.value)}
                  className={`flex-1 py-2.5 text-sm rounded-lg border transition-colors ${
                    form.meal === opt.value
                      ? 'bg-warm-500 text-white border-warm-500'
                      : 'bg-white text-warm-600 border-warm-200 hover:bg-warm-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-warm-500 text-white text-sm rounded-lg hover:bg-warm-600 transition-colors disabled:opacity-50 font-medium"
        >
          {submitting ? '전송 중...' : '전송하기'}
        </button>
      </motion.form>
    </motion.section>
  );
}
