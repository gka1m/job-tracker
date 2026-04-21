import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

// GET one job (search)
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const job = await prisma.jobs.findUnique({
      where: { id: Number(id) }
    })
    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
  }
}

// editing of job fields
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const allowedFields = ['company', 'role', 'status','source', 'notes', 'date']
    const data = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key))
    )

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
    }

    const job = await prisma.jobs.update({
      where: { id: Number(id) },
      data
    })
    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.jobs.delete({ where: { id: Number(id) } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}
