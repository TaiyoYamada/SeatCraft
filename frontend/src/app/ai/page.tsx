"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Send, Bot, User, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

interface Message {
    role: "user" | "model";
    content: string;
}

export default function AIConsultPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const history = messages.map((msg) => ({
                role: msg.role,
                parts: [{ text: msg.content }],
            }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage, history }),
            });

            const data = await response.json();

            if (data.error) {
                setMessages((prev) => [
                    ...prev,
                    { role: "model", content: "申し訳ございません。エラーが発生しました。" },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: "model", content: data.response },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "model", content: "通信エラーが発生しました。再度お試しください。" },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-16 bg-[var(--color-bg-secondary)] flex flex-col">
            {/* Header */}
            <div className="bg-background border-b border-border p-4 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-purple-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-semibold text-foreground">AIアシスタント</h1>
                            <p className="text-xs text-muted-foreground">座席配置のご相談はお任せください</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-3xl mx-auto space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-purple-500 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                                AIに相談しましょう
                            </h2>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                座席配置やイベント企画について、何でもお気軽にご質問ください。
                            </p>
                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                {[
                                    "会議室の座席配置のコツは？",
                                    "グループ分けのアイデアを教えて",
                                    "大人数のイベント配置について",
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setInput(suggestion)}
                                        className="px-4 py-2 rounded-full bg-secondary text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {message.role === "model" && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-purple-500 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                                        ? "bg-[var(--color-accent)] text-white"
                                        : "bg-background border border-border"
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                            {message.role === "user" && (
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-purple-500 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-background border border-border rounded-2xl px-4 py-3">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="border-t border-border bg-background p-4">
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="メッセージを入力..."
                        className="flex-1 px-4 py-3 rounded-xl border border-border bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-foreground placeholder:text-muted-foreground"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="lg"
                        className="rounded-xl px-6"
                        disabled={!input.trim() || isLoading}
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
