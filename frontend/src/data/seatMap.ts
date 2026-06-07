import type { FloorMapData, Seat, SeatStatus } from "../types";

function generateTime(offsetMinutes: number): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + offsetMinutes);
  return now.toISOString();
}

function formatTimeRemaining(endTimeStr: string): string {
  const endTime = new Date(endTimeStr).getTime();
  const now = Date.now();
  const diff = endTime - now;
  if (diff <= 0) return "即将结束";
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}小时${mins}分后结束`;
  return `${mins}分钟后结束`;
}

function formatTimeShort(timeStr: string): string {
  const date = new Date(timeStr);
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

function getNextAvailableTime(seat: Seat): string | undefined {
  if (seat.status === "available") return "现在可用";
  if (seat.currentBooking?.endTime) {
    if (seat.status === "to_clean") {
      return `清洁中，预计 ${formatTimeShort(generateTime(15))} 可用`;
    }
    return `${formatTimeShort(seat.currentBooking.endTime)} 可用（${formatTimeRemaining(seat.currentBooking.endTime)}）`;
  }
  return undefined;
}

const floor2Seats: Seat[] = [
  { id: "2-01", seatNo: "2F-A01", floor: 2, x: 60, y: 60, width: 70, height: 45, type: "window", status: "available" as SeatStatus },
  { id: "2-02", seatNo: "2F-A02", floor: 2, x: 60, y: 120, width: 70, height: 45, type: "window", status: "available" as SeatStatus },
  { id: "2-03", seatNo: "2F-A03", floor: 2, x: 60, y: 180, width: 70, height: 45, type: "window", status: "in_use" as SeatStatus,
    currentBooking: { userId: "u001", userName: "张同学", startTime: generateTime(-120), endTime: generateTime(30), checkedIn: true } },
  { id: "2-04", seatNo: "2F-A04", floor: 2, x: 60, y: 240, width: 70, height: 45, type: "window", status: "available" as SeatStatus },
  { id: "2-05", seatNo: "2F-A05", floor: 2, x: 60, y: 300, width: 70, height: 45, type: "window", status: "to_clean" as SeatStatus,
    currentBooking: { userId: "u002", userName: "李同学", startTime: generateTime(-240), endTime: generateTime(5), checkedIn: true } },

  { id: "2-06", seatNo: "2F-B01", floor: 2, x: 160, y: 60, width: 70, height: 45, type: "power", status: "in_use" as SeatStatus,
    currentBooking: { userId: "u003", userName: "王同学", startTime: generateTime(-90), endTime: generateTime(120), checkedIn: true } },
  { id: "2-07", seatNo: "2F-B02", floor: 2, x: 160, y: 120, width: 70, height: 45, type: "power", status: "available" as SeatStatus },
  { id: "2-08", seatNo: "2F-B03", floor: 2, x: 160, y: 180, width: 70, height: 45, type: "power", status: "booked" as SeatStatus,
    currentBooking: { userId: "u004", userName: "赵同学", startTime: generateTime(10), endTime: generateTime(130), checkedIn: false } },
  { id: "2-09", seatNo: "2F-B04", floor: 2, x: 160, y: 240, width: 70, height: 45, type: "power", status: "available" as SeatStatus },
  { id: "2-10", seatNo: "2F-B05", floor: 2, x: 160, y: 300, width: 70, height: 45, type: "power", status: "in_use" as SeatStatus,
    currentBooking: { userId: "u005", userName: "陈同学", startTime: generateTime(-60), endTime: generateTime(180), checkedIn: true } },

  { id: "2-11", seatNo: "2F-C01", floor: 2, x: 260, y: 60, width: 70, height: 45, type: "standard", status: "available" as SeatStatus },
  { id: "2-12", seatNo: "2F-C02", floor: 2, x: 260, y: 120, width: 70, height: 45, type: "standard", status: "booked" as SeatStatus,
    currentBooking: { userId: "u006", userName: "刘同学", startTime: generateTime(5), endTime: generateTime(125), checkedIn: false } },
  { id: "2-13", seatNo: "2F-C03", floor: 2, x: 260, y: 180, width: 70, height: 45, type: "standard", status: "available" as SeatStatus },
  { id: "2-14", seatNo: "2F-C04", floor: 2, x: 260, y: 240, width: 70, height: 45, type: "standard", status: "to_clean" as SeatStatus,
    currentBooking: { userId: "u007", userName: "周同学", startTime: generateTime(-180), endTime: generateTime(2), checkedIn: true } },
  { id: "2-15", seatNo: "2F-C05", floor: 2, x: 260, y: 300, width: 70, height: 45, type: "standard", status: "available" as SeatStatus },

  { id: "2-16", seatNo: "2F-D01", floor: 2, x: 360, y: 60, width: 70, height: 45, type: "standard", status: "available" as SeatStatus },
  { id: "2-17", seatNo: "2F-D02", floor: 2, x: 360, y: 120, width: 70, height: 45, type: "standard", status: "in_use" as SeatStatus,
    currentBooking: { userId: "u008", userName: "吴同学", startTime: generateTime(-30), endTime: generateTime(90), checkedIn: true } },
  { id: "2-18", seatNo: "2F-D03", floor: 2, x: 360, y: 180, width: 70, height: 45, type: "standard", status: "available" as SeatStatus },
  { id: "2-19", seatNo: "2F-D04", floor: 2, x: 360, y: 240, width: 70, height: 45, type: "standard", status: "booked" as SeatStatus,
    currentBooking: { userId: "u009", userName: "郑同学", startTime: generateTime(20), endTime: generateTime(140), checkedIn: false } },
  { id: "2-20", seatNo: "2F-D05", floor: 2, x: 360, y: 300, width: 70, height: 45, type: "standard", status: "available" as SeatStatus },

  { id: "2-21", seatNo: "2F-E01", floor: 2, x: 460, y: 60, width: 70, height: 45, type: "power", status: "available" as SeatStatus },
  { id: "2-22", seatNo: "2F-E02", floor: 2, x: 460, y: 120, width: 70, height: 45, type: "power", status: "available" as SeatStatus },
  { id: "2-23", seatNo: "2F-E03", floor: 2, x: 460, y: 180, width: 70, height: 45, type: "power", status: "in_use" as SeatStatus,
    currentBooking: { userId: "u010", userName: "孙同学", startTime: generateTime(-150), endTime: generateTime(60), checkedIn: true } },
  { id: "2-24", seatNo: "2F-E04", floor: 2, x: 460, y: 240, width: 70, height: 45, type: "power", status: "available" as SeatStatus },
  { id: "2-25", seatNo: "2F-E05", floor: 2, x: 460, y: 300, width: 70, height: 45, type: "power", status: "booked" as SeatStatus,
    currentBooking: { userId: "u011", userName: "钱同学", startTime: generateTime(8), endTime: generateTime(128), checkedIn: false } },
];

const floor3Seats: Seat[] = [
  { id: "3-01", seatNo: "3F-A01", floor: 3, x: 60, y: 60, width: 70, height: 45, type: "window", status: "available" as SeatStatus },
  { id: "3-02", seatNo: "3F-A02", floor: 3, x: 60, y: 120, width: 70, height: 45, type: "window", status: "in_use" as SeatStatus,
    currentBooking: { userId: "u101", userName: "冯同学", startTime: generateTime(-100), endTime: generateTime(20), checkedIn: true } },
  { id: "3-03", seatNo: "3F-A03", floor: 3, x: 60, y: 180, width: 70, height: 45, type: "window", status: "available" as SeatStatus },
  { id: "3-04", seatNo: "3F-A04", floor: 3, x: 60, y: 240, width: 70, height: 45, type: "window", status: "booked" as SeatStatus,
    currentBooking: { userId: "u102", userName: "蒋同学", startTime: generateTime(15), endTime: generateTime(135), checkedIn: false } },
  { id: "3-05", seatNo: "3F-A05", floor: 3, x: 60, y: 300, width: 70, height: 45, type: "window", status: "available" as SeatStatus },

  { id: "3-06", seatNo: "3F-B01", floor: 3, x: 160, y: 60, width: 70, height: 45, type: "standard", status: "available" as SeatStatus },
  { id: "3-07", seatNo: "3F-B02", floor: 3, x: 160, y: 120, width: 70, height: 45, type: "standard", status: "available" as SeatStatus },
  { id: "3-08", seatNo: "3F-B03", floor: 3, x: 160, y: 180, width: 70, height: 45, type: "standard", status: "to_clean" as SeatStatus,
    currentBooking: { userId: "u103", userName: "沈同学", startTime: generateTime(-200), endTime: generateTime(3), checkedIn: true } },
  { id: "3-09", seatNo: "3F-B04", floor: 3, x: 160, y: 240, width: 70, height: 45, type: "standard", status: "in_use" as SeatStatus,
    currentBooking: { userId: "u104", userName: "韩同学", startTime: generateTime(-80), endTime: generateTime(100), checkedIn: true } },
  { id: "3-10", seatNo: "3F-B05", floor: 3, x: 160, y: 300, width: 70, height: 45, type: "standard", status: "available" as SeatStatus },

  { id: "3-11", seatNo: "3F-C01", floor: 3, x: 260, y: 60, width: 70, height: 45, type: "power", status: "in_use" as SeatStatus,
    currentBooking: { userId: "u105", userName: "杨同学", startTime: generateTime(-70), endTime: generateTime(50), checkedIn: true } },
  { id: "3-12", seatNo: "3F-C02", floor: 3, x: 260, y: 120, width: 70, height: 45, type: "power", status: "available" as SeatStatus },
  { id: "3-13", seatNo: "3F-C03", floor: 3, x: 260, y: 180, width: 70, height: 45, type: "power", status: "booked" as SeatStatus,
    currentBooking: { userId: "u106", userName: "朱同学", startTime: generateTime(25), endTime: generateTime(145), checkedIn: false } },
  { id: "3-14", seatNo: "3F-C04", floor: 3, x: 260, y: 240, width: 70, height: 45, type: "power", status: "available" as SeatStatus },
  { id: "3-15", seatNo: "3F-C05", floor: 3, x: 260, y: 300, width: 70, height: 45, type: "power", status: "available" as SeatStatus },
];

function enhanceSeatData(seat: Seat): Seat {
  return {
    ...seat,
    nextAvailableTime: getNextAvailableTime(seat),
  };
}

export const floorMapData: Record<number, FloorMapData> = {
  2: {
    floor: 2,
    floorName: "二楼自习区",
    width: 580,
    height: 400,
    seats: floor2Seats.map(enhanceSeatData),
  },
  3: {
    floor: 3,
    floorName: "三楼研讨区",
    width: 580,
    height: 400,
    seats: floor3Seats.map(enhanceSeatData),
  },
};

export function getFloorMap(floor: number): FloorMapData {
  const data = floorMapData[floor];
  return {
    ...data,
    seats: data.seats.map(enhanceSeatData),
  };
}

export function getAvailableFloors(): number[] {
  return Object.keys(floorMapData).map(Number).sort();
}

export function getFloorStats(floor: number): Record<string, number> {
  const map = getFloorMap(floor);
  const stats: Record<string, number> = {
    total: map.seats.length,
    available: 0,
    booked: 0,
    in_use: 0,
    to_clean: 0,
  };
  map.seats.forEach((seat) => {
    stats[seat.status]++;
  });
  return stats;
}

export { formatTimeRemaining, formatTimeShort, getNextAvailableTime };
