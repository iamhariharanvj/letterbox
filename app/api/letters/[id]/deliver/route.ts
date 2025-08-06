import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = new PrismaClient()
  
  try {
    const letterId = params.id

    // Find the letter
    const letter = await prisma.letter.findUnique({
      where: { id: letterId },
      include: { delivery: true }
    })

    if (!letter) {
      return NextResponse.json(
        { error: 'Letter not found' },
        { status: 404 }
      )
    }

    // Check if letter is ready for delivery
    if (new Date() < letter.deliveryTime) {
      return NextResponse.json(
        { 
          error: 'Letter is not ready for delivery yet',
          deliveryTime: letter.deliveryTime,
          currentTime: new Date()
        },
        { status: 400 }
      )
    }

    // Update letter and delivery status
    const updatedLetter = await prisma.letter.update({
      where: { id: letterId },
      data: { 
        isDelivered: true,
        delivery: {
          update: {
            status: 'delivered'
          }
        }
      },
      include: {
        sender: true,
        receiver: true,
        delivery: true
      }
    })

    return NextResponse.json({
      message: 'Letter marked as delivered',
      letter: updatedLetter
    })
  } catch (error) {
    console.error('Error delivering letter:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 