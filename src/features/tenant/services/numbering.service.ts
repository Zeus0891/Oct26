import {
  PrismaClient,
  NumberSequence,
  PlatformTenantChildStatus,
  NumberSequenceResetMode,
} from "@prisma/client";
import {
  BaseService,
  AuditAction,
  ApiResponse,
} from "@/shared/services/base/base.service";
import type { RequestContext } from "@/shared/services/base/context.service";
import { AuditService } from "@/shared/services/audit/audit.service";
import { RBACService } from "@/shared/services/security/rbac.service";

export interface ListNumberSequencesParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "status";
  sortOrder?: "asc" | "desc";
}

export class TenantNumberSequenceService extends BaseService<NumberSequence> {
  constructor(
    prisma: PrismaClient,
    auditService: AuditService,
    rbacService: RBACService
  ) {
    super(prisma, auditService, rbacService, "NumberSequence");
  }

  // Helpers
  private shouldAutoReset(seq: NumberSequence, now = new Date()): boolean {
    if (!seq.lastResetAt)
      return seq.resetMode !== NumberSequenceResetMode.NEVER;
    const last = new Date(seq.lastResetAt);
    switch (seq.resetMode) {
      case NumberSequenceResetMode.DAILY:
        return (
          last.getUTCFullYear() !== now.getUTCFullYear() ||
          last.getUTCMonth() !== now.getUTCMonth() ||
          last.getUTCDate() !== now.getUTCDate()
        );
      case NumberSequenceResetMode.WEEKLY: {
        // Compare ISO week number
        const isoWeek = (d: Date) => {
          const tmp = new Date(
            Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
          );
          // Thursday in current week decides the year.
          tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
          const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
          const weekNo = Math.ceil(((+tmp - +yearStart) / 86400000 + 1) / 7);
          return `${tmp.getUTCFullYear()}-W${weekNo}`;
        };
        return isoWeek(last) !== isoWeek(now);
      }
      case NumberSequenceResetMode.MONTHLY:
        return (
          last.getUTCFullYear() !== now.getUTCFullYear() ||
          last.getUTCMonth() !== now.getUTCMonth()
        );
      case NumberSequenceResetMode.YEARLY:
        return last.getUTCFullYear() !== now.getUTCFullYear();
      case NumberSequenceResetMode.NEVER:
      default:
        return false;
    }
  }

  async create(
    ctx: RequestContext,
    data: import("@/shared/services/base/base.service").CreateInput<NumberSequence>
  ): Promise<ApiResponse<NumberSequence>> {
    return this.withAudit(ctx, AuditAction.CREATE, async () => {
      const now = new Date();
      return this.withTenantRLS(ctx, async (tx) => {
        // Optional uniqueness pre-check for friendlier error
        const existing = await tx.numberSequence.findFirst({
          where: { tenantId: ctx.tenant!.tenantId, code: (data as any).code },
        });
        if (existing) {
          throw new Error(
            `Sequence code already exists: ${(data as any).code}`
          );
        }

        return tx.numberSequence.create({
          data: {
            tenantId: ctx.tenant!.tenantId,
            status: PlatformTenantChildStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
            createdByActorId: ctx.actor?.userId,
            updatedByActorId: ctx.actor?.userId,
            // business fields
            code: (data as any).code,
            name: (data as any).name,
            description: (data as any).description ?? null,
            prefix: (data as any).prefix,
            suffix: (data as any).suffix ?? null,
            paddingLength: (data as any).paddingLength ?? 6,
            currentValue: 0,
            minValue: (data as any).minValue ?? 1,
            maxValue: (data as any).maxValue ?? null,
            step: (data as any).step ?? 1,
            resetMode: (data as any).resetMode ?? NumberSequenceResetMode.NEVER,
            resetValue: (data as any).resetValue ?? 1,
            lastResetAt: null,
            formatTemplate: (data as any).formatTemplate ?? "{prefix}-{number}",
            exampleOutput: (data as any).exampleOutput ?? null,
          } as any,
        });
      });
    });
  }

  async update(
    ctx: RequestContext,
    id: string,
    data: import("@/shared/services/base/base.service").UpdateInput<NumberSequence>
  ): Promise<ApiResponse<NumberSequence>> {
    return this.withAudit(ctx, AuditAction.UPDATE, async () => {
      const now = new Date();
      return this.withTenantRLS(ctx, async (tx) => {
        const seq = await tx.numberSequence.findUnique({ where: { id } });
        if (!seq) throw new Error("NumberSequence not found");

        // Basic guards
        const nextMin = (data as any).minValue ?? seq.minValue;
        const nextMax = (data as any).maxValue ?? seq.maxValue;
        if (nextMax != null && nextMax < nextMin) {
          throw new Error("maxValue must be >= minValue");
        }
        if ((data as any).step != null && (data as any).step < 1) {
          throw new Error("step must be >= 1");
        }

        const updateData: any = {
          status: (data as any).status ?? seq.status,
          code: (data as any).code ?? seq.code,
          name: (data as any).name ?? seq.name,
          prefix: (data as any).prefix ?? seq.prefix,
          paddingLength: (data as any).paddingLength ?? seq.paddingLength,
          minValue: nextMin,
          maxValue: nextMax,
          step: (data as any).step ?? seq.step,
          resetMode: (data as any).resetMode ?? seq.resetMode,
          resetValue: (data as any).resetValue ?? seq.resetValue,
          formatTemplate: (data as any).formatTemplate ?? seq.formatTemplate,
          updatedAt: now,
          updatedByActorId: ctx.actor?.userId,
          version: (data as any).version ?? { increment: 1 },
        };

        if (Object.hasOwn(data as any, "description")) {
          updateData.description = (data as any).description;
        }
        if (Object.hasOwn(data as any, "suffix")) {
          updateData.suffix = (data as any).suffix;
        }
        if (Object.hasOwn(data as any, "exampleOutput")) {
          updateData.exampleOutput = (data as any).exampleOutput;
        }

        return tx.numberSequence.update({ where: { id }, data: updateData });
      });
    });
  }

