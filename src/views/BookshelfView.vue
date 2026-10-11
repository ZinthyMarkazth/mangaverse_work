<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useBookshelfStore } from '@/stores/bookshelf'
import { useCustomCategoryStore } from '@/stores/customCategory'

const router = useRouter()

const authStore = useAuthStore()
const bookshelfStore = useBookshelfStore()
const customCategoryStore = useCustomCategoryStore()

/* =========================
   Create Folder Modal
========================= */

const showCreateFolderModal = ref(false)
const folderNameInput = ref('')

function openCreateFolderModal() {
  folderNameInput.value = ''
  showCreateFolderModal.value = true
}

function closeCreateFolderModal() {
  showCreateFolderModal.value = false
  folderNameInput.value = ''
}

function createFolder() {
  const folderName = folderNameInput.value.trim()

  if (!folderName) {
    return
  }

  const created =
    customCategoryStore.addCategory(
      folderName,
    )

  if (!created) {
    return
  }

  closeCreateFolderModal()
}

/* =========================
   Navigation
========================= */

function goHome() {
  router.push('/')
}

function openManga(id: number) {
  router.push(`/manga/${id}`)
}

function continueReading(
  id: number,
  chapter: number,
) {
  router.push(
    `/manga/${id}/chapter/${chapter}`,
  )
}

/* =========================
   Bookshelf
========================= */

function removeFromBookshelf(
  id: number,
) {
  bookshelfStore.removeFromBookshelf(id)
}

function logout() {
  authStore.logout()
  router.push('/')
}

/* =========================
   Folder
========================= */

function openFolder(id: number) {
  router.push(
    `/bookshelf/category/${id}`,
  )
}

function editFolder(id: number) {
  const folder =
    customCategoryStore.getCategoryById(id)

  if (!folder) {
    return
  }

  const newName =
    window.prompt(
      'แก้ไขชื่อโฟลเดอร์',
      folder.name,
    )

  if (newName === null) {
    return
  }

  const updated =
    customCategoryStore.updateCategory(
      id,
      newName,
    )

  if (!updated) {
    window.alert(
      'ไม่สามารถเปลี่ยนชื่อโฟลเดอร์ได้',
    )
  }
}

/*
  ลบโฟลเดอร์ทันที
  ไม่มี confirm / popup
*/
function deleteFolder(id: number) {
  customCategoryStore.deleteCategory(id)
}
</script>

