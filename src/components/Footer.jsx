import { motion } from 'framer-motion';
import { weddingConfig } from '../config/wedding';

export default function Footer() {
  return (
    <motion.footer
      className="py-10 px-6 text-center bg-warm-100/50"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <p className="font-serif text-warm-400 text-sm">
        {weddingConfig.groom.name} & {weddingConfig.bride.name}
      </p>
      <p className="text-warm-300 text-xs mt-2">
        Made with love
      </p>
    </motion.footer>
  );
}
