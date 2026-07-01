// Global error catcher for debugging without devtools (Ver 2.20)
window.onerror = function (message, source, lineno, colno, error) {
  if (typeof showToast === 'function') {
    showToast(`런타임 오류: ${message} (라인 ${lineno})`, 10000);
  } else {
    alert(`런타임 오류: ${message} (라인 ${lineno})`);
  }
  return false;
};

window.onunhandledrejection = function (event) {
  const msg = event.reason ? (event.reason.message || event.reason) : 'Unknown promise rejection';
  if (typeof showToast === 'function') {
    showToast(`비동기 오류: ${msg}`, 10000);
  } else {
    alert(`비동기 오류: ${msg}`);
  }
};

// LogiLog - Freight Driver Logbook App Logic (Ver 2.2)

// Administrative region data
const REGION_DATA = {
  "서울특별시": {
    "강남구": ["역삼동", "삼성동", "청담동", "개포동", "압구정동"],
    "송파구": ["잠실동", "가락동", "문정동", "신천동", "방이동"],
    "강서구": ["화곡동", "가양동", "등촌동", "방화동", "마곡동"],
    "서초구": ["서초동", "반포동", "방배동", "양재동", "우면동"],
    "마포구": ["공덕동", "아현동", "망원동", "합정동", "상암동"]
  },
  "경기도": {
    "수원시 장안구": ["율전동", "정자동", "천천동", "조원동"],
    "수원시 팔달구": ["인계동", "우만동", "지동", "화서동"],
    "평택시": ["포승읍", "안중읍", "고덕동", "비전동", "팽성읍"],
    "의왕시": ["삼동", "오전동", "내손동", "포일동"],
    "성남시 분당구": ["삼평동", "서현동", "야탑동", "정자동", "수내동"],
    "용인시 기흥구": ["신갈동", "구갈동", "기흥동", "보정동"],
    "김포시": ["통진읍", "고촌읍", "풍무동", "양촌읍"]
  },
  "인천광역시": {
    "중구": ["항동", "신흥동", "영종동", "운서동"],
    "서구": ["검암동", "청라동", "가좌동", "석남동"],
    "남동구": ["고잔동", "구월동", "간석동", "논현동"]
  },
  "부산광역시": {
    "남구": ["대연동", "용호동", "감만동", "우암동"],
    "강서구": ["신호동", "대저동", "녹산동", "지사동"],
    "해운대구": ["우동", "좌동", "중동", "재송동"],
    "사하구": ["신평동", "장림동", "하단동", "다대동"]
  },
  "경상남도": {
    "창원시 성산구": ["상남동", "중앙동", "신월동", "웅남동"],
    "김해시": ["진영읍", "장유동", "삼계동", "어방동"],
    "양산시": ["물금읍", "동면", "덕계동", "북정동"]
  },
  "충청남도": {
    "천안시 서북구": ["두정동", "백석동", "쌍용동", "성성동"],
    "아산시": ["배방읍", "탕정면", "둔포면", "온천동"],
    "당진시": ["송악읍", "신평면", "당진동"]
  },
  "충청북도": {
    "청주시 흥덕구": ["복대동", "가경동", "비하동", "송절동"],
    "충주시": ["칠금동", "연수동", "호암동"]
  },
  "대전광역시": {
    "유성구": ["봉명동", "궁동", "신성동", "관평동"],
    "대덕구": ["대화동", "신탄진동", "오정동"]
  },
  "대구광역시": {
    "북구": ["칠성동", "침산동", "태전동", "검단동"],
    "달서구": ["신당동", "상인동", "월성동", "이곡동"]
  },
  "울산광역시": {
    "남구": ["삼산동", "무거동", "신정동", "야음동"],
    "울주군": ["온산읍", "언양읍", "범서읍"]
  },
  "광주광역시": {
    "광산구": ["하남동", "수완동", "송정동", "신창동"],
    "서구": ["치평동", "풍암동", "화정동"]
  },
  "경상북도": {
    "포항시 남구": ["대송면", "오천읍", "제철동", "효자동"],
    "구미시": ["공단동", "원평동", "인동동", "옥계동"]
  },
  "전라남도": {
    "여수시": ["여천동", "신기동", "학동", "화치동"],
    "광양시": ["광양읍", "태인동", "금호동", "중동"]
  },
  "전북특별자치도": {
    "전주시 덕진구": ["여의동", "송천동", "우아동", "팔복동"],
    "군산시": ["소룡동", "경암동", "나운동"]
  },
  "강원특별자치도": {
    "원주시": ["우산동", "단계동", "무실동"],
    "강릉시": ["주문진읍", "교동", "포남동"]
  },
  "제주특별자치도": {
    "제주시": ["연동", "노형동", "아라동", "한림읍"],
    "서귀포시": ["대정읍", "동홍동", "성산읍"]
  }
};

// Geolocation Coordinates for distance calculations (haversine)
const REGION_COORDINATES = {
  "서울특별시 강남구": { lat: 37.4981, lon: 127.0276 },
  "서울특별시 송파구": { lat: 37.5145, lon: 127.1059 },
  "서울특별시 강서구": { lat: 37.5509, lon: 126.8495 },
  "서울특별시 서초구": { lat: 37.4837, lon: 127.0324 },
  "서울특별시 마포구": { lat: 37.5622, lon: 126.9083 },
  "경기도 수원시 장안구": { lat: 37.3013, lon: 127.0130 },
  "경기도 수원시 팔달구": { lat: 37.2824, lon: 127.0202 },
  "경기도 평택시": { lat: 36.9922, lon: 127.1128 },
  "경기도 의왕시": { lat: 37.3448, lon: 126.9682 },
  "경기도 성남시 분당구": { lat: 37.3827, lon: 127.1189 },
  "경기도 용인시 기흥구": { lat: 37.2804, lon: 127.1158 },
  "경기도 김포시": { lat: 37.6152, lon: 126.7156 },
  "인천광역시 중구": { lat: 37.4732, lon: 126.6216 },
  "인천광역시 서구": { lat: 37.5453, lon: 126.6760 },
  "인천광역시 남동구": { lat: 37.4471, lon: 126.7315 },
  "부산광역시 남구": { lat: 35.1365, lon: 129.0843 },
  "부산광역시 강서구": { lat: 35.1598, lon: 128.9806 },
  "부산광역시 해운대구": { lat: 35.1631, lon: 129.1636 },
  "부산광역시 사하구": { lat: 35.1044, lon: 128.9749 },
  "경상남도 창원시 성산구": { lat: 35.2217, lon: 128.6923 },
  "경상남도 김해시": { lat: 35.2285, lon: 128.8894 },
  "경상남도 양산시": { lat: 35.3349, lon: 129.0373 },
  "충청남도 천안시 서북구": { lat: 36.8151, lon: 127.1139 },
  "충청남도 아산시": { lat: 36.7898, lon: 127.0039 },
  "충청남도 당진시": { lat: 36.8992, lon: 126.6293 },
  "충청북도 청주시 흥덕구": { lat: 36.6356, lon: 127.4917 },
  "충청북도 충주시": { lat: 36.9910, lon: 127.9259 },
  "대전광역시 유성구": { lat: 36.3622, lon: 127.3564 },
  "대전광역시 대덕구": { lat: 36.3786, lon: 127.4239 },
  "대구광역시 북구": { lat: 35.8860, lon: 128.5830 },
  "대구광역시 달서구": { lat: 35.8299, lon: 128.5323 },
  "울산광역시 남구": { lat: 35.5441, lon: 129.3301 },
  "울산광역시 울주군": { lat: 35.5348, lon: 129.1539 },
  "광주광역시 광산구": { lat: 35.1623, lon: 126.7909 },
  "광주광역시 서구": { lat: 35.1520, lon: 126.8900 },
  "경상북도 포항시 남구": { lat: 36.0190, lon: 129.3435 },
  "경상북도 구미시": { lat: 36.1195, lon: 128.3443 },
  "전라남도 여수시": { lat: 34.7604, lon: 127.6622 },
  "전라남도 광양시": { lat: 34.9407, lon: 127.6959 },
  "전북특별자치도 전주시 덕진구": { lat: 35.8459, lon: 127.1213 },
  "전북특별자치도 군산시": { lat: 35.9676, lon: 126.7366 },
  "강원특별자치도 원주시": { lat: 37.3422, lon: 127.9201 },
  "강원특별자치도 강릉시": { lat: 37.7519, lon: 128.8761 },
  "제주특별자치도 제주시": { lat: 33.4996, lon: 126.5312 },
  "제주특별자치도 서귀포시": { lat: 33.2541, lon: 126.5601 }
};

// Initial settings and default values
const DEFAULT_SETTINGS = {
  oilInterval: 10000,
  tireInterval: 80000,
  brakeInterval: 40000,
  initialMileage: 120000
};

// Initial realistic dummy data for showcase (Updated with routeVias array and optional client)
const DUMMY_TRIPS = [
  {
    "id": "trip-6-22-16",
    "userId": "user",
    "startDate": "2026-06-22T11:00",
    "endDate": "2026-06-22T15:00",
    "client": "한진택배",
    "clientPhone": "010-2222-3333",
    "routeStart": "대구광역시 달서구 상인동",
    "routeLoad": "서울특별시 송파구 가락동",
    "routeVias": [],
    "routeUnload": "충청남도 천안시 서북구 두정동",
    "routeArrival": "",
    "distance": 304,
    "fee": 380000,
    "commission": 19000,
    "expenses": {
      "fuel": 64000,
      "toll": 19000,
      "meal": 8000,
      "other": 0
    },
    "expense": 91000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": ""
  },
  {
    "id": "trip-6-20-4",
    "userId": "user",
    "startDate": "2026-06-20T09:00",
    "endDate": "2026-06-20T12:30",
    "client": "(주)세방",
    "clientPhone": "02-3456-0011",
    "routeStart": "",
    "routeLoad": "경기도 수원시 팔달구 지동",
    "routeVias": [],
    "routeUnload": "서울특별시 서초구 서초동",
    "routeArrival": "",
    "distance": 22,
    "fee": 130000,
    "commission": 6000,
    "expenses": {
      "fuel": 12000,
      "toll": 3000,
      "meal": 8000,
      "other": 0
    },
    "expense": 23000,
    "isPaid": false,
    "paymentDueDate": "2026-07-17",
    "notes": "지게차 상하차 요망"
  },
  {
    "id": "trip-6-19-19",
    "userId": "user",
    "startDate": "2026-06-19T09:00",
    "endDate": "2026-06-19T11:30",
    "client": "(주)태영물류",
    "clientPhone": "031-456-7890",
    "routeStart": "대구광역시 달서구 상인동",
    "routeLoad": "경기도 수원시 팔달구 지동",
    "routeVias": [],
    "routeUnload": "부산광역시 남구 대연동",
    "routeArrival": "",
    "distance": 513,
    "fee": 620000,
    "commission": 31000,
    "expenses": {
      "fuel": 110000,
      "toll": 34000,
      "meal": 8000,
      "other": 5000
    },
    "expense": 157000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": ""
  },
  {
    "id": "trip-6-19-40",
    "userId": "user",
    "startDate": "2026-06-19T09:00",
    "endDate": "2026-06-19T15:30",
    "client": "(주)현대글로비스",
    "clientPhone": "010-8765-4321",
    "routeStart": "경상남도 양산시 물금읍",
    "routeLoad": "경기도 의왕시 삼동",
    "routeVias": [
      "울산광역시 울주군 온산읍"
    ],
    "routeUnload": "강원특별자치도 강릉시 교동",
    "routeArrival": "",
    "distance": 819,
    "fee": 920000,
    "commission": 46000,
    "expenses": {
      "fuel": 166000,
      "toll": 50000,
      "meal": 0,
      "other": 0
    },
    "expense": 216000,
    "isPaid": false,
    "paymentDueDate": "2026-07-09",
    "notes": ""
  },
  {
    "id": "trip-6-18-21",
    "userId": "user",
    "startDate": "2026-06-18T07:30",
    "endDate": "2026-06-18T13:00",
    "client": "천일정기화물",
    "clientPhone": "051-640-1000",
    "routeStart": "경상남도 양산시 물금읍",
    "routeLoad": "충청남도 아산시 배방읍",
    "routeVias": [],
    "routeUnload": "광주광역시 광산구 수완동",
    "routeArrival": "",
    "distance": 426,
    "fee": 530000,
    "commission": 26000,
    "expenses": {
      "fuel": 87000,
      "toll": 28000,
      "meal": 8000,
      "other": 0
    },
    "expense": 123000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "야간 안전 운행 요망"
  },
  {
    "id": "trip-6-17-36",
    "userId": "user",
    "startDate": "2026-06-17T11:00",
    "endDate": "2026-06-17T15:30",
    "client": "CJ대한통운",
    "clientPhone": "010-2468-1357",
    "routeStart": "대전광역시 유성구 봉명동",
    "routeLoad": "대구광역시 북구 침산동",
    "routeVias": [],
    "routeUnload": "전북특별자치도 전주시 덕진구 송천동",
    "routeArrival": "",
    "distance": 254,
    "fee": 360000,
    "commission": 18000,
    "expenses": {
      "fuel": 56000,
      "toll": 19000,
      "meal": 8000,
      "other": 0
    },
    "expense": 83000,
    "isPaid": false,
    "paymentDueDate": "2026-07-13",
    "notes": ""
  },
  {
    "id": "trip-6-11-17",
    "userId": "user",
    "startDate": "2026-06-11T10:00",
    "endDate": "2026-06-11T16:30",
    "client": "삼양통상",
    "clientPhone": "02-555-8888",
    "routeStart": "",
    "routeLoad": "경기도 수원시 팔달구 지동",
    "routeVias": [
      "충청북도 충주시 연수동",
      "강원특별자치도 원주시 단계동"
    ],
    "routeUnload": "경기도 평택시 포승읍",
    "routeArrival": "",
    "distance": 207,
    "fee": 310000,
    "commission": 15000,
    "expenses": {
      "fuel": 47000,
      "toll": 14000,
      "meal": 0,
      "other": 0
    },
    "expense": 61000,
    "isPaid": false,
    "paymentDueDate": "2026-06-18",
    "notes": ""
  },
  {
    "id": "trip-6-8-14",
    "userId": "user",
    "startDate": "2026-06-08T12:00",
    "endDate": "2026-06-08T17:00",
    "client": "(주)태영물류",
    "clientPhone": "031-456-7890",
    "routeStart": "",
    "routeLoad": "충청남도 당진시 송악읍",
    "routeVias": [],
    "routeUnload": "인천광역시 중구 항동",
    "routeArrival": "",
    "distance": 64,
    "fee": 160000,
    "commission": 8000,
    "expenses": {
      "fuel": 21000,
      "toll": 5000,
      "meal": 0,
      "other": 0
    },
    "expense": 26000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": ""
  },
  {
    "id": "trip-6-7-25",
    "userId": "user",
    "startDate": "2026-06-07T09:30",
    "endDate": "2026-06-07T13:00",
    "client": "한진택배",
    "clientPhone": "010-2222-3333",
    "routeStart": "",
    "routeLoad": "강원특별자치도 강릉시 교동",
    "routeVias": [],
    "routeUnload": "경상북도 포항시 남구 대송면",
    "routeArrival": "",
    "distance": 197,
    "fee": 300000,
    "commission": 15000,
    "expenses": {
      "fuel": 48000,
      "toll": 16000,
      "meal": 8000,
      "other": 0
    },
    "expense": 72000,
    "isPaid": false,
    "paymentDueDate": "2026-06-27",
    "notes": ""
  },
  {
    "id": "trip-6-6-35",
    "userId": "user",
    "startDate": "2026-06-06T13:00",
    "endDate": "2026-06-06T16:00",
    "client": "한진택배",
    "clientPhone": "010-2222-3333",
    "routeStart": "",
    "routeLoad": "경상남도 양산시 물금읍",
    "routeVias": [],
    "routeUnload": "대구광역시 북구 침산동",
    "routeArrival": "",
    "distance": 74,
    "fee": 160000,
    "commission": 8000,
    "expenses": {
      "fuel": 22000,
      "toll": 6000,
      "meal": 0,
      "other": 0
    },
    "expense": 28000,
    "isPaid": false,
    "paymentDueDate": "2026-06-22",
    "notes": ""
  },
  {
    "id": "trip-6-4-30",
    "userId": "user",
    "startDate": "2026-06-04T08:30",
    "endDate": "2026-06-04T12:00",
    "client": "천일정기화물",
    "clientPhone": "051-640-1000",
    "routeStart": "",
    "routeLoad": "경상북도 구미시 공단동",
    "routeVias": [],
    "routeUnload": "전북특별자치도 군산시 나운동",
    "routeArrival": "",
    "distance": 146,
    "fee": 250000,
    "commission": 12000,
    "expenses": {
      "fuel": 29000,
      "toll": 13000,
      "meal": 0,
      "other": 0
    },
    "expense": 42000,
    "isPaid": false,
    "paymentDueDate": "2026-06-20",
    "notes": "대기료 발생 건 포함"
  },
  {
    "id": "trip-6-3-12",
    "userId": "user",
    "startDate": "2026-06-03T11:00",
    "endDate": "2026-06-03T17:00",
    "client": "CJ대한통운",
    "clientPhone": "010-2468-1357",
    "routeStart": "전라남도 여수시 학동",
    "routeLoad": "충청남도 천안시 서북구 두정동",
    "routeVias": [],
    "routeUnload": "경상남도 김해시 삼계동",
    "routeArrival": "",
    "distance": 472,
    "fee": 570000,
    "commission": 28000,
    "expenses": {
      "fuel": 95000,
      "toll": 32000,
      "meal": 0,
      "other": 0
    },
    "expense": 127000,
    "isPaid": false,
    "paymentDueDate": "2026-06-13",
    "notes": "수령 확인서 수취 건"
  },
  {
    "id": "trip-6-2-39",
    "userId": "user",
    "startDate": "2026-06-02T12:00",
    "endDate": "2026-06-02T18:30",
    "client": "(주)세방",
    "clientPhone": "02-3456-0011",
    "routeStart": "",
    "routeLoad": "충청북도 충주시 연수동",
    "routeVias": [],
    "routeUnload": "인천광역시 중구 항동",
    "routeArrival": "부산광역시 해운대구 우동",
    "distance": 470,
    "fee": 570000,
    "commission": 28000,
    "expenses": {
      "fuel": 98000,
      "toll": 29000,
      "meal": 0,
      "other": 0
    },
    "expense": 127000,
    "isPaid": false,
    "paymentDueDate": "2026-06-20",
    "notes": "원자재 팰릿 이송 건"
  },
  {
    "id": "trip-6-1-24",
    "userId": "user",
    "startDate": "2026-06-01T12:00",
    "endDate": "2026-06-01T15:30",
    "client": "(주)태영물류",
    "clientPhone": "031-456-7890",
    "routeStart": "",
    "routeLoad": "경기도 김포시 통진읍",
    "routeVias": [],
    "routeUnload": "경기도 수원시 장안구 조원동",
    "routeArrival": "인천광역시 남동구 고잔동",
    "distance": 74,
    "fee": 180000,
    "commission": 9000,
    "expenses": {
      "fuel": 15000,
      "toll": 5000,
      "meal": 0,
      "other": 0
    },
    "expense": 20000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "원자재 팰릿 이송 건"
  },
  {
    "id": "trip-5-28-38",
    "userId": "user",
    "startDate": "2026-05-28T09:00",
    "endDate": "2026-05-28T13:00",
    "client": "한진택배",
    "clientPhone": "010-2222-3333",
    "routeStart": "",
    "routeLoad": "전북특별자치도 군산시 나운동",
    "routeVias": [],
    "routeUnload": "서울특별시 서초구 서초동",
    "routeArrival": "",
    "distance": 171,
    "fee": 270000,
    "commission": 13000,
    "expenses": {
      "fuel": 39000,
      "toll": 14000,
      "meal": 8000,
      "other": 5000
    },
    "expense": 66000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "컨테이너 화물 편도 운송"
  },
  {
    "id": "trip-5-27-26",
    "userId": "user",
    "startDate": "2026-05-27T09:00",
    "endDate": "2026-05-27T15:30",
    "client": "동방물류",
    "clientPhone": "051-600-1122",
    "routeStart": "",
    "routeLoad": "부산광역시 해운대구 우동",
    "routeVias": [],
    "routeUnload": "경기도 성남시 분당구 야탑동",
    "routeArrival": "",
    "distance": 307,
    "fee": 410000,
    "commission": 20000,
    "expenses": {
      "fuel": 62000,
      "toll": 18000,
      "meal": 8000,
      "other": 0
    },
    "expense": 88000,
    "isPaid": false,
    "paymentDueDate": "2026-06-05",
    "notes": "차고지 복귀 노선"
  },
  {
    "id": "trip-5-27-22",
    "userId": "user",
    "startDate": "2026-05-27T07:30",
    "endDate": "2026-05-27T14:00",
    "client": "(주)신라상사",
    "clientPhone": "051-789-1234",
    "routeStart": "울산광역시 울주군 온산읍",
    "routeLoad": "울산광역시 남구 삼산동",
    "routeVias": [],
    "routeUnload": "충청남도 아산시 배방읍",
    "routeArrival": "충청북도 청주시 흥덕구 복대동",
    "distance": 314,
    "fee": 410000,
    "commission": 20000,
    "expenses": {
      "fuel": 71000,
      "toll": 19000,
      "meal": 8000,
      "other": 0
    },
    "expense": 98000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "지게차 상하차 요망"
  },
  {
    "id": "trip-5-25-23",
    "userId": "user",
    "startDate": "2026-05-25T14:30",
    "endDate": "2026-05-25T16:30",
    "client": "한진택배",
    "clientPhone": "010-2222-3333",
    "routeStart": "인천광역시 중구 항동",
    "routeLoad": "경기도 수원시 팔달구 지동",
    "routeVias": [],
    "routeUnload": "서울특별시 송파구 가락동",
    "routeArrival": "",
    "distance": 68,
    "fee": 140000,
    "commission": 7000,
    "expenses": {
      "fuel": 20000,
      "toll": 7000,
      "meal": 0,
      "other": 5000
    },
    "expense": 32000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "대기료 발생 건 포함"
  },
  {
    "id": "trip-5-23-18",
    "userId": "user",
    "startDate": "2026-05-23T08:00",
    "endDate": "2026-05-23T10:30",
    "client": "삼양통상",
    "clientPhone": "02-555-8888",
    "routeStart": "부산광역시 남구 대연동",
    "routeLoad": "강원특별자치도 강릉시 교동",
    "routeVias": [],
    "routeUnload": "부산광역시 사하구 하단동",
    "routeArrival": "",
    "distance": 586,
    "fee": 680000,
    "commission": 34000,
    "expenses": {
      "fuel": 126000,
      "toll": 35000,
      "meal": 8000,
      "other": 5000
    },
    "expense": 174000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "컨테이너 화물 편도 운송"
  },
  {
    "id": "trip-5-22-37",
    "userId": "user",
    "startDate": "2026-05-22T12:00",
    "endDate": "2026-05-22T15:00",
    "client": "동방물류",
    "clientPhone": "051-600-1122",
    "routeStart": "대구광역시 달서구 상인동",
    "routeLoad": "인천광역시 남동구 고잔동",
    "routeVias": [],
    "routeUnload": "충청남도 당진시 송악읍",
    "routeArrival": "",
    "distance": 303,
    "fee": 380000,
    "commission": 19000,
    "expenses": {
      "fuel": 67000,
      "toll": 18000,
      "meal": 0,
      "other": 0
    },
    "expense": 85000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "야간 안전 운행 요망"
  },
  {
    "id": "trip-5-22-10",
    "userId": "user",
    "startDate": "2026-05-22T07:30",
    "endDate": "2026-05-22T11:30",
    "client": "동방물류",
    "clientPhone": "051-600-1122",
    "routeStart": "",
    "routeLoad": "대전광역시 유성구 봉명동",
    "routeVias": [],
    "routeUnload": "대구광역시 달서구 상인동",
    "routeArrival": "",
    "distance": 121,
    "fee": 210000,
    "commission": 10000,
    "expenses": {
      "fuel": 27000,
      "toll": 10000,
      "meal": 0,
      "other": 0
    },
    "expense": 37000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "야간 안전 운행 요망"
  },
  {
    "id": "trip-5-21-6",
    "userId": "user",
    "startDate": "2026-05-21T07:00",
    "endDate": "2026-05-21T10:30",
    "client": "(주)신라상사",
    "clientPhone": "051-789-1234",
    "routeStart": "서울특별시 송파구 가락동",
    "routeLoad": "울산광역시 울주군 온산읍",
    "routeVias": [],
    "routeUnload": "경기도 수원시 장안구 조원동",
    "routeArrival": "",
    "distance": 560,
    "fee": 650000,
    "commission": 32000,
    "expenses": {
      "fuel": 112000,
      "toll": 35000,
      "meal": 0,
      "other": 5000
    },
    "expense": 152000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "정시 납품 요망"
  },
  {
    "id": "trip-5-17-11",
    "userId": "user",
    "startDate": "2026-05-17T11:30",
    "endDate": "2026-05-17T17:30",
    "client": "천일정기화물",
    "clientPhone": "051-640-1000",
    "routeStart": "",
    "routeLoad": "부산광역시 해운대구 우동",
    "routeVias": [],
    "routeUnload": "경기도 김포시 통진읍",
    "routeArrival": "",
    "distance": 350,
    "fee": 450000,
    "commission": 22000,
    "expenses": {
      "fuel": 75000,
      "toll": 22000,
      "meal": 0,
      "other": 5000
    },
    "expense": 102000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "부품 정기 물류"
  },
  {
    "id": "trip-5-17-2",
    "userId": "user",
    "startDate": "2026-05-17T10:30",
    "endDate": "2026-05-17T16:30",
    "client": "CJ대한통운",
    "clientPhone": "010-2468-1357",
    "routeStart": "인천광역시 서구 석남동",
    "routeLoad": "경기도 수원시 팔달구 지동",
    "routeVias": [],
    "routeUnload": "서울특별시 송파구 가락동",
    "routeArrival": "",
    "distance": 69,
    "fee": 150000,
    "commission": 7000,
    "expenses": {
      "fuel": 15000,
      "toll": 8000,
      "meal": 0,
      "other": 0
    },
    "expense": 23000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "공차 복귀"
  },
  {
    "id": "trip-5-17-9",
    "userId": "user",
    "startDate": "2026-05-17T09:00",
    "endDate": "2026-05-17T12:00",
    "client": "(주)한라물류",
    "clientPhone": "010-1234-5678",
    "routeStart": "",
    "routeLoad": "인천광역시 중구 항동",
    "routeVias": [],
    "routeUnload": "경상남도 김해시 삼계동",
    "routeArrival": "경기도 평택시 포승읍",
    "distance": 575,
    "fee": 650000,
    "commission": 32000,
    "expenses": {
      "fuel": 123000,
      "toll": 36000,
      "meal": 8000,
      "other": 0
    },
    "expense": 167000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "대기료 발생 건 포함"
  },
  {
    "id": "trip-5-16-32",
    "userId": "user",
    "startDate": "2026-05-16T13:00",
    "endDate": "2026-05-16T16:30",
    "client": "동방물류",
    "clientPhone": "051-600-1122",
    "routeStart": "서울특별시 서초구 서초동",
    "routeLoad": "충청남도 당진시 송악읍",
    "routeVias": [],
    "routeUnload": "인천광역시 서구 석남동",
    "routeArrival": "경상북도 구미시 공단동",
    "distance": 363,
    "fee": 460000,
    "commission": 23000,
    "expenses": {
      "fuel": 74000,
      "toll": 23000,
      "meal": 0,
      "other": 0
    },
    "expense": 97000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": ""
  },
  {
    "id": "trip-5-16-31",
    "userId": "user",
    "startDate": "2026-05-16T12:00",
    "endDate": "2026-05-16T18:30",
    "client": "CJ대한통운",
    "clientPhone": "010-2468-1357",
    "routeStart": "",
    "routeLoad": "대구광역시 달서구 상인동",
    "routeVias": [],
    "routeUnload": "충청남도 당진시 송악읍",
    "routeArrival": "인천광역시 서구 석남동",
    "distance": 280,
    "fee": 360000,
    "commission": 18000,
    "expenses": {
      "fuel": 64000,
      "toll": 19000,
      "meal": 0,
      "other": 0
    },
    "expense": 83000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": ""
  },
  {
    "id": "trip-5-15-34",
    "userId": "user",
    "startDate": "2026-05-15T09:30",
    "endDate": "2026-05-15T12:00",
    "client": "(주)태영물류",
    "clientPhone": "031-456-7890",
    "routeStart": "",
    "routeLoad": "인천광역시 중구 항동",
    "routeVias": [],
    "routeUnload": "부산광역시 강서구 신호동",
    "routeArrival": "경기도 김포시 통진읍",
    "distance": 673,
    "fee": 770000,
    "commission": 38000,
    "expenses": {
      "fuel": 135000,
      "toll": 43000,
      "meal": 0,
      "other": 0
    },
    "expense": 178000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": ""
  },
  {
    "id": "trip-5-14-7",
    "userId": "user",
    "startDate": "2026-05-14T10:00",
    "endDate": "2026-05-14T16:00",
    "client": "CJ대한통운",
    "clientPhone": "010-2468-1357",
    "routeStart": "",
    "routeLoad": "강원특별자치도 원주시 단계동",
    "routeVias": [],
    "routeUnload": "충청북도 청주시 흥덕구 복대동",
    "routeArrival": "",
    "distance": 87,
    "fee": 170000,
    "commission": 8000,
    "expenses": {
      "fuel": 18000,
      "toll": 9000,
      "meal": 8000,
      "other": 5000
    },
    "expense": 40000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "정시 납품 요망"
  },
  {
    "id": "trip-5-13-1",
    "userId": "user",
    "startDate": "2026-05-13T13:00",
    "endDate": "2026-05-13T19:30",
    "client": "동방물류",
    "clientPhone": "051-600-1122",
    "routeStart": "",
    "routeLoad": "울산광역시 울주군 온산읍",
    "routeVias": [],
    "routeUnload": "경기도 의왕시 삼동",
    "routeArrival": "",
    "distance": 281,
    "fee": 380000,
    "commission": 19000,
    "expenses": {
      "fuel": 59000,
      "toll": 17000,
      "meal": 0,
      "other": 0
    },
    "expense": 76000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "원자재 팰릿 이송 건"
  },
  {
    "id": "trip-5-13-8",
    "userId": "user",
    "startDate": "2026-05-13T12:00",
    "endDate": "2026-05-13T14:00",
    "client": "동방물류",
    "clientPhone": "051-600-1122",
    "routeStart": "전북특별자치도 군산시 나운동",
    "routeLoad": "부산광역시 해운대구 우동",
    "routeVias": [],
    "routeUnload": "인천광역시 중구 항동",
    "routeArrival": "",
    "distance": 580,
    "fee": 690000,
    "commission": 34000,
    "expenses": {
      "fuel": 117000,
      "toll": 35000,
      "meal": 0,
      "other": 0
    },
    "expense": 152000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": ""
  },
  {
    "id": "trip-5-12-15",
    "userId": "user",
    "startDate": "2026-05-12T09:30",
    "endDate": "2026-05-12T13:30",
    "client": "천일정기화물",
    "clientPhone": "051-640-1000",
    "routeStart": "",
    "routeLoad": "서울특별시 송파구 가락동",
    "routeVias": [],
    "routeUnload": "전라남도 광양시 금호동",
    "routeArrival": "",
    "distance": 291,
    "fee": 400000,
    "commission": 20000,
    "expenses": {
      "fuel": 63000,
      "toll": 19000,
      "meal": 8000,
      "other": 0
    },
    "expense": 90000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "정시 납품 요망"
  },
  {
    "id": "trip-5-11-28",
    "userId": "user",
    "startDate": "2026-05-11T12:00",
    "endDate": "2026-05-11T14:00",
    "client": "동방물류",
    "clientPhone": "051-600-1122",
    "routeStart": "",
    "routeLoad": "서울특별시 서초구 서초동",
    "routeVias": [],
    "routeUnload": "전라남도 광양시 금호동",
    "routeArrival": "",
    "distance": 289,
    "fee": 360000,
    "commission": 18000,
    "expenses": {
      "fuel": 58000,
      "toll": 17000,
      "meal": 0,
      "other": 0
    },
    "expense": 75000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "원자재 팰릿 이송 건"
  },
  {
    "id": "trip-5-11-20",
    "userId": "user",
    "startDate": "2026-05-11T07:30",
    "endDate": "2026-05-11T10:30",
    "client": "CJ대한통운",
    "clientPhone": "010-2468-1357",
    "routeStart": "충청남도 천안시 서북구 두정동",
    "routeLoad": "서울특별시 송파구 가락동",
    "routeVias": [],
    "routeUnload": "경기도 평택시 포승읍",
    "routeArrival": "",
    "distance": 136,
    "fee": 210000,
    "commission": 10000,
    "expenses": {
      "fuel": 34000,
      "toll": 11000,
      "meal": 8000,
      "other": 0
    },
    "expense": 53000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": "차고지 복귀 노선"
  },
  {
    "id": "trip-5-8-33",
    "userId": "user",
    "startDate": "2026-05-08T12:30",
    "endDate": "2026-05-08T17:00",
    "client": "(주)신라상사",
    "clientPhone": "051-789-1234",
    "routeStart": "",
    "routeLoad": "인천광역시 서구 석남동",
    "routeVias": [
      "전북특별자치도 군산시 나운동",
      "인천광역시 중구 항동"
    ],
    "routeUnload": "경기도 의왕시 삼동",
    "routeArrival": "대전광역시 유성구 봉명동",
    "distance": 493,
    "fee": 590000,
    "commission": 29000,
    "expenses": {
      "fuel": 102000,
      "toll": 32000,
      "meal": 8000,
      "other": 0
    },
    "expense": 142000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": ""
  },
  {
    "id": "trip-5-7-27",
    "userId": "user",
    "startDate": "2026-05-07T14:00",
    "endDate": "2026-05-07T17:30",
    "client": "(주)한라물류",
    "clientPhone": "010-1234-5678",
    "routeStart": "전라남도 광양시 금호동",
    "routeLoad": "충청남도 천안시 서북구 두정동",
    "routeVias": [],
    "routeUnload": "대전광역시 대덕구 대화동",
    "routeArrival": "",
    "distance": 271,
    "fee": 370000,
    "commission": 18000,
    "expenses": {
      "fuel": 55000,
      "toll": 17000,
      "meal": 8000,
      "other": 5000
    },
    "expense": 85000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": ""
  },
  {
    "id": "trip-5-7-29",
    "userId": "user",
    "startDate": "2026-05-07T13:00",
    "endDate": "2026-05-07T15:00",
    "client": "(주)신라상사",
    "clientPhone": "051-789-1234",
    "routeStart": "충청남도 당진시 송악읍",
    "routeLoad": "충청북도 충주시 연수동",
    "routeVias": [],
    "routeUnload": "경상북도 포항시 남구 대송면",
    "routeArrival": "대전광역시 대덕구 대화동",
    "distance": 460,
    "fee": 560000,
    "commission": 28000,
    "expenses": {
      "fuel": 96000,
      "toll": 28000,
      "meal": 8000,
      "other": 0
    },
    "expense": 132000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": ""
  },
  {
    "id": "trip-5-7-3",
    "userId": "user",
    "startDate": "2026-05-07T08:00",
    "endDate": "2026-05-07T10:00",
    "client": "동방물류",
    "clientPhone": "051-600-1122",
    "routeStart": "",
    "routeLoad": "대구광역시 북구 침산동",
    "routeVias": [],
    "routeUnload": "대전광역시 유성구 봉명동",
    "routeArrival": "",
    "distance": 122,
    "fee": 210000,
    "commission": 10000,
    "expenses": {
      "fuel": 28000,
      "toll": 7000,
      "meal": 8000,
      "other": 0
    },
    "expense": 43000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": ""
  },
  {
    "id": "trip-5-5-5",
    "userId": "user",
    "startDate": "2026-05-05T14:30",
    "endDate": "2026-05-05T20:30",
    "client": "(주)태영물류",
    "clientPhone": "031-456-7890",
    "routeStart": "경상남도 창원시 성산구 중앙동",
    "routeLoad": "경기도 수원시 팔달구 지동",
    "routeVias": [],
    "routeUnload": "인천광역시 서구 석남동",
    "routeArrival": "",
    "distance": 316,
    "fee": 390000,
    "commission": 19000,
    "expenses": {
      "fuel": 63000,
      "toll": 22000,
      "meal": 0,
      "other": 0
    },
    "expense": 85000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": ""
  },
  {
    "id": "trip-5-2-13",
    "userId": "user",
    "startDate": "2026-05-02T14:00",
    "endDate": "2026-05-02T18:00",
    "client": "천일정기화물",
    "clientPhone": "051-640-1000",
    "routeStart": "",
    "routeLoad": "경기도 김포시 통진읍",
    "routeVias": [],
    "routeUnload": "전북특별자치도 군산시 나운동",
    "routeArrival": "광주광역시 서구 치평동",
    "distance": 275,
    "fee": 360000,
    "commission": 18000,
    "expenses": {
      "fuel": 64000,
      "toll": 17000,
      "meal": 8000,
      "other": 0
    },
    "expense": 89000,
    "isPaid": true,
    "paymentDueDate": "",
    "notes": ""
  }
];