<template>
  <div class="bookshelf-page">
    <!-- Main -->
    <main class="main-content">
      <!-- Page Title -->
      <div class="page-title">
        <p class="section-label">
          MY BOOKSHELF
        </p>

        <h1>
          ชั้นหนังสือของฉัน
        </h1>

        <p class="subtitle">
          มังงะที่คุณบันทึกไว้
        </p>
      </div>

      <!-- User Info -->
      <div class="user-info">
        <div class="user-text">
          <span class="welcome">
            สวัสดี
          </span>

          <strong>
            {{ authStore.username }}
          </strong>
        </div>

        <button
          type="button"
          class="logout-button"
          @click="logout"
        >
          ออกจากระบบ
        </button>
      </div>

      <!-- Folder Section -->
      <section class="folder-section">
        <div class="section-header">
          <div>
            <h2>
              โฟลเดอร์ของฉัน
            </h2>

            <p>
              จัดหมวดหมู่มังงะของคุณ
            </p>
          </div>

          <button
            type="button"
            class="create-folder-button"
            @click="openCreateFolderModal"
          >
            + สร้างโฟลเดอร์
          </button>
        </div>

        <!-- Folder List -->
        <div
          v-if="
            customCategoryStore.categories
              .length > 0
          "
          class="folder-grid"
        >
          <article
            v-for="
              folder in customCategoryStore.categories
            "
            :key="folder.id"
            class="folder-card"
          >
            <button
              type="button"
              class="folder-main"
              @click="openFolder(folder.id)"
            >
              <div class="folder-icon">
                F
              </div>

              <div class="folder-info">
                <h3>
                  {{ folder.name }}
                </h3>

                <p>
                  {{
                    folder.mangaIds.length
                  }}
                  เรื่อง
                </p>
              </div>
            </button>

            <div class="folder-actions">
              <button
                type="button"
                class="folder-edit"
                @click="
                  editFolder(folder.id)
                "
              >
                แก้ไข
              </button>

              <button
                type="button"
                class="folder-delete"
                @click="
                  deleteFolder(folder.id)
                "
              >
                ลบ
              </button>
            </div>
          </article>
        </div>

        <!-- No Folder -->
        <div
          v-else
          class="no-folder"
        >
          <h3>
            ยังไม่มีโฟลเดอร์
          </h3>

          <p>
            กดปุ่ม "สร้างโฟลเดอร์"
            เพื่อสร้างชั้นหนังสือใหม่
          </p>

          <button
            type="button"
            class="create-folder-button"
            @click="openCreateFolderModal"
          >
            + สร้างโฟลเดอร์แรก
          </button>
        </div>
      </section>

      <!-- Empty Bookshelf -->
      <section
        v-if="
          bookshelfStore.mangaList.length === 0
        "
        class="empty-bookshelf"
      >
        <div class="empty-icon">
          +
        </div>

        <h2>
          ชั้นหนังสือยังว่าง
        </h2>

        <p>
          ไปเลือกมังงะที่สนใจแล้วเพิ่มเข้าชั้นหนังสือได้เลย
        </p>

        <button
          type="button"
          class="home-button"
          @click="goHome"
        >
          ไปเลือกมังงะ
        </button>
      </section>

      <!-- Manga List -->
      <section
        v-else
        class="manga-section"
      >
        <div class="section-header">
          <div>
            <h2>
              มังงะของฉัน
            </h2>

            <p>
              มังงะที่เพิ่มไว้ในชั้นหนังสือ
            </p>
          </div>
        </div>

        <div class="manga-grid">
          <article
            v-for="
              manga in bookshelfStore.mangaList
            "
            :key="manga.id"
            class="manga-card"
          >
            <!-- Cover -->
            <button
              type="button"
              class="cover-button"
              @click="openManga(manga.id)"
            >
              <div class="cover-wrapper">
                <img
                  :src="manga.cover"
                  :alt="manga.title"
                  class="manga-cover"
                />
              </div>
            </button>

            <!-- Info -->
            <div class="manga-info">
              <h2>
                {{ manga.title }}
              </h2>

              <p>
                อ่านล่าสุดถึงตอนที่
                {{ manga.chapter }}
              </p>

              <!-- Buttons -->
              <div class="card-actions">
                <button
                  type="button"
                  class="continue-button"
                  @click="
                    continueReading(
                      manga.id,
                      manga.chapter,
                    )
                  "
                >
                  อ่านต่อ
                </button>

                <button
                  type="button"
                  class="detail-button"
                  @click="
                    openManga(manga.id)
                  "
                >
                  รายละเอียด
                </button>

                <button
                  type="button"
                  class="remove-button"
                  @click="
                    removeFromBookshelf(
                      manga.id,
                    )
                  "
                >
                  เอาออก
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-logo">
          Manga<span>Verse</span>
        </div>

        <p>
          MangaVerse — Online Manga Reading System
        </p>
      </div>
    </footer>

    <!-- =========================
         Create Folder Modal
    ========================== -->
    <div
      v-if="showCreateFolderModal"
      class="modal-overlay"
      @click.self="closeCreateFolderModal"
    >
      <div class="folder-modal">
        <div class="modal-icon">
          F
        </div>

        <h2>
          สร้างโฟลเดอร์
        </h2>

        <p class="modal-description">
          ตั้งชื่อโฟลเดอร์สำหรับจัดเก็บมังงะ
        </p>

        <input
          v-model="folderNameInput"
          type="text"
          class="folder-input"
          placeholder="เช่น มังงะที่ชอบ"
          maxlength="50"
          @keyup.enter="createFolder"
        />

        <div class="modal-actions">
          <button
            type="button"
            class="modal-cancel"
            @click="closeCreateFolderModal"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            class="modal-confirm"
            @click="createFolder"
          >
            สร้างโฟลเดอร์
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

/* ========================================
   Page
======================================== */

.bookshelf-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f7f8;
  color: #18181b;
}

/* ========================================
   Main
======================================== */

.main-content {
  width: 86%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 50px 0 70px;
  flex: 1;
}

/* ========================================
   Page Title
======================================== */

.page-title {
  margin-bottom: 25px;
}

