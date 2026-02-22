export const weddingConfig = {
  date: '2026-05-23T11:00:00',
  groom: {
    name: '김민준',
    father: '김영수',
    mother: '박미경',
    fatherDeceased: false,
    motherDeceased: false,
  },
  bride: {
    name: '이서연',
    father: '이정호',
    mother: '최윤희',
    fatherDeceased: false,
    motherDeceased: false,
  },
  location: {
    name: '더채플앳청담',
    hall: '루체아홀 5층',
    address: '서울특별시 강남구 선릉로 158길 21',
    lat: 37.5247,
    lng: 127.0474,
    tel: '02-545-1234',
    mapUrl: '',
  },
  transportation: {
    subway: '지하철 수인분당선 선릉역 5번 출구 도보 7분\n지하철 7호선 청담역 10번 출구 도보 10분',
    bus: '간선: 140, 144, 301 / 지선: 3414, 4211\n청담사거리 하차',
    parking: '건물 내 지하주차장 3시간 무료 (B1~B3)\n주차 공간이 협소하니 대중교통을 이용해 주세요',
  },
  accounts: {
    groom: [
      { bank: '신한은행', number: '110-456-789012', holder: '김민준' },
      { bank: '국민은행', number: '940-25-0012-345', holder: '김영수' },
    ],
    bride: [
      { bank: '우리은행', number: '1002-567-890123', holder: '이서연' },
      { bank: '하나은행', number: '612-910234-56789', holder: '이정호' },
    ],
  },
  greeting: `서로 다른 길을 걸어온 두 사람이\n같은 곳을 바라보며 함께 걸어가려 합니다.\n\n살아가면서 소중한 것들을\n함께 나누며 살겠습니다.\n\n저희의 새로운 시작을\n축복해 주시면 감사하겠습니다.`,
  galleryImages: [
    '/images/gallery/KakaoTalk_20260222_013003435.jpg',
    '/images/gallery/KakaoTalk_20260222_013003435_01.jpg',
    '/images/gallery/KakaoTalk_20260222_013003435_02.jpg',
    '/images/gallery/KakaoTalk_20260222_013003435_03.jpg',
    '/images/gallery/KakaoTalk_20260222_013003435_04.jpg',
    '/images/gallery/KakaoTalk_20260222_013003435_06.jpg',
    '/images/gallery/KakaoTalk_20260222_013003435_07.jpg',
  ],
  bgm: '/music/bgm.mp3',
  kakao: {
    javascriptKey: '',
  },
};
