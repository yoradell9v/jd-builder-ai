import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-5xl flex-col items-center justify-between py-32 px-8 bg-white dark:bg-black sm:items-start">
        {/* Header */}
        <div className="w-full">
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left mb-12">
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              Let AI Analyze Your Goals
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              We identify your main business outcome and pinpoint the most impactful role to achieve it.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                ),
                title: "Share Your Needs",
                subtitle:
                  "Fill a short intake form (and optional uploads) with your goals, challenges, or current setup.",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 1.343-3 3m6 0a3 3 0 00-3-3m0 0V5m0 6v6"
                  />
                ),
                title: "AI Analyzes Your Goals",
                subtitle:
                  "We identify your main business outcome and pinpoint the most impactful role to achieve it.",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m4 0h-1a2 2 0 10-4 0v4h6"
                  />
                ),
                title: "Smart Role Design",
                subtitle:
                  "If responsibilities span multiple areas, we intelligently separate them into focused, high-leverage roles.",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ),
                title: "Perfect Match Recommendation",
                subtitle:
                  "Each role is matched to the best Level 9 Virtual service — Dedicated VA, Unicorn VA, or POD — with a clear why.",
              },
            ].map((card, index) => (
              <div
                key={index}
                className="group relative rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 backdrop-blur p-6 shadow-lg dark:shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-all hover:shadow-xl dark:hover:shadow-[0_0_24px_#00FF87] hover:-translate-y-0.5"
              >
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="w-10 h-10 mb-4 rounded-lg flex items-center justify-center bg-[#00FF87]/10 text-[#00FF87] shadow-sm dark:shadow-[0_0_12px_#00FF87]">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {card.icon}
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-black dark:text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-neutral-300 leading-relaxed">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            href="/signin"
            className="w-full sm:w-auto bg-[#00FF87] hover:brightness-110 text-neutral-900 font-semibold py-2.5 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00FF87]/40 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_#00FF87]"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-[#00FF87] text-[#00FF87] hover:bg-[#00FF87]/10 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </main>
    </div>
  );
}
