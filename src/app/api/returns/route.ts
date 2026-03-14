import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Fetch return requests (filter by userId, status)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const returnId = searchParams.get('id')

    // Get single return request
    if (returnId) {
      const returnRequest = await db.returnRequest.findUnique({
        where: { id: returnId }
      })
      return NextResponse.json(returnRequest)
    }

    // Build filter conditions
    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (status) where.status = status

    const returnRequests = await db.returnRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(returnRequests)
  } catch (error) {
    console.error('Get returns error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Create return request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, orderItemId, userId, reason, description, images, refundAmount } = body

    // Validate required fields
    if (!orderId || !userId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const returnRequest = await db.returnRequest.create({
      data: {
        orderId,
        orderItemId: orderItemId || null,
        userId,
        reason,
        description: description || null,
        images: images ? JSON.stringify(images) : null,
        refundAmount: refundAmount ? parseFloat(refundAmount) : null,
        status: 'pending'
      }
    })

    return NextResponse.json(returnRequest, { status: 201 })
  } catch (error) {
    console.error('Create return error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT: Update return status (approve/reject/complete)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, adminNotes, refundAmount } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'completed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { status }

    if (adminNotes) updateData.adminNotes = adminNotes
    if (refundAmount) updateData.refundAmount = parseFloat(refundAmount)

    // Set processed timestamp
    if (status === 'approved' || status === 'rejected' || status === 'completed') {
      updateData.processedAt = new Date()
    }

    const returnRequest = await db.returnRequest.update({
      where: { id },
      data: updateData
    })

    // If completed, handle refund (add to user's balance)
    if (status === 'completed' && returnRequest.refundAmount && returnRequest.userId) {
      await db.user.update({
        where: { id: returnRequest.userId },
        data: { balance: { increment: returnRequest.refundAmount } }
      })
    }

    return NextResponse.json(returnRequest)
  } catch (error) {
    console.error('Update return error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
