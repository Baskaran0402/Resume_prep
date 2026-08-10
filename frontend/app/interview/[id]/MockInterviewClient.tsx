"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, User, Bot, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";

export default function MockInterviewClient({ interviewId, initialMessages, userId }: { interviewId: string, initialMessages: any[], userId: string }) {
  const [messages, setMessages] = useState<any[]>(initialMessages || []);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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
      
      const assistantMessage = {
        role: "assistant",
        content: data.next_question,
        evaluation: data.evaluation
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      alert("Error sending message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto w-full">
      <div className="py-4 px-6 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <Link href="/interview" className="text-zinc-500 hover:text-white transition-colors text-xs mb-1 inline-block">
            ← Back to Hub
          </Link>
          <h1 className="text-xl font-bold">Mock Interview Session</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs text-zinc-400">Session Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>

              {/* Message Content */}
              <div className="flex flex-col space-y-3 w-full">
                {/* Previous Answer Evaluation (Only shows on assistant messages that have evaluations) */}
                {msg.evaluation && (
                  <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-sm w-full">
                    <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
                      <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Evaluation of your answer</span>
                      <span className={`font-bold ${msg.evaluation.score >= 80 ? 'text-green-400' : msg.evaluation.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        Score: {msg.evaluation.score}/100
                      </span>
                    </div>
                    <p className="text-zinc-300 mb-3">{msg.evaluation.feedback}</p>
                    
                    {msg.evaluation.missing_topics && msg.evaluation.missing_topics.length > 0 && (
                      <div className="mt-3 bg-red-950/30 border border-red-900/50 rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Missed Concepts</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.evaluation.missing_topics.map((topic: string, tIdx: number) => (
                            <span key={tIdx} className="bg-red-900/40 text-red-300 text-xs px-2 py-1 rounded">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actual Message Bubble */}
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-zinc-800 text-zinc-100 rounded-tl-sm shadow-xl'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-start gap-4 max-w-[80%]">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-zinc-800 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-950">
        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type your answer... (Press Enter to send, Shift+Enter for new line)"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-4 pr-12 py-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="absolute right-3 bottom-3 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
