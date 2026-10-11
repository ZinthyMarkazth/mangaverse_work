<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Search
const searchText = ref('')

// ซ่อน Navbar ในหน้า Admin
const isAdminPage = computed(() => {
  return route.path.startsWith('/admin')
})

// ตรวจสอบเมนูที่กำลังเปิดอยู่
const isHomeActive = computed(() => {
  return route.path === '/'
})

const isCategoryActive = computed(() => {
  return route.path.startsWith('/category')
})

const isBookshelfActive = computed(() => {
  return route.path.startsWith('/bookshelf')
})

// ไปหน้าหลัก
function goHome() {
  router.push('/')
}

// ไปหน้าหมวดหมู่
function goCategory() {
  router.push('/category')
}

// ไปหน้าชั้นหนังสือ
function goBookshelf() {
  router.push('/bookshelf')
}

// ไปหน้า Login
function goLogin() {
  router.push('/login')
}

// ไปหน้า Admin
function goAdmin() {
  router.push('/admin')
}

// ค้นหามังงะ
function searchManga() {
  const keyword = searchText.value.trim()

  if (!keyword) {
    router.push('/category')
    return
  }

  router.push({
    path: '/category',
    query: {
      search: keyword,
    },
  })
}

// ออกจากระบบ
function logout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <header
    v-if="!isAdminPage"
    class="user-navbar"
  >
    <div class="navbar-inner">

      <!-- Logo -->
      <button
        class="logo"
        type="button"
        @click="goHome"
      >
        Manga<span>Verse</span>
      </button>

      <!-- เมนูหลัก -->
      <nav class="nav-menu">

        <button
          type="button"
          class="nav-link"
          :class="{ active: isHomeActive }"
          @click="goHome"
        >
          หน้าแรก
        </button>

        <button
          type="button"
          class="nav-link"
          :class="{ active: isCategoryActive }"
          @click="goCategory"
        >
          หมวดหมู่
        </button>

        <button
          type="button"
          class="nav-link"
          :class="{ active: isBookshelfActive }"
          @click="goBookshelf"
        >
          ชั้นหนังสือ
        </button>

      </nav>

      <!-- ด้านขวา -->
      <div class="navbar-right">

        <!-- Search -->
        <div class="search-box">
          <input
            v-model="searchText"
            type="text"
            placeholder="ค้นหามังงะ..."
            @keyup.enter="searchManga"
          />
        </div>

        <!-- ยังไม่ได้ Login -->
        <button
          v-if="!authStore.isLoggedIn"
          type="button"
          class="login-button"
          @click="goLogin"
        >
          เข้าสู่ระบบ
        </button>

        <!-- Login แล้ว -->
        <div
          v-else
          class="user-menu"
        >

          <!-- แสดงเฉพาะ Admin -->
          <button
            v-if="authStore.isAdmin"
            type="button"
            class="admin-button"
            @click="goAdmin"
          >
            admin
          </button>

          <!-- ออกจากระบบ -->
          <button
            type="button"
            class="logout-button"
            @click="logout"
          >
            ออกจากระบบ
          </button>

        </div>

      </div>

    </div>
  </header>
</template>

<style scoped>
/* ========================================
   Navbar
======================================== */

.user-navbar {
  width: 100%;
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* ========================================
   Navbar Inner
======================================== */

.navbar-inner {
  width: 92%;
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 28px;
}

/* ========================================
   Logo
======================================== */

.logo {
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 28px;
  font-weight: 800;
  color: #111111;
  cursor: pointer;
  white-space: nowrap;
}

.logo span {
  color: #7c3aed;
}

.logo:hover {
  opacity: 0.9;
}

/* ========================================
   Menu
======================================== */

.nav-menu {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}

.nav-link {
  position: relative;
  padding: 8px 3px;
  border: none;
  background: transparent;
  color: #555555;
  font-size: 15px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #7c3aed;
}

.nav-link.active {
  color: #7c3aed;
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: #7c3aed;
  border-radius: 2px;
}

/* ========================================
   ด้านขวา
======================================== */

.navbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* ========================================
   Search
======================================== */

.search-box {
  display: flex;
  align-items: center;
}

.search-box input {
  width: 215px;
  height: 42px;
  padding: 0 14px;
  border: 1px solid #d8d8d8;
  border-radius: 9px;
  outline: none;
  font-size: 14px;
  color: #333333;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-box input:focus {
  border-color: #7c3aed;
  box-shadow:
    0 0 0 3px rgba(124, 58, 237, 0.08);
}

.search-box input::placeholder {
  color: #999999;
}

/* ========================================
   Login
======================================== */

.login-button {
  height: 42px;
  padding: 0 20px;
  border: none;
  border-radius: 9px;
  background: #7c3aed;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.login-button:hover {
  background: #6d28d9;
  transform: translateY(-1px);
}

/* ========================================
   User Menu
======================================== */

.user-menu {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* ========================================
   Admin Button
======================================== */

.admin-button {
  padding: 6px 0;
  border: none;
  background: transparent;
  color: #7c3aed;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.admin-button:hover {
  color: #6d28d9;
  text-decoration: underline;
}

/* ========================================
   Logout
======================================== */

.logout-button {
  padding: 6px 0;
  border: none;
  background: transparent;
  color: #777777;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.logout-button:hover {
  color: #d32f2f;
}

/* ========================================
   Responsive
======================================== */

@media (max-width: 1100px) {
  .navbar-inner {
    width: 94%;
    gap: 20px;
  }

  .nav-menu {
    gap: 18px;
  }

  .search-box input {
    width: 180px;
  }
}

@media (max-width: 850px) {
  .navbar-inner {
    width: 94%;
    gap: 16px;
  }

  .logo {
    font-size: 24px;
  }

  .nav-menu {
    gap: 12px;
  }

  .nav-link {
    font-size: 14px;
  }

  .search-box input {
    width: 150px;
  }

  .login-button {
    padding: 0 14px;
  }
}

@media (max-width: 700px) {
  .user-navbar {
    height: auto;
  }

  .navbar-inner {
    width: 92%;
    min-height: 64px;
    padding: 10px 0;
    flex-wrap: wrap;
    gap: 8px;
  }

  .logo {
    font-size: 23px;
  }

  .navbar-right {
    margin-left: auto;
  }

  .search-box {
    display: none;
  }

  .nav-menu {
    order: 3;
    width: 100%;
    justify-content: center;
    padding-top: 4px;
    gap: 25px;
  }
}

@media (max-width: 450px) {
  .navbar-inner {
    width: 92%;
  }

  .logo {
    font-size: 21px;
  }

  .login-button {
    height: 38px;
    padding: 0 13px;
    font-size: 13px;
  }

  .nav-link {
    font-size: 13px;
  }

  .nav-menu {
    gap: 18px;
  }
}
</style>