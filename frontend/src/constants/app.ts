export const APP_NAME = "图书馆座位预约管理系统";
export const APP_CODE = "ldlibseat";
export const API_BASE_URL = "/api";
export const FRONTEND_PORT = 28510;
export const BACKEND_PORT = 29510;

export const APP_THEME = {
  paper: "#eef7fa",
  ink: "#162329",
  accent: "#257998",
  warm: "#d17a37",
  surface: "#d8eaf0",
};

export const SEAT_STATUS_CONFIG = {
  available: {
    status: "available",
    label: "空闲",
    color: "#162329",
    bgColor: "#e8f5e9",
    borderColor: "#4caf50",
    description: "当前无人预约，可立即选座",
  },
  booked: {
    status: "booked",
    label: "已约未签到",
    color: "#162329",
    bgColor: "#fff3e0",
    borderColor: "#ff9800",
    description: "已被预约但尚未签到，等待用户到场",
  },
  in_use: {
    status: "in_use",
    label: "使用中",
    color: "#ffffff",
    bgColor: "#ef5350",
    borderColor: "#c62828",
    description: "用户已签到，正在使用中",
  },
  to_clean: {
    status: "to_clean",
    label: "已结束待清理",
    color: "#162329",
    bgColor: "#e3f2fd",
    borderColor: "#1976d2",
    description: "使用已结束，等待清洁后释放",
  },
};

export const SEAT_TYPE_LABELS = {
  standard: "普通座位",
  window: "靠窗座位",
  power: "带电源座位",
};
