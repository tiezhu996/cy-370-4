<script setup lang="ts">
import { computed, ref, withDefaults } from "vue";
import type { Seat, FloorMapData, SeatStatus } from "../types";
import { SEAT_STATUS_CONFIG, SEAT_TYPE_LABELS } from "../constants/app";
import { getFloorMap, getAvailableFloors, getFloorStats } from "../data/seatMap";

const props = withDefaults(defineProps<{
  defaultFloor?: number;
  showLegend?: boolean;
  showStats?: boolean;
  selectable?: boolean;
}>(), {
  defaultFloor: 2,
  showLegend: true,
  showStats: true,
  selectable: false,
});

const emit = defineEmits<{
  (e: "seatClick", seat: Seat): void;
  (e: "floorChange", floor: number): void;
}>();

const currentFloor = ref(props.defaultFloor || getAvailableFloors()[0]);
const hoveredSeat = ref<Seat | null>(null);
const selectedSeat = ref<Seat | null>(null);

const availableFloors = computed(() => getAvailableFloors());

const floorData = computed<FloorMapData>(() => getFloorMap(currentFloor.value));

const floorStats = computed(() => getFloorStats(currentFloor.value));

const statusList = computed(() => Object.values(SEAT_STATUS_CONFIG));

function getSeatStyle(seat: Seat) {
  const config = SEAT_STATUS_CONFIG[seat.status as SeatStatus];
  const isHovered = hoveredSeat.value?.id === seat.id;
  const isSelected = selectedSeat.value?.id === seat.id;
  return {
    left: `${seat.x}px`,
    top: `${seat.y}px`,
    width: `${seat.width}px`,
    height: `${seat.height}px`,
    backgroundColor: config.bgColor,
    borderColor: isSelected ? "#257998" : isHovered ? config.borderColor : config.borderColor,
    color: config.color,
    transform: isHovered ? "scale(1.05)" : isSelected ? "scale(1.02)" : "scale(1)",
    boxShadow: isSelected ? "0 4px 12px rgba(37, 121, 152, 0.4)" : isHovered ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
  };
}

function getSeatTypeIcon(type: string): string {
  switch (type) {
    case "window": return "🪟";
    case "power": return "🔌";
    default: return "";
  }
}

function handleFloorChange(floor: number) {
  currentFloor.value = floor;
  selectedSeat.value = null;
  hoveredSeat.value = null;
  emit("floorChange", floor);
}

function handleSeatClick(seat: Seat) {
  if (props.selectable && seat.status === "available") {
    selectedSeat.value = seat;
  }
  emit("seatClick", seat);
}

function handleSeatMouseEnter(seat: Seat) {
  hoveredSeat.value = seat;
}

function handleSeatMouseLeave() {
  hoveredSeat.value = null;
}

function isEndingSoon(seat: Seat): boolean {
  if (!seat.currentBooking?.endTime) return false;
  const endTime = new Date(seat.currentBooking.endTime).getTime();
  const now = Date.now();
  return endTime - now < 30 * 60 * 1000 && endTime > now;
}
</script>

