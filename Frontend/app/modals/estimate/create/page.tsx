// ============================================================================
// ESTIMATE CREATE MODAL PAGE
// ============================================================================
// Modal page for creating new estimates using the EstimateForm
// ============================================================================

"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { EstimateForm } from "@/features/estimate/components/form";
import {
  CreateEstimateDTO,
  UpdateEstimateDTO,
} from "@/features/estimate/types";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EstimateCreatePage() {
  const router = useRouter();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSubmit = useCallback(
    async (data: CreateEstimateDTO | UpdateEstimateDTO) => {
      try {
        // TODO: Implement actual API call
        console.log("Creating estimate with data:", data);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Navigate back to estimates list
        router.push("/estimates");

        // TODO: Show success toast
        console.log("Estimate created successfully!");
      } catch (error) {
        console.error("Failed to create estimate:", error);
        // TODO: Show error toast
      }
    },
    [router]
  );

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-background">
      <EstimateForm
        mode="create"
        layout="single-page"
        size="lg"
        showPreview={true}
        showAutoSave={true}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
