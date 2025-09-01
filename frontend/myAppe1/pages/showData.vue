<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :items="books"
      :hide-default-footer="books.length < 11"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>
            <v-icon
              color="primary"
              icon="mdi-book-multiple"
              size="small"
              start
            />
            สมาชิก
          </v-toolbar-title>

          <v-btn
            prepend-icon="mdi-plus"
            rounded="lg"
            text
            border
            class="mr-2"
            @click="add"
          >
            เพิ่มสมาชิก
          </v-btn>

          <v-spacer></v-spacer>

          <v-btn
            color="success"
            class="me-2"
            rounded="lg"
            prepend-icon="mdi-view-dashboard"
            @click="goDash"
          >
            ไปหน้า Dash
          </v-btn>

          <v-btn
            prepend-icon="mdi-logout"
            rounded="lg"
            text
            color="error"
            border
            @click="doLogout"
          >
            Logout
          </v-btn>
        </v-toolbar>
      </template>

      <template v-slot:item.actions="{ item }">
        <div class="d-flex justify-end">
          <v-icon
            color="medium-emphasis"
            icon="mdi-pencil"
            size="small"
            class="me-2"
            @click="edit(item.id)"
          />
          <v-icon
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="remove(item.id)"
          />
        </div>
      </template>

      <template v-slot:no-data>
        <v-btn
          prepend-icon="mdi-backup-restore"
          rounded="lg"
          text
          border
          @click="reset"
        >
          Reset data
        </v-btn>
      </template>
    </v-data-table>
  </v-sheet>

  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title>
        {{ isEditing ? 'Edit User' : 'Add User' }}
      </v-card-title>
      <v-card-subtitle>
        {{ isEditing ? 'Update user info' : 'Create new user' }}
      </v-card-subtitle>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="record.email" label="Email" />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="record.password"
              label="Password"
              type="password"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="record.status" label="Status" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="record.dep" label="Department" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions class="bg-surface-light">
        <v-btn text variant="plain" @click="dialog = false">Cancel</v-btn>
        <v-spacer />
        <v-btn text @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showLogoutDialog" max-width="400">
    <v-card>
      <v-card-title class="headline">ยืนยันการออกจากระบบ</v-card-title>
      <v-card-text>
        คุณต้องการออกจากระบบหรือไม่?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" text @click="cancelLogout">
          ยกเลิก
        </v-btn>
        <v-btn color="success" text @click="confirmLogout">
          ยืนยัน
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      DEFAULT_RECORD: { id: null, email: "", password: "", status: "", dep: "" },
      books: [],
      record: { id: null, email: "", password: "", status: "yes", dep: "" },
      dialog: false,
      showLogoutDialog: false, // New data property for the logout dialog
      isEditing: false,
      headers: [
        { title: "ID", value: "id", align: "start" },
        { title: "E-mail", value: "email" },
        { title: "Password", value: "password" },
        { title: "Status", value: "status", align: "end" },
        { title: "Department", value: "dep", align: "end" },
        { title: "Actions", value: "actions", align: "end", sortable: false },
      ],
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          this.$router.push("/login");
          return;
        }
        const response = await axios.get("http://localhost:7000/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.books = response.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response && error.response.status === 401) {
          alert("Session expired. Please login again.");
          this.$router.push("/login");
        }
      }
    },
    goDash() {
      this.$router.push("/dash");
    },
    // This method now only opens the custom dialog
    doLogout() {
      this.showLogoutDialog = true;
    },
    // New method to handle the "Confirm" action
    confirmLogout() {
      localStorage.removeItem("token");
      this.$router.push("/login");
      this.showLogoutDialog = false;
    },
    // New method to handle the "Cancel" action
    cancelLogout() {
      this.showLogoutDialog = false;
    },
    add() {
      this.isEditing = false;
      this.record = { ...this.DEFAULT_RECORD };
      this.dialog = true;
    },
    edit(id) {
      this.isEditing = true;
      const found = this.books.find((b) => b.id === id);
      this.record = { ...found };
      this.dialog = true;
    },
    async remove(id) {
      if (!confirm("ต้องการลบข้อมูลนี้หรือไม่?")) return;
      try {
        const response = await axios.delete(
          `http://localhost:7000/delete-user/${id}`
        );
        if (response.status === 200) {
          this.books = this.books.filter((b) => b.id !== id);
          alert("ลบข้อมูลสำเร็จ");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    },
    async save() {
      const url = this.isEditing
        ? `http://localhost:7000/edit-user/${this.record.id}`
        : `http://localhost:7000/insert`;
      try {
        const response = await axios.post(url, this.record);
        console.log("Save success:", response.data);
        this.dialog = false;
        this.fetchData();
        alert("บันทึกข้อมูลสำเร็จ");
      } catch (error) {
        console.error("Save error:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    },
    reset() {
      this.fetchData();
    },
  },
};
</script>

<style scoped>
/* Optional: Add custom styles here if needed */
.d-flex.justify-end {
  gap: 8px; /* Adds space between icons */
}
</style>