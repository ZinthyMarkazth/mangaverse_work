<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { MangaService } from '@/services/MangaService'

const route = useRoute()

const mangaService = new MangaService()
void mangaService.ready.catch((error) => console.error('โหลดมังงะไม่สำเร็จ', error))

// ========================================
// Search
// ========================================

const searchText = ref(
  String(route.query.search ?? ''),
)

// ========================================
// Category
// ========================================

const selectedCategory =
  ref('ทั้งหมด')

// ========================================
// Manga Data
// ========================================

const mangaList = computed(() => {
  return mangaService.getAllManga()
})

// ========================================
// Parse Categories
// แยก "Action, Fantasy, Romance"
// ออกเป็น ["Action", "Fantasy", "Romance"]
// ========================================

function parseCategories(
  category: string,
): string[] {
  return category
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

// ========================================
// Category List
// ========================================

const categories = computed(() => {
  const categorySet =
    new Set<string>()

  mangaList.value.forEach(
    (manga) => {
      const mangaCategories =
        parseCategories(
          manga.category,
        )

      mangaCategories.forEach(
        (category) => {
          categorySet.add(
            category,
          )
        },
      )
    },
  )

  return [
    'ทั้งหมด',
    ...Array.from(
      categorySet,
    ).sort((a, b) =>
      a.localeCompare(
        b,
        'en',
        {
          sensitivity:
            'base',
        },
      ),
    ),
  ]
})

// ========================================
// Filter Manga
// ========================================

const filteredManga =
  computed(() => {
    const keyword =
      searchText.value
        .trim()
        .toLowerCase()

    return mangaList.value.filter(
      (manga) => {
        // -------------------------------
        // Search
        // -------------------------------

        const matchSearch =
          !keyword ||
          manga.title
            .toLowerCase()
            .includes(keyword) ||
          manga.author
            .toLowerCase()
            .includes(keyword) ||
          manga.category
            .toLowerCase()
            .includes(keyword)

        // -------------------------------
        // Category
        // -------------------------------

        const mangaCategories =
          parseCategories(
            manga.category,
          )

        const matchCategory =
          selectedCategory.value ===
            'ทั้งหมด' ||
          mangaCategories.some(
            (category) =>
              category.toLowerCase() ===
              selectedCategory.value.toLowerCase(),
          )

        return (
          matchSearch &&
          matchCategory
        )
      },
    )
  })

// ========================================
// Display Categories
// ========================================

function displayCategories(
  category: string,
): string[] {
  return parseCategories(
    category,
  )
}
</script>

<template>
  <div class="category-page">

    <main class="main-content">

      <!-- ========================================
           Header
      ======================================== -->

      <section
        class="page-header"
      >

        <p
          class="section-label"
        >
          MANGA COLLECTION
        </p>

        <h1>
          มังงะทั้งหมด
        </h1>

        <p>
          ค้นหาและเลือกมังงะที่คุณต้องการอ่าน
        </p>

      </section>

      <!-- ========================================
           Search
      ======================================== -->

      <section
        class="search-section"
      >

        <input
          v-model="searchText"
          type="text"
          placeholder="ค้นหาชื่อเรื่อง ผู้เขียน หรือหมวดหมู่..."
        />

      </section>

      <!-- ========================================
           Category Filter
      ======================================== -->

      <section
        class="category-filter"
      >

        <button
          v-for="category in categories"
          :key="category"
          type="button"
          :class="{
            active:
              selectedCategory ===
              category,
          }"
          @click="
            selectedCategory =
              category
          "
        >
          {{ category }}
        </button>

      </section>

      <!-- ========================================
           Result Header
      ======================================== -->

      <section
        class="result-header"
      >

        <h2>
          มังงะ
        </h2>

        <span>
          {{ filteredManga.length }}
          เรื่อง
        </span>

      </section>

      <!-- ========================================
           Manga Grid
      ======================================== -->

      <section
        v-if="
          filteredManga.length > 0
        "
        class="manga-grid"
      >

        <RouterLink
          v-for="
            manga in filteredManga
          "
          :key="manga.id"
          :to="`/manga/${manga.id}`"
          class="manga-card"
        >

          <!-- Cover -->

          <div
            class="cover-wrapper"
          >

            <img
              :src="manga.cover"
              :alt="manga.title"
              class="cover"
            />

          </div>

          <!-- Card Content -->

          <div
            class="card-content"
          >

            <!-- แสดงแต่ละหมวดแยกกัน -->

            <div
              class="category-list"
            >

              <span
                v-for="
                  category in
                  displayCategories(
                    manga.category,
                  )
                "
                :key="category"
                class="category"
              >
                {{ category }}
              </span>

            </div>

            <h3>
              {{ manga.title }}
            </h3>

            <p>
              {{ manga.author }}
            </p>

            <small>
              ตอนล่าสุด
              {{ manga.latestChapter }}
            </small>

          </div>

        </RouterLink>

      </section>

      <!-- ========================================
           Empty Result
      ======================================== -->

      <section
        v-else
        class="empty-result"
      >

        <h2>
          ไม่พบมังงะ
        </h2>

        <p>
          ลองค้นหาด้วยชื่อเรื่อง
          ผู้เขียน หรือหมวดหมู่อื่น
        </p>

      </section>

    </main>

  </div>
