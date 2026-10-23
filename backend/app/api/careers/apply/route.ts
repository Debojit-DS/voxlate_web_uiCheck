import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { z } from "zod";
import { prisma } from "@/lib/db";

const applicationSchema = z.object({
  fullName: z.string().trim().min(1).max(120), email: z.string().trim().email().max(254).toLowerCase(),
  contactNumber: z.string().trim().min(1).max(50), college: z.string().trim().min(1).max(250),
  currentYear: z.string().trim().min(1).max(50), roleAppliedFor: z.string().trim().min(1).max(250),
  strongestSkills: z.string().trim().min(1).max(10000), motivation: z.string().trim().min(1).max(10000),
  projectDetails: z.string().max(10000).nullish(), proposedIdea: z.string().trim().min(1).max(10000),
  uniqueEdge: z.string().trim().min(1).max(10000), portfolioLinks: z.string().max(2000).nullish(),
  resumeUrl: z.string().url().refine((url) => url.startsWith("https://")),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = applicationSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return withSecurityHeaders(NextResponse.json({ status: "error", code: "validation_error", message: "Please check the required fields, email address, and uploaded resume." }, { status: 400 }));
    }
    const { fullName, email, contactNumber, college, currentYear, roleAppliedFor, strongestSkills,
      motivation, projectDetails, proposedIdea, uniqueEdge, portfolioLinks, resumeUrl } = parsed.data;

    const application = await prisma.jobApplication.create({
      data: {
        fullName,
        email,
        contactNumber,
        college,
        currentYear,
        roleAppliedFor,
        strongestSkills,
        motivation,
        projectDetails,
        proposedIdea,
        uniqueEdge,
        portfolioLinks,
        resumeUrl,
      },
    });

    const res = NextResponse.json({
      status: "success",
      data: { id: application.id },
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  } catch {
    const res = NextResponse.json(
      { status: "error", code: "service_unavailable", message: "Applications are temporarily unavailable. Please try again later." },
      { status: 503 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }
}
