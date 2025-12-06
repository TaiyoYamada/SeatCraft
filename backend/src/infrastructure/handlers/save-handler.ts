// ============================================================
// Save Handler
// POST /save - シャッフルせずに配置を保存
// ============================================================

import type {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from 'aws-lambda';
import { DynamoDBLayoutRepository } from '../repositories/DynamoDBLayoutRepository.js';
import { createLayout } from '../../domain/entities.js';
import { generateId } from '../../domain/value-objects.js';
import { z } from 'zod';

const repository = new DynamoDBLayoutRepository();

// バリデーションスキーマ
const SaveRequestSchema = z.object({
    members: z.array(z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        nickname: z.string().optional(),
        gender: z.enum(['male', 'female', 'other']),
        tags: z.array(z.string()),
    })).min(1),
    settings: z.object({
        templateType: z.enum(['line', 'circle', 'island', 'custom']),
        seats: z.array(z.object({
            id: z.string().min(1),
            position: z.object({ x: z.number(), y: z.number() }),
            size: z.object({ width: z.number(), height: z.number() }),
            label: z.string().optional(),
        })),
        canvasWidth: z.number(),
        canvasHeight: z.number(),
        gridSize: z.number(),
    }),
    assignments: z.array(z.object({
        seatId: z.string().min(1),
        memberId: z.string().min(1),
    })),
    constraints: z.array(z.any()).default([]),
});

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export async function handler(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    // OPTIONSリクエスト（CORS プリフライト）
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: '',
        };
    }

    try {
        // リクエストボディのパース
        if (!event.body) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'BAD_REQUEST',
                    message: 'リクエストボディが必要です',
                }),
            };
        }

        const body = JSON.parse(event.body);

        // バリデーション
        const result = SaveRequestSchema.safeParse(body);
        if (!result.success) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'VALIDATION_ERROR',
                    message: 'リクエストが不正です',
                    details: result.error.flatten(),
                }),
            };
        }

        const { members, settings, assignments, constraints } = result.data;

        // レイアウトを生成
        const layoutId = generateId();
        const layout = createLayout({
            id: layoutId,
            members,
            settings,
            assignments,
            constraints,
        });

        // DynamoDB に保存
        await repository.save(layout);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                id: layoutId,
                assignments,
            }),
        };
    } catch (error) {
        console.error('Save handler error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: 'INTERNAL_ERROR',
                message: 'サーバーエラーが発生しました',
            }),
        };
    }
}
