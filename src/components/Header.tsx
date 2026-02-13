"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface HeaderProps {
    user: User;
}

export default function Header({ user }: HeaderProps) {
    const supabase = createClient();
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    return (
        <header className="glass sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-accent-1 to-accent-2 flex items-center justify-center text-xl">
                    🔖
                </div>
                <span className="font-bold text-lg">
                    <span className="gradient-text">Smart</span> Bookmark
                </span>
            </div>

            {/* User Info + Sign Out */}
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex items-center gap-2.5">
                    {user.user_metadata?.avatar_url ? (
                        <img
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full border-2 border-accent-1"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-accent-1 to-accent-2 flex items-center justify-center text-sm font-semibold">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="text-sm text-text-secondary max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {user.email}
                    </span>
                </div>

                <button onClick={handleSignOut} className="btn-ghost text-sm px-4 py-2">
                    Sign Out
                </button>
            </div>
        </header>
    );
}
