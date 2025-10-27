// ============================================================================
// MEMBER SETTINGS MODAL PAGE
// ============================================================================
// Modal page for member settings using intercepting routes
// ============================================================================

"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MemberSettingsModal } from "@/features/rbac/components/modals/MemberSettingsModal";

function MemberSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberId = searchParams.get("id");

  const handleClose = () => {
    router.back();
  };

  return (
    <MemberSettingsModal
      isOpen={true}
      onClose={handleClose}
      memberId={memberId || undefined}
      title="Member Settings"
    />
  );
}

export default function MemberSettingsModalPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MemberSettingsContent />
    </Suspense>
  );
}
