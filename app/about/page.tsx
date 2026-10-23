import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { JoinMyTeamButton } from "@/components/ui/JoinMyTeamButton";

export const metadata = {
  title: "About — Voxlate",
  description: "Meet the team building Voxlate and read our mission.",
};

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  image?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
};

type TeamGroup = {
  team: string;
  members: TeamMember[];
};

const FOUNDER: TeamMember = {
  name: "Harsh SN Sisodiya",
  role: "Founder, CEO & Product Visionary",
  bio: "Leads the company's vision, product strategy, and day-to-day execution. Oversees product development, business strategy, partnerships, and long-term innovation while guiding Voxlate toward its mission of breaking language barriers.",
  image: "/images/team/Harsh.jpeg",
  linkedin: "https://www.linkedin.com/in/harsh-sn-sisodiya-a88a9b385",
};

const TEAM_GROUPS: TeamGroup[] = [
  {
    team: "Software Team",
    members: [
      {
        name: "Debojit Deb Sarkar",
        role: "Software Tech Lead",
        bio: "Leads the technical execution of the software team, supervises development activities, and contributes to building and improving Voxlate's core platform.",
        image: "/images/team/debojit.png",
        linkedin: "https://www.linkedin.com/in/debojit-deb-sarkar",
      },
      {
        name: "Saptarshi Kar",
        role: "Full-Stack & AI/ML Developer",
        bio: "Plays a key role in building Voxlate's software platform by developing scalable software systems and integrating AI-powered technologies. Passionate about creating reliable, high-performance solutions that drive the future of real-time voice translation.",
        image: "/images/team/saptarshi.jpg",
        linkedin: "https://www.linkedin.com/in/saptarshi-kar/",
      },
       {
         name: "Samidhya Banerjee",
         role: "Full-Stack & AI/ML Developer",
         bio: "Develops and maintains Voxlate's backend infrastructure while contributing to full-stack development. Will also focus on advanced AI models and intelligent system development as the product evolves.",
         image: "/images/team/samidhya.png",
         linkedin: "https://www.linkedin.com/in/samidhya-banerjee-9ba858284/",
       },
        {
          name: "Bikram Mondal",
          role: "Full-Stack & AI/ML Developer",
          bio: "Contributes to both the front-end and back-end architecture of Voxlate, alongside implementing advanced AI/ML features. Focused on writing efficient, scalable code that bridges modern web technologies with artificial intelligence.",
          image: "/images/team/bikram.png",
          linkedin: "https://www.linkedin.com/in/workwithbikram/",
        },
      ],
    },
    {
      team: "Hardware Team",
      members: [
        {
          name: "Avigyan Roy",
          role: "Hardware Development Engineer",
          bio: "Focuses on microcontroller programming, sensor integration, and developing low-level firmware to power Voxlate’s wearable prototype.",
          image: "/images/team/avigyan.jpeg",
          linkedin: "https://www.linkedin.com/in/avigyan-roy-634368397/",
        },
        {
          name: "Saloni Gupta",
          role: "Research and Development Hardware Engineer",
          bio: "Works on circuit design, component selection, and physical prototyping to test and iterate on the wearable device's internal architecture.",
          image: "/images/team/saloni.jpeg",
          linkedin: "https://www.linkedin.com/in/saloni-gupta-0820783aa/",
        },
      ],
    },
   {
     team: "Marketing and Sales Team",
     members: [
       {
         name: "Rajdeep Kumar Debnath",
         role: "Marketing Team Member",
         bio: "Contributes to marketing campaigns, audience outreach, content planning, and brand awareness initiatives, helping expand Voxlate's reach and community.",
         image: "/images/team/Rajdeep.jpeg",
         linkedin: "https://www.linkedin.com/in/rajdeep-kumar-debnath-87313b384/",
       },
        {
          name: "Prabhat Kumar Singh",
          role: "Marketing Team Member",
          bio: "Focuses on direct user outreach, guiding prospective leads through the pipeline, and driving adoption to accelerate Voxlate's early growth.",
          image: "/images/team/prabhat.jpeg",
          linkedin: "https://www.linkedin.com/in/prabhat-kumar-singh-9680813aa/",
        },
        {
          name: "Soham Barapanda",
          role: "Marketing and Sales Team Member",
          bio: "Handles digital outreach, executes social media campaigns, and develops community-focused initiatives to strengthen brand visibility and audience engagement.",
          image: "/images/team/soham.jpeg",
          linkedin: "https://www.linkedin.com/in/soham-barapanda-4a1a63373/",
        },
        {
          name: "Urnavo Chowdhury",
          role: "Marketing and Sales Team Member",
          bio: "Manages daily sales communications, identifies new outreach opportunities, and ensures a seamless onboarding experience for individuals testing the platform.",
          image: "/images/team/Urnavo.png",
          linkedin: "https://www.linkedin.com/in/urnavo-chowdhury/",
        },
        {
          name: "Sk.Shamim Raihan",
          role: "Marketing Team Lead",
          bio: "Leads promotional planning, oversees campaign execution, and builds strategic connections to expand Voxlate's market reach.",
          image: "/images/team/shamim.jpeg",
          linkedin: "https://www.linkedin.com/in/sk-shamim-raihan-130779241/",
        },
        {
          name: "Soumyadeep Gope",
          role: "Marketing and Sales Team Member",
          bio: "Focuses on driving sales outreach, converting leads, executing promotional campaigns, and building strategic customer relationships to accelerate Voxlate's market growth.",
          image: "/images/team/Soumyadeep.png",
          linkedin: "https://www.linkedin.com/in/soumyadeep-gope/",
        },
     ],
   },
  {
    team: "Creative Team",
    members: [
      {
        name: "Sudeshna Sasmal",
        role: "Video Editing & Social Media",
        bio: "Creates engaging visual content, edits promotional videos, and manages Voxlate's social media presence to strengthen the brand and connect with the community.",
        image: "/images/team/sudeshna.jpeg",
        linkedin: "https://www.linkedin.com/in/sudeshna-sasmal-b9bb62380/",
      },
      {
        name: "Subinita Ghosh",
        role: "Content and Creative Director",
        bio: "Responsible for content strategy, creative storytelling, poetry, artistic expression, and the conceptualization and production of advertising campaigns for Voxlate.",
        image: "/images/team/subinita.png",
        linkedin: "https://www.linkedin.com/in/subinita-ghosh-bbb74b370/",
      },
      {
        name: "Raktim Chakraborty",
        role: "Visual Content & Design Lead",
        bio: "Responsible for VFX, video editing, graphic design, poster creation, and developing creative visual content for Voxlate's branding, marketing, and promotional campaigns.",
        image: "/images/team/raktim.png",
        linkedin: "https://www.linkedin.com/in/raktimchx/",
      },
    ],
  },
];

