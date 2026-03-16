import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { weddingConfig } from '../config/wedding';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function ShuttleBus() {
  const mapRef = useRef(null);
  const { shuttle } = weddingConfig.transportation;

  useEffect(() => {
    if (!shuttle || !window.kakao?.maps || !mapRef.current) return;

    window.kakao.maps.load(() => {
      const position = new window.kakao.maps.LatLng(shuttle.lat, shuttle.lng);
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: position,
        level: 4,
      });
      const marker = new window.kakao.maps.Marker({ map, position });

      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:4px 8px;font-size:12px;white-space:nowrap;">🚐 전세버스 탑승장소</div>`,
      });
      infowindow.open(map, marker);
    });
  }, [shuttle]);

  if (!shuttle) return null;

  const openNaverMap = () => {
    window.open(
      `https://map.naver.com/v5/search/${encodeURIComponent(shuttle.name)}`,
      '_blank'
    );
  };

  const openKakaoMap = () => {
    window.open(
      `https://map.kakao.com/link/search/${encodeURIComponent(shuttle.name)}`,
      '_blank'
    );
  };

  return (
    <motion.section
      className="py-16 px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      <motion.h3
        variants={fadeInUp}
        className="font-serif text-center text-warm-600 text-base mb-2 tracking-wider"
      >
        🚐 전세버스 안내
      </motion.h3>

      <motion.div variants={fadeInUp} className="text-center mb-6">
        <p className="text-warm-700 text-sm font-bold">오전 8:30 출발</p>
        <p className="text-warm-500 text-xs mt-1">{shuttle.name} 앞</p>
      </motion.div>

      <motion.div variants={fadeInUp} className="max-w-sm mx-auto mb-4">
        <div
          ref={mapRef}
          className="w-full h-48 rounded-xl overflow-hidden bg-warm-200"
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="text-center mb-5">
        <p className="text-warm-500 text-xs">{shuttle.address}</p>
      </motion.div>

      <motion.div variants={fadeInUp} className="flex justify-center gap-3 max-w-xs mx-auto">
        <button
          onClick={openNaverMap}
          className="flex-1 py-2 rounded-lg bg-[#2DB400] text-white text-xs font-medium"
        >
          네이버 지도
        </button>
        <button
          onClick={openKakaoMap}
          className="flex-1 py-2 rounded-lg bg-[#FEE500] text-[#3C1E1E] text-xs font-medium"
        >
          카카오맵
        </button>
      </motion.div>
    </motion.section>
  );
}
