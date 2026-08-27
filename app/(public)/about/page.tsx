import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import Image from "next/image";
import Link from "next/link";
import { Target, Eye } from "lucide-react";
import { Reveal } from "@/components/animation/Reveal";
import { Counter } from "@/components/animation/Counter";

import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About Dexplora Tour Planners",
  description:
    "Learn about Dexplora Tour Planners, our story, mission, and experienced Malayali tour leaders crafting budget group adventures.",
  alternates: {
    canonical: absoluteUrl("/about"),
  },
};

interface StatItem {
  label: string;
  value: string;
}

interface TeamMember {
  name: string;
  role: string;
  photo?: string;
}

export default async function AboutPage() {
  const settings = await getSiteSettings();
  let about: any = null;
  try {
    about = await db.aboutContent.findFirst();
  } catch (error) {
    console.error("Error fetching aboutContent:", error);
  }

  const stats: StatItem[] = about?.statsJson ? JSON.parse(about.statsJson) : [];
  const team: TeamMember[] = about?.teamJson ? JSON.parse(about.teamJson) : [];

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-10 space-y-8 sm:space-y-12 lg:space-y-16">
      {/* Hero Header */}
      <section className="text-left sm:text-center space-y-2 max-w-3xl sm:mx-auto py-1">
        <Reveal direction="up" duration={600}>
          <span className="text-[clamp(11px,3vw,13px)] font-bold uppercase tracking-[0.06em] text-[#3478F6] block">
            Discover Our Story
          </span>
          <h1 className="text-[clamp(28px,8vw,44px)] font-bold text-[#0B1026] leading-[1.05] tracking-[-0.025em] mt-1 break-words">
            {about?.title || "About Dexplora Tour Planners"}
          </h1>
          <p className="text-[clamp(14px,3.7vw,17px)] text-[#64748B] leading-[1.55] font-normal mt-1 break-words max-w-2xl sm:mx-auto">
            {about?.subtitle || "Crafting unforgettable travel memories with genuine Malayali hospitality."}
          </p>
        </Reveal>
      </section>

      {/* Stats Counter Panel (Compact 2x2 Grid on Mobile, max-w-[420px] on mobile) */}
      {stats.length > 0 && (
        <section className="w-full max-w-[420px] sm:max-w-7xl mx-auto min-w-0">
          <Reveal direction="up" duration={600}>
            <div className="w-full bg-[#F8FAFF] border border-[#DBE6FF] rounded-[18px] p-[clamp(16px,4vw,22px)] shadow-[0_4px_18px_rgba(15,23,42,0.035)]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-[clamp(14px,4vw,24px)] gap-y-[clamp(20px,5vw,28px)]">
                {stats.map((s, idx) => {
                  const displayLabel = s.label === "Group Trips Completed" ? "Group Trip Completed" : s.label;
                  return (
                    <div key={idx} className="min-w-0 flex flex-col items-center text-center">
                      <Counter value={s.value} />
                      <div className="mt-1.5 text-[clamp(11.5px,3.1vw,13px)] font-medium leading-[1.2] text-[#111827] break-words whitespace-normal max-w-full">
                        {displayLabel}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Main Story & Philosophy */}
      <section className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-[clamp(22px,6vw,34px)] font-bold text-[#0B1026] leading-tight">
              Our Travel Story
            </h2>
            <p className="text-[clamp(14px,3.7vw,16px)] text-[#64748B] leading-[1.55] whitespace-pre-line">
              {about?.story}
            </p>
            <div className="pt-2">
              <Link
                href="/book-now"
                className="inline-flex items-center justify-center bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 sm:px-6 h-[46px] rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-98"
              >
                Start Exploring With Us
              </Link>
            </div>
          </div>

          <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-sm bg-gray-100 border border-[#E5EAF2]">
            <Image
              src="https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80"
              alt="Dexplora Group Travelers"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5EAF2] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#3478F6]/10 text-[#3478F6] flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0B1026]">Our Mission</h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">{about?.mission}</p>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5EAF2] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#3478F6]/10 text-[#3478F6] flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0B1026]">Our Vision</h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">{about?.vision}</p>
          </div>
        </div>
      </section>

      {/* Team / Leaders */}
      {team.length > 0 && (
        <section className="w-full space-y-6">
          <div className="text-left sm:text-center max-w-2xl sm:mx-auto space-y-1">
            <span className="text-[clamp(11px,3vw,13px)] font-bold uppercase tracking-[0.06em] text-[#3478F6] block">
              The People Behind Dexplora
            </span>
            <h2 className="text-[clamp(22px,6vw,34px)] font-bold text-[#0B1026] leading-tight">
              Meet Our Leadership & Guides
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 justify-center">
            {team.map((member, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-[#E5EAF2] p-5 text-center space-y-3 shadow-xs">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto relative bg-gray-100 border-2 border-[#3478F6]">
                  {member.photo ? (
                    <Image src={member.photo} alt={member.name} fill sizes="80px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[#3478F6]">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0B1026]">{member.name}</h3>
                  <p className="text-xs text-[#3478F6] font-semibold">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
