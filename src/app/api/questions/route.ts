import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Get questions for product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const questionId = searchParams.get('id')
    const userId = searchParams.get('userId')

    // Get single question
    if (questionId) {
      const question = await db.productQuestion.findUnique({
        where: { id: questionId }
      })
      return NextResponse.json(question)
    }

    // Build filter conditions
    const where: Record<string, unknown> = {}
    if (productId) where.productId = productId
    if (userId) where.userId = userId

    const questions = await db.productQuestion.findMany({
      where,
      orderBy: [
        { answeredAt: 'desc' }, // Answered questions first
        { createdAt: 'desc' }
      ],
      take: 50
    })

    // Fetch user and product details for each question
    const questionsWithDetails = await Promise.all(
      questions.map(async (q) => {
        const [user, product] = await Promise.all([
          db.user.findUnique({
            where: { id: q.userId },
            select: { id: true, name: true, avatar: true }
          }),
          db.product.findUnique({
            where: { id: q.productId },
            select: { id: true, name: true, images: true }
          })
        ])
        return {
          ...q,
          user,
          product
        }
      })
    )

    return NextResponse.json(questionsWithDetails)
  } catch (error) {
    console.error('Get questions error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Ask question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, userId, question } = body

    if (!productId || !userId || !question) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const newQuestion = await db.productQuestion.create({
      data: {
        productId,
        userId,
        question,
        isHelpful: 0
      }
    })

    return NextResponse.json(newQuestion, { status: 201 })
  } catch (error) {
    console.error('Create question error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT: Answer question (seller only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, answer, action } = body

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 })
    }

    const question = await db.productQuestion.findUnique({
      where: { id }
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Answer question
    if (action === 'answer' && answer) {
      const updatedQuestion = await db.productQuestion.update({
        where: { id },
        data: {
          answer,
          answeredAt: new Date()
        }
      })

      return NextResponse.json(updatedQuestion)
    }

    // Mark as helpful
    if (action === 'helpful') {
      const updatedQuestion = await db.productQuestion.update({
        where: { id },
        data: {
          isHelpful: { increment: 1 }
        }
      })

      return NextResponse.json(updatedQuestion)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Update question error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
