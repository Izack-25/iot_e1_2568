<template>
  <v-sheet class="pa-4" border rounded>
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon icon="mdi-lightbulb" start /> ควบคุมไฟ
      </v-toolbar-title>

      <v-btn
        prepend-icon="mdi-arrow-left"
        rounded="lg"
        text
        border
        color="primary"
        @click="$router.push('/showData')"
      >
        กลับไปหน้าผู้ใช้
      </v-btn>
    </v-toolbar>

    <div class="mt-6 d-flex gap-4">
      <v-btn color="success" @click="turnOn">เปิดไฟ</v-btn>
      <v-btn color="error" @click="turnOff">ปิดไฟ</v-btn>
    </div>

    <p class="mt-4">{{ message }}</p>
  </v-sheet>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return { message: "" };
  },
  methods: {
    async turnOn() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post("http://localhost:7000/light/on", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.message = res.data.message;
      } catch {
        this.message = "เปิดไฟไม่สำเร็จ ❌";
      }
    },
    async turnOff() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post("http://localhost:7000/light/off", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.message = res.data.message;
      } catch {
        this.message = "ปิดไฟไม่สำเร็จ ❌";
      }
    }
  }
}
</script>
