import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all shipping zones or calculate shipping
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    // Calculate shipping cost
    if (action === 'calculate') {
      const originZoneId = searchParams.get('originZoneId')
      const destZoneId = searchParams.get('destZoneId')
      const sizeCategory = searchParams.get('sizeCategory') || 'medium'

      if (!originZoneId || !destZoneId) {
        return NextResponse.json({ error: 'Origin and destination zones required' }, { status: 400 })
      }

      // Same zone = local delivery (free or minimal)
      if (originZoneId === destZoneId) {
        return NextResponse.json({
          zoneType: 'Z1',
          zoneName: 'Local Delivery',
          baseRate: 0,
          surcharge: 0,
          totalShipping: 0,
          platformMarkup: 0,
          buyerPays: 0,
          sellerReceives: 0,
          minDays: 1,
          maxDays: 2
        })
      }

      // Find the rate between zones
      const rate = await db.shippingRate.findFirst({
        where: {
          originZoneId,
          destZoneId,
          isActive: true
        },
        include: {
          originZone: true,
          destZone: true
        }
      })

      if (!rate) {
        // Calculate based on zone type if no specific rate exists
        const originZone = await db.shippingZone.findUnique({ where: { id: originZoneId } })
        const destZone = await db.shippingZone.findUnique({ where: { id: destZoneId } })

        if (!originZone || !destZone) {
          return NextResponse.json({ error: 'Zone not found' }, { status: 404 })
        }

        // Determine zone type
        let zoneType = 'Z4' // Default cross-border
        let baseRate = 15 // Default cross-border rate

        if (originZone.countryCode === destZone.countryCode) {
          zoneType = 'Z2' // National
          baseRate = 6
        } else {
          // Check if neighboring country
          const neighbors: Record<string, string[]> = {
            'UG': ['KE', 'RW', 'TZ'],
            'KE': ['UG', 'TZ'],
            'TZ': ['KE', 'UG', 'RW'],
            'RW': ['UG', 'TZ']
          }
          if (neighbors[originZone.countryCode]?.includes(destZone.countryCode)) {
            zoneType = 'Z3' // Regional
            baseRate = 10
          }
        }

        // Calculate based on size
        const sizeRates: Record<string, { base: number, surcharge: number }> = {
          'small': { base: baseRate * 0.5, surcharge: 0 },
          'medium': { base: baseRate, surcharge: 0 },
          'large': { base: baseRate * 1.5, surcharge: 3 },
          'xlarge': { base: baseRate * 2, surcharge: 8 }
        }

        const sizeRate = sizeRates[sizeCategory] || sizeRates['medium']
        const actualCost = sizeRate.base + sizeRate.surcharge
        const platformMarkup = actualCost * 0.25
        const buyerPays = actualCost + platformMarkup

        return NextResponse.json({
          zoneType,
          zoneName: getZoneName(zoneType, originZone.country, destZone.country),
          baseRate: sizeRate.base,
          surcharge: sizeRate.surcharge,
          actualCost,
          platformMarkup,
          buyerPays: Math.round(buyerPays * 100) / 100,
          sellerReceives: Math.round(actualCost * 100) / 100,
          minDays: zoneType === 'Z2' ? 2 : zoneType === 'Z3' ? 3 : 5,
          maxDays: zoneType === 'Z2' ? 5 : zoneType === 'Z3' ? 7 : 14,
          isDefault: true
        })
      }

      // Calculate based on size category
      const sizeRates: Record<string, { base: number, surcharge: number }> = {
        'small': { base: rate.baseRateSmall, surcharge: 0 },
        'medium': { base: rate.baseRateMedium, surcharge: rate.surchargeMedium },
        'large': { base: rate.baseRateLarge, surcharge: rate.surchargeLarge },
        'xlarge': { base: rate.baseRateXLarge, surcharge: rate.surchargeXLarge }
      }

      const sizeRate = sizeRates[sizeCategory] || sizeRates['medium']
      const actualCost = sizeRate.base + sizeRate.surcharge
      const platformMarkup = actualCost * rate.platformMarkup
      const buyerPays = actualCost + platformMarkup

      return NextResponse.json({
        zoneType: rate.zoneType,
        zoneName: getZoneName(rate.zoneType, rate.originZone.country, rate.destZone.country),
        baseRate: sizeRate.base,
        surcharge: sizeRate.surcharge,
        actualCost: Math.round(actualCost * 100) / 100,
        platformMarkup: Math.round(platformMarkup * 100) / 100,
        buyerPays: Math.round(buyerPays * 100) / 100,
        sellerReceives: Math.round(actualCost * 100) / 100,
        minDays: rate.minDays,
        maxDays: rate.maxDays,
        rateId: rate.id
      })
    }

    // Get all zones
    const zones = await db.shippingZone.findMany({
      where: { isActive: true },
      orderBy: [{ country: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { originRates: true, productShippings: true }
        }
      }
    })

    return NextResponse.json(zones)
  } catch (error) {
    console.error('Shipping API error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

// POST - Create new shipping zone or rate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    if (type === 'zone') {
      const zone = await db.shippingZone.create({
        data: {
          name: data.name,
          country: data.country,
          countryCode: data.countryCode,
          region: data.region,
          cities: data.cities ? JSON.stringify(data.cities) : null,
          isActive: data.isActive ?? true
        }
      })
      return NextResponse.json(zone)
    }

    if (type === 'rate') {
      // Determine zone type automatically
      const originZone = await db.shippingZone.findUnique({ where: { id: data.originZoneId } })
      const destZone = await db.shippingZone.findUnique({ where: { id: data.destZoneId } })

      let zoneType = 'Z4'
      if (originZone && destZone) {
        if (originZone.countryCode === destZone.countryCode) {
          zoneType = 'Z2'
        } else {
          const neighbors: Record<string, string[]> = {
            'UG': ['KE', 'RW', 'TZ'],
            'KE': ['UG', 'TZ'],
            'TZ': ['KE', 'UG', 'RW'],
            'RW': ['UG', 'TZ']
          }
          if (neighbors[originZone.countryCode]?.includes(destZone.countryCode)) {
            zoneType = 'Z3'
          }
        }
      }

      const rate = await db.shippingRate.create({
        data: {
          originZoneId: data.originZoneId,
          destZoneId: data.destZoneId,
          zoneType,
          baseRateSmall: data.baseRateSmall ?? 3,
          baseRateMedium: data.baseRateMedium ?? 6,
          baseRateLarge: data.baseRateLarge ?? 12,
          baseRateXLarge: data.baseRateXLarge ?? 25,
          surchargeMedium: data.surchargeMedium ?? 0,
          surchargeLarge: data.surchargeLarge ?? 3,
          surchargeXLarge: data.surchargeXLarge ?? 8,
          minDays: data.minDays ?? 1,
          maxDays: data.maxDays ?? 7,
          platformMarkup: data.platformMarkup ?? 0.25,
          isActive: data.isActive ?? true
        }
      })
      return NextResponse.json(rate)
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Shipping create error:', error)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}

// PUT - Update zone or rate
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, ...data } = body

    if (type === 'zone') {
      const zone = await db.shippingZone.update({
        where: { id },
        data: {
          name: data.name,
          country: data.country,
          countryCode: data.countryCode,
          region: data.region,
          cities: data.cities ? JSON.stringify(data.cities) : null,
          isActive: data.isActive
        }
      })
      return NextResponse.json(zone)
    }

    if (type === 'rate') {
      const rate = await db.shippingRate.update({
        where: { id },
        data: {
          baseRateSmall: data.baseRateSmall,
          baseRateMedium: data.baseRateMedium,
          baseRateLarge: data.baseRateLarge,
          baseRateXLarge: data.baseRateXLarge,
          surchargeMedium: data.surchargeMedium,
          surchargeLarge: data.surchargeLarge,
          surchargeXLarge: data.surchargeXLarge,
          minDays: data.minDays,
          maxDays: data.maxDays,
          platformMarkup: data.platformMarkup,
          isActive: data.isActive
        }
      })
      return NextResponse.json(rate)
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Shipping update error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE - Delete zone or rate
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    if (type === 'zone') {
      await db.shippingZone.delete({ where: { id } })
    } else if (type === 'rate') {
      await db.shippingRate.delete({ where: { id } })
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Shipping delete error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}

// Helper function
function getZoneName(zoneType: string, originCountry?: string, destCountry?: string): string {
  switch (zoneType) {
    case 'Z1': return 'Local Delivery'
    case 'Z2': return `National (${originCountry || 'Same Country'})`
    case 'Z3': return `Regional (${originCountry} → ${destCountry})`
    case 'Z4': return `Cross-Border (${originCountry} → ${destCountry})`
    default: return 'Standard Shipping'
  }
}
