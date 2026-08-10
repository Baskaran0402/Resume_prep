"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, User, Bot, AlertTriangle } from "lucide-react";

export default function MockInterviewClient({
  interviewId,
  initialMessages,
  userId,
}: {
  interviewId: string;
  initialMessages: any[];
  userId: string;
}) {
  const [messages, setMessages] = useState<any[]>(initialMessages || []);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/mock/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          interview_id: interviewId,
          answer: userMessage.content,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.next_question,
          evaluation: data.evaluation,
        },
      ]);
    } catch (err) {
      console.error(err);
      alert("Error sending message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Session header */}
      <div className="border-b border-border px-6 py-3 flex items-center justify-between bg-background">
        <div>
          <Link
            href="/interview"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Interview Prep
          </Link>
          <h1 className="text-base font-semibold mt-0.5">Mock Interview</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">Session active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-3xl mx-auto w-full">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`flex gap-3 max-w-[85%] ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                  msg.role === "user" ? "bg-primary" : "bg-emerald-600"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Bot className="w-3.5 h-3.5 text-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-2 w-full">
                {/* Evaluation panel */}
                {msg.evaluation && (
                  <div className="bg-card border border-border rounded-xl p-4 text-sm w-full">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        Answer Evaluation
                      </span>
                      <span
                        className={`font-bold text-sm ${
                          msg.evaluation.score >= 80
                            ? "text-green-500"
                            : msg.evaluation.score >= 50
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {msg.evaluation.score}/100
                      </span>
                    </div>
                    <p className="text-foreground text-sm leading-relaxed">
                      {msg.evaluation.feedback}
                    </p>
                    {msg.evaluation.missing_topics?.length > 0 && (
                      <div className="mt-3 bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-xs text-red-500 font-medium uppercase tracking-wider">
                            Missed Concepts
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.evaluation.missing_topics.map(
                            (topic: string, tIdx: number) => (
                              <span
                                key={tIdx}
                                className="bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-full"
                              >
                                {topic}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border text-foreground rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isSending && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-4 bg-background">
        <form
          onSubmit={handleSend}
          className="relative max-w-3xl mx-auto flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
            className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors"
            rows={3}
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
