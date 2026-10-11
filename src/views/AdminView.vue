<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Manga } from '../models/Manga'
import { MangaService } from '@/services/MangaService'
import { uploadMangaImage } from '@/services/imageUploadService'

const router = useRouter()
const mangaService = new MangaService()

type MangaStatus = 'กำลังดำเนินเรื่อง' | 'จบแล้ว' | 'พักการเขียน'

/*
 * โหลดเฉพาะข้อมูลมังงะที่มีอยู่จริงในระบบ
 *
 * ไม่มี defaultMangaList
 * ไม่มีการสร้างข้อมูลตัวอย่างอัตโนมัติ
 */
function loadManga(): Manga[] {
  return mangaService.getAllManga()
}

const mangaList = ref<Manga[]>([])

onMounted(async () => {
  try {
    await mangaService.ready
    mangaList.value = loadManga()
  } catch (error) {
    toast('โหลดข้อมูลมังงะไม่สำเร็จ กรุณาตรวจสอบ Supabase')
    console.error(error)
  }
})

const searchText = ref('')

/* =========================
   Search
========================= */

const filteredManga = computed(() => {
  const keyword = searchText.value
    .trim()
    .toLowerCase()

  if (!keyword) {
    return mangaList.value
  }

  return mangaList.value.filter((manga) => {
    return (
      manga.title
        .toLowerCase()
        .includes(keyword) ||
      manga.author
        .toLowerCase()
        .includes(keyword) ||
      manga.category
        .toLowerCase()
        .includes(keyword)
    )
  })
})

/* =========================
   Statistics
========================= */

const mangaTotal = computed(() => {
  return mangaList.value.length
})

const totalChapters = computed(() => {
  return mangaList.value.reduce(
    (total, manga) =>
      total + manga.latestChapter,
    0,
  )
})

const ongoingTotal = computed(() => {
  return mangaList.value.filter(
    (manga) =>
      manga.status === 'กำลังดำเนินเรื่อง',
  ).length
})

const completedTotal = computed(() => {
  return mangaList.value.filter(
    (manga) => manga.status === 'จบแล้ว',
  ).length
})

/* =========================
   Add Manga Modal
========================= */

const showAddModal = ref(false)
const isUploadingCover = ref(false)

const form = reactive<{
  title: string
  author: string
  category: string
  status: MangaStatus
  cover: string
  description: string
}>({
  title: '',
  author: '',
  category: '',
  status: 'กำลังดำเนินเรื่อง',
  cover: '',
  description: '',
})

/* =========================
   Toast
========================= */

const showToast = ref(false)
const toastMessage = ref('')

function toast(message: string) {
  toastMessage.value = message
  showToast.value = true

  setTimeout(() => {
    showToast.value = false
  }, 2500)
}

/* =========================
   Modal
========================= */

function openAddModal() {
  form.title = ''
  form.author = ''
  form.category = ''
  form.status = 'กำลังดำเนินเรื่อง'
  form.cover = ''
  form.description = ''

  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
}

/* =========================
   Add Manga
========================= */

async function addManga() {
  if (!form.title.trim()) {
    toast('กรุณากรอกชื่อมังงะ')
    return
  }

  if (!form.author.trim()) {
    toast('กรุณากรอกชื่อผู้แต่ง')
    return
  }

  if (!form.category.trim()) {
    toast('กรุณากรอกหมวดหมู่')
    return
  }

  const newManga = new Manga(
    Date.now(),
    form.title.trim(),
    form.author.trim(),
    form.description.trim(),
    form.category.trim(),
    0,
    form.status,
    form.cover.trim(),
  )

  try {
    const created = await mangaService.createManga(newManga)
    if (!created) { toast('เพิ่มมังงะไม่สำเร็จ ตรวจสอบสิทธิ์ผู้ดูแลระบบ'); return }
    mangaList.value = mangaService.getAllManga()
    closeAddModal()
    toast('เพิ่มมังงะเรียบร้อยแล้ว')
  } catch (error) {
    console.error(error)
    toast('เชื่อมต่อฐานข้อมูลไม่สำเร็จ')
  }
}

/* =========================
   Manage Manga
========================= */

function manageManga(id: number) {
  router.push(`/admin/manga/${id}`)
}