const DUMMY_CLIENTS = [
  {
    "id": "client-1",
    "userId": "user",
    "name": "(주)한라물류",
    "phone": "010-1234-5678",
    "manager": "김철수 부장",
    "notes": "매월 말일 정산"
  },
  {
    "id": "client-2",
    "userId": "user",
    "name": "(주)신라상사",
    "phone": "051-789-1234",
    "manager": "이영희 과장",
    "notes": "익월 10일 결제"
  },
  {
    "id": "client-3",
    "userId": "user",
    "name": "삼양통상",
    "phone": "02-555-8888",
    "manager": "박민수 대리",
    "notes": "즉시 현금 결제"
  },
  {
    "id": "client-4",
    "userId": "user",
    "name": "(주)현대글로비스",
    "phone": "010-8765-4321",
    "manager": "최동식 차장",
    "notes": "마감 후 30일 이내"
  },
  {
    "id": "client-5",
    "userId": "user",
    "name": "CJ대한통운",
    "phone": "010-2468-1357",
    "manager": "정선우 대리",
    "notes": "매월 25일 지급"
  },
  {
    "id": "client-6",
    "userId": "user",
    "name": "(주)태영물류",
    "phone": "031-456-7890",
    "manager": "한태양 대표",
    "notes": "익월 말 결제"
  },
  {
    "id": "client-7",
    "userId": "user",
    "name": "동방물류",
    "phone": "051-600-1122",
    "manager": "송재호 과장",
    "notes": "운행 후 3일 이내"
  },
  {
    "id": "client-8",
    "userId": "user",
    "name": "(주)세방",
    "phone": "02-3456-0011",
    "manager": "윤성민 부장",
    "notes": "카드 결제"
  },
  {
    "id": "client-9",
    "userId": "user",
    "name": "한진택배",
    "phone": "010-2222-3333",
    "manager": "강하늘 주임",
    "notes": "계산서 발행 후 지급"
  },
  {
    "id": "client-10",
    "userId": "user",
    "name": "천일정기화물",
    "phone": "051-640-1000",
    "manager": "임재덕 차장",
    "notes": "운송완료 즉시 송금"
  }
];

// App State
let appState = {
  currentUser: null, // Ver 2.17 Current Logged In User
  users: [],         // Ver 2.17 Users Database
  trips: [],
  clients: [], // Ver 2.16 Client Database
  expenses: [], // Ver 2.18 Expenses Database
  expenseTypeFilter: 'all', // Ver 2.18 Filter by type ('all', 'fixed', 'variable')
  settings: { ...DEFAULT_SETTINGS },
  theme: "light",
  currentDashboardPeriod: "week",
  currentTripsPeriod: "all",
  tripsSortOrder: "desc",
  tripsUnpaidOnly: false,
  tripsActiveTab: "all", // Ver 2.15 segment tabs: 'all', 'unpaid', 'calendar'
  calendarYear: new Date().getFullYear(), // Ver 2.15 calendar year
  calendarMonth: new Date().getMonth() + 1, // Ver 2.15 calendar month (1-indexed)
  calendarSelectedDate: getLocalDateString(), // Selected date in calendar view
  dashboardCustomRange: { start: null, end: null },
  tripsCustomRange: { start: null, end: null },
  customPeriodTarget: "dashboard",
  dashboardCustomLabel: "",
  unpaidPeriod: "all",
  unpaidSortOrder: "desc",
  unpaidCustomRange: { start: null, end: null },
  tracker: {
    step: 0,
    demoMode: false,
    startTime: null,
    departureLocation: "",
    startLocation: "",
    endLocation: "",
    arrivalLocation: "",
    routeVias: [],
    viaTimes: [],
    viaCompleteTimes: [],
    stepTimes: [null, null, null, null, null, null, null],
    stepTimestamps: [null, null, null, null, null, null, null],
    viaTimestamps: [],
    viaCompleteTimestamps: []
  }
};

// Picker State
let pickerState = {
  targetField: 'start',
  selectedSido: '',
  selectedSigungu: '',
  selectedDong: ''
};

// ----------------------------------------------------
// INITIALIZATION & SUPABASE SYNC (Ver 2.19)
// ----------------------------------------------------
let supabaseClient = null;

async function initSupabase() {
  const statusEl = document.getElementById("db-connection-status");
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    if (config.supabaseUrl && config.supabaseKey && window.supabase) {
      supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
      console.log("Supabase client initialized successfully!");
      if (statusEl) {
        statusEl.style.color = "var(--color-success)";
        statusEl.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--color-success); display: inline-block; box-shadow: 0 0 8px var(--color-success);"></span> 데이터베이스 온라인 연동 완료';
      }
    } else {
      console.log("Supabase keys not found in config or SDK missing. Running in LocalStorage-only fallback mode.");
      if (statusEl) {
        statusEl.style.color = "var(--color-warning)";
        statusEl.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--color-warning); display: inline-block;"></span> 로컬 저장소 모드 (Vercel 환경 변수 미등록)';
      }
    }
  } catch (error) {
    console.error("Failed to load Supabase config. Running in LocalStorage-only fallback mode:", error);
    if (statusEl) {
      statusEl.style.color = "var(--color-danger)";
      statusEl.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--color-danger); display: inline-block;"></span> 연동 실패: ${error.message || error}`;
    }
  }
}

async function syncAllToSupabase() {
  if (!supabaseClient || !appState.currentUser || !appState.currentUser.uid) return;
  
  // 0. Skip sync if offline to avoid useless error messages
  if (navigator.onLine === false) {
    console.log("Device is offline. Skipping data sync to Supabase.");
    return;
  }

  const uid = appState.currentUser.uid;
  const syncErrors = [];
  
  // 1. Sync Trips
  try {
    const tripsToSync = appState.trips
      .filter(t => t.userId === appState.currentUser.username)
      .map(t => ({
        id: t.id,
        user_id: uid,
        client_name: t.client,
        client_phone: t.clientPhone,
        fee: t.fee,
        commission: t.commission,
        distance: t.distance,
        start_date: t.startDate,
        end_date: t.endDate,
        payment_date: t.paymentDate,
        payment_due_date: t.paymentDueDate,
        is_paid: t.isPaid,
        route_start: t.routeStart,
        route_load: t.routeLoad,
        route_vias: t.routeVias || [],
        route_unload: t.routeUnload,
        route_arrival: t.routeArrival,
        notes: t.notes,
        expenses: t.expenses || {}
      }));
    if (tripsToSync.length > 0) {
      const { error } = await supabaseClient.from('trips').upsert(tripsToSync);
      if (error) throw error;
    }
  } catch (err) {
    console.error("Failed to sync trips to Supabase:", err);
    syncErrors.push("운행기록");
  }
  
  // 2. Sync Clients
  try {
    const clientsToSync = appState.clients
      .filter(c => c.userId === appState.currentUser.username)
      .map(c => ({
        id: c.id,
        user_id: uid,
        name: c.name,
        phone: c.phone
      }));
    if (clientsToSync.length > 0) {
      const { error } = await supabaseClient.from('clients').upsert(clientsToSync);
      if (error) throw error;
    }
  } catch (err) {
    console.error("Failed to sync clients to Supabase:", err);
    syncErrors.push("거래처");
  }
  
  // 3. Sync Expenses
  try {
    const expensesToSync = appState.expenses
      .filter(e => e.userId === appState.currentUser.username)
      .map(e => ({
        id: e.id,
        user_id: uid,
        date: e.date,
        type: e.type,
        category: e.category,
        title: e.title,
        amount: e.amount,
        notes: e.notes
      }));
    if (expensesToSync.length > 0) {
      const { error } = await supabaseClient.from('expenses').upsert(expensesToSync);
      if (error) throw error;
    }
  } catch (err) {
    console.error("Failed to sync expenses to Supabase:", err);
    syncErrors.push("경비");
  }
  
  // 4. Sync Settings
  try {
    const { error } = await supabaseClient.from('settings').upsert({
      user_id: uid,
      owner_name: appState.settings.ownerName || appState.currentUser.name || "사용자",
      theme: appState.theme
    });
    if (error) throw error;
  } catch (err) {
    console.error("Failed to sync settings to Supabase:", err);
    syncErrors.push("설정");
  }
  
  // 5. Sync Tracker
  try {
    const { error } = await supabaseClient.from('trackers').upsert({
      user_id: uid,
      step: String(appState.tracker.step),
      start_time: appState.tracker.startTime,
      via_complete_times: appState.tracker.viaCompleteTimes,
      via_times: appState.tracker.viaTimes,
      route_start: appState.tracker.departureLocation,
      route_load: appState.tracker.startLocation,
      route_vias: appState.tracker.routeVias || [],
      route_unload: appState.tracker.endLocation,
      route_arrival: appState.tracker.arrivalLocation,
      distance: appState.tracker.distance || 0
    });
    if (error) throw error;
  } catch (err) {
    console.error("Failed to sync trackers to Supabase:", err);
    syncErrors.push("기록기");
  }
  
  if (syncErrors.length > 0) {
    showToast(`일부 데이터 동기화 실패 (${syncErrors.join(", ")})`);
  } else {
    console.log("Supabase data sync process completed successfully.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await initSupabase();
  
  // 1. Optimistic UI: Load local data instantly
  loadLocalData();
  
  initTheme();
  initNavigation();
  initDashboardFilters();
  initForms();
  initSettingsForm();
  initTracker();
  
  document.getElementById("trip-distance").addEventListener("input", () => {
    document.getElementById("distance-calc-indicator").style.display = "none";
  });
  
  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registered successfully:', reg.scope))
        .catch(err => console.error('Service Worker registration failed:', err));
    });
  }
  
  // Initial UI Render (Instant)
  updateUI();
  lucide.createIcons();
  
  // 2. Background Sync: Fetch fresh data from Supabase in parallel
  loadSupabaseData();
});

async function loadSupabaseData() {
  if (supabaseClient) {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          appState.currentUser = {
            username: profile.email.split('@')[0],
            email: profile.email,
            uid: profile.id,
            role: profile.role,
            name: profile.display_name || '사용자',
            phone: ''
          };
          
          if (profile.role === 'admin') {
            const [
              { data: allProfiles },
              { data: allTrips }
            ] = await Promise.all([
              supabaseClient.from('profiles').select('*'),
              supabaseClient.from('trips').select('*')
            ]);
            
            if (allProfiles) {
              appState.users = allProfiles.map(p => ({
                username: p.email.split('@')[0],
                role: p.role,
                name: p.display_name || '사용자',
                phone: ''
              }));
            }
            if (allTrips) {
              appState.trips = allTrips.map(row => {
                const owner = allProfiles ? allProfiles.find(p => p.id === row.user_id) : null;
                const ownerUsername = owner ? owner.email.split('@')[0] : 'unknown';
                return {
                  id: row.id,
                  userId: ownerUsername,
                  client: row.client_name,
                  clientPhone: row.client_phone,
                  fee: Number(row.fee),
                  commission: Number(row.commission),
                  distance: Number(row.distance),
                  startDate: row.start_date,
                  endDate: row.end_date,
                  paymentDate: row.payment_date,
                  paymentDueDate: row.payment_due_date,
                  isPaid: row.is_paid,
                  routeStart: row.route_start,
                  routeLoad: row.route_load,
                  routeVias: row.route_vias || [],
                  routeUnload: row.route_unload,
                  routeArrival: row.route_arrival,
                  notes: row.notes,
                  expenses: row.expenses || {}
                };
              });
            }
          } else {
            // Parallelize Supabase requests
            const [
              { data: dbTrips, error: tripsErr },
              { data: dbClients },
              { data: dbExpenses },
              { data: dbSettings },
              { data: dbTracker }
            ] = await Promise.all([
              supabaseClient.from('trips').select('*').eq('user_id', profile.id),
              supabaseClient.from('clients').select('*').eq('user_id', profile.id),
              supabaseClient.from('expenses').select('*').eq('user_id', profile.id),
              supabaseClient.from('settings').select('*').eq('user_id', profile.id).maybeSingle(),
              supabaseClient.from('trackers').select('*').eq('user_id', profile.id).maybeSingle()
            ]);
              
            if (!tripsErr && dbTrips) {
              appState.trips = dbTrips.map(row => ({
                id: row.id,
                userId: appState.currentUser.username,
                client: row.client_name,
                clientPhone: row.client_phone,
                fee: Number(row.fee),
                commission: Number(row.commission),
                distance: Number(row.distance),
                startDate: row.start_date,
                endDate: row.end_date,
                paymentDate: row.payment_date,
                paymentDueDate: row.payment_due_date,
                isPaid: row.is_paid,
                routeStart: row.route_start,
                routeLoad: row.route_load,
                routeVias: row.route_vias || [],
                routeUnload: row.route_unload,
                routeArrival: row.route_arrival,
                notes: row.notes,
                expenses: row.expenses || {}
              }));
            }
            
            if (dbClients) {
              appState.clients = dbClients.map(row => ({
                id: row.id,
                userId: appState.currentUser.username,
                name: row.name,
                phone: row.phone
              }));
            }
            
            if (dbExpenses) {
              appState.expenses = dbExpenses.map(row => ({
                id: row.id,
                userId: appState.currentUser.username,
                date: row.date,
                type: row.type,
                category: row.category,
                title: row.title,
                amount: Number(row.amount),
                notes: row.notes
              }));
            }
            
            if (dbSettings) {
              appState.settings = {
                ...DEFAULT_SETTINGS,
                ...appState.settings,
                ownerName: dbSettings.owner_name,
                theme: dbSettings.theme
              };
              appState.theme = dbSettings.theme;
              initTheme(); // Re-apply theme if updated from server
            }
            
            if (dbTracker) {
              let stepVal = isNaN(dbTracker.step) ? dbTracker.step : Number(dbTracker.step);
              appState.tracker = {
                step: stepVal,
                demoMode: false,
                startTime: dbTracker.start_time,
                departureLocation: dbTracker.route_start || "",
                startLocation: dbTracker.route_load || "",
                endLocation: dbTracker.route_unload || "",
                arrivalLocation: dbTracker.route_arrival || "",
                routeVias: dbTracker.route_vias || [],
                viaTimes: dbTracker.via_times || [],
                viaCompleteTimes: dbTracker.via_complete_times || [],
                stepTimes: [null, null, null, null, null, null, null],
                stepTimestamps: [null, null, null, null, null, null, null],
                viaTimestamps: [],
                viaCompleteTimestamps: [],
                distance: Number(dbTracker.distance || 0)
              };
            }
            
            // Update LocalStorage to keep offline cache and theme inline script in sync
            localStorage.setItem("logilog_trips", JSON.stringify(appState.trips));
            localStorage.setItem("logilog_clients", JSON.stringify(appState.clients));
            localStorage.setItem("logilog_expenses", JSON.stringify(appState.expenses));
            localStorage.setItem("logilog_settings", JSON.stringify(appState.settings));
            localStorage.setItem("logilog_theme", appState.theme);
            localStorage.setItem("logilog_tracker", JSON.stringify(appState.tracker));
            localStorage.setItem("logilog_current_user", appState.currentUser.username);
            localStorage.setItem("logilog_current_user_obj", JSON.stringify(appState.currentUser));
          }
          
          // Re-render UI now that Supabase data is loaded (for both user and admin)
          updateUI();
          lucide.createIcons();
          return;
        }
      }
    } catch (err) {
      console.error("Failed to load data from Supabase:", err);
    }
  }
}

function loadLocalData() {

  // Load users database (Ver 2.17)
  const savedUsers = localStorage.getItem("logilog_users");
  if (savedUsers) {
    appState.users = JSON.parse(savedUsers);
  } else {
    appState.users = [
      { username: 'user', password: '1234', role: 'user', name: '홍길동 기사', phone: '010-1234-5678' },
      { username: 'admin', password: '1234', role: 'admin', name: '최강 관리자', phone: '010-9876-5432' }
    ];
    localStorage.setItem("logilog_users", JSON.stringify(appState.users));
  }

  // Load current session
  const currentUserObj = localStorage.getItem("logilog_current_user_obj");
  if (currentUserObj) {
    appState.currentUser = JSON.parse(currentUserObj);
  } else {
    const currentUsername = localStorage.getItem("logilog_current_user");
    if (currentUsername) {
      const user = appState.users.find(u => u.username === currentUsername);
      if (user) {
        appState.currentUser = user;
      }
    }
  }

  // One-time reset to load the newly generated 40 trips and 10 clients
  if (!localStorage.getItem("logilog_reset_may_june_40_v3")) {
    localStorage.removeItem("logilog_trips");
    localStorage.removeItem("logilog_clients");
    localStorage.setItem("logilog_reset_may_june_40_v3", "true");
  }
  const savedTrips = localStorage.getItem("logilog_trips");
  const savedSettings = localStorage.getItem("logilog_settings");
  const savedTheme = localStorage.getItem("logilog_theme");
  const savedClients = localStorage.getItem("logilog_clients");

  if (savedTrips) {
    appState.trips = JSON.parse(savedTrips);
    
    // Migration logic for old trips schema (Ver 2.15 & 2.16 & 2.17)
    let needsMigrationSave = false;
    appState.trips.forEach(trip => {
      if (!trip.userId) {
        trip.userId = 'user';
        needsMigrationSave = true;
      }
      if (!trip.startDate) {
        trip.startDate = trip.date ? `${trip.date}T08:00` : `${getLocalDateString()}T08:00`;
        needsMigrationSave = true;
      }
      if (!trip.endDate) {
        trip.endDate = trip.date ? `${trip.date}T17:00` : `${getLocalDateString()}T17:00`;
        needsMigrationSave = true;
      }
      // Ver 2.16 삼원화 경로 마이그레이션
      if (trip.routeStart && !trip.routeLoad && !trip.routeUnload) {
        trip.routeLoad = trip.routeStart;
        trip.routeUnload = trip.routeEnd;
        trip.routeStart = "";
        needsMigrationSave = true;
      }
      // 수금완료일시 마이그레이션
      if (trip.isPaid && !trip.paymentDate) {
        const end = new Date(trip.endDate || trip.startDate);
        const randomHours = Math.floor(Math.random() * 47) + 1;
        const payDate = new Date(end.getTime() + randomHours * 60 * 60 * 1000);
        const pad = (n) => String(n).padStart(2, '0');
        trip.paymentDate = `${payDate.getFullYear()}-${pad(payDate.getMonth()+1)}-${pad(payDate.getDate())}T${pad(payDate.getHours())}:${pad(payDate.getMinutes())}`;
        needsMigrationSave = true;
      }
    });
    if (needsMigrationSave) {
      localStorage.setItem("logilog_trips", JSON.stringify(appState.trips));
    }
  } else {
    appState.trips = [...DUMMY_TRIPS];
    // Apply migration for initial dummy trips as well
    let dummyNeedsSave = false;
    appState.trips.forEach(trip => {
      if (!trip.userId) {
        trip.userId = 'user';
        dummyNeedsSave = true;
      }
      if (trip.routeStart && !trip.routeLoad && !trip.routeUnload) {
        trip.routeLoad = trip.routeStart;
        trip.routeUnload = trip.routeEnd;
        trip.routeStart = "";
        dummyNeedsSave = true;
      }
      if (trip.isPaid && !trip.paymentDate) {
        const end = new Date(trip.endDate || trip.startDate);
        const randomHours = Math.floor(Math.random() * 47) + 1;
        const payDate = new Date(end.getTime() + randomHours * 60 * 60 * 1000);
        const pad = (n) => String(n).padStart(2, '0');
        trip.paymentDate = `${payDate.getFullYear()}-${pad(payDate.getMonth()+1)}-${pad(payDate.getDate())}T${pad(payDate.getHours())}:${pad(payDate.getMinutes())}`;
        dummyNeedsSave = true;
      }
    });
    localStorage.setItem("logilog_trips", JSON.stringify(appState.trips));
  }

  if (savedClients) {
    appState.clients = JSON.parse(savedClients);
    let clientsNeedsSave = false;
    appState.clients.forEach(client => {
      if (!client.userId) {
        client.userId = 'user';
        clientsNeedsSave = true;
      }
    });
    if (clientsNeedsSave) {
      localStorage.setItem("logilog_clients", JSON.stringify(appState.clients));
    }
  } else {
    appState.clients = [...DUMMY_CLIENTS];
    appState.clients.forEach(client => {
      if (!client.userId) client.userId = 'user';
    });
    localStorage.setItem("logilog_clients", JSON.stringify(appState.clients));
  }

  if (savedSettings) {
    appState.settings = JSON.parse(savedSettings);
  }
  if (savedTheme) {
    appState.theme = savedTheme;
  }
  const savedTracker = localStorage.getItem("logilog_tracker");
  if (savedTracker) {
    appState.tracker = JSON.parse(savedTracker);
    if (!appState.tracker.routeVias) appState.tracker.routeVias = [];
    if (!appState.tracker.viaTimes) appState.tracker.viaTimes = [];
    if (!appState.tracker.viaCompleteTimes) appState.tracker.viaCompleteTimes = [];
    if (!appState.tracker.arrivalLocation) appState.tracker.arrivalLocation = "";
  }

  // Load expenses database (Ver 2.18)
  const savedExpenses = localStorage.getItem("logilog_expenses");
  if (savedExpenses) {
    appState.expenses = JSON.parse(savedExpenses);
    let expensesNeedsSave = false;
    appState.expenses.forEach(exp => {
      if (!exp.userId) {
        exp.userId = 'user';
        expensesNeedsSave = true;
      }
    });
    if (expensesNeedsSave) {
      localStorage.setItem("logilog_expenses", JSON.stringify(appState.expenses));
    }
  } else {
    appState.expenses = [
      { id: "expense-1", userId: "user", date: "2026-05-05", type: "fixed", category: "차량할부", title: "화물차 할부금 (5월분)", amount: 1200000, notes: "매월 5일 자동이체" },
      { id: "expense-2", userId: "user", date: "2026-05-10", type: "fixed", category: "보험료", title: "적재물 배상책임보험", amount: 150000, notes: "분기 납부" },
      { id: "expense-3", userId: "user", date: "2026-05-15", type: "variable", category: "주유비", title: "수지주유소 외 (5월 중순 일괄)", amount: 650000, notes: "경유 450L" },
      { id: "expense-4", userId: "user", date: "2026-05-20", type: "variable", category: "차량정비", title: "타이어 2개 교체 (앞바퀴)", amount: 480000, notes: "금호타이어 대리점" },
      { id: "expense-5", userId: "user", date: "2026-06-05", type: "fixed", category: "차량할부", title: "화물차 할부금 (6월분)", amount: 1200000, notes: "매월 5일 자동이체" },
      { id: "expense-6", userId: "user", date: "2026-06-10", type: "fixed", category: "보험료", title: "적재물 배상책임보험", amount: 150000, notes: "분기 납부" },
      { id: "expense-7", userId: "user", date: "2026-06-12", type: "variable", category: "주유비", title: "SK엔크린 주유", amount: 420000, notes: "경유 280L" },
      { id: "expense-8", userId: "user", date: "2026-06-18", type: "variable", category: "차량정비", title: "엔진오일 및 필터 교환", amount: 220000, notes: "지정 정비소" },
      { id: "expense-9", userId: "user", date: "2026-06-22", type: "variable", category: "기타", title: "협회 회비 및 통신비", amount: 55000, notes: "화물연합회비 및 무전기 사용료" }
    ];
    localStorage.setItem("logilog_expenses", JSON.stringify(appState.expenses));
  }
}

async function saveData() {
  localStorage.setItem("logilog_users", JSON.stringify(appState.users)); // Ver 2.17
  localStorage.setItem("logilog_trips", JSON.stringify(appState.trips));
  localStorage.setItem("logilog_clients", JSON.stringify(appState.clients)); // Ver 2.16
  localStorage.setItem("logilog_expenses", JSON.stringify(appState.expenses)); // Ver 2.18
  localStorage.setItem("logilog_settings", JSON.stringify(appState.settings));
  localStorage.setItem("logilog_theme", appState.theme);
  localStorage.setItem("logilog_tracker", JSON.stringify(appState.tracker));
  
  if (supabaseClient && appState.currentUser && appState.currentUser.uid) {
    await syncAllToSupabase();
  }
}

// ----------------------------------------------------
// THEME CONTROL
// ----------------------------------------------------
function initTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  
  if (appState.theme === "light") {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
  } else {
    document.body.classList.add("dark-theme");
    document.body.classList.remove("light-theme");
  }

  themeToggle.addEventListener("click", () => {
    if (document.body.classList.contains("dark-theme")) {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
      appState.theme = "light";
    } else {
      document.body.classList.remove("light-theme");
      document.body.classList.add("dark-theme");
      appState.theme = "dark";
    }
    saveData();
    showToast(`테마가 ${appState.theme === "dark" ? "다크" : "라이트"} 모드로 설정되었습니다.`);
  });
}

// ----------------------------------------------------
// SPA NAVIGATION (TABS)
// ----------------------------------------------------
function initNavigation() {
  const navItems = document.querySelectorAll(".app-nav .nav-item");
  const panels = document.querySelectorAll(".app-panel");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      // Auto-save drafts and close modals when switching tabs
      const dialogTrip = document.getElementById("dialog-trip");
      if (dialogTrip && dialogTrip.open) {
        saveTripDraft();
      }
      const dialogExpense = document.getElementById("dialog-expense");
      if (dialogExpense && dialogExpense.open) {
        saveExpenseDraft();
      }
      closeTrackerDialog();
      const target = item.getAttribute("data-target");

      navItems.forEach(n => n.classList.remove("active"));
      item.classList.add("active");

      panels.forEach(panel => {
        panel.classList.remove("active");
        if (panel.id === `panel-${target}`) {
          panel.classList.add("active");
        }
      });

      if (target === "home") {
        renderHomePanel();
      } else if (target === "dashboard") {
        updateDashboardStats();
      } else if (target === "trips") {
        renderTripsList();
      } else if (target === "expenses") {
        renderExpensesPanel();
      } else if (target === "clients") {
        renderClientsPanel();
      } else if (target === "admin") {
        renderAdminPanel();
      }

      lucide.createIcons();
    });
  });
  
  // Outside Click Listener for Desktop Modal Dialogs (Ver 2.26)
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 600) return;
    
    // Ignore clicks on elements that were detached from the DOM during click handling
    if (!e.target.isConnected) return;
    
    // A. Trip Modal
    const dialogTrip = document.getElementById("dialog-trip");
    if (dialogTrip && dialogTrip.open) {
      const modalContent = dialogTrip.querySelector(".modal-content");
      if (modalContent && !modalContent.contains(e.target)) {
        // If click is inside another open dialog (like location picker), ignore
        const clickedDialog = e.target.closest("dialog");
        if (clickedDialog && clickedDialog !== dialogTrip) return;

        const openBtn = e.target.closest(".btn-hero-register") || e.target.closest("[onclick*='openTripModal']") || e.target.closest(".nav-item");
        if (!openBtn) {
          saveTripDraft();
        }
      }
    }
    
    // B. Expense Modal
    const dialogExpense = document.getElementById("dialog-expense");
    if (dialogExpense && dialogExpense.open) {
      const modalContent = dialogExpense.querySelector(".modal-content-expense");
      if (modalContent && !modalContent.contains(e.target)) {
        const clickedDialog = e.target.closest("dialog");
        if (clickedDialog && clickedDialog !== dialogExpense) return;

        const openBtn = e.target.closest(".btn-hero-expense") || e.target.closest("[onclick*='openExpenseModal']") || e.target.closest(".nav-item");
        if (!openBtn) {
          saveExpenseDraft();
        }
      }
    }
    
    // C. Smart Tracker Dialog
    const dialogTracker = document.getElementById("dialog-tracker");
    if (dialogTracker && dialogTracker.open) {
      const modalContent = dialogTracker.querySelector(".tracker-dialog-content");
      if (modalContent && !modalContent.contains(e.target)) {
        const clickedDialog = e.target.closest("dialog");
        if (clickedDialog && clickedDialog !== dialogTracker) return;

        const openBtn = e.target.closest(".btn-tracker-hero") || e.target.closest("[onclick*='openTrackerDialog']") || e.target.closest(".nav-item");
        if (!openBtn) {
          closeTrackerDialog();
        }
      }
    }
  });
}

