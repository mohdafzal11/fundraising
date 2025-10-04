import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Get admin credentials from environment variables
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    const adminPasswords = process.env.ADMIN_PASSWORDS?.split(',') || []

    // Find matching admin
    const adminIndex = adminEmails.findIndex(
      (adminEmail) => adminEmail.trim() === email
    )

    if (adminIndex === -1) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check password
    if (adminPasswords[adminIndex]?.trim() !== password) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Use the token hash directly
    const token = process.env.ADMIN_TOKEN_HASH || ''

    // Set cookie
    cookies().set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
