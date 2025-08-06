import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const { pincode } = await request.json()

    if (!pincode || pincode.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid pincode. Must be 6 digits.' },
        { status: 400 }
      )
    }

    // Check if user with this pincode already exists
    const existingUser = await prisma.user.findUnique({
      where: { pincode }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists', userId: existingUser.id },
        { status: 200 }
      )
    }

    // Create new user
    const user = await prisma.user.create({
      data: { pincode }
    })

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const { searchParams } = new URL(request.url)
    const pincode = searchParams.get('pincode')

    if (!pincode) {
      return NextResponse.json(
        { error: 'Pincode is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { pincode },
      include: {
        sentLetters: true,
        receivedLetters: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 