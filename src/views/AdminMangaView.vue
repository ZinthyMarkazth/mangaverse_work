<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  reactive,
  ref,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import { MangaService } from '../services/MangaService'
import { ChapterService } from '../services/chapterService'

type MangaStatus =
  | 'กำลังดำเนินเรื่อง'
  | 'จบแล้ว'

interface AdminChapter {
  id: string
  number: number
  title: string
  imageCount: number
  images: string[]
  mangaId: string
}

const router = useRouter()
const route = useRoute()

const mangaService = new MangaService()
void mangaService.ready.catch((error) => console.error('โหลดมังงะไม่สำเร็จ', error))
const chapterService = new ChapterService()
const chapters = ref<AdminChapter[]>([])

/* =========================
   Manga
========================= */

const mangaId = String(route.params.id ?? '')

const manga =
  mangaService.getMangaById(mangaId)

if (!manga) {
  router.push('/admin')
}

/* =========================
   Manga Form
========================= */

const mangaForm = reactive<{
  title: string
  author: string
  category: string
  status: MangaStatus
  cover: string
  description: string
}>({
  title: manga?.title ?? '',
  author: manga?.author ?? '',
  category: manga?.category ?? '',
  status:
    manga?.status === 'จบแล้ว'
      ? 'จบแล้ว'
      : 'กำลังดำเนินเรื่อง',
  cover: manga?.cover ?? '',
  description: manga?.description ?? '',
})

/* =========================
   Multiple Categories
========================= */

const categoryOptions = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Romance',
  'School',
  'Shounen',
  'Shoujo',
  'Sports',
  'Mystery',
  'Sci-Fi',
]

function parseCategories(
  value:
    | string
    | string[]
    | null
    | undefined,
): string[] {
  const values = Array.isArray(value)
    ? value
    : String(value ?? '').split(',')

  return values
    .map((item) => item.trim())
    .filter(Boolean)
    .filter(
      (item, index, array) =>
        array.findIndex(
          (existing) =>
            existing.toLowerCase() ===
            item.toLowerCase(),
        ) === index,
    )
}

const selectedCategories =
  ref<string[]>(
    parseCategories(
      mangaForm.category,
    ),
  )

const categoryInput =
  ref('')

function syncCategoriesToForm() {
  mangaForm.category =
    selectedCategories.value.join(
      ', ',
    )
}

function addCategory(
  value: string,
) {
  const category =
    value.trim()

  if (!category) {
    return
  }

  selectedCategories.value =
    parseCategories([
      ...selectedCategories.value,
      category,
    ])

  categoryInput.value = ''

  syncCategoriesToForm()
}

function addCategoryFromInput() {
  addCategory(
    categoryInput.value,
  )
}

function addPresetCategory(
  category: string,
) {
  addCategory(category)
}

function removeCategory(
  category: string,
) {
  selectedCategories.value =
    selectedCategories.value.filter(
      (item) =>
        item.toLowerCase() !==
        category.toLowerCase(),
    )

  syncCategoriesToForm()
}

function handleCategoryKeydown(
  event: KeyboardEvent,
) {
  if (
    event.key === 'Enter' ||
    event.key === ','
  ) {
    event.preventDefault()
    addCategoryFromInput()
  }
}

/* =========================
   Toast
========================= */

const showToast =
  ref(false)

const toastMessage =
  ref('')

let toastTimer:
  | ReturnType<typeof setTimeout>
  | null = null

function toast(
  message: string,
) {
  toastMessage.value =
    message

  showToast.value =
    true

  if (toastTimer) {
    clearTimeout(
      toastTimer,
    )
  }

  toastTimer =
    setTimeout(() => {
      showToast.value =
        false
    }, 2500)
}

/* =========================
   Load Chapters
========================= */


async function loadChapters(): Promise<AdminChapter[]> {
  const rows = await chapterService.getAdminListByMangaId(mangaId)

  return rows.map((chapter) => ({
    id: chapter.id,
    mangaId: chapter.mangaId,
    number: chapter.chapterNumber,
    title: chapter.title,
    imageCount: chapter.imageCount,
    // Load actual page images only when the user opens the edit form.
    images: [],
  }))
}


void loadChapters().then((rows) => { chapters.value = rows }).catch((error) => console.error('โหลดตอนแอดมินไม่สำเร็จ', error))

/* =========================
   Sorted Chapters
========================= */

const sortedChapters =
  computed(() => {
    return [
      ...chapters.value,
    ].sort(
      (a, b) =>
        b.number - a.number,
    )
  })

/* =========================
   Chapter Form
========================= */

