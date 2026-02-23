/** Convert a base filename to { thumb, full, original } paths */
export function galleryPath(name) {
  return {
    thumb: `/images/gallery/thumb/${name}.webp`,
    full: `/images/gallery/full/${name}.webp`,
    original: `/images/gallery/${name}.jpg`,
  };
}

export const weddingConfig = {
  date: '2026-05-23T11:00:00',
  groom: {
    name: '조석삼',
    father: '조인수',
    mother: '지향자',
    fatherDeceased: false,
    motherDeceased: false,
  },
  bride: {
    name: '박수인',
    father: '박철홍',
    mother: '오지영',
    fatherDeceased: false,
    motherDeceased: false,
  },
  location: {
    name: '루벨 강동점',
    hall: '이스트센트럴타워 35~36F',
    address: '서울특별시 강동구 천호대로 1077',
    lat: 37.5365691,
    lng: 127.1322053,
    tel: '02-6956-0230',
    mapUrl: '',
  },
  transportation: {
    subway: '지하철 5호선 강동역 1번 출구 직결\n역에서 바로 연결되어 우천 시에도 편리합니다',
    bus: '간선: 340, 341, 370, 3313\n강동역 하차',
    parking: '이스트센트럴타워 지하주차장 (300대 수용)\n지하주차장에서 중앙 엘리베이터 이용',
  },
  accounts: {
    groom: [
      { bank: '신한은행', number: '110-456-789012', holder: '조석삼' },
      { bank: '국민은행', number: '940-25-0012-345', holder: '조인수' },
    ],
    bride: [
      { bank: '우리은행', number: '1002-567-890123', holder: '박수인' },
      { bank: '하나은행', number: '612-910234-56789', holder: '박철홍' },
    ],
  },
  greeting: `서로 다른 길을 걸어온 두 사람이\n같은 곳을 바라보며 함께 걸어가려 합니다.\n\n살아가면서 소중한 것들을\n함께 나누며 살겠습니다.\n\n저희의 새로운 시작을\n축복해 주시면 감사하겠습니다.`,
  galleryImages: [
    'KakaoTalk_20260222_013003435',
    'KakaoTalk_20260222_013003435_01',
    'KakaoTalk_20260222_013003435_02',
    'KakaoTalk_20260222_013003435_03',
    'KakaoTalk_20260222_013003435_04',
    'KakaoTalk_20260222_172057214_01',
    'KakaoTalk_20260222_172057214_02',
    'KakaoTalk_20260222_172057214_05',
    'KakaoTalk_20260222_172057214_06',
    'KakaoTalk_20260222_172057214_07',
    'KakaoTalk_20260222_172057214_08',
    'KakaoTalk_20260222_172057214_09',
    'KakaoTalk_20260222_172057214_10',
    'KakaoTalk_20260222_172057214_11',
    'KakaoTalk_20260222_172057214_12',
    'KakaoTalk_20260222_172057214_13',
    'KakaoTalk_20260222_172057214_14',
    'KakaoTalk_20260222_172057214_15',
    'KakaoTalk_20260222_172057214_16',
    'KakaoTalk_20260222_172057214_17',
    'KakaoTalk_20260222_172057214_18',
    'KakaoTalk_20260222_172057214_19',
    'KakaoTalk_20260222_172057214_20',
  ],
  bgm: '/music/bgm.mp3',
  kakao: {
    javascriptKey: '',
  },
};
