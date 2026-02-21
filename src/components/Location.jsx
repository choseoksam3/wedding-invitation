import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { weddingConfig } from '../config/wedding';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function Location() {
  const mapRef = useRef(null);
  const { location } = weddingConfig;

  useEffect(() => {
    if (!window.kakao?.maps || !mapRef.current) return;

    window.kakao.maps.load(() => {
      const position = new window.kakao.maps.LatLng(location.lat, location.lng);
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: position,
        level: 3,
      });
      new window.kakao.maps.Marker({ map, position });
    });
  }, [location.lat, location.lng]);

  const openNaverMap = () => {
    window.open(
      `https://map.naver.com/v5/search/${encodeURIComponent(location.name)}`,
      '_blank'
    );
  };

  const openKakaoMap = () => {
    window.open(
      `https://map.kakao.com/link/search/${encodeURIComponent(location.name)}`,
      '_blank'
    );
  };

  const openTMap = () => {
    window.open(
      `https://apis.openapi.sk.com/tmap/app/routes?appKey=&name=${encodeURIComponent(location.name)}&lon=${location.lng}&lat=${location.lat}`,
      '_blank'
    );
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(location.address);
      alert('주소가 복사되었습니다.');
    } catch {
      // 폴백
      const ta = document.createElement('textarea');
      ta.value = location.address;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('주소가 복사되었습니다.');
    }
  };

  return (
    <motion.section
      className="py-20 px-6 bg-warm-100/50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      <motion.h2
        variants={fadeInUp}
        className="font-serif text-center text-warm-600 text-lg mb-2 tracking-wider"
      >
        LOCATION
      </motion.h2>

      <motion.div variants={fadeInUp} className="text-center mb-6">
        <p className="font-serif text-warm-800 text-base font-bold">
          {location.name}
        </p>
        <p className="font-serif text-warm-500 text-sm mt-1">
          {location.hall}
        </p>
      </motion.div>

      {/* 카카오맵 */}
      <motion.div variants={fadeInUp} className="max-w-sm mx-auto mb-4">
        <div
          ref={mapRef}
          className="w-full h-56 rounded-xl overflow-hidden bg-warm-200"
        >
          {/* 카카오맵 SDK 미로드 시 fallback */}
          {!window.kakao?.maps && (
            <div className="w-full h-full flex items-center justify-center text-warm-400 font-serif text-sm">
              지도를 불러오는 중...
            </div>
          )}
        </div>
      </motion.div>

      {/* 주소 */}
      <motion.div variants={fadeInUp} className="text-center mb-6">
        <p className="text-warm-600 text-sm">{location.address}</p>
        {location.tel && (
          <p className="text-warm-400 text-xs mt-1">
            Tel. <a href={`tel:${location.tel}`} className="underline">{location.tel}</a>
          </p>
        )}
        <button
          onClick={copyAddress}
          className="mt-2 text-xs text-warm-500 border border-warm-300 rounded-full px-4 py-1.5 hover:bg-warm-200 transition-colors"
        >
          주소 복사
        </button>
      </motion.div>

      {/* 외부 지도앱 버튼 */}
      <motion.div variants={fadeInUp} className="flex justify-center gap-3 max-w-xs mx-auto">
        <button
          onClick={openNaverMap}
          className="flex-1 py-2.5 rounded-lg bg-[#2DB400] text-white text-xs font-medium"
        >
          네이버 지도
        </button>
        <button
          onClick={openKakaoMap}
          className="flex-1 py-2.5 rounded-lg bg-[#FEE500] text-[#3C1E1E] text-xs font-medium"
        >
          카카오맵
        </button>
        <button
          onClick={openTMap}
          className="flex-1 py-2.5 rounded-lg bg-[#EF4036] text-white text-xs font-medium"
        >
          티맵
        </button>
      </motion.div>
    </motion.section>
  );
}