const chapterForm =
  reactive<{
    number: number
    title: string
    imageCount: number
    images: string[]
  }>({
    number: 1,
    title: '',
    imageCount: 0,
    images: [],
  })

/* =========================
   Chapter Modal
========================= */

const showChapterModal =
  ref(false)

const editingChapterId =
  ref<string | null>(null)

const isSavingChapter =
  ref(false)

/* =========================
   File Upload
========================= */

const fileInput =
  ref<HTMLInputElement | null>(
    null,
  )

const selectedFiles =
  ref<File[]>([])

const previewUrls =
  ref<string[]>([])

/* =========================
   Existing Images
========================= */

const existingImages =
  ref<string[]>([])

/* =========================
   Back
========================= */

function goBack() {
  router.back()
}

/* =========================
   Save Manga
========================= */

const isSavingManga = ref(false)

async function saveManga() {
  if (isSavingManga.value) return
  isSavingManga.value = true
  try {
  if (!manga) {
    return
  }

  if (!mangaForm.title.trim()) {
    toast(
      'กรุณากรอกชื่อมังงะ',
    )
    return
  }

  if (!mangaForm.author.trim()) {
    toast(
      'กรุณากรอกชื่อผู้แต่ง',
    )
    return
  }

  addCategoryFromInput()

  if (
    selectedCategories.value
      .length === 0
  ) {
    toast(
      'กรุณาเลือกอย่างน้อย 1 หมวดหมู่',
    )
    return
  }

  manga.title =
    mangaForm.title.trim()

  manga.author =
    mangaForm.author.trim()

  manga.category =
    selectedCategories.value.join(
      ', ',
    )

  manga.status =
    mangaForm.status

  manga.cover =
    mangaForm.cover

  manga.description =
    mangaForm.description.trim()

  const updated =
    await mangaService.updateManga(
      manga,
    )

  if (!updated) {
    toast(
      'ไม่สามารถบันทึกข้อมูลได้',
    )
    return
  }

  toast(
    'บันทึกข้อมูลมังงะเรียบร้อยแล้ว',
  )
  } finally { isSavingManga.value = false }
}

/* =========================
   File To Data URL
========================= */

function fileToDataURL(
  file: File,
): Promise<string> {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader()

      reader.onload = () => {
        resolve(
          String(
            reader.result,
          ),
        )
      }

      reader.onerror = () => {
        reject(
          new Error(
            'ไม่สามารถอ่านไฟล์ได้',
          ),
        )
      }

      reader.readAsDataURL(
        file,
      )
    },
  )
}

/* =========================
   Cover Upload
========================= */

async function handleCoverUpload(
  event: Event,
) {
  const input =
    event.target as HTMLInputElement

  const file =
    input.files?.[0]

  if (!file) {
    return
  }

  if (
    !file.type.startsWith(
      'image/',
    )
  ) {
    toast(
      'กรุณาเลือกไฟล์รูปภาพเท่านั้น',
    )

    input.value = ''

    return
  }

  try {
    const imageData =
      await fileToDataURL(file)

    mangaForm.cover =
      imageData

    toast(
      'เปลี่ยนรูปปกแล้ว กดบันทึกข้อมูลเพื่อบันทึก',
    )
  } catch {
    toast(
      'ไม่สามารถอ่านรูปปกได้',
    )
  }

  input.value = ''
}

/* =========================
   Add Chapter
========================= */

function openAddChapterForm() {
  editingChapterId.value =
    null

  const maxChapter =
    chapters.value.length > 0
      ? Math.max(
          ...chapters.value.map(
            (chapter) =>
              chapter.number,
          ),
        )
      : 0

  chapterForm.number =
    Number(
      (
        maxChapter + 1
      ).toFixed(1),
    )

  chapterForm.title = ''
  chapterForm.imageCount = 0
  chapterForm.images = []

  selectedFiles.value = []
  existingImages.value = []

  clearPreviewUrls()

  showChapterModal.value =
    true
}

/* =========================
   Edit Chapter
========================= */

async function openEditChapterForm(
  chapter: AdminChapter,
) {
  try {
    const fullChapter = await chapterService.getById(chapter.id)
    if (!fullChapter) { toast('ไม่พบตอนที่ต้องการแก้ไข'); return }
    chapter.images = [...fullChapter.images]
    chapter.imageCount = fullChapter.images.length
  } catch (error) {
    console.error('โหลดรูปตอนเพื่อแก้ไขไม่สำเร็จ', error)
    toast('โหลดรูปตอนนี้ไม่สำเร็จ')
    return
  }
  editingChapterId.value =
    chapter.id

  chapterForm.number =
    chapter.number

  chapterForm.title =
    chapter.title

  chapterForm.images = [
    ...chapter.images,
  ]

  chapterForm.imageCount =
    chapterForm.images.length

  selectedFiles.value = []

  existingImages.value = [
    ...chapter.images,
  ]

  clearPreviewUrls()

  showChapterModal.value =
    true
}

