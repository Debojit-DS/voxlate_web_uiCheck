"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/lib/authApi";
import { loginSchema, type LoginFormValues } from "@/lib/authValidation";
import { safeRedirect } from "@/lib/safeRedirect";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { AuthFormError } from "@/components/auth/AuthFormError";
import { AuthShell, AuthStatus } from "@/components/auth/AuthShell";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const redirectTo = safeRedirect(searchParams.get("redirectTo"));
  const queryString = searchParams.toString();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    setFormError(null);
    const result = await loginUser(values);
    setIsSubmitting(false);

    if (result.status === "success") {
      login(result.data);
      setSuccess(true);
      setTimeout(() => router.push(redirectTo), 1500);
    } else if (result.code === "invalid_credentials") {
      setFormError("That email or password doesn't look right. Please try again.");
    } else if (result.code === "server_error") {
      setFormError("Something went wrong. Please try again.");
    } else {
      setFormError(result.message);
    }
  }

  if (success) return <AuthStatus title="Signed in" message="Redirecting you..." />;

  return (
    <AuthShell title="Welcome Back" subtitle="Login to access your Voxlate account.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" aria-busy={isSubmitting} noValidate>
        {formError && <AuthFormError message={formError} />}

        <Input id="email" label="Email Address" type="email" autoComplete="email" registration={register("email")} error={errors.email?.message} />
        <PasswordInput id="password" label="Password" autoComplete="current-password" registration={register("password")} error={errors.password?.message} />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log In"}
        </Button>

        <p className="text-center text-[14px] text-slate">
          Don&apos;t have an account?{" "}
          <Link href={`/signup${queryString ? `?${queryString}` : ""}`} className="text-link">
            Sign up
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
