import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Get comparison list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's comparison list using the Comparison model
    const comparisons = await db.comparison.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            comparePrice: true,
            images: true,
            category: true,
            subCategory: true,
            brand: true,
            description: true,
            rating: true,
            reviewCount: true,
            soldCount: true,
            stock: true,
            condition: true
          }
        }
      }
    })

    const productIds = comparisons.map(c => c.productId)
    const products = comparisons.map(c => c.product).filter(Boolean)

    return NextResponse.json({
      productIds,
      products
    })
  } catch (error) {
    console.error('Get comparison error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Add product to comparison
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId } = body

    if (!userId || !productId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check current count
    const currentCount = await db.comparison.count({
      where: { userId }
    })

    const maxProducts = 4

    if (currentCount >= maxProducts) {
      return NextResponse.json({ 
        error: `Maximum ${maxProducts} products can be compared`
      }, { status: 400 })
    }

    // Check if already exists
    const existing = await db.comparison.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    })

    if (existing) {
      return NextResponse.json({ 
        error: 'Product already in comparison list'
      }, { status: 400 })
    }

    // Add to comparison
    await db.comparison.create({
      data: { userId, productId }
    })

    const comparisons = await db.comparison.findMany({
      where: { userId },
      select: { productId: true }
    })

    return NextResponse.json({
      success: true,
      productIds: comparisons.map(c => c.productId)
    }, { status: 201 })
  } catch (error) {
    console.error('Add to comparison error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE: Remove from comparison
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const productId = searchParams.get('productId')
    const clearAll = searchParams.get('clearAll')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Clear all products
    if (clearAll === 'true') {
      await db.comparison.deleteMany({
        where: { userId }
      })
      return NextResponse.json({ success: true, message: 'Comparison list cleared' })
    }

    // Remove specific product
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    await db.comparison.delete({
      where: {
        userId_productId: { userId, productId }
      }
    })

    const comparisons = await db.comparison.findMany({
      where: { userId },
      select: { productId: true }
    })

    return NextResponse.json({
      success: true,
      productIds: comparisons.map(c => c.productId)
    })
  } catch (error) {
    console.error('Remove from comparison error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