/* =========================
   Delete Manga
========================= */

async function deleteManga(id: number) {
  const manga =
    mangaService.getMangaById(id)

  if (!manga) {
    toast('ไม่พบมังงะ')
    return
  }

  const deleted =
    await mangaService.deleteManga(id)

  if (!deleted) {
    toast('ไม่สามารถลบมังงะได้')
    return
  }

  mangaList.value =
    mangaService.getAllManga()

  toast(
    `ลบ "${manga.title}" เรียบร้อยแล้ว`,
  )
}

/* =========================
   Back To Website
========================= */

function backToWebsite() {
  router.push('/')
}
</script>

<template>
  <div class="admin-page">

    <!-- Header -->
    <header class="admin-header">
      <div class="header-left">
        <div class="logo">
          Manga<span>Verse</span>
        </div>

        <div class="admin-label">
          Admin
        </div>
      </div>

      <div class="header-right">
        <button
          class="back-button"
          @click="backToWebsite"
        >
          กลับหน้าเว็บไซต์
        </button>
      </div>
    </header>

    <!-- Main -->
    <main class="admin-main">

      <!-- Page Title -->
      <div class="page-title">
        <div>
          <h1>จัดการมังงะ</h1>

          <p>
            จัดการข้อมูลมังงะภายในระบบ
          </p>
        </div>

        <button
          class="add-button"
          @click="openAddModal"
        >
          + เพิ่มมังงะ
        </button>
      </div>

      <!-- Statistics -->
      <section class="statistics">

        <div class="stat-card">
          <div class="stat-icon purple">
            M
          </div>

          <div class="stat-content">
            <span>มังงะทั้งหมด</span>

            <strong>
              {{ mangaTotal }}
            </strong>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon blue">
            C
          </div>

          <div class="stat-content">
            <span>ตอนทั้งหมด</span>

            <strong>
              {{ totalChapters }}
            </strong>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">
            O
          </div>

          <div class="stat-content">
            <span>
              กำลังดำเนินเรื่อง
            </span>

            <strong>
              {{ ongoingTotal }}
            </strong>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon gray">
            ✓
          </div>

          <div class="stat-content">
            <span>จบแล้ว</span>

            <strong>
              {{ completedTotal }}
            </strong>
          </div>
        </div>

      </section>

      <!-- Manga Section -->
      <section class="manga-section">

        <div class="section-header">

          <div>
            <h2>รายการมังงะ</h2>

            <p>
              มังงะทั้งหมด
              {{ mangaTotal }}
              เรื่อง
            </p>
          </div>

          <div class="search-box">
            <input
              v-model="searchText"
              type="text"
              placeholder="ค้นหาชื่อมังงะ ผู้แต่ง หรือหมวดหมู่..."
            />
          </div>

        </div>

        <!-- Manga Table -->
        <div class="table-wrapper">

          <table class="manga-table">

            <thead>
              <tr>
                <th>มังงะ</th>
                <th>ผู้แต่ง</th>
                <th>หมวดหมู่</th>
                <th>ตอนล่าสุด</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>

            <tbody>

              <tr
                v-for="manga in filteredManga"
                :key="manga.id"
              >

                <td>
                  <div class="manga-info">

                    <img
                      v-if="manga.cover"
                      :src="manga.cover"
                      :alt="manga.title"
                      class="manga-cover"
                    />

                    <div class="no-cover">
                      ไม่มีรูป
                    </div>

                    <div>
                      <strong>
                        {{ manga.title }}
                      </strong>

                      <span>
                        {{ manga.description }}
                      </span>
                    </div>

                  </div>
                </td>

                <td>
                  {{ manga.author }}
                </td>

                <td>
                  <span
                    class="category-badge"
                  >
                    {{ manga.category }}
                  </span>
                </td>

                <td>
                  Chapter
                  {{ manga.latestChapter }}
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="{
                      ongoing:
                        manga.status ===
                        'กำลังดำเนินเรื่อง',

                      completed:
                        manga.status ===
                        'จบแล้ว',
                    }"
                  >
                    {{ manga.status }}
                  </span>
                </td>

                <td>
                  <div
                    class="action-buttons"
                  >

                    <button
                      class="manage-button"
                      @click="
                        manageManga(manga.id)
                      "
                    >
                      จัดการ
                    </button>

                    <button
                      class="delete-button"
                      @click="
                        deleteManga(manga.id)
                      "
                    >
                      ลบ
                    </button>

                  </div>
                </td>

              </tr>

              <!-- Empty -->
              <tr
                v-if="
                  filteredManga.length === 0
                "
              >
                <td
                  colspan="6"
                  class="empty-state"
                >
                  <strong>
                    ยังไม่มีมังงะ
                  </strong>

                  <span>
                    กดปุ่ม
                    "+ เพิ่มมังงะ"
                    เพื่อเพิ่มมังงะเข้าสู่ระบบ
                  </span>
                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </section>

    </main>

    <!-- Add Manga Modal -->
    <div
      v-if="showAddModal"
      class="modal-overlay"
      @click.self="closeAddModal"
    >

      <div class="modal">

        <div class="modal-header">

          <div>
            <h2>เพิ่มมังงะ</h2>

            <p>
              กรอกข้อมูลมังงะที่ต้องการเพิ่ม
            </p>
          </div>

          <button
            class="close-button"
            @click="closeAddModal"
          >
            ×
          </button>

        </div>

        <div class="modal-body">

          <!-- Title -->
          <div class="form-group">

            <label>
              ชื่อมังงะ
              <span>*</span>
            </label>

            <input
              v-model="form.title"
              type="text"
              placeholder="เช่น One Piece"
            />

          </div>

          <!-- Author -->
          <div class="form-group">

            <label>
              ผู้แต่ง
              <span>*</span>
            </label>

            <input
              v-model="form.author"
              type="text"
              placeholder="ชื่อผู้แต่ง"
            />

          </div>

          <!-- Category + Status -->
          <div class="form-row">

            <div class="form-group">

              <label>
                หมวดหมู่
                <span>*</span>
              </label>

              <input
                v-model="form.category"
                type="text"
                placeholder="เช่น Action"
              />

            </div>

            <div class="form-group">

              <label>
                สถานะ
              </label>

              <select
                v-model="form.status"
              >
                <option
                  value="กำลังดำเนินเรื่อง"
                >
                  กำลังดำเนินเรื่อง
                </option>

                <option
                  value="จบแล้ว"
                >
                  จบแล้ว
                </option>
                <option
                  value="พักการเขียน"
                >
                  พักการเขียน
                </option>
              </select>

            </div>

          </div>

          <!-- Cover -->
          <div class="form-group">

            <label>
              URL รูปปก
            </label>

            <input
              v-model="form.cover"
              type="url"
              placeholder="วาง URL รูป หรืออัปโหลดไฟล์ด้านล่าง"
            />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              :disabled="isUploadingCover"
              @change="handleNewCoverUpload"
            />
            <img
              v-if="form.cover"
              :src="form.cover"
              alt="ตัวอย่างรูปปก"
              style="display:block;max-width:120px;max-height:170px;object-fit:cover;margin-top:10px;border-radius:8px"
            />

          </div>

          <!-- Description -->
          <div class="form-group">

            <label>
              รายละเอียด
            </label>

            <textarea
              v-model="form.description"
              rows="4"
              placeholder="รายละเอียดของมังงะ"
            ></textarea>

          </div>

        </div>

        <!-- Footer -->
        <div class="modal-footer">

          <button
            class="cancel-button"
            @click="closeAddModal"
          >
            ยกเลิก
          </button>

          <button
            class="save-button"
            @click="addManga"
          >
            เพิ่มมังงะ
          </button>

        </div>

      </div>

    </div>

    <!-- Toast -->
    <transition name="toast">

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

