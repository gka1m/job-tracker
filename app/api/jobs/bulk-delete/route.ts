import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

// DELETE multiple job listings
export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No ids provided' }, { status: 400 })
    }

    const numericIds = ids.map(Number)

    const { count } = await prisma.jobs.deleteMany({
      where: { id: { in: numericIds } }
    })

    return NextResponse.json({ deleted: count })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete jobs' }, { status: 500 })
  }
}