function Portrait({ member, size }: { member: TeamMember; size: number }) {
  return member.image ? (
    <Image
      src={member.image}
      alt={`Portrait of ${member.name}`}
      width={size * 2}
      height={size * 2}
      sizes={`${size}px`}
      className="shrink-0 rounded-full border border-line bg-mist object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="flex shrink-0 items-center justify-center rounded-full border border-line bg-mist font-display text-2xl text-slate"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {member.name.split(" ").map((n) => n[0]).join("")}
    </span>
  );
}

function ProfileLinks({ member }: { member: TeamMember }) {
  const links = [
    member.linkedin && { label: "LinkedIn", href: member.linkedin },
    member.github && { label: "GitHub", href: member.github },
    member.twitter && { label: "X", href: member.twitter },
  ].filter(Boolean) as { label: string; href: string }[];
  if (links.length === 0) return null;
  return (
    <p className="mt-3 flex gap-4 text-[14px]">
      {links.map((l) => (
        <UnderlineLink key={l.href} href={l.href} external variant="center">
          {l.label}
          <span className="sr-only"> profile of {member.name} (opens in a new tab)</span>
        </UnderlineLink>
      ))}
    </p>
  );
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="pb-20 md:pb-28">
        <section className="page-container pb-12 pt-14 md:pt-20">
          <h1 className="display-page">About Us</h1>
        </section>

        <section id="mission" aria-labelledby="mission-title" className="border-y border-line bg-mist/60 py-16 md:py-24">
          <div className="page-container grid gap-8 md:grid-cols-[1fr_1.6fr] md:gap-16">
            <h2 id="mission-title" className="display-section">Our Mission</h2>
            <div className="space-y-5 text-[17px] leading-relaxed text-slate">
              <p className="text-ink">
                At Voxlate, our mission is to eliminate language barriers and make communication seamless, accessible,
                and inclusive for everyone.
              </p>
              <p>
                We believe that language should never be a barrier to connecting with others. Whether you&apos;re a
                business expanding globally, a student learning a new language, or a traveler exploring a new country,
                Voxlate is here to help you communicate naturally and authentically.
              </p>
              <p>
                Our AI-powered platform is being built to preserve not just words, but the speaker&apos;s natural voice,
                tone, and emotion—making every conversation feel genuine and personal.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="team-title" className="page-container pt-16 md:pt-24">
          <h2 id="team-title" className="display-section">Meet the Team</h2>
          <p className="mt-5 max-w-[66ch] text-[17px] leading-relaxed text-slate">
            We are a team of passionate students from Heritage Institute of Technology, united by a shared vision to
            eliminate language barriers through AI-driven innovation. Combining expertise in software engineering,
            artificial intelligence, marketing, and digital media, we are building Voxlate to make communication more
            natural, accessible, and human.
          </p>

          <h3 className="mt-14 border-b border-line pb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-slate">
            Leadership
          </h3>
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
            <Portrait member={FOUNDER} size={120} />
            <div>
              <h4 className="font-display text-[30px] leading-tight text-ink">{FOUNDER.name}</h4>
              <p className="mt-1 text-[15px] font-medium text-primary">{FOUNDER.role}</p>
              <p className="mt-3 max-w-[62ch] text-[16px] leading-relaxed text-slate">{FOUNDER.bio}</p>
              <ProfileLinks member={FOUNDER} />
            </div>
          </div>

          {TEAM_GROUPS.map((group) => (
            <section key={group.team} aria-labelledby={`team-${group.team}`} className="mt-16">
              <h3 id={`team-${group.team}`} className="border-b border-line pb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-slate">
                {group.team}
              </h3>
              <ul className="mt-8 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {group.members.map((member) => (
                  <li key={member.name}>
                    <Portrait member={member} size={88} />
                    <h4 className="mt-4 text-[18px] font-semibold text-ink">{member.name}</h4>
                    <p className="mt-0.5 text-[14px] font-medium text-primary">{member.role}</p>
                    <p className="mt-3 text-[15px] leading-relaxed text-slate">{member.bio}</p>
                    <ProfileLinks member={member} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <div id="join-team" className="mt-20 flex flex-col gap-6 border-t border-line pt-8 text-[16px] sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:w-auto">
              <p className="text-slate">Want to build this with us?</p>
              <JoinMyTeamButton className="mt-4" />
            </div>
            <p className="text-slate">
              Curious about the product?{" "}
              <UnderlineLink href="/digital-version" variant="goes-out-comes-in" direction="right" className="font-medium">
                See what we&apos;re building
              </UnderlineLink>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
