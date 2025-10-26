import { z } from "zod";
import {
  PlatformTenantChildStatus,
  NumberSequenceResetMode,
} from "@prisma/client";

// Enum from Prisma values for safety
const StatusEnum = z.enum(
  Object.values(PlatformTenantChildStatus) as [
    (typeof PlatformTenantChildStatus)[keyof typeof PlatformTenantChildStatus],
    ...(typeof PlatformTenantChildStatus)[keyof typeof PlatformTenantChildStatus][],
  ]
);

const ResetModeEnum = z.enum(
  Object.values(NumberSequenceResetMode) as [
    (typeof NumberSequenceResetMode)[keyof typeof NumberSequenceResetMode],
    ...(typeof NumberSequenceResetMode)[keyof typeof NumberSequenceResetMode][],
  ]
);

export const CreateNumberSequenceSchema = z
  .object({
    code: z
      .string()
      .min(2)
      .max(50)
      .regex(
        /^[A-Z0-9_-]+$/,
        "code must be uppercase letters, numbers, _ or -"
      ),
    name: z.string().min(2).max(255),
    description: z.string().max(1000).optional().nullable(),
    prefix: z.string().min(1).max(20),
    suffix: z.string().max(20).optional().nullable(),
    paddingLength: z.number().int().min(1).max(20).default(6),
    minValue: z.number().int().min(1).default(1),
    maxValue: z.number().int().min(1).optional().nullable(),
    step: z.number().int().min(1).default(1),
    resetMode: ResetModeEnum.default(NumberSequenceResetMode.NEVER),
    resetValue: z.number().int().min(0).default(1),
    formatTemplate: z.string().min(1).max(200).default("{prefix}-{number}"),
    exampleOutput: z.string().max(100).optional().nullable(),
  })
  .refine((v) => (v.maxValue ? v.maxValue >= v.minValue : true), {
    path: ["maxValue"],
    message: "maxValue must be >= minValue",
  })
  .strict();
export type CreateNumberSequenceInput = z.infer<
  typeof CreateNumberSequenceSchema
>;

export const UpdateNumberSequenceSchema = z
  .object({
    status: StatusEnum.optional(),
    code: z
      .string()
      .min(2)
      .max(50)
      .regex(/^[A-Z0-9_-]+$/)
      .optional(),
    name: z.string().min(2).max(255).optional(),
    description: z.string().max(1000).optional().nullable(),
    prefix: z.string().min(1).max(20).optional(),
    suffix: z.string().max(20).optional().nullable(),
    paddingLength: z.number().int().min(1).max(20).optional(),
    minValue: z.number().int().min(1).optional(),
    maxValue: z.number().int().min(1).optional().nullable(),
    step: z.number().int().min(1).optional(),
    resetMode: ResetModeEnum.optional(),
    resetValue: z.number().int().min(0).optional(),
    formatTemplate: z.string().min(1).max(200).optional(),
    exampleOutput: z.string().max(100).optional().nullable(),
  })
  .refine(
    (v) =>
      v.maxValue === undefined || v.minValue === undefined
        ? true
        : (v.maxValue ?? 0) >= (v.minValue ?? 1),
    {
      path: ["maxValue"],
      message: "maxValue must be >= minValue",
    }
  )
  .strict();
export type UpdateNumberSequenceInput = z.infer<
  typeof UpdateNumberSequenceSchema
>;

export const ResetSequenceSchema = z
  .object({
    newValue: z.number().int().min(0).optional(),
  })
  .strict();
export type ResetSequenceInput = z.infer<typeof ResetSequenceSchema>;
