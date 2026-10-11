"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SquareCheck, User } from "lucide-react";
import { checkWaitlistStatus, submitToWaitlist, syncWaitlistPhoto } from "@/lib/waitlistApi";
import { uploadPhoto } from "@/lib/uploadApi";
import { waitlistSchema, type WaitlistFormValues } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import type { UseFormRegisterReturn } from "react-hook-form";

function Choice({ registration, value, label }: { registration: UseFormRegisterReturn; value: string; label: string }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" value={value} {...registration} className="peer sr-only" />
      <span className="flex h-11 items-center justify-center rounded-[10px] border border-line-strong px-3 text-center text-[14px] font-medium text-ink transition-colors hover:bg-mist peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
        {label}
      </span>
    </label>
  );
}

function Done({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  return (
    <div className="text-center" role="status">
      <SquareCheck className="mx-auto mb-4 text-success" size={40} aria-hidden />
      <p className="font-display text-[26px] leading-tight text-ink">{title}</p>
      <p className="mt-2 text-[15px] text-slate">{message}</p>
      <Button onClick={onClose} className="mt-6 w-full">
        Done
      </Button>
    </div>
  );
}

function WaitlistForm() {
  const { closeModal, source } = useWaitlistModal();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<{ title: string; message: string } | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const hasExistingPhoto = !!user?.photoUrl;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      company: "",
      role: "",
      organization: "",
      type: "individual",
      product: source?.startsWith("physical") ? "physical" : "digital",
      source: source ?? "",
      photo: user?.photoUrl ?? "",
    },
    mode: "onBlur",
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError(null);

    if (!file) {
      setPhotoPreview(null);
      setValue("photo", "");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file.");
      setPhotoPreview(null);
      setValue("photo", "");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError("Image must be less than 10MB.");
      setPhotoPreview(null);
      setValue("photo", "");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl);
      setValue("photo", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  async function onSubmit(values: WaitlistFormValues) {
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

    const response = await submitToWaitlist({ ...values, photo: photoUrl });
    setIsSubmitting(false);

    if (response.status === "success") {
      setResult({ title: "You're on the list!", message: response.message });
      window.dispatchEvent(new Event("waitlist:joined"));
    } else if (response.code === "duplicate_email") {
      setResult({ title: "You're on the list!", message: "Looks like you're already on the waitlist with this email!" });
      window.dispatchEvent(new Event("waitlist:joined"));
    } else if (response.code === "validation_error") {
      setFormError(response.message || "Please check your inputs and try again.");
    } else {
      setFormError(response.message || "Something went wrong. Please try again.");
    }
  }

  if (result) return <Done title={result.title} message={result.message} onClose={closeModal} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {formError && (
        <div role="alert" className="rounded-[10px] border border-danger bg-danger-tint px-4 py-3 text-[14px] text-danger">
          {formError}
        </div>
      )}

      <Input id="wl-name" label="Full Name" autoComplete="name" registration={register("name")} error={errors.name?.message} />
      <Input id="wl-email" label="Email Address" type="email" autoComplete="email" registration={register("email")} error={errors.email?.message} />
      <Input id="wl-company" label="Organization Name" optional autoComplete="organization" registration={register("company")} error={errors.company?.message} />
      <Input
        id="wl-role"
        label="Your profession"
        optional
        hint="For example: student, professor, etc."
        autoComplete="organization-title"
        registration={register("role")}
        error={errors.role?.message}
      />

      {!hasExistingPhoto && (
        <div>
          <label htmlFor="wl-photo" className="field-label">
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
              id="wl-photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              aria-describedby="wl-photo-hint"
              className="block w-full text-[14px] text-slate file:mr-3 file:h-10 file:cursor-pointer file:rounded-[10px] file:border file:border-line-strong file:bg-surface file:px-4 file:text-[14px] file:font-medium file:text-ink hover:file:bg-mist"
            />
          </div>
          <p id="wl-photo-hint" className="field-hint">
            Max 10MB. JPG, PNG, or WebP. Shown beside your name in the public waitlist directory.
          </p>
          {photoError && <p className="field-error">{photoError}</p>}
          {errors.photo && <p className="field-error">{errors.photo.message}</p>}
        </div>
      )}

      <fieldset>
        <legend className="field-label">I&apos;m signing up as</legend>
        <div className="grid grid-cols-2 gap-2">
          <Choice registration={register("type")} value="individual" label="Individual" />
          <Choice registration={register("type")} value="business" label="Business" />
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label">I&apos;m waitlisting for</legend>
        <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-3">
          <Choice registration={register("product")} value="digital" label="Digital version" />
          <Choice registration={register("product")} value="physical" label="Physical version" />
          <Choice registration={register("product")} value="both" label="Both" />
        </div>
        {errors.product && <p className="field-error">{errors.product.message}</p>}
      </fieldset>

      <Button type="submit" className="w-full" loading={isSubmitting}>
        {isSubmitting ? "Joining…" : "Join Waitlist"}
      </Button>
    </form>
  );
}

export function WaitlistModal() {
  const { isOpen, closeModal } = useWaitlistModal();
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!isOpen || !user?.email) return;

    let cancelled = false;
    setIsChecking(true);
    setHasJoined(false);

    checkWaitlistStatus(user.email).then(async (result) => {
      if (cancelled) return;
      if (result.status === "success" && result.data.joined) {
        setHasJoined(true);
        if (user.photoUrl) {
          await syncWaitlistPhoto(user.email, user.photoUrl);
        }
      }
      setIsChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, user?.email, user?.photoUrl]);

  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      title={hasJoined && !isChecking ? "You're already on the list!" : "Join the Voxlate Waitlist"}
      description={isChecking || hasJoined ? undefined : "Be first in line. Get notified the moment Voxlate launches."}
    >
      {isChecking ? (
        <p role="status" className="py-4 text-[15px] text-slate">
          Checking waitlist status…
        </p>
      ) : hasJoined ? (
        <Done title="You're on the list!" message="We'll notify you when Voxlate launches. The web demo is unlocked for your account." onClose={closeModal} />
      ) : (
        <WaitlistForm />
      )}
    </Modal>
  );
}
