import { motion } from 'framer-motion';
import { weddingConfig } from '../config/wedding';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

function InfoRow({ icon, title, desc }) {
  return (
    <div className="flex gap-3 text-left">
      <span className="text-lg mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="font-serif text-warm-700 text-sm font-bold">{title}</p>
        <p className="text-warm-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function Transportation() {
  const { transportation } = weddingConfig;

  return (
    <motion.section
      className="py-16 px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      <motion.h3
        variants={fadeInUp}
        className="font-serif text-center text-warm-600 text-base mb-8 tracking-wider"
      >
        교통 안내
      </motion.h3>

      <motion.div variants={fadeInUp} className="max-w-xs mx-auto space-y-5">
        {transportation.subway && (
          <InfoRow
            icon="🚇"
            title="지하철"
            desc={transportation.subway}
          />
        )}
        {transportation.bus && (
          <InfoRow
            icon="🚌"
            title="버스"
            desc={transportation.bus}
          />
        )}
        {transportation.parking && (
          <InfoRow
            icon="🅿️"
            title="주차"
            desc={transportation.parking}
          />
        )}
      </motion.div>
    </motion.section>
  );
}
