<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4" outlined>
          <v-card-title>💡 ควบคุมอุปกรณ์ <v-btn color="success" @click="goshow">ไปหน้า showData</v-btn></v-card-title>
          <v-card-text>
            <p>สถานะปัจจุบัน:
              <span :style="{ color: sensor.deviceState ? 'green' : 'red' }">
                {{ sensor.deviceState ? 'เปิด' : 'ปิด' }}
              </span>
            </p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="success" @click="toggleDevice(true)">เปิดไฟ</v-btn>
            <v-btn color="error" @click="toggleDevice(false)">ปิดไฟ</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      sensor: {
        deviceState: false,
      },
    };
  },
  mounted() {
    this.fetchSensor(); // โหลดค่าตอนเข้า
  },
  methods: {
    async fetchSensor() {
      try {
        const res = await axios.get("http://localhost:7000/sensor");
        this.sensor = res.data;
      } catch (err) {
        console.error("ดึง sensor ไม่สำเร็จ:", err);
      }
    },
    async toggleDevice(state) {
      try {
        await axios.post("http://localhost:7000/device", { state });
        // รอ ESP32 ตอบกลับ
        setTimeout(() => this.fetchSensor(), 1000);
      } catch (err) {
        console.error("ส่งคำสั่งไม่สำเร็จ:", err);
      }
    },
    goshow() {
      console.log("ไปหน้า showdata");
      this.$router.push("/showdata");
    },
  },
};
</script>