// ----------------------------------------------------
// TOAST NOTIFICATIONS
// ----------------------------------------------------
function showToast(message, duration = 2500) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

// ----------------------------------------------------
// DATE UTILITIES
// ----------------------------------------------------
function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

function getLocalDateTimeString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${date}T${hours}:${minutes}`;
}

function isToday(dateStr) {
  const cleanDateStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  return cleanDateStr === getLocalDateString();
}

function isThisWeek(dateStr) {
  const cleanDateStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const tripDate = new Date(cleanDateStr);
  tripDate.setHours(0,0,0,0);
  
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
  
  const monday = new Date(today.setDate(diffToMonday));
  monday.setHours(0,0,0,0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23,59,59,999);

  return tripDate >= monday && tripDate <= sunday;
}

function isThisMonth(dateStr) {
  const cleanDateStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const today = new Date();
  const prefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  return cleanDateStr.startsWith(prefix);
}

function isLastMonth(dateStr) {
  const cleanDateStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth();
  if (month === 0) {
    month = 12;
    year -= 1;
  }
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return cleanDateStr.startsWith(prefix);
}

function isTripOverdue(trip) {
  if (trip.isPaid) return false;
  if (!trip.paymentDueDate) return false;
  const todayStr = getLocalDateString();
  return trip.paymentDueDate < todayStr;
}

function isTripsPeriodDate(dateStr) {
  const cleanDateStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const period = appState.currentTripsPeriod;
  if (period === "all") return true;
  if (period === "today") return isToday(cleanDateStr);
  if (period === "week") return isThisWeek(cleanDateStr);
  if (period === "month") return isThisMonth(cleanDateStr);
  if (period === "last-month") return isLastMonth(cleanDateStr);
  if (period === "custom") {
    const start = appState.tripsCustomRange.start;
    const end = appState.tripsCustomRange.end;
    if (start && end) return cleanDateStr >= start && cleanDateStr <= end;
  }
  return false;
}

function isDashboardPeriodDate(dateStr) {
  const cleanDateStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const period = appState.currentDashboardPeriod;
  if (period === "all") return true;
  if (period === "today") return isToday(cleanDateStr);
  if (period === "week") return isThisWeek(cleanDateStr);
  if (period === "month") return isThisMonth(cleanDateStr);
  if (period === "last-month") return isLastMonth(cleanDateStr);
  if (period === "custom") {
    const start = appState.dashboardCustomRange.start;
    const end = appState.dashboardCustomRange.end;
    if (start && end) return cleanDateStr >= start && cleanDateStr <= end;
  }
  return false;
}

function formatTripPeriod(startStr, endStr) {
  if (!startStr) return "-";
  if (!endStr) {
    const start = new Date(startStr);
    return `${String(start.getMonth() + 1).padStart(2, '0')}/${String(start.getDate()).padStart(2, '0')} ${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
  }
  const start = new Date(startStr);
  const end = new Date(endStr);
  const startM = String(start.getMonth() + 1).padStart(2, '0');
  const startD = String(start.getDate()).padStart(2, '0');
  const startH = String(start.getHours()).padStart(2, '0');
  const startMin = String(start.getMinutes()).padStart(2, '0');
  const endM = String(end.getMonth() + 1).padStart(2, '0');
  const endD = String(end.getDate()).padStart(2, '0');
  const endH = String(end.getHours()).padStart(2, '0');
  const endMin = String(end.getMinutes()).padStart(2, '0');
  
  if (startStr.split('T')[0] === endStr.split('T')[0]) {
    // Same day
    return `${startM}/${startD} ${startH}:${startMin} ~ ${endH}:${endMin}`;
  } else {
    // Different days
    return `${startM}/${startD} ${startH}:${startMin} ~ ${endM}/${endD} ${endH}:${endMin}`;
  }
}

function getNearbyRoadsList(address) {
  const activeLocation = address || "서울특별시 강남구 역삼동";
  const addr = activeLocation.toLowerCase();
  
  if (addr.includes("평택") || addr.includes("포승")) {
    return [
      {
        roadName: "서해안선",
        statusText: "정체 우려",
        statusClass: "warning",
        statusEmoji: "🟡",
        detailText: "(서평택 IC) 대형차 증가로 서행",
        surfaceText: "노면: 젖음 🌧️ (빗길 감속)"
      },
      {
        roadName: "평택제천선",
        statusText: "정체 심함",
        statusClass: "danger",
        statusEmoji: "🔴",
        detailText: "(송탄 IC 부근) 차선 규제 공사",
        surfaceText: "노면: 양호 ☀️"
      },
      {
        roadName: "국도 38호선",
        statusText: "원활",
        statusClass: "smooth",
        statusEmoji: "🟢",
        detailText: "(포승공단로) 양방향 소통 원활",
        surfaceText: "노면: 양호 ☀️"
      }
    ];
  } else if (addr.includes("부산") || addr.includes("대연") || addr.includes("남구") || addr.includes("김해")) {
    return [
      {
        roadName: "남해지선",
        statusText: "정체 심함",
        statusClass: "danger",
        statusEmoji: "🔴",
        detailText: "(서부산 IC ~ 대저 JC) 극심 정체",
        surfaceText: "노면: 강풍 주의 💨 (적재물 결속)"
      },
      {
        roadName: "부산도시고속",
        statusText: "서행",
        statusClass: "warning",
        statusEmoji: "🟡",
        detailText: "(충장고가교 부근) 통행량 급증",
        surfaceText: "노면: 양호 ☀️"
      },
      {
        roadName: "번영로",
        statusText: "원활",
        statusClass: "smooth",
        statusEmoji: "🟢",
        detailText: "(원동 IC - 부곡 IC) 소통 원활",
        surfaceText: "노면: 양호 ☀️"
      }
    ];
  } else {
    return [
      {
        roadName: "경부선",
        statusText: "원활",
        statusClass: "smooth",
        statusEmoji: "🟢",
        detailText: "(반포 IC - 서초 IC) 소통 원활",
        surfaceText: "노면: 양호 ☀️"
      },
      {
        roadName: "영동선",
        statusText: "정체 심함",
        statusClass: "danger",
        statusEmoji: "🔴",
        detailText: "(마성 터널 부근) 정체 (사고 여파)",
        surfaceText: "노면: 강풍 주의 💨"
      },
      {
        roadName: "수도권제1순환",
        statusText: "서행",
        statusClass: "warning",
        statusEmoji: "🟡",
        detailText: "(송파 IC - 서하남 IC) 지체 서행",
        surfaceText: "노면: 양호 ☀️"
      }
    ];
  }
}

// ----------------------------------------------------
// DASHBOARD FILTER LOGIC
// ----------------------------------------------------
function initDashboardFilters() {
  const filterBtns = document.querySelectorAll("#panel-dashboard .filter-btn");
  
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const period = btn.getAttribute("data-period");
      appState.currentDashboardPeriod = period;
      
      if (period !== "custom") {
        const customBtn = document.getElementById("btn-dashboard-custom-period");
        if (customBtn) customBtn.textContent = "직접선택";
      }
      
      updateDashboardStats();
      lucide.createIcons();
    });
  });
}

function updateDashboardStats() {
  let filteredTrips = appState.trips.filter(t => t.userId === appState.currentUser.username);
  const period = appState.currentDashboardPeriod;

  const tripsTitle = document.getElementById("dashboard-trips-title");
  if (tripsTitle) {
    let label = "이번주";
    if (period === "today") label = "오늘";
    else if (period === "week") label = "이번주";
    else if (period === "month") label = "이번달";
    else if (period === "last-month") label = "지난달";
    else if (period === "custom") {
      label = appState.dashboardCustomLabel || "직접선택";
    }
    tripsTitle.textContent = `${label} 운행 내역`;
  }

  if (period === "today") {
    filteredTrips = filteredTrips.filter(t => isToday(t.startDate));
  } else if (period === "week") {
    filteredTrips = filteredTrips.filter(t => isThisWeek(t.startDate));
  } else if (period === "month") {
    filteredTrips = filteredTrips.filter(t => isThisMonth(t.startDate));
  } else if (period === "last-month") {
    filteredTrips = filteredTrips.filter(t => isLastMonth(t.startDate));
  } else if (period === "custom") {
    if (appState.dashboardCustomRange.start && appState.dashboardCustomRange.end) {
      filteredTrips = filteredTrips.filter(t => {
        const datePart = t.startDate.split('T')[0];
        return datePart >= appState.dashboardCustomRange.start && datePart <= appState.dashboardCustomRange.end;
      });
    }
  }

  let totalFee = 0;
  let totalExpense = 0;
  let totalCommission = 0;
  let totalDistance = 0;
  let totalPaid = 0;
  let totalUnpaid = 0;

  filteredTrips.forEach(trip => {
    totalFee += Number(trip.fee || 0);
    totalDistance += Number(trip.distance || 0);
    totalCommission += Number(trip.commission || 0);
    
    let expSum = 0;
    if (trip.expenses) {
      expSum = Number(trip.expenses.fuel || 0) + 
               Number(trip.expenses.toll || 0) + 
               Number(trip.expenses.meal || 0) + 
               Number(trip.expenses.other || 0);
    } else {
      expSum = Number(trip.expense || 0);
    }
    totalExpense += expSum;
    
    if (trip.isPaid) {
      totalPaid += Number(trip.fee || 0);
    } else {
      totalUnpaid += Number(trip.fee || 0);
    }
  });

  // Filter non-trip expenses for the dashboard period (Ver 2.18)
  let filteredExpenses = appState.expenses.filter(e => e.userId === appState.currentUser.username);
  if (period === "today") {
    filteredExpenses = filteredExpenses.filter(e => isToday(e.date));
  } else if (period === "week") {
    filteredExpenses = filteredExpenses.filter(e => isThisWeek(e.date));
  } else if (period === "month") {
    filteredExpenses = filteredExpenses.filter(e => isThisMonth(e.date));
  } else if (period === "last-month") {
    filteredExpenses = filteredExpenses.filter(e => isLastMonth(e.date));
  } else if (period === "custom") {
    if (appState.dashboardCustomRange.start && appState.dashboardCustomRange.end) {
      filteredExpenses = filteredExpenses.filter(e => e.date >= appState.dashboardCustomRange.start && e.date <= appState.dashboardCustomRange.end);
    }
  }

  let totalFixedNonTrip = 0;
  let totalVariableNonTrip = 0;
  filteredExpenses.forEach(e => {
    const amt = Number(e.amount) || 0;
    if (e.type === 'fixed') {
      totalFixedNonTrip += amt;
    } else {
      totalVariableNonTrip += amt;
    }
  });
  const totalNonTripExpense = totalFixedNonTrip + totalVariableNonTrip;

  const netIncome = totalFee - totalExpense - totalCommission - totalNonTripExpense;

  document.getElementById("stat-total-fee").innerText = totalFee.toLocaleString() + "원";
  document.getElementById("stat-total-expense").innerText = (totalExpense + totalCommission + totalNonTripExpense).toLocaleString() + "원";
  document.getElementById("stat-net-income").innerText = netIncome.toLocaleString() + "원";
  document.getElementById("stat-total-distance").innerText = totalDistance.toLocaleString() + " km";

  const pctText = document.getElementById("collection-percentage-text");
  const summaryPaid = document.getElementById("summary-paid-amount");
  const summaryUnpaid = document.getElementById("summary-unpaid-amount");
  const ring = document.getElementById("collection-progress-ring");

  if (pctText && summaryPaid && summaryUnpaid && ring) {
    const collectionPercentage = (totalPaid + totalUnpaid) > 0 
      ? (totalPaid / (totalPaid + totalUnpaid)) * 100 
      : 100;

    pctText.innerText = Math.round(collectionPercentage) + "%";
    summaryPaid.innerText = totalPaid.toLocaleString() + "원";
    summaryUnpaid.innerText = totalUnpaid.toLocaleString() + "원";

    const circumference = 408.4;
    const offset = circumference - (collectionPercentage / 100) * circumference;
    ring.style.strokeDashoffset = offset;
  }

  renderSVGChart();

  // 1. 영업 효율성 업데이트
  const kmRateLabel = document.getElementById("insight-km-rate");
  const expenseRatioLabel = document.getElementById("insight-expense-ratio");
  const expenseBar = document.getElementById("insight-expense-bar");
  
  if (kmRateLabel) {
    const kmRate = totalDistance > 0 ? Math.round(totalFee / totalDistance) : 0;
    kmRateLabel.innerText = kmRate.toLocaleString() + "원";
  }
  
  if (expenseRatioLabel && expenseBar) {
    const totalExp = totalExpense + totalCommission;
    const ratio = totalFee > 0 ? Math.round((totalExp / totalFee) * 100) : 0;
    expenseRatioLabel.innerText = ratio + "%";
    expenseBar.style.width = Math.min(ratio, 100) + "%";
  }

  // Calculate and render collapsible card details (Ver 2.16)
  
  // 1. Revenue Details (Top 3 clients by revenue)
  const clientRevenue = {};
  filteredTrips.forEach(t => {
    const c = t.client || "거래처 미지정";
    clientRevenue[c] = (clientRevenue[c] || 0) + (Number(t.fee) || 0);
  });
  const topClients = Object.entries(clientRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  let revenueHtml = `<div style="font-weight: 600; margin-bottom: 4px; color: var(--text-main);">거래처별 매출 Top 3</div>`;
  if (topClients.length === 0) {
    revenueHtml += `<div style="font-size: 0.65rem;">데이터 없음</div>`;
  } else {
    topClients.forEach(([c, r], idx) => {
      revenueHtml += `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <span>${idx + 1}. ${c}</span>
        <strong style="color: var(--color-success);">${r.toLocaleString()}원</strong>
      </div>`;
    });
  }
  const detailRev = document.getElementById("detail-revenue-content");
  if (detailRev) detailRev.innerHTML = revenueHtml;

  // 2. Expense Details (Detailed item breakdown)
  let totalFuel = 0, totalToll = 0, totalMeal = 0, totalOther = 0;
  filteredTrips.forEach(trip => {
    if (trip.expenses) {
      totalFuel += Number(trip.expenses.fuel || 0);
      totalToll += Number(trip.expenses.toll || 0);
      totalMeal += Number(trip.expenses.meal || 0);
      totalOther += Number(trip.expenses.other || 0);
    } else {
      totalFuel += Number(trip.expense || 0);
    }
  });
  const expenseHtml = `
    <div style="font-weight: 600; margin-bottom: 4px; color: var(--text-main);">운행 지출 상세</div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
      <span>주유비 (운행)</span>
      <strong>${totalFuel.toLocaleString()}원</strong>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
      <span>통행료 (톨비)</span>
      <strong>${totalToll.toLocaleString()}원</strong>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
      <span>수수료 (알선)</span>
      <strong>${totalCommission.toLocaleString()}원</strong>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
      <span>식대</span>
      <strong>${totalMeal.toLocaleString()}원</strong>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
      <span>기타 경비 (운행)</span>
      <strong>${totalOther.toLocaleString()}원</strong>
    </div>
    <div style="font-weight: 600; margin-top: 6px; margin-bottom: 4px; color: var(--text-main); border-top: 1px dashed var(--bg-card-border); padding-top: 6px;">공통/고정 지출 상세</div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
      <span>고정 경비 (할부/보험 등)</span>
      <strong>${totalFixedNonTrip.toLocaleString()}원</strong>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
      <span>유동 경비 (정비/세금 등)</span>
      <strong>${totalVariableNonTrip.toLocaleString()}원</strong>
    </div>
  `;
  const detailExp = document.getElementById("detail-expense-content");
  if (detailExp) detailExp.innerHTML = expenseHtml;

  // 3. Net Income Details (Tax estimation)
  const estIncomeTax = Math.round(totalFee * 0.033);
  const estLocalTax = Math.round(totalFee * 0.0033);
  const realNetIncome = netIncome - estIncomeTax - estLocalTax;
  const netIncomeHtml = `
    <div style="font-weight: 600; margin-bottom: 4px; color: var(--text-main);">세금 공제 예상 내역</div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
      <span>사업소득세 (3.3%)</span>
      <strong>${estIncomeTax.toLocaleString()}원</strong>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
      <span>지방소득세 (0.33%)</span>
      <strong>${estLocalTax.toLocaleString()}원</strong>
    </div>
    <div style="display: flex; justify-content: space-between; margin-top: 4px; padding-top: 4px; border-top: 1px dashed var(--bg-card-border); color: var(--text-main); font-weight: 700;">
      <span>세후 예상 순수입</span>
      <strong style="color: var(--color-success);">${realNetIncome.toLocaleString()}원</strong>
    </div>
  `;
  const detailNet = document.getElementById("detail-net-income-content");
  if (detailNet) detailNet.innerHTML = netIncomeHtml;

  // 4. Distance Details (Average distance, estimated fuel consumption, carbon emissions)
  const avgDistance = filteredTrips.length > 0 ? (totalDistance / filteredTrips.length) : 0;
  const estFuelLiters = totalDistance / 5.5; // Assuming average 5.5 km/L for truck
  const estCarbonKg = estFuelLiters * 2.68; // 2.68 kg CO2 per Liter diesel
  const distanceHtml = `
    <div style="font-weight: 600; margin-bottom: 4px; color: var(--text-main);">운행 상세 통계</div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
      <span>건당 평균 운행거리</span>
      <strong>${avgDistance.toFixed(1)} km</strong>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
      <span>예상 연료 소모량</span>
      <strong>${estFuelLiters.toFixed(1)} L</strong>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
      <span>예상 탄소 배출량</span>
      <strong>${estCarbonKg.toFixed(1)} kg CO₂</strong>
    </div>
  `;
  const detailDist = document.getElementById("detail-distance-content");
  if (detailDist) detailDist.innerHTML = distanceHtml;

  // 5. Efficiency Details (Guidelines/Tips)
  const kmRate = totalDistance > 0 ? Math.round(totalFee / totalDistance) : 0;
  const totalExp = totalExpense + totalCommission;
  const ratio = totalFee > 0 ? Math.round((totalExp / totalFee) * 100) : 0;
  
  let efficiencyTip = "현재 안정적인 수익 효율을 보이고 있습니다.";
  if (filteredTrips.length > 0) {
    if (kmRate < 1200) {
      efficiencyTip = "km당 단가가 낮습니다. 공차 운행을 줄이고 회차 화물을 적극 매칭해보세요.";
    } else if (ratio > 35) {
      efficiencyTip = "매출 대비 경비 비율이 높습니다. 주유소 할인 카드 혜택이나 에코 드라이빙을 실천해보세요.";
    } else {
      efficiencyTip = "수익률이 우수합니다! 급가속을 자제하고 최적 경로로 경제 속도를 준수하세요.";
    }
  } else {
    efficiencyTip = "등록된 운행 기록이 없어 수익률 분석이 불가능합니다.";
  }

  const efficiencyHtml = `
    <div style="font-weight: 600; margin-bottom: 4px; color: var(--text-main);">수익 극대화 가이드라인</div>
    <div style="line-height: 1.4; color: var(--color-warning);">${efficiencyTip}</div>
  `;
  const detailEff = document.getElementById("detail-efficiency-content");
  if (detailEff) detailEff.innerHTML = efficiencyHtml;
}

function renderHomePanel() {
  if (!appState.currentUser) return;
  const idleMgmtView = document.getElementById("home-idle-management-view");
  if (!idleMgmtView) return;
  
  const step = appState.tracker.step;
  const todayStr = getLocalDateString();

  // Calculate today's trips and revenue at the start to update header
  const todayTrips = appState.trips.filter(t => t.userId === appState.currentUser.username && t.startDate && t.startDate.split('T')[0] === todayStr);
  const todayCount = todayTrips.length;
  const todayRevenue = todayTrips.reduce((sum, t) => sum + Number(t.fee || 0), 0);

  const headerRev = document.getElementById("home-today-revenue-val");
  if (headerRev) {
    headerRev.innerText = todayRevenue.toLocaleString() + "원";
  }

  // Force idleMgmtView block since VMS is now modal-only (Ver 2.25)
  idleMgmtView.style.display = "block";



  // Update Home Draft Indicator (Ver 2.16 - Patch 7)
  updateHomeDraftIndicator();
  
  // Render Reminders (Today's performance, Due collections)
  const remindersContainer = document.getElementById("home-today-reminders");
    if (remindersContainer) {
      const todayDueTrips = appState.trips.filter(t => t.userId === appState.currentUser.username && !t.isPaid && t.paymentDueDate === todayStr);
      
      let html = `
        <div class="card-header-flex" style="margin-bottom: 12px; border-bottom: 1px solid var(--bg-card-border); padding-bottom: 6px;">
          <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary); display: flex; align-items: center; gap: 6px;">
            <i data-lucide="check-square" style="width: 16px; height: 16px;"></i> 오늘 확인해야 할 내용
          </h3>
        </div>
        <div style="display: flex; flex-direction: column; gap: 14px;">
      `;

      // B. 오늘 수금 예정 (placed above today's performance)
      if (todayDueTrips.length > 0) {
        html += `
          <div class="home-alert-section">
            <h4 class="home-alert-title" style="font-size: 0.75rem; font-weight: 700; color: var(--color-warning); display: flex; align-items: center; gap: 4px; margin-bottom: 6px;">
              <i data-lucide="dollar-sign" style="width: 13px; height: 13px;"></i> 오늘 수금 예정 내역 (${todayDueTrips.length}건)
            </h4>
            <div id="home-today-due-list" class="items-list" style="display: flex; flex-direction: column; gap: 8px;">
              <!-- Today's due trips list populated dynamically -->
            </div>
          </div>
        `;
      }

      // A. 오늘의 실적
      html += `
        <div class="home-alert-section">
          <h4 class="home-alert-title" style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: flex; align-items: center; gap: 4px; margin-bottom: 6px;">
            <i data-lucide="bar-chart-2" style="width: 13px; height: 13px;"></i> 오늘의 운행 실적
          </h4>
          <div id="home-today-trips-list" class="items-list" style="display: flex; flex-direction: column; gap: 8px;">
            <!-- Today's trips list populated dynamically -->
          </div>
        </div>
      `;

      // If nothing to alert
      if (todayDueTrips.length === 0 && todayCount === 0) {
        html += `
          <div style="text-align: center; padding: 20px 0; color: var(--text-muted); font-size: 0.8rem;">
            <i data-lucide="check-circle-2" style="width: 28px; height: 28px; color: var(--color-success); margin-bottom: 6px;"></i>
            <p>오늘 확인해야 할 특이사항이 없습니다.</p>
            <p>안전 운전 하세요!</p>
          </div>
        `;
      }

      html += `</div>`;
      remindersContainer.innerHTML = html;

      // Populate today's due list (without highlight)
      const todayDueContainer = document.getElementById("home-today-due-list");
      if (todayDueContainer && todayDueTrips.length > 0) {
        const sortedDueTrips = [...todayDueTrips].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        sortedDueTrips.forEach(trip => {
          todayDueContainer.appendChild(createTripElement(trip, true));
        });
      }

      // Populate today's trips list in Trip logbook format
      const todayTripsContainer = document.getElementById("home-today-trips-list");
      if (todayTripsContainer) {
        if (todayCount === 0) {
          todayTripsContainer.innerHTML = `<div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; padding: 10px 0;">오늘 등록된 운행 내역이 없습니다.</div>`;
        } else {
          const sortedTodayTrips = [...todayTrips].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
          sortedTodayTrips.forEach(trip => {
            todayTripsContainer.appendChild(createTripElement(trip, true));
          });
        }
      }
    }
  
  lucide.createIcons();
}

function populateTripMonthFilter() {
  const filter = document.getElementById("trip-month-filter");
  if (!filter) return;
  const previousValue = filter.value;
  filter.innerHTML = '<option value="all">전체 내역</option>';

  const months = new Set();
  appState.trips.forEach(trip => {
    if (trip.startDate) {
      months.add(trip.startDate.substring(0, 7));
    }
  });

  const sortedMonths = Array.from(months).sort().reverse();
  
  sortedMonths.forEach(m => {
    const option = document.createElement("option");
    option.value = m;
    option.textContent = `${m.split("-")[0]}년 ${m.split("-")[1]}월`;
    filter.appendChild(option);
  });

  if (Array.from(filter.options).some(o => o.value === previousValue)) {
    filter.value = previousValue;
  }
}

// Reusable function to build the trip log card element (Ver 2.15)
function createTripElement(trip, disableHighlight = false) {
  const item = document.createElement("div");
  item.className = "db-trip-item";
  item.setAttribute("onclick", "toggleDashboardTripDetail(this)");

  const displayClient = trip.client ? trip.client : "거래처 미지정";

  // Route representation (Departure optional, Loading required, Unloading required, Arrival optional)
  // Helper to extract and format the last word (dong name) safely (Ver 2.16 Patch 8)
  const getDongName = (addr, fallback) => {
    if (!addr) return fallback;
    const parts = addr.trim().replace(/\s+/g, " ").split(" ");
    
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (p.endsWith("동") || p.endsWith("읍") || p.endsWith("면") || p.endsWith("가") || p.endsWith("리") || p.includes("동)") || p.includes("읍)") || p.includes("면)")) {
        return p;
      }
    }
    
    return parts[parts.length - 1] || fallback;
  };

  // 1. Collapsed Route representation (display all waypoints, split into 2 lines if > 4 locations)
  const locs = [];
  
  if (trip.routeStart) {
    const startDong = getDongName(trip.routeStart, "출발지");
    locs.push({
      name: startDong,
      type: 'start',
      html: `<span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 500;">${startDong}</span>`
    });
  }
  
  const loadDong = getDongName(trip.routeLoad, "상차지");
  locs.push({
    name: loadDong,
    type: 'load',
    html: `<span>${loadDong}</span>`
  });
  
  if (trip.routeVias && trip.routeVias.length > 0) {
    trip.routeVias.forEach((via, index) => {
      const viaDong = getDongName(via, `경유지${index + 1}`);
      locs.push({
        name: viaDong,
        type: 'via',
        html: `<span style="color: var(--color-warning); font-size: 0.8rem; font-weight: 600;">${viaDong}</span>`
      });
    });
  }
  
  const unloadDong = getDongName(trip.routeUnload, "하차지");
  locs.push({
    name: unloadDong,
    type: 'unload',
    html: `<span>${unloadDong}</span>`
  });
  
  if (trip.routeArrival) {
    const arrivalDong = getDongName(trip.routeArrival, "도착지");
    locs.push({
      name: arrivalDong,
      type: 'arrival',
      html: `<span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 500;">${arrivalDong}</span>`
    });
  }

  let routeCollapsedHtml = "";
  if (locs.length <= 4) {
    // Single line
    let singleHtml = "";
    locs.forEach((loc, idx) => {
      if (idx > 0) {
        singleHtml += ` <i data-lucide="arrow-right" class="route-arrow" style="width: 12px; height: 12px; color: var(--text-muted); margin: 0 2px; vertical-align: middle;"></i> `;
      }
      singleHtml += loc.html;
    });
    routeCollapsedHtml = `<div class="collapsed-route-line" style="display: flex; align-items: center; flex-wrap: wrap; gap: 2px;">${singleHtml}</div>`;
  } else {
    // Two lines (split after the 4th element - index 3)
    let line1Html = "";
    let line2Html = "";
    
    locs.forEach((loc, idx) => {
      if (idx < 4) {
        if (idx > 0) {
          line1Html += ` <i data-lucide="arrow-right" class="route-arrow" style="width: 12px; height: 12px; color: var(--text-muted); margin: 0 2px; vertical-align: middle;"></i> `;
        }
        line1Html += loc.html;
      } else {
        if (idx > 4) {
          line2Html += ` <i data-lucide="arrow-right" class="route-arrow" style="width: 12px; height: 12px; color: var(--text-muted); margin: 0 2px; vertical-align: middle;"></i> `;
        }
        line2Html += loc.html;
      }
    });
    
    routeCollapsedHtml = `
      <div class="collapsed-route-line" style="display: flex; align-items: center; flex-wrap: wrap; gap: 2px;">${line1Html}</div>
      <div class="collapsed-route-line" style="display: flex; align-items: center; flex-wrap: wrap; gap: 2px; margin-top: 4px;">
        <i data-lucide="arrow-right" class="route-arrow" style="width: 12px; height: 12px; color: var(--text-muted); margin-right: 4px; flex-shrink: 0; vertical-align: middle;"></i>
        ${line2Html}
      </div>
    `;
  }

  // 2. Expanded Route representation (shows all actual dong names)
  let routeExpandedHtml = "";
  if (trip.routeStart) {
    const startDong = getDongName(trip.routeStart, "출발지");
    routeExpandedHtml += `<span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 500;">${startDong}</span>
      <i data-lucide="arrow-right" class="route-arrow" style="width: 12px; height: 12px; color: var(--text-muted);"></i>`;
  }
  
  routeExpandedHtml += `<span>${loadDong}</span>`;
  
  if (trip.routeVias && trip.routeVias.length > 0) {
    trip.routeVias.forEach((via, index) => {
      const viaDong = getDongName(via, `경유지${index + 1}`);
      routeExpandedHtml += `
        <i data-lucide="arrow-right" class="route-arrow" style="width: 12px; height: 12px; color: var(--text-muted);"></i>
        <span style="color: var(--color-warning); font-size: 0.8rem; font-weight: 600;">${viaDong}</span>
      `;
    });
  }
  
  routeExpandedHtml += `
    <i data-lucide="arrow-right" class="route-arrow" style="width: 12px; height: 12px; color: var(--text-muted);"></i>
    <span>${unloadDong}</span>
  `;

  if (trip.routeArrival) {
    const arrivalDong = getDongName(trip.routeArrival, "도착지");
    routeExpandedHtml += `
      <i data-lucide="arrow-right" class="route-arrow" style="width: 12px; height: 12px; color: var(--text-muted);"></i>
      <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 500;">${arrivalDong}</span>
    `;
  }

  const clientBadge = trip.client 
    ? `<span class="db-trip-client">${trip.client}</span>`
    : "";

  const isOverdue = isTripOverdue(trip);
  let statusText = "";
  if (trip.isPaid) {
    if (trip.paymentDate) {
      const dateOnly = trip.paymentDate.split('T')[0];
      const dateParts = dateOnly.split('-');
      const shortDate = dateParts.length === 3 ? `${dateParts[1]}-${dateParts[2]}` : dateOnly;
      statusText = `수금완료(${shortDate})`;
    } else {
      statusText = "수금완료";
    }
  } else {
    let shortDueDate = "";
    if (trip.paymentDueDate) {
      const parts = trip.paymentDueDate.split('-');
      shortDueDate = parts.length === 3 ? `${parts[1]}-${parts[2]}` : trip.paymentDueDate;
    }
    statusText = trip.paymentDueDate ? `${isOverdue ? '미수금' : '수금대기'}(${shortDueDate})` : "수금대기";
  }
  const statusClass = trip.isPaid ? "paid" : `unpaid ${isOverdue ? 'overdue' : ''}`;

  // Calculate expenses and net income (Commission is included inside expenses)
  let expSum = 0;
  let expDetailText = "";
  let fuelVal = 0, tollVal = 0, mealVal = 0, otherVal = 0, commVal = 0;
  if (trip.expenses) {
    fuelVal = Number(trip.expenses.fuel || 0);
    tollVal = Number(trip.expenses.toll || 0);
    mealVal = Number(trip.expenses.meal || 0);
    otherVal = Number(trip.expenses.other || 0);
    commVal = Number(trip.commission || 0);
    expSum = fuelVal + tollVal + mealVal + otherVal + commVal;
    
    const parts = [];
    if (fuelVal > 0) parts.push(`주유: ${fuelVal.toLocaleString()}원`);
    if (tollVal > 0) parts.push(`톨비: ${tollVal.toLocaleString()}원`);
    if (commVal > 0) parts.push(`수수료: ${commVal.toLocaleString()}원`);
    if (mealVal > 0) parts.push(`식대: ${mealVal.toLocaleString()}원`);
    if (otherVal > 0) parts.push(`기타: ${otherVal.toLocaleString()}원`);
    
    if (parts.length > 0) {
      expDetailText = `<span class="detail-sub">(${parts.join(" / ")})</span>`;
    } else {
      expDetailText = `<span class="detail-sub">(경비 없음)</span>`;
    }
  } else {
    expSum = Number(trip.expense || 0);
    if (expSum > 0) {
      expDetailText = `<span class="detail-sub">(주유: ${expSum.toLocaleString()}원)</span>`;
    } else {
      expDetailText = `<span class="detail-sub">(경비 없음)</span>`;
    }
  }

  const commission = Number(trip.commission || 0);
  const netIncome = Number(trip.fee || 0) - expSum;
  const displayPeriod = formatTripPeriod(trip.startDate, trip.endDate);
  
  let routeDetailHtml = "";
  if (trip.routeStart) {
    routeDetailHtml += `
      <div class="detail-row">
        <span>출발지 주소</span>
        <strong style="word-break: break-all;">${trip.routeStart}</strong>
      </div>
    `;
  }
  routeDetailHtml += `
    <div class="detail-row">
      <span>상차지 주소</span>
      <strong style="word-break: break-all;">${trip.routeLoad || "-"}</strong>
    </div>
  `;
  if (trip.routeVias && trip.routeVias.length > 0) {
    trip.routeVias.forEach((via, idx) => {
      routeDetailHtml += `
        <div class="detail-row" style="color: var(--color-warning);">
          <span>경유지 ${idx + 1} 주소</span>
          <strong style="word-break: break-all;">${via}</strong>
        </div>
      `;
    });
  }
  routeDetailHtml += `
    <div class="detail-row">
      <span>하차지 주소</span>
      <strong style="word-break: break-all;">${trip.routeUnload || "-"}</strong>
    </div>
  `;
  if (trip.routeArrival) {
    routeDetailHtml += `
      <div class="detail-row">
        <span>도착지 주소</span>
        <strong style="word-break: break-all;">${trip.routeArrival}</strong>
      </div>
    `;
  }
  
  const startDateObj = new Date(trip.startDate);
  const displayDate = `${String(startDateObj.getMonth() + 1).padStart(2, '0')}/${String(startDateObj.getDate()).padStart(2, '0')}`;

  item.innerHTML = `
    <div class="db-trip-summary">
      <div class="db-trip-left">
        <div class="db-trip-date-client">
          <span class="db-trip-date">${displayDate}</span>
          ${clientBadge}
        </div>
        <span class="db-trip-route route-collapsed">
          ${routeCollapsedHtml}
        </span>
        <span class="db-trip-route route-expanded" style="display: none;">
          ${routeExpandedHtml}
        </span>
      </div>
      <div class="db-trip-right">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; justify-content: center;">
          <span class="db-trip-fee" style="margin-right: 0; line-height: 1.1;">${Number(trip.fee).toLocaleString()}원</span>
          <span class="db-trip-status-badge ${statusClass}">${statusText}</span>
        </div>
      </div>
    </div>
    <div class="db-trip-detail-wrapper">
      <div class="db-trip-detail">
        <div class="detail-grid">
          <div class="detail-row">
            <span>운행 일시</span>
            <strong>${displayPeriod}</strong>
          </div>
          <div class="detail-row">
            <span>주행 거리</span>
            <strong>${trip.distance} km</strong>
          </div>
          <div class="detail-row">
            <span>지출 경비 합계 (수수료 포함)</span>
            <strong>${expSum.toLocaleString()}원 ${expDetailText}</strong>
          </div>
          <div class="detail-row highlight">
            <span>순수입 (매출 - 경비)</span>
            <strong class="text-success">${netIncome.toLocaleString()}원</strong>
          </div>
          ${trip.paymentDueDate && !trip.isPaid ? `
          <div class="detail-row text-warning" style="border-bottom: none;">
            <span>수금 예정일</span>
            <strong class="${isOverdue ? 'text-danger' : ''}">${trip.paymentDueDate} ${isOverdue ? '(연체됨)' : ''}</strong>
          </div>` : ''}
          ${trip.isPaid && trip.paymentDate ? `
          <div class="detail-row text-success-light" style="border-bottom: none; color: var(--color-success);">
            <span>수금 완료일시</span>
            <strong>${trip.paymentDate.replace('T', ' ')}</strong>
          </div>` : ''}
          ${trip.clientPhone ? `
          <div class="detail-row">
            <span>거래처 연락처</span>
            <strong><a href="tel:${(trip.clientPhone || '').replace(/[^0-9]/g, '')}" style="color: inherit; text-decoration: none; font-weight: 600;">${formatPhoneNumber(trip.clientPhone)}</a></strong>
          </div>` : ''}
          ${trip.notes ? `
          <div class="detail-row notes">
            <span>비고 (특이사항)</span>
            <p>${trip.notes}</p>
          </div>` : ''}
          <div class="card-actions">
            ${!trip.isPaid ? `
            <button class="btn btn-sm btn-outline text-success" onclick="event.stopPropagation(); markTripAsPaid('${trip.id}')" style="margin-right: auto; height: 32px; padding: 0 10px; font-weight: 700; font-size: 0.75rem;">
              수금 완료 처리
            </button>
            ` : ''}
            <button class="btn-icon" onclick="event.stopPropagation(); editTrip('${trip.id}')" title="수정">
              <i data-lucide="edit-2"></i>
            </button>
            <button class="btn-icon delete" onclick="event.stopPropagation(); deleteTrip('${trip.id}')" title="삭제">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  return item;
}

// 3-Way Segment Switcher inside Trips Tab (Ver 2.15)
function switchTripsView(view) {
  appState.tripsActiveTab = view;
  
  const segmentBtns = document.querySelectorAll("#trips-segment-control .segment-item");
  segmentBtns.forEach(btn => {
    if (btn.getAttribute("data-view") === view) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  
  const viewContainers = {
    all: document.getElementById("trips-list-view-container"),
    unpaid: document.getElementById("trips-unpaid-view-container"),
    calendar: document.getElementById("trips-calendar-view-container")
  };
  
  for (const [key, container] of Object.entries(viewContainers)) {
    if (container) {
      container.style.display = key === view ? "block" : "none";
    }
  }
  
  if (view === "all") {
    renderTripsList();
  } else if (view === "unpaid") {
    renderUnpaidTripsView();
  } else if (view === "calendar") {
    renderCalendarView();
  }
  
  lucide.createIcons();
}

function renderTripsList() {
  const container = document.getElementById("trips-list");
  if (!container) return;
  const searchQuery = document.getElementById("trip-search").value.toLowerCase().trim();

  container.innerHTML = "";

  let filtered = appState.trips.filter(t => t.userId === appState.currentUser.username);

  // 1. Period Filter
  const period = appState.currentTripsPeriod;
  if (period === "today") {
    filtered = filtered.filter(t => isToday(t.startDate));
  } else if (period === "week") {
    filtered = filtered.filter(t => isThisWeek(t.startDate));
  } else if (period === "month") {
    filtered = filtered.filter(t => isThisMonth(t.startDate));
  } else if (period === "last-month") {
    filtered = filtered.filter(t => isLastMonth(t.startDate));
  } else if (period === "custom") {
    if (appState.tripsCustomRange.start && appState.tripsCustomRange.end) {
      filtered = filtered.filter(t => {
        const datePart = t.startDate.split('T')[0];
        return datePart >= appState.tripsCustomRange.start && datePart <= appState.tripsCustomRange.end;
      });
    }
  }

  // 2. Search query filter
  if (searchQuery) {
    filtered = filtered.filter(t => 
      (t.client && t.client.toLowerCase().includes(searchQuery)) ||
      (t.routeStart && t.routeStart.toLowerCase().includes(searchQuery)) ||
      (t.routeLoad && t.routeLoad.toLowerCase().includes(searchQuery)) ||
      (t.routeVias && t.routeVias.some(v => v.toLowerCase().includes(searchQuery))) ||
      (t.routeUnload && t.routeUnload.toLowerCase().includes(searchQuery)) ||
      (t.routeArrival && t.routeArrival.toLowerCase().includes(searchQuery)) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery))
    );
  }

  // Sort: startDate sorted by tripsSortOrder
  filtered.sort((a, b) => {
    const dateDiff = new Date(b.startDate) - new Date(a.startDate);
    return appState.tripsSortOrder === 'asc' ? -dateDiff : dateDiff;
  });

  // Calculate total trip count and revenue of filtered set
  const totalCount = filtered.length;
  const totalRevenue = filtered.reduce((sum, t) => sum + (Number(t.fee) || 0), 0);

  const statsContainer = document.getElementById("trips-all-summary-stats");
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div style="flex: 35 1 0%; background-color: var(--bg-card); border: 1px solid var(--bg-card-border); padding: 10px 14px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">운행건수</span>
        <strong style="font-size: 1rem; color: var(--color-primary); font-weight: 700;">${totalCount.toLocaleString()}건</strong>
      </div>
      <div style="flex: 65 1 0%; background-color: var(--bg-card); border: 1px solid var(--bg-card-border); padding: 10px 14px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">매출액</span>
        <strong style="font-size: 1rem; color: var(--color-success); font-weight: 700;">${totalRevenue.toLocaleString()}원</strong>
      </div>
    `;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="search"></i>
        <p>조건에 부합하는 운행 내역이 없습니다.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  filtered.forEach(trip => {
    container.appendChild(createTripElement(trip));
  });

  lucide.createIcons();
}