.section-label {
  margin: 0 0 6px;
  color: #7c3aed;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.page-title h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
}

.subtitle {
  margin: 0;
  color: #777777;
  font-size: 14px;
}

/* ========================================
   User Info
======================================== */

.user-info {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding: 16px 20px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
}

.user-text {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #555555;
  font-size: 14px;
}

.user-text strong {
  color: #18181b;
  font-weight: 700;
}

.welcome {
  color: #777777;
}

/* ========================================
   Logout
======================================== */

.logout-button {
  padding: 8px 14px;
  border: 1px solid #dddddd;
  border-radius: 7px;
  background: #ffffff;
  color: #555555;
  font-size: 13px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.logout-button:hover {
  border-color: #d4d4d8;
  background: #f5f5f5;
  color: #d32f2f;
}

/* ========================================
   Section
======================================== */

.folder-section,
.manga-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}

.section-header h2 {
  margin: 0 0 5px;
  font-size: 22px;
  font-weight: 800;
}

.section-header p {
  margin: 0;
  color: #777777;
  font-size: 13px;
}

/* ========================================
   Create Folder
======================================== */

.create-folder-button {
  min-height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  background: #7c3aed;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.create-folder-button:hover {
  background: #6d28d9;
  transform: translateY(-1px);
}

/* ========================================
   Folder Grid
======================================== */

.folder-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 16px;
}

/* ========================================
   Folder Card
======================================== */

.folder-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.folder-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.06);
}

.folder-main {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: none;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
}

.folder-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #f1ecff;
  color: #7c3aed;
  font-size: 20px;
  font-weight: 800;
}

.folder-info {
  min-width: 0;
}

.folder-info h3 {
  margin: 0 0 5px;
  overflow: hidden;
  color: #18181b;
  font-size: 16px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-info p {
  margin: 0;
  color: #777777;
  font-size: 12px;
}

/* ========================================
   Folder Actions
======================================== */

.folder-actions {
  display: flex;
  gap: 7px;
  padding: 0 18px 16px;
}

.folder-actions button {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.folder-edit {
  flex: 1;
  border: 1px solid #d4d4d8;
  background: #ffffff;
  color: #555555;
}

.folder-edit:hover {
  border-color: #7c3aed;
  color: #7c3aed;
}

.folder-delete {
  border: 1px solid #f1d1d1;
  background: #ffffff;
  color: #d32f2f;
}

.folder-delete:hover {
  border-color: #d32f2f;
  background: #fff5f5;
}

/* ========================================
   No Folder
======================================== */

.no-folder {
  padding: 35px 20px;
  text-align: center;
  background: #ffffff;
  border: 1px dashed #d4d4d8;
  border-radius: 10px;
}

.no-folder h3 {
  margin: 0 0 7px;
  font-size: 17px;
}

.no-folder p {
  margin: 0 0 18px;
  color: #777777;
  font-size: 13px;
}

/* ========================================
   Manga Grid
======================================== */

.manga-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 22px;
}

/* ========================================
   Manga Card
======================================== */

.manga-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.manga-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.08);
}

/* ========================================
   Cover
======================================== */

.cover-button {
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.cover-wrapper {
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: #eeeeee;
}

.manga-cover {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition:
    transform 0.3s ease;
}

.cover-button:hover .manga-cover {
  transform: scale(1.03);
}

/* ========================================
   Manga Info
======================================== */

.manga-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 18px;
}

.manga-info h2 {
  margin: 0 0 8px;
  color: #18181b;
  font-size: 19px;
  font-weight: 700;
}

.manga-info p {
  margin: 0 0 18px;
  color: #777777;
  font-size: 13px;
  line-height: 1.5;
}

/* ========================================
   Card Actions
======================================== */

.card-actions {
  display: flex;
  gap: 7px;
  margin-top: auto;
}

