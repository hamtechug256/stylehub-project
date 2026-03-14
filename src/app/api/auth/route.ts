import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simple hash function for passwords
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

// Generate simple token
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, password, name, role, phone, storeName, storeDesc } = body

    if (action === 'register') {
      // Check if user exists
      const existingUser = await db.user.findUnique({ where: { email } })
      if (existingUser) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
      }

      // Create user
      const hashedPassword = simpleHash(password)
      const user = await db.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role || 'BUYER',
          phone,
          storeName: role === 'SELLER' ? storeName : null,
          storeDesc: role === 'SELLER' ? storeDesc : null,
        }
      })

      const token = generateToken()
      return NextResponse.json({
        user: { ...user, password: undefined },
        token
      })
    }

    if (action === 'login') {
      // Find user
      const user = await db.user.findUnique({ where: { email } })
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      // Verify password
      const hashedPassword = simpleHash(password)
      if (user.password !== hashedPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const token = generateToken()
      return NextResponse.json({
        user: { ...user, password: undefined },
        token
      })
    }

    if (action === 'update') {
      const { userId, updates } = body
      const user = await db.user.update({
        where: { id: userId },
        data: updates
      })
      return NextResponse.json({ ...user, password: undefined })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (userId) {
      const user = await db.user.findUnique({ 
        where: { id: userId },
        include: {
          products: true,
          orders: true
        }
      })
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      return NextResponse.json({ ...user, password: undefined })
    }

    // Get all users (admin)
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        storeName: true,
        balance: true,
        createdAt: true
      }
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
