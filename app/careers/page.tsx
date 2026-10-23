"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { CareersGate } from "@/components/auth/CareersGate";

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  role: string;
  skills: string;
  motivation: string;
  project: string;
  ideas: string;
  differentiator: string;
  resume: File | null;
  links: string;
};

const ROLES = [
  "Tech (Full-Stack / Backend / Frontend)",
  "AI / ML (Speech, LLMs, Computer Vision)",
  "Cybersecurity",
  "Hardware & Embedded Systems",
  "Marketing & Growth",
  "Sales & Business Development",
  "UI / UX Design",
  "Other",
];

const YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Postgraduate / Alum",
  "Other",
];

export default function CareersPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    year: "",
    role: "",
    skills: "",
    motivation: "",
    project: "",
    ideas: "",
    differentiator: "",
    resume: null,
    links: "",
  });

  const update = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    if (field === "resume" && target.files?.[0]) {
      const file = target.files[0];
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file only.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB.");
        return;
      }
      setError(null);
      setForm((prev) => ({ ...prev, resume: file }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.resume) {
      setError("Please upload your resume in PDF format.");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("resume", form.resume);

      const uploadRes = await fetch("/api/upload/resume", {
        method: "POST",
        body: uploadFormData,
        signal: AbortSignal.timeout(30_000),
      });

      if (!uploadRes.ok) {
        const uploadData = await uploadRes.json().catch(() => ({}));
        throw new Error(uploadData.message || "Failed to upload resume.");
      }

      const uploadData = await uploadRes.json();
      const resumeUrl = uploadData.data?.url;

      if (!resumeUrl) {
        throw new Error("Resume URL not returned from upload.");
      }

      const payload = {
        fullName: form.fullName,
        email: form.email,
        contactNumber: form.phone,
        college: form.college,
        currentYear: form.year,
        roleAppliedFor: form.role,
        strongestSkills: form.skills,
        motivation: form.motivation,
        projectDetails: form.project || null,
        proposedIdea: form.ideas,
        uniqueEdge: form.differentiator,
        portfolioLinks: form.links || null,
        resumeUrl,
      };

      const submitRes = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30_000),
      });

      if (!submitRes.ok) {
        const submitData = await submitRes.json().catch(() => ({}));
        throw new Error(submitData.message || "Failed to submit application.");
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Application submission error", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <CareersGate>
        <div className="min-h-screen bg-[#f6faff] flex items-center justify-center px-6">
          <div className="max-w-[860px] w-full">
            <div className="rounded-2xl border border-[#c5c6d0] bg-white p-8 md:p-12 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#d8e2ff]">
                <CheckCircle2 className="h-8 w-8 text-[#001b44]" />
              </div>
              <h2 className="text-2xl font-bold text-[#001b44] mb-2">Application Received!</h2>
              <p className="text-[#44474f]">
                Thanks for applying to join the Voxlate team. We will review your profile and reach out via email/phone shortly.
              </p>
            </div>
          </div>
        </div>
      </CareersGate>
    );
  }

  return (
    <CareersGate>
      <div className="min-h-screen bg-[#f6faff]" style={{ backgroundImage: "radial-gradient(circle at top, rgba(0,89,187,0.04), transparent 40%)" }}>
        <div className="mx-auto max-w-[860px] px-6 py-10 md:py-14">
          <div className="text-center mb-10">
            <span className="inline-block rounded-full bg-[#001b44] px-4 py-1.5 text-xs font-semibold text-white mb-4">
              🚀 We&apos;re Hiring
            </span>
            <h1 className="text-[32px] font-bold text-[#001b44] leading-[40px] tracking-tight mb-3">
              🚀 Voxlate — Careers Application
            </h1>
            <p className="text-[15px] text-[#44474f] leading-relaxed max-w-2xl mx-auto">
              Join our core team shaping the future of real-time voice intelligence and wearable tech. Fill out the application below to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="rounded-2xl border border-[#c5c6d0] bg-white p-6 md:p-10">
              <h2 className="text-lg font-semibold text-[#001b44] mb-6">Candidate Profile & Academic Background</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#141d23] mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={update("fullName")}
                    placeholder="e.g., Jane Doe"
                    className="w-full rounded-md border border-[#c5c6d0] bg-white px-4 py-2.5 text-sm text-[#141d23] outline-none transition-colors focus:border-[#0059bb] focus:shadow-[0_0_0_3px_rgba(0,89,187,0.15)]"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-[#141d23] mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={update("email")}
                      placeholder="jane@example.com"
                      className="w-full rounded-md border border-[#c5c6d0] bg-white px-4 py-2.5 text-sm text-[#141d23] outline-none transition-colors focus:border-[#0059bb] focus:shadow-[0_0_0_3px_rgba(0,89,187,0.15)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#141d23] mb-1.5">Contact Number *</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={update("phone")}
                      placeholder="Enter your contact number"
                      className="w-full rounded-md border border-[#c5c6d0] bg-white px-4 py-2.5 text-sm text-[#141d23] outline-none transition-colors focus:border-[#0059bb] focus:shadow-[0_0_0_3px_rgba(0,89,187,0.15)]"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#141d23] mb-1.5">College / University *</label>
                    <input
                      type="text"
                      required
                      value={form.college}
                      onChange={update("college")}
                      placeholder="Enter your institution"
                      className="w-full rounded-md border border-[#c5c6d0] bg-white px-4 py-2.5 text-sm text-[#141d23] outline-none transition-colors focus:border-[#0059bb] focus:shadow-[0_0_0_3px_rgba(0,89,187,0.15)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#141d23] mb-1.5">Current Year *</label>
                    <select
                      required
                      value={form.year}
                      onChange={update("year")}
                      className="w-full rounded-md border border-[#c5c6d0] bg-white px-4 py-2.5 text-sm text-[#141d23] outline-none transition-colors focus:border-[#0059bb] focus:shadow-[0_0_0_3px_rgba(0,89,187,0.15)]"
                    >
                      <option value="">Select year</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#c5c6d0] bg-white p-6 md:p-10">
              <h2 className="text-lg font-semibold text-[#001b44] mb-6">Role Selection & Core Capabilities</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#141d23] mb-1.5">Which Role are you applying for? *</label>
                  <select
                    required
                    value={form.role}
                    onChange={update("role")}
                    className="w-full rounded-md border border-[#c5c6d0] bg-white px-4 py-2.5 text-sm text-[#141d23] outline-none transition-colors focus:border-[#0059bb] focus:shadow-[0_0_0_3px_rgba(0,89,187,0.15)]"
                  >
                    <option value="">Select a role</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#141d23] mb-1.5">What are your strongest skills? *</label>
                  <p className="text-xs text-[#44474f] mb-1.5">Technical, creative, communication, marketing, leadership, etc.</p>
                  <textarea
                    required
                    value={form.skills}
                    onChange={update("skills")}
                    placeholder="e.g., Python, Next.js, Fast-API, Hardware Prototyping, Growth Strategy, Pitch Presentations..."
                    rows={4}
                    className="w-full rounded-md border border-[#c5c6d0] bg-white px-4 py-2.5 text-sm text-[#141d23] outline-none transition-colors focus:border-[#0059bb] focus:shadow-[0_0_0_3px_rgba(0,89,187,0.15)] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#c5c6d0] bg-white p-6 md:p-10">
              <h2 className="text-lg font-semibold text-[#001b44] mb-6">Motivation, Vision & Track Record</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#141d23] mb-1.5">Why do you want to join Voxlate, and what interests you about this role? *</label>
                  <textarea
                    required
                    value={form.motivation}
                    onChange={update("motivation")}
                    placeholder="Tell us what excites you about building wearable real-time voice translation and how you see yourself contributing..."
                    rows={4}
                    className="w-full rounded-md border border-[#c5c6d0] bg-white px-4 py-2.5 text-sm text-[#141d23] outline-none transition-colors focus:border-[#0059bb] focus:shadow-[0_0_0_3px_rgba(0,89,187,0.15)] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#141d23] mb-1.5">
                    Tell us about one project, achievement, experience, or initiative you&apos;re proud of.
                  </label>
                  <p className="text-xs text-[#44474f] mb-1.5">Optional, but highly recommended. Include technical depth, links, metrics, or personal impact.</p>
                  <textarea
                    value={form.project}
                    onChange={update("project")}
                    placeholder="Describe the problem, your solution, technologies/strategies used, and the measurable outcome..."
                    rows={4}
                    className="w-full rounded-md border border-[#c5c6d0] bg-white px-4 py-2.5 text-sm text-[#141d23] outline-none transition-colors focus:border-[#0059bb] focus:shadow-[0_0_0_3px_rgba(0,89,187,0.15)] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#141d23] mb-1.5">If you joined Voxlate, what is one idea or improvement you would bring to the company? *</label>
                  <textarea
                    required
                    value={form.ideas}
                    onChange={update("ideas")}
                    placeholder="A product feature, technical optimization, marketing strategy, or internal workflow improvement..."
                    rows={3}
                    className="w-full rounded-md border border-[#c5c6d0] bg-white px-4 py-2.5 text-sm text-[#141d23] outline-none transition-colors focus:border-[#0059bb] focus:shadow-[0_0_0_3px_rgba(0,89,187,0.15)] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#141d23] mb-1.5">What makes you different from other candidates, and why should we choose you? *</label>
                  <textarea
                    required
                    value={form.differentiator}
                    onChange={update("differentiator")}
                    placeholder="Highlight your unique edge, grit, fast-learning ability, or domain expertise..."
                    rows={3}
                    className="w-full rounded-md border border-[#c5c6d0] bg-white px-4 py-2.5 text-sm text-[#141d23] outline-none transition-colors focus:border-[#0059bb] focus:shadow-[0_0_0_3px_rgba(0,89,187,0.15)] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#c5c6d0] bg-white p-6 md:p-10">
              <h2 className="text-lg font-semibold text-[#001b44] mb-6">Portfolios & Links</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#141d23] mb-1.5">Resume/CV (PDF) *</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    required
                    onChange={update("resume")}
                    className="w-full rounded-md border border-[#c5c6d0] bg-white px-4 py-2.5 text-sm text-[#141d23] outline-none transition-colors focus:border-[#0059bb] focus:shadow-[0_0_0_3px_rgba(0,89,187,0.15)]"
                  />
                  <p className="text-xs text-[#44474f] mt-1">Upload your resume in PDF format. Max size: 10MB.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#141d23] mb-1.5">Portfolio / GitHub / LinkedIn URLs *</label>
                  <input
                    type="text"
                    required
                    value={form.links}
                    onChange={update("links")}
                    placeholder="https://github.com/... | https://linkedin.com/in/..."
                    className="w-full rounded-md border border-[#c5c6d0] bg-white px-4 py-2.5 text-sm text-[#141d23] outline-none transition-colors focus:border-[#0059bb] focus:shadow-[0_0_0_3px_rgba(0,89,187,0.15)]"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 min-w-[240px] rounded-md bg-[#001b44] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#002966] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting your application..." : "Submit Application →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </CareersGate>
  );
}