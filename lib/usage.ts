import { supabaseAdmin } from './supabaseServer'
import { Profile } from '@/types'

const FREE_TIER_LIMIT = 15

export async function getOrCreateProfile(userId: string, email = ''): Promise<Profile> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!error && data) return data as Profile

  const newProfile: Profile = {
    id: userId,
    email,
    compilations_used: 0,
    compilations_limit: FREE_TIER_LIMIT,
    plan: 'free',
  }

  await supabaseAdmin.from('profiles').insert(newProfile)
  return newProfile
}

export async function getUserUsage(
  userId: string
): Promise<{ used: number; limit: number; remaining: number }> {
  const profile = await getOrCreateProfile(userId)
  return {
    used: profile.compilations_used,
    limit: profile.compilations_limit,
    remaining: Math.max(0, profile.compilations_limit - profile.compilations_used),
  }
}

export async function incrementUsage(userId: string): Promise<void> {
  const profile = await getOrCreateProfile(userId)
  await supabaseAdmin
    .from('profiles')
    .update({ compilations_used: profile.compilations_used + 1 })
    .eq('id', userId)
}

export async function hasReachedLimit(userId: string): Promise<boolean> {
  const profile = await getOrCreateProfile(userId)
  return profile.compilations_used >= profile.compilations_limit
}

export async function resetMonthlyUsage(userId: string): Promise<void> {
  await supabaseAdmin
    .from('profiles')
    .update({ compilations_used: 0 })
    .eq('id', userId)
}

// Keep backward-compat — used by compile route
export async function checkAndIncrementUsage(
  userId: string,
  email = ''
): Promise<{ allowed: boolean; profile: Profile }> {
  const profile = await getOrCreateProfile(userId, email)

  if (profile.compilations_used >= profile.compilations_limit) {
    return { allowed: false, profile }
  }

  await supabaseAdmin
    .from('profiles')
    .update({ compilations_used: profile.compilations_used + 1 })
    .eq('id', userId)

  return {
    allowed: true,
    profile: { ...profile, compilations_used: profile.compilations_used + 1 },
  }
}
