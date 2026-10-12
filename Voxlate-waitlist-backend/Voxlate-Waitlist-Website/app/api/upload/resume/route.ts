import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { getClientIp, generateCorrelationId } from "@/lib/correlationId";
import { checkRateLimit as checkUploadRateLimit } from "@/lib/rateLimiter";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimitKey = `upload:${ip}`;
  if (!checkUploadRateLimit(rateLimitKey, 10, 60_000)) {
    const res = NextResponse.json(
      { status: "error", code: "rate_limit", message: "Too many upload attempts. Please try again later." },
      { status: 429 }
    );
    return withCors(res);
  }

  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!(file instanceof File)) {
      const res = NextResponse.json(
        { status: "error", code: "validation_error", message: "Resume file is required." },
        { status: 400 }
      );
      return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
    }

    if (file.type !== "application/pdf") {
      const res = NextResponse.json(
        { status: "error", code: "validation_error", message: "Only PDF files are allowed." },
        { status: 400 }
      );
      return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
    }

    if (file.size > 10 * 1024 * 1024) {
      const res = NextResponse.json(
        { status: "error", code: "validation_error", message: "File size must be less than 10MB." },
        { status: 400 }
      );
      return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "voxlate/resumes",
          timeout: 25_000,
          resource_type: "raw",
          format: "pdf",
        },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error);
          } else {
            resolve({ secure_url: uploadResult.secure_url });
          }
        }
      ).end(buffer);
    });

    const res = NextResponse.json({
      status: "success",
      data: { url: result.secure_url },
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  } catch (err) {
    console.error("Cloudinary PDF upload error", err);
    const res = NextResponse.json(
      { status: "error", code: "upload_error", message: "Failed to upload resume." },
      { status: 500 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }
}
