import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { addDays } from 'date-fns'

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const body = await request.json()
    console.log('API received brush strokes:', body.brushStrokes?.length || 0)
    console.log('API received title:', body.title)
    console.log('API received content:', body.content)
    console.log('API received delivery time:', body.deliveryTime)
    console.log('API received delivery seconds:', body.deliverySeconds)
    
    const {
      title,
      content,
      senderPincode,
      receiverPincode,
      receiverAddress,
      deliveryTime,
      letterColor,
      envelopeColor,
      stampColor,
      stampDesign,
      envelopeDesign,
      handwritingFont,
      inkColor,
      paperTexture,
      paperType,
      foldStyle,
      brushStrokes
    } = body

    // Validate required fields
    if (!title || !content || !senderPincode || !receiverPincode || !receiverAddress) {
      console.error('Missing required fields:', { title, content, senderPincode, receiverPincode, receiverAddress })
      return NextResponse.json(
        { error: 'Missing required fields: title, content, senderPincode, receiverPincode, or receiverAddress' },
        { status: 400 }
      )
    }

    // Validate delivery time
    if (!deliveryTime || isNaN(parseFloat(deliveryTime))) {
      console.error('Invalid delivery time:', deliveryTime)
      return NextResponse.json(
        { error: 'Invalid delivery time' },
        { status: 400 }
      )
    }

    // Find or create sender
    let sender = await prisma.user.findUnique({
      where: { pincode: senderPincode }
    })

    if (!sender) {
      sender = await prisma.user.create({
        data: { pincode: senderPincode }
      })
    }

    // Find or create receiver
    let receiver = await prisma.user.findUnique({
      where: { pincode: receiverPincode }
    })

    if (!receiver) {
      receiver = await prisma.user.create({
        data: { pincode: receiverPincode }
      })
    }

    // Calculate delivery time
    // For 15 seconds: 0.0042 days * 24 * 60 * 60 = 15 seconds
    const deliveryDays = parseFloat(deliveryTime) || 1 // Default to 1 day if invalid
    const deliverySeconds = deliveryDays * 24 * 60 * 60 // Convert days to seconds
    const deliveryTimeDate = new Date()
    deliveryTimeDate.setSeconds(deliveryTimeDate.getSeconds() + deliverySeconds)
    


    // Create letter
    let letter
    try {
      letter = await prisma.letter.create({
        data: {
          title,
          content,
          senderId: sender.id,
          receiverId: receiver.id,
          deliveryTime: deliveryTimeDate,
          letterColor: letterColor || '#FEFEFE',
          envelopeColor: envelopeColor || '#8B4513',
          stampColor: stampColor || '#D97706',
          stampDesign: stampDesign || 'classic',
          envelopeDesign: envelopeDesign || 'standard',
          handwritingFont: handwritingFont || 'cursive',
          inkColor: inkColor || '#2D3748',
          paperTexture: paperTexture || 'smooth',
          paperType: paperType || 'standard',
          foldStyle: foldStyle || 'classic',
          brushStrokes: brushStrokes ? JSON.stringify(brushStrokes) : null
        }
      })
      console.log('Letter created successfully:', letter.id)
    } catch (error) {
      console.error('Error creating letter:', error)
      return NextResponse.json(
        { error: 'Failed to create letter in database' },
        { status: 500 }
      )
    }

    // Create delivery record
    try {
      await prisma.delivery.create({
        data: {
          letterId: letter.id,
          status: 'pending'
        }
      })
      console.log('Delivery record created successfully')
    } catch (error) {
      console.error('Error creating delivery record:', error)
      // Try to delete the letter if delivery creation fails
      try {
        await prisma.letter.delete({ where: { id: letter.id } })
      } catch (deleteError) {
        console.error('Error deleting letter after delivery creation failure:', deleteError)
      }
      return NextResponse.json(
        { error: 'Failed to create delivery record' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Letter sent successfully', 
        letterId: letter.id,
        deliveryTime: deliveryTimeDate.toISOString(),
        deliverySeconds: deliverySeconds
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating letter:', error)
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
    const receiverPincode = searchParams.get('receiverPincode')
    const senderPincode = searchParams.get('senderPincode')
    const includePending = searchParams.get('includePending') === 'true'

    if (!receiverPincode && !senderPincode) {
      return NextResponse.json(
        { error: 'Either receiverPincode or senderPincode is required' },
        { status: 400 }
      )
    }

    let letters: any[] = []

    if (receiverPincode) {
      // Find letters received by this pincode
      const receiver = await prisma.user.findUnique({
        where: { pincode: receiverPincode }
      })

      if (receiver) {
        letters = await prisma.letter.findMany({
          where: { 
            receiverId: receiver.id,
            // Only return letters that are ready for delivery (past delivery time) unless includePending is true
            ...(includePending ? {} : {
              deliveryTime: {
                lte: new Date()
              }
            })
          },
          include: {
            sender: true,
            receiver: true
          },
          orderBy: { createdAt: 'desc' }
        })
      }
    } else if (senderPincode) {
      // Find letters sent by this pincode
      const sender = await prisma.user.findUnique({
        where: { pincode: senderPincode }
      })

      if (sender) {
        letters = await prisma.letter.findMany({
          where: { senderId: sender.id },
          include: {
            sender: true,
            receiver: true
          },
          orderBy: { createdAt: 'desc' }
        })
      }
    }

    // Parse brushStrokes JSON for each letter
    const lettersWithParsedStrokes = letters.map(letter => {
      const parsedStrokes = letter.brushStrokes ? JSON.parse(letter.brushStrokes) : []
      console.log('API returning brush strokes for letter:', letter.id, parsedStrokes.length)
      console.log('API returning title for letter:', letter.id, letter.title)
      console.log('API returning content for letter:', letter.id, letter.content?.substring(0, 50) + '...')
      return {
        ...letter,
        brushStrokes: parsedStrokes
      }
    })

    return NextResponse.json({ letters: lettersWithParsedStrokes })
  } catch (error) {
    console.error('Error fetching letters:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 