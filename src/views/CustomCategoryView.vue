<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useCustomCategoryStore } from '@/stores/customCategory'
import { MangaService } from '@/services/MangaService'

const route = useRoute()
const router = useRouter()

const customCategoryStore =
  useCustomCategoryStore()

const mangaService = new MangaService()
void mangaService.ready.catch((error) => console.error('โหลดมังงะไม่สำเร็จ', error))

const categoryId = computed(() => {
  return Number(route.params.id)
})

const category = computed(() => {
  return customCategoryStore.getCategoryById(
    categoryId.value,
  )
})

const mangaList = computed(() => {
  if (!category.value) {
    return []
  }

  return category.value.mangaIds
    .map((mangaId) => {
      return mangaService.getMangaById(
        Number(mangaId),
      )
    })
    .filter(
      (manga) => manga !== undefined,
    )
})

function goBack() {
  router.push({
    name: 'bookshelf',
  })
}

function openManga(id: number) {
  router.push({
    name: 'manga',
    params: {
      id,
    },
  })
}

function removeFromCategory(
  mangaId: number,
) {
  customCategoryStore.removeMangaFromCategory(
    categoryId.value,
    mangaId,
  )
}
</script>

<template>
  <div class="category-page">
    <div class="category-header">
      <button
        type="button"
        class="back-button"
        @click="goBack"
      >
        ← กลับ
      </button>

      <h1>
        {{ category?.name || 'ไม่พบโฟลเดอร์' }}
      </h1>
    </div>

    <div
      v-if="!category"
      class="empty-state"
    >
      <p>ไม่พบโฟลเดอร์นี้</p>
    </div>

    <div
      v-else-if="mangaList.length === 0"
      class="empty-state"
    >
      <p>ยังไม่มีมังงะในโฟลเดอร์นี้</p>
    </div>

    <div
      v-else
      class="manga-grid"
    >
      <div
        v-for="manga in mangaList"
        :key="manga.id"
        class="manga-card"
      >
        <div
          class="manga-cover"
          @click="
            openManga(
              Number(manga.id),
            )
          "
        >
          <img
            :src="manga.cover"
            :alt="manga.title"
          />
        </div>

        <div class="manga-info">
          <h3>
            {{ manga.title }}
          </h3>

          <button
            type="button"
            class="remove-button"
            @click="
              removeFromCategory(
                Number(manga.id),
              )
            "
          >
            ลบออกจากโฟลเดอร์
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-page {
  min-height: 100vh;
  padding: 30px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.category-header h1 {
  margin: 0;
}

.back-button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.manga-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(180px, 1fr)
  );
  gap: 24px;
}

.manga-card {
  overflow: hidden;
  border-radius: 10px;
}

.manga-cover {
  cursor: pointer;
}

.manga-cover img {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  display: block;
}

.manga-info {
  padding: 10px 0;
}

.manga-info h3 {
  margin: 0 0 10px;
}

.remove-button {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>