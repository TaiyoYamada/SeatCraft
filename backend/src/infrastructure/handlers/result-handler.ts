// ============================================================
// Result Handler
// GET /result/{id}
// ============================================================

import type {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from 'aws-lambda';
import { GetLayoutUseCase, NotFoundError } from '../../application/GetLayoutUseCase.js';
import { DynamoDBLayoutRepository } from '../repositories/DynamoDBLayoutRepository.js';

const repository = new DynamoDBLayoutRepository();
const useCase = new GetLayoutUseCase(repository);

/**
 * CORS ヘッダー
 */
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
        // 1. パスパラメータから ID を取得
        const id = event.pathParameters?.id;
        if (!id) {
            return errorResponse(400, 'BAD_REQUEST', 'IDが必要です');
        }

        // 2. UseCase 実行
        const result = await useCase.execute(id);

        // 3. レスポンス返却
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Result handler error:', error);

        if (error instanceof NotFoundError) {
            return errorResponse(404, 'NOT_FOUND', error.message);
        }

        return errorResponse(
            500,
            'INTERNAL_ERROR',
            error instanceof Error ? error.message : '予期しないエラーが発生しました'
        );
    }
}
