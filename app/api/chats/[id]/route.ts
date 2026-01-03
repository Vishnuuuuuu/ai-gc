// API Route: /api/chats/[id]
// GET: Get chat with all messages

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc'  // Messages in chronological order
          }
        }
      }
    })

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      )
    }

    // Parse modelIds back to array
    const chatWithParsedIds = {
      ...chat,
      modelIds: JSON.parse(chat.modelIds)
    }

    return NextResponse.json({ chat: chatWithParsedIds })
  } catch (error) {
    console.error('Error fetching chat:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    )
  }
}