// Unpaid Dues Management View rendering (Ver 2.15)
// Unpaid Dues Management View rendering (Ver 2.15 - Patch 7 with filters)
function renderUnpaidTripsView() {
  const summaryCard = document.getElementById("trips-unpaid-summary-card");
  const clientList = document.getElementById("trips-unpaid-client-list");
  const listContainer = document.getElementById("trips-unpaid-list");
  
  if (!summaryCard || !clientList || !listContainer) return;
  
  listContainer.innerHTML = "";
  clientList.innerHTML = "";

  const searchQuery = document.getElementById("unpaid-trip-search") 
    ? document.getElementById("unpaid-trip-search").value.toLowerCase().trim() 
    : "";

  let unpaidTrips = appState.trips.filter(t => !t.isPaid && t.userId === appState.currentUser.username);

  // 1. Period Filter (Based on paymentDueDate)
  const period = appState.unpaidPeriod || "all";
  if (period === "today") {
    unpaidTrips = unpaidTrips.filter(t => t.paymentDueDate && isToday(t.paymentDueDate));
  } else if (period === "week") {
    unpaidTrips = unpaidTrips.filter(t => t.paymentDueDate && isThisWeek(t.paymentDueDate));
  } else if (period === "month") {
    unpaidTrips = unpaidTrips.filter(t => t.paymentDueDate && isThisMonth(t.paymentDueDate));
  } else if (period === "last-month") {
    unpaidTrips = unpaidTrips.filter(t => t.paymentDueDate && isLastMonth(t.paymentDueDate));
  } else if (period === "custom") {
    if (appState.unpaidCustomRange && appState.unpaidCustomRange.start && appState.unpaidCustomRange.end) {
      unpaidTrips = unpaidTrips.filter(t => {
        if (!t.paymentDueDate) return false;
        const datePart = t.paymentDueDate.split('T')[0];
        return datePart >= appState.unpaidCustomRange.start && datePart <= appState.unpaidCustomRange.end;
      });
    }
  }

  // 2. Search query filter
  if (searchQuery) {
    unpaidTrips = unpaidTrips.filter(t => 
      (t.client && t.client.toLowerCase().includes(searchQuery)) ||
      (t.routeStart && t.routeStart.toLowerCase().includes(searchQuery)) ||
      (t.routeLoad && t.routeLoad.toLowerCase().includes(searchQuery)) ||
      (t.routeVias && t.routeVias.some(v => v.toLowerCase().includes(searchQuery))) ||
      (t.routeUnload && t.routeUnload.toLowerCase().includes(searchQuery)) ||
      (t.routeArrival && t.routeArrival.toLowerCase().includes(searchQuery)) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery))
    );
  }

  // 3. Sort unpaidTrips by appState.unpaidSortOrder
  unpaidTrips.sort((a, b) => {
    const dateDiff = new Date(b.startDate) - new Date(a.startDate);
    return (appState.unpaidSortOrder || 'desc') === 'asc' ? -dateDiff : dateDiff;
  });

  let totalUnpaidSum = 0;
  let totalUnpaidCount = 0;
  let overdueCount = 0;
  
  const clientGroups = {};
  
  unpaidTrips.forEach(trip => {
    totalUnpaidCount++;
    totalUnpaidSum += Number(trip.fee || 0);
    if (isTripOverdue(trip)) {
      overdueCount++;
    }
    
    const clientName = trip.client ? trip.client : "거래처 미지정";
    if (!clientGroups[clientName]) {
      clientGroups[clientName] = {
        clientName: clientName,
        count: 0,
        sum: 0
      };
    }
    clientGroups[clientName].count++;
    clientGroups[clientName].sum += Number(trip.fee || 0);
  });
  
  // 1. Render Summary Card
  summaryCard.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 2px;">총 미수금액</span>
        <strong style="font-size: 1.4rem; color: var(--color-warning); font-weight: 800;">${totalUnpaidSum.toLocaleString()}원</strong>
      </div>
      <div style="text-align: right;">
        <span class="badge warning" style="margin-bottom: 4px; display: inline-flex;">미수금 ${totalUnpaidCount}건</span>
        ${overdueCount > 0 ? `<span class="badge danger" style="display: block; font-size: 0.65rem;">연체 ${overdueCount}건</span>` : ''}
      </div>
    </div>
  `;
  
  // 2. Render Client Grouping Summary list
  const clients = Object.keys(clientGroups);
  if (clients.length === 0) {
    clientList.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); padding: 14px; text-align: center;">미수금이 잡힌 거래처가 없습니다.</div>`;
  } else {
    clients.forEach(client => {
      const group = clientGroups[client];
      const card = document.createElement("div");
      card.className = "client-summary-card";
      card.innerHTML = `
        <div class="client-info-col">
          <span class="client-name">${group.clientName}</span>
          <span class="client-unpaid-count">미수금 ${group.count}건</span>
        </div>
        <div class="client-money-col">
          <span class="client-unpaid-amount">${group.sum.toLocaleString()}원</span>
          <button class="btn btn-primary btn-sm" onclick="markClientAsPaid('${group.clientName}')" style="height: 28px; padding: 0 8px; font-size: 0.7rem; border-radius: 4px;">
            전체 수금완료
          </button>
        </div>
      `;
      clientList.appendChild(card);
    });
  }
  
  // 3. Render Unpaid List (Sorted as requested above)
  if (unpaidTrips.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <i data-lucide="check-circle" style="color: var(--color-success);"></i>
        <p>미수금 항목이 없습니다. 모든 대금이 완료되었습니다!</p>
      </div>
    `;
  } else {
    unpaidTrips.forEach(trip => {
      listContainer.appendChild(createTripElement(trip));
    });
  }
  
  lucide.createIcons();
}

function setUnpaidPeriod(period) {
  appState.unpaidPeriod = period;
  
  const filterBtns = document.querySelectorAll("#unpaid-period-filters .filter-btn");
  filterBtns.forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-period") === period) {
      btn.classList.add("active");
    }
  });

  if (period !== 'custom') {
    const customBtn = document.getElementById("btn-unpaid-custom-period");
    if (customBtn) customBtn.textContent = "직접선택";
  }

  renderUnpaidTripsView();
}

function setUnpaidSortOrder(order) {
  appState.unpaidSortOrder = order;
  
  const btnDesc = document.getElementById("btn-unpaid-sort-desc");
  const btnAsc = document.getElementById("btn-unpaid-sort-asc");
  if (btnDesc && btnAsc) {
    if (order === "desc") {
      btnDesc.classList.add("active");
      btnAsc.classList.remove("active");
    } else {
      btnDesc.classList.remove("active");
      btnAsc.classList.add("active");
    }
  }
  
  renderUnpaidTripsView();
}

// Calendar View rendering (Ver 2.15)
function renderCalendarView() {
  const label = document.getElementById("calendar-current-month-label");
  const grid = document.getElementById("calendar-days-grid");
  const listContainer = document.getElementById("calendar-selected-trips-list");
  
  if (!label || !grid || !listContainer) return;
  
  const year = appState.calendarYear;
  const month = appState.calendarMonth; // 1-indexed
  
  // Update header year/month label
  label.textContent = `${year}년 ${month}월`;

  // Calculate monthly stats for the active calendar month (Ver 2.16)
  const currentMonthTrips = appState.trips.filter(t => {
    if (t.userId !== appState.currentUser.username) return false;
    if (!t.startDate) return false;
    const dateParts = t.startDate.split('T')[0].split('-');
    return Number(dateParts[0]) === year && Number(dateParts[1]) === month;
  });
  
  const monthCount = currentMonthTrips.length;
  const monthRevenue = currentMonthTrips.reduce((sum, t) => sum + (Number(t.fee) || 0), 0);
  
  const calendarStatsContainer = document.getElementById("calendar-month-summary-stats");
  if (calendarStatsContainer) {
    calendarStatsContainer.innerHTML = `
      <div style="flex: 35 1 0%; background-color: var(--bg-card); border: 1px solid var(--bg-card-border); padding: 10px 14px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">운행건수</span>
        <strong style="font-size: 1rem; color: var(--color-primary); font-weight: 700;">${monthCount.toLocaleString()}건</strong>
      </div>
      <div style="flex: 65 1 0%; background-color: var(--bg-card); border: 1px solid var(--bg-card-border); padding: 10px 14px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">매출액</span>
        <strong style="font-size: 1rem; color: var(--color-success); font-weight: 700;">${monthRevenue.toLocaleString()}원</strong>
      </div>
    `;
  }
  
  grid.innerHTML = "";
  
  const firstDay = new Date(year, month - 1, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 is Sunday, 6 is Saturday
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // 1. Render empty cells for day offset
  for (let i = 0; i < startDayOfWeek; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day-cell empty";
    grid.appendChild(emptyCell);
  }
  
  // 2. Render each day cell
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayTrips = appState.trips.filter(t => t.userId === appState.currentUser.username && t.startDate && t.startDate.split('T')[0] === dateStr);
    const dayUnpaids = appState.trips.filter(t => t.userId === appState.currentUser.username && t.paymentDueDate === dateStr && !t.isPaid);
    
    const isSelected = appState.calendarSelectedDate === dateStr;
    const hasTrips = dayTrips.length > 0;
    const hasUnpaid = dayUnpaids.length > 0;
    
    const cell = document.createElement("div");
    cell.className = `calendar-day-cell${isSelected ? ' selected' : ''}${hasTrips ? ' has-trips' : ''}${hasUnpaid ? ' has-unpaid' : ''}`;
    
    // Highlight Sunday and Saturday in header colors
    const dayOfWeek = (startDayOfWeek + day - 1) % 7;
    if (dayOfWeek === 0) cell.classList.add("sun");
    if (dayOfWeek === 6) cell.classList.add("sat");
    
    let badgeHtml = "";
    if (hasTrips || hasUnpaid) {
      const totalCount = dayTrips.length;
      const unpaidCount = dayUnpaids.length;
      const sumFee = dayTrips.reduce((acc, t) => acc + Number(t.fee || 0), 0);
      const feeFormatted = sumFee > 0 ? (sumFee >= 10000 ? Math.round(sumFee / 10000) + "만" : Math.round(sumFee / 1000) + "천") : "";
      
      let tripBadge = "";
      if (hasTrips) {
        tripBadge = `<span class="day-trip-count">운송 ${totalCount}</span>`;
      }
      
      let unpaidBadge = "";
      if (hasUnpaid) {
        unpaidBadge = `<span class="day-trip-unpaid">수금 ${unpaidCount}</span>`;
      }
      
      badgeHtml = `
        <div class="desktop-badges" style="display: flex; flex-direction: column; gap: 2px; align-items: center; width: 100%;">
          ${tripBadge}
          ${unpaidBadge}
        </div>
        <div class="day-dots-container">
          ${hasTrips ? '<span class="day-dot trip-dot"></span>' : ''}
          ${hasUnpaid ? '<span class="day-dot unpaid-dot"></span>' : ''}
        </div>
        ${feeFormatted ? `<span class="day-trip-fee">${feeFormatted}</span>` : ""}
      `;
    }
    
    cell.innerHTML = `
      <span class="day-number">${day}</span>
      <div class="day-badge-container">${badgeHtml}</div>
    `;
    
    cell.onclick = () => selectCalendarDate(dateStr);
    grid.appendChild(cell);
  }
  
  // 3. Render trips list for selected date
  listContainer.innerHTML = "";
  const selectedTrips = appState.trips.filter(t => t.userId === appState.currentUser.username && t.startDate && t.startDate.split('T')[0] === appState.calendarSelectedDate);
  const selectedUnpaids = appState.trips.filter(t => t.userId === appState.currentUser.username && t.paymentDueDate === appState.calendarSelectedDate);
  
  const titleDate = new Date(appState.calendarSelectedDate);
  const titleLabel = document.getElementById("calendar-selected-date-title");
  if (titleLabel) {
    titleLabel.textContent = `${titleDate.getMonth() + 1}월 ${titleDate.getDate()}일 상세 현황`;
  }
  
  if (selectedTrips.length === 0 && selectedUnpaids.length === 0) {
    listContainer.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 20px 0;">
        <i data-lucide="info" style="width: 24px; height: 24px; color: var(--bg-card-border); margin-bottom: 6px; display: block; margin-left: auto; margin-right: auto;"></i>
        해당 날짜에 등록된 운송 및 수금 내역이 없습니다.
      </div>
    `;
  } else {
    // 3.1 Render Collection list (수금 내역)
    if (selectedUnpaids.length > 0) {
      const header = document.createElement("h5");
      header.style = "font-size: 0.8rem; font-weight: 700; color: var(--color-warning); margin: 10px 0 6px 0; display: flex; align-items: center; gap: 6px;";
      header.innerHTML = `<i data-lucide="wallet" style="width: 14px; height: 14px;"></i> 당일 수금(입금) 예정 내역 (${selectedUnpaids.length}건)`;
      listContainer.appendChild(header);
      
      selectedUnpaids.sort((a, b) => new Date(a.paymentDueDate) - new Date(b.paymentDueDate));
      selectedUnpaids.forEach(trip => {
        listContainer.appendChild(createTripElement(trip));
      });
    }

    // 3.2 Render Driving list (운송 내역)
    if (selectedTrips.length > 0) {
      const header = document.createElement("h5");
      header.style = `font-size: 0.8rem; font-weight: 700; color: var(--color-primary); margin: ${selectedUnpaids.length > 0 ? '18px' : '10px'} 0 6px 0; display: flex; align-items: center; gap: 6px;`;
      header.innerHTML = `<i data-lucide="truck" style="width: 14px; height: 14px;"></i> 당일 운송 내역 (${selectedTrips.length}건)`;
      listContainer.appendChild(header);
      
      selectedTrips.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      selectedTrips.forEach(trip => {
        listContainer.appendChild(createTripElement(trip));
      });
    }
  }
  
  lucide.createIcons();
  
  lucide.createIcons();
}

function navigateCalendarMonth(offset) {
  let year = appState.calendarYear;
  let month = appState.calendarMonth + offset; // month is 1-indexed
  
  if (month < 1) {
    month = 12;
    year -= 1;
  } else if (month > 12) {
    month = 1;
    year += 1;
  }
  
  appState.calendarYear = year;
  appState.calendarMonth = month;
  
  // Update selected date to first of that month
  appState.calendarSelectedDate = `${year}-${String(month).padStart(2, "0")}-01`;
  
  renderCalendarView();
}

function selectCalendarDate(dateStr) {
  appState.calendarSelectedDate = dateStr;
  renderCalendarView();
}

// ----------------------------------------------------
// DYNAMIC SVG CHART RENDERING
// ----------------------------------------------------
function renderSVGChart() {
  const svg = document.getElementById("earnings-chart");
  if (!svg) return;
  svg.innerHTML = "";

  const daysCount = 7;
  const chartHeight = 180;
  const bottomPadding = 30;
  const topPadding = 20;
  const barWidth = 36;
  const chartWidth = svg.parentElement.clientWidth || 400;
  const colSpacing = (chartWidth - daysCount * barWidth) / (daysCount + 1);

  const dailyEarnings = [];
  const today = new Date();
  
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);
    
    const dayTrips = appState.trips.filter(t => t.userId === appState.currentUser.username && t.startDate && t.startDate.split('T')[0] === dateStr);
    const dayEarnings = dayTrips.reduce((acc, t) => acc + Number(t.fee || 0), 0);
    
    dailyEarnings.push({
      dateStr: dateStr,
      shortDate: `${d.getMonth() + 1}/${d.getDate()}`,
      earnings: dayEarnings
    });
  }

  const maxEarnings = Math.max(...dailyEarnings.map(d => d.earnings), 500000);

  dailyEarnings.forEach((day, index) => {
    const x = colSpacing + index * (barWidth + colSpacing);
    const drawableHeight = chartHeight - bottomPadding - topPadding;
    const height = (day.earnings / maxEarnings) * drawableHeight;
    const y = chartHeight - bottomPadding - height;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", barWidth);
    rect.setAttribute("height", Math.max(height, 2));
    rect.setAttribute("class", "chart-bar-rect");
    
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = `${day.dateStr}: ${day.earnings.toLocaleString()}원`;
    rect.appendChild(title);
    svg.appendChild(rect);

    if (day.earnings > 0) {
      const valText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      valText.setAttribute("x", x + barWidth / 2);
      valText.setAttribute("y", y - 6);
      valText.setAttribute("class", "chart-value-text");
      
      const formatted = day.earnings >= 10000 
        ? Math.round(day.earnings / 10000) + "만"
        : Math.round(day.earnings / 1000) + "천";
        
      valText.textContent = formatted;
      svg.appendChild(valText);
    }

    const dateText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    dateText.setAttribute("x", x + barWidth / 2);
    dateText.setAttribute("y", chartHeight - 10);
    dateText.setAttribute("class", "chart-text");
    dateText.textContent = day.shortDate;
    svg.appendChild(dateText);
  });
}

// ----------------------------------------------------
// DASHBOARD ALERTS LOGIC
// ----------------------------------------------------
function renderDashboardAlerts() {
  // Alerts widget removed in Ver 2.13
}

function getCumulativeMileage() {
  const drivenDistance = appState.trips.reduce((acc, t) => acc + Number(t.distance || 0), 0);
  return Number(appState.settings.initialMileage || 0) + drivenDistance;
}

// ----------------------------------------------------
// TRIP LOG MANAGEMENT (TAB 2)
// ----------------------------------------------------
function initForms() {
  // Set up phone input digit-only filters (Ver 2.26)
  const phoneIds = ["trip-client-phone", "client-modal-phone", "signup-phone"];
  phoneIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, "");
      });
    }
  });

  document.getElementById("trip-search").addEventListener("input", renderTripsList);

  const formTrip = document.getElementById("form-trip");
  formTrip.addEventListener("submit", (e) => {
    e.preventDefault();
    saveTrip();
  });

  const dialogTrip = document.getElementById("dialog-trip");
  if (dialogTrip) {
    dialogTrip.addEventListener("click", (e) => {
      if (e.target === dialogTrip) {
        const rect = dialogTrip.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          saveTripDraft();
        }
      }
    });
  }

  const formClient = document.getElementById("form-client");
  if (formClient) {
    formClient.addEventListener("submit", (e) => {
      e.preventDefault();
      saveClient();
    });
  }

  const formExpense = document.getElementById("form-expense");
  if (formExpense) {
    formExpense.addEventListener("submit", (e) => {
      e.preventDefault();
      saveExpense();
    });
  }

  const dialogExpense = document.getElementById("dialog-expense");
  if (dialogExpense) {
    dialogExpense.addEventListener("click", (e) => {
      if (e.target === dialogExpense) {
        const rect = dialogExpense.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          closeExpenseModal();
        }
      }
    });
  }
}


// ----------------------------------------------------
// TRIP MODAL (ADD & EDIT OPERATIONS)
// ----------------------------------------------------
const dialogTrip = document.getElementById("dialog-trip");

// Wizard State & Functions (Ver 2.3)
let currentTripWizardStep = 1;

function goToWizardStep(stepNum) {
  currentTripWizardStep = stepNum;
  
  // Hide/Show step panes
  const pane1 = document.getElementById("wizard-step-1-pane");
  const pane2 = document.getElementById("wizard-step-2-pane");
  const pane3 = document.getElementById("wizard-step-3-pane");
  
  if (pane1) pane1.style.display = stepNum === 1 ? "block" : "none";
  if (pane2) pane2.style.display = stepNum === 2 ? "block" : "none";
  if (pane3) pane3.style.display = stepNum === 3 ? "block" : "none";
  
  // Update Wizard tabs active styles
  const tabs = document.querySelectorAll(".wizard-tab");
  tabs.forEach(tab => {
    const tabStep = Number(tab.getAttribute("data-step"));
    if (tabStep === stepNum) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });
  
  // Update summary if in step 3
  if (stepNum === 3) {
    updateTripWizardSummary();
  }
}

