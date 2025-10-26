/**
 * Tenant Metrics Validators
 * - Query filters for metrics list/export
 */
import { z } from "zod";
import {
  PaginationSchema,
  DateStringSchema,
} from "@/shared/validators/common.validators";

/**
 * Metrics query schema: time window + optional hour partition + pagination
 */
export const MetricsQuerySchema = z
  .object({
    from: DateStringSchema.optional(),
    to: DateStringSchema.optional(),
    hour: z.number().int().min(0).max(23).optional(),
    ...PaginationSchema.shape,
  })
  .strict()
  .refine(
    (v) =>
      !v.from ||
      !v.to ||
      new Date(v.from).getTime() <= new Date(v.to).getTime(),
    {
      message: "from must be before or equal to to",
      path: ["from"],
    }
  );

export type MetricsQueryInput = z.infer<typeof MetricsQuerySchema>;
