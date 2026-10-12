import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { getClientIp, generateCorrelationId } from "@/lib/correlationId";
import { checkRateLimit as checkUploadRateLimit } from "@/lib/rateLimiter";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadSchema = z.object({
  photo: z.string().optional(),
}).refine((data) => {
  if (data.photo && !data.photo.startsWith("data:image/")) {
    return false;
  }
  return true;
}, {
  message: "Invalid photo format",
  path: ["photo"],
});

function base64ToBuffer(dataUrl: string): Buffer {
  const base64 = dataUrl.split(",")[1];
  return Buffer.from(base64, "base64");
}

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

  const parsed = uploadSchema.safeParse(body);
  if (!parsed.success || !parsed.data.photo) {
    const res = NextResponse.json(
      { status: "error", code: "validation_error", message: "Photo data is required." },
      { status: 400 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  try {
    const buffer = base64ToBuffer(parsed.data.photo);
    if (!buffer.length || buffer.length > 10 * 1024 * 1024 || !/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(parsed.data.photo)) {
      return withSecurityHeaders(NextResponse.json({ status: "error", code: "validation_error", message: "Upload a JPG, PNG, WebP, or GIF under 10 MB." }, { status: 400 }));
    }
    const mimeMatch = parsed.data.photo.match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "voxlate/profiles",
          timeout: 25_000,
          resource_type: "image",
          format: mimeType.split("/")[1] || "jpg",
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
    console.error("Cloudinary upload error", err);
    const res = NextResponse.json(
      { status: "error", code: "upload_error", message: "Failed to upload image." },
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
