import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { AppState } from 'react-native'

// Supabase stores both sessions and PKCE verifiers here. Never persist domain data.
// Short chunks avoid iOS Keychain value-size limits for large JWT sessions.
const CHUNK = 1500
const storageKey = (key: string) => `sf.${Array.from(key).map(char => char.charCodeAt(0).toString(16).padStart(4, '0')).join('')}`

const storage = {
  async getItem(key: string) {
    const base = storageKey(key)
    const manifest = await SecureStore.getItemAsync(base)
    if (!manifest) return null
    const count = Number(manifest)
    if (!Number.isInteger(count) || count < 1 || count > 100) return null
    const parts = await Promise.all(Array.from({ length: count }, (_, i) => SecureStore.getItemAsync(`${base}.${i}`)))
    return parts.some(part => part === null) ? null : parts.join('')
  },
  async setItem(key: string, value: string) {
    const base = storageKey(key)
    const oldCount = Number(await SecureStore.getItemAsync(base)) || 0
    const count = Math.ceil(value.length / CHUNK) || 1
    if (count > 100) throw new Error('Sessione troppo grande per l’archivio sicuro.')
    // Invalidate first: an interrupted write must never restore a partial session.
    await SecureStore.deleteItemAsync(base)
    for (let i = 0; i < count; i++) await SecureStore.setItemAsync(`${base}.${i}`, value.slice(i * CHUNK, (i + 1) * CHUNK))
    await SecureStore.setItemAsync(base, String(count))
    for (let i = count; i < oldCount && i < 100; i++) await SecureStore.deleteItemAsync(`${base}.${i}`)
  },
  async removeItem(key: string) {
    const base = storageKey(key)
    const count = Number(await SecureStore.getItemAsync(base)) || 0
    await SecureStore.deleteItemAsync(base)
    for (let i = 0; i < count && i < 100; i++) await SecureStore.deleteItemAsync(`${base}.${i}`)
  },
}

const url = process.env.EXPO_PUBLIC_SUPABASE_URL
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
export const configured = Boolean(url && key && /^https:\/\//.test(url))
export const supabase = configured ? createClient(url!, key!, {
  auth: { storage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce' },
}) : null

export function requireSupabase() {
  if (!supabase) throw new Error('Configura EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.')
  return supabase
}

if (supabase) {
  if (AppState.currentState === 'active') supabase.auth.startAutoRefresh()
  else supabase.auth.stopAutoRefresh()
  AppState.addEventListener('change', state => {
    if (state === 'active') supabase.auth.startAutoRefresh()
    else supabase.auth.stopAutoRefresh()
  })
}
