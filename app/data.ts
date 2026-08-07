export type RecordStatus = "existing" | "changed" | "demolished";

export type SpatialRecord = {
  id: string;
  number: string;
  title: string;
  titleEn: string;
  area: string;
  address: string;
  lat: number;
  lng: number;
  date: string;
  year: string;
  status: RecordStatus;
  statusLabel: string;
  equipment: string;
  method: string[];
  description: string;
  note: string;
  splatUrl?: string;
  vr: boolean;
};

export const records: SpatialRecord[] = [
  {
    id: "bogwang-001", number: "001", title: "보광동 골목", titleEn: "BOGWANG ALLEY",
    area: "서울 · 용산", address: "서울특별시 용산구 보광동", lat: 37.5264, lng: 126.9682,
    date: "2026.07.04", year: "2026", status: "changed", statusLabel: "변화 중",
    equipment: "Raven Max", method: ["LiDAR", "Gaussian Splatting"],
    description: "재개발 경계에 놓인 낮은 주택과 경사진 골목. 오후 빛이 벽과 담 사이를 지나가는 순간을 기록했다.",
    note: "골목 남측의 일부 건물은 기록 이후 철거 준비가 시작되었다.", vr: true,
  },
  {
    id: "euljiro-002", number: "002", title: "을지로 인쇄골목", titleEn: "EULJIRO PRINT ALLEY",
    area: "서울 · 중구", address: "서울특별시 중구 을지로3가", lat: 37.5664, lng: 126.9927,
    date: "2026.05.18", year: "2026", status: "existing", statusLabel: "현존",
    equipment: "Raven Max", method: ["LiDAR", "Photogrammetry"],
    description: "인쇄소의 셔터, 적재된 종이와 좁은 통로가 만드는 생산의 풍경을 영업 종료 직후 기록했다.",
    note: "건물과 인쇄소 모두 현재 운영 중이다.", vr: false,
  },
  {
    id: "sewoon-003", number: "003", title: "세운상가 보행데크", titleEn: "SEWOON WALKWAY",
    area: "서울 · 종로", address: "서울특별시 종로구 청계천로", lat: 37.5691, lng: 126.9954,
    date: "2025.11.02", year: "2025", status: "changed", statusLabel: "변화 중",
    equipment: "iPhone LiDAR", method: ["LiDAR", "Gaussian Splatting"],
    description: "도심의 여러 층위를 잇는 보행데크와 오래된 전자상가의 외피를 연속적으로 스캔했다.",
    note: "정비 계획에 따라 주변 보행 구조가 단계적으로 바뀌고 있다.", vr: true,
  },
  {
    id: "mullae-004", number: "004", title: "문래 철공소", titleEn: "MULLAE WORKSHOP",
    area: "서울 · 영등포", address: "서울특별시 영등포구 문래동", lat: 37.5136, lng: 126.8968,
    date: "2025.08.21", year: "2025", status: "existing", statusLabel: "현존",
    equipment: "Raven Max", method: ["LiDAR", "Gaussian Splatting"],
    description: "절삭기와 금속 부품이 밀집한 소규모 철공소 내부를 작업자의 동선에 따라 기록했다.",
    note: "현재 동일한 작업자가 공간을 사용하고 있다.", vr: true,
  },
  {
    id: "yongsan-005", number: "005", title: "용산 철도창고", titleEn: "YONGSAN RAIL DEPOT",
    area: "서울 · 용산", address: "서울특별시 용산구 한강로", lat: 37.5272, lng: 126.9636,
    date: "2024.12.14", year: "2024", status: "demolished", statusLabel: "철거됨",
    equipment: "Leica BLK360", method: ["LiDAR", "Photogrammetry"],
    description: "철도 배후 시설로 사용되던 붉은 벽돌 창고의 마지막 겨울 모습을 내·외부에서 기록했다.",
    note: "2025년 4월 철거가 확인되었다.", vr: false,
  },
  {
    id: "buyeo-006", number: "006", title: "부여 폐교", titleEn: "BUYEO CLOSED SCHOOL",
    area: "충남 · 부여", address: "충청남도 부여군 외산면", lat: 36.2752, lng: 126.7793,
    date: "2024.10.09", year: "2024", status: "existing", statusLabel: "현존",
    equipment: "Raven Max", method: ["LiDAR", "Gaussian Splatting"],
    description: "운동장의 수목과 비어 있는 교실, 긴 복도를 한 번의 연속된 공간으로 기록한 폐교 아카이브다.",
    note: "지역 공동체의 임시 보관 공간으로 사용 중이다.", vr: true,
  },
];

export function getRecord(id: string) {
  return records.find((record) => record.id === id);
}