function updateTripWizardSummary() {
  const summaryBox = document.getElementById("trip-wizard-summary-box");
  if (!summaryBox) return;
  
  const startLoc = document.getElementById("trip-start").value || "";
  const loadLoc = document.getElementById("trip-load").value || "";
  const unloadLoc = document.getElementById("trip-unload").value || "";
  const arrivalLoc = document.getElementById("trip-arrival").value || "";
  
  const waypoints = [];
  for (let i = 1; i <= 3; i++) {
    const input = document.getElementById(`trip-via-${i}`);
    if (input && input.value) {
      waypoints.push(input.value);
    }
  }
  
  const startDate = document.getElementById("trip-start-date").value;
  const endDate = document.getElementById("trip-end-date").value;
  
  const distance = Number(document.getElementById("trip-distance").value || 0);
  const fee = Number(document.getElementById("trip-fee").value || 0);
  const fuel = Number(document.getElementById("trip-expense-fuel").value || 0);
  const toll = Number(document.getElementById("trip-expense-toll").value || 0);
  const meal = Number(document.getElementById("trip-expense-meal").value || 0);
  const other = Number(document.getElementById("trip-expense-other").value || 0);
  const commission = Number(document.getElementById("trip-commission").value || 0);
  const expSum = fuel + toll + meal + other + commission;
  const netIncome = fee - expSum;
  
  const perKmFee = (distance > 0 && fee > 0) ? Math.round(fee / distance) : 0;
  
  const clientName = document.getElementById("trip-client").value || "미지정";
  const clientPhone = formatPhoneNumber(document.getElementById("trip-client-phone").value) || "";
  const isPaid = document.getElementById("trip-is-paid").checked;
  const dueDate = document.getElementById("trip-payment-due").value;
  const paymentDate = document.getElementById("trip-payment-date").value;
  
  const formatDt = (dtStr) => {
    if (!dtStr) return "-";
    const d = new Date(dtStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  
  let routeHtml = "";
  if (startLoc) routeHtml += `<span class="sum-badge start-badge">출발</span> <strong>${startLoc}</strong> ➔ `;
  routeHtml += `<span class="sum-badge load-badge">상차</span> <strong>${loadLoc}</strong>`;
  
  waypoints.forEach(wp => {
    routeHtml += ` ➔ <span class="sum-badge via-badge">경유</span> <strong>${wp}</strong>`;
  });
  
  routeHtml += ` ➔ <span class="sum-badge unload-badge">하차</span> <strong>${unloadLoc}</strong>`;
  if (arrivalLoc) routeHtml += ` ➔ <span class="sum-badge arrival-badge">도착</span> <strong>${arrivalLoc}</strong>`;
  
  summaryBox.innerHTML = `
    <div class="summary-section" style="margin-bottom: 10px; font-size: 0.8rem; line-height: 1.4;">
      <h5 style="font-weight: 700; color: var(--color-primary); margin-bottom: 4px; font-size: 0.82rem;">📍 운송 경로 및 일정</h5>
      <div style="line-height: 1.5; margin-bottom: 4px;">${routeHtml}</div>
      <div style="color: var(--text-muted); font-size: 0.72rem;">
        상차: ${formatDt(startDate)} | 하차: ${formatDt(endDate)}
      </div>
    </div>
    
    <div class="summary-section" style="margin-bottom: 10px; font-size: 0.8rem; border-top: 1px dashed var(--bg-card-border); padding-top: 8px;">
      <h5 style="font-weight: 700; color: var(--color-success); margin-bottom: 4px; font-size: 0.82rem;">💵 운송료 및 경비 정산</h5>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px 12px; line-height: 1.4;">
        <div>운송료: <strong style="color: var(--text-main);">${fee.toLocaleString()}원</strong></div>
        <div>경비합계: <strong style="color: var(--color-danger);">${expSum.toLocaleString()}원</strong></div>
        ${perKmFee > 0 ? `<div style="grid-column: span 2; font-size: 0.82rem; color: var(--text-main); margin-top: 2px;">km당 운송료: <strong style="color: var(--color-primary); font-weight: 700;">${perKmFee.toLocaleString()}원/km</strong></div>` : ''}
        <div style="grid-column: span 2; font-size: 0.82rem; padding: 4px 8px; background-color: var(--color-success-muted); border-radius: 4px; margin-top: 4px; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: var(--color-success); font-weight: 700;">순수입 (매출-경비):</span>
          <strong style="color: var(--color-success); font-weight: 800;">${netIncome.toLocaleString()}원</strong>
        </div>
      </div>
    </div>
    
    <div class="summary-section" style="font-size: 0.8rem; border-top: 1px dashed var(--bg-card-border); padding-top: 8px; line-height: 1.4;">
      <h5 style="font-weight: 700; color: var(--color-warning); margin-bottom: 4px; font-size: 0.82rem;">🏢 거래처 및 수금</h5>
      <div>거래처: <strong>${clientName}</strong> ${clientPhone ? `(${clientPhone})` : ""}</div>
      <div style="margin-top: 4px; display: flex; align-items: center; gap: 6px;">
        <span>수금 상태:</span>
        <span class="logo-badge" style="background-color: ${isPaid ? 'var(--color-success-muted)' : 'var(--color-warning-muted)'}; color: ${isPaid ? 'var(--color-success)' : 'var(--color-warning)'}; border: 1px solid ${isPaid ? 'var(--color-success)' : 'var(--color-warning)'}; font-size: 0.7rem; font-weight: 700; padding: 1px 5px; border-radius: 4px;">
          ${isPaid ? '수금완료' : '미수금'}
        </span>
        <span style="font-size: 0.72rem; color: var(--text-muted);">
          ${isPaid ? `수금일: ${formatDt(paymentDate)}` : `예정일: ${dueDate || "-"}`}
        </span>
      </div>
    </div>
  `;
  
  lucide.createIcons();
}

function openTripModal(tripId = null) {
  const modalTitle = document.getElementById("trip-modal-title");
  const form = document.getElementById("form-trip");
  
  form.reset();
  document.getElementById("distance-calc-indicator").style.display = "none";
  
  // Clear waypoints container
  document.getElementById("waypoints-container").innerHTML = "";

  // Reset expenses accordion to closed state
  const header = document.querySelector(".accordion-header");
  const content = document.getElementById("expenses-accordion-content");
  if (header && content) {
    content.style.display = "none";
    header.classList.remove("open");
  }

  // Populate client suggestions datalist (Ver 2.16)
  updateClientSuggestions();

  if (tripId) {
    modalTitle.innerText = "운행기록 수정";
    const trip = appState.trips.find(t => t.id === tripId);
    
    if (trip) {
      document.getElementById("trip-id").value = trip.id;
      document.getElementById("trip-start-date").value = trip.startDate || "";
      document.getElementById("trip-end-date").value = trip.endDate || "";
      document.getElementById("trip-client").value = trip.client || "";
      document.getElementById("trip-client-phone").value = (trip.clientPhone || "").replace(/[^0-9]/g, "");
      document.getElementById("trip-start").value = trip.routeStart || "";
      document.getElementById("trip-load").value = trip.routeLoad || "";
      document.getElementById("trip-unload").value = trip.routeUnload || "";
      document.getElementById("trip-arrival").value = trip.routeArrival || "";
      document.getElementById("trip-distance").value = trip.distance;
      document.getElementById("trip-fee").value = trip.fee;
      document.getElementById("trip-commission").value = trip.commission || 0;
      
      toggleLocationField('start', !!trip.routeStart);
      toggleLocationField('arrival', !!trip.routeArrival);

      // Populate waypoints
      if (trip.routeVias && trip.routeVias.length > 0) {
        trip.routeVias.forEach(via => {
          addWaypointField(via);
        });
      }

      if (trip.expenses) {
        document.getElementById("trip-expense-fuel").value = trip.expenses.fuel || 0;
        document.getElementById("trip-expense-toll").value = trip.expenses.toll || 0;
        document.getElementById("trip-expense-meal").value = trip.expenses.meal || 0;
        document.getElementById("trip-expense-other").value = trip.expenses.other || 0;
      } else {
        document.getElementById("trip-expense-fuel").value = trip.expense || 0;
        document.getElementById("trip-expense-toll").value = 0;
        document.getElementById("trip-expense-meal").value = 0;
        document.getElementById("trip-expense-other").value = 0;
      }

      document.getElementById("trip-is-paid").checked = trip.isPaid;
      document.getElementById("trip-payment-due").value = trip.paymentDueDate || "";
      document.getElementById("trip-payment-date").value = trip.paymentDate || "";
      document.getElementById("trip-notes").value = trip.notes || "";
    }
  } else {
    modalTitle.innerText = "운행기록 등록";
    document.getElementById("trip-id").value = "";
    
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const nowStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const later = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours later
    const laterStr = `${later.getFullYear()}-${pad(later.getMonth()+1)}-${pad(later.getDate())}T${pad(later.getHours())}:${pad(later.getMinutes())}`;
    document.getElementById("trip-start-date").value = nowStr;
    document.getElementById("trip-end-date").value = laterStr;
    
    document.getElementById("trip-client").value = "";
    document.getElementById("trip-client-phone").value = "";
    document.getElementById("trip-start").value = "";
    document.getElementById("trip-load").value = "";
    document.getElementById("trip-unload").value = "";
    document.getElementById("trip-arrival").value = "";
    document.getElementById("trip-commission").value = 0;
    document.getElementById("trip-expense-fuel").value = 0;
    document.getElementById("trip-expense-toll").value = 0;
    document.getElementById("trip-expense-meal").value = 0;
    document.getElementById("trip-expense-other").value = 0;
    
    document.getElementById("trip-is-paid").checked = false;
    document.getElementById("trip-payment-due").value = "";
    document.getElementById("trip-payment-date").value = "";
    
    toggleLocationField('start', false);
    toggleLocationField('arrival', false);
  }
  
  calculateTotalExpenses();
  togglePaymentDueDate();
  updateAddWaypointButtonState();
  checkTripDraft(tripId);
  currentTripWizardStep = 1;
  goToWizardStep(1);
  dialogTrip.show();
}

function closeTripModal() {
  dialogTrip.close();
}

function calculateTotalExpenses() {
  const fuel = Number(document.getElementById("trip-expense-fuel").value || 0);
  const toll = Number(document.getElementById("trip-expense-toll").value || 0);
  const meal = Number(document.getElementById("trip-expense-meal").value || 0);
  const other = Number(document.getElementById("trip-expense-other").value || 0);
  const commission = Number(document.getElementById("trip-commission").value || 0);
  
  const sum = fuel + toll + meal + other + commission;
  document.getElementById("trip-expense-total").value = sum.toLocaleString() + "원";
}

function togglePaymentDueDate() {
  const isPaid = document.getElementById("trip-is-paid").checked;
  const groupDue = document.getElementById("group-payment-due");
  const dueInput = document.getElementById("trip-payment-due");
  const groupDate = document.getElementById("group-payment-date");
  const dateInput = document.getElementById("trip-payment-date");
  
  if (isPaid) {
    groupDue.style.display = "none";
    dueInput.removeAttribute("required");
    dueInput.value = "";
    
    groupDate.style.display = "flex";
    dateInput.setAttribute("required", "required");
    
    if (!dateInput.value) {
      dateInput.value = getLocalDateTimeString();
    }
  } else {
    groupDue.style.display = "flex";
    dueInput.setAttribute("required", "required");
    
    if (!dueInput.value) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      dueInput.value = getLocalDateString(d);
    }
    
    groupDate.style.display = "none";
    dateInput.removeAttribute("required");
    dateInput.value = "";
  }
}

function toggleExpensesAccordion() {
  const header = document.querySelector(".accordion-header");
  const content = document.getElementById("expenses-accordion-content");
  
  if (content.style.display === "none" || !content.style.display) {
    content.style.display = "block";
    header.classList.add("open");
  } else {
    content.style.display = "none";
    header.classList.remove("open");
  }
}

// ----------------------------------------------------
// DYNAMIC MULTIPLE WAYPOINTS HANDLER (Ver 2.2)
// ----------------------------------------------------
function addWaypointField(val = "") {
  const container = document.getElementById("waypoints-container");
  
  // Find currently loaded indices
  const activeIndices = [];
  for (let i = 1; i <= 3; i++) {
    if (document.getElementById(`waypoint-row-${i}`)) {
      activeIndices.push(i);
    }
  }
  
  if (activeIndices.length >= 3) {
    showToast("경유지는 최대 3개까지 추가할 수 있습니다.");
    return;
  }

  // Find first available index slot
  let targetIndex = 1;
  for (let i = 1; i <= 3; i++) {
    if (!activeIndices.includes(i)) {
      targetIndex = i;
      break;
    }
  }

  const row = document.createElement("div");
  row.className = "timeline-step via";
  row.id = `waypoint-row-${targetIndex}`;
  row.style.position = "relative";
  
  row.innerHTML = `
    <div class="journey-card">
      <div class="card-header">
        <span style="font-size: 0.72rem; color: var(--color-warning); font-weight: 600;">경유지 ${targetIndex} (선택)</span>
        <button type="button" class="btn-card-close" onclick="removeWaypointField(${targetIndex})" title="경유지 삭제" style="background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; padding: 4px;">
          <i data-lucide="x" style="width: 14px; height: 14px;"></i>
        </button>
      </div>
      <div style="display: flex; gap: 6px; align-items: center; width: 100%;">
        <div class="input-icon-group" style="flex: 1; margin-bottom: 0 !important;">
          <i data-lucide="map-pin"></i>
          <input type="text" id="trip-via-${targetIndex}" placeholder="경유지 선택" readonly onclick="openLocationPicker('via-${targetIndex}')" value="${val}">
        </div>
        <button type="button" class="btn btn-outline" style="width: 38px; height: 38px; padding: 0; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background-color: var(--bg-panel); color: var(--text-main); border: 1px solid var(--bg-card-border);" onclick="setFieldToCurrentLocation('trip-via-${targetIndex}', 'waypoint')" title="현위치 입력">
          <i data-lucide="navigation" style="width: 14px; height: 14px;"></i>
        </button>
      </div>
    </div>
  `;
  
  container.appendChild(row);
  lucide.createIcons();
  
  updateAddWaypointButtonState();
}

function removeWaypointField(index) {
  const row = document.getElementById(`waypoint-row-${index}`);
  if (row) {
    row.remove();
  }
  
  updateAddWaypointButtonState();
  triggerAutoDistanceCalculation();
}

function updateAddWaypointButtonState() {
  const count = document.querySelectorAll(".timeline-step.via").length;
  const btn = document.getElementById("btn-add-waypoint");
  if (btn) {
    if (count >= 3) {
      btn.style.display = "none";
    } else {
      btn.style.display = "block";
    }
  }
}

function saveTrip() {
  const tripId = document.getElementById("trip-id").value;
  const startDate = document.getElementById("trip-start-date").value;
  const endDate = document.getElementById("trip-end-date").value;
  const client = document.getElementById("trip-client").value.trim();
  const clientPhone = formatPhoneNumber(document.getElementById("trip-client-phone").value.trim());
  const routeStart = document.getElementById("trip-start").value.trim();
  const routeLoad = document.getElementById("trip-load").value.trim();
  const routeUnload = document.getElementById("trip-unload").value.trim();
  const routeArrival = document.getElementById("trip-arrival").value.trim();
  const distance = Number(document.getElementById("trip-distance").value);
  const fee = Number(document.getElementById("trip-fee").value);
  
  const commission = Number(document.getElementById("trip-commission").value || 0);
  const expenses = {
    fuel: Number(document.getElementById("trip-expense-fuel").value || 0),
    toll: Number(document.getElementById("trip-expense-toll").value || 0),
    meal: Number(document.getElementById("trip-expense-meal").value || 0),
    other: Number(document.getElementById("trip-expense-other").value || 0)
  };
  
  const isPaid = document.getElementById("trip-is-paid").checked;
  const paymentDueDate = document.getElementById("trip-payment-due").value;
  const paymentDate = document.getElementById("trip-payment-date").value;
  const notes = document.getElementById("trip-notes").value.trim();

  // Read active dynamic stopovers
  const routeVias = [];
  for (let i = 1; i <= 3; i++) {
    const input = document.getElementById(`trip-via-${i}`);
    if (input && input.value) {
      routeVias.push(input.value.trim());
    }
  }

  if (!routeLoad || !startDate || isNaN(distance) || isNaN(fee)) {
    showToast("필수 값을 모두 입력하세요.");
    return;
  }

  if (!routeUnload || !endDate) {
    showToast("하차지와 하차 일시는 필수 항목입니다.");
    return;
  }
  
  if (!isPaid && !paymentDueDate) {
    showToast("미수금 상태인 경우 수금 예정일을 지정해 주세요.");
    return;
  }

  if (isPaid && !paymentDate) {
    showToast("수금 완료 상태인 경우 수금 완료일시를 입력해 주세요.");
    return;
  }

  const expenseSum = expenses.fuel + expenses.toll + expenses.meal + expenses.other;

  if (tripId) {
    const index = appState.trips.findIndex(t => t.id === tripId);
    if (index !== -1) {
      const existingUserId = appState.trips[index].userId || appState.currentUser.username;
      appState.trips[index] = {
        id: tripId,
        userId: existingUserId,
        startDate, endDate, client, clientPhone, routeStart, routeLoad, routeVias, routeUnload, routeArrival, distance, fee, commission, expenses,
        expense: expenseSum,
        isPaid, paymentDueDate, paymentDate: isPaid ? paymentDate : "", notes
      };
      showToast("운행기록이 수정되었습니다.");
    }
  } else {
    const newTrip = {
      id: "trip-" + Date.now(),
      userId: appState.currentUser.username,
      startDate, endDate, client, clientPhone, routeStart, routeLoad, routeVias, routeUnload, routeArrival, distance, fee, commission, expenses,
      expense: expenseSum,
      isPaid, paymentDueDate, paymentDate: isPaid ? paymentDate : "", notes
    };
    appState.trips.push(newTrip);
    showToast("운행기록이 등록되었습니다.");
  }

  saveData();
  clearTripDraft(false);
  closeTripModal();
  updateUI();
}

function editTrip(id) {
  openTripModal(id);
}

async function deleteTrip(id) {
  if (confirm("정말 이 운행기록을 삭제하시겠습니까?")) {
    if (supabaseClient && appState.currentUser && appState.currentUser.uid) {
      try {
        await supabaseClient.from('trips').delete().eq('id', id);
      } catch (err) {
        console.error("Supabase trip delete failed:", err);
      }
    }
    appState.trips = appState.trips.filter(t => t.id !== id);
    saveData();
    showToast("운행기록이 삭제되었습니다.");
    updateUI();
  }
}

// ----------------------------------------------------
// DUAL LOCATION PICKER & AUTO-DISTANCE
// ----------------------------------------------------
const dialogPicker = document.getElementById("dialog-location-picker");

function openLocationPicker(targetField) {
  pickerState.targetField = targetField;
  pickerState.selectedSido = '';
  pickerState.selectedSigungu = '';
  pickerState.selectedDong = '';
  
  document.getElementById("location-search-input").value = "";
  document.getElementById("location-search-results").style.display = "none";
  document.getElementById("picker-selection-text").innerText = "없음";
  document.getElementById("btn-confirm-location").setAttribute("disabled", "disabled");
  
  switchPickerTab('sido');
  dialogPicker.showModal();
}

function closeLocationPicker() {
  dialogPicker.close();
}

function switchPickerTab(tabName) {
  const tabs = ['sido', 'sigungu', 'dong'];
  
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    if (t === tabName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  renderPickerButtons(tabName);
}

function renderPickerButtons(tabName) {
  const grid = document.getElementById("picker-buttons-grid");
  grid.innerHTML = "";

  if (tabName === 'sido') {
    document.getElementById("tab-btn-sido").disabled = false;
    document.getElementById("tab-btn-sigungu").disabled = true;
    document.getElementById("tab-btn-dong").disabled = true;

    const sidos = Object.keys(REGION_DATA);
    sidos.forEach(sido => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `picker-btn ${pickerState.selectedSido === sido ? 'active' : ''}`;
      btn.textContent = sido;
      btn.onclick = () => selectSido(sido);
      grid.appendChild(btn);
    });
  } 
  
  else if (tabName === 'sigungu') {
    document.getElementById("tab-btn-sigungu").disabled = false;
    document.getElementById("tab-btn-dong").disabled = true;

    const sigungus = Object.keys(REGION_DATA[pickerState.selectedSido]);
    sigungus.forEach(sigungu => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `picker-btn ${pickerState.selectedSigungu === sigungu ? 'active' : ''}`;
      btn.textContent = sigungu;
      btn.onclick = () => selectSigungu(sigungu);
      grid.appendChild(btn);
    });
  } 
  
  else if (tabName === 'dong') {
    document.getElementById("tab-btn-dong").disabled = false;

    const dongs = REGION_DATA[pickerState.selectedSido][pickerState.selectedSigungu];
    dongs.forEach(dong => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `picker-btn ${pickerState.selectedDong === dong ? 'active' : ''}`;
      btn.textContent = dong;
      btn.onclick = () => selectDong(dong);
      grid.appendChild(btn);
    });
  }
}

function selectSido(sido) {
  pickerState.selectedSido = sido;
  pickerState.selectedSigungu = '';
  pickerState.selectedDong = '';
  document.getElementById("picker-selection-text").innerText = sido;
  document.getElementById("btn-confirm-location").setAttribute("disabled", "disabled");
  
  switchPickerTab('sigungu');
}

function selectSigungu(sigungu) {
  pickerState.selectedSigungu = sigungu;
  pickerState.selectedDong = '';
  document.getElementById("picker-selection-text").innerText = `${pickerState.selectedSido} ${sigungu}`;
  document.getElementById("btn-confirm-location").setAttribute("disabled", "disabled");
  
  switchPickerTab('dong');
}

