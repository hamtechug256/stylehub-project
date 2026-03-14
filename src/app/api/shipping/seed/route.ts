import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Seed default shipping zones and rates for East Africa
export async function POST(request: NextRequest) {
  try {
    const existingZones = await db.shippingZone.count()
    
    if (existingZones > 0) {
      return NextResponse.json({ 
        message: 'Zones already exist',
        existingCount: existingZones 
      })
    }

    // Create zones for East Africa
    const zones = await Promise.all([
      // Uganda
      db.shippingZone.create({
        data: { name: 'Kampala', country: 'Uganda', countryCode: 'UG', region: 'Central', cities: '["Kampala", "Wakiso", "Mukono", "Entebbe"]' }
      }),
      db.shippingZone.create({
        data: { name: 'Jinja', country: 'Uganda', countryCode: 'UG', region: 'Eastern', cities: '["Jinja", "Iganga", "Mbale"]' }
      }),
      db.shippingZone.create({
        data: { name: 'Gulu', country: 'Uganda', countryCode: 'UG', region: 'Northern', cities: '["Gulu", "Lira", "Arua"]' }
      }),
      db.shippingZone.create({
        data: { name: 'Mbarara', country: 'Uganda', countryCode: 'UG', region: 'Western', cities: '["Mbarara", "Fort Portal", "Kasese"]' }
      }),

      // Kenya
      db.shippingZone.create({
        data: { name: 'Nairobi', country: 'Kenya', countryCode: 'KE', region: 'Nairobi', cities: '["Nairobi", "Kiambu", "Machakos", "Kajiado"]' }
      }),
      db.shippingZone.create({
        data: { name: 'Mombasa', country: 'Kenya', countryCode: 'KE', region: 'Coast', cities: '["Mombasa", "Malindi", "Diani"]' }
      }),
      db.shippingZone.create({
        data: { name: 'Kisumu', country: 'Kenya', countryCode: 'KE', region: 'Nyanza', cities: '["Kisumu", "Kakamega", "Eldoret"]' }
      }),

      // Tanzania
      db.shippingZone.create({
        data: { name: 'Dar es Salaam', country: 'Tanzania', countryCode: 'TZ', region: 'Dar es Salaam', cities: '["Dar es Salaam", "Bagamoyo"]' }
      }),
      db.shippingZone.create({
        data: { name: 'Arusha', country: 'Tanzania', countryCode: 'TZ', region: 'Arusha', cities: '["Arusha", "Moshi", "Dodoma"]' }
      }),
      db.shippingZone.create({
        data: { name: 'Mwanza', country: 'Tanzania', countryCode: 'TZ', region: 'Mwanza', cities: '["Mwanza", "Bukoba"]' }
      }),

      // Rwanda
      db.shippingZone.create({
        data: { name: 'Kigali', country: 'Rwanda', countryCode: 'RW', region: 'Kigali', cities: '["Kigali", "Butare", "Gisenyi"]' }
      }),
    ])

    // Create rates between zones
    const rates = []
    
    for (const origin of zones) {
      for (const dest of zones) {
        if (origin.id === dest.id) continue

        let zoneType: string
        let baseSmall: number, baseMedium: number, baseLarge: number, baseXLarge: number
        let minDays: number, maxDays: number

        if (origin.countryCode === dest.countryCode) {
          zoneType = 'Z2'
          baseSmall = 2
          baseMedium = 4
          baseLarge = 8
          baseXLarge = 15
          minDays = 1
          maxDays = 3
        }
        else if (isNeighboring(origin.countryCode, dest.countryCode)) {
          zoneType = 'Z3'
          baseSmall = 5
          baseMedium = 10
          baseLarge = 18
          baseXLarge = 35
          minDays = 2
          maxDays = 5
        }
        else {
          zoneType = 'Z4'
          baseSmall = 8
          baseMedium = 15
          baseLarge = 28
          baseXLarge = 50
          minDays = 5
          maxDays = 14
        }

        if ((origin.countryCode === 'UG' && dest.countryCode === 'KE') ||
            (origin.countryCode === 'KE' && dest.countryCode === 'UG')) {
          baseSmall = 4
          baseMedium = 8
          baseLarge = 15
          baseXLarge = 30
          minDays = 2
          maxDays = 4
        }

        const rate = await db.shippingRate.create({
          data: {
            originZoneId: origin.id,
            destZoneId: dest.id,
            zoneType,
            baseRateSmall: baseSmall,
            baseRateMedium: baseMedium,
            baseRateLarge: baseLarge,
            baseRateXLarge: baseXLarge,
            surchargeMedium: 0,
            surchargeLarge: 3,
            surchargeXLarge: 8,
            minDays,
            maxDays,
            platformMarkup: 0.25,
            isActive: true
          }
        })
        rates.push(rate)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Shipping zones and rates seeded successfully',
      zonesCreated: zones.length,
      ratesCreated: rates.length,
      zones: zones.map(z => ({ id: z.id, name: z.name, country: z.country }))
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 })
  }
}

function isNeighboring(code1: string, code2: string): boolean {
  const neighbors: Record<string, string[]> = {
    'UG': ['KE', 'RW', 'TZ'],
    'KE': ['UG', 'TZ'],
    'TZ': ['KE', 'UG', 'RW'],
    'RW': ['UG', 'TZ']
  }
  return neighbors[code1]?.includes(code2) || false
}
