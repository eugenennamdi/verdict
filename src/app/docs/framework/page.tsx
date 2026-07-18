import { Metadata } from "next";
import { DocsPagination } from "@/components/DocsPagination";
import { Target, PenTool, MousePointerClick, Zap, ShieldCheck, Shield, Rocket } from "lucide-react";

export const metadata: Metadata = {
  title: "The 7-Pillar Framework | Documentation",
};

export default function FrameworkPage() {
  const pillars = [
    {
      title: "1. Positioning & ICP",
      weight: "20%",
      icon: Target,
      description: "Is it violently obvious who this is for? Generic products for 'everyone' fail. We check if you have a razor-sharp Ideal Customer Profile (ICP)."
    },
    {
      title: "2. Messaging & Copy",
      weight: "15%",
      icon: PenTool,
      description: "Are you using 'AI-powered synergistic workflows' or do you actually explain what the product does? We penalize corporate word salad heavily."
    },
    {
      title: "3. UX & Friction",
      weight: "15%",
      icon: MousePointerClick,
      description: "Is the time-to-value immediate, or do you force users to 'Book a Demo' for a $10/mo tool? We grade the friction of your onboarding flow."
    },
    {
      title: "4. Conversion Triggers",
      weight: "15%",
      icon: Zap,
      description: "What is the psychological hook? We look for urgency, scarcity, and clear, undeniable ROI promises that force a user to act now."
    },
    {
      title: "5. Trust & Social Proof",
      weight: "10%",
      icon: ShieldCheck,
      description: "Do you have real testimonials, recognizable logos, and case studies, or are you just asking users to trust you blindly?"
    },
    {
      title: "6. Defensibility (Moat)",
      weight: "10%",
      icon: Shield,
      description: "Is this a thin GPT wrapper that can be cloned in a weekend, or is there proprietary data, network effects, or deep technical IP?"
    },
    {
      title: "7. Growth Foundation",
      weight: "15%",
      icon: Rocket,
      description: "Is there a scalable acquisition loop visible, or are you relying on unscalable manual sales? We check for virality, SEO foundations, and clear growth engines."
    }
  ];

  return (
    <>
      <h1 className="text-5xl font-black tracking-tight mb-6">The 7-Pillar Framework</h1>
      
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
        Our reasoning engine does not provide generic feedback. It evaluates your startup strictly against seven foundational pillars that dictate whether a company is primed for hyper-growth or destined for churn.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-12">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div key={pillar.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:border-orange-500/50 transition-colors relative group">
              <div className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded-md group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10 group-hover:text-orange-500 transition-colors">
                {pillar.weight}
              </div>
              <div className="bg-orange-500/10 w-12 h-12 flex items-center justify-center rounded-xl mb-4 text-orange-500">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{pillar.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{pillar.description}</p>
            </div>
          );
        })}
      </div>


      <DocsPagination 
        prev={{ title: "Architecture", href: "/docs/architecture" }}
        next={{ title: "Scoring & Enforcement", href: "/docs/scoring" }} 
      />
    </>
  );
}