.card-actions button {
  flex: 1;
  min-height: 38px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

/* ========================================
   Continue
======================================== */

.continue-button {
  border: none;
  background: #7c3aed;
  color: #ffffff;
}

.continue-button:hover {
  background: #6d28d9;
}

/* ========================================
   Detail
======================================== */

.detail-button {
  border: 1px solid #d4d4d8;
  background: #ffffff;
  color: #555555;
}

.detail-button:hover {
  border-color: #7c3aed;
  color: #7c3aed;
}

/* ========================================
   Remove
======================================== */

.remove-button {
  border: 1px solid #f1d1d1;
  background: #ffffff;
  color: #d32f2f;
}

.remove-button:hover {
  border-color: #d32f2f;
  background: #fff5f5;
}

/* ========================================
   Empty
======================================== */

.empty-bookshelf {
  padding: 70px 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
}

.empty-icon {
  width: 60px;
  height: 60px;
  margin-bottom: 18px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f1ecff;
  color: #7c3aed;
  font-size: 30px;
  font-weight: 400;
}

.empty-bookshelf h2 {
  margin: 0 0 8px;
  font-size: 22px;
}

.empty-bookshelf p {
  margin: 0 0 22px;
  color: #888888;
  font-size: 14px;
}

.home-button {
  min-height: 42px;
  padding: 0 20px;
  border: none;
  border-radius: 8px;
  background: #7c3aed;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.home-button:hover {
  background: #6d28d9;
}

/* ========================================
   Create Folder Modal
======================================== */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(24, 24, 27, 0.45);
  backdrop-filter: blur(3px);
}

.folder-modal {
  width: 100%;
  max-width: 430px;
  padding: 30px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.modal-icon {
  width: 58px;
  height: 58px;
  margin: 0 auto 16px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: #f1ecff;
  color: #7c3aed;
  font-size: 24px;
  font-weight: 800;
}

.folder-modal h2 {
  margin: 0 0 8px;
  color: #18181b;
  font-size: 23px;
  font-weight: 800;
}

.modal-description {
  margin: 0 0 22px;
  color: #777777;
  font-size: 13px;
}

.folder-input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  outline: none;
  background: #ffffff;
  color: #18181b;
  font-family: inherit;
  font-size: 14px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.folder-input::placeholder {
  color: #a1a1aa;
}

.folder-input:focus {
  border-color: #7c3aed;
  box-shadow:
    0 0 0 3px rgba(124, 58, 237, 0.12);
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}

.modal-actions button {
  flex: 1;
  height: 42px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.modal-cancel {
  border: 1px solid #d4d4d8;
  background: #ffffff;
  color: #555555;
}

.modal-cancel:hover {
  background: #f5f5f5;
}

.modal-confirm {
  border: 1px solid #7c3aed;
  background: #7c3aed;
  color: #ffffff;
}

.modal-confirm:hover {
  border-color: #6d28d9;
  background: #6d28d9;
}

/* ========================================
   Footer
======================================== */

.footer {
  margin-top: 20px;
  padding: 35px 0;
  background: #18181b;
  color: #aaaaaa;
}

.footer-inner {
  width: 86%;
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-logo {
  color: #ffffff;
  font-size: 25px;
  font-weight: 800;
}

.footer-logo span {
  color: #7c3aed;
}

.footer p {
  margin: 0;
  font-size: 13px;
}

/* ========================================
   Responsive
======================================== */

@media (max-width: 1000px) {
  .main-content,
  .footer-inner {
    width: 92%;
  }

  .folder-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .manga-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 18px;
  }
}

@media (max-width: 700px) {
  .main-content {
    width: 92%;
    padding-top: 35px;
  }

  .page-title h1 {
    font-size: 28px;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .create-folder-button {
    width: 100%;
  }

  .folder-grid {
    grid-template-columns: 1fr;
  }

  .manga-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .manga-info {
    padding: 13px;
  }

  .manga-info h2 {
    font-size: 16px;
  }

  .manga-info p {
    font-size: 12px;
  }

  .card-actions {
    flex-direction: column;
    gap: 7px;
  }

  .card-actions button {
    width: 100%;
  }

  .user-info {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .logout-button {
    width: 100%;
  }

  .folder-modal {
    padding: 25px 20px;
  }
}

@media (max-width: 420px) {
  .main-content {
    width: 94%;
    padding-top: 30px;
  }

  .page-title h1 {
    font-size: 25px;
  }

  .manga-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .manga-info {
    padding: 11px;
  }

  .manga-info h2 {
    font-size: 15px;
  }

  .manga-info p {
    font-size: 11px;
  }

  .card-actions button {
    min-height: 36px;
    font-size: 12px;
  }

  .footer-inner {
    width: 94%;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>