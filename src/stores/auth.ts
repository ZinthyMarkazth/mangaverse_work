import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { requireSupabase, isSupabaseConfigured } from '@/lib/supabaseClient'

function legacyNumericId(uuid: string): number {
  // Compatibility with old components only. Authorization uses UUID + RLS.
  let hash = 0
  for (const char of uuid) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return Math.abs(hash) || 1
}

export const useAuthStore = defineStore('auth', () => {
  const userId = ref(0)
  const authUserId = ref<string | null>(null)
  const isLoggedIn = ref(false)
  const username = ref('')
  const email = ref('')
  const role = ref<'user' | 'admin'>('user')
  const initialized = ref(false)
  const isAdmin = computed(() => role.value === 'admin')

  async function refreshSession() {
    if (!isSupabaseConfigured) {
      initialized.value = true
      return
    }
    const client = requireSupabase()
    const { data: { user }, error } = await client.auth.getUser()
    if (error || !user) {
      userId.value = 0
      authUserId.value = null
      isLoggedIn.value = false
      username.value = ''
      email.value = ''
      role.value = 'user'
      initialized.value = true
      return
    }
    authUserId.value = user.id
    userId.value = legacyNumericId(user.id)
    isLoggedIn.value = true
    email.value = user.email ?? ''
    username.value = String(user.user_metadata?.username ?? user.email?.split('@')[0] ?? 'User')

    const { data: profile, error: profileError } = await client
      .from('profiles').select('username, role').eq('id', user.id).maybeSingle()
    role.value = !profileError && profile?.role === 'admin' ? 'admin' : 'user'
    if (!profileError && profile?.username) username.value = profile.username
    initialized.value = true
  }

  async function initialize() {
    if (initialized.value) return
    await refreshSession()
    if (isSupabaseConfigured) {
      requireSupabase().auth.onAuthStateChange(() => {
        // Avoid awaiting Supabase calls inside the auth callback.
        Promise.resolve().then(() => refreshSession())
      })
    }
  }

  async function login(emailInput: string, password: string) {
    const { error } = await requireSupabase().auth.signInWithPassword({
      email: emailInput.trim().toLowerCase(), password,
    })
    if (error) throw error
    await refreshSession()
  }

  async function register(emailInput: string, password: string, usernameInput: string) {
    const { data, error } = await requireSupabase().auth.signUp({
      email: emailInput.trim().toLowerCase(),
      password,
      options: { data: { username: usernameInput.trim() } },
    })
    if (error) throw error
    if (data.session) await refreshSession()
    return { needsEmailConfirmation: !data.session }
  }

  async function logout() {
    if (isSupabaseConfigured) {
      const { error } = await requireSupabase().auth.signOut()
      if (error) throw error
    }
    userId.value = 0
    authUserId.value = null
    isLoggedIn.value = false
    username.value = ''
    email.value = ''
    role.value = 'user'
  }

  return {
    userId, authUserId, isLoggedIn, username, email, role, isAdmin, initialized,
    initialize, refreshSession, login, register, logout,
  }
})