</template>

<style scoped>
/* ========================================
   Category Page
======================================== */

.category-page {
  min-height: 100vh;

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

  padding: 45px 0 70px;
}

/* ========================================
   Page Header
======================================== */

.page-header {
  margin-bottom: 30px;
}

.section-label {
  margin: 0 0 7px;

  color: #7c3aed;

  font-size: 12px;

  font-weight: 700;

  letter-spacing: 1.5px;
}

.page-header h1 {
  margin: 0 0 8px;

  color: #18181b;

  font-size: 38px;

  font-weight: 800;
}

.page-header p:last-child {
  margin: 0;

  color: #777777;

  font-size: 14px;
}

/* ========================================
   Search
======================================== */

.search-section {
  margin-bottom: 20px;
}

.search-section input {
  width: 100%;

  height: 46px;

  box-sizing: border-box;

  padding: 0 15px;

  border: 1px solid #d4d4d8;

  border-radius: 9px;

  outline: none;

  background: #ffffff;

  color: #18181b;

  font-size: 14px;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-section input:focus {
  border-color: #7c3aed;

  box-shadow:
    0 0 0 3px
    rgba(124, 58, 237, 0.08);
}

.search-section input::placeholder {
  color: #999999;
}

/* ========================================
   Category Filter
======================================== */

.category-filter {
  display: flex;

  flex-wrap: wrap;

  gap: 8px;

  margin-bottom: 35px;
}

.category-filter button {
  padding: 9px 16px;

  border: 1px solid #d4d4d8;

  border-radius: 8px;

  background: #ffffff;

  color: #555555;

  font-size: 13px;

  cursor: pointer;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.category-filter button:hover {
  border-color: #7c3aed;

  color: #7c3aed;
}

.category-filter button.active {
  border-color: #7c3aed;

  background: #7c3aed;

  color: #ffffff;
}

/* ========================================
   Result Header
======================================== */

.result-header {
  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 18px;
}

.result-header h2 {
  margin: 0;

  color: #18181b;

  font-size: 24px;

  font-weight: 800;
}

.result-header span {
  color: #777777;

  font-size: 13px;
}

/* ========================================
   Manga Grid
======================================== */

.manga-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 20px;
}

/* ========================================
   Manga Card
======================================== */

.manga-card {
  overflow: hidden;

  border: 1px solid #e5e5e5;

  border-radius: 12px;

  background: #ffffff;

  color: inherit;

  text-decoration: none;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.manga-card:hover {
  transform: translateY(-3px);

  box-shadow:
    0 8px 25px
    rgba(0, 0, 0, 0.08);
}

/* ========================================
   Cover
======================================== */

.cover-wrapper {
  aspect-ratio: 3 / 4;

  overflow: hidden;

  background: #eeeeee;
}

.cover {
  width: 100%;

  height: 100%;

  display: block;

  object-fit: cover;
}

/* ========================================
   Card Content
======================================== */

.card-content {
  padding: 15px;
}

/* ========================================
   Category List
======================================== */

.category-list {
  display: flex;

  flex-wrap: wrap;

  gap: 5px;

  margin-bottom: 7px;
}

.category {
  display: inline-block;

  padding: 4px 7px;

  border-radius: 5px;

  background: #ede9fe;

  color: #7c3aed;

  font-size: 10px;

  font-weight: 700;
}

.card-content h3 {
  margin: 6px 0;

  color: #18181b;

  font-size: 17px;

  font-weight: 700;
}

.card-content p {
  margin: 0 0 5px;

  color: #777777;

  font-size: 12px;
}

.card-content small {
  color: #999999;

  font-size: 11px;
}

/* ========================================
   Empty Result
======================================== */

.empty-result {
  padding: 70px 20px;

  text-align: center;

  border: 1px dashed #d4d4d8;

  border-radius: 12px;

  background: #ffffff;
}

.empty-result h2 {
  margin: 0 0 8px;

  color: #18181b;

  font-size: 20px;
}

.empty-result p {
  margin: 0;

  color: #777777;

  font-size: 14px;
}

/* ========================================
   Responsive
======================================== */

@media (max-width: 1000px) {
  .main-content {
    width: 92%;
  }

  .manga-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

/* ========================================
   Tablet
======================================== */

@media (max-width: 700px) {
  .manga-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .page-header h1 {
    font-size: 32px;
  }
}

/* ========================================
   Mobile
======================================== */

@media (max-width: 450px) {
  .manga-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 29px;
  }
}
</style>