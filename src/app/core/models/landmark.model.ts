export type LandmarkCategory =
  | 'di-tich-lich-su'
  | 'ton-giao'
  | 'kien-truc'
  | 'thien-nhien'
  | 'bao-tang'
  | 'am-thuc';

export interface Landmark {
  id: string;
  name: string;
  category: LandmarkCategory;
  lat: number;
  lng: number;
  address: string;
  description: string;
  imageUrl?: string;
}

export interface CategoryOption {
  value: LandmarkCategory;
  label: string;
  icon: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'di-tich-lich-su', label: 'Di tích lịch sử', icon: '🏛️' },
  { value: 'ton-giao', label: 'Tôn giáo - Tâm linh', icon: '🛕' },
  { value: 'kien-truc', label: 'Kiến trúc', icon: '🏰' },
  { value: 'thien-nhien', label: 'Thiên nhiên', icon: '🌳' },
  { value: 'bao-tang', label: 'Bảo tàng', icon: '🖼️' },
  { value: 'am-thuc', label: 'Ẩm thực', icon: '🍜' },
];
