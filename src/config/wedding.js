export const weddingConfig = {
  date: '2026-05-23T11:00:00',
  groom: {
    name: '신랑이름',
    father: '아버지',
    mother: '어머니',
    fatherDeceased: false,
    motherDeceased: false,
  },
  bride: {
    name: '신부이름',
    father: '아버지',
    mother: '어머니',
    fatherDeceased: false,
    motherDeceased: false,
  },
  location: {
    name: '예식장명',
    hall: '홀명',
    address: '서울특별시 강남구 예식장로 123',
    lat: 37.5065,
    lng: 127.0536,
    tel: '02-000-0000',
    mapUrl: '', // 카카오맵 장소 URL (선택)
  },
  transportation: {
    subway: '지하철 2호선 OO역 3번 출구 도보 5분',
    bus: '간선버스: 140, 144 / 지선버스: 4211',
    parking: '건물 내 지하주차장 이용 가능 (2시간 무료)',
  },
  accounts: {
    groom: [
      { bank: '신한은행', number: '110-000-000000', holder: '신랑이름' },
      { bank: '국민은행', number: '000-00-0000-000', holder: '신랑아버지' },
    ],
    bride: [
      { bank: '우리은행', number: '1002-000-000000', holder: '신부이름' },
      { bank: '하나은행', number: '000-000000-00000', holder: '신부아버지' },
    ],
  },
  greeting: `서로 다른 길을 걸어온 두 사람이\n같은 곳을 바라보며 함께 걸어가려 합니다.\n\n저희의 새로운 시작을\n축복해 주시면 감사하겠습니다.`,
  galleryImages: [
    // '/images/photo1.jpg',
    // 나중에 실제 사진 경로 추가
  ],
  bgm: '/music/bgm.mp3',
  kakao: {
    javascriptKey: '', // 카카오 JavaScript 앱 키
  },
};
