<template>
  <v-container fill-height fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12" rounded="xl">
          <v-toolbar color="primary" flat>
            <v-icon icon="mdi-account-circle" size="large" class="mr-2"></v-icon>
            <v-toolbar-title class="white--text">เข้าสู่ระบบ</v-toolbar-title>
          </v-toolbar>

          <v-card-text>

            <v-form ref="form">
              <v-text-field
                v-model="email"
                label="E-mail"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                rounded="lg"
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Password"
                prepend-inner-icon="mdi-lock"
                type="password"
                variant="outlined"
                rounded="lg"
                class="mb-4"
              ></v-text-field>

              <v-btn
                color="primary"
                class="mt-4"
                block
                rounded="lg"
                @click="doLogin"
              >
                Login
              </v-btn>
              
            </v-form>
          </v-card-text>
          
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
      email: "",
      password: "",
    };
  },

  methods: {
    async doLogin() {
      try {
        console.log(" Login with", this.email, this.password);
        const response = await axios.post("http://localhost:7000/login", {
          email: this.email,
          password: this.password,
        });

        // Check if login was successful based on the server's response
        if (response.data.status === "ok") {
          localStorage.setItem("token", response.data.token);
          alert("เข้าสู่ระบบสำเร็จ!");
          this.$router.push("/showData");
        } else {
          // If server sends a status other than "ok" (e.g., status: 0)
          alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
          this.reset();
        }
      } catch (error) {
        console.error("Login error:", error);
        
        // Handle different error types from the server
        if (error.response && error.response.status === 401) {
          // If the server sends a 401 Unauthorized status
          alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
          this.reset();
        } else if (error.response && error.response.status === 400) {
          // If the server sends a 400 Bad Request status
          alert("ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
        } else {
          // Generic network or server connection error
          alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
        }
      }
    },
    reset() {
      this.email = "";
      this.password = "";
    },
  },
};
</script>