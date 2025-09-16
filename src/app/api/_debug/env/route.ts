import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  return NextResponse.json({
    node: process.version,
    env: {
      MONGODB_URI: !!process.env.MONGODB_URI,
      EMAIL_HOST: !!process.env.EMAIL_HOST,
      EMAIL_PORT: !!process.env.EMAIL_PORT,
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASS: !!process.env.EMAIL_PASS,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL,
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      ADMIN_EMAILS: !!process.env.ADMIN_EMAILS,
    },
  })
}