  async delete(ctx: RequestContext, id: string): Promise<ApiResponse<void>> {
    return this.withAudit(ctx, AuditAction.DELETE, async () => {
      await this.withTenantRLS(ctx, async (tx) => {
        const now = new Date();
        await tx.numberSequence.update({
          where: { id },
          data: {
            deletedAt: now,
            deletedByActorId: ctx.actor?.userId,
            status: PlatformTenantChildStatus.INACTIVE,
            updatedAt: now,
            updatedByActorId: ctx.actor?.userId,
            version: { increment: 1 } as any,
          },
        });
      });
      return undefined as unknown as void;
    });
  }

  async findById(
    ctx: RequestContext,
    id: string
  ): Promise<ApiResponse<NumberSequence | null>> {
    return this.withAudit(ctx, AuditAction.READ, async () => {
      return this.withTenantRLS(ctx, async (tx) =>
        tx.numberSequence.findUnique({ where: { id } })
      );
    });
  }

  async list(
    ctx: RequestContext,
    params: ListNumberSequencesParams = {}
  ): Promise<
    ApiResponse<{
      items: NumberSequence[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;
    const skip = Math.max(0, (page - 1) * Math.min(100, Math.max(1, limit)));
    const take = Math.min(100, Math.max(1, limit));

    return this.withAudit(ctx, AuditAction.LIST, async () => {
      const { items, total } = await this.withTenantRLS(ctx, async (tx) => {
        const where: any = { tenantId: ctx.tenant!.tenantId };
        const orderBy: any = { [sortBy]: sortOrder };
        const [rows, count] = await Promise.all([
          tx.numberSequence.findMany({ where, orderBy, skip, take }),
          tx.numberSequence.count({ where }),
        ]);
        return { items: rows, total: count };
      });
      return { items, total, page, limit };
    });
  }

  // ===== Critical operations =====
  async getNext(ctx: RequestContext, id: string): Promise<ApiResponse<number>> {
    return this.withAudit(ctx, AuditAction.UPDATE, async () => {
      const now = new Date();
      return this.withTenantRLS(ctx, async (tx) => {
        const value = await tx.$transaction(async (trx) => {
          const seq = await trx.numberSequence.findUniqueOrThrow({
            where: { id },
          });

          const autoReset = this.shouldAutoReset(seq, now);
          const base = autoReset ? seq.resetValue : seq.currentValue;
          let candidate = base + seq.step;
          if (candidate < seq.minValue) candidate = seq.minValue;
          if (seq.maxValue != null && candidate > seq.maxValue) {
            throw new Error("Sequence exceeded maxValue");
          }

          await trx.numberSequence.update({
            where: { id },
            data: {
              currentValue: candidate,
              lastResetAt: autoReset ? now : undefined,
              updatedAt: now,
              updatedByActorId: ctx.actor?.userId,
              version: { increment: 1 } as any,
            },
          });

          return candidate;
        });
        return value;
      });
    });
  }

  async generateNumber(
    ctx: RequestContext,
    id: string
  ): Promise<ApiResponse<string>> {
    return this.withAudit(ctx, AuditAction.READ, async () => {
      // Fetch sequence for formatting
      const seq = await this.withTenantRLS(ctx, async (tx) =>
        tx.numberSequence.findUniqueOrThrow({ where: { id } })
      );

      const nextResp = await this.getNext(ctx, id);
      if (!nextResp.success || nextResp.data == null) {
        throw new Error(nextResp.error?.message || "Failed to get next value");
      }
      const nextValue = nextResp.data;

      const padded = String(nextValue).padStart(seq.paddingLength, "0");
      let result = seq.formatTemplate || "{prefix}-{number}";
      result = result.replace("{prefix}", seq.prefix || "");
      result = result.replace("{number}", padded);
      result = result.replace("{suffix}", seq.suffix || "");
      return result;
    });
  }

  async reset(
    ctx: RequestContext,
    id: string,
    newValue?: number
  ): Promise<ApiResponse<NumberSequence>> {
    return this.withAudit(ctx, AuditAction.UPDATE, async () => {
      const now = new Date();
      return this.withTenantRLS(ctx, async (tx) => {
        const seq = await tx.numberSequence.findUniqueOrThrow({
          where: { id },
        });
        const value = newValue ?? seq.resetValue ?? 1;
        if (value < seq.minValue) {
          throw new Error("Reset value must be >= minValue");
        }
        if (seq.maxValue != null && value > seq.maxValue) {
          throw new Error("Reset value must be <= maxValue");
        }
        const updated = await tx.numberSequence.update({
          where: { id },
          data: {
            currentValue: value,
            lastResetAt: now,
            updatedAt: now,
            updatedByActorId: ctx.actor?.userId,
            version: { increment: 1 } as any,
          },
        });
        return updated;
      });
    });
  }
}
