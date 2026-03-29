import { supabaseAdmin } from './supabaseServer'
import { Profile } from '@/types'

const FREE_TIER_LIMIT = 15
const ANONYMOUS_SESSION_KEY = 'anon_session_id'

// For Phase 1 (no auth), we track usage by a session ID stored in a cookie.
// The session ID maps to a profile row keyed by a synthetic "user_id".

export async function getOrCreateProfile(sessionId: string): Promise<Profile> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (!error && data) return data as Profile

  // Create a new profile for this session
  const newProfile: Profile = {
    id: sessionId,
    email: '',
    compilations_used: 0,
    compilations_limit: FREE_TIER_LIMIT,
    plan: 'free',
  }

  await supabaseAdmin.from('profiles').insert(newProfile)
  return newProfile
}

export async function checkAndIncrementUsage(
  sessionId: string
): Promise<{ allowed: boolean; profile: Profile }> {
  const profile = await getOrCreateProfile(sessionId)

  if (profile.compilations_used >= profile.compilations_limit) {
    return { allowed: false, profile }
  }

  await supabaseAdmin
    .from('profiles')
    .update({ compilations_used: profile.compilations_used + 1 })
    .eq('id', sessionId)

  return {
    allowed: true,
    profile: { ...profile, compilations_used: profile.compilations_used + 1 },
  }
}

export { ANONYMOUS_SESSION_KEY }
