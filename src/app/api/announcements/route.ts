import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Get active announcements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const announcementId = searchParams.get('id')
    const type = searchParams.get('type')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Get single announcement
    if (announcementId) {
      const announcement = await db.announcement.findUnique({
        where: { id: announcementId }
      })
      return NextResponse.json(announcement)
    }

    // Build filter
    const where: Record<string, unknown> = {}
    
    if (!includeInactive) {
      where.isActive = true
      
      // Filter by date range
      const now = new Date()
      where.OR = [
        { startDate: null, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: null },
        { startDate: { lte: now }, endDate: { gte: now } }
      ]
    }
    
    if (type) where.type = type

    const announcements = await db.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Get announcements error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Create announcement (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, type, link, isActive, startDate, endDate } = body

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
    }

    // Validate type
    const validTypes = ['info', 'warning', 'success', 'promotion']
    if (type && !validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid announcement type' }, { status: 400 })
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        content: message,
        type: type || 'info',
        link: link || null,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    console.error('Create announcement error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT: Update announcement
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, message, type, link, isActive, startDate, endDate } = body

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 })
    }

    const existing = await db.announcement.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    // Validate type if provided
    const validTypes = ['info', 'warning', 'success', 'promotion']
    if (type && !validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid announcement type' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (message !== undefined) updateData.content = message
    if (type !== undefined) updateData.type = type
    if (link !== undefined) updateData.link = link
    if (isActive !== undefined) updateData.isActive = isActive
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null

    const announcement = await db.announcement.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error('Update announcement error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE: Delete announcement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 })
    }

    await db.announcement.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Announcement deleted' })
  } catch (error) {
    console.error('Delete announcement error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
