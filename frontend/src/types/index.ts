export interface FeatureItem {
  id: number;
  title: string;
  description: string;
  status: string;
  metric: string;
}

export interface KpiItem {
  label: string;
  value: string;
  trend: string;
  tone: string;
}

export interface OperationRecord {
  key: string;
  name: string;
  owner: string;
  status: string;
  metric: string;
  priority: string;
}

export interface OverviewResponse {
  appName: string;
  appCode: string;
  description: string;
  features: FeatureItem[];
  kpis: KpiItem[];
  records: OperationRecord[];
}

export enum SeatStatus {
  AVAILABLE = "available",
  BOOKED = "booked",
  IN_USE = "in_use",
  TO_CLEAN = "to_clean",
}

export interface Seat {
  id: string;
  seatNo: string;
  floor: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "standard" | "window" | "power";
  status: SeatStatus;
  currentBooking?: {
    userId: string;
    userName: string;
    startTime: string;
    endTime: string;
    checkedIn: boolean;
  };
  nextAvailableTime?: string;
}

export interface FloorMapData {
  floor: number;
  floorName: string;
  width: number;
  height: number;
  seats: Seat[];
}

export interface SeatStatusConfig {
  status: SeatStatus;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}
