import { motion } from 'framer-motion';
import { weddingConfig } from '../config/wedding';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function Share() {
  const shareKakao = () => {
    if (!window.Kakao?.isInitialized()) {
      const key = weddingConfig.kakao.javascriptKey || import.meta.env.VITE_KAKAO_JS_KEY;
      if (!key) {
        alert('카카오 API 키가 설정되지 않았습니다.');
        return;
      }
      window.Kakao.init(key);
    }

    const date = new Date(weddingConfig.date);
    const formatted = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 오전 11시`;

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `${weddingConfig.groom.name} ♥ ${weddingConfig.bride.name} 결혼합니다`,
        description: `${formatted}\n${weddingConfig.location.name} ${weddingConfig.location.hall}`,
        imageUrl: '', // 대표 이미지 URL
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
      buttons: [
        {
          title: '청첩장 보기',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      ],
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다.');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('링크가 복사되었습니다.');
    }
  };

  return (
    <motion.section
      className="py-16 px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      <motion.h2
        variants={fadeInUp}
        className="font-serif text-center text-warm-600 text-lg mb-8 tracking-wider"
      >
        공유하기
      </motion.h2>

      <motion.div variants={fadeInUp} className="flex justify-center gap-4 max-w-xs mx-auto">
        <button
          onClick={shareKakao}
          className="flex flex-col items-center gap-2 px-6 py-4 bg-[#FEE500] rounded-xl hover:brightness-95 transition"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#3C1E1E">
            <path d="M12 3C6.5 3 2 6.58 2 11c0 2.83 1.82 5.32 4.59 6.75l-.96 3.57c-.09.33.28.6.56.41L10.17 19c.6.08 1.21.13 1.83.13 5.5 0 10-3.58 10-8S17.5 3 12 3z"/>
          </svg>
          <span className="text-[#3C1E1E] text-xs font-medium">카카오톡</span>
        </button>

        <button
          onClick={copyLink}
          className="flex flex-col items-center gap-2 px-6 py-4 bg-warm-200 rounded-xl hover:bg-warm-300 transition"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-600">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round"/>
          </svg>
          <span className="text-warm-600 text-xs font-medium">링크 복사</span>
        </button>
      </motion.div>
    </motion.section>
  );
}
