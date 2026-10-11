<script setup lang="ts">

import { ref, onMounted } from 'vue'

import { MangaService } from '@/services/MangaService'

import type { Manga } from '../models/Manga'

const mangaService = new MangaService()

const mangaList = ref<Manga[]>([])

function loadManga() {
  mangaList.value = mangaService.getAllManga()
}

onMounted(async () => {
  try {
    await mangaService.ready
    loadManga()
  } catch (error) {
    console.error('โหลดรายการมังงะไม่สำเร็จ', error)
  }
})

</script>

<template>
  <div class="home">

    <!-- Hero -->
    <section class="hero">
      <div class="page-container hero-inner">
        <div class="hero-content">
          <p class="small-title">
            WELCOME TO MANGAVERSE
          </p>

          <h1>
            อ่านมังงะที่คุณชอบ<br />
            ได้ทุกที่ ทุกเวลา
          </h1>

          <p class="description">
            เว็บไซต์อ่านมังงะออนไลน์
            พร้อมระบบค้นหา ชั้นหนังสือ
            และติดตามตอนล่าสุดที่อ่าน
          </p>

          <div class="hero-buttons">
            <RouterLink
              to="/bookshelf"
              class="primary-btn"
            >
              เริ่มอ่านมังงะ
            </RouterLink>

            <RouterLink
              to="/category"
              class="secondary-btn"
            >
              ดูมังงะทั้งหมด
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Main -->
    <main class="page-container main-content">

      <!-- Recommended -->
      <section class="section">
        <div class="section-header">
          <div>
            <p class="section-label">
              RECOMMENDED
            </p>

            <h2>
              มังงะแนะนำ
            </h2>
          </div>

          <RouterLink
            to="/category"
            class="view-all"
          >
            ดูทั้งหมด →
          </RouterLink>
        </div>

        <!-- Manga Grid -->
        <div class="manga-grid">

          <RouterLink
            v-for="manga in mangaList"
            :key="manga.id"
            :to="`/manga/${manga.id}`"
            class="manga-card"
          >
            <div class="cover-wrapper">
              <img
                :src="manga.cover"
                :alt="manga.title"
                class="cover"
              />
            </div>

            <div class="card-content">
              <span class="category">
                {{ manga.category }}
              </span>

              <h3>
                {{ manga.title }}
              </h3>

              <p>
                ตอนล่าสุด {{ manga.latestChapter }}
              </p>
            </div>
          </RouterLink>

        </div>
      </section>

      <!-- Latest Update -->
      <section class="section latest-section">
        <div class="section-header">
          <div>
            <p class="section-label">
              LATEST UPDATE
            </p>

            <h2>
              อัปเดตล่าสุด
            </h2>
          </div>
        </div>

        <div class="latest-list">

          <!-- กดทั้งกรอบ -->
          <RouterLink
            v-for="manga in mangaList"
            :key="`latest-${manga.id}`"
            :to="`/manga/${manga.id}`"
            class="latest-item"
          >
            <img
              :src="manga.cover"
              :alt="manga.title"
            />

            <div class="latest-info">
              <h3>
                {{ manga.title }}
              </h3>

              <p>
                {{ manga.category }}

                <span>·</span>

                {{ manga.status }}
              </p>
            </div>

            <span class="read-btn">
              อ่าน
            </span>
          </RouterLink>

        </div>
      </section>

    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="page-container footer-inner">

        <div class="footer-logo">
          Manga<span>Verse</span>
        </div>

        <p>
          MangaVerse — Online Manga Reading System
        </p>

      </div>
    </footer>

  </div>
</template>

<style scoped>
/* ========================================
   Home
======================================== */

.home {
  min-height: 100vh;
  background: #f7f7f8;
  color: #18181b;
}

/* ========================================
   Container
======================================== */

.page-container {
  width: 86%;
  max-width: 1300px;
  margin: 0 auto;
}

/* ========================================
   Hero
======================================== */

.hero {
  min-height: 430px;
  display: flex;
  align-items: center;
  background:
    linear-gradient(
      90deg,
      #18181b 0%,
      #27272a 60%,
      #3f3f46 100%
    );
  color: #ffffff;
}

