"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEstimates, useExportEstimates } from "../hooks";
import { EstimateStatus, EstimateEntity } from "../types";

// Import all our new modular components
import {
  EstimateScreenHeader,
  EstimateStatsGrid,
  EstimateFiltersBar,
  EstimateList,
  EstimateBulkActions,
} from "../components";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EstimateStats {
  totalEstimates: number;
  totalValue: number;
  avgValue: number;
  conversionRate: number;
  thisMonthCount?: number;
  thisMonthValue?: number;
  pendingCount?: number;
  approvedCount?: number;
}

interface FilterState {
  search: string;
  status: EstimateStatus[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EstimateScreen() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const router = useRouter();
  const [estimates, setEstimates] = useState<EstimateEntity[]>([]);
  const [stats, setStats] = useState<EstimateStats>({
    totalEstimates: 0,
    totalValue: 0,
    avgValue: 0,
    conversionRate: 0,
  });
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedEstimates, setSelectedEstimates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================================
  // HOOKS
  // ============================================================================

  const {
    data: fetchedEstimates,
    loading,
    error,
    refetch,
  } = useEstimates(filters, { page: 1, limit: 20 });

  const { exportEstimates, loading: exportLoading } = useExportEstimates();

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const fetchEstimateData = async () => {
      try {
        if (fetchedEstimates) {
          setEstimates(fetchedEstimates);

          // Calculate comprehensive stats
          const totalValue = fetchedEstimates.reduce(
            (sum, estimate) => sum + (Number(estimate.grandTotal) || 0),
            0
          );
          const convertedCount = fetchedEstimates.filter(
            (e) => e.status === EstimateStatus.CONVERTED
          ).length;
          const approvedCount = fetchedEstimates.filter((e) =>
            [EstimateStatus.APPROVED, EstimateStatus.CLIENT_APPROVED].includes(
              e.status
            )
          ).length;
          const pendingCount = fetchedEstimates.filter((e) =>
            [EstimateStatus.SENT, EstimateStatus.VIEWED].includes(e.status)
          ).length;

          // Calculate this month's estimates
          const thisMonth = new Date();
          thisMonth.setDate(1);
          thisMonth.setHours(0, 0, 0, 0);

          const thisMonthEstimates = fetchedEstimates.filter(
            (e) => new Date(e.createdAt) >= thisMonth
          );
          const thisMonthValue = thisMonthEstimates.reduce(
            (sum, estimate) => sum + (Number(estimate.grandTotal) || 0),
            0
          );

          setStats({
            totalEstimates: fetchedEstimates.length,
            totalValue,
            avgValue:
              fetchedEstimates.length > 0
                ? totalValue / fetchedEstimates.length
                : 0,
            conversionRate:
              fetchedEstimates.length > 0
                ? (convertedCount / fetchedEstimates.length) * 100
                : 0,
            thisMonthCount: thisMonthEstimates.length,
            thisMonthValue,
            pendingCount,
            approvedCount,
          });
        }
      } catch (error) {
        console.error("Error fetching estimate data:", error);
        setEstimates([]);
        setStats({
          totalEstimates: 0,
          totalValue: 0,
          avgValue: 0,
          conversionRate: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstimateData();
  }, [fetchedEstimates]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setViewMode(mode);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleExport = useCallback(
    async (format: "csv" | "pdf" | "excel") => {
      try {
        const blob = await exportEstimates(format, filters);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `estimates.${format}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error("Export failed:", error);
      }
    },
    [exportEstimates, filters]
  );

  const handleCreateNew = useCallback(() => {
    router.push("/modals/estimate/create");
  }, [router]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: "",
      status: [],
      dateFrom: undefined,
      dateTo: undefined,
      minAmount: undefined,
      maxAmount: undefined,
    });
  }, []);

  // Selection handlers
  const handleSelectEstimate = useCallback((id: string) => {
    setSelectedEstimates((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedEstimates(
      selectedEstimates.length === estimates.length
        ? []
        : estimates.map((estimate) => estimate.id)
    );
  }, [selectedEstimates.length, estimates]);

  const handleClearSelection = useCallback(() => {
    setSelectedEstimates([]);
  }, []);

  // Bulk actions
  const handleBulkExport = useCallback(
    (format: "csv" | "pdf" | "excel") => {
      // Filter selected estimates and export
      const selectedEstimateData = estimates.filter((e) =>
        selectedEstimates.includes(e.id)
      );
      console.log(
        `Exporting ${selectedEstimateData.length} estimates as ${format}`
      );
      handleExport(format);
    },
    [estimates, selectedEstimates, handleExport]
  );

  const handleBulkArchive = useCallback(() => {
    console.log(`Archiving ${selectedEstimates.length} estimates`);
    // Implement bulk archive logic
    setSelectedEstimates([]);
  }, [selectedEstimates.length]);

  const handleBulkDelete = useCallback(() => {
    console.log(`Deleting ${selectedEstimates.length} estimates`);
    // Implement bulk delete logic
    setSelectedEstimates([]);
  }, [selectedEstimates.length]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasFilters =
    filters.search ||
    filters.status.length > 0 ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.minAmount ||
    filters.maxAmount;

  const isLoadingData = isLoading || loading;
  const errorMessage = error;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-8">
      {/* Header */}
      <EstimateScreenHeader
        totalCount={stats.totalEstimates}
        onRefresh={handleRefresh}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        isLoading={isLoadingData}
        onExport={() => handleExport("csv")}
        onCreateNew={handleCreateNew}
      />

      {/* Stats Grid */}
      <EstimateStatsGrid
        stats={stats}
        isLoading={isLoadingData}
        variant="detailed"
      />

      {/* Bulk Actions Bar */}
      <EstimateBulkActions
        selectedIds={selectedEstimates}
        onClearSelection={handleClearSelection}
        onBulkExport={handleBulkExport}
        onBulkArchive={handleBulkArchive}
        onBulkDelete={handleBulkDelete}
      />

      {/* Filters Bar */}
      <EstimateFiltersBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onExport={handleExport}
        exportLoading={exportLoading}
        totalCount={estimates.length}
      />

      {/* Main Content - Estimates List */}
      <EstimateList
        estimates={estimates}
        viewMode={viewMode}
        isLoading={isLoadingData}
        error={errorMessage}
        selectedIds={selectedEstimates}
        hasFilters={Boolean(hasFilters)}
        searchTerm={filters.search}
        onSelectEstimate={handleSelectEstimate}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onClearFilters={handleClearFilters}
        onRetry={handleRefresh}
        onCreateNew={handleCreateNew}
        showSelection={true}
        showTableHeader={viewMode === "list"}
      />
    </div>
  );
}

export default EstimateScreen;
