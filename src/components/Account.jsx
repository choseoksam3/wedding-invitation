import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { weddingConfig } from '../config/wedding';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

function AccountGroup({ title, accounts }) {
  const [open, setOpen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const copyAccount = async (account, idx) => {
    const text = `${account.bank} ${account.number} (${account.holder})`;
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
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="border border-warm-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-warm-50 transition-colors"
      >
        <span className="font-serif text-warm-700 text-sm">{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-warm-400 text-sm"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3">
              {accounts.map((acc, i) => (
                <div key={i} className="flex items-center justify-between bg-warm-50 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-warm-700 text-sm">
                      {acc.bank} {acc.number}
                    </p>
                    <p className="text-warm-400 text-xs mt-0.5">{acc.holder}</p>
                  </div>
                  <button
                    onClick={() => copyAccount(acc, i)}
                    className="text-xs text-warm-500 border border-warm-300 rounded-full px-3 py-1 hover:bg-warm-200 transition-colors shrink-0 ml-3"
                  >
                    {copiedIdx === i ? '복사됨' : '복사'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Account() {
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
        마음 전하실 곳
      </motion.h2>
      <motion.p
        variants={fadeInUp}
        className="font-serif text-center text-warm-400 text-xs mb-8"
      >
        축하의 마음을 전해주세요
      </motion.p>

      <motion.div variants={fadeInUp} className="max-w-sm mx-auto space-y-3">
        <AccountGroup title="신랑측 계좌" accounts={weddingConfig.accounts.groom} />
        <AccountGroup title="신부측 계좌" accounts={weddingConfig.accounts.bride} />
      </motion.div>
    </motion.section>
  );
}