/* =========================
   Save Chapter
========================= */

async function saveChapter() {
  if (
    isSavingChapter.value
  ) {
    return
  }

  const number =
    Number(
      chapterForm.number,
    )

  const title =
    chapterForm.title.trim()

  if (
    !Number.isFinite(number) ||
    number < 1
  ) {
    toast(
      'กรุณากรอกเลขตอนให้ถูกต้อง',
    )
    return
  }

  if (!title) {
    toast(
      'กรุณากรอกชื่อตอน',
    )
    return
  }

  const duplicate =
    chapters.value.some(
      (chapter) => {
        if (
          editingChapterId.value !==
            null &&
          chapter.id ===
            editingChapterId.value
        ) {
          return false
        }

        return (
          chapter.number ===
          number
        )
      },
    )

  if (duplicate) {
    toast(
      'เลขตอนนี้มีอยู่แล้ว',
    )
    return
  }

  isSavingChapter.value =
    true

  try {
    const images: string[] =
      [
        ...existingImages.value,
      ]

    for (
      const file of
      selectedFiles.value
    ) {
      if (
        !file.type.startsWith(
          'image/',
        )
      ) {
        continue
      }

      images.push(
        await fileToDataURL(
          file,
        ),
      )
    }

    const wasEditing =
      editingChapterId.value !==
      null

    if (wasEditing) {
      const chapter =
        await chapterService.getById(
          editingChapterId.value!,
        )

      if (!chapter) {
        toast(
          'ไม่พบตอนที่ต้องการแก้ไข',
        )
        return
      }

      chapter.chapterNumber =
        number

      chapter.title =
        title

      chapter.images = [
        ...images,
      ]

      if (
        !(await chapterService.update(
          chapter,
        ))
      ) {
        toast(
          'ไม่สามารถแก้ไขตอนนี้ได้',
        )
        return
      }
    } else {
      const created =
        await chapterService.create(
          mangaId,
          number,
          title,
          images,
        )

      if (!created) {
        toast(
          'เลขตอนนี้มีอยู่แล้ว',
        )
        return
      }
    }

    chapters.value =
      await loadChapters()

    updateLatestChapter()

    closeChapterModal()

    toast(
      wasEditing
        ? 'แก้ไขตอนเรียบร้อยแล้ว'
        : 'เพิ่มตอนเรียบร้อยแล้ว',
    )
  } catch (error) {
    console.error(
      'Save chapter error:',
      error,
    )

    toast(
      'ไม่สามารถบันทึกรูปภาพได้',
    )
  } finally {
    isSavingChapter.value =
      false
  }
}

/* =========================
   Delete Chapter
========================= */

async function deleteChapter(
  chapterId: string,
) {
  const chapter =
    await chapterService.getById(
      chapterId,
    )

  if (!chapter) {
    toast(
      'ไม่พบตอนที่ต้องการลบ',
    )
    return
  }

  const confirmed =
    window.confirm(
      `ต้องการลบตอนที่ ${chapter.chapterNumber} ใช่หรือไม่?`,
    )

  if (!confirmed) {
    return
  }

  if (
    !(await chapterService.delete(
      chapterId,
    ))
  ) {
    toast(
      'ไม่สามารถลบตอนนี้ได้',
    )
    return
  }

  chapters.value =
    await loadChapters()

  updateLatestChapter()

  toast(
    'ลบตอนเรียบร้อยแล้ว',
  )
}

/* =========================
   Update Latest Chapter
========================= */

async function updateLatestChapter() {
  if (!manga) {
    return
  }

  const latest =
    await chapterService.getLatestChapter(
      mangaId,
    )

  manga.latestChapter =
    latest?.chapterNumber ?? 0

  await mangaService.updateManga(
    manga,
  )
}

/* =========================
   File Input
========================= */

function triggerFileInput() {
  fileInput.value?.click()
}

/* =========================
   Chapter Images
========================= */

function handleChapterImages(
  event: Event,
) {
  const input =
    event.target as HTMLInputElement

  const files =
    input.files
      ? Array.from(
          input.files,
        )
      : []

  const imageFiles =
    files.filter((file) =>
      file.type.startsWith(
        'image/',
      ),
    )

  if (
    imageFiles.length === 0
  ) {
    selectedFiles.value = []

    chapterForm.imageCount =
      existingImages.value
        .length

    toast(
      'กรุณาเลือกไฟล์รูปภาพ',
    )

    input.value = ''

    return
  }

  selectedFiles.value =
    imageFiles

  clearPreviewUrls()

  previewUrls.value =
    imageFiles.map(
      (file) =>
        URL.createObjectURL(
          file,
        ),
    )

  chapterForm.imageCount =
    existingImages.value.length +
    imageFiles.length

  input.value = ''
}

