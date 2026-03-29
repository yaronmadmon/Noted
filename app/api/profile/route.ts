export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateProfile } from '@/lib/usage'
import { v4 as uuidv4 } from 'uuid'

export async function GET(req: NextRequest) {
  let sessionId = req.cookies.get('session_id')?.value

  const isNew = !sessionId
  if (!sessionId) sessionId = uuidv4()

  const profile = await getOrCreateProfile(sessionId)

  const res = NextResponse.json({ profile })

  if (isNew) {
    res.cookies.set('session_id', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    })
  }

  return res
}