<template>
  <div class="seat-map-container">
    <div v-if="showStats !== false" class="floor-header">
      <div class="floor-tabs">
        <button
          v-for="floor in availableFloors"
          :key="floor"
          class="floor-tab"
          :class="{ active: currentFloor === floor }"
          @click="handleFloorChange(floor)"
        >
          {{ floor }}楼
        </button>
      </div>
      <div class="floor-stats">
        <span class="stat-item">
          <span class="stat-label">共</span>
          <span class="stat-value">{{ floorStats.total }}</span>
          <span class="stat-label">座</span>
        </span>
        <span class="stat-item available">
          <span class="stat-dot"></span>
          <span class="stat-label">空闲</span>
          <span class="stat-value">{{ floorStats.available }}</span>
        </span>
        <span class="stat-item booked">
          <span class="stat-dot"></span>
          <span class="stat-label">已约</span>
          <span class="stat-value">{{ floorStats.booked }}</span>
        </span>
        <span class="stat-item in-use">
          <span class="stat-dot"></span>
          <span class="stat-label">使用中</span>
          <span class="stat-value">{{ floorStats.in_use }}</span>
        </span>
        <span class="stat-item to-clean">
          <span class="stat-dot"></span>
          <span class="stat-label">待清理</span>
          <span class="stat-value">{{ floorStats.to_clean }}</span>
        </span>
      </div>
    </div>

    <div class="map-wrapper">
      <div
        class="seat-map"
        :style="{ width: floorData.width + 'px', height: floorData.height + 'px' }"
      >
        <div class="map-label map-label-north">北</div>
        <div class="map-label map-label-south">南</div>
        <div class="map-window" style="left: 0; top: 40px; height: 320px; width: 12px;"></div>
        <div class="map-window" style="left: 568px; top: 40px; height: 320px; width: 12px;"></div>

        <div
          v-for="seat in floorData.seats"
          :key="seat.id"
          class="seat-block"
          :class="{
            'seat-ending-soon': isEndingSoon(seat),
            'seat-selectable': selectable && seat.status === 'available',
            'seat-selected': selectedSeat?.id === seat.id,
          }"
          :style="getSeatStyle(seat)"
          @click="handleSeatClick(seat)"
          @mouseenter="handleSeatMouseEnter(seat)"
          @mouseleave="handleSeatMouseLeave"
        >
          <span class="seat-no">{{ seat.seatNo.split('-')[1] }}</span>
          <span v-if="getSeatTypeIcon(seat.type)" class="seat-type-icon">{{ getSeatTypeIcon(seat.type) }}</span>
          <span v-if="isEndingSoon(seat)" class="ending-badge">即将空出</span>
        </div>
      </div>

      <div v-if="hoveredSeat" class="seat-tooltip" :style="{
        left: Math.min(hoveredSeat.x + hoveredSeat.width + 10, floorData.width - 220) + 'px',
        top: Math.max(hoveredSeat.y - 20, 10) + 'px',
      }">
        <div class="tooltip-header">
          <strong>{{ hoveredSeat.seatNo }}</strong>
          <span class="status-tag" :style="{
            backgroundColor: SEAT_STATUS_CONFIG[hoveredSeat.status as SeatStatus].bgColor,
            borderColor: SEAT_STATUS_CONFIG[hoveredSeat.status as SeatStatus].borderColor,
            color: SEAT_STATUS_CONFIG[hoveredSeat.status as SeatStatus].color,
          }">
            {{ SEAT_STATUS_CONFIG[hoveredSeat.status as SeatStatus].label }}
          </span>
        </div>
        <div class="tooltip-body">
          <p class="tooltip-desc">{{ SEAT_STATUS_CONFIG[hoveredSeat.status as SeatStatus].description }}</p>
          <p class="tooltip-type">座位类型：{{ SEAT_TYPE_LABELS[hoveredSeat.type] }}</p>
          <p v-if="hoveredSeat.nextAvailableTime" class="tooltip-time">
            ⏰ {{ hoveredSeat.nextAvailableTime }}
          </p>
          <template v-if="hoveredSeat.currentBooking">
            <div class="booking-info">
              <p><span>使用人：</span>{{ hoveredSeat.currentBooking.userName }}</p>
              <p><span>预约时段：</span>
                {{ new Date(hoveredSeat.currentBooking.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
                -
                {{ new Date(hoveredSeat.currentBooking.endTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
              </p>
              <p>
                <span>签到状态：</span>
                <span :class="hoveredSeat.currentBooking.checkedIn ? 'checked-in' : 'not-checked-in'">
                  {{ hoveredSeat.currentBooking.checkedIn ? '✓ 已签到' : '○ 待签到' }}
                </span>
              </p>
            </div>
          </template>
          <p v-if="selectable && hoveredSeat.status === 'available'" class="book-hint">
            点击可选座预约
          </p>
        </div>
      </div>
    </div>

    <div v-if="showLegend !== false" class="legend-panel">
      <h4 class="legend-title">座位状态说明</h4>
      <div class="legend-items">
        <div v-for="config in statusList" :key="config.status" class="legend-item">
          <span class="legend-color" :style="{
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
          }"></span>
          <div class="legend-text">
            <strong>{{ config.label }}</strong>
            <p>{{ config.description }}</p>
          </div>
        </div>
      </div>
      <div class="legend-items mt-16">
        <div class="legend-item">
          <span class="legend-color" style="background: transparent; border: 2px dashed #999;"></span>
          <div class="legend-text">
            <strong>🪟 靠窗座位</strong>
            <p>靠近窗户，采光较好</p>
          </div>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background: transparent; border: 2px dashed #999;"></span>
          <div class="legend-text">
            <strong>🔌 带电源座位</strong>
            <p>配备电源插座，适合使用电脑</p>
          </div>
        </div>
      </div>
      <div class="legend-items mt-16">
        <div class="legend-item">
          <span class="legend-ending-badge">即将空出</span>
          <div class="legend-text">
            <strong>30分钟内结束</strong>
            <p>可稍作等待，座位即将释放</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seat-map-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.floor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 20px;
  background: color-mix(in srgb, #eef7fa 86%, white 14%);
  border: 1px solid color-mix(in srgb, #162329 13%, transparent);
  border-radius: 8px;
}

.floor-tabs {
  display: flex;
  gap: 8px;
}

.floor-tab {
  padding: 8px 20px;
  border: 1px solid color-mix(in srgb, #162329 20%, transparent);
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.floor-tab:hover {
  border-color: #257998;
  background: color-mix(in srgb, #257998 10%, transparent);
}

.floor-tab.active {
  background: #257998;
  border-color: #257998;
  color: white;
}

.floor-stats {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.stat-label {
  color: color-mix(in srgb, #162329 70%, transparent);
}

.stat-value {
  font-weight: 800;
  font-size: 18px;
}

.stat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.stat-item.available .stat-dot {
  background: #4caf50;
}

.stat-item.booked .stat-dot {
  background: #ff9800;
}

.stat-item.in-use .stat-dot {
  background: #ef5350;
}

.stat-item.to-clean .stat-dot {
  background: #1976d2;
}

.map-wrapper {
  position: relative;
  padding: 20px;
  background: color-mix(in srgb, #eef7fa 86%, white 14%);
  border: 1px solid color-mix(in srgb, #162329 13%, transparent);
  border-radius: 8px;
  overflow-x: auto;
}

.seat-map {
  position: relative;
  margin: 0 auto;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border-radius: 4px;
  border: 2px solid #ddd;
}

.map-label {
  position: absolute;
  font-size: 12px;
  color: #999;
  font-weight: 600;
}

.map-label-north {
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
}

.map-label-south {
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
}

.map-window {
  position: absolute;
  background: repeating-linear-gradient(
    90deg,
    #b3d4fc,
    #b3d4fc 8px,
    #87ceeb 8px,
    #87ceeb 16px
  );
  border-radius: 2px;
}

.seat-block {
  position: absolute;
  border: 2px solid;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.seat-selectable:hover {
  z-index: 10;
}

.seat-selected {
  z-index: 11;
  animation: pulse-border 1.5s infinite;
}

@keyframes pulse-border {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(37, 121, 152, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(37, 121, 152, 0);
  }
}

.seat-no {
  font-size: 11px;
  line-height: 1;
}

.seat-type-icon {
  font-size: 10px;
  margin-top: 2px;
}

.ending-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff6b6b;
  color: white;
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 700;
  white-space: nowrap;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.seat-tooltip {
  position: absolute;
  width: 220px;
  background: white;
  border: 1px solid color-mix(in srgb, #162329 20%, transparent);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 100;
  pointer-events: none;
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.status-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  border: 1px solid;
  font-weight: 600;
}

.tooltip-body p {
  margin: 4px 0;
  font-size: 12px;
  color: #555;
  line-height: 1.5;
}

.tooltip-desc {
  color: #888;
  font-style: italic;
}

.tooltip-time {
  color: #257998;
  font-weight: 600;
}

.booking-info {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #eee;
}

.booking-info span {
  color: #888;
}

.checked-in {
  color: #4caf50;
  font-weight: 600;
}

.not-checked-in {
  color: #ff9800;
  font-weight: 600;
}

.book-hint {
  margin-top: 8px;
  padding: 6px;
  background: #e8f5e9;
  border-radius: 4px;
  text-align: center;
  color: #2e7d32;
  font-weight: 600;
}

.legend-panel {
  padding: 16px 20px;
  background: color-mix(in srgb, #eef7fa 86%, white 14%);
  border: 1px solid color-mix(in srgb, #162329 13%, transparent);
  border-radius: 8px;
}

.legend-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 700;
}

.legend-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.mt-16 {
  margin-top: 16px;
}

.legend-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.legend-color {
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 4px;
  border: 2px solid;
  margin-top: 2px;
}

.legend-ending-badge {
  background: #ff6b6b;
  color: white;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 10px;
  font-weight: 700;
  margin-top: 2px;
  white-space: nowrap;
}

.legend-text strong {
  font-size: 13px;
  display: block;
}

.legend-text p {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #888;
}

@media (max-width: 768px) {
  .floor-stats {
    width: 100%;
    justify-content: space-between;
  }

  .seat-tooltip {
    position: fixed;
    left: 50% !important;
    transform: translateX(-50%);
    bottom: 20px;
    top: auto !important;
    width: calc(100vw - 40px);
    max-width: 320px;
  }
}
</style>
