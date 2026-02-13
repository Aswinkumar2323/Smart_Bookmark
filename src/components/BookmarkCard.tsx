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
            className="glass-card animate-fade-in-up"
            style={{
                padding: "1.25rem",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "1rem",
                opacity: deleting ? 0.5 : 1,
                transition: "opacity 0.3s ease",
            }}
        >
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Title */}
                <h3
                    style={{
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        marginBottom: "0.35rem",
                        color: "var(--color-text-primary)",
                    }}
                >
                    {bookmark.title}
                </h3>

                {/* URL */}
                <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        fontSize: "0.85rem",
                        color: "var(--color-accent-3)",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        marginBottom: "0.5rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.textDecoration = "underline")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.textDecoration = "none")
                    }
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
                <p
                    style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)",
                    }}
                >
                    Added {formatDate(bookmark.created_at)}
                </p>
            </div>

            {/* Delete Button */}
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger"
                title="Delete bookmark"
                style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                }}
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
