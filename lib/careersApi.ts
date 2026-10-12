import { apiRequest } from "./apiClient";

export type CareerAnswers = {
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
  links: string;
};

async function careerResponse(response: Response) {
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.status !== "success") {
    throw new Error(typeof data?.message === "string" ? data.message : "Your application couldn't be processed. Please try again.");
  }
  return data;
}

export async function uploadCareerResume(file: File): Promise<string> {
  if (file.type !== "application/pdf" || !file.size || file.size > 10 * 1024 * 1024) {
    throw new Error("Please choose a PDF resume under 10 MB.");
  }
  const body = new FormData();
  body.append("resume", file);
  const data = await careerResponse(await apiRequest("/api/upload/resume", { method: "POST", body }, 30_000));
  const url = data.data?.url;
  if (typeof url !== "string" || !URL.canParse(url) || new URL(url).protocol !== "https:") {
    throw new Error("Your resume upload couldn't be confirmed. Please try again.");
  }
  return url;
}

export async function submitCareerApplication(answers: CareerAnswers, resumeUrl: string): Promise<string> {
  const payload = {
    fullName: answers.fullName.trim(),
    email: answers.email.trim(),
    contactNumber: answers.phone.trim(),
    college: answers.college.trim(),
    currentYear: answers.year,
    roleAppliedFor: answers.role,
    strongestSkills: answers.skills.trim(),
    motivation: answers.motivation.trim(),
    projectDetails: answers.project.trim() || null,
    proposedIdea: answers.ideas.trim(),
    uniqueEdge: answers.differentiator.trim(),
    portfolioLinks: answers.links.trim() || null,
    resumeUrl,
  };
  const data = await careerResponse(await apiRequest("/api/careers/apply", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  }, 30_000));
  if (typeof data.data?.id !== "string" || !data.data.id) {
    throw new Error("Your application could not be confirmed. Please try again.");
  }
  return data.data.id;
}