function selectDong(dong) {
  pickerState.selectedDong = dong;
  const fullAddress = `${pickerState.selectedSido} ${pickerState.selectedSigungu} ${dong}`;
  document.getElementById("picker-selection-text").innerText = fullAddress;
  
  const btns = document.querySelectorAll("#picker-buttons-grid .picker-btn");
  btns.forEach(btn => {
    if (btn.textContent === dong) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  document.getElementById("btn-confirm-location").removeAttribute("disabled");
}

function confirmLocationSelection() {
  const fullAddress = `${pickerState.selectedSido} ${pickerState.selectedSigungu} ${pickerState.selectedDong}`;
  
  let fieldId = `trip-${pickerState.targetField}`;
  document.getElementById(fieldId).value = fullAddress;
  
  closeLocationPicker();
  triggerAutoDistanceCalculation();
}

function handleLocationSearch(query) {
  const resultsDiv = document.getElementById("location-search-results");
  resultsDiv.innerHTML = "";
  
  const val = query.trim().toLowerCase();
  if (val.length < 2) {
    resultsDiv.style.display = "none";
    return;
  }

  const matches = [];

  for (const sido in REGION_DATA) {
    for (const sigungu in REGION_DATA[sido]) {
      const dongs = REGION_DATA[sido][sigungu];
      dongs.forEach(dong => {
        if (dong.toLowerCase().includes(val)) {
          matches.push(`${sido} ${sigungu} ${dong}`);
        }
      });
    }
  }

  const maxMatches = matches.slice(0, 8);

  if (maxMatches.length > 0) {
    resultsDiv.style.display = "block";
    maxMatches.forEach(addr => {
      const item = document.createElement("div");
      item.className = "search-result-item";
      item.textContent = addr;
      item.onclick = () => selectSearchResult(addr);
      resultsDiv.appendChild(item);
    });
  } else {
    resultsDiv.style.display = "block";
    resultsDiv.innerHTML = `<div class="search-result-item" style="color: var(--text-muted); cursor: default;">검색 결과가 없습니다.</div>`;
  }
}

function selectSearchResult(address) {
  let fieldId = `trip-${pickerState.targetField}`;
  document.getElementById(fieldId).value = address;
  
  closeLocationPicker();
  triggerAutoDistanceCalculation();
}

// Distance Calculation based on geolocations (Updated to support multiple waypoints)
function triggerAutoDistanceCalculation() {
  const startAddr = document.getElementById("trip-start").value;
  const loadAddr = document.getElementById("trip-load").value;
  const unloadAddr = document.getElementById("trip-unload").value;
  const arrivalAddr = document.getElementById("trip-arrival").value;
  
  if (!loadAddr || !unloadAddr) return;

  const itinerary = [];
  if (startAddr) {
    itinerary.push(startAddr);
  }
  itinerary.push(loadAddr);
  
  // Collect active waypoints in physical sequence
  for (let i = 1; i <= 3; i++) {
    const val = document.getElementById(`trip-via-${i}`);
    if (val && val.value) {
      itinerary.push(val.value);
    }
  }
  
  itinerary.push(unloadAddr);

  if (arrivalAddr) {
    itinerary.push(arrivalAddr);
  }

  let totalDistance = 0;
  let success = true;

  for (let i = 0; i < itinerary.length - 1; i++) {
    const dist = calculateHaversineDistance(itinerary[i], itinerary[i+1]);
    if (dist !== null) {
      totalDistance += dist;
    } else {
      success = false;
      break;
    }
  }
  
  if (success && totalDistance > 0) {
    document.getElementById("trip-distance").value = totalDistance;
    
    const indicator = document.getElementById("distance-calc-indicator");
    indicator.style.display = "block";
    
    showToast(`경로 기반 총 주행거리(${totalDistance}km)가 자동 계산되었습니다.`);
  }
}

function calculateHaversineDistance(startText, endText) {
  let startCoords = null;
  let endCoords = null;

  for (const key in REGION_COORDINATES) {
    if (startText.includes(key)) {
      startCoords = REGION_COORDINATES[key];
    }
    if (endText.includes(key)) {
      endCoords = REGION_COORDINATES[key];
    }
  }

  if (!startCoords || !endCoords) return null;

  const R = 6371;
  const dLat = (endCoords.lat - startCoords.lat) * Math.PI / 180;
  const dLon = (endCoords.lon - startCoords.lon) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(startCoords.lat * Math.PI / 180) * Math.cos(endCoords.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const directDist = R * c;
  
  return Math.round(directDist * 1.25);
}



// ----------------------------------------------------
// COLLECTIONS / OUTSTANDING PAYMENTS (TAB 4)
// ----------------------------------------------------
function renderCollectionsPanel() {
  // Collection widget removed in Ver 2.12
}

function renderClientCollectionSummary() {
  const container = document.getElementById("collections-client-list");
  if (!container) return;
  container.innerHTML = "";

  const clientGroups = {};
  appState.trips.forEach(trip => {
    if (!trip.isPaid) {
      const displayClient = trip.client ? trip.client : "거래처 미지정";
      
      if (!clientGroups[displayClient]) {
        clientGroups[displayClient] = {
          unpaidCount: 0,
          unpaidSum: 0
        };
      }
      clientGroups[displayClient].unpaidCount++;
      clientGroups[displayClient].unpaidSum += Number(trip.fee || 0);
    }
  });

  const clients = Object.keys(clientGroups);

  if (clients.length === 0) {
    container.innerHTML = `
      <div class="client-summary-card">
        <span style="font-size: 0.85rem; color: var(--text-muted);">미수금이 잡힌 거래처가 없습니다.</span>
      </div>
    `;
    return;
  }

  clients.forEach(client => {
    const data = clientGroups[client];
    const card = document.createElement("div");
    card.className = "client-summary-card";
    card.innerHTML = `
      <div class="client-info-col">
        <span class="client-name">${client}</span>
        <span class="client-unpaid-count">미수금 ${data.unpaidCount}건</span>
      </div>
      <div class="client-money-col">
        <span class="client-unpaid-amount">${data.unpaidSum.toLocaleString()}원</span>
        <button class="btn btn-primary btn-sm" onclick="markClientAsPaid('${client}')">
          전체 수금완료
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}



function markTripAsPaid(tripId) {
  const trip = appState.trips.find(t => t.id === tripId);
  if (trip) {
    const feeStr = Number(trip.fee || 0).toLocaleString();
    if (confirm(`'${trip.client ? trip.client : "거래처 미지정"}'의 운송료(${feeStr}원) 수금 완료 처리를 하시겠습니까?`)) {
      trip.isPaid = true;
      trip.paymentDueDate = "";
      trip.paymentDate = getLocalDateTimeString();
      saveData();
      showToast(`${trip.client ? trip.client : '거래처 미지정'}의 수금 완료 처리가 반영되었습니다.`);
      updateUI();
    }
  }
}

function markClientAsPaid(clientName) {
  const actualName = clientName === "거래처 미지정" ? "" : clientName;
  if (confirm(`'${clientName}'의 모든 미수금 항목을 수금 완료 처리하시겠습니까?`)) {
    const nowStr = getLocalDateTimeString();
    appState.trips.forEach(trip => {
      if (trip.client === actualName && !trip.isPaid) {
        trip.isPaid = true;
        trip.paymentDueDate = "";
        trip.paymentDate = nowStr;
      }
    });
    saveData();
    showToast(`'${clientName}'의 모든 대금이 수금 완료로 처리되었습니다.`);
    updateUI();
  }
}

// ----------------------------------------------------
// SETTINGS MANAGEMENT (TAB 5)
// ----------------------------------------------------
function initSettingsForm() {
  document.getElementById("btn-export").addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const dlAnchorElem = document.createElement("a");
    const todayStr = getLocalDateString().replace(/-/g, "");
    
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `logilog_backup_${todayStr}.json`);
    dlAnchorElem.click();
    showToast("데이터 백업 파일이 다운로드되었습니다.");
  });

  const fileInput = document.getElementById("import-file");
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const importedData = JSON.parse(evt.target.result);
        
        if (Array.isArray(importedData.trips) && importedData.settings) {
          appState.trips = importedData.trips;
          if (Array.isArray(importedData.clients)) {
            appState.clients = importedData.clients;
          }
          if (Array.isArray(importedData.expenses)) {
            appState.expenses = importedData.expenses;
          }
          appState.settings = { ...DEFAULT_SETTINGS, ...importedData.settings };
          if (importedData.theme) appState.theme = importedData.theme;

          saveData();
          showToast("데이터가 성공적으로 복원되었습니다. 앱을 재기동합니다.");
          
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          showToast("유효한 백업 JSON 파일 형식이 아닙니다.");
        }
      } catch (err) {
        showToast("백업 파일을 읽는 중에 오류가 발생했습니다.");
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("btn-reset").addEventListener("click", () => {
    if (confirm("경고! 앱의 모든 저장된 정보가 영구히 소멸합니다. 정말 초기화하시겠습니까?")) {
      localStorage.clear();
      showToast("데이터가 성공적으로 공장 초기화되었습니다. 앱을 재기동합니다.");
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  });
}

// ----------------------------------------------------
// UI SYNCHRONIZER
// ----------------------------------------------------
function updateUI() {
  checkAuthAndSetUI();
  if (!appState.currentUser) return;

  renderHomePanel();
  updateDashboardStats();
  populateTripMonthFilter();
  renderTripsList();
  renderExpensesPanel();

  const activeNav = document.querySelector(".app-nav .nav-item.active");
  const activeTarget = activeNav ? activeNav.getAttribute("data-target") : "home";
  if (activeTarget === "admin") {
    renderAdminPanel();
  }
}

// ----------------------------------------------------
// LIVE QUICK TRACKER LOGIC (Ver 2.5 - Dynamic Stepper & Branching Flow)
// ----------------------------------------------------
let trackerInterval = null;

function initTracker() {
  const demoToggle = document.getElementById("tracker-demo-toggle");
  if (demoToggle) {
    demoToggle.checked = appState.tracker.demoMode;
  }
  if (appState.tracker && appState.tracker.step > 0) {
    startTrackerTimer();
  }
  updateTrackerUI();
}

function saveTrackerData() {
  localStorage.setItem("logilog_tracker", JSON.stringify(appState.tracker));
}

function updateTrackerUI() {
  const step = appState.tracker.step;

  // Ensure arrays are initialized
  if (!appState.tracker.routeVias) appState.tracker.routeVias = [];
  if (!appState.tracker.viaTimes) appState.tracker.viaTimes = [];
  if (!appState.tracker.viaCompleteTimes) appState.tracker.viaCompleteTimes = [];
  if (!appState.tracker.stepTimes) appState.tracker.stepTimes = [null, null, null, null, null, null, null];
  if (!appState.tracker.stepTimestamps) appState.tracker.stepTimestamps = [null, null, null, null, null, null, null];
  if (!appState.tracker.viaTimestamps) appState.tracker.viaTimestamps = [];
  if (!appState.tracker.viaCompleteTimestamps) appState.tracker.viaCompleteTimestamps = [];

  // 2. Generate dynamic milestones for the stepper
  const milestones = [];

  // Departure (출발지) milestone
  if (appState.tracker.departureLocation || step === 1) {
    milestones.push({
      label: "출발지",
      status: appState.tracker.departureLocation ? "completed" : "active",
      time: appState.tracker.stepTimes[0] || "",
      address: appState.tracker.departureLocation || "",
      timestamp: appState.tracker.stepTimestamps[0] || null
    });
  }

  // Loading Arrival (상차지 도착) milestone
  let loadArrivalStatus = "pending";
  if (step === 2) {
    loadArrivalStatus = "active";
  } else if (step > 2) {
    loadArrivalStatus = "completed";
  }
  milestones.push({
    label: "상차지 도착",
    status: loadArrivalStatus,
    time: appState.tracker.stepTimes[1] || "",
    address: loadArrivalStatus !== "pending" ? (appState.tracker.startLocation || "") : "",
    timestamp: appState.tracker.stepTimestamps[1] || null
  });

  // Loading Complete (상차 완료) milestone
  let loadCompleteStatus = "pending";
  if (step > 2) {
    loadCompleteStatus = "completed";
  }
  milestones.push({
    label: "상차완료",
    status: loadCompleteStatus,
    time: appState.tracker.stepTimes[2] || "",
    address: "", // Address hidden on loading complete!
    timestamp: appState.tracker.stepTimestamps[2] || null
  });

  // Waypoints (경유지) milestones
  appState.tracker.routeVias.forEach((via, index) => {
    // Waypoint Arrival milestone
    let viaArrivalStatus = "pending";
    if (index < appState.tracker.viaCompleteTimes.length) {
      viaArrivalStatus = "completed";
    } else if (index === appState.tracker.viaCompleteTimes.length) {
      viaArrivalStatus = (step === 9) ? "active" : "completed";
    }
    milestones.push({
      label: `경유지 ${index + 1} 도착`,
      status: viaArrivalStatus,
      time: appState.tracker.viaTimes[index] || "",
      address: appState.tracker.routeVias[index] || "",
      timestamp: appState.tracker.viaTimestamps[index] || null
    });

    // Waypoint Complete milestone
    let viaCompleteStatus = "pending";
    if (index < appState.tracker.viaCompleteTimes.length) {
      viaCompleteStatus = "completed";
    }
    milestones.push({
      label: `경유지 ${index + 1} 완료`,
      status: viaCompleteStatus,
      time: appState.tracker.viaCompleteTimes[index] || "",
      address: "", // Address hidden on waypoint complete!
      timestamp: appState.tracker.viaCompleteTimestamps[index] || null
    });
  });

  // Unloading (하차지) milestones
  // Unloading Arrival (하차지 도착) milestone
  let unloadArrivalStatus = "pending";
  if (step === 5) {
    unloadArrivalStatus = "active";
  } else if (appState.tracker.stepTimes[4]) {
    unloadArrivalStatus = "completed";
  }
  milestones.push({
    label: "하차지 도착",
    status: unloadArrivalStatus,
    time: appState.tracker.stepTimes[4] || "",
    address: unloadArrivalStatus !== "pending" ? (appState.tracker.endLocation || "") : "",
    timestamp: appState.tracker.stepTimestamps[4] || null
  });

  // Unloading Complete (하차 완료) milestone
  let unloadCompleteStatus = "pending";
  if (appState.tracker.stepTimes[5]) {
    unloadCompleteStatus = "completed";
  }
  milestones.push({
    label: "하차완료",
    status: unloadCompleteStatus,
    time: appState.tracker.stepTimes[5] || "",
    address: "", // Address hidden on unloading complete!
    timestamp: appState.tracker.stepTimestamps[5] || null
  });

  // Arrival (도착지) milestone
  if (step === 6 || appState.tracker.arrivalLocation) {
    milestones.push({
      label: "도착지",
      status: appState.tracker.arrivalLocation ? "completed" : "active",
      time: appState.tracker.stepTimes[6] || "",
      address: appState.tracker.arrivalLocation || "",
      timestamp: appState.tracker.stepTimestamps[6] || null
    });
  }

  // Calculate durations and attach to milestones (Simplified inline display next to labels)
  for (let i = 0; i < milestones.length - 1; i++) {
    const m1 = milestones[i];
    const m2 = milestones[i + 1];
    
    if (m1.timestamp && m2.timestamp) {
      const diffMs = m2.timestamp - m1.timestamp;
      const diffMins = Math.round(diffMs / 60000);
      
      const d1 = new Date(m1.timestamp);
      const d2 = new Date(m2.timestamp);
      const dateChanged = d1.toDateString() !== d2.toDateString();
      
      let dateStr = "";
      if (dateChanged) {
        const month = d2.getMonth() + 1;
        const date = d2.getDate();
        dateStr = `${month}/${date} `;
      }
      m2.durationHtml = `<span class="line-duration">(${dateStr}${diffMins}분 소요)</span>`;
    }
  }

  // 3. Render stepper HTML (Rounded Bar design with dynamic alignment)
  const stepperContainer = document.querySelector(".tracker-stepper");
  if (stepperContainer) {
    let html = `
      <div class="tracker-step-nodes-container" style="width: 100%; min-height: 100%; display: flex; flex-direction: column; justify-content: space-between; z-index: 3; position: relative;">
        <div id="tracker-progress-track" class="tracker-progress-track">
          <div id="tracker-progress-fill" class="tracker-progress-fill"></div>
        </div>
        <div id="tracker-progress-indicator" class="tracker-progress-indicator"></div>
    `;
    milestones.forEach((m, idx) => {
      let statusIcon = "";
      if (m.status === "completed") {
        statusIcon = `<i data-lucide="check" class="milestone-status-icon completed" style="width: 14px; height: 14px; margin-top: 1px;"></i>`;
      } else if (m.status === "active") {
        statusIcon = `<i data-lucide="circle-dot" class="milestone-status-icon active" style="width: 14px; height: 14px; margin-top: 1px;"></i>`;
      } else {
        statusIcon = `<i data-lucide="circle" class="milestone-status-icon pending" style="width: 14px; height: 14px; margin-top: 1px;"></i>`;
      }

      const isVia = m.label.includes("경유지");
      const viaClass = isVia ? "via-node" : "";
      html += `
        <div class="step-node ${m.status} ${viaClass}" style="padding-left: 28px; position: relative;">
          <div class="node-text-group" style="width: 100%;">
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              ${statusIcon}
              <span class="node-label">${m.label}</span>
              <span class="node-time">${m.time}</span>
              ${m.durationHtml || ""}
            </div>
            ${m.address ? `<span class="node-address" title="${m.address}">${cleanAddressForDisplay(m.address)}</span>` : ""}
          </div>
        </div>
      `;
    });
    html += `</div>`;
    stepperContainer.innerHTML = html;
    
    // Automatically adjust track, fill and pulsing indicator after rendering (with layout-settle timeouts)
    requestAnimationFrame(() => alignTrackerProgressBar());
    setTimeout(() => alignTrackerProgressBar(), 50);
    setTimeout(() => alignTrackerProgressBar(), 200);
  }

  // 5. Render action buttons dynamically
  const optionActions = document.getElementById("tracker-option-actions");
  const mainActions = document.getElementById("tracker-main-actions");

  if (optionActions && mainActions) {
    let optionsHtml = "";
    let mainHtml = "";

    // Reset & Undo buttons side-by-side
    const hasHistory = appState.tracker.history && appState.tracker.history.length > 0;
    let resetBtnHtml = "";
    if (step > 0) {
      resetBtnHtml = `
        <button class="btn-tracker-option btn-danger" onclick="cancelTracker()">
          <i data-lucide="trash-2" class="icon-sm"></i>
          <span>초기화</span>
        </button>
        <button class="btn-tracker-option btn-warning" onclick="undoTrackerStep()" ${hasHistory ? '' : 'disabled'}>
          <i data-lucide="undo-2" class="icon-sm"></i>
          <span>되돌리기</span>
        </button>
      `;
    }

    if (step === 0) {
      optionsHtml = `
        <button class="btn-tracker-option btn-tracker-small" onclick="startTrackerWithDeparture(true)">
          <i data-lucide="play" class="icon-sm"></i>
          <span>상차지로 출발</span>
        </button>
      `;
      mainHtml = `
        <button class="btn-tracker-main state-start" onclick="startTrackerWithDeparture(false)">
          <i data-lucide="map-pin" class="icon-lg"></i>
          <span>운행 시작<br>(상차지 도착)</span>
        </button>
      `;
    } else if (step === 1) {
      optionsHtml = resetBtnHtml;
      mainHtml = `
        <button class="btn-tracker-main state-load-arrive" onclick="progressTrackerToStep2()">
          <i data-lucide="map-pin" class="icon-lg"></i>
          <span>상차지 도착</span>
        </button>
      `;
    } else if (step === 2) {
      optionsHtml = resetBtnHtml;
      mainHtml = `
        <button class="btn-tracker-main state-load-complete" onclick="progressTrackerToStep3()">
          <i data-lucide="anchor" class="icon-lg"></i>
          <span>상차 완료</span>
        </button>
      `;
    } else if (step === 3) {
      const isViaDisabled = appState.tracker.routeVias.length >= 3;
      optionsHtml = `
        ${resetBtnHtml}
        <button class="btn-tracker-option btn-tracker-small" onclick="${isViaDisabled ? '' : 'addTrackerWaypoint()'}" ${isViaDisabled ? 'disabled' : ''}>
          <i data-lucide="plus-circle" class="icon-sm"></i>
          <span>경유지 추가</span>
        </button>
      `;
      mainHtml = `
        <button class="btn-tracker-main state-unload-arrive" onclick="progressTrackerToStep5()">
          <i data-lucide="navigation" class="icon-lg"></i>
          <span>하차지 도착</span>
        </button>
      `;
    } else if (step === 9) {
      optionsHtml = resetBtnHtml;
      mainHtml = `
        <button class="btn-tracker-main state-via-complete" onclick="completeTrackerWaypoint()">
          <i data-lucide="check-circle" class="icon-lg"></i>
          <span>경유 완료</span>
        </button>
      `;
    } else if (step === 4 || step === 5) {
      optionsHtml = resetBtnHtml;
      mainHtml = `
        <button class="btn-tracker-main state-unload-complete" onclick="progressTrackerToStep7()">
          <i data-lucide="check-circle" class="icon-lg"></i>
          <span>하차 완료</span>
        </button>
      `;
    } else if (step === 7) {
      optionsHtml = `
        ${resetBtnHtml}
        <button class="btn-tracker-option btn-tracker-small" onclick="completeTrackerAndRegister(true)">
          <i data-lucide="home" class="icon-sm"></i>
          <span>차고지 도착</span>
        </button>
      `;
      mainHtml = `
        <button class="btn-tracker-main state-finish" onclick="completeTrackerAndRegister(false)">
          <i data-lucide="edit-3" class="icon-lg"></i>
          <span>운행완료<br>(기록 등록)</span>
        </button>
      `;
    } else if (step === 6) {
      optionsHtml = resetBtnHtml;
      mainHtml = `
        <button class="btn-tracker-main state-finish-garage" onclick="completeTrackerAndRegister(true)">
          <i data-lucide="check-circle" class="icon-lg"></i>
          <span>차고지 도착<br>(기록 등록)</span>
        </button>
      `;
    }

    optionActions.innerHTML = optionsHtml;
    mainActions.innerHTML = mainHtml;
    lucide.createIcons();
  }

  // 6. Update home screen tracker hero button
  const heroStatusSubtitle = document.getElementById("tracker-hero-status-subtitle");
  const heroStatusTitle = document.getElementById("tracker-hero-status-title");
  const heroContainer = document.querySelector(".tracker-hero-container");
  
  if (heroStatusSubtitle && heroStatusTitle) {
    if (step === 0) {
      heroStatusSubtitle.textContent = "실시간 기록 시작하기";
      heroStatusTitle.textContent = "스마트 운행기록기";
      if (heroContainer) heroContainer.classList.remove("driving-active");
    } else {
      let currentMilestoneLabel = "운행 시작";
      if (step === 1) currentMilestoneLabel = "출발지 완료";
      else if (step === 2) currentMilestoneLabel = "상차지 도착";
      else if (step === 3) currentMilestoneLabel = "이동 중";
      else if (step === 9) {
        const index = appState.tracker.viaCompleteTimes ? appState.tracker.viaCompleteTimes.length : 0;
        currentMilestoneLabel = `경유지 ${index + 1} 대기`;
      }
      else if (step === 5) currentMilestoneLabel = "하차지 대기";
      else if (step === 7) currentMilestoneLabel = "하차 완료";
      
      heroStatusSubtitle.textContent = `실시간 운행 중 (${currentMilestoneLabel})`;
      heroStatusTitle.innerHTML = `<span class="live-dot-indicator"></span>스마트 운행기록기`;
      if (heroContainer) heroContainer.classList.add("driving-active");
    }
    lucide.createIcons();
  }

  // Render VMS
  renderHomePanel();
}

function getFormattedTime() {
  const now = new Date();
  const hrs = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  return `${hrs}:${mins}`;
}



function getTrackerProgressPercent(step) {
  switch(step) {
    case 0: return "0%";
    case 1: return "15%";
    case 2: return "30%";
    case 3: return "50%";
    case 9: return "70%";
    case 5: return "85%";
    case 7: return "100%";
    default: return "0%";
  }
}

function startTrackerTimer() {
  // Obsolete in Ver 2.28
}

function stopTrackerTimer() {
  // Obsolete in Ver 2.28
}

function toggleTrackerDemoMode() {
  const checkbox = document.getElementById("tracker-demo-toggle");
  if (checkbox) {
    appState.tracker.demoMode = checkbox.checked;
    saveTrackerData();
    showToast(appState.tracker.demoMode ? "시뮬레이터(데모) 모드가 활성화되었습니다." : "실시간 GPS 기록 모드가 활성화되었습니다.");
  }
}

function findNearestRegion(lat, lon) {
  let minDistance = Infinity;
  let nearestRegion = "";
  for (const [regionName, coords] of Object.entries(REGION_COORDINATES)) {
    const dLat = coords.lat - lat;
    const dLon = coords.lon - lon;
    const dist = dLat * dLat + dLon * dLon;
    if (dist < minDistance) {
      minDistance = dist;
      nearestRegion = regionName;
    }
  }
  if (nearestRegion) {
    const parts = nearestRegion.split(" ");
    const sido = parts[0];
    const sigungu = parts.slice(1).join(" ");
    if (REGION_DATA[sido] && REGION_DATA[sido][sigungu]) {
      const dongs = REGION_DATA[sido][sigungu];
      const defaultDong = dongs[0] || "";
      return `${nearestRegion} ${defaultDong}`.trim();
    }
  }
  return nearestRegion || "서울특별시 강남구 역삼동";
}

function captureCurrentLocation(target, callback) {
  if (appState.tracker.demoMode) {
    let simulatedAddress = "서울특별시 강남구 역삼동";
    if (target === 'departure') {
      simulatedAddress = "인천광역시 중구 신흥동";
    } else if (target === 'load') {
      simulatedAddress = "경기도 평택시 포승읍";
    } else if (target === 'waypoint') {
      const viasCount = appState.tracker.routeVias ? appState.tracker.routeVias.length : 0;
      if (viasCount === 0) {
        simulatedAddress = "충청남도 천안시 서북구";
      } else if (viasCount === 1) {
        simulatedAddress = "대전광역시 대덕구 신대동";
      } else {
        simulatedAddress = "경상북도 칠곡군 왜관읍";
      }
    } else if (target === 'unload') {
      simulatedAddress = "부산광역시 남구 감만동";
    } else if (target === 'arrival') {
      simulatedAddress = "인천광역시 중구 신흥동";
    }
    callback(simulatedAddress);
    return;
  }
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const resolved = findNearestRegion(position.coords.latitude, position.coords.longitude);
        callback(resolved);
      },
      (error) => {
        console.error("GPS error:", error);
        showToast("GPS 수신 오류로 기본 위치를 적용합니다.");
        callback("서울특별시 강남구 역삼동");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  } else {
    showToast("GPS를 지원하지 않는 브라우저입니다.");
    callback("서울특별시 강남구 역삼동");
  }
}

function setFieldToCurrentLocation(inputId, target) {
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;
  
  captureCurrentLocation(target, (address) => {
    inputEl.value = address;
    
    // Automatically trigger distance calculation when address changes
    triggerAutoDistanceCalculation();
    
    // For start and unload, toggle open the field wrapper if needed
    if (target === 'departure') {
      toggleLocationField('start', true);
    } else if (target === 'arrival') {
      toggleLocationField('arrival', true);
    }
    
    // Fill time for load and unload
    if (target === 'load') {
      setDatetimeShortcut('start', 'now');
    } else if (target === 'unload') {
      setDatetimeShortcut('end', 'now');
    }
    
    showToast("현위치가 입력되었습니다.");
  });
}

function startTrackerWithDeparture(withDeparture) {
  const target = withDeparture ? 'departure' : 'load';
  
  saveTrackerStateForUndo();
  const clickTime = getFormattedTime();
  const clickTimestamp = Date.now();
  appState.tracker.startTime = clickTimestamp;
  appState.tracker.routeVias = [];
  appState.tracker.viaTimes = [];
  appState.tracker.viaCompleteTimes = [];
  appState.tracker.viaTimestamps = [];
  appState.tracker.viaCompleteTimestamps = [];
  appState.tracker.arrivalLocation = "";
  appState.tracker.endLocation = "";
  appState.tracker.startLocation = "";
  
  if (withDeparture) {
    appState.tracker.step = 1;
    appState.tracker.departureLocation = "위치 확인 중...";
    appState.tracker.stepTimes = [clickTime, null, null, null, null, null, null];
    appState.tracker.stepTimestamps = [clickTimestamp, null, null, null, null, null, null];
    showToast(`운행 기록을 시작합니다 (위치 확인 중)`);
  } else {
    appState.tracker.step = 2;
    appState.tracker.departureLocation = "";
    appState.tracker.startLocation = "위치 확인 중...";
    appState.tracker.stepTimes = [null, clickTime, null, null, null, null, null];
    appState.tracker.stepTimestamps = [null, clickTimestamp, null, null, null, null, null];
    showToast(`상차지 도착 상태로 기록을 시작합니다 (위치 확인 중)`);
  }
  saveTrackerData();
  updateTrackerUI();

  captureCurrentLocation(target, (resolvedAddress) => {
    if (withDeparture) {
      appState.tracker.departureLocation = resolvedAddress;
      showToast(`출발지 기록됨: ${resolvedAddress}`);
    } else {
      appState.tracker.startLocation = resolvedAddress;
      showToast(`상차지 기록됨: ${resolvedAddress}`);
    }
    saveTrackerData();
    updateTrackerUI();
  });
}

function progressTrackerToStep2() {
  saveTrackerStateForUndo();
  const clickTime = getFormattedTime();
  const clickTimestamp = Date.now();
  appState.tracker.step = 2;
  appState.tracker.startLocation = "위치 확인 중...";
  appState.tracker.stepTimes[1] = clickTime;
  if (!appState.tracker.stepTimestamps) appState.tracker.stepTimestamps = [null, null, null, null, null, null, null];
  appState.tracker.stepTimestamps[1] = clickTimestamp;
  showToast("상차지에 도착했습니다. (위치 확인 중)");
  saveTrackerData();
  updateTrackerUI();

  captureCurrentLocation('load', (resolvedAddress) => {
    appState.tracker.startLocation = resolvedAddress;
    saveTrackerData();
    updateTrackerUI();
  });
}

// Keep stubs to prevent backward crashes
function progressTrackerToStep3() {
  saveTrackerStateForUndo();
  const clickTime = getFormattedTime();
  const clickTimestamp = Date.now();
  appState.tracker.step = 3;
  appState.tracker.startLocation = "위치 확인 중...";
  appState.tracker.stepTimes[2] = clickTime;
  if (!appState.tracker.stepTimestamps) appState.tracker.stepTimestamps = [null, null, null, null, null, null, null];
  appState.tracker.stepTimestamps[2] = clickTimestamp;
  showToast(`상차 완료! 출발합니다. (위치 확인 중)`);
  saveTrackerData();
  updateTrackerUI();

  captureCurrentLocation('load', (resolvedAddress) => {
    appState.tracker.startLocation = resolvedAddress;
    showToast(`상차지로 기록됨: ${resolvedAddress}`);
    saveTrackerData();
    updateTrackerUI();
  });
}

function addTrackerWaypoint() {
  if (!appState.tracker.routeVias) appState.tracker.routeVias = [];
  if (!appState.tracker.viaTimes) appState.tracker.viaTimes = [];
  if (!appState.tracker.viaTimestamps) appState.tracker.viaTimestamps = [];
  if (appState.tracker.routeVias.length >= 3) {
    showToast("경유지는 최대 3개까지만 추가할 수 있습니다.");
    return;
  }
  
  saveTrackerStateForUndo();
  const clickTime = getFormattedTime();
  const clickTimestamp = Date.now();
  const index = appState.tracker.routeVias.length;
  appState.tracker.routeVias.push("위치 확인 중...");
  appState.tracker.viaTimes.push(clickTime);
  appState.tracker.viaTimestamps.push(clickTimestamp);
  appState.tracker.step = 9; // Move to Waypoint Waiting state
  showToast(`경유지에 도착했습니다. (위치 확인 중)`);
  saveTrackerData();
  updateTrackerUI();

  captureCurrentLocation('waypoint', (resolvedAddress) => {
    appState.tracker.routeVias[index] = resolvedAddress;
    showToast(`경유지 ${index + 1} 도착 기록됨: ${resolvedAddress}`);
    saveTrackerData();
    updateTrackerUI();
  });
}

function completeTrackerWaypoint() {
  saveTrackerStateForUndo();
  const clickTime = getFormattedTime();
  const clickTimestamp = Date.now();
  if (!appState.tracker.viaCompleteTimes) appState.tracker.viaCompleteTimes = [];
  if (!appState.tracker.viaCompleteTimestamps) appState.tracker.viaCompleteTimestamps = [];
  appState.tracker.viaCompleteTimes.push(clickTime);
  appState.tracker.viaCompleteTimestamps.push(clickTimestamp);
  showToast("경유 대기 완료! 다음 목적지로 이동하세요.");
  appState.tracker.step = 3; // Return to Loaded/Moving state
  saveTrackerData();
  updateTrackerUI();
}

function progressTrackerToStep5() {
  saveTrackerStateForUndo();
  const clickTime = getFormattedTime();
  const clickTimestamp = Date.now();
  appState.tracker.step = 5;
  appState.tracker.endLocation = "위치 확인 중...";
  appState.tracker.stepTimes[4] = clickTime;
  if (!appState.tracker.stepTimestamps) appState.tracker.stepTimestamps = [null, null, null, null, null, null, null];
  appState.tracker.stepTimestamps[4] = clickTimestamp;
  showToast("하차지에 도착했습니다. (위치 확인 중)");
  saveTrackerData();
  updateTrackerUI();

  captureCurrentLocation('unload', (resolvedAddress) => {
    appState.tracker.endLocation = resolvedAddress;
    saveTrackerData();
    updateTrackerUI();
  });
}

function progressTrackerToStep7() {
  saveTrackerStateForUndo();
  const clickTime = getFormattedTime();
  const clickTimestamp = Date.now();
  appState.tracker.step = 7;
  appState.tracker.endLocation = "위치 확인 중...";
  appState.tracker.stepTimes[5] = clickTime;
  if (!appState.tracker.stepTimestamps) appState.tracker.stepTimestamps = [null, null, null, null, null, null, null];
  appState.tracker.stepTimestamps[5] = clickTimestamp;
  showToast(`하차 완료! (위치 확인 중)`);
  saveTrackerData();
  updateTrackerUI();

  captureCurrentLocation('unload', (resolvedAddress) => {
    appState.tracker.endLocation = resolvedAddress;
    showToast(`하차지로 기록됨: ${resolvedAddress}`);
    saveTrackerData();
    updateTrackerUI();
  });
}

function startTrackerToGarage() {
  saveTrackerStateForUndo();
  const clickTime = getFormattedTime();
  const clickTimestamp = Date.now();
  appState.tracker.step = 6;
  if (!appState.tracker.stepTimestamps) appState.tracker.stepTimestamps = [null, null, null, null, null, null, null];
  appState.tracker.stepTimes[3] = clickTime;
  appState.tracker.stepTimestamps[3] = clickTimestamp;
  showToast("차고지로 출발합니다.");
  saveTrackerData();
  updateTrackerUI();
}

function openTrackerDialog() {
  const dialog = document.getElementById("dialog-tracker");
  if (dialog) {
    dialog.setAttribute("open", "");
    updateTrackerUI();
  }
}

function closeTrackerDialog() {
  const dialog = document.getElementById("dialog-tracker");
  if (dialog) {
    dialog.removeAttribute("open");
  }
}

function completeTrackerAndRegister(withArrival) {
  closeTrackerDialog();
  if (withArrival) {
    showToast("차고지 위치 확인 중...");
    captureCurrentLocation('arrival', (resolvedAddress) => {
      const clickTime = getFormattedTime();
      const clickTimestamp = Date.now();
      appState.tracker.arrivalLocation = resolvedAddress;
      appState.tracker.stepTimes[6] = clickTime;
      if (!appState.tracker.stepTimestamps) appState.tracker.stepTimestamps = [null, null, null, null, null, null, null];
      appState.tracker.stepTimestamps[6] = clickTimestamp;
      showToast(`차고지 도착! 최종도착지로 기록됨: ${resolvedAddress}`);
      openTripModalWithPreload(
        appState.tracker.departureLocation,
        appState.tracker.startLocation,
        appState.tracker.endLocation,
        appState.tracker.routeVias,
        resolvedAddress
      );
      resetTrackerState();
    });
  } else {
    openTripModalWithPreload(
      appState.tracker.departureLocation,
      appState.tracker.startLocation,
      appState.tracker.endLocation,
      appState.tracker.routeVias,
      ""
    );
    resetTrackerState();
  }
}

function resetTrackerState() {
  appState.tracker.step = 0;
  appState.tracker.startTime = null;
  appState.tracker.departureLocation = "";
  appState.tracker.startLocation = "";
  appState.tracker.endLocation = "";
  appState.tracker.arrivalLocation = "";
  appState.tracker.routeVias = [];
  appState.tracker.viaTimes = [];
  appState.tracker.viaCompleteTimes = [];
  appState.tracker.viaTimestamps = [];
  appState.tracker.viaCompleteTimestamps = [];
  appState.tracker.stepTimes = [null, null, null, null, null, null, null];
  appState.tracker.stepTimestamps = [null, null, null, null, null, null, null];
  // Clear undo history on reset
  appState.tracker.history = [];
  saveTrackerData();
  updateTrackerUI();
}

function saveTrackerStateForUndo() {
  if (!appState.tracker.history) {
    appState.tracker.history = [];
  }
  // Create a deep copy of current state, excluding history array to avoid nesting
  const stateCopy = JSON.parse(JSON.stringify(appState.tracker));
  delete stateCopy.history;
  appState.tracker.history.push(stateCopy);
  if (appState.tracker.history.length > 10) {
    appState.tracker.history.shift();
  }
}

function undoTrackerStep() {
  if (!appState.tracker.history || appState.tracker.history.length === 0) {
    showToast("되돌릴 기록이 없습니다.");
    return;
  }
  const prevState = appState.tracker.history.pop();
  const currentHistory = appState.tracker.history;
  
  // Revert tracker state
  appState.tracker = prevState;
  appState.tracker.history = currentHistory;
  
  saveTrackerData();
  updateTrackerUI();
  
  // Reopen modal dialog if closed
  const dialog = document.getElementById("dialog-tracker");
  if (dialog && !dialog.hasAttribute("open")) {
    dialog.setAttribute("open", "");
  }
  showToast("이전 단계로 되돌렸습니다.");
}

function alignTrackerProgressBar() {
  const stepperContainer = document.querySelector(".tracker-stepper");
  if (!stepperContainer) return;
  
  const nodes = stepperContainer.querySelectorAll(".step-node");
  const completedNodes = stepperContainer.querySelectorAll(".step-node.completed");
  const lastCompleted = completedNodes[completedNodes.length - 1] || null;
  const activeNode = stepperContainer.querySelector(".step-node.active") || lastCompleted;
  
  const track = document.getElementById("tracker-progress-track");
  const fill = document.getElementById("tracker-progress-fill");
  const indicator = document.getElementById("tracker-progress-indicator");
  
  if (!nodes.length || !track || !fill) return;
  
  const firstNode = nodes[0];
  const lastNode = nodes[nodes.length - 1];
  
  // y1: first icon center, y2: last icon center
  const y1 = firstNode.offsetTop + (firstNode.offsetHeight / 2);
  const y2 = lastNode.offsetTop + (lastNode.offsetHeight / 2);
  
  // Guard against uncomputed layout (hidden state). 
  // This prevents the track/fill heights from flashing to 0px on opening or state transition reflows.
  if (y1 === 0 && y2 === 0) return;
  
  track.style.top = y1 + "px";
  track.style.height = (y2 - y1) + "px";
  
  if (activeNode) {
    const yActive = activeNode.offsetTop + (activeNode.offsetHeight / 2);
    fill.style.height = (yActive - y1) + "px";
    if (indicator) {
      indicator.style.display = "block";
      indicator.style.top = yActive + "px";
    }
  } else {
    fill.style.height = "0px";
    if (indicator) indicator.style.display = "none";
  }
}

// Keep stubs to prevent backward crashes
function cancelTracker() {
  if (confirm("정말로 현재 진행 중인 운행 기록을 취소하시겠습니까? 모든 캡처 기록이 유실됩니다.")) {
    saveTrackerStateForUndo();
    resetTrackerState();
    showToast("운행 기록이 취소되었습니다.");
    closeTrackerDialog();
  }
}

function progressTrackerStep() {
  console.warn("progressTrackerStep is deprecated.");
}

function openTripModalWithPreload(departure, load, unload, vias = [], arrival = "") {
  openTripModal();
  document.getElementById("trip-start").value = departure || "";
  document.getElementById("trip-load").value = load || "";
  document.getElementById("trip-unload").value = unload || "";
  document.getElementById("trip-arrival").value = arrival || "";
  if (departure) toggleLocationField('start', true);
  if (arrival) toggleLocationField('arrival', true);
  
  const waypointsContainer = document.getElementById("waypoints-container");
  if (waypointsContainer) {
    waypointsContainer.innerHTML = "";
  }
  if (vias && vias.length > 0) {
    vias.forEach(via => {
      addWaypointField(via);
    });
  }
  triggerAutoDistanceCalculation();
}

function renderDashboardTrips(trips) {
  // Obsolete in Ver 2.13
}

function extractDong(address) {
  if (!address) return "-";
  const parts = address.trim().split(" ");
  return parts[parts.length - 1] || address;
}

function cleanAddressForDisplay(address) {
  if (!address) return "";
  return address.trim().replace(/^대한민국\s+/, "");
}

function formatPhoneNumber(phone) {
  if (!phone) return "";
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  } else if (digits.length === 10) {
    if (digits.startsWith("02")) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
    } else {
      return digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    }
  } else if (digits.length === 9) {
    if (digits.startsWith("02")) {
      return digits.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3");
    }
  }
  return digits;
}

function toggleDashboardTripDetail(element) {
  const isCurrentlyExpanded = element.classList.contains("expanded");
  
  const container = element.parentElement;
  if (container) {
    const expandedItems = container.querySelectorAll(".expanded");
    expandedItems.forEach(item => {
      if (item !== element) {
        item.classList.remove("expanded");
      }
    });
  }
  
  if (isCurrentlyExpanded) {
    element.classList.remove("expanded");
  } else {
    element.classList.add("expanded");
  }
}

// ----------------------------------------------------
// VER 2.10 CUSTOM PERIOD SELECTOR & TRIPS FILTERS
// ----------------------------------------------------
function toggleTripsUnpaidOnly() {
  appState.tripsUnpaidOnly = !appState.tripsUnpaidOnly;
  
  const btn = document.getElementById("btn-trips-unpaid-only");
  if (btn) {
    if (appState.tripsUnpaidOnly) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  }
  
  renderTripsList();
}

function setTripsPeriod(period) {
  appState.currentTripsPeriod = period;
  
  const filterBtns = document.querySelectorAll("#trips-period-filters .filter-btn");
  filterBtns.forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-period") === period) {
      btn.classList.add("active");
    }
  });

  if (period !== 'custom') {
    const customBtn = document.getElementById("btn-trips-custom-period");
    if (customBtn) customBtn.textContent = "직접선택";
  }

  renderTripsList();
}

function setTripsSortOrder(order) {
  appState.tripsSortOrder = order;
  
  const btnDesc = document.getElementById("btn-trips-sort-desc");
  const btnAsc = document.getElementById("btn-trips-sort-asc");
  if (btnDesc && btnAsc) {
    if (order === "desc") {
      btnDesc.classList.add("active");
      btnAsc.classList.remove("active");
    } else {
      btnDesc.classList.remove("active");
      btnAsc.classList.add("active");
    }
  }
  
  renderTripsList();
}

function openCustomPeriodDialog(target) {
  appState.customPeriodTarget = target;
  
  const btns = document.querySelectorAll(".custom-period-btn");
  btns.forEach(b => b.classList.remove("active"));
  
  document.getElementById("custom-period-start").value = "";
  document.getElementById("custom-period-end").value = "";
  
  const dialog = document.getElementById("dialog-custom-period");
  if (dialog) dialog.showModal();
}

function closeCustomPeriodDialog() {
  const dialog = document.getElementById("dialog-custom-period");
  if (dialog) dialog.close();
}

function selectCustomPeriodOption(type, value) {
  const today = new Date();
  const year = today.getFullYear();
  let startStr = "";
  let endStr = "";
  let labelText = "";
  
  if (type === 'month') {
    const month = Number(value);
    startStr = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    endStr = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    labelText = `${month}월`;
  } else if (type === 'quarter') {
    const q = Number(value);
    if (q === 1) {
      startStr = `${year}-01-01`;
      endStr = `${year}-03-31`;
    } else if (q === 2) {
      startStr = `${year}-04-01`;
      endStr = `${year}-06-30`;
    } else if (q === 3) {
      startStr = `${year}-07-01`;
      endStr = `${year}-09-30`;
    } else if (q === 4) {
      startStr = `${year}-10-01`;
      endStr = `${year}-12-31`;
    }
    labelText = `${q}분기`;
  } else if (type === 'year') {
    startStr = `${year}-01-01`;
    endStr = `${year}-12-31`;
    labelText = `${year}년`;
  }
  
  applyCalculatedPeriod(startStr, endStr, labelText);
}

function applyCustomDateRange() {
  const startStr = document.getElementById("custom-period-start").value;
  const endStr = document.getElementById("custom-period-end").value;
  
  if (!startStr || !endStr) {
    showToast("시작일과 종료일을 모두 입력하세요.");
    return;
  }
  if (startStr > endStr) {
    showToast("시작일은 종료일보다 이전이어야 합니다.");
    return;
  }
  
  const labelText = `${startStr.slice(5).replace('-', '.')}~${endStr.slice(5).replace('-', '.')}`;
  applyCalculatedPeriod(startStr, endStr, labelText);
}

function applyCalculatedPeriod(start, end, label) {
  const target = appState.customPeriodTarget;
  
  if (target === 'dashboard') {
    appState.currentDashboardPeriod = 'custom';
    appState.dashboardCustomRange.start = start;
    appState.dashboardCustomRange.end = end;
    appState.dashboardCustomLabel = label;
    
    const filterBtns = document.querySelectorAll("#panel-dashboard .filter-btn");
    filterBtns.forEach(btn => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-period") === "custom") {
        btn.classList.add("active");
        btn.textContent = `직접선택 (${label})`;
      }
    });
    
    updateDashboardStats();
  } else if (target === 'trips') {
    appState.currentTripsPeriod = 'custom';
    appState.tripsCustomRange.start = start;
    appState.tripsCustomRange.end = end;
    
    const filterBtns = document.querySelectorAll("#trips-period-filters .filter-btn");
    filterBtns.forEach(btn => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-period") === "custom") {
        btn.classList.add("active");
        btn.textContent = `직접선택 (${label})`;
      }
    });
    
    renderTripsList();
  } else if (target === 'unpaid') {
    appState.unpaidPeriod = 'custom';
    if (!appState.unpaidCustomRange) {
      appState.unpaidCustomRange = { start: null, end: null };
    }
    appState.unpaidCustomRange.start = start;
    appState.unpaidCustomRange.end = end;
    
    const filterBtns = document.querySelectorAll("#unpaid-period-filters .filter-btn");
    filterBtns.forEach(btn => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-period") === "custom") {
        btn.classList.add("active");
        btn.textContent = `직접선택 (${label})`;
      }
    });
    
    renderUnpaidTripsView();
  }
  
  closeCustomPeriodDialog();
  showToast(`조회 기간이 적용되었습니다: ${start} ~ ${end}`);
}

function toggleCollectionsClientList() {
  const container = document.getElementById("collections-client-list");
  const chevron = document.getElementById("collections-client-chevron");
  
  if (container && chevron) {
    if (container.style.display === "none") {
      container.style.display = "flex";
      chevron.style.transform = "rotate(180deg)";
    } else {
      container.style.display = "none";
      chevron.style.transform = "rotate(0deg)";
    }
  }
}

function toggleUnpaidClientList() {
  const wrapper = document.getElementById("trips-unpaid-client-list-wrapper");
  const chevron = document.getElementById("unpaid-client-chevron");
  if (wrapper && chevron) {
    const isExpanded = wrapper.classList.toggle("expanded");
    chevron.style.transform = isExpanded ? "rotate(180deg)" : "rotate(0deg)";
  }
}

// Draft storage functions (Ver 2.16 - Patch 6)
function saveTripDraft() {
  const tripId = document.getElementById("trip-id").value;
  const startDate = document.getElementById("trip-start-date").value;
  const endDate = document.getElementById("trip-end-date").value;
  const client = document.getElementById("trip-client").value.trim();
  const clientPhone = formatPhoneNumber(document.getElementById("trip-client-phone").value.trim());
  const routeStart = document.getElementById("trip-start").value.trim();
  const routeLoad = document.getElementById("trip-load").value.trim();
  const routeUnload = document.getElementById("trip-unload").value.trim();
  const routeArrival = document.getElementById("trip-arrival").value.trim();
  const distance = document.getElementById("trip-distance").value;
  const fee = document.getElementById("trip-fee").value;
  const commission = document.getElementById("trip-commission").value;
  
  const expenses = {
    fuel: document.getElementById("trip-expense-fuel").value,
    toll: document.getElementById("trip-expense-toll").value,
    meal: document.getElementById("trip-expense-meal").value,
    other: document.getElementById("trip-expense-other").value
  };
  
  const isPaid = document.getElementById("trip-is-paid").checked;
  const paymentDueDate = document.getElementById("trip-payment-due").value;
  const paymentDate = document.getElementById("trip-payment-date").value;
  const notes = document.getElementById("trip-notes").value.trim();

  // Read active waypoints
  const routeVias = [];
  for (let i = 1; i <= 3; i++) {
    const input = document.getElementById(`trip-via-${i}`);
    if (input && input.value) {
      routeVias.push(input.value.trim());
    }
  }

  const draftData = {
    tripId, startDate, endDate, client, clientPhone, routeStart, routeLoad, routeVias, routeUnload, routeArrival,
    distance, fee, commission, expenses, isPaid, paymentDueDate, paymentDate, notes
  };

  localStorage.setItem("logilog_trip_draft", JSON.stringify(draftData));
  showToast("작성 중이던 내용이 임시저장되었습니다.");
  closeTripModal();
  updateHomeDraftIndicator();
}

function checkTripDraft(tripId) {
  const banner = document.getElementById("trip-draft-banner");
  if (!banner) return;

  const draftStr = localStorage.getItem("logilog_trip_draft");
  if (draftStr) {
    try {
      const draft = JSON.parse(draftStr);
      // Only show if the current tripId matches the draft's tripId (empty string for new trip, or same ID for edit)
      const targetId = tripId || "";
      const draftId = draft.tripId || "";
      if (targetId === draftId) {
        banner.style.display = "flex";
        lucide.createIcons();
        return;
      }
    } catch (e) {
      localStorage.removeItem("logilog_trip_draft");
    }
  }
  banner.style.display = "none";
}

function loadTripDraft() {
  const draftStr = localStorage.getItem("logilog_trip_draft");
  if (!draftStr) return;

  try {
    const draft = JSON.parse(draftStr);
    
    document.getElementById("trip-start-date").value = draft.startDate || "";
    document.getElementById("trip-end-date").value = draft.endDate || "";
    document.getElementById("trip-client").value = draft.client || "";
    document.getElementById("trip-client-phone").value = (draft.clientPhone || "").replace(/[^0-9]/g, "");
    document.getElementById("trip-start").value = draft.routeStart || "";
    document.getElementById("trip-load").value = draft.routeLoad || "";
    document.getElementById("trip-unload").value = draft.routeUnload || "";
    document.getElementById("trip-arrival").value = draft.routeArrival || "";
    document.getElementById("trip-distance").value = draft.distance || "";
    document.getElementById("trip-fee").value = draft.fee || "";
    document.getElementById("trip-commission").value = draft.commission || 0;

    toggleLocationField('start', !!draft.routeStart);
    toggleLocationField('arrival', !!draft.routeArrival);

    // Populate waypoints
    const container = document.getElementById("waypoints-container");
    container.innerHTML = "";
    if (draft.routeVias && draft.routeVias.length > 0) {
      draft.routeVias.forEach(via => {
        addWaypointField(via);
      });
    }

    if (draft.expenses) {
      document.getElementById("trip-expense-fuel").value = draft.expenses.fuel || 0;
      document.getElementById("trip-expense-toll").value = draft.expenses.toll || 0;
      document.getElementById("trip-expense-meal").value = draft.expenses.meal || 0;
      document.getElementById("trip-expense-other").value = draft.expenses.other || 0;
    }

    document.getElementById("trip-is-paid").checked = !!draft.isPaid;
    document.getElementById("trip-payment-due").value = draft.paymentDueDate || "";
    document.getElementById("trip-payment-date").value = draft.paymentDate || "";
    document.getElementById("trip-notes").value = draft.notes || "";

    calculateTotalExpenses();
    togglePaymentDueDate();
    updateAddWaypointButtonState();

    showToast("임시저장된 내용을 불러왔습니다.");
  } catch (e) {
    showToast("임시저장본을 불러오는 중 오류가 발생했습니다.");
  }

  const banner = document.getElementById("trip-draft-banner");
  if (banner) banner.style.display = "none";
}

function clearTripDraft(showToastMessage = false) {
  localStorage.removeItem("logilog_trip_draft");
  const banner = document.getElementById("trip-draft-banner");
  if (banner) banner.style.display = "none";
  if (showToastMessage) {
    showToast("임시 저장본이 삭제되었습니다.");
  }
  updateHomeDraftIndicator();
}

function updateHomeDraftIndicator() {
  const indicator = document.getElementById("home-draft-indicator");
  const summary = document.getElementById("home-draft-summary");
  if (!indicator || !summary) return;

  const draftStr = localStorage.getItem("logilog_trip_draft");
  if (draftStr) {
    try {
      const draft = JSON.parse(draftStr);
      const clientName = draft.client || "거래처 미지정";
      const loadText = draft.routeLoad ? draft.routeLoad.split(" ").pop() : "상차지";
      const unloadText = draft.routeUnload ? draft.routeUnload.split(" ").pop() : "하차지";
      summary.textContent = `${clientName} (${loadText} ➔ ${unloadText})`;
      indicator.style.display = "flex";
      lucide.createIcons();
    } catch (e) {
      indicator.style.display = "none";
    }
  } else {
    indicator.style.display = "none";
  }
}

function resumeTripDraft() {
  openTripModal();
  loadTripDraft();
}

function clearTripDraftHome() {
  if (confirm("임시저장된 운행기록을 삭제하시겠습니까?")) {
    clearTripDraft(true);
  }
}

// Expense Draft storage functions (Ver 2.26)
function saveExpenseDraft() {
  const expenseId = document.getElementById("expense-id").value;
  const date = document.getElementById("expense-modal-date").value;
  const type = document.getElementById("expense-modal-type").value;
  const category = document.getElementById("expense-modal-category").value;
  const customCategory = document.getElementById("expense-modal-custom-category") ? document.getElementById("expense-modal-custom-category").value.trim() : "";
  const amount = document.getElementById("expense-modal-amount").value;
  const title = document.getElementById("expense-modal-title-input") ? document.getElementById("expense-modal-title-input").value.trim() : "";
  const notes = document.getElementById("expense-modal-notes").value.trim();
  const repeatType = document.getElementById("expense-modal-repeat-type") ? document.getElementById("expense-modal-repeat-type").value : "none";
  const repeatCount = document.getElementById("expense-modal-repeat-count") ? document.getElementById("expense-modal-repeat-count").value : "1";

  const draftData = {
    expenseId, date, type, category, customCategory, amount, title, notes, repeatType, repeatCount
  };

  localStorage.setItem("logilog_expense_draft", JSON.stringify(draftData));
  showToast("작성 중이던 경비 내역이 임시저장되었습니다.");
  closeExpenseModal();
}

function checkExpenseDraft(expenseId) {
  const banner = document.getElementById("expense-draft-banner");
  if (!banner) return;

  const draftStr = localStorage.getItem("logilog_expense_draft");
  if (draftStr) {
    try {
      const draft = JSON.parse(draftStr);
      const targetId = expenseId || "";
      const draftId = draft.expenseId || "";
      if (targetId === draftId) {
        banner.style.display = "flex";
        lucide.createIcons();
        return;
      }
      localStorage.removeItem("logilog_expense_draft");
    } catch (e) {
      localStorage.removeItem("logilog_expense_draft");
    }
  }
  banner.style.display = "none";
}

function loadExpenseDraft() {
  const draftStr = localStorage.getItem("logilog_expense_draft");
  if (!draftStr) return;

  try {
    const draft = JSON.parse(draftStr);
    
    document.getElementById("expense-modal-date").value = draft.date || getLocalDateString();
    
    const typeVal = draft.type || "fixed";
    document.getElementById("expense-modal-type").value = typeVal;
    if (typeVal === "fixed") {
      document.getElementById("expense-type-fixed").checked = true;
    } else {
      document.getElementById("expense-type-variable").checked = true;
    }
    
    updateCategoryOptions(typeVal);
    
    const categorySelect = document.getElementById("expense-modal-category");
    const selectWrapper = document.getElementById("wrapper-category-select");
    const customWrapper = document.getElementById("wrapper-category-custom");
    const customInput = document.getElementById("expense-modal-custom-category");
    
    if (draft.category === "직접입력") {
      categorySelect.value = "직접입력";
      if (selectWrapper) selectWrapper.style.display = "none";
      if (customWrapper) {
        customWrapper.style.display = "block";
        customInput.value = draft.customCategory || "";
        customInput.required = true;
      }
    } else {
      categorySelect.value = draft.category;
      if (selectWrapper) selectWrapper.style.display = "block";
      if (customWrapper) customWrapper.style.display = "none";
      if (customInput) customInput.required = false;
    }
    
    document.getElementById("expense-modal-amount").value = draft.amount || "";
    if (document.getElementById("expense-modal-title-input")) {
      document.getElementById("expense-modal-title-input").value = draft.title || "";
    }
    document.getElementById("expense-modal-notes").value = draft.notes || "";
    
    if (document.getElementById("expense-modal-repeat-type")) {
      document.getElementById("expense-modal-repeat-type").value = draft.repeatType || "none";
    }
    if (document.getElementById("expense-modal-repeat-count")) {
      document.getElementById("expense-modal-repeat-count").value = draft.repeatCount || "1";
    }
  } catch (e) {
    console.error("Error loading expense draft", e);
  }
  
  const banner = document.getElementById("expense-draft-banner");
  if (banner) banner.style.display = "none";
}

function clearExpenseDraft(showToastMessage = false) {
  localStorage.removeItem("logilog_expense_draft");
  const banner = document.getElementById("expense-draft-banner");
  if (banner) banner.style.display = "none";
  if (showToastMessage) {
    showToast("임시 저장본이 삭제되었습니다.");
  }
}

// ----------------------------------------------------
// CLIENTS DATABASE CRUD OPERATIONS (TAB 4 - Ver 2.16)
// ----------------------------------------------------
const dialogClient = document.getElementById("dialog-client");

function renderClientsPanel() {
  const container = document.getElementById("clients-list");
  if (!container) return;
  
  const searchInput = document.getElementById("client-search");
  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
  
  container.innerHTML = "";
  
  let filtered = appState.clients.filter(c => c.userId === appState.currentUser.username);
  if (query) {
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(query) || 
      (c.phone && c.phone.includes(query)) ||
      (c.manager && c.manager.toLowerCase().includes(query))
    );
  }
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="users"></i>
        <p>등록된 거래처가 없습니다.</p>
        <button class="btn btn-outline" onclick="openClientModal()">새 거래처 추가</button>
      </div>
    `;
    lucide.createIcons();
    return;
  }
  
  filtered.forEach(client => {
    const card = document.createElement("div");
    card.className = "client-card detail-card";
    
    const managerHtml = client.manager 
      ? `<div class="client-meta-row"><strong>담당자:</strong> <span>${client.manager}</span></div>` 
      : "";
    const notesHtml = client.notes 
      ? `<div class="client-notes-box"><strong>메모:</strong> <p>${client.notes}</p></div>` 
      : "";
      
    card.innerHTML = `
      <div class="client-card-header">
        <h3 class="client-card-title">${client.name}</h3>
        <div class="client-card-actions">
          <button class="btn-icon" onclick="openClientModal('${client.id}')" title="수정">
            <i data-lucide="edit-2"></i>
          </button>
          <button class="btn-icon delete" onclick="deleteClient('${client.id}')" title="삭제">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
      <div class="client-card-body">
        <div class="client-meta-row">
          <strong>전화번호:</strong> 
          <a href="tel:${(client.phone || '').replace(/[^0-9]/g, '')}" class="client-phone-link">
            <i data-lucide="phone" class="icon-xs" style="width: 12px; height: 12px;"></i> ${formatPhoneNumber(client.phone)}
          </a>
        </div>
        ${managerHtml}
        ${notesHtml}
      </div>
    `;
    container.appendChild(card);
  });
  
  lucide.createIcons();
}

function openClientModal(clientId = null) {
  const modalTitle = document.getElementById("client-modal-title");
  const form = document.getElementById("form-client");
  
  form.reset();
  
  if (clientId) {
    modalTitle.innerText = "거래처 수정";
    const client = appState.clients.find(c => c.id === clientId);
    if (client) {
      document.getElementById("client-id").value = client.id;
      document.getElementById("client-modal-name").value = client.name;
      document.getElementById("client-modal-phone").value = (client.phone || "").replace(/[^0-9]/g, "");
      document.getElementById("client-modal-manager").value = client.manager || "";
      document.getElementById("client-modal-notes").value = client.notes || "";
    }
  } else {
    modalTitle.innerText = "거래처 등록";
    document.getElementById("client-id").value = "";
  }
  
  dialogClient.showModal();
}

function closeClientModal() {
  dialogClient.close();
}

function saveClient() {
  const clientId = document.getElementById("client-id").value;
  const name = document.getElementById("client-modal-name").value.trim();
  const phone = document.getElementById("client-modal-phone").value.trim();
  const manager = document.getElementById("client-modal-manager").value.trim();
  const notes = document.getElementById("client-modal-notes").value.trim();
  
  if (!name || !phone) {
    showToast("필수 값을 모두 입력하세요.");
    return;
  }
  
  const formattedPhone = formatPhoneNumber(phone);
  
  if (clientId) {
    const index = appState.clients.findIndex(c => c.id === clientId);
    if (index !== -1) {
      const existingUserId = appState.clients[index].userId || appState.currentUser.username;
      appState.clients[index] = { id: clientId, userId: existingUserId, name, phone: formattedPhone, manager, notes };
      showToast("거래처 정보가 수정되었습니다.");
    }
  } else {
    const newClient = {
      id: "client-" + Date.now(),
      userId: appState.currentUser.username,
      name,
      phone: formattedPhone,
      manager,
      notes
    };
    appState.clients.push(newClient);
    showToast("거래처가 등록되었습니다.");
  }
  
  saveData();
  closeClientModal();
  renderClientsPanel();
}

async function deleteClient(clientId) {
  const client = appState.clients.find(c => c.id === clientId);
  if (!client) return;
  
  if (confirm(`정말로 '${client.name}' 거래처를 삭제하시겠습니까?`)) {
    if (supabaseClient && appState.currentUser && appState.currentUser.uid) {
      try {
        await supabaseClient.from('clients').delete().eq('id', clientId);
      } catch (err) {
        console.error("Supabase client delete failed:", err);
      }
    }
    appState.clients = appState.clients.filter(c => c.id !== clientId);
    saveData();
    showToast("거래처가 삭제되었습니다.");
    renderClientsPanel();
  }
}

function saveClientQuickly() {
  const name = document.getElementById("trip-client").value.trim();
  const phone = document.getElementById("trip-client-phone").value.trim();
  
  if (!name || !phone) {
    showToast("거래처명과 전화번호를 모두 입력해주세요.");
    return;
  }
  
  const formattedPhone = formatPhoneNumber(phone);
  
  const existingIndex = appState.clients.findIndex(c => c.name === name && c.userId === appState.currentUser.username);
  if (existingIndex !== -1) {
    appState.clients[existingIndex].phone = formattedPhone;
    showToast("거래처 전화번호가 업데이트되었습니다.");
  } else {
    const newClient = {
      id: "client-" + Date.now(),
      userId: appState.currentUser.username,
      name: name,
      phone: formattedPhone,
      manager: "",
      notes: ""
    };
    appState.clients.push(newClient);
    showToast("새로운 거래처 정보가 저장되었습니다.");
  }
  
  saveData();
  updateClientSuggestions();
  renderClientsPanel();
}

function populateClientPhone() {
  const clientName = document.getElementById("trip-client").value.trim();
  const matchedClient = appState.clients.find(c => c.name === clientName && c.userId === appState.currentUser.username);
  if (matchedClient) {
    document.getElementById("trip-client-phone").value = (matchedClient.phone || "").replace(/[^0-9]/g, "");
  }
}

function updateClientSuggestions() {
  const datalist = document.getElementById("trip-clients-suggestions");
  if (!datalist) return;
  datalist.innerHTML = "";
  appState.clients.forEach(client => {
    if (client.userId === appState.currentUser.username) {
      const option = document.createElement("option");
      option.value = client.name;
      datalist.appendChild(option);
    }
  });
}

// Collapsible locations handlers (Redesigned Journey Timeline UI)
function toggleLocationField(type, forceShow = null) {
  const wrapper = document.getElementById(`${type}-location-wrapper`);
  const linkAdd = document.getElementById(`link-add-${type}`);
  const step = document.querySelector(`.timeline-step.${type}`);
  if (!wrapper) return;
  
  let show = forceShow;
  if (show === null) {
    show = wrapper.style.display === "none" || !wrapper.style.display;
  }
  
  if (show) {
    wrapper.style.display = "block";
    if (linkAdd) linkAdd.style.display = "none";
    if (step) step.classList.add("active");
  } else {
    wrapper.style.display = "none";
    if (linkAdd) linkAdd.style.display = "flex";
    if (step) step.classList.remove("active");
    
    // Clear value when collapsed
    if (type === 'start') {
      document.getElementById("trip-start").value = "";
    } else if (type === 'arrival') {
      document.getElementById("trip-arrival").value = "";
    }
    triggerAutoDistanceCalculation();
  }
  lucide.createIcons();
}

// Datetime shortcuts helper (Ver 2.16 Patch 3)
function setDatetimeShortcut(type, action) {
  const startInput = document.getElementById("trip-start-date");
  const endInput = document.getElementById("trip-end-date");
  
  const pad = (n) => String(n).padStart(2, '0');
  const formatDate = (date) => {
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };
  
  const targetInput = type === 'start' ? startInput : endInput;
  let baseDate = new Date();
  
  if (targetInput.value) {
    baseDate = new Date(targetInput.value);
  } else if (type === 'end' && startInput.value) {
    baseDate = new Date(startInput.value);
  } else if (type === 'start' && endInput.value) {
    baseDate = new Date(endInput.value);
  }
  
  if (action === 'now') {
    baseDate = new Date();
  } else if (action === 'minus-1d') {
    baseDate.setDate(baseDate.getDate() - 1);
  } else if (action === 'minus-1h') {
    baseDate.setHours(baseDate.getHours() - 1);
  } else if (action === 'minus-30m') {
    baseDate.setMinutes(baseDate.getMinutes() - 30);
  } else if (action === 'plus-30m') {
    baseDate.setMinutes(baseDate.getMinutes() + 30);
  } else if (action === 'plus-1h') {
    baseDate.setHours(baseDate.getHours() + 1);
  } else if (action === 'plus-1d') {
    baseDate.setDate(baseDate.getDate() + 1);
  }
  
  targetInput.value = formatDate(baseDate);
  
  // Automatically adjust end datetime if type is start and end is empty or before start
  if (type === 'start' && startInput.value) {
    const startVal = new Date(startInput.value);
    const endVal = new Date(endInput.value);
    if (!endInput.value || endVal <= startVal) {
      const autoEnd = new Date(startVal.getTime() + 4 * 60 * 60 * 1000);
      endInput.value = formatDate(autoEnd);
    }
  }
}

// Payment due date shortcut calculator (7 days, 15 days, 30 days, 45 days, end of next month)
function setPaymentDueShortcut(daysOrType) {
  const startInput = document.getElementById("trip-start-date");
  const endInput = document.getElementById("trip-end-date");
  const dueInput = document.getElementById("trip-payment-due");
  if (!dueInput) return;

  let baseDate = new Date();
  if (endInput && endInput.value) {
    baseDate = new Date(endInput.value);
  } else if (startInput && startInput.value) {
    baseDate = new Date(startInput.value);
  }

  const pad = (n) => String(n).padStart(2, '0');
  const formatDateOnly = (date) => {
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  };

  let targetDate = new Date(baseDate.getTime());
  if (typeof daysOrType === 'number') {
    targetDate.setDate(targetDate.getDate() + daysOrType);
  } else if (daysOrType === 'end-of-this-month') {
    targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
  } else if (daysOrType === 'end-of-next-month') {
    targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 2, 0);
  }

  dueInput.value = formatDateOnly(targetDate);
}

// Global function to toggle dashboard card detail visibility (Ver 2.16)
function toggleDashboardCardDetail(cardType) {
  const wrapper = document.getElementById(`detail-${cardType}-wrapper`);
  if (wrapper) {
    wrapper.classList.toggle("expanded");
  }
}

// Global function to toggle expense summary card detail visibility (Ver 2.16 Patch 6)
function toggleExpenseSummaryDetail(type) {
  const wrapper = document.getElementById(`detail-expense-${type}-wrapper`);
  const chevron = document.getElementById(`expense-chevron-${type}`);
  if (wrapper) {
    wrapper.classList.toggle("expanded");
    if (chevron) {
      chevron.style.transform = wrapper.classList.contains("expanded") ? "rotate(180deg)" : "rotate(0)";
    }
  }
}

// ----------------------------------------------------
// AUTHENTICATION LOGIC (Ver 2.17)
// ----------------------------------------------------
function checkAuthAndSetUI() {
  const overlay = document.getElementById("auth-overlay");
  const userInfo = document.getElementById("header-user-info");
  const userBadge = document.getElementById("header-user-badge");
  const navAdmin = document.getElementById("nav-item-admin");

  if (appState.currentUser) {
    localStorage.setItem("logilog_has_session", "true");
    if (overlay) {
      overlay.style.display = "none";
      overlay.remove(); // 보안 프로그램 감지 회피를 위해 비밀번호 박스가 있는 로그인 폼을 DOM에서 제거
    }
    if (userInfo) userInfo.style.display = "flex";
    if (userBadge) userBadge.textContent = appState.currentUser.name;
    if (navAdmin) {
      if (appState.currentUser.role === "admin") {
        navAdmin.style.display = "block";
      } else {
        navAdmin.style.display = "none";
      }
    }
  } else {
    localStorage.removeItem("logilog_has_session");
    const tempStyle = document.getElementById("temp-auth-hide");
    if (tempStyle) tempStyle.remove();
    if (overlay) overlay.style.display = "flex";
    if (userInfo) userInfo.style.display = "none";
    if (navAdmin) navAdmin.style.display = "none";
  }
}

function switchAuthView(view) {
  const loginView = document.getElementById("auth-view-login");
  const signupView = document.getElementById("auth-view-signup");
  
  if (view === 'login') {
    loginView.style.display = 'block';
    signupView.style.display = 'none';
  } else {
    loginView.style.display = 'none';
    signupView.style.display = 'block';
  }
}

async function handleGoogleLogin() {
  if (!supabaseClient) {
    showToast("온라인 모드에서만 구글 로그인을 지원합니다.");
    return;
  }
  try {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      showToast(`구글 로그인 실패: ${error.message}`);
    }
  } catch (err) {
    showToast(`구글 로그인 시도 중 에러가 발생했습니다: ${err.message}`);
  }
}

async function handleLogin(event) {
  if (event) event.preventDefault();
  
  const usernameInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  if (!usernameInput || !passwordInput) return;
  
  const username = usernameInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  
  if (supabaseClient) {
    const email = username.includes('@') ? username : `${username}@logilog.com`;
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        showToast(`로그인 실패: ${error.message}`);
        return;
      }
      
      // Fetch user profile
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError || !profile) {
        showToast("프로필을 로드할 수 없습니다.");
        await supabaseClient.auth.signOut();
        return;
      }
      
      appState.currentUser = {
        username: profile.email.split('@')[0],
        email: profile.email,
        uid: profile.id,
        role: profile.role,
        name: profile.display_name || '사용자',
        phone: ''
      };
      
      await loadData();
      
      usernameInput.value = "";
      passwordInput.value = "";
      
      checkAuthAndSetUI();
      switchTab("home");
      showToast(`${appState.currentUser.name}님, 환영합니다!`);
    } catch (err) {
      showToast(`로그인 중 오류가 발생했습니다: ${err.message}`);
    }
    return;
  }
  
  // Local Fallback
  const user = appState.users.find(u => u.username === username);
  if (!user) {
    showToast("존재하지 않는 사용자 아이디입니다.");
    return;
  }
  
  if (user.password !== password) {
    showToast("비밀번호가 일치하지 않습니다.");
    return;
  }
  
  appState.currentUser = user;
  localStorage.setItem("logilog_current_user", user.username);
  localStorage.setItem("logilog_current_user_obj", JSON.stringify(user));
  
  usernameInput.value = "";
  passwordInput.value = "";
  
  checkAuthAndSetUI();
  switchTab("home");
  showToast(`${user.name}님, 환영합니다!`);
}