.hero-inner {
  display: flex;
  align-items: center;
}

.hero-content {
  max-width: 650px;
  padding: 70px 0;
}

.small-title {
  margin: 0 0 14px;
  color: #a78bfa;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
}

.hero h1 {
  margin: 0;
  font-size: 48px;
  font-weight: 800;
  line-height: 1.2;
}

.description {
  max-width: 560px;
  margin: 18px 0 0;
  color: #d4d4d8;
  font-size: 15px;
  line-height: 1.7;
}

/* ========================================
   Hero Buttons
======================================== */

.hero-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
}

.primary-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.primary-btn {
  background: #7c3aed;
  color: #ffffff;
}

.primary-btn:hover {
  background: #6d28d9;
  transform: translateY(-1px);
}

.secondary-btn {
  border: 1px solid #71717a;
  background: transparent;
  color: #ffffff;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* ========================================
   Main
======================================== */

.main-content {
  padding-bottom: 50px;
}

/* ========================================
   Section
======================================== */

.section {
  padding-top: 55px;
}

.latest-section {
  padding-top: 65px;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 25px;
}

.section-label {
  margin: 0 0 6px;
  color: #7c3aed;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.section-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
}

.view-all {
  color: #7c3aed;
  font-size: 14px;
  text-decoration: none;
}

.view-all:hover {
  text-decoration: underline;
}

/* ========================================
   Manga Grid
======================================== */

.manga-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 22px;
}

.manga-card {
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.manga-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.08);
}

.cover-wrapper {
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: #eeeeee;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.manga-card:hover .cover {
  transform: scale(1.03);
}

.card-content {
  padding: 15px;
}

.category {
  color: #7c3aed;
  font-size: 12px;
  font-weight: 600;
}

.card-content h3 {
  margin: 7px 0;
  font-size: 18px;
  font-weight: 700;
}

.card-content p {
  margin: 0;
  color: #777777;
  font-size: 13px;
}

/* ========================================
   Latest
======================================== */

.latest-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.latest-item {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.latest-item:hover {
  transform: translateY(-2px);
  box-shadow:
    0 6px 18px rgba(0, 0, 0, 0.07);
}

.latest-item img {
  width: 65px;
  height: 80px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 6px;
  display: block;
}

.latest-info {
  flex: 1;
  min-width: 0;
}

.latest-info h3 {
  margin: 0 0 6px;
  font-size: 17px;
}

.latest-info p {
  margin: 0;
  color: #777777;
  font-size: 13px;
}

.latest-info p span {
  margin: 0 5px;
}

/* ========================================
   Read Button
======================================== */

.read-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 18px;
  background: #7c3aed;
  color: #ffffff;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
}

.latest-item:hover .read-btn {
  background: #6d28d9;
}

/* ========================================
   Footer
======================================== */

.footer {
  margin-top: 40px;
  padding: 35px 0;
  background: #18181b;
  color: #aaaaaa;
}

.footer-inner {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-logo {
  font-size: 25px;
  font-weight: 800;
  color: #ffffff;
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
  .page-container {
    width: 92%;
  }

  .manga-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .hero h1 {
    font-size: 42px;
  }
}

@media (max-width: 650px) {
  .page-container {
    width: 92%;
  }

  .hero {
    min-height: auto;
  }

  .hero-content {
    padding: 55px 0;
  }

  .hero h1 {
    font-size: 34px;
  }

  .description {
    font-size: 14px;
  }

  .hero-buttons {
    flex-direction: column;
    align-items: flex-start;
  }

  .manga-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .cover-wrapper {
    height: 220px;
  }

  .card-content {
    padding: 12px;
  }

  .card-content h3 {
    font-size: 16px;
  }

  .latest-item {
    gap: 10px;
  }

  .latest-item img {
    width: 55px;
    height: 70px;
  }

  .read-btn {
    padding: 0 13px;
  }
}

@media (max-width: 420px) {
  .hero h1 {
    font-size: 30px;
  }

  .section-header h2 {
    font-size: 24px;
  }

  .cover-wrapper {
    height: 190px;
  }

  .latest-info h3 {
    font-size: 15px;
  }

  .latest-info p {
    font-size: 12px;
  }
}
</style>