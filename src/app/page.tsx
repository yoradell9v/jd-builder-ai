import Link from "next/link";
import { ChatBubbleLeftRightIcon, BoltIcon, Cog6ToothIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";

export default function Home() {
  const cards = [
    {
      icon: <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />,
      title: "Share Your Needs",
      subtitle:
        "Fill a short intake form (and optional uploads) with your goals, challenges, or current setup.",
    },
    {
      icon: <BoltIcon className="w-8 h-8 text-white" />,
      title: "AI Analyzes Your Goals",
      subtitle:
        "We identify your main business outcome and pinpoint the most impactful role to achieve it.",
    },
    {
      icon: <Cog6ToothIcon className="w-8 h-8 text-white" />,
      title: "Smart Role Design",
      subtitle:
        "If responsibilities span multiple areas, we intelligently separate them into focused, high-leverage roles.",
    },
    {
      icon: <CheckBadgeIcon className="w-8 h-8 text-white" />,
      title: "Perfect Match Recommendation",
      subtitle:
        "Each role is matched to the best Level 9 Virtual service — Dedicated VA, Unicorn VA, or POD — with a clear why.",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center font-sans transition-colors duration-150" style={{ backgroundColor: "var(--background)" }}>
      <main className="flex min-h-screen w-full max-w-5xl flex-col items-center justify-between py-24 px-8 sm:items-start transition-colors duration-150" style={{ backgroundColor: "var(--background)" }}>
        {/* Header */}
        <div className="w-full">
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left mb-12">
            <h1 className="text-3xl font-semibold leading-10 tracking-tight text-[var(--primary)] sm:text-5xl transition-colors duration-150 dark:text-white">
              Let AI Analyze Your Goals
            </h1>
            <p className="max-w-md text-lg leading-8 transition-colors duration-150" style={{ color: "var(--text-secondary)" }}>
              We identify your main business outcome and pinpoint the most impactful role to achieve it.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {cards.map((card, index) => (
              <div
                key={index}
                className="group relative rounded-2xl backdrop-blur p-6 shadow-lg transition-all duration-150 hover:shadow-xl hover:-translate-y-0.5"
                style={{
                  borderColor: "var(--card-border)",
                  backgroundColor: "var(--card-bg)"
                }}
              >
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div
                    className="w-14 h-14 mb-4 rounded-lg flex items-center justify-center shadow-md transition-colors duration-150"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    {card.icon}
                  </div>
                  <h3 className="text-base font-semibold mb-2 transition-colors duration-150" style={{ color: "var(--text-primary)" }}>{card.title}</h3>
                  <p className="text-sm leading-relaxed transition-colors duration-150" style={{ color: "var(--text-secondary)" }}>{card.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            href="/signin"
            className="w-full sm:w-auto font-semibold py-2.5 px-6 rounded-xl focus:outline-none focus:ring-2 transition-all duration-150 shadow-md"
            style={{
              backgroundColor: "var(--accent)",
              color: "white",
              boxShadow: `0 0 20px var(--accent)`,
            }}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border transition-all duration-150"
            style={{
              borderColor: "var(--accent)",
              color: "var(--accent)",
            }}
          >
            Sign Up
          </Link>
        </div>
      </main>
    </div>
  );
}