/* =========================
   Clear Preview
========================= */

function clearPreviewUrls() {
  previewUrls.value.forEach(
    (url) => {
      URL.revokeObjectURL(
        url,
      )
    },
  )

  previewUrls.value = []
}

/* =========================
   Delete Chapter Image
========================= */

function removeExistingImage(
  index: number,
) {
  if (
    index < 0 ||
    index >=
      existingImages.value
        .length
  ) {
    return
  }

  existingImages.value.splice(
    index,
    1,
  )

  chapterForm.images = [
    ...existingImages.value,
  ]

  chapterForm.imageCount =
    existingImages.value
      .length +
    selectedFiles.value.length
}

function removeSelectedImage(
  index: number,
) {
  if (
    index < 0 ||
    index >=
      selectedFiles.value
        .length
  ) {
    return
  }

  const previewUrl =
    previewUrls.value[index]

  if (previewUrl) {
    URL.revokeObjectURL(
      previewUrl,
    )
  }

  selectedFiles.value.splice(
    index,
    1,
  )

  previewUrls.value.splice(
    index,
    1,
  )

  chapterForm.imageCount =
    existingImages.value
      .length +
    selectedFiles.value.length
}

/* =========================
   Close Modal
========================= */

function closeChapterModal() {
  if (
    isSavingChapter.value
  ) {
    return
  }

  showChapterModal.value =
    false

  editingChapterId.value =
    null

  chapterForm.number = 1
  chapterForm.title = ''
  chapterForm.imageCount = 0
  chapterForm.images = []

  selectedFiles.value = []
  existingImages.value = []

  clearPreviewUrls()

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/* =========================
   Cleanup
========================= */

onBeforeUnmount(() => {
  clearPreviewUrls()

  if (toastTimer) {
    clearTimeout(
      toastTimer,
    )
  }
})
</script>

<template>
  <div class="admin-page">

    <!-- Header -->
    <header class="admin-header">

      <div class="header-left">

        <button
          class="back-btn"
          @click="goBack"
        >
          ← กลับ
        </button>

        <div>
          <h1>
            จัดการมังงะ
          </h1>

          <p>
            จัดการข้อมูลมังงะและตอนทั้งหมด
          </p>
        </div>

      </div>

    </header>

    <main class="admin-container">

      <!-- Manga Information -->
      <section
        class="manga-section"
      >

        <div
          class="section-header"
        >

          <div>

            <h2>
              ข้อมูลมังงะ
            </h2>

            <p>
              แก้ไขข้อมูลพื้นฐานของมังงะ
            </p>

          </div>

          <button
            class="primary-btn"
            @click="saveManga"
          >
            บันทึกข้อมูล
          </button>

        </div>

        <div
          class="manga-content"
        >

          <!-- Cover -->
          <div
            class="cover-section"
          >

            <img
              :src="mangaForm.cover"
              :alt="mangaForm.title"
              class="manga-cover"
            />

            <label
              class="upload-cover-btn"
            >
              เปลี่ยนรูปปก

              <input
                type="file"
                accept="image/*"
                @change="
                  handleCoverUpload
                "
                hidden
              />
            </label>

          </div>

          <!-- Form -->
          <div
            class="manga-form"
          >

            <div
              class="form-group"
            >

              <label>
                ชื่อเรื่อง
              </label>

              <input
                v-model="
                  mangaForm.title
                "
                type="text"
                placeholder="ชื่อมังงะ"
              />

            </div>

            <div
              class="form-group"
            >

              <label>
                ผู้แต่ง
              </label>

              <input
                v-model="
                  mangaForm.author
                "
                type="text"
                placeholder="ชื่อผู้แต่ง"
              />

            </div>

            <div
              class="form-row"
            >

              <!-- Multiple Categories -->
              <div
                class="form-group category-form-group"
              >

                <label>
                  หมวดหมู่
                </label>

                <!-- Selected Categories -->
                <div
                  v-if="
                    selectedCategories.length >
                    0
                  "
                  class="selected-categories"
                >

                  <span
                    v-for="
                      category in
                      selectedCategories
                    "
                    :key="category"
                    class="category-chip"
                  >

                    {{ category }}

                    <button
                      type="button"
                      @click="
                        removeCategory(
                          category,
                        )
                      "
                    >
                      ×
                    </button>

                  </span>

                </div>

                <!-- Category Input -->
                <div
                  class="category-input-row"
                >

                  <input
                    v-model="
                      categoryInput
                    "
                    type="text"
                    list="category-options"
                    placeholder="พิมพ์หมวดหมู่ แล้วกด Enter"
                    @keydown="
                      handleCategoryKeydown
                    "
                  />

                  <button
                    type="button"
                    class="category-add-btn"
                    @click="
                      addCategoryFromInput
                    "
                  >
                    เพิ่ม
                  </button>

                </div>

                <!-- Datalist -->
                <datalist
                  id="category-options"
                >

                  <option
                    v-for="
                      category in
                      categoryOptions
                    "
                    :key="category"
                    :value="category"
                  />

                </datalist>

                <!-- Preset Categories -->
                <div
                  class="category-options"
                >

                  <button
                    v-for="
                      category in
                      categoryOptions
                    "
                    :key="category"
                    type="button"
                    class="category-option"
                    :class="{
                      selected:
                        selectedCategories.includes(
                          category,
                        ),
                    }"
                    @click="
                      addPresetCategory(
                        category,
                      )
                    "
                  >
                    {{ category }}
                  </button>

                </div>

                <small>
                  สามารถเลือกได้หลายหมวดหมู่
                </small>

              </div>

              <!-- Status -->
              <div
                class="form-group"
              >

                <label>
                  สถานะ
                </label>

                <select
                  v-model="
                    mangaForm.status
                  "
                >

                  <option
                    value="ongoing"
                  >
                    กำลังดำเนินเรื่อง
                  </option>

                  <option
                    value="completed"
                  >
                    จบแล้ว
                  </option>

                </select>

              </div>

            </div>

            <div
              class="form-group"
            >

              <label>
                คำอธิบาย
              </label>

              <textarea
                v-model="
                  mangaForm.description
                "
                rows="5"
                placeholder="คำอธิบายมังงะ"
              ></textarea>

            </div>

          </div>

        </div>

      </section>

      <!-- Chapter Section -->
      <section
        class="chapter-section"
      >

        <div
          class="section-header"
        >

          <div>

            <h2>
              จัดการตอน
            </h2>

            <p>
              จำนวนทั้งหมด
              {{ chapters.length }}
              ตอน
            </p>

          </div>

          <button
            class="primary-btn"
            @click="
              openAddChapterForm
            "
          >
            + เพิ่มตอน
          </button>

        </div>

        <!-- Chapter List -->
        <div
          v-if="
            chapters.length > 0
          "
          class="chapter-list"
        >

          <div
            v-for="
              chapter in
              sortedChapters
            "
            :key="chapter.id"
            class="chapter-card"
          >

            <div
              class="chapter-info"
            >

              <div
                class="chapter-number"
              >
                ตอน
                {{ chapter.number }}
              </div>

              <div
                class="chapter-title"
              >
                {{ chapter.title }}
              </div>

              <div
                class="chapter-images"
              >
                {{ chapter.imageCount }}
                รูป
              </div>

            </div>

            <div
              class="chapter-actions"
            >

              <button
                class="edit-btn"
                @click="
                  openEditChapterForm(
                    chapter,
                  )
                "
              >
                แก้ไข
              </button>

              <button
                class="delete-btn"
                @click="
                  deleteChapter(
                    chapter.id,
                  )
                "
              >
                ลบ
              </button>

            </div>

          </div>

        </div>

        <!-- Empty -->
        <div
          v-else
          class="empty-state"
        >

          <h3>
            ยังไม่มีตอน
          </h3>

          <p>
            กดปุ่ม "เพิ่มตอน"
            เพื่อเพิ่มตอนแรก
          </p>

          <button
            class="primary-btn"
            @click="
              openAddChapterForm
            "
          >
            + เพิ่มตอนแรก
          </button>

        </div>

      </section>

    </main>

    <!-- Chapter Modal -->
    <div
      v-if="
        showChapterModal
      "
      class="modal-overlay"
      @click.self="
        closeChapterModal
      "
    >

      <div class="modal">

        <!-- Modal Header -->
        <div
          class="modal-header"
        >

          <div>

            <h2>
              {{
                editingChapterId !==
                null
                  ? 'แก้ไขตอน'
                  : 'เพิ่มตอนใหม่'
              }}
            </h2>

            <p>
              {{
                editingChapterId !==
                null
                  ? 'แก้ไขข้อมูลของตอน'
                  : 'เพิ่มตอนใหม่ลงในมังงะ'
              }}
            </p>

          </div>

          <button
            class="close-btn"
            :disabled="
              isSavingChapter
            "
            @click="
              closeChapterModal
            "
          >
            ×
          </button>

        </div>

        <!-- Modal Body -->
        <div
          class="modal-body"
        >

          <!-- Chapter Number -->
          <div
            class="form-group"
          >

            <label>
              เลขตอน
            </label>

            <input
              v-model.number="
                chapterForm.number
              "
              type="number"
              min="1"
              step="0.1"
              placeholder="เช่น 1, 2, 3, 10.5, 101"
            />

            <small>
              สามารถเพิ่มตอนต่อไปได้ไม่จำกัด
            </small>

          </div>

          <!-- Chapter Title -->
          <div
            class="form-group"
          >

            <label>
              ชื่อตอน
            </label>

            <input
              v-model="
                chapterForm.title
              "
              type="text"
              placeholder="เช่น การเริ่มต้น"
            />

          </div>

          <!-- Images -->
          <div
            class="form-group"
          >

            <label>
              รูปภาพในตอน
            </label>

            <div
              class="upload-area"
            >

              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                multiple
                @change="
                  handleChapterImages
                "
                hidden
              />

              <button
                type="button"
                class="upload-btn"
                @click="
                  triggerFileInput
                "
              >
                เลือกรูปภาพ
              </button>

              <p>
                {{
                  selectedFiles.length >
                  0
                    ? `เลือกแล้ว ${selectedFiles.length} รูป`
                    : editingChapterId !==
                        null &&
                      existingImages.length >
                        0
                      ? `ใช้รูปเดิม ${existingImages.length} รูป`
                      : 'ยังไม่ได้เลือกรูปภาพ'
                }}
              </p>

            </div>

          </div>

          <!-- Existing Images -->
          <div
            v-if="
              editingChapterId !==
                null &&
              existingImages.length >
                0
            "
            class="preview-section"
          >

            <h3>
              รูปภาพปัจจุบัน
            </h3>

            <div
              class="preview-grid"
            >

              <div
                v-for="(
                  image,
                  index
                ) in existingImages"
                :key="
                  `existing-${index}`
                "
                class="preview-item"
              >

                <img
                  :src="image"
                  :alt="
                    `รูปปัจจุบันที่ ${
                      index + 1
                    }`
                  "
                />

                <span>
                  {{ index + 1 }}
                </span>

                <button
                  type="button"
                  class="image-delete-btn"
                  @click="
                    removeExistingImage(
                      index,
                    )
                  "
                >
                  ลบ
                </button>

              </div>

            </div>

          </div>

          <!-- New Image Preview -->
          <div
            v-if="
              previewUrls.length >
              0
            "
            class="preview-section"
          >

            <h3>
              ตัวอย่างรูปภาพใหม่
            </h3>

            <div
              class="preview-grid"
            >

              <div
                v-for="(
                  url,
                  index
                ) in previewUrls"
                :key="url"
                class="preview-item"
              >

                <img
                  :src="url"
                  :alt="
                    `รูปที่ ${
                      index + 1
                    }`
                  "
                />

                <span>
                  {{ index + 1 }}
                </span>

                <button
                  type="button"
                  class="image-delete-btn"
                  @click="
                    removeSelectedImage(
                      index,
                    )
                  "
                >
                  ลบ
                </button>

              </div>

            </div>

          </div>

        </div>

        <!-- Modal Footer -->
        <div
          class="modal-footer"
        >

          <button
            class="secondary-btn"
            :disabled="
              isSavingChapter
            "
            @click="
              closeChapterModal
            "
          >
            ยกเลิก
          </button>

          <button
            class="primary-btn"
            :disabled="
              isSavingChapter
            "
            @click="
              saveChapter
            "
          >
            {{
              isSavingChapter
                ? 'กำลังบันทึก...'
                : editingChapterId !==
                    null
                  ? 'บันทึกการแก้ไข'
                  : 'เพิ่มตอน'
            }}
          </button>

        </div>

      </div>

    </div>

    <!-- Toast -->
    <transition
      name="toast"
    >

      <div
        v-if="showToast"
        class="toast"
      >
        {{ toastMessage }}
      </div>

    </transition>

  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

