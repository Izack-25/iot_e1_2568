<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="books.length < 11"
      :items="books"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>
            <v-icon color="medium-emphasis" icon="mdi-book-multiple" size="x-small" start></v-icon>
            สมาชิก
          </v-toolbar-title>

          <v-btn
            class="me-3"
            prepend-icon="mdi-plus"
            rounded="lg"
            text="เพิ่มสมาชิก"
            border
            @click="add"
          ></v-btn>

          <v-btn
            class="me-3"
            prepend-icon="mdi-plus"
            rounded="lg"
            text="ล็อคเอาค์"
            border
            @click="logout"
          ></v-btn>

        </v-toolbar>
      </template>

      <template v-slot:item.title="{ value }">
        <v-chip :text="value" border="thin opacity-25" prepend-icon="mdi-book" label>
          <template v-slot:prepend>
            <v-icon color="medium-emphasis"></v-icon>
          </template>
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <div class="d-flex ga-2 justify-end">
          <v-icon color="medium-emphasis" icon="mdi-pencil" size="small" @click="edit(item.id)"></v-icon>

          <v-icon color="medium-emphasis" icon="mdi-delete" size="small" @click="remove(item.id)"></v-icon>
        </div>
      </template>

      <template v-slot:no-data>
        <v-btn
          prepend-icon="mdi-backup-restore"
          rounded="lg"
          text="Reset data"
          variant="text"
          border
          @click="reset"
        ></v-btn>
      </template>
    </v-data-table>
  </v-sheet>

  <v-dialog v-model="dialog" max-width="500">
    <v-card
      :subtitle="`${isEditing ? 'แก้ไข' : 'เพิ่ม'} สมาชิก`"
      :title="`${isEditing ? 'แก้ไข' : 'เพิ่ม'} สมาชิก`"
    >
      <template v-slot:text>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="formModel.title" label="id" readonly></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="formModel.email" label="email"></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="formModel.password" label="password"></v-text-field>
          </v-col>

         <v-col cols="12" md="6">
            <v-text-field v-model="formModel.status" label="status"></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="formModel.dep" label="department"></v-text-field>
          </v-col>
        </v-row>
      </template>

      <v-divider></v-divider>

      <v-card-actions class="bg-surface-light">
        <v-btn text="Cancel" variant="plain" @click="dialog = false"></v-btn>

        <v-spacer></v-spacer>

        <v-btn text="Save" @click="save"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
  import { onMounted, ref, shallowRef, toRef } from 'vue'
  import axios from "axios"
  const currentYear = new Date().getFullYear()

  function createNewRecord () {
    return {
      id: '',
      email: '',
      password: '',
      status: '',
      dep: '',
    }
  }

  const books = ref([])
  const formModel = ref(createNewRecord())
  const dialog = shallowRef(false)
  const isEditing = toRef(() => !!formModel.value.id)

  const headers = [
    { title: 'ID', key: 'id', align: 'start' },
    { title: 'email', key: 'email' },
    { title: 'password', key: 'password' },
    { title: 'status', key: 'status', align: 'end' },
    { title: 'department', key: 'dep', align: 'end' },
    { title: 'Actions', key: 'actions', align: 'end', sortable: false },
  ]

  onMounted(() => {
    reset()
  })

  function add () {
    formModel.value = createNewRecord()
    dialog.value = true
  }

  function edit (id) {
    const found = books.value.find(book => book.id === id)

    formModel.value = {
      id: found.id,
      email: found.email,
      password: found.password,
      status: found.status,
      dep: found.dep,
    }

    dialog.value = true
  }

  function remove (id) {
    const index = books.value.findIndex(book => book.id === id)
    books.value.splice(index, 1)
  }

   async function save () {
    console.log("Saving record:", formModel.value);
    console.log("Is editing:", isEditing.value);

    if (isEditing.value) {
      const index = books.value.findIndex(book => book.id === formModel.value.id)
      books.value[index] = formModel.value
    } else { 
      // add data
      const response = await axios.post("http://localhost:7000/insert",formModel.value)
      console.log(response.data) 
    }

    dialog.value = false
  }

  function reset () {
    dialog.value = false
    formModel.value = createNewRecord()
    books.value = [
      { id: 1, email: 'friend@coollege.ac.th', password: '1234', status: 'yes', dep: 'it' },
      { id: 2, email: 'sri@gmail.com', password: '123456', status: 'no', dep: 'elec' },
    ]
  }
</script>