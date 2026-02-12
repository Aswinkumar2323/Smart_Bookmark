"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Bookmark } from "@/lib/types";
import BookmarkCard from "./BookmarkCard";

interface BookmarkListProps {
    userId: string;
}

export default function BookmarkList({ userId }: BookmarkListProps) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        // Fetch initial bookmarks
        const fetchBookmarks = async () => {
            const { data, error } = await supabase
                .from("bookmarks")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (!error && data) {
                setBookmarks(data);
            }
            setLoading(false);
        };

        fetchBookmarks();

        // Subscribe to realtime changes
        const channel = supabase
            .channel("bookmarks-realtime")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "bookmarks",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const newBookmark = payload.new as Bookmark;
                    setBookmarks((prev) => {
                        // Avoid duplicates
                        if (prev.some((b) => b.id === newBookmark.id)) return prev;
                        return [newBookmark, ...prev];
                    });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "bookmarks",
                },
                (payload) => {
                    const deletedId = payload.old.id;
                    setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, supabase]);

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    marginTop: "1rem",
                }}
            >
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="glass-card"
                        style={{
                            padding: "1.5rem",
                            opacity: 0.5,
                        }}
                    >
                        <div
                            style={{
                                height: "1rem",
                                width: "60%",
                                background:
                                    "linear-gradient(90deg, var(--color-bg-secondary), var(--color-bg-card), var(--color-bg-secondary))",
                                backgroundSize: "200% 100%",
                                animation: "shimmer 1.5s infinite",
                                borderRadius: "0.5rem",
                                marginBottom: "0.5rem",
                            }}
                        />
                        <div
                            style={{
                                height: "0.75rem",
                                width: "40%",
                                background:
                                    "linear-gradient(90deg, var(--color-bg-secondary), var(--color-bg-card), var(--color-bg-secondary))",
                                backgroundSize: "200% 100%",
                                animation: "shimmer 1.5s infinite",
                                borderRadius: "0.5rem",
                            }}
                        />
                    </div>
                ))}
            </div>
        );
    }

    if (bookmarks.length === 0) {
        return (
            <div
                className="glass-card animate-fade-in"
                style={{
                    padding: "3rem",
                    textAlign: "center",
                    marginTop: "1rem",
                }}
            >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                <h3
                    style={{
                        fontSize: "1.2rem",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                    }}
                >
                    No bookmarks yet
                </h3>
                <p
                    style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "0.9rem",
                    }}
                >
                    Add your first bookmark using the form above!
                </p>
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                marginTop: "0.5rem",
            }}
        >
            <p
                style={{
                    fontSize: "0.85rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.25rem",
                }}
            >
                {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""} saved
            </p>
            {bookmarks.map((bookmark, index) => (
                <div
                    key={bookmark.id}
                    style={{ animationDelay: `${index * 0.05}s` }}
                >
                    <BookmarkCard bookmark={bookmark} />
                </div>
            ))}
        </div>
    );
}
