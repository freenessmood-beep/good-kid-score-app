import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { coAdminEmail, coAdminName, mainAdminName } = await req.json()

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email not configured' }, { status: 500 })
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #333;">🐰 You've been added as a Co-Admin!</h2>
      <p style="color: #555;">Hi ${coAdminName},</p>
      <p style="color: #555;">
        <strong>${mainAdminName}</strong> has granted you co-admin access on
        <strong>Bunny Adventure | 乖寶寶記分</strong>.
      </p>
      <p style="color: #555;">
        You now have full access to manage bunnies, add carrot scores, and view all shared data.
        Simply log in with your existing account to get started.
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 32px;">
        Bunny Adventure | 乖寶寶記分
      </p>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Bunny Adventure <onboarding@resend.dev>',
      to: coAdminEmail,
      subject: `You've been added as a Co-Admin on Bunny Adventure!`,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
