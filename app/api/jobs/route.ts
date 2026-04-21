
import {prisma} from "@/app/lib/prisma"
import { NextResponse } from "next/server";

// GET all with search/filter function
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    // ✅ VALID SORT FIELDS (must match schema)
    const validSortFields = [
      'id',
      'company',
      'role',
      'status',
      'source',
      'appliedAt',
    ] as const

    const sortByParam = searchParams.get('sortBy')
    const sortBy = validSortFields.includes(sortByParam as any)
      ? sortByParam!
      : 'id'

    const orderParam = searchParams.get('order')
    const order = orderParam === 'asc' ? 'asc' : 'desc'

    const jobs = await prisma.jobs.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { company: { contains: search, mode: 'insensitive' } },
                  { role: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},

          status
            ? {
                status: {
                  equals: status as any, // you can improve this later
                },
              }
            : {},

          source
            ? {
                source: {
                  equals: source as any,
                },
              }
            : {},

          // ✅ FIXED: use appliedAt (not "date")
          from || to
            ? {
                appliedAt: {
                  ...(from ? { gte: new Date(from) } : {}),
                  ...(to ? { lte: new Date(to) } : {}),
                },
              }
            : {},
        ],
      },

      orderBy: sortBy ? { [sortBy]: order } : undefined,
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error(error) // 👈 VERY important for debugging
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// POST for new job application
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const job = await prisma.jobs.create({ data: body })
    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
