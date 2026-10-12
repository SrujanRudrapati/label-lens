"use client";

import { useEffect, useRef } from "react";
import type { Profile } from "@/lib/schema";
import { ProfileForm } from "./ProfileForm";

interface ProfileSheetProps {
  open: boolean;
  profile: Profile;
  onSave: (profile: Profile) => void;
  onClose: () => void;
}

/** Edit sheet on a native modal dialog: focus is trapped, Escape closes, focus returns to the opener. */
export function ProfileSheet({ open, profile, onSave, onClose }: ProfileSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="profile-sheet-title"
      onClose={onClose}
      className="m-auto max-h-[92dvh] w-[min(100%-1.5rem,34rem)] overflow-y-auto rounded-sheet bg-paper p-5 text-ink backdrop:bg-ink/50"
    >
      {open && (
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <h2 id="profile-sheet-title" className="text-section leading-tight font-bold">
              Your profile
            </h2>
            <button type="button" onClick={onClose} className="-mt-1 -mr-2 min-h-12 rounded-full px-4 font-bold">
              Close
            </button>
          </div>
          <ProfileForm initial={profile} submitLabel="Save" onSubmit={onSave} />
        </div>
      )}
    </dialog>
  );
}
