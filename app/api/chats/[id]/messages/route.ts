// API Route: /api/chats/[id]/messages
// POST: Add message to chat

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { role, content, modelId, isEveryoneMention, mentions, targetedModelIds } = await request.json()

    if (!role || !content) {
      return NextResponse.json(
        { error: 'role and content are required' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        chatId: id,
        role,
        content,
        modelId,
        isEveryoneMention: isEveryoneMention || false,
        mentions: mentions ? JSON.stringify(mentions) : null,
        targetedModelIds: targetedModelIds ? JSON.stringify(targetedModelIds) : null,
      }
    })

    // Update chat's updatedAt timestamp
    await prisma.chat.update({
      where: { id },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
