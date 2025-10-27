// ============================================================================
// ESTIMATE HISTORY TYPES
// ============================================================================
// Types for EstimateHistoryEvent entity - audit trail and activity tracking
// ============================================================================

import { BaseEntityFields } from "./shared.types";

export interface EstimateHistoryEventEntity extends BaseEntityFields {
  estimateId: string;
  eventType: string;
  eventDescription: string;
  actorId?: string;
  timestamp: string;
}

export interface CreateEstimateHistoryEventDTO {
  estimateId: string;
  eventType: string;
  eventDescription: string;
  actorId?: string;
}

export interface EstimateHistoryEventResponseDTO
  extends EstimateHistoryEventEntity {
  actor?: {
    id: string;
    displayName: string;
  };
  estimate?: {
    id: string;
    name: string;
    estimateNumber?: string;
  };
}

export interface EstimateActivityFeed {
  events: EstimateHistoryEventResponseDTO[];
  totalCount: number;
  hasMore: boolean;
}
