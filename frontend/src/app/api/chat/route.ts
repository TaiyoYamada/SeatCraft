import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `あなたはSeatCraft（シートクラフト）のAIアシスタントです。
SeatCraftは、会議やイベントの座席配置を簡単に作成・管理できるWebアプリケーションです。

あなたの役割：
- 座席配置に関するアドバイスを提供する
- メンバー管理やグループ分けのヒントを教える
- イベント企画や会議の座席レイアウトのベストプラクティスを共有する
- ユーザーの質問に親切丁寧に回答する

回答のガイドライン：
- 簡潔で分かりやすい日本語で回答してください
- 具体的なアドバイスを心がけてください
- フレンドリーで親しみやすいトーンで話してください
- 技術的なサポートが必要な場合は、適切な案内をしてください`;

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API key is not configured' },
                { status: 500 }
            );
        }

        const { message, history } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';
        const model = genAI.getGenerativeModel({ model: modelName });

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: SYSTEM_PROMPT }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'はい、SeatCraftのAIアシスタントとして、座席配置やイベント企画についてお手伝いします。何でもお気軽にご質問ください！' }],
                },
                ...(history || []),
            ],
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        return NextResponse.json({ response });
    } catch (error) {
        console.error('Gemini API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `Failed to get response from AI: ${errorMessage}` },
            { status: 500 }
        );
    }
}
