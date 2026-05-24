import { prisma } from "@/app/lib/prisma";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

// GET all with search/filter/sort/pagination
export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  const {
    data: { user },
  } = await supabase.auth.getUser(token!);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // pagination
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "10");

    const skip = (page - 1) * limit;

    // valid sort fields
    const validSortFields = [
      "id",
      "company",
      "role",
      "status",
      "source",
      "appliedAt",
    ] as const;

    const sortByParam = searchParams.get("sortBy");

    const sortBy = validSortFields.includes(sortByParam as any)
      ? sortByParam!
      : "id";

    const orderParam = searchParams.get("order");
    const order = orderParam === "asc" ? "asc" : "desc";

    const where = {
      AND: [
        { userId: user.id },
        search
          ? {
              OR: [
                {
                  company: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  role: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {},

        status
          ? {
              status: {
                equals: status as any,
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

        from || to
          ? {
              appliedAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {},
      ],
    };

    // get paginated jobs
    const jobs = await prisma.jobs.findMany({
      where,
      orderBy: {
        [sortBy]: order,
      },
      skip,
      take: limit,
    });

    // total count for pagination
    const total = await prisma.jobs.count({
      where,
    });

    return NextResponse.json({
      jobs,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}

// POST for new job application
// export async function POST(req: Request) {
//   try {
//     const authHeader = req.headers.get("Authorization");
//     const token = authHeader?.replace("Bearer ", "");

//     const {
//       data: { user },
//     } = await supabase.auth.getUser(token!);

//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     const body = await req.json();
//     const job = await prisma.jobs.create({ data: body });
//     return NextResponse.json(job, { status: 201 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Failed to create job" },
//       { status: 500 },
//     );
//   }
// }
export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  const {
    data: { user },
  } = await supabase.auth.getUser(token!);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const job = await prisma.jobs.create({
    data: {
      ...body,
      userId: user.id, // ← attach user
    },
  });
  return NextResponse.json(job, { status: 201 });
}
