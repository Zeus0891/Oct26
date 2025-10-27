/**
 * Tenant Usage Validators
 * - Query filters for usage list/export
 */
import { z } from "zod";
import { UsageMetric } from "@prisma/client";
import {
  DateStringSchema,
  PaginationSchema,
} from "@/shared/validators/common.validators";

// Build enum from Prisma values to avoid deprecated nativeEnum
const UsageMetricEnum = z.enum(
  Object.values(UsageMetric) as [
    (typeof UsageMetric)[keyof typeof UsageMetric],
    ...(typeof UsageMetric)[keyof typeof UsageMetric][],
  ]
);

/**
 * Usage query schema: metric, time window, processed flag, pagination
 */
export const UsageQuerySchema = z
  .object({
    metric: UsageMetricEnum.optional(),
    recordedAfter: DateStringSchema.optional(),
    recordedBefore: DateStringSchema.optional(),
    processed: z.boolean().optional(),
    ...PaginationSchema.shape,
  })
  .strict()
  .refine(
    (v) =>
      !v.recordedAfter ||
      !v.recordedBefore ||
      new Date(v.recordedAfter).getTime() <=
        new Date(v.recordedBefore).getTime(),
    {
      message: "recordedAfter must be before or equal to recordedBefore",
      path: ["recordedAfter"],
    }
  );

export type UsageQueryInput = z.infer<typeof UsageQuerySchema>;
