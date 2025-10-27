"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Loader2, X, ArrowLeft } from "lucide-react";
import {
  EstimateEntity,
  UpdateEstimateDTO,
  CreateEstimateDTO,
} from "@/features/estimate/types";
import { estimateService } from "@/features/estimate/services/estimateService";
import { EstimateForm } from "@/features/estimate/components/form/EstimateForm";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function EditEstimatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const estimateId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [estimate, setEstimate] = useState<EstimateEntity | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const fetchEstimate = async () => {
      if (!estimateId) {
        router.push("/estimate");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const estimateData = await estimateService.getById(estimateId);
        setEstimate(estimateData);
      } catch (error) {
        console.error("Error fetching estimate:", error);
        setError("Failed to load estimate");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstimate();
  }, [estimateId, router]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async (data: UpdateEstimateDTO | CreateEstimateDTO) => {
    if (!estimateId) return;

    try {
      // For edit mode, we need to ensure we have the version for UpdateEstimateDTO
      const updateData: UpdateEstimateDTO = {
        ...data,
        version: estimate?.version || 1,
      } as UpdateEstimateDTO;

      await estimateService.update(estimateId, updateData);
      router.push("/estimate");
    } catch (error) {
      console.error("Error updating estimate:", error);
      throw new Error("Failed to update estimate");
    }
  };
  const handleCancel = () => {
    router.back();
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="neomorphic-card p-8 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 neomorphic-button rounded-full flex items-center justify-center animate-pulse">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium">
            Loading estimate...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error || !estimate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="neomorphic-card p-8 text-center max-w-md">
          <div className="w-16 h-16 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {error || "Estimate not found"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {error
              ? "There was an error loading the estimate. Please try again."
              : "The requested estimate could not be found."}
          </p>
          <div className="flex items-center justify-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="neomorphic-button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => router.push("/estimate")}
              className="neomorphic-primary"
            >
              View All Estimates
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="neomorphic-button"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Edit Estimate
                </h1>
                <p className="text-sm text-muted-foreground">
                  {estimate.estimateNumber || estimate.id.slice(0, 8)} -{" "}
                  {estimate.name}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-3">
              <span
                className={`
                px-3 py-1 rounded-full text-xs font-medium border
                ${
                  estimate.status === "DRAFT"
                    ? "bg-gray-100 text-gray-700 border-gray-200"
                    : estimate.status === "SENT"
                      ? "bg-blue-100 text-blue-700 border-blue-200"
                      : estimate.status === "APPROVED"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : estimate.status === "CLIENT_APPROVED"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : estimate.status === "DECLINED"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : estimate.status === "CLIENT_DECLINED"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : estimate.status === "CONVERTED"
                                ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                : estimate.status === "EXPIRED"
                                  ? "bg-orange-100 text-orange-700 border-orange-200"
                                  : "bg-gray-100 text-gray-700 border-gray-200"
                }
              `}
              >
                {estimate.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <EstimateForm
          mode="edit"
          estimate={estimate}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          showPreview={true}
          layout="single-page"
          size="lg"
        />
      </div>
    </div>
  );
}

// ============================================================================
// SUSPENSE WRAPPER
// ============================================================================

export default function EditEstimatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="neomorphic-card p-8 flex flex-col items-center space-y-4">
            <div className="w-16 h-16 neomorphic-button rounded-full flex items-center justify-center animate-pulse">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <EditEstimatePageContent />
    </Suspense>
  );
}
