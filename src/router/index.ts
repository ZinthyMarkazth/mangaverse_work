import SupabaseTestView from '../views/SupabaseTestView.vue'
import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import MangaView from '@/views/MangaView.vue'
import ReadingView from '@/views/ReadingView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import BookshelfView from '@/views/BookshelfView.vue'
import CustomCategoryView from '@/views/CustomCategoryView.vue'
import AdminView from '@/views/AdminView.vue'
import AdminMangaView from '@/views/AdminMangaView.vue'
import CategoryView from '@/views/CategoryView.vue'

import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
  path: '/supabase-test',
  name: 'supabase-test',
  component: SupabaseTestView,
    },

    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

    {
      path: '/manga/:id',
      name: 'manga',
      component: MangaView,
    },

    {
      path: '/manga/:id/chapter/:chapter',
      name: 'reading',
      component: ReadingView,
    },

    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },

    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },

    {
      path: '/bookshelf',
      name: 'bookshelf',
      component: BookshelfView,
      meta: {
        requiresAuth: true,
      },
    },

    // โฟลเดอร์ใน Bookshelf
    {
      path: '/bookshelf/category/:id',
      name: 'custom-category',
      component: CustomCategoryView,
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: {
        requiresAdmin: true,
      },
    },

    {
      path: '/admin/manga/:id',
      name: 'admin-manga',
      component: AdminMangaView,
      meta: {
        requiresAdmin: true,
      },
    },

    {
      path: '/category',
      name: 'category',
      component: CategoryView,
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  await authStore.initialize()

  // หน้าที่ต้อง Login
  if (
    to.meta.requiresAuth &&
    !authStore.isLoggedIn
  ) {
    return {
      name: 'login',
    }
  }

  // หน้าที่ต้องเป็น Admin
  if (
    to.meta.requiresAdmin &&
    !authStore.isAdmin
  ) {
    if (!authStore.isLoggedIn) {
      return {
        name: 'login',
      }
    }

    alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้')

    return {
      name: 'home',
    }
  }

  return true
})

export default router
