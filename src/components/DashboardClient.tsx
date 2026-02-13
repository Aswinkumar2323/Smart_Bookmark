"use client";

import { useState, useCallback } from "react";
import type { Bookmark } from "@/lib/types";
import AddBookmarkForm from "@/components/AddBookmarkForm";
import BookmarkList from "@/components/BookmarkList";

interface DashboardClientProps {
    userId: string;
}

export default function DashboardClient({ userId }: DashboardClientProps) {
    const [newBookmark, setNewBookmark] = useState<Bookmark | null>(null);

    const handleBookmarkAdded = useCallback((bookmark: Bookmark) => {
        setNewBookmark(bookmark);
    }, []);

    return (
        <>
            {/* Add Bookmark Form */}
            <AddBookmarkForm userId={userId} onBookmarkAdded={handleBookmarkAdded} />

            {/* Bookmark List */}
            <BookmarkList userId={userId} newBookmark={newBookmark} />
        </>
    );
}
