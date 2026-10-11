<script setup lang="ts">

import {
  computed,
  ref,
  watch,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import { MangaService } from '@/services/MangaService'

import { useBookshelfStore } from '@/stores/bookshelf'

import { useAuthStore } from '@/stores/auth'

import { useReadingHistoryStore } from '@/stores/readingHistory'
import { ChapterService } from '@/services/chapterService'


interface AdminChapter {
  id: number
  number: number
  title: string
  imageCount: number
  images: string[]
}


const route = useRoute()

const router = useRouter()

const mangaService =
  new MangaService()
void mangaService.ready.catch((error) => console.error('โหลดมังงะไม่สำเร็จ', error))

const bookshelfStore =
  useBookshelfStore()

const authStore =
  useAuthStore()

const readingHistoryStore =
  useReadingHistoryStore()


/* ========================================
   Load Reading History
======================================== */

readingHistoryStore.load()


/* ========================================
   Manga ID
======================================== */

const mangaId = computed(() => {

  return Number(route.params.id)

})


/* ========================================
   Manga
======================================== */

const manga = computed(() => {

  return mangaService.getMangaById(
    mangaId.value,
  )

})


/* ========================================
   Chapters (Supabase)
======================================== */

const chapterService = new ChapterService()
const chapters = ref<AdminChapter[]>([])

async function loadChapters() {
  const id = mangaId.value
  if (!Number.isFinite(id) || id <= 0) {
    chapters.value = []
    return
  }

  try {
    const rows = await chapterService.getByMangaId(id)
    if (id !== mangaId.value) return
    chapters.value = rows.map((chapter) => ({
      id: chapter.id,
      number: chapter.chapterNumber,
      title: chapter.title,
      imageCount: chapter.images.length,
      images: [...chapter.images],
    }))
  } catch (error) {
    console.error('โหลดตอนสำหรับอ่านไม่สำเร็จ:', error)
    chapters.value = []
  }
}

watch(mangaId, () => { void loadChapters() }, { immediate: true })

/* ========================================
   Current Chapter
======================================== */

const currentChapter =
  ref<number>(
    Number(
      route.params.chapter,
    ) || 1,
  )


/* ========================================
   Current Chapter Data
======================================== */

const currentChapterData =
  computed(() => {

    return chapters.value.find(
      (chapter) =>
        chapter.number ===
        currentChapter.value,
    )

  })


/* ========================================
   Manga Title
======================================== */

const mangaTitle =
  computed(() => {

    return (
      manga.value?.title ??
      'ไม่พบมังงะ'
    )

  })


/* ========================================
   Chapter Title
======================================== */

const chapterTitle =
  computed(() => {

    return (
      currentChapterData
        .value?.title ??
      `ตอนที่ ${currentChapter.value}`
    )

  })


/* ========================================
   Manga Pages
======================================== */

const pages =
  computed(() => {

    return (
      currentChapterData
        .value?.images ??
      []
    )

  })


/* ========================================
   Update Reading Progress
======================================== */

function updateReadingProgress() {

  /*
   * ส่วนที่ 1
   * อัปเดตชั้นหนังสือ
   */

  const exists =
    bookshelfStore.isInBookshelf(
      mangaId.value,
    )

  if (exists) {

    bookshelfStore.updateChapter(
      mangaId.value,
      currentChapter.value,
    )

  }


  /*
   * ส่วนที่ 2
   * ตรวจสอบว่ามี User Login หรือไม่
   */

  if (!authStore.isLoggedIn) {

    return

  }

  if (authStore.userId <= 0) {

    return

  }


  /*
   * ส่วนที่ 3
   * หา Chapter จริงจาก Chapter Number
   *
   * ReadingHistory ต้องเก็บ
   * chapterId
   * ไม่ใช่ chapter number
   */

  const chapter =
    chapters.value.find(
      (item) =>
        item.number ===
        currentChapter.value,
    )

  if (!chapter) {

    return

  }


  /*
   * ส่วนที่ 4
   * บันทึกประวัติการอ่าน
   *
   * userId
   * mangaId
   * chapterId
   */

  readingHistoryStore.saveReading(

    authStore.userId,

    mangaId.value,

    chapter.id,

  )

}


/* ========================================
   Go Manga Detail
======================================== */

function goToMangaDetail() {

  router.push(
    `/manga/${mangaId.value}`,
  )

}


/* ========================================
   Change Chapter
======================================== */

function changeChapter() {

  const selectedChapter =
    currentChapter.value

  const exists =
    chapters.value.some(
      (chapter) =>
        chapter.number ===
        selectedChapter,
    )

  if (!exists) {

    return

  }

  router.push(
    `/manga/${mangaId.value}/chapter/${selectedChapter}`,
  )

  window.scrollTo({

    top: 0,

    behavior: 'smooth',

  })

}


/* ========================================
   Previous Chapter
======================================== */

function previousChapter() {

  const currentIndex =
    chapters.value.findIndex(
      (chapter) =>
        chapter.number ===
        currentChapter.value,
    )

  if (currentIndex <= 0) {

    return

  }

  const previous =
    chapters.value[
      currentIndex - 1
    ]

  if (!previous) {

    return

  }

  currentChapter.value =
    previous.number

  router.push(
    `/manga/${mangaId.value}/chapter/${previous.number}`,
  )

  window.scrollTo({

    top: 0,

    behavior: 'smooth',

  })

}


/* ========================================
   Next Chapter
======================================== */

function nextChapter() {

  const currentIndex =
    chapters.value.findIndex(
      (chapter) =>
        chapter.number ===
        currentChapter.value,
    )

  if (
    currentIndex === -1 ||
    currentIndex >=
      chapters.value.length - 1
  ) {

    return

  }

  const next =
    chapters.value[
      currentIndex + 1
    ]

  if (!next) {

    return

  }

  currentChapter.value =
    next.number

  router.push(
    `/manga/${mangaId.value}/chapter/${next.number}`,
  )

  window.scrollTo({

    top: 0,

    behavior: 'smooth',

  })

}


/* ========================================
   First Chapter
======================================== */

const isFirstChapter =
  computed(() => {

    if (
      chapters.value.length === 0
    ) {

      return true

    }

    return (
      currentChapter.value ===
      chapters.value[0]?.number
    )

  })


/* ========================================
   Last Chapter
======================================== */

const isLastChapter =
  computed(() => {

    if (
      chapters.value.length === 0
    ) {

      return true

    }

    return (
      currentChapter.value ===
      chapters.value[
        chapters.value.length - 1
      ]?.number
    )

  })


/* ========================================
   Watch Route Chapter
======================================== */

watch(

  () => route.params.chapter,

  (newChapter) => {

    const chapterNumber =
      Number(newChapter)

    if (
      Number.isFinite(
        chapterNumber,
      )
    ) {

      /*
       * อัปเดต Chapter ปัจจุบัน
       */

      currentChapter.value =
        chapterNumber


      /*
       * บันทึกประวัติการอ่านทันที
       *
       * ตรงนี้สำคัญมาก
       *
       * เมื่อ User เปิด
       * /manga/1/chapter/2
       *
       * ระบบจะบันทึกว่า
       * User คนนี้อ่าน Manga 1
       * ถึง Chapter 2 แล้ว
       */

      updateReadingProgress()

    }

  },

  {
    immediate: true,
  },

)


/* ========================================
   Check Manga
======================================== */

if (!manga.value) {

  router.push('/admin')

}


/* ========================================
   Check Chapter
======================================== */

if (
  chapters.value.length > 0 &&
  !currentChapterData.value
) {

  const firstChapter =
    chapters.value[0]

  if (firstChapter) {

    currentChapter.value =
      firstChapter.number

    router.replace(
      `/manga/${mangaId.value}/chapter/${firstChapter.number}`,
    )

  }

}

</script>


<template>

  <div class="reader">

    <!-- Header -->

    <header class="reader-header">

      <button
        class="back-button"
        @click="goToMangaDetail"
      >
        ← กลับ
      </button>


      <div class="reader-title">

        <strong>
          {{ mangaTitle }}
        </strong>

        <span>
          ตอนที่ {{ currentChapter }}
        </span>

      </div>


      <button
        class="detail-button"
        @click="goToMangaDetail"
      >
        รายละเอียด
      </button>

    </header>


    <!-- Chapter Navigation -->

    <div class="chapter-bar">

      <button
        class="navigation-button"
        :disabled="isFirstChapter"
        @click="previousChapter"
      >
        ← ตอนก่อนหน้า
      </button>


      <select
        v-model.number="currentChapter"
        class="chapter-select"
        @change="changeChapter"
      >

        <option
          v-for="chapter in chapters"
          :key="chapter.id"
          :value="chapter.number"
        >

          ตอนที่ {{ chapter.number }}

          <template
            v-if="chapter.title"
          >
            - {{ chapter.title }}
          </template>

        </option>

      </select>


      <button
        class="navigation-button"
        :disabled="isLastChapter"
        @click="nextChapter"
      >
        ตอนถัดไป →
      </button>

    </div>


    <!-- Reader Content -->

    <main class="reader-content">

      <!-- Chapter Heading -->

      <div class="chapter-heading">

        <h1>
          {{ mangaTitle }}
        </h1>

        <p>

          ตอนที่ {{ currentChapter }}

          <template
            v-if="chapterTitle"
          >

            · {{ chapterTitle }}

          </template>

        </p>

      </div>


      <!-- No Chapter -->

      <div
        v-if="chapters.length === 0"
        class="empty-reader"
      >

        <h2>
          ยังไม่มีตอนให้อ่าน
        </h2>

        <p>
          กรุณาเพิ่มตอนจากหน้า
          จัดการมังงะก่อน
        </p>

        <button
          class="primary-button"
          @click="goToMangaDetail"
        >
          กลับหน้ามังงะ
        </button>

      </div>


      <!-- Chapter Has No Images -->

      <div
        v-else-if="pages.length === 0"
        class="empty-reader"
      >

        <h2>
          ตอนนี้ยังไม่มีรูปภาพ
        </h2>

        <p>
          กรุณาเพิ่มรูปภาพของตอนนี้
          จากหน้า Admin
        </p>

        <button
          class="primary-button"
          @click="goToMangaDetail"
        >
          กลับหน้ามังงะ
        </button>

      </div>


      <!-- Manga Pages -->

      <div
        v-else
        class="manga-pages"
      >

        <img
          v-for="(page, index) in pages"
          :key="
            `${currentChapter}-${index}-${page}`
          "
          :src="page"
          :alt="
            `ตอนที่ ${currentChapter} หน้าที่ ${index + 1}`
          "
          loading="lazy"
        />

      </div>

    </main>


    <!-- Bottom Navigation -->

    <div class="bottom-navigation">

      <button
        class="bottom-button"
        :disabled="isFirstChapter"
        @click="previousChapter"
      >
        ← ตอนก่อนหน้า
      </button>


      <select
        v-model.number="currentChapter"
        class="chapter-select"
        @change="changeChapter"
      >

        <option
          v-for="chapter in chapters"
          :key="chapter.id"
          :value="chapter.number"
        >
          ตอนที่ {{ chapter.number }}
        </option>

      </select>


      <button
        class="bottom-button"
        :disabled="isLastChapter"
        @click="nextChapter"
      >
        ตอนถัดไป →
      </button>

    </div>

  </div>

</template>


<style scoped>

* {
  box-sizing: border-box;
}


/* =========================
   Reader
========================= */

.reader {
  min-height: 100vh;

  background: #18181b;

  color: #ffffff;
}


/* =========================
   Header
========================= */

.reader-header {
  position: sticky;

  top: 0;

  z-index: 20;

  height: 64px;

  padding: 0 5%;

  display: flex;

  align-items: center;

  justify-content: space-between;

  background: #09090b;

  border-bottom: 1px solid #27272a;
}


.back-button,
.detail-button {
  border: none;

  background: transparent;

  color: #d4d4d8;

  text-decoration: none;

  font-size: 14px;

  font-family: inherit;

  cursor: pointer;
}


.back-button:hover,
.detail-button:hover {
  color: #ffffff;
}


.detail-button {
  padding: 8px 14px;

  border: 1px solid #3f3f46;

  border-radius: 7px;
}


.detail-button:hover {
  background: #27272a;
}


/* =========================
   Reader Title
========================= */

.reader-title {
  display: flex;

  flex-direction: column;

  align-items: center;

  gap: 3px;
}


.reader-title span {
  color: #a1a1aa;

  font-size: 12px;
}


/* =========================
   Chapter Bar
========================= */

.chapter-bar {
  position: sticky;

  top: 64px;

  z-index: 15;

  display: flex;

  justify-content: center;

  align-items: center;

  gap: 12px;

  padding: 12px;

  background: #27272a;

  border-bottom: 1px solid #3f3f46;
}


/* =========================
   Navigation Buttons
========================= */

.navigation-button,
.bottom-button {
  padding: 9px 15px;

  border: none;

  border-radius: 7px;

  background: #7c3aed;

  color: #ffffff;

  cursor: pointer;

  font-size: 13px;

  font-family: inherit;

  transition:
    background 0.2s ease,
    transform 0.2s ease;
}


.navigation-button:hover:not(:disabled),
.bottom-button:hover:not(:disabled) {
  background: #6d28d9;

  transform: translateY(-1px);
}


.navigation-button:disabled,
.bottom-button:disabled {
  background: #52525b;

  color: #a1a1aa;

  cursor: not-allowed;

  transform: none;
}


/* =========================
   Chapter Select
========================= */

.chapter-select {
  min-width: 180px;

  padding: 9px 12px;

  border: 1px solid #52525b;

  border-radius: 7px;

  background: #18181b;

  color: #ffffff;

  outline: none;

  cursor: pointer;

  font-family: inherit;
}


.chapter-select:hover {
  border-color: #71717a;
}


.chapter-select:focus {
  border-color: #7c3aed;
}


/* =========================
   Reader Content
========================= */

.reader-content {
  width: 100%;

  padding-bottom: 40px;
}


/* =========================
   Chapter Heading
========================= */

.chapter-heading {
  padding: 35px 20px;

  text-align: center;
}


.chapter-heading h1 {
  margin: 0;

  font-size: 26px;
}


.chapter-heading p {
  margin: 7px 0 0;

  color: #a1a1aa;

  font-size: 15px;
}


/* =========================
   Manga Pages
========================= */

.manga-pages {
  width: 900px;

  max-width: 100%;

  margin: auto;

  background: #000000;
}


.manga-pages img {
  display: block;

  width: 100%;

  height: auto;

  margin: 0;

  object-fit: contain;
}


/* =========================
   Empty Reader
========================= */

.empty-reader {
  width: 100%;

  max-width: 600px;

  margin: 50px auto;

  padding: 50px 20px;

  text-align: center;

  border: 1px solid #3f3f46;

  border-radius: 12px;

  background: #27272a;
}


.empty-reader h2 {
  margin: 0 0 10px;
}


.empty-reader p {
  margin: 0 0 20px;

  color: #a1a1aa;
}


.primary-button {
  padding: 10px 18px;

  border: none;

  border-radius: 7px;

  background: #7c3aed;

  color: #ffffff;

  cursor: pointer;

  font-family: inherit;
}


.primary-button:hover {
  background: #6d28d9;
}


/* =========================
   Bottom Navigation
========================= */

.bottom-navigation {
  position: sticky;

  bottom: 0;

  z-index: 20;

  display: flex;

  justify-content: center;

  align-items: center;

  gap: 12px;

  padding: 15px;

  background: rgba(9, 9, 11, 0.95);

  border-top: 1px solid #27272a;

  backdrop-filter: blur(8px);
}


/* =========================
   Mobile
========================= */

@media (max-width: 600px) {

  .reader-header {
    padding: 0 15px;
  }


  .reader-title {
    display: none;
  }


  .chapter-bar {
    top: 64px;

    gap: 5px;

    padding: 10px 5px;
  }


  .navigation-button,
  .bottom-button {
    padding: 8px 9px;

    font-size: 11px;
  }


  .chapter-select {
    min-width: 105px;

    padding: 8px;
  }


  .chapter-heading {
    padding: 25px 15px;
  }


  .chapter-heading h1 {
    font-size: 21px;
  }


  .bottom-navigation {
    gap: 5px;

    padding: 10px 5px;
  }

}

</style>