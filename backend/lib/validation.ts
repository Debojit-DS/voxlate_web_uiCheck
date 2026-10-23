import { z } from "zod";

export const waitlistSchema = z.object({
  name: z.string().min(1, "Full name is required").max(120),
  email: z.string().email("Enter a valid email address"),
  company: z.string().max(200).optional().or(z.literal("")),
  type: z.enum(["individual", "business"]),
  product: z.enum(["digital", "physical", "both"]),
  source: z.string().optional().or(z.literal("")),
  role: z.string().max(120).optional().or(z.literal("")),
  organization: z.string().max(200).optional().or(z.literal("")),
  photo: z.string().optional(),
}).refine(
  (data) => {
    if (data.photo && !data.photo.startsWith("data:image/") && !data.photo.startsWith("http")) {
      return false;
    }
    return true;
  },
  {
    message: "Photo must be a valid image file.",
    path: ["photo"],
  }
);

export type WaitlistFormValues = z.infer<typeof waitlistSchema>;