/* =========================
   Page
========================= */

.admin-page {
  min-height: 100vh;
  background: #f7f7f8;
  color: #18181b;
}

/* =========================
   Header
========================= */

.admin-header {
  background: #18181b;
  border-bottom: 1px solid #27272a;
  padding: 20px 32px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-left h1 {
  margin: 0;
  font-size: 28px;
  color: #ffffff;
}

.header-left p {
  margin: 5px 0 0;
  color: #d4d4d8;
}

/* =========================
   Back Button
========================= */

.back-btn {
  border: 1px solid #71717a;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 8px;

  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.back-btn:hover {
  background: #27272a;
  border-color: #a1a1aa;
}

/* =========================
   Container
========================= */

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px 60px;
}

/* =========================
   Sections
========================= */

.manga-section,
.chapter-section {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 25px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.section-header h2 {
  margin: 0;
  font-size: 22px;
  color: #18181b;
}

.section-header p {
  margin: 5px 0 0;
  color: #777777;
}

/* =========================
   Buttons
========================= */

.primary-btn,
.secondary-btn,
.edit-btn,
.delete-btn,
.upload-btn,
.upload-cover-btn {
  border: none;
  cursor: pointer;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-family: inherit;

  transition:
    background 0.3s ease,
    transform 0.2s ease;
}

.primary-btn {
  background: #7c3aed;
  color: #ffffff;
}

.primary-btn:hover:not(:disabled) {
  background: #6d28d9;
  transform: translateY(-1px);
}

.primary-btn:disabled,
.secondary-btn:disabled,
.close-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.secondary-btn {
  background: #eeeeee;
  color: #18181b;
}

.secondary-btn:hover:not(:disabled) {
  background: #e5e5e5;
}

.edit-btn {
  background: #eeeeee;
  color: #18181b;
}

.edit-btn:hover {
  background: #e5e5e5;
}

.delete-btn {
  background: #eeeeee;
  color: #555555;
}

.delete-btn:hover {
  background: #e5e5e5;
}

.upload-btn,
.upload-cover-btn {
  background: #7c3aed;
  color: #ffffff;
}

.upload-btn:hover,
.upload-cover-btn:hover {
  background: #6d28d9;
}

/* =========================
   Manga Content
========================= */

.manga-content {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 30px;
}

/* =========================
   Cover
========================= */

.cover-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.manga-cover {
  width: 190px;
  height: 270px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #e5e5e5;
  background: #eeeeee;
}

.upload-cover-btn {
  text-align: center;
}

/* =========================
   Form
========================= */

.manga-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.form-group label {
  font-weight: 600;
  font-size: 14px;
  color: #18181b;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;

  border: 1px solid #e5e5e5;
  border-radius: 8px;

  padding: 11px 12px;

  font-size: 14px;
  outline: none;

  background: #ffffff;
  color: #18181b;

  font-family: inherit;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #a1a1aa;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #7c3aed;

  box-shadow:
    0 0 0 3px
    rgba(124, 58, 237, 0.1);
}

.form-group textarea {
  resize: vertical;
}

.form-group small {
  color: #888888;
  font-size: 12px;
}

/* =========================
   Multiple Categories
========================= */

.category-form-group {
  min-width: 0;
}

.selected-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  padding: 6px 9px;

  background: #ede9fe;
  color: #6d28d9;

  border-radius: 6px;

  font-size: 12px;
  font-weight: 600;
}

.category-chip button {
  width: 18px;
  height: 18px;

  padding: 0;

  border: none;
  border-radius: 50%;

  background: transparent;
  color: #6d28d9;

  cursor: pointer;

  font-size: 15px;
  line-height: 16px;
}

.category-chip button:hover {
  background: #ddd6fe;
}

.category-input-row {
  display: flex;
  gap: 8px;
}

.category-input-row input {
  flex: 1;
  min-width: 0;
}

.category-add-btn {
  flex-shrink: 0;

  padding: 10px 14px;

  border: none;
  border-radius: 8px;

  background: #7c3aed;
  color: #ffffff;

  cursor: pointer;

  font-size: 14px;
  font-family: inherit;
}

.category-add-btn:hover {
  background: #6d28d9;
}

.category-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.category-option {
  padding: 5px 9px;

  background: #ffffff;

  border: 1px solid #d4d4d8;
  border-radius: 6px;

  color: #52525b;

  cursor: pointer;

  font-size: 11px;
  font-family: inherit;
}

.category-option:hover,
.category-option.selected {
  border-color: #7c3aed;
  background: #ede9fe;
  color: #7c3aed;
}

/* =========================
   Chapter List
========================= */

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chapter-card {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  border: 1px solid #e5e5e5;
  border-radius: 10px;

  padding: 15px 18px;

  background: #ffffff;

  transition:
    background 0.3s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.chapter-card:hover {
  background: #f7f7f8;
  border-color: #d4d4d8;
  transform: translateY(-1px);
}

.chapter-info {
  display: flex;
  align-items: center;
  gap: 20px;

  min-width: 0;
}

.chapter-number {
  font-weight: 700;
  min-width: 80px;
  color: #18181b;
}

.chapter-title {
  font-weight: 500;
  color: #18181b;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chapter-images {
  color: #888888;
  font-size: 13px;
}

.chapter-actions {
  display: flex;
  gap: 8px;
}

/* =========================
   Empty State
========================= */

.empty-state {
  text-align: center;

  padding: 50px 20px;

  border: 1px dashed #d4d4d8;
  border-radius: 10px;

  background: #fafafa;
}

.empty-state h3 {
  margin: 0 0 8px;
  color: #18181b;
}

.empty-state p {
  color: #777777;
  margin-bottom: 20px;
}

/* =========================
   Modal
========================= */

.modal-overlay {
  position: fixed;
  inset: 0;

  background: transparent;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  z-index: 1000;
}

.modal {
  width: 100%;
  max-width: 650px;

  max-height: 90vh;
  overflow-y: auto;

  background: #ffffff;

  border-radius: 14px;

  box-shadow:
    0 20px 60px
    rgba(0, 0, 0, 0.2);

  border: 1px solid #e5e5e5;
}

/* =========================
   Modal Header
========================= */

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  padding: 22px 24px;

  border-bottom: 1px solid #eeeeee;
}

.modal-header h2 {
  margin: 0;
  color: #18181b;
}

.modal-header p {
  margin: 5px 0 0;
  color: #777777;
}

.close-btn {
  border: none;
  background: transparent;

  color: #18181b;

  font-size: 28px;
  cursor: pointer;

  line-height: 1;

  width: 34px;
  height: 34px;

  border-radius: 8px;

  transition:
    background 0.2s ease;
}

.close-btn:hover:not(:disabled) {
  background: #eeeeee;
}

/* =========================
   Modal Body
========================= */

.modal-body {
  padding: 24px;

  display: flex;
  flex-direction: column;

  gap: 20px;
}

/* =========================
   Modal Footer
========================= */

.modal-footer {
  display: flex;
  justify-content: flex-end;

  gap: 10px;

  padding: 18px 24px;

  border-top: 1px solid #eeeeee;
}

/* =========================
   Upload Area
========================= */

.upload-area {
  border: 1px dashed #d4d4d8;
  border-radius: 10px;

  padding: 25px;

  text-align: center;

  background: #fafafa;

  transition:
    border-color 0.2s ease,
    background 0.2s ease;
}

.upload-area:hover {
  border-color: #7c3aed;
  background: #fafafa;
}

.upload-area p {
  margin: 10px 0 0;

  color: #777777;

  font-size: 13px;
}

/* =========================
   Preview
========================= */

.preview-section h3 {
  margin: 0 0 12px;

  font-size: 16px;

  color: #18181b;
}

.preview-grid {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 10px;
}

.preview-item {
  position: relative;

  aspect-ratio: 3 / 4;

  overflow: hidden;

  border-radius: 8px;

  background: #eeeeee;

  border: 1px solid #e5e5e5;
}

.preview-item img {
  width: 100%;
  height: 100%;

  object-fit: cover;
}

.preview-item span {
  position: absolute;

  left: 6px;
  top: 6px;

  background:
    rgba(24, 24, 27, 0.75);

  color: #ffffff;

  border-radius: 5px;

  padding: 3px 7px;

  font-size: 11px;
}

.image-delete-btn {
  position: absolute;

  right: 6px;
  top: 6px;

  border: none;
  border-radius: 6px;

  padding: 5px 8px;

  background: #18181b;
  color: #ffffff;

  font-size: 11px;

  cursor: pointer;

  z-index: 2;
}

.image-delete-btn:hover {
  background: #7c3aed;
}

/* =========================
   Toast
========================= */

.toast {
  position: fixed;

  right: 25px;
  bottom: 25px;

  z-index: 2000;

  padding: 13px 18px;

  background: #18181b;

  border-radius: 8px;

  color: #ffffff;

  font-size: 14px;

  box-shadow:
    0 10px 25px
    rgba(0, 0, 0, 0.15);
}

.toast-enter-active,
.toast-leave-active {
  transition: 0.25s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;

  transform:
    translateY(10px);
}

/* =========================
   Responsive
========================= */

@media (max-width: 768px) {
  .admin-header {
    padding: 16px;
  }

  .admin-container {
    padding:
      20px 12px 40px;
  }

  .manga-section,
  .chapter-section {
    padding: 18px;
  }

  .manga-content {
    grid-template-columns: 1fr;
  }

  .cover-section {
    align-items: flex-start;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .chapter-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .chapter-info {
    width: 100%;
    flex-wrap: wrap;
  }

  .chapter-actions {
    width: 100%;
  }

  .chapter-actions button {
    flex: 1;
  }

  .category-input-row {
    flex-direction: column;
  }

  .category-add-btn {
    width: 100%;
  }

  .preview-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }
}
</style>
