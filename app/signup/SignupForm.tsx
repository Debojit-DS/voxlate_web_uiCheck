"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { signupUser } from "@/lib/authApi";
import { uploadPhoto } from "@/lib/uploadApi";
import { submitToWaitlist } from "@/lib/waitlistApi";
import { signupSchema, type SignupFormValues } from "@/lib/authValidation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { AuthFormError } from "@/components/auth/AuthFormError";
import { AuthShell, AuthStatus } from "@/components/auth/AuthShell";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const redirectTo = searchParams.get("redirectTo") || "/";
  const queryString = searchParams.toString();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignupFormValues & { joinWaitlist?: boolean }>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", agreedToTerms: false, joinWaitlist: false, photo: "" },
    mode: "onBlur",
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoPreview(null);
      setValue("photo", "");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setFormError("Please select an image file.");
      setPhotoPreview(null);
      setValue("photo", "");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFormError("Image must be less than 10MB.");
      setPhotoPreview(null);
      setValue("photo", "");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setValue("photo", result);
      setFormError(null);
    };
    reader.readAsDataURL(file);
  };

  async function onSubmit(values: SignupFormValues) {
    setIsSubmitting(true);
    setFormError(null);

    let photoUrl = values.photo || "";
    if (photoUrl && photoUrl.startsWith("data:image/")) {
      const uploaded = await uploadPhoto(photoUrl);
      if (!uploaded) {
        setFormError("Failed to upload photo. Please try again.");
        setIsSubmitting(false);
        return;
      }
      photoUrl = uploaded.url;
    }

    const result = await signupUser({ ...values, photo: photoUrl });
    setIsSubmitting(false);

    if (result.status === "success") {
      signup({ ...result.data, photoUrl: result.data.photoUrl });

      if (values.joinWaitlist) {
        await submitToWaitlist({
          name: values.name,
          email: values.email,
          company: "",
          role: "",
          organization: "",
          type: "individual" as const,
          product: "digital" as const,
          source: "signup",
          photo: photoUrl || result.data.photoUrl || "",
        });
      }

      setSuccess(true);
      setTimeout(() => router.push(redirectTo), 1500);
    } else if (result.code === "email_taken") {
      setFormError("An account with this email already exists.");
    } else if (result.code === "server_error") {
      setFormError("Something went wrong. Please try again.");
    } else {
      setFormError(result.message);
    }
  }

  if (success) return <AuthStatus title="Account created" message="Redirecting you..." />;

  return (
    <AuthShell title="Create Your Account" subtitle="Join Voxlate and be part of the future of communication.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" aria-busy={isSubmitting} noValidate>
        {formError && <AuthFormError message={formError} />}

        <Input id="name" label="Full Name" autoComplete="name" registration={register("name")} error={errors.name?.message} />
        <Input id="email" label="Email Address" type="email" autoComplete="email" registration={register("email")} error={errors.email?.message} />

        <div>
          <label htmlFor="photo" className="field-label">
            Hiding that cute smile should be illegal — come on, let the world see it: add a profile photo!{" "}
            <span className="font-normal text-slate">(optional)</span>
          </label>
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-mist">
              {photoPreview ? (
                <img src={photoPreview} alt="Selected photo preview" className="h-full w-full object-cover" />
              ) : (
                <User className="text-slate" size={22} aria-hidden />
              )}
            </span>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              aria-describedby="photo-hint"
              className="block w-full text-[14px] text-slate file:mr-3 file:h-10 file:cursor-pointer file:rounded-[10px] file:border file:border-line-strong file:bg-surface file:px-4 file:text-[14px] file:font-medium file:text-ink hover:file:bg-mist"
            />
          </div>
          <p id="photo-hint" className="field-hint">Max 10MB. JPG, PNG, or WebP.</p>
          {errors.photo && <p className="field-error">{errors.photo.message}</p>}
        </div>

        <PasswordInput
          id="password"
          label="Password"
          autoComplete="new-password"
          hint="At least 8 characters."
          registration={register("password")}
          error={errors.password?.message}
        />
        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          autoComplete="new-password"
          registration={register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        <div className="space-y-3 border-t border-line pt-5">
          <div className="flex items-start gap-3">
            <input
              id="agreedToTerms"
              type="checkbox"
              aria-invalid={errors.agreedToTerms ? true : undefined}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary"
              {...register("agreedToTerms")}
            />
            <label htmlFor="agreedToTerms" className="text-[14px] leading-relaxed text-ink">
              I agree to the{" "}
              <a href="/terms" className="text-link">Terms of Service</a> and{" "}
              <a href="/privacy" className="text-link">Privacy Policy</a>
            </label>
          </div>
          {errors.agreedToTerms && <p className="field-error">{errors.agreedToTerms.message}</p>}

          <div className="flex items-start gap-3">
            <input id="joinWaitlist" type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary" {...register("joinWaitlist")} />
            <label htmlFor="joinWaitlist" className="text-[14px] leading-relaxed text-ink">
              I want to join the waitlist and get early access updates
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full" loading={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>

        <p className="text-center text-[14px] text-slate">
          Already have an account?{" "}
          <Link href={`/login${queryString ? `?${queryString}` : ""}`} className="text-link">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
