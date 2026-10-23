import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { waitlistSchema } from "@/lib/validation";
import { resend } from "@/lib/resend";

export async function GET(req: NextRequest) {
  try {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (email) {
    const normalizedEmail = email.toLowerCase().trim();
    const entry = await prisma.waitlistEntry.findUnique({
      where: { email: normalizedEmail },
    });

    const res = NextResponse.json({
      status: "success",
      data: { joined: !!entry },
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10) || 20));
  const skip = (page - 1) * pageSize;

  const [entries, total] = await Promise.all([
    prisma.waitlistEntry.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        organization: true,
        photoUrl: true,
        createdAt: true,
        type: true,
        product: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.waitlistEntry.count(),
  ]);

  const res = NextResponse.json({
    status: "success",
    data: entries,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
  return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  } catch {
    return withSecurityHeaders(NextResponse.json({ status: "error", code: "server_error", message: "The waitlist is temporarily unavailable." }, { status: 503 }));
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    const res = NextResponse.json(
      { status: "error", code: "validation_error", message: "Invalid request body." },
      { status: 400 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path.join(".")] = issue.message;
    }
    const res = NextResponse.json(
      {
        status: "error",
        code: "validation_error",
        message: "Please check the form for errors.",
        errors,
      },
      { status: 400 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  const { name, email, company, type, product, source, role, organization, photo } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const entry = await prisma.waitlistEntry.create({
      data: {
        name,
        email: normalizedEmail,
        company: company || null,
        type,
        product,
        source: source || null,
        role: role || null,
        organization: organization || null,
        photoUrl: photo || null,
      },
    });

    if (process.env.RESEND_API_KEY) {
      const firstName = name.trim().split(" ")[0] || name.trim();
      try {
        await resend.contacts.create({
          email: normalizedEmail,
          firstName,
        });
      } catch (err) {
        console.error("Resend contact sync failed", err);
      }
    }

    const position = await prisma.waitlistEntry.count({
      where: { createdAt: { lte: entry.createdAt } },
    });

    const res = NextResponse.json(
      {
        status: "success",
        message: "You have been added to the waitlist.",
        data: { id: entry.id, email: entry.email, position },
      },
      { status: 201 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const res = NextResponse.json(
        {
          status: "error",
          code: "duplicate_email",
          message: "This email is already on the waitlist.",
        },
        { status: 409 }
      );
      return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
    }

    console.error("waitlist submit error");
    const res = NextResponse.json(
      { status: "error", code: "server_error", message: "Something went wrong." },
      { status: 500 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = new NextResponse(null, { status: 204 });
  return withSecurityHeaders(withCors(res, origin ?? undefined));
}
