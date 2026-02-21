import { motion } from 'framer-motion';
import { weddingConfig } from '../config/wedding';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

function ParentName({ role, person }) {
  return (
    <span className="text-warm-700">
      {person.fatherDeceased ? (
        <span className="text-warm-400 line-through">{person.father}</span>
      ) : (
        person.father
      )}
      {' · '}
      {person.motherDeceased ? (
        <span className="text-warm-400 line-through">{person.mother}</span>
      ) : (
        person.mother
      )}
      <span className="text-warm-500 text-xs ml-1">의 {role}</span>
    </span>
  );
}

export default function Greeting() {
  return (
    <motion.section
      className="py-20 px-8 text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
    >
      {/* 장식 */}
      <motion.div variants={fadeInUp} className="mb-8">
        <span className="font-serif text-warm-300 text-3xl">❦</span>
      </motion.div>

      {/* 인사말 */}
      <motion.p
        variants={fadeInUp}
        className="font-serif text-warm-700 text-base leading-8 whitespace-pre-line max-w-xs mx-auto"
      >
        {weddingConfig.greeting}
      </motion.p>

      {/* 양가 부모님 */}
      <motion.div variants={fadeInUp} className="mt-12 space-y-3 font-serif text-sm">
        <p>
          <ParentName role="아들" person={weddingConfig.groom} />
          {' '}
          <span className="font-bold text-warm-800">{weddingConfig.groom.name}</span>
        </p>
        <p>
          <ParentName role="딸" person={weddingConfig.bride} />
          {' '}
          <span className="font-bold text-warm-800">{weddingConfig.bride.name}</span>
        </p>
      </motion.div>
    </motion.section>
  );
}