async function handleSignup(event) {
  if (event) event.preventDefault();
  
  const usernameInput = document.getElementById("signup-username");
  const passwordInput = document.getElementById("signup-password");
  const nameInput = document.getElementById("signup-name");
  const phoneInput = document.getElementById("signup-phone");
  
  if (!usernameInput || !passwordInput || !nameInput || !phoneInput) return;
  
  const username = usernameInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const name = nameInput.value.trim();
  const phone = formatPhoneNumber(phoneInput.value.trim());
  
  const usernameRegex = /^[a-z0-9]{4,16}$/;
  if (!usernameRegex.test(username)) {
    showToast("아이디는 영문 소문자와 숫자 조합 4~16자로 입력해주세요.");
    return;
  }
  
  if (password.length < 6) {
    showToast("비밀번호는 최소 6자 이상이어야 합니다.");
    return;
  }
  
  if (!name || !phone) {
    showToast("모든 항목을 입력해주세요.");
    return;
  }
  
  if (supabaseClient) {
    const email = `${username}@logilog.com`;
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            display_name: name
          }
        }
      });
      
      if (error) {
        showToast(`회원가입 실패: ${error.message}`);
        return;
      }
      
      // Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (!profile) {
        showToast("프로필 초기화 중 에러가 발생했습니다.");
        return;
      }
      
      appState.currentUser = {
        username: profile.email.split('@')[0],
        email: profile.email,
        uid: profile.id,
        role: profile.role,
        name: profile.display_name || '사용자',
        phone: phone
      };
      
      await loadData();
      
      usernameInput.value = "";
      passwordInput.value = "";
      nameInput.value = "";
      phoneInput.value = "";
      
      checkAuthAndSetUI();
      switchTab("home");
      showToast("회원가입이 완료되었습니다!");
    } catch (err) {
      showToast(`회원가입 중 오류가 발생했습니다: ${err.message}`);
    }
    return;
  }
  
  // Local Fallback
  const exists = appState.users.some(u => u.username === username);
  if (exists) {
    showToast("이미 가입된 아이디입니다.");
    return;
  }
  
  const newUser = {
    username,
    password,
    role: 'user',
    name,
    phone
  };
  
  appState.users.push(newUser);
  localStorage.setItem("logilog_users", JSON.stringify(appState.users));
  
  appState.currentUser = newUser;
  localStorage.setItem("logilog_current_user", newUser.username);
  localStorage.setItem("logilog_current_user_obj", JSON.stringify(newUser));
  
  usernameInput.value = "";
  passwordInput.value = "";
  nameInput.value = "";
  phoneInput.value = "";
  
  checkAuthAndSetUI();
  switchTab("home");
  showToast("회원가입이 완료되었습니다!");
}

