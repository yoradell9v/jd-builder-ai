"use client";

import { FaUser, FaSignOutAlt } from "react-icons/fa";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="fixed top-4 right-6 flex items-center gap-6 px-6 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <Link
                href="/account"
                className="flex items-center gap-2 text-sm font-medium hover:text-[#00FF87] transition-colors group"
            >
                <FaUser className="text-lg text-neutral-400 group-hover:text-[#00FF87] transition-all duration-200 group-hover:drop-shadow-[0_0_6px_#00FF87]" />
            </Link>

            <button
                className="flex items-center gap-2 text-sm font-medium hover:text-[#00FF87] transition-colors group"
                onClick={() => console.log("Logout clicked")}
            >
                <FaSignOutAlt className="text-lg text-neutral-400 group-hover:text-[#00FF87] transition-all duration-200 group-hover:drop-shadow-[0_0_6px_#00FF87]" />
            </button>
        </nav>
    );
}