.admin-page {
  min-height: 100vh;
  background: #f7f7f8;
  color: #18181b;
}

/* =========================
   Header
========================= */

.admin-header {
  height: 70px;
  padding: 0 40px;

  background: #18181b;
  color: #ffffff;

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.logo {
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.logo span {
  color: #7c3aed;
}

.admin-label {
  padding: 5px 10px;

  border: 1px solid #3f3f46;
  border-radius: 6px;

  color: #d4d4d8;
  font-size: 12px;
}

.header-right {
  display: flex;
  align-items: center;
}

.back-button {
  padding: 9px 15px;

  background: transparent;
  border: 1px solid #52525b;
  border-radius: 7px;

  color: #ffffff;
  cursor: pointer;
  font-size: 14px;

  transition: 0.2s;
}

.back-button:hover {
  background: #27272a;
}

/* =========================
   Main
========================= */

.admin-main {
  width: min(1400px, calc(100% - 80px));

  margin: 0 auto;
  padding: 40px 0 60px;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 30px;
}

.page-title h1 {
  margin: 0 0 6px;

  font-size: 30px;
  font-weight: 800;
}

.page-title p {
  margin: 0;

  color: #777777;
  font-size: 14px;
}

.add-button {
  padding: 11px 18px;

  background: #7c3aed;
  border: none;
  border-radius: 7px;

  color: #ffffff;
  cursor: pointer;

  font-size: 14px;
  font-weight: 600;

  transition: 0.2s;
}

.add-button:hover {
  background: #6d28d9;
}

/* =========================
   Statistics
========================= */

.statistics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;

  margin-bottom: 30px;
}

.stat-card {
  min-height: 110px;
  padding: 22px;

  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;

  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;

  border-radius: 9px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 18px;
  font-weight: 800;
}

.stat-icon.purple {
  background: #ede9fe;
  color: #7c3aed;
}

.stat-icon.blue {
  background: #e0f2fe;
  color: #0284c7;
}

.stat-icon.green {
  background: #dcfce7;
  color: #16a34a;
}

.stat-icon.gray {
  background: #f4f4f5;
  color: #52525b;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-content span {
  color: #777777;
  font-size: 13px;
}

.stat-content strong {
  font-size: 24px;
  font-weight: 800;
}

/* =========================
   Manga Section
========================= */

.manga-section {
  background: #ffffff;

  border: 1px solid #e5e5e5;
  border-radius: 10px;

  overflow: hidden;
}

.section-header {
  padding: 22px 24px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid #eeeeee;
}

.section-header h2 {
  margin: 0 0 4px;

  font-size: 19px;
  font-weight: 700;
}

.section-header p {
  margin: 0;

  color: #777777;
  font-size: 13px;
}

.search-box input {
  width: 320px;

  padding: 10px 13px;

  border: 1px solid #d4d4d8;
  border-radius: 7px;

  background: #ffffff;
  color: #18181b;

  outline: none;
  font-size: 14px;
}

.search-box input:focus {
  border-color: #7c3aed;
}

/* =========================
   Table
========================= */

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.manga-table {
  width: 100%;
  border-collapse: collapse;
}

.manga-table th {
  padding: 14px 20px;

  background: #fafafa;
  border-bottom: 1px solid #eeeeee;

  color: #52525b;

  text-align: left;

  font-size: 12px;
  font-weight: 700;

  white-space: nowrap;
}

.manga-table td {
  padding: 16px 20px;

  border-bottom: 1px solid #eeeeee;

  font-size: 14px;
  vertical-align: middle;
}

.manga-table tbody tr:last-child td {
  border-bottom: none;
}

.manga-table tbody tr:hover {
  background: #fafafa;
}

.manga-info {
  min-width: 270px;

  display: flex;
  align-items: center;
  gap: 13px;
}

.manga-cover,
.no-cover {
  width: 48px;
  height: 64px;

  flex-shrink: 0;

  border-radius: 5px;
}

.manga-cover {
  object-fit: cover;
  background: #eeeeee;
}

.no-cover {
  background: #f4f4f5;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #a1a1aa;
  font-size: 10px;
}

.manga-info > div:last-child {
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: 5px;
}

.manga-info strong {
  font-size: 14px;
  font-weight: 700;
}

.manga-info span {
  max-width: 250px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  color: #777777;
  font-size: 12px;
}

.category-badge {
  display: inline-block;

  padding: 5px 9px;

  background: #f4f4f5;
  border-radius: 5px;

  color: #52525b;
  font-size: 12px;
}

.status-badge {
  display: inline-block;

  padding: 5px 9px;

  border-radius: 5px;

  font-size: 12px;
  white-space: nowrap;
}

.status-badge.ongoing {
  background: #ede9fe;
  color: #7c3aed;
}

.status-badge.completed {
  background: #f4f4f5;
  color: #52525b;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 7px;
}

.manage-button,
.delete-button {
  padding: 7px 11px;

  border-radius: 6px;

  cursor: pointer;
  font-size: 12px;

  transition: 0.2s;
}

.manage-button {
  background: #18181b;
  border: 1px solid #18181b;

  color: #ffffff;
}

.manage-button:hover {
  background: #3f3f46;
  border-color: #3f3f46;
}

.delete-button {
  background: #ffffff;
  border: 1px solid #d4d4d8;

  color: #52525b;
}

.delete-button:hover {
  background: #f4f4f5;
  border-color: #a1a1aa;
}

.empty-state {
  padding: 60px 20px !important;

  color: #777777;

  text-align: center !important;
}

.empty-state strong,
.empty-state span {
  display: block;
}

.empty-state strong {
  margin-bottom: 7px;

  color: #52525b;
  font-size: 15px;
}

.empty-state span {
  font-size: 13px;
}

/* =========================
   Modal
========================= */

.modal-overlay {
  position: fixed;
  inset: 0;

  z-index: 1000;

  background: rgba(24, 24, 27, 0.65);

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;
}

.modal {
  width: min(550px, 100%);
  max-height: 90vh;

  background: #ffffff;
  border-radius: 12px;

  overflow-y: auto;

  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 22px 24px;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  border-bottom: 1px solid #eeeeee;
}

.modal-header h2 {
  margin: 0 0 5px;

  font-size: 20px;
}

.modal-header p {
  margin: 0;

  color: #777777;
  font-size: 13px;
}

.close-button {
  width: 32px;
  height: 32px;

  border: none;
  border-radius: 6px;

  background: transparent;
  color: #777777;

  cursor: pointer;

  font-size: 24px;
  line-height: 1;
}

.close-button:hover {
  background: #f4f4f5;
  color: #18181b;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;

  margin-bottom: 7px;

  color: #27272a;

  font-size: 13px;
  font-weight: 600;
}

.form-group label span {
  color: #7c3aed;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;

  padding: 10px 12px;

  background: #ffffff;

  border: 1px solid #d4d4d8;
  border-radius: 7px;

  color: #18181b;

  outline: none;

  font-family: inherit;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #7c3aed;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;

  gap: 14px;
}

.modal-footer {
  padding: 18px 24px;

  display: flex;
  justify-content: flex-end;

  gap: 10px;

  border-top: 1px solid #eeeeee;
}

.cancel-button,
.save-button {
  padding: 10px 17px;

  border-radius: 7px;

  cursor: pointer;

  font-size: 14px;
  font-weight: 600;
}

.cancel-button {
  background: #ffffff;

  border: 1px solid #d4d4d8;

  color: #52525b;
}

.cancel-button:hover {
  background: #f4f4f5;
}

.save-button {
  background: #7c3aed;

  border: 1px solid #7c3aed;

  color: #ffffff;
}

.save-button:hover {
  background: #6d28d9;
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
    0 10px 25px rgba(0, 0, 0, 0.15);
}

.toast-enter-active,
.toast-leave-active {
  transition: 0.25s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* =========================
   Responsive
========================= */

@media (max-width: 1000px) {
  .statistics {
    grid-template-columns: repeat(2, 1fr);
  }

  .admin-main {
    width: min(
      calc(100% - 40px),
      1400px
    );
  }

  .admin-header {
    padding: 0 20px;
  }
}

@media (max-width: 700px) {
  .admin-header {
    height: auto;
    min-height: 70px;

    padding: 15px 20px;

    gap: 15px;
  }

  .admin-label {
    display: none;
  }

  .page-title {
    align-items: flex-start;

    flex-direction: column;

    gap: 15px;
  }

  .statistics {
    grid-template-columns: 1fr;
  }

  .section-header {
    align-items: flex-start;

    flex-direction: column;

    gap: 15px;
  }

  .search-box {
    width: 100%;
  }

  .search-box input {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;

    gap: 0;
  }

  .admin-main {
    width: calc(100% - 30px);

    padding-top: 25px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
