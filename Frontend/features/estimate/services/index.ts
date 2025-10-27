// ============================================================================
// ESTIMATE API SERVICES INDEX
// ============================================================================
// Central export point for all estimate API services
// ============================================================================

import { EstimateApiService } from "./estimate-api.service";
import { EstimateLineItemApiService } from "./estimate-line-item-api.service";
import { BidApiService } from "./bid-api.service";
import { EstimateRevisionApiService } from "./estimate-revision-api.service";

// Core services aligned with backend endpoints
export {
  EstimateApiService,
  default as EstimateApi,
} from "./estimate-api.service";
export {
  EstimateLineItemApiService,
  default as EstimateLineItemApi,
} from "./estimate-line-item-api.service";
export { BidApiService, default as BidApi } from "./bid-api.service";
export {
  EstimateRevisionApiService,
  default as EstimateRevisionApi,
} from "./estimate-revision-api.service";

// Re-export for convenience
export {
  EstimateApiService as EstimateService,
  EstimateLineItemApiService as LineItemService,
  BidApiService as BidService,
  EstimateRevisionApiService as RevisionService,
};

// Grouped services object
export const EstimatingServices = {
  Estimate: EstimateApiService,
  LineItem: EstimateLineItemApiService,
  Bid: BidApiService,
  Revision: EstimateRevisionApiService,
};

// Default export
export default EstimatingServices;
