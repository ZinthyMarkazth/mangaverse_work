<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

const router = useRouter()
const authStore = useAuthStore()
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const busy = ref(false)

onMounted(() => { void authStore.initialize() })

async function register() {
  errorMessage.value = ''
  successMessage.value = ''
  if (!username.value.trim() || !email.value.trim() || !password.value || !confirmPassword.value) {
    errorMessage.value = 'กรุณากรอกข้อมูลให้ครบทุกช่อง'
    return
  }
  if (password.value.length < 8) {
    errorMessage.value = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'รหัสผ่านไม่ตรงกัน'
    return
  }
  if (!isSupabaseConfigured) {
    errorMessage.value = 'ยังไม่ได้ตั้งค่า Supabase กรุณาตั้งค่าไฟล์ .env.local ก่อน'
    return
  }
  busy.value = true
  try {
    const result = await authStore.register(email.value, password.value, username.value)
    if (result.needsEmailConfirmation) {
      successMessage.value = 'สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ'
    } else {
      await router.push('/')
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'สมัครสมาชิกไม่สำเร็จ'
  } finally {
    busy.value = false
  }
}

function goLogin() { void router.push('/login') }
</script>

<template>
  <div class="register-page">

    <!-- Register -->
    <main class="register-container">
      <div class="register-card">
        <h1>สมัครสมาชิก</h1>

        <p class="subtitle">
          สร้างบัญชี MangaVerse เพื่อใช้งานฟีเจอร์สำหรับสมาชิก
        </p>

        <form @submit.prevent="register">
          <!-- Username -->
          <div class="form-group">
            <label for="username">ชื่อผู้ใช้</label>

            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="กรอกชื่อผู้ใช้"
            />
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email">อีเมล</label>

            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="กรอกอีเมลของคุณ"
            />
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password">รหัสผ่าน</label>

            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="กรอกรหัสผ่านอย่างน้อย 6 ตัวอักษร"
            />
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label for="confirm-password">ยืนยันรหัสผ่าน</label>

            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
            />
          </div>

          <!-- Error -->
          <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
          <p v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </p>

          <!-- Register Button -->
          <button type="submit" class="register-main-button" :disabled="busy">
            สมัครสมาชิก
          </button>
        </form>

        <!-- Login -->
        <div class="login-section">
          <span>มีบัญชีอยู่แล้ว?</span>

          <button class="login-button" @click="goLogin">
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2026 MangaVerse</p>
    </footer>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.register-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* Main */
.register-container {
  flex: 1;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 50px 20px;
}

.register-card {
  width: 100%;
  max-width: 450px;

  background: #ffffff;

  padding: 40px;

  border-radius: 16px;

  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.register-card h1 {
  margin: 0;

  text-align: center;

  font-size: 30px;
  color: #222;
}

.subtitle {
  margin: 12px 0 30px;

  text-align: center;

  color: #777;

  font-size: 14px;
  line-height: 1.6;
}

/* Form */
.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;

  margin-bottom: 8px;

  color: #333;

  font-size: 14px;
  font-weight: 600;
}

.form-group input {
  width: 100%;

  padding: 13px 14px;

  border: 1px solid #d8d8d8;
  border-radius: 8px;

  outline: none;

  font-size: 15px;

  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #555;
}

.form-group input::placeholder {
  color: #aaa;
}

/* Error */
.error-message {
  margin: -2px 0 15px;

  color: #d32f2f;

  font-size: 14px;
}

/* Register */
.register-main-button {
  width: 100%;

  padding: 14px;

  border: none;
  border-radius: 8px;

  background: #222;
  color: #ffffff;

  font-size: 16px;
  font-weight: 600;

  cursor: pointer;

  transition: background 0.2s;
}

.register-main-button:hover {
  background: #444;
}

/* Login */
.login-section {
  margin-top: 25px;

  padding-top: 22px;

  border-top: 1px solid #eeeeee;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;

  color: #777;

  font-size: 14px;
}

.login-button {
  border: none;
  background: transparent;

  color: #222;

  font-size: 14px;
  font-weight: 600;

  cursor: pointer;
}

.login-button:hover {
  text-decoration: underline;
}

/* Footer */
.footer {
  padding: 20px;

  text-align: center;

  color: #888;

  font-size: 13px;
}

/* Mobile */
@media (max-width: 600px) {
  .register-container {
    padding: 30px 16px;
  }

  .register-card {
    padding: 30px 22px;
  }

  .register-card h1 {
    font-size: 26px;
  }
}
.success-message {
  margin: 12px 0;
  color: #16794b;
}
</style>
