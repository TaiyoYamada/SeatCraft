// ============================================================
// Shuffle Handler
// POST /shuffle
// ============================================================

import type {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from 'aws-lambda';
import { GenerateLayoutUseCase } from '../../application/GenerateLayoutUseCase.js';
import { DynamoDBLayoutRepository } from '../repositories/DynamoDBLayoutRepository.js';
import { ShuffleRequestSchema } from './validation.js';

const repository = new DynamoDBLayoutRepository();
const useCase = new GenerateLayoutUseCase(repository);

/**
 * CORS ヘッダー
 */
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * エラーレスポンスを生成
 */
function errorResponse(
    statusCode: number,
    error: string,
    message: string
): APIGatewayProxyResult {
    return {
        statusCode,
        headers: corsHeaders,
        body: JSON.stringify({ error, message }),
    };
}

/**
 * Lambda ハンドラー
 */
export async function handler(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    // OPTIONS リクエスト (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: '',
        };
    }

    try {
        // 1. リクエストボディのパース
        if (!event.body) {
            return errorResponse(400, 'BAD_REQUEST', 'リクエストボディが必要です');
        }

        let requestBody: unknown;
        try {
            requestBody = JSON.parse(event.body);
        } catch {
            return errorResponse(400, 'BAD_REQUEST', 'リクエストボディが不正なJSONです');
        }

        // 2. バリデーション
        const parseResult = ShuffleRequestSchema.safeParse(requestBody);
        if (!parseResult.success) {
            return errorResponse(
                400,
                'VALIDATION_ERROR',
                parseResult.error.errors.map((e) => e.message).join(', ')
            );
        }

        // 3. UseCase 実行
        const result = await useCase.execute(parseResult.data);

        // 4. レスポンス返却
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Shuffle handler error:', error);

        return errorResponse(
            500,
            'INTERNAL_ERROR',
            error instanceof Error ? error.message : '予期しないエラーが発生しました'
        );
    }
}
