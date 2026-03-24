import { createClient } from './supabase'
import type { User } from './types'

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
