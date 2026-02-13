"use client";

import type { Bookmark } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useState, useMemo } from "react";

interface BookmarkCardProps {
    bookmark: Bookmark;
}

export default function BookmarkCard({ bookmark }: BookmarkCardProps) {
    const [deleting, setDeleting] = useState(false);
    const supabase = useMemo(() => createClient(), []);

    const handleDelete = async () => {
        setDeleting(true);
        await supabase.from("bookmarks").delete().eq("id", bookmark.id);
        // Broadcast deletion to other tabs for cross-tab realtime sync
        supabase.channel(`bookmarks-sync-${bookmark.user_id}`).send({
            type: "broadcast",
            event: "bookmark-deleted",
            payload: { id: bookmark.id },
        });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getDomain = (url: string) => {
        try {
            return new URL(url).hostname.replace("www.", "");
        } catch {
            return url;
        }
    };

    return (
        <div
            className={`glass-card animate-fade-in-up p-6 flex items-start justify-between gap-5 transition-opacity duration-300 ${deleting ? "opacity-50" : "opacity-100"}`}
        >
            <div className="flex-1 min-w-0">
                {/* Title */}
                <h3 className="text-[1.05rem] font-semibold mb-1 text-text-primary">
                    {bookmark.title}
                </h3>

                {/* URL */}
                <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent-3 no-underline inline-flex items-center gap-1.5 mb-2 overflow-hidden text-ellipsis whitespace-nowrap max-w-full hover:underline"
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    {getDomain(bookmark.url)}
                </a>

                {/* Date */}
                <p className="text-xs text-text-muted">
                    Added {formatDate(bookmark.created_at)}
                </p>
            </div>

            {/* Delete Button */}
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger shrink-0 flex items-center gap-1.5"
                title="Delete bookmark"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                {deleting ? "..." : "Delete"}
            </button>
        </div>
    );
}