async function handleLogout() {
  if (confirm("정말로 로그아웃 하시겠습니까?")) {
    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (err) {
        console.error("Supabase signout error:", err);
      }
    }
    appState.currentUser = null;
    localStorage.removeItem("logilog_current_user");
    localStorage.removeItem("logilog_current_user_obj");
    localStorage.removeItem("logilog_has_session");
    window.location.reload();
  }
}

function switchTab(tabName) {
  closeTrackerDialog();
  closeTripModal();
  closeExpenseModal();
  const navItems = document.querySelectorAll(".app-nav .nav-item");
  const panels = document.querySelectorAll(".app-panel");
  
  navItems.forEach(item => {
    item.classList.remove("active");
    if (item.getAttribute("data-target") === tabName) {
      item.classList.add("active");
    }
  });
  
  panels.forEach(panel => {
    panel.classList.remove("active");
    if (panel.id === `panel-${tabName}`) {
      panel.classList.add("active");
    }
  });
  
  if (tabName === "home") renderHomePanel();
  else if (tabName === "dashboard") updateDashboardStats();
  else if (tabName === "trips") renderTripsList();
  else if (tabName === "clients") renderClientsPanel();
  else if (tabName === "admin") renderAdminPanel();
  
  lucide.createIcons();
}

// ----------------------------------------------------
// ADMIN PANEL BUSINESS LOGIC (Ver 2.17)
// ----------------------------------------------------
function renderAdminPanel() {
  const usersListContainer = document.getElementById("admin-users-list");
  const tripsListContainer = document.getElementById("admin-trips-list");
  
  if (!usersListContainer || !tripsListContainer) return;
  
  // 1. Calculate platform overview stats
  const totalUsers = appState.users.length;
  const totalTrips = appState.trips.length;
  const totalRevenue = appState.trips.reduce((sum, t) => sum + (Number(t.fee) || 0), 0);
  
  document.getElementById("admin-stat-users").textContent = `${totalUsers}명`;
  document.getElementById("admin-stat-trips").textContent = `${totalTrips}건`;
  document.getElementById("admin-stat-revenue").textContent = `${totalRevenue.toLocaleString()}원`;
  
  // 2. Populate users list
  usersListContainer.innerHTML = "";
  appState.users.forEach(user => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--bg-card-border)";
    
    const roleBadge = user.role === 'admin' 
      ? `<span class="admin-role-badge admin">관리자</span>` 
      : `<span class="admin-role-badge user">기사</span>`;
      
    const isSelf = user.username === appState.currentUser.username;
    const actionsHtml = isSelf 
      ? `<span style="font-size:0.7rem; color:var(--text-muted);">본인 계정</span>`
      : `<div style="display:flex; justify-content:center; gap:6px;">
           <button class="btn-admin-action change-role" onclick="toggleUserRole('${user.username}')">역할 변경</button>
           <button class="btn-admin-action delete-account" onclick="deleteUserAccount('${user.username}')">삭제</button>
         </div>`;
         
    tr.innerHTML = `
      <td style="padding: 10px 8px;">
        <strong style="color:var(--text-main); display:block; font-size:0.8rem;">${user.name}</strong>
        <span style="font-size:0.65rem; color:var(--text-muted);">@${user.username}</span>
      </td>
      <td style="padding: 10px 8px; color:var(--text-muted); font-size:0.75rem;">${user.phone ? formatPhoneNumber(user.phone) : '-'}</td>
      <td style="padding: 10px 8px;">${roleBadge}</td>
      <td style="padding: 10px 8px; text-align: center;">${actionsHtml}</td>
    `;
    usersListContainer.appendChild(tr);
  });
  
  // 3. Populate all trips stream (real-time platform log)
  tripsListContainer.innerHTML = "";
  const searchQuery = document.getElementById("admin-trip-search") 
    ? document.getElementById("admin-trip-search").value.toLowerCase().trim() 
    : "";
    
  let adminTrips = [...appState.trips];
  
  adminTrips.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  
  if (searchQuery) {
    adminTrips = adminTrips.filter(t => {
      const user = appState.users.find(u => u.username === t.userId);
      const userName = user ? user.name.toLowerCase() : "";
      const userId = t.userId.toLowerCase();
      const clientName = t.client ? t.client.toLowerCase() : "";
      const start = t.routeStart ? t.routeStart.toLowerCase() : "";
      const end = t.routeUnload ? t.routeUnload.toLowerCase() : "";
      return userName.includes(searchQuery) || 
             userId.includes(searchQuery) || 
             clientName.includes(searchQuery) ||
             start.includes(searchQuery) ||
             end.includes(searchQuery);
    });
  }
  
  if (adminTrips.length === 0) {
    tripsListContainer.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); padding: 20px; text-align: center;">등록된 운행 기록이 없거나 검색 결과가 없습니다.</div>`;
    return;
  }
  
  adminTrips.forEach(trip => {
    const user = appState.users.find(u => u.username === trip.userId);
    const ownerName = user ? user.name : "미가입 기사";
    
    const card = document.createElement("div");
    card.className = "db-trip-item";
    card.style.position = "relative";
    
    const statusText = trip.isPaid ? "수금완료" : "수금대기";
    const statusClass = trip.isPaid ? "paid" : "unpaid";
    const displayClient = trip.client ? trip.client : "거래처 미지정";
    
    card.innerHTML = `
      <div style="position: absolute; top: 10px; right: 10px; font-size: 0.65rem; background-color: var(--bg-panel); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--bg-card-border); color: var(--color-primary); font-weight: 700;">
        기사: ${ownerName} (@${trip.userId})
      </div>
      <div class="db-trip-row">
        <span class="badge ${statusClass}">${statusText}</span>
        <span class="db-trip-fee">${trip.fee.toLocaleString()}원</span>
      </div>
      <div class="db-trip-route" style="margin-top: 8px; font-weight: 500; font-size: 0.82rem; color: var(--text-main);">
        ${trip.routeLoad.split(' ').slice(-1)[0]} ➔ ${trip.routeUnload.split(' ').slice(-1)[0]}
      </div>
      <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
        운행거리: ${trip.distance}km | 거래처: ${displayClient} | 일시: ${trip.startDate.replace('T', ' ')}
      </div>
    `;
    tripsListContainer.appendChild(card);
  });
  
  lucide.createIcons();
}

async function toggleUserRole(username) {
  const user = appState.users.find(u => u.username === username);
  if (!user) return;
  
  const newRole = user.role === 'admin' ? 'user' : 'admin';
  
  if (supabaseClient && appState.currentUser && appState.currentUser.role === 'admin') {
    try {
      const email = `${username}@logilog.com`;
      const { data: userProfile } = await supabaseClient.from('profiles').select('id').eq('email', email).single();
      if (userProfile) {
        const { error } = await supabaseClient.from('profiles').update({ role: newRole }).eq('id', userProfile.id);
        if (error) {
          showToast(`등급 변경 실패: ${error.message}`);
          return;
        }
      }
    } catch (err) {
      console.error("Supabase toggleUserRole error:", err);
    }
  }
  
  user.role = newRole;
  localStorage.setItem("logilog_users", JSON.stringify(appState.users));
  
  showToast(`'${user.name}'님의 등급이 변경되었습니다.`);
  renderAdminPanel();
}

async function deleteUserAccount(username) {
  const user = appState.users.find(u => u.username === username);
  if (!user) return;
  
  if (confirm(`정말로 기사 '${user.name}'(@${username}) 계정을 강제 삭제하시겠습니까?\n이 사용자의 모든 운행 기록과 거래처 정보도 함께 소멸됩니다.`)) {
    if (supabaseClient && appState.currentUser && appState.currentUser.role === 'admin') {
      try {
        const email = `${username}@logilog.com`;
        const { data: userProfile } = await supabaseClient.from('profiles').select('id').eq('email', email).single();
        if (userProfile) {
          // Deleting profile triggers cascading delete for trips, expenses, clients, etc. in PostgreSQL!
          await supabaseClient.from('profiles').delete().eq('id', userProfile.id);
        }
      } catch (err) {
        console.error("Supabase deleteUserAccount error:", err);
      }
    }
    appState.users = appState.users.filter(u => u.username !== username);
    localStorage.setItem("logilog_users", JSON.stringify(appState.users));
    
    appState.trips = appState.trips.filter(t => t.userId !== username);
    localStorage.setItem("logilog_trips", JSON.stringify(appState.trips));
    
    appState.clients = appState.clients.filter(c => c.userId !== username);
    localStorage.setItem("logilog_clients", JSON.stringify(appState.clients));

    appState.expenses = appState.expenses.filter(e => e.userId !== username);
    localStorage.setItem("logilog_expenses", JSON.stringify(appState.expenses));
    
    showToast(`계정 및 관련 데이터가 일괄 파기되었습니다.`);
    renderAdminPanel();
  }
}

// ----------------------------------------------------
// EXPENSES MANAGEMENT (TAB 3 - Ver 2.18)
// ----------------------------------------------------
function populateExpenseMonthSelect() {
  const select = document.getElementById("expense-month-select");
  if (!select) return;
  
  const previousValue = select.value;
  const userExpenses = appState.expenses.filter(e => e.userId === appState.currentUser.username);
  const monthsSet = new Set();
  
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  monthsSet.add(currentMonthStr);
  
  userExpenses.forEach(exp => {
    if (exp.date) {
      const ym = exp.date.substring(0, 7);
      if (/^\d{4}-\d{2}$/.test(ym)) {
        monthsSet.add(ym);
      }
    }
  });
  
  const sortedMonths = Array.from(monthsSet).sort().reverse();
  
  select.innerHTML = "";
  sortedMonths.forEach(ym => {
    const option = document.createElement("option");
    option.value = ym;
    const parts = ym.split("-");
    option.textContent = `${parts[0]}년 ${parts[1]}월`;
    select.appendChild(option);
  });
  
  if (previousValue && sortedMonths.includes(previousValue)) {
    select.value = previousValue;
  } else {
    select.value = currentMonthStr;
  }
}

function renderExpensesList() {
  const container = document.getElementById("expenses-list");
  if (!container) return;
  
  const searchInput = document.getElementById("expense-search");
  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : "";
  
  const monthSelect = document.getElementById("expense-month-select");
  const selectedMonth = monthSelect ? monthSelect.value : "";
  
  const typeFilter = appState.expenseTypeFilter;
  
  let filtered = appState.expenses.filter(e => e.userId === appState.currentUser.username);
  
  if (selectedMonth) {
    filtered = filtered.filter(e => e.date && e.date.startsWith(selectedMonth));
  }
  
  if (typeFilter !== 'all') {
    filtered = filtered.filter(e => e.type === typeFilter);
  }
  
  if (searchQuery) {
    filtered = filtered.filter(e => 
      (e.title && e.title.toLowerCase().includes(searchQuery)) ||
      (e.category && e.category.toLowerCase().includes(searchQuery)) ||
      (e.notes && e.notes.toLowerCase().includes(searchQuery))
    );
  }
  
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let monthTotal = 0;
  let monthFixed = 0;
  let monthVariable = 0;
  
  const monthFiltered = appState.expenses.filter(e => e.userId === appState.currentUser.username && e.date && e.date.startsWith(selectedMonth));
  monthFiltered.forEach(e => {
    const amt = Number(e.amount) || 0;
    monthTotal += amt;
    if (e.type === 'fixed') {
      monthFixed += amt;
    } else if (e.type === 'variable') {
      monthVariable += amt;
    }
  });
  
  const totalEl = document.getElementById("expense-stat-total");
  const fixedEl = document.getElementById("expense-stat-fixed");
  const varEl = document.getElementById("expense-stat-variable");
  const labelEl = document.getElementById("expense-stat-title-label");
  
  if (totalEl) totalEl.innerText = monthTotal.toLocaleString() + "원";
  if (fixedEl) fixedEl.innerText = monthFixed.toLocaleString() + "원";
  if (varEl) varEl.innerText = monthVariable.toLocaleString() + "원";
  if (labelEl && selectedMonth) {
    const parts = selectedMonth.split("-");
    labelEl.innerText = `${parts[0]}년 ${parts[1]}월 총 경비`;
  }

  // ----------------------------------------------------
  // Aggregate category breakdowns for the selected month (Ver 2.16 Patch 6)
  // ----------------------------------------------------
  const totalMap = {};
  const fixedMap = {};
  const variableMap = {};

  monthFiltered.forEach(e => {
    const cat = e.category || "기타";
    const amt = Number(e.amount) || 0;
    
    // 1. Total breakdown
    totalMap[cat] = (totalMap[cat] || 0) + amt;

    // 2. Split fixed / variable
    if (e.type === "fixed") {
      fixedMap[cat] = (fixedMap[cat] || 0) + amt;
    } else {
      variableMap[cat] = (variableMap[cat] || 0) + amt;
    }
  });

  const generateBreakdownHtml = (map) => {
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
      return `<div style="text-align: center; color: var(--text-muted); padding: 4px 0; font-size: 0.72rem;">등록된 경비 내역이 없습니다.</div>`;
    }
    return entries.map(([cat, amt]) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 2px 0;">
        <span style="color: var(--text-main); font-weight: 500;">${cat}</span>
        <strong style="color: var(--text-main); font-weight: 600;">${amt.toLocaleString()}원</strong>
      </div>
    `).join("");
  };

  const totalContentEl = document.getElementById("detail-expense-total-content");
  const fixedContentEl = document.getElementById("detail-expense-fixed-content");
  const variableContentEl = document.getElementById("detail-expense-variable-content");

  if (totalContentEl) totalContentEl.innerHTML = generateBreakdownHtml(totalMap);
  if (fixedContentEl) fixedContentEl.innerHTML = generateBreakdownHtml(fixedMap);
  if (variableContentEl) variableContentEl.innerHTML = generateBreakdownHtml(variableMap);
  
  container.innerHTML = "";
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="search"></i>
        <p>조건에 부합하는 경비 내역이 없습니다.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }
  
  filtered.forEach(exp => {
    container.appendChild(createExpenseElement(exp));
  });
  
  lucide.createIcons();
}

function createExpenseElement(exp) {
  const item = document.createElement("div");
  item.className = "db-trip-item";
  item.setAttribute("onclick", "toggleDashboardTripDetail(this)");
  
  const typeBadgeText = exp.type === 'fixed' ? '고정 경비' : '유동 경비';
  const typeBadgeClass = exp.type === 'fixed' ? 'fixed' : 'variable';
  
  const dateObj = new Date(exp.date);
  const displayDate = exp.date ? `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}` : "-";
  
  item.innerHTML = `
    <div class="db-trip-summary">
      <div class="db-trip-left">
        <div class="db-trip-date-client">
          <span class="db-trip-date">${displayDate}</span>
          <span class="expense-category">${exp.category}</span>
        </div>
        <span class="db-trip-route" style="font-size: 0.85rem; font-weight: 600;">
          ${exp.title}
        </span>
      </div>
      <div class="db-trip-right">
        <span class="expense-type-badge ${typeBadgeClass}">${typeBadgeText}</span>
        <span class="expense-amount">${Number(exp.amount).toLocaleString()}원</span>
      </div>
    </div>
    <div class="db-trip-detail-wrapper">
      <div class="db-trip-detail">
        <div class="detail-grid">
          <div class="detail-row">
            <span>지출 날짜</span>
            <strong>${exp.date}</strong>
          </div>
          <div class="detail-row">
            <span>구분</span>
            <strong>${typeBadgeText} (${exp.category})</strong>
          </div>
          <div class="detail-row highlight">
            <span>지출 금액</span>
            <strong class="text-danger">${Number(exp.amount).toLocaleString()}원</strong>
          </div>
          ${exp.notes ? `
          <div class="detail-row notes" style="border-bottom: none;">
            <span>메모 / 특이사항</span>
            <p>${exp.notes}</p>
          </div>` : ''}
          <div class="card-actions" style="margin-top: 10px; border-top: 1px dashed var(--bg-card-border); padding-top: 10px;">
            <button class="btn-icon" onclick="event.stopPropagation(); editExpense('${exp.id}')" title="수정">
              <i data-lucide="edit-2"></i>
            </button>
            <button class="btn-icon delete" onclick="event.stopPropagation(); deleteExpense('${exp.id}')" title="삭제">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  return item;
}

function handleExpenseTypeChange() {
  const fixedRadio = document.getElementById("expense-type-fixed");
  const typeHidden = document.getElementById("expense-modal-type");
  if (!fixedRadio || !typeHidden) return;
  
  const newType = fixedRadio.checked ? "fixed" : "variable";
  typeHidden.value = newType;
  
  // Update categories for this type
  updateCategoryOptions(newType);
  
  // Set default category for this type
  const categorySelect = document.getElementById("expense-modal-category");
  if (categorySelect && categorySelect.options.length > 0) {
    categorySelect.value = categorySelect.options[0].value;
  }
  
  // Reset Category Swap state to Select dropdown
  handleExpenseCategoryChange();
}

function updateCategoryOptions(type) {
  const categorySelect = document.getElementById("expense-modal-category");
  if (!categorySelect) return;
  
  categorySelect.innerHTML = "";
  
  let options = [];
  if (type === "fixed") {
    options = [
      { value: "차량할부", text: "차량할부" },
      { value: "보험료", text: "보험료" },
      { value: "세금", text: "세금 / 공과금" }
    ];
  } else {
    options = [
      { value: "주유비", text: "주유비" },
      { value: "차량정비", text: "차량정비" },
      { value: "통신비", text: "통신비" }
    ];
  }
  
  options.forEach(opt => {
    const o = document.createElement("option");
    o.value = opt.value;
    o.innerText = opt.text;
    categorySelect.appendChild(o);
  });
  
  // Add "직접입력" option
  const o = document.createElement("option");
  o.value = "직접입력";
  o.innerText = "직접 입력";
  categorySelect.appendChild(o);
}

function handleExpenseCategoryChange() {
  const categorySelect = document.getElementById("expense-modal-category");
  const selectWrapper = document.getElementById("wrapper-category-select");
  const customWrapper = document.getElementById("wrapper-category-custom");
  const customInput = document.getElementById("expense-modal-custom-category");
  
  if (!categorySelect || !selectWrapper || !customWrapper || !customInput) return;
  
  if (categorySelect.value === "직접입력") {
    selectWrapper.style.display = "none";
    customWrapper.style.display = "block";
    customInput.required = true;
    customInput.focus();
  } else {
    selectWrapper.style.display = "block";
    customWrapper.style.display = "none";
    customInput.required = false;
    customInput.value = "";
  }
}

function resetExpenseCategoryDropdown() {
  const categorySelect = document.getElementById("expense-modal-category");
  if (categorySelect) {
    categorySelect.value = categorySelect.options[0].value;
    handleExpenseCategoryChange();
  }
}

function handleExpenseRepeatChange() {
  const repeatSelect = document.getElementById("expense-modal-repeat-type");
  const countInput = document.getElementById("expense-modal-repeat-count");
  const countLabel = document.getElementById("label-expense-repeat-count");
  
  if (!repeatSelect || !countInput || !countLabel) return;
  
  if (repeatSelect.value !== "none") {
    countInput.disabled = false;
    countInput.style.opacity = "1";
    countLabel.style.opacity = "1";
    countInput.required = true;
    if (countInput.value === "" || countInput.value === "1") {
      countInput.value = "2"; // Default to 2 if they select repeating
    }
  } else {
    countInput.disabled = true;
    countInput.style.opacity = "0.5";
    countLabel.style.opacity = "0.5";
    countInput.required = false;
    countInput.value = "1";
  }
}

function openExpenseModal(expenseId = null) {
  const dialogExpense = document.getElementById("dialog-expense");
  const modalTitle = document.getElementById("expense-modal-title");
  const form = document.getElementById("form-expense");
  
  form.reset();
  
  document.getElementById("expense-modal-date").value = getLocalDateString();
  
  const repeatTypeGroup = document.getElementById("group-expense-repeat-type");
  const repeatCountGroup = document.getElementById("group-expense-repeat-count");
  const repeatCountInput = document.getElementById("expense-modal-repeat-count");
  const repeatCountLabel = document.getElementById("label-expense-repeat-count");
  const selectWrapper = document.getElementById("wrapper-category-select");
  const customWrapper = document.getElementById("wrapper-category-custom");
  const customInput = document.getElementById("expense-modal-custom-category");
  const typeHidden = document.getElementById("expense-modal-type");
  
  if (expenseId) {
    modalTitle.innerText = "경비 기록 수정";
    const exp = appState.expenses.find(e => e.id === expenseId);
    if (exp) {
      document.getElementById("expense-id").value = exp.id;
      document.getElementById("expense-modal-date").value = exp.date;
      
      // Determine Type (Fixed or Variable)
      let typeVal = exp.type || "fixed";
      const standardFixed = ["차량할부", "보험료", "세금"];
      const standardVariable = ["주유비", "차량정비", "통신비"];
      if (standardFixed.includes(exp.category)) {
        typeVal = "fixed";
      } else if (standardVariable.includes(exp.category)) {
        typeVal = "variable";
      }
      
      // Set type hidden input and check correct radio button
      typeHidden.value = typeVal;
      if (typeVal === "fixed") {
        document.getElementById("expense-type-fixed").checked = true;
      } else {
        document.getElementById("expense-type-variable").checked = true;
      }
      
      // Update categories for this type
      updateCategoryOptions(typeVal);
      
      // Set Category values
      const categorySelect = document.getElementById("expense-modal-category");
      if (standardFixed.includes(exp.category) || standardVariable.includes(exp.category)) {
        categorySelect.value = exp.category;
        if (selectWrapper) selectWrapper.style.display = "block";
        if (customWrapper) customWrapper.style.display = "none";
        if (customInput) customInput.required = false;
      } else {
        categorySelect.value = "직접입력";
        if (selectWrapper) selectWrapper.style.display = "none";
        if (customWrapper) {
          customWrapper.style.display = "block";
          customInput.value = exp.category;
          customInput.required = true;
        }
      }
      
      document.getElementById("expense-modal-amount").value = exp.amount;
      document.getElementById("expense-modal-title-input").value = exp.title || "";
      document.getElementById("expense-modal-notes").value = exp.notes || "";
      
      // Hide repeat options when editing
      if (repeatTypeGroup) repeatTypeGroup.style.display = "none";
      if (repeatCountGroup) repeatCountGroup.style.display = "none";
    }
  } else {
    modalTitle.innerText = "경비 기록 등록";
    document.getElementById("expense-id").value = "";
    
    // Set default type to fixed
    typeHidden.value = "fixed";
    document.getElementById("expense-type-fixed").checked = true;
    updateCategoryOptions("fixed");
    
    // Reset category dropdown to default first option
    const categorySelect = document.getElementById("expense-modal-category");
    if (categorySelect && categorySelect.options.length > 0) {
      categorySelect.value = categorySelect.options[0].value;
    }
    
    if (selectWrapper) selectWrapper.style.display = "block";
    if (customWrapper) customWrapper.style.display = "none";
    if (customInput) {
      customInput.required = false;
      customInput.value = "";
    }
    
    // Show repeat options when adding
    if (repeatTypeGroup) repeatTypeGroup.style.display = "";
    if (repeatCountGroup) repeatCountGroup.style.display = "";
    
    // Reset repeat options to default (disabled)
    document.getElementById("expense-modal-repeat-type").value = "none";
    if (repeatCountInput) {
      repeatCountInput.disabled = true;
      repeatCountInput.value = "1";
      repeatCountInput.style.opacity = "0.5";
    }
    if (repeatCountLabel) {
      repeatCountLabel.style.opacity = "0.5";
    }
  }
  
  checkExpenseDraft(expenseId);
  
  if (dialogExpense) {
    dialogExpense.show();
    lucide.createIcons(); // To resolve the new segment control icons
  }
}

function closeExpenseModal() {
  const dialogExpense = document.getElementById("dialog-expense");
  if (dialogExpense) dialogExpense.close();
}

function saveExpense() {
  const id = document.getElementById("expense-id").value;
  const date = document.getElementById("expense-modal-date").value;
  const type = document.getElementById("expense-modal-type").value;
  const categorySelect = document.getElementById("expense-modal-category").value;
  const amount = Number(document.getElementById("expense-modal-amount").value);
  let title = document.getElementById("expense-modal-title-input").value.trim();
  const notes = document.getElementById("expense-modal-notes").value.trim();
  
  let category = categorySelect;
  if (categorySelect === "직접입력") {
    category = document.getElementById("expense-modal-custom-category").value.trim();
    if (!category) {
      showToast("분류명을 직접 입력해 주세요.");
      return;
    }
  }
  
  if (!date || !type || !category || isNaN(amount) || amount <= 0) {
    showToast("필수 값을 올바르게 입력해 주세요.");
    return;
  }
  
  // If title is blank, fill with category (User Request 4)
  if (!title) {
    title = category;
  }
  
  if (id) {
    // Edit mode
    const index = appState.expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      const existingUserId = appState.expenses[index].userId || appState.currentUser.username;
      appState.expenses[index] = { id, userId: existingUserId, date, type, category, amount, title, notes };
      showToast("경비 기록이 수정되었습니다.");
    }
  } else {
    // Add mode with optional repeat
    const repeatType = document.getElementById("expense-modal-repeat-type").value;
    const repeatCount = Number(document.getElementById("expense-modal-repeat-count").value) || 1;
    
    if (repeatType === "none" || repeatCount <= 1) {
      const newExpense = {
        id: "expense-" + Date.now(),
        userId: appState.currentUser.username,
        date,
        type,
        category,
        amount,
        title,
        notes
      };
      appState.expenses.push(newExpense);
      showToast("새로운 경비가 등록되었습니다.");
    } else {
      const timestamp = Date.now();
      for (let i = 0; i < repeatCount; i++) {
        const recurrentDate = getNextRecurrentDate(date, repeatType, i);
        let recurrentNotes = notes;
        if (repeatCount > 1) {
          const repeatLabel = `(${i + 1}/${repeatCount}회 반복)`;
          recurrentNotes = notes ? `${notes} ${repeatLabel}` : repeatLabel;
        }
        
        const newExpense = {
          id: `expense-${timestamp}-${i}`,
          userId: appState.currentUser.username,
          date: recurrentDate,
          type,
          category,
          amount,
          title,
          notes: recurrentNotes
        };
        appState.expenses.push(newExpense);
      }
      showToast(`새로운 경비가 등록되었습니다. (${repeatCount}회 반복 등록 완료)`);
    }
  }
  
  saveData();
  clearExpenseDraft(false);
  closeExpenseModal();
  renderExpensesPanel();
  updateDashboardStats();
}

function getNextRecurrentDate(baseDateStr, repeatType, index) {
  const parts = baseDateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);
  
  const d = new Date(year, month, day);
  
  if (repeatType === 'weekly') {
    d.setDate(d.getDate() + 7 * index);
  } else if (repeatType === 'monthly') {
    d.setMonth(d.getMonth() + index);
  }
  
  const yStr = d.getFullYear();
  const mStr = String(d.getMonth() + 1).padStart(2, "0");
  const dStr = String(d.getDate()).padStart(2, "0");
  return `${yStr}-${mStr}-${dStr}`;
}

function editExpense(expenseId) {
  openExpenseModal(expenseId);
}

async function deleteExpense(expenseId) {
  const exp = appState.expenses.find(e => e.id === expenseId);
  if (!exp) return;
  
  if (confirm(`정말로 '${exp.title}' 경비 기록을 삭제하시겠습니까?`)) {
    if (supabaseClient && appState.currentUser && appState.currentUser.uid) {
      try {
        await supabaseClient.from('expenses').delete().eq('id', expenseId);
      } catch (err) {
        console.error("Supabase expense delete failed:", err);
      }
    }
    appState.expenses = appState.expenses.filter(e => e.id !== expenseId);
    saveData();
    showToast("경비 기록이 삭제되었습니다.");
    renderExpensesPanel();
    updateDashboardStats();
  }
}

function renderExpensesPanel() {
  populateExpenseMonthSelect();
  renderExpensesList();
}

function setExpenseTypeFilter(type) {
  appState.expenseTypeFilter = type;
  
  const buttons = document.querySelectorAll("#expense-type-filters .filter-btn");
  buttons.forEach(btn => {
    if (btn.getAttribute("data-type") === type) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  
  renderExpensesList();
}

// ----------------------------------------------------
// MOBILE SWIPE GESTURE TO SWITCH TABS
// ----------------------------------------------------
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

document.addEventListener('touchstart', e => {
  const dialogTrip = document.getElementById("dialog-trip");
  const dialogExpense = document.getElementById("dialog-expense");
  const dialogTracker = document.getElementById("dialog-tracker");
  const dialogLocation = document.getElementById("dialog-location-picker");
  const dialogClient = document.getElementById("dialog-client");
  
  if (
    (dialogTrip && dialogTrip.hasAttribute('open')) ||
    (dialogExpense && dialogExpense.hasAttribute('open')) ||
    (dialogTracker && dialogTracker.hasAttribute('open')) ||
    (dialogLocation && dialogLocation.hasAttribute('open')) ||
    (dialogClient && dialogClient.hasAttribute('open'))
  ) {
    return; // Don't swipe tabs if any modal/tracker is open
  }
  
  // Ignore gestures starting on map, inputs, sliders, or other interactive components
  const target = e.target;
  if (target.closest('input') || target.closest('textarea') || target.closest('select') || target.closest('.no-swipe') || target.closest('#tracker-demo-toggle') || target.closest('.demo-switch-container')) {
    return;
  }

  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', e => {
  const dialogTrip = document.getElementById("dialog-trip");
  const dialogExpense = document.getElementById("dialog-expense");
  const dialogTracker = document.getElementById("dialog-tracker");
  const dialogLocation = document.getElementById("dialog-location-picker");
  const dialogClient = document.getElementById("dialog-client");
  
  if (
    (dialogTrip && dialogTrip.hasAttribute('open')) ||
    (dialogExpense && dialogExpense.hasAttribute('open')) ||
    (dialogTracker && dialogTracker.hasAttribute('open')) ||
    (dialogLocation && dialogLocation.hasAttribute('open')) ||
    (dialogClient && dialogClient.hasAttribute('open'))
  ) {
    return;
  }

  const target = e.target;
  if (target.closest('input') || target.closest('textarea') || target.closest('select') || target.closest('.no-swipe') || target.closest('#tracker-demo-toggle') || target.closest('.demo-switch-container')) {
    return;
  }

  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  
  handleSwipeGesture();
}, { passive: true });

function handleSwipeGesture() {
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;
  
  // Swipe must be horizontal (X distance > Y distance) and exceed threshold (80px)
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 80) {
    const activeNavItem = document.querySelector(".app-nav .nav-item.active");
    if (!activeNavItem) return;
    const currentTab = activeNavItem.getAttribute("data-target");
    
    // Build array of currently visible navigation tabs
    const visibleTabs = ["home", "trips", "expenses", "dashboard", "clients", "settings"];
    if (appState.currentUser && appState.currentUser.role === "admin") {
      visibleTabs.push("admin");
    }
    
    const currentIndex = visibleTabs.indexOf(currentTab);
    if (currentIndex === -1) return;
    
    if (diffX < 0) {
      // Swipe Left -> Next Tab
      if (currentIndex < visibleTabs.length - 1) {
        switchTab(visibleTabs[currentIndex + 1]);
      }
    } else {
      // Swipe Right -> Previous Tab
      if (currentIndex > 0) {
        switchTab(visibleTabs[currentIndex - 1]);
      }
    }
  }
}


