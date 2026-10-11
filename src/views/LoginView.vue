<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const busy = ref(false)

onMounted(() => { void authStore.initialize() })

async function login() {
  errorMessage.value = ''
  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'กรุณากรอกอีเมลและรหัสผ่าน'
    return
  }
  if (!isSupabaseConfigured) {
    errorMessage.value = 'ยังไม่ได้ตั้งค่า Supabase กรุณาตั้งค่าไฟล์ .env.local ก่อน'
    return
  }
  busy.value = true
  try {
    await authStore.login(email.value, password.value)
    await router.push(authStore.isAdmin ? '/admin' : '/')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ'
  } finally {
    busy.value = false
  }
}

function goRegister() { void router.push('/register') }
</script>


<template>

  <div class="login-page">

    <!-- Login -->

    <main class="login-container">

      <div class="login-card">

        <h1>
          เข้าสู่ระบบ
        </h1>


        <p class="subtitle">
          เข้าสู่ระบบเพื่อใช้งาน Bookshelf
          และฟีเจอร์สำหรับสมาชิก
        </p>


        <form
          @submit.prevent="login"
        >

          <!-- Email -->

          <div class="form-group">

            <label for="email">
              อีเมล
            </label>

            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="กรอกอีเมลของคุณ"
            />

          </div>


          <!-- Password -->

          <div class="form-group">

            <label for="password">
              รหัสผ่าน
            </label>

            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="กรอกรหัสผ่าน"
            />

          </div>


          <!-- Error -->

          <p
            v-if="errorMessage"
            class="error-message"
          >
            {{ errorMessage }}
          </p>


          <!-- Login Button -->

          <button
            type="submit"
            class="login-button"
            :disabled="busy"
          >
            เข้าสู่ระบบ
          </button>

        </form>


        <!-- Register -->

        <div class="register-section">

          <span>
            ยังไม่มีบัญชี?
          </span>

          <button
            type="button"
            class="register-button"
            @click="goRegister"
          >
            สมัครสมาชิก
          </button>

        </div>

      </div>

    </main>


    <!-- Footer -->

    <footer class="footer">

      <p>
        © 2026 MangaVerse
      </p>

    </footer>

  </div>

</template>


<style scoped>

/* ========================================
   Global
======================================== */

* {
  box-sizing: border-box;
}


/* ========================================
   Page
======================================== */

.login-page {
  min-height: calc(100vh - 72px);

  display: flex;
  flex-direction: column;

  background: #f5f5f5;
}


/* ========================================
   Main
======================================== */

.login-container {
  flex: 1;

  display: flex;

  justify-content: center;
  align-items: center;

  padding: 50px 20px;
}


/* ========================================
   Login Card
======================================== */

.login-card {
  width: 100%;
  max-width: 430px;

  background: #ffffff;

  padding: 40px;

  border-radius: 16px;

  box-shadow:
    0 8px 30px
    rgba(0, 0, 0, 0.08);
}


.login-card h1 {
  margin: 0;

  text-align: center;

  font-size: 30px;

  color: #222;
}


/* ========================================
   Subtitle
======================================== */

.subtitle {
  margin: 12px 0 30px;

  text-align: center;

  color: #777;

  font-size: 14px;

  line-height: 1.6;
}


/* ========================================
   Form
======================================== */

.form-group {
  margin-bottom: 20px;
}


.form-group label {
  display: block;

  margin-bottom: 8px;

  font-size: 14px;

  font-weight: 600;

  color: #333;
}


.form-group input {
  width: 100%;

  padding: 13px 14px;

  border: 1px solid #d8d8d8;

  border-radius: 8px;

  font-size: 15px;

  outline: none;

  transition:
    border-color 0.2s;
}


.form-group input:focus {
  border-color: #7c3aed;
}


.form-group input::placeholder {
  color: #aaa;
}


/* ========================================
   Error
======================================== */

.error-message {
  margin: -5px 0 15px;

  color: #d32f2f;

  font-size: 14px;
}


/* ========================================
   Login Button
======================================== */

.login-button {
  width: 100%;

  padding: 14px;

  border: none;

  border-radius: 8px;

  background: #222;

  color: #ffffff;

  font-size: 16px;

  font-weight: 600;

  cursor: pointer;

  transition:
    background 0.2s;
}


.login-button:hover {
  background: #444;
}


/* ========================================
   Register
======================================== */

.register-section {
  margin-top: 25px;

  padding-top: 22px;

  border-top: 1px solid #eeeeee;

  display: flex;

  justify-content: center;

  align-items: center;

  gap: 6px;

  font-size: 14px;

  color: #777;
}


.register-button {
  border: none;

  background: transparent;

  color: #222;

  font-size: 14px;

  font-weight: 600;

  cursor: pointer;
}


.register-button:hover {
  text-decoration: underline;
}


/* ========================================
   Footer
======================================== */

.footer {
  padding: 20px;

  text-align: center;

  color: #888;

  font-size: 13px;
}


/* ========================================
   Mobile
======================================== */

@media (max-width: 600px) {

  .login-container {
    padding: 30px 16px;
  }


  .login-card {
    padding: 30px 22px;
  }


  .login-card h1 {
    font-size: 26px;
  }

}

</style>