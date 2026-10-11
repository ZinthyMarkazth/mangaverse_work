
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getMangaList } from '../services/MangaService'

const mangaList = ref<{ id: string; title: string }[]>([])
const errorMessage = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    mangaList.value = await getMangaList()
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main>
    <h1>ทดสอบ Supabase</h1>

    <p v-if="loading">กำลังโหลดข้อมูล...</p>
    <p v-else-if="errorMessage" style="color: red">
      Error: {{ errorMessage }}
    </p>
    <p v-else-if="mangaList.length === 0">
      เชื่อมต่อได้แล้ว แต่ยังไม่มีมังงะ
    </p>

    <ul v-else>
      <li v-for="manga in mangaList" :key="manga.id">
        {{ manga.title }}
      </li>
    </ul>
  </main>
</template>
