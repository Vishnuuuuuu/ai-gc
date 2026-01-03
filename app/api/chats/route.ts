// API Route: /api/chats
// GET: List all chats
// POST: Create new chat

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/chats - List all chats with all messages
export async function GET() {
  try {
    const chats = await prisma.chat.findMany({
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc'  // Messages in chronological order
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({ chats })
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    )
  }
}

// POST /api/chats - Create new chat
export async function POST(request: Request) {
  try {
    const { modelIds } = await request.json()

    if (!modelIds || !Array.isArray(modelIds) || modelIds.length === 0) {
      return NextResponse.json(
        { error: 'modelIds array is required' },
        { status: 400 }
      )
    }

    const chat = await prisma.chat.create({
      data: {
        modelIds: JSON.stringify(modelIds),  // Store as JSON string
      }
    })

    return NextResponse.json({ chat })
  } catch (error) {
    console.error('Error creating chat:', error)
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    )
  }
}
