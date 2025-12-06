// ============================================================
// Request Validation Schemas
// ============================================================

import { z } from 'zod';

const PositionSchema = z.object({
    x: z.number(),
    y: z.number(),
});

const SizeSchema = z.object({
    width: z.number().positive(),
    height: z.number().positive(),
});

const MemberSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    nickname: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']),
    tags: z.array(z.string()),
});

const SeatSchema = z.object({
    id: z.string().min(1),
    position: PositionSchema,
    size: SizeSchema,
    label: z.string().optional(),
});

const BaseConstraintSchema = z.object({
    id: z.string().min(1),
    enabled: z.boolean(),
});

const GenderBalanceConstraintSchema = BaseConstraintSchema.extend({
    type: z.literal('genderBalance'),
});

const FixedSeatConstraintSchema = BaseConstraintSchema.extend({
    type: z.literal('fixedSeat'),
    memberId: z.string().min(1),
    seatId: z.string().min(1),
});

const NGPairConstraintSchema = BaseConstraintSchema.extend({
    type: z.literal('ngPair'),
    memberIds: z.tuple([z.string().min(1), z.string().min(1)]),
});

const MustSitTogetherConstraintSchema = BaseConstraintSchema.extend({
    type: z.literal('mustSitTogether'),
    memberIds: z.array(z.string().min(1)).min(2),
});

const MustNotSitAdjacentConstraintSchema = BaseConstraintSchema.extend({
    type: z.literal('mustNotSitAdjacent'),
    memberIds: z.tuple([z.string().min(1), z.string().min(1)]),
});

const ConstraintSchema = z.discriminatedUnion('type', [
    GenderBalanceConstraintSchema,
    FixedSeatConstraintSchema,
    NGPairConstraintSchema,
    MustSitTogetherConstraintSchema,
    MustNotSitAdjacentConstraintSchema,
]);

const LayoutSettingsSchema = z.object({
    templateType: z.enum(['line', 'circle', 'island', 'custom']),
    seats: z.array(SeatSchema),
    canvasWidth: z.number().positive(),
    canvasHeight: z.number().positive(),
    gridSize: z.number().positive(),
});

export const ShuffleRequestSchema = z.object({
    members: z.array(MemberSchema).min(1),
    settings: LayoutSettingsSchema,
    constraints: z.array(ConstraintSchema),
});

export type ValidatedShuffleRequest = z.infer<typeof ShuffleRequestSchema>;
