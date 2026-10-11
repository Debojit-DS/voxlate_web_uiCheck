"use client";

import { useEffect, useRef, useState } from "react";
import { SquareCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

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

const Req = () => <span className="ml-1 font-normal text-slate">(required)</span>;
const Opt = () => <span className="ml-1 font-normal text-slate">(optional)</span>;

export default function CareersPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
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
    setProgress("Uploading your resume…");

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

      setProgress("Sending your application…");
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
      setProgress(null);
    }
  };

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="pb-20 md:pb-28">
        <div className="page-container pb-10 pt-14 md:pt-20">
          <span className="status-tag">We&apos;re Hiring</span>
          <h1 className="display-page mt-5 max-w-[820px]">Voxlate — Careers Application</h1>
          <p className="lead mt-6">
            Join our core team shaping the future of real-time voice intelligence and wearable tech. Fill out the
            application below to get started.
          </p>
        </div>

        {submitted ? (
          <div className="page-container">
            <div className="max-w-[720px] rounded-[18px] border border-line bg-surface p-8 md:p-10" role="status">
              <SquareCheck className="text-success" size={36} aria-hidden />
              <h2 ref={successRef} tabIndex={-1} className="mt-4 font-display text-[32px] leading-tight text-ink">
                Application Received!
              </h2>
              <p className="mt-3 text-[16px] leading-relaxed text-slate">
                Thanks for applying to join the Voxlate team. We will review your profile and reach out via email/phone
                shortly.
              </p>
            </div>
          </div>
        ) : (
          <div className="page-container">
          <form onSubmit={handleSubmit} className="max-w-[820px]">
            <fieldset className="border-t border-ink pt-6">
              <legend className="float-left w-full font-display text-[26px] leading-tight text-ink">Candidate Profile & Academic Background</legend>
              <div className="clear-both space-y-5 pt-6">
                <div>
                  <label htmlFor="c-name" className="field-label">Full Name<Req /></label>
                  <input id="c-name" type="text" required autoComplete="name" value={form.fullName} onChange={update("fullName")} placeholder="e.g., Jane Doe" className="field" />
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="c-email" className="field-label">Email Address<Req /></label>
                    <input id="c-email" type="email" required autoComplete="email" value={form.email} onChange={update("email")} placeholder="jane@example.com" className="field" />
                  </div>
                  <div>
                    <label htmlFor="c-phone" className="field-label">Contact Number<Req /></label>
                    <input id="c-phone" type="tel" required autoComplete="tel" value={form.phone} onChange={update("phone")} placeholder="Enter your contact number" className="field" />
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <label htmlFor="c-college" className="field-label">College / University<Req /></label>
                    <input id="c-college" type="text" required value={form.college} onChange={update("college")} placeholder="Enter your institution" className="field" />
                  </div>
                  <div>
                    <label htmlFor="c-year" className="field-label">Current Year<Req /></label>
                    <select id="c-year" required value={form.year} onChange={update("year")} className="field">
                      <option value="">Select year</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="mt-14 border-t border-ink pt-6">
              <legend className="float-left w-full font-display text-[26px] leading-tight text-ink">Role Selection & Core Capabilities</legend>
              <div className="clear-both space-y-5 pt-6">
                <div>
                  <label htmlFor="c-role" className="field-label">Which Role are you applying for?<Req /></label>
                  <select id="c-role" required value={form.role} onChange={update("role")} className="field">
                    <option value="">Select a role</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="c-skills" className="field-label">What are your strongest skills?<Req /></label>
                  <p id="c-skills-hint" className="mb-2 text-[13px] text-slate">Technical, creative, communication, marketing, leadership, etc.</p>
                  <textarea id="c-skills" required aria-describedby="c-skills-hint" value={form.skills} onChange={update("skills")} placeholder="e.g., Python, Next.js, Fast-API, Hardware Prototyping, Growth Strategy, Pitch Presentations..." rows={4} className="field resize-y" />
                </div>
              </div>
            </fieldset>

            <fieldset className="mt-14 border-t border-ink pt-6">
              <legend className="float-left w-full font-display text-[26px] leading-tight text-ink">Motivation, Vision & Track Record</legend>
              <div className="clear-both space-y-5 pt-6">
                <div>
                  <label htmlFor="c-motivation" className="field-label">Why do you want to join Voxlate, and what interests you about this role?<Req /></label>
                  <textarea id="c-motivation" required value={form.motivation} onChange={update("motivation")} placeholder="Tell us what excites you about building wearable real-time voice translation and how you see yourself contributing..." rows={5} className="field resize-y" />
                </div>
                <div>
                  <label htmlFor="c-project" className="field-label">Tell us about one project, achievement, experience, or initiative you&apos;re proud of.<Opt /></label>
                  <p id="c-project-hint" className="mb-2 text-[13px] text-slate">Optional, but highly recommended. Include technical depth, links, metrics, or personal impact.</p>
                  <textarea id="c-project" aria-describedby="c-project-hint" value={form.project} onChange={update("project")} placeholder="Describe the problem, your solution, technologies/strategies used, and the measurable outcome..." rows={5} className="field resize-y" />
                </div>
                <div>
                  <label htmlFor="c-ideas" className="field-label">If you joined Voxlate, what is one idea or improvement you would bring to the company?<Req /></label>
                  <textarea id="c-ideas" required value={form.ideas} onChange={update("ideas")} placeholder="A product feature, technical optimization, marketing strategy, or internal workflow improvement..." rows={4} className="field resize-y" />
                </div>
                <div>
                  <label htmlFor="c-diff" className="field-label">What makes you different from other candidates, and why should we choose you?<Req /></label>
                  <textarea id="c-diff" required value={form.differentiator} onChange={update("differentiator")} placeholder="Highlight your unique edge, grit, fast-learning ability, or domain expertise..." rows={4} className="field resize-y" />
                </div>
              </div>
            </fieldset>

            <fieldset className="mt-14 border-t border-ink pt-6">
              <legend className="float-left w-full font-display text-[26px] leading-tight text-ink">Portfolios & Links</legend>
              <div className="clear-both space-y-5 pt-6">
                <div>
                  <label htmlFor="c-resume" className="field-label">Resume/CV (PDF)<Req /></label>
                  <input
                    id="c-resume"
                    type="file"
                    accept="application/pdf"
                    required
                    aria-describedby="c-resume-hint"
                    onChange={update("resume")}
                    className="block w-full text-[14px] text-slate file:mr-3 file:h-11 file:cursor-pointer file:rounded-[10px] file:border file:border-line-strong file:bg-surface file:px-4 file:text-[14px] file:font-medium file:text-ink hover:file:bg-mist"
                  />
                  <p id="c-resume-hint" className="field-hint">Upload your resume in PDF format. Max size: 10MB.</p>
                  {form.resume && (
                    <p className="mt-2 text-[14px] text-ink">
                      Selected: <span className="font-medium">{form.resume.name}</span> ({(form.resume.size / 1024 / 1024).toFixed(1)} MB)
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="c-links" className="field-label">Portfolio / GitHub / LinkedIn URLs<Req /></label>
                  <input id="c-links" type="text" required value={form.links} onChange={update("links")} placeholder="https://github.com/... | https://linkedin.com/in/..." className="field" />
                </div>
              </div>
            </fieldset>

            {error && (
              <div role="alert" className="mt-8 rounded-[10px] border border-danger bg-danger-tint px-4 py-3 text-[14px] text-danger">
                {error} Your answers are still here.
              </div>
            )}

            <div className="mt-10 flex flex-col-reverse gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[14px] text-slate" role="status">{progress}</p>
              <Button type="submit" loading={isSubmitting} wide>
                {isSubmitting ? "Submitting your application..." : "Submit Application"}
              </Button>
            </div>
          </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
