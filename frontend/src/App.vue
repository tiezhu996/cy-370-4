<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { fetchOverview } from "./api/client";
import { APP_CODE, APP_NAME, SEAT_STATUS_CONFIG } from "./constants/app";
import { REQUEST_MESSAGES } from "./constants/messages";
import { createFallbackOverview } from "./state/dashboard";
import type { OverviewResponse, Seat } from "./types";
import FeatureStrip from "./components/FeatureStrip.vue";
import MetricGrid from "./components/MetricGrid.vue";
import OperationsTable from "./components/OperationsTable.vue";
import FloorSeatMap from "./components/FloorSeatMap.vue";

const overview = ref<OverviewResponse>(createFallbackOverview());
const notice = ref(REQUEST_MESSAGES.overviewFallback);
const activeTab = ref<"overview" | "booking">("booking");
const selectedSeat = ref<Seat | null>(null);
const selectedDate = ref(new Date().toISOString().split("T")[0]);
const selectedTimeSlot = ref("09:00-12:00");
const showBookingDialog = ref(false);

const timeSlots = [
  "08:00-10:00",
  "09:00-12:00",
  "10:00-12:00",
  "12:00-14:00",
  "13:00-17:00",
  "14:00-17:00",
  "17:00-20:00",
  "18:00-22:00",
];

function goHealth() {
  window.location.href = REQUEST_MESSAGES.healthPath;
}

function handleSeatClick(seat: Seat) {
  selectedSeat.value = seat;
  if (seat.status === "available") {
    showBookingDialog.value = true;
  }
}

function handleFloorChange(floor: number) {
  selectedSeat.value = null;
}

const selectedSeatStatus = computed(() => {
  if (!selectedSeat.value) return null;
  return SEAT_STATUS_CONFIG[selectedSeat.value.status];
});

function confirmBooking() {
  if (selectedSeat.value && selectedSeat.value.status === "available") {
    alert(`预约成功！\n座位：${selectedSeat.value.seatNo}\n日期：${selectedDate.value}\n时段：${selectedTimeSlot.value}`);
    showBookingDialog.value = false;
  }
}

onMounted(async () => {
  try {
    overview.value = await fetchOverview();
    notice.value = "后端服务已联通，当前展示实时接口数据。";
  } catch {
    notice.value = REQUEST_MESSAGES.overviewFallback;
  }
});
</script>

<template>
  <main class="app-shell">
    <header class="topbar">
      <div>
        <span class="brand-code">{{ APP_CODE }}</span>
        <h1 class="brand-title">{{ APP_NAME }}</h1>
      </div>
      <div class="topbar-actions">
        <div class="main-tabs">
          <button
            class="main-tab"
            :class="{ active: activeTab === 'booking' }"
            @click="activeTab = 'booking'"
          >
            🪑 座位预约
          </button>
          <button
            class="main-tab"
            :class="{ active: activeTab === 'overview' }"
            @click="activeTab = 'overview'"
          >
            📊 运营总览
          </button>
        </div>
        <el-button type="primary" @click="goHealth">API Health</el-button>
      </div>
    </header>

    <section class="workspace">
      <div v-show="activeTab === 'overview'">
        <div class="lead-grid">
          <article class="hero-panel">
            <span class="pill">{{ notice }}</span>
            <h2>{{ overview.appName }}</h2>
            <p>{{ overview.description }}</p>
          </article>
          <MetricGrid :items="overview.kpis" />
        </div>
        <FeatureStrip :items="overview.features" />
        <section class="work-panel">
          <h2>运营任务流</h2>
          <OperationsTable :records="overview.records" />
        </section>
      </div>

      <div v-show="activeTab === 'booking'" class="booking-section">
        <div class="booking-header">
          <div>
            <h2 class="page-title">楼层座位图</h2>
            <p class="page-desc">查看座位实时状态，选择空闲座位进行预约。将鼠标悬停在座位上可查看详情。</p>
          </div>
          <div class="booking-time-selector">
            <label>
              <span>选择日期</span>
              <input type="date" v-model="selectedDate" class="date-input" />
            </label>
            <label>
              <span>选择时段</span>
              <select v-model="selectedTimeSlot" class="time-select">
                <option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option>
              </select>
            </label>
          </div>
        </div>

        <FloorSeatMap
          :default-floor="2"
          :selectable="true"
          @seat-click="handleSeatClick"
          @floor-change="handleFloorChange"
        />

        <div v-if="selectedSeat" class="seat-detail-panel">
          <div class="detail-header">
            <div>
              <h3>{{ selectedSeat.seatNo }}</h3>
              <span class="status-tag" :style="{
                backgroundColor: selectedSeatStatus?.bgColor,
                borderColor: selectedSeatStatus?.borderColor,
                color: selectedSeatStatus?.color,
              }">
                {{ selectedSeatStatus?.label }}
              </span>
            </div>
            <el-button v-if="selectedSeat.status === 'available'" type="primary" @click="showBookingDialog = true">
              立即预约
            </el-button>
            <el-button v-else :disabled="true">
              {{ selectedSeatStatus?.label }}
            </el-button>
          </div>
          <div class="detail-body">
            <p><span>座位类型：</span>{{ selectedSeat.type === 'window' ? '靠窗座位 🪟' : selectedSeat.type === 'power' ? '带电源座位 🔌' : '普通座位' }}</p>
            <p><span>所在楼层：</span>{{ selectedSeat.floor }}楼</p>
            <p v-if="selectedSeat.nextAvailableTime"><span>可用时间：</span>{{ selectedSeat.nextAvailableTime }}</p>
            <template v-if="selectedSeat.currentBooking">
              <p><span>当前使用人：</span>{{ selectedSeat.currentBooking.userName }}</p>
              <p><span>使用时段：</span>
                {{ new Date(selectedSeat.currentBooking.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
                -
                {{ new Date(selectedSeat.currentBooking.endTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
              </p>
            </template>
          </div>
        </div>
      </div>
    </section>

    <el-dialog
      v-model="showBookingDialog"
      title="确认预约"
      width="420px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedSeat" class="booking-form">
        <div class="booking-summary">
          <div class="summary-row">
            <span class="summary-label">座位号</span>
            <span class="summary-value">{{ selectedSeat.seatNo }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">座位类型</span>
            <span class="summary-value">{{ selectedSeat.type === 'window' ? '靠窗座位 🪟' : selectedSeat.type === 'power' ? '带电源座位 🔌' : '普通座位' }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">所在楼层</span>
            <span class="summary-value">{{ selectedSeat.floor }}楼</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">预约日期</span>
            <span class="summary-value">{{ selectedDate }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">预约时段</span>
            <span class="summary-value">{{ selectedTimeSlot }}</span>
          </div>
        </div>
        <div class="booking-tips">
          <p>⚠️ 预约须知：</p>
          <ul>
            <li>请在预约开始后15分钟内扫码签到，超时未签到座位将自动释放</li>
            <li>使用结束后请扫码签退，以便清洁人员及时清理</li>
            <li>累计3次违约将限制预约功能7天</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button @click="showBookingDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmBooking">确认预约</el-button>
      </template>
    </el-dialog>
  </main>
</template>
