'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import type { ChatMessage } from '@/types/chat';

interface ChatContainerProps {
  sessionId: string;
  tokenBalance: number;
  onTokenUse: () => void;
}

export function ChatContainer({ sessionId, tokenBalance, onTokenUse }: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (text: string) => {
    if (tokenBalance <= 0) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sessionId,
      type: 'user_text',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build conversation history for Claude
      const history = [...messages, userMsg]
        .filter((m) => m.type === 'user_text' || m.type === 'ai_question' || m.type === 'ai_mirror')
        .map((m) => ({
          role: (m.type === 'user_text' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.content,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'core',
          messages: history,
          max_tokens: 600,
          sessionId,
          userId: `user_${sessionId}`,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const aiText = data.content
        .map((c: { type: string; text?: string }) => (c.type === 'text' ? c.text : ''))
        .join('');

      const aiMsg: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        sessionId,
        type: 'ai_question',
        content: aiText,
        metadata: { tokenCost: 1 },
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      onTokenUse();
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        sessionId,
        type: 'system',
        content: e instanceof Error ? e.message : 'Something went wrong.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-[#444444]">
              Your deep conversation begins here.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-1 px-4 py-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-white/30 animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Token indicator */}
      <div className="px-4 py-1 text-right">
        <span className="text-[10px] text-[#444444]">
          {tokenBalance} tokens remaining
        </span>
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading || tokenBalance <= 0} />
    </div>
  );
}
