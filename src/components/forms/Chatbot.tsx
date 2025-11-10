import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type Author = "user" | "assistant";

type Message = {
    id: string;
    author: Author;
    text: string;
    timestamp: string;
    visible: boolean;
};

const baseGreetings: Array<{ author: Author; text: string }> = [
    {
        author: "assistant",
        text: "Please describe how you want the current analysis to be modifiied.",
    }
];

const bubbleBase =
    "relative flex max-w-lg flex-col gap-2 rounded-2xl px-5 py-4 shadow-lg backdrop-blur-md transition-all duration-500 ease-out will-change-transform";

function timeLabel(offsetMinutes = 0) {
    const base = new Date();
    if (offsetMinutes) base.setMinutes(base.getMinutes() - offsetMinutes);
    return base.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>(() =>
        baseGreetings.map((message, index) => ({
            ...message,
            id: `initial-${index}`,
            timestamp: timeLabel(index * 12),
            visible: false,
        }))
    );

    const [draft, setDraft] = useState("");
    const idCounter = useRef(baseGreetings.length);
    const viewportRef = useRef<HTMLDivElement>(null);

    const revealMessage = useCallback((id: string) => {
        setMessages((current) =>
            current.map((m) => (m.id === id ? { ...m, visible: true } : m))
        );
    }, []);

    useEffect(() => {
        const timers = baseGreetings.map((_, i) =>
            setTimeout(() => revealMessage(`initial-${i}`), 300 * (i + 1))
        );
        return () => timers.forEach(clearTimeout);
    }, [revealMessage]);

    useEffect(() => {
        if (!viewportRef.current) return;
        viewportRef.current.scrollTo({
            top: viewportRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);

    const nextId = useCallback(() => `msg-${idCounter.current++}`, []);

    const queueMessage = useCallback(
        (payload: Omit<Message, "id" | "visible">, options?: { delay?: number }) => {
            const id = nextId();
            setMessages((cur) => [...cur, { ...payload, id, visible: false }]);
            setTimeout(() => revealMessage(id), options?.delay ?? 200);
        },
        [nextId, revealMessage]
    );

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!draft.trim()) return;

        const text = draft.trim();
        queueMessage({ author: "user", text, timestamp: timeLabel() });
        setDraft("");

        setTimeout(() => {
            queueMessage(
                {
                    author: "assistant",
                    text: "Got it — let me process that and map out your action plan.",
                    timestamp: timeLabel(),
                },
                { delay: 300 }
            );
        }, 500);
    };

    return (
        <section className="flex w-full items-center justify-center">
            <div className="relative bg-white dark:bg-zinc-900 flex w-full max-w-4xl flex-col gap-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 ">
                <div
                    ref={viewportRef}
                    role="log"
                    aria-live="polite"
                    className="flex max-h-[60vh] flex-1 flex-col gap-4 overflow-y-auto pr-2"
                >
                    {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.author === "assistant" ? "justify-start" : "justify-end"}`}>
                            <article
                                className={`
                  ${bubbleBase}
                  ${m.author === "assistant"
                                        ? "px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-sm"
                                        : "px-3 py-1.5 bg-[#00FF87]/5 border border-[#00FF87]/20 rounded-xl"
                                    }
                  ${m.visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}
                `}
                            >
                                <p className="text-sm leading-relaxed">{m.text}</p>

                            </article>
                        </div>
                    ))}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3 rounded-2xl sm:flex-row sm:items-center"
                >
                    <input
                        id="chatbot-prompt"
                        placeholder="Type your task or question..."
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300  px-4 py-3 outline-none transition"
                        autoComplete="off"
                    />

                    <button
                        className="w-12 h-12 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 4l16 8-16 8 4-8-4-8z"
                            />
                        </svg>
                    </button>

                </form>
            </div>
        </section>
    );
}
