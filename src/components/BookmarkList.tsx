"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Bookmark } from "@/lib/types";
import BookmarkCard from "./BookmarkCard";

interface BookmarkListProps {
    userId: string;
    newBookmark?: Bookmark | null;
}

export default function BookmarkList({ userId, newBookmark }: BookmarkListProps) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = useMemo(() => createClient(), []);

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

        // Subscribe to realtime postgres changes (wildcard for all events)
        const dbChannel = supabase
            .channel(`bookmarks-db-${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bookmarks",
                },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        const inserted = payload.new as Bookmark;
                        if (inserted.user_id !== userId) return;
                        setBookmarks((prev) => {
                            if (prev.some((b) => b.id === inserted.id)) return prev;
                            return [inserted, ...prev];
                        });
                    } else if (payload.eventType === "DELETE") {
                        const deletedId = (payload.old as { id: string }).id;
                        setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
                    } else if (payload.eventType === "UPDATE") {
                        const updated = payload.new as Bookmark;
                        if (updated.user_id !== userId) return;
                        setBookmarks((prev) =>
                            prev.map((b) => (b.id === updated.id ? updated : b))
                        );
                    }
                }
            )
            .subscribe();

        // Secondary broadcast channel for reliable cross-tab sync
        const broadcastChannel = supabase
            .channel(`bookmarks-sync-${userId}`)
            .on("broadcast", { event: "bookmark-added" }, ({ payload }) => {
                const added = payload as Bookmark;
                if (added.user_id !== userId) return;
                setBookmarks((prev) => {
                    if (prev.some((b) => b.id === added.id)) return prev;
                    return [added, ...prev];
                });
            })
            .on("broadcast", { event: "bookmark-deleted" }, ({ payload }) => {
                const deletedId = payload.id as string;
                setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(dbChannel);
            supabase.removeChannel(broadcastChannel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // Optimistic update: when parent passes a newly added bookmark, prepend it
    useEffect(() => {
        if (newBookmark) {
            setBookmarks((prev) => {
                if (prev.some((b) => b.id === newBookmark.id)) return prev;
                return [newBookmark, ...prev];
            });
        }
    }, [newBookmark]);

    if (loading) {
        return (
            <div className="flex flex-col gap-5 mt-6">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="glass-card p-6 opacity-50"
                    >
                        <div className="h-4 w-3/5 bg-linear-to-r from-bg-secondary via-bg-card to-bg-secondary bg-size-[200%_100%] animate-shimmer rounded-lg mb-2" />
                        <div className="h-3 w-2/5 bg-linear-to-r from-bg-secondary via-bg-card to-bg-secondary bg-size-[200%_100%] animate-shimmer rounded-lg" />
                    </div>
                ))}
            </div>
        );
    }

    if (bookmarks.length === 0) {
        return (
            <div className="glass-card animate-fade-in p-12 text-center mt-6">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-semibold mb-2">
                    No bookmarks yet
                </h3>
                <p className="text-text-secondary text-sm">
                    Add your first bookmark using the form above!
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 mt-4">
            <p className="text-sm text-text-muted mb-1">
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
