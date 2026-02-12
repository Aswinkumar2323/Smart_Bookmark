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
        <header
            className="glass"
            style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                padding: "0.75rem 1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            {/* Logo */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                }}
            >
                <div
                    style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "0.75rem",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.3rem",
                    }}
                >
                    🔖
                </div>
                <span
                    style={{
                        fontWeight: 700,
                        fontSize: "1.15rem",
                    }}
                >
                    <span className="gradient-text">Smart</span> Bookmark
                </span>
            </div>

            {/* User Info + Sign Out */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                }}
            >
                {/* Avatar */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                    }}
                >
                    {user.user_metadata?.avatar_url ? (
                        <img
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                            style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                border: "2px solid var(--color-accent-1)",
                            }}
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div
                            style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                            }}
                        >
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span
                        style={{
                            fontSize: "0.85rem",
                            color: "var(--color-text-secondary)",
                            maxWidth: "150px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {user.email}
                    </span>
                </div>

                <button onClick={handleSignOut} className="btn-ghost" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
                    Sign Out
                </button>
            </div>
        </header>
    );
}
