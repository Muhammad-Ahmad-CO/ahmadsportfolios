"use client";

import { useEffect, useRef, useState } from "react";
import RetroAiChat, {
  type RetroAiChatInfo,
  type RetroChatMessage,
} from "@/components/ui/retro-ai-chat";
import { askAiChat } from "@/lib/ai-chat.functions";

/**
 * AI chat overlay for the portfolio. Opens when the cloud mascot is clicked.
 * Owns the conversation and calls the Gemini server function; the chat box
 * itself stays a pure retro device.
 */

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_BYTES = 7 * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? "");
      const comma = url.indexOf(",");
      resolve(comma >= 0 ? url.slice(comma + 1) : url);
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export default function AiChatOverlay({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<RetroChatMessage[]>([]);
  const closing = useRef(false);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (message: string, info: RetroAiChatInfo) => {
    const shown = info.files.length
      ? `${message}\n[Attached: ${info.files.map((f) => f.name).join(", ")}]`
      : message;
    const next: RetroChatMessage[] = [...messages, { role: "user", text: shown }];
    setMessages(next);

    const total = info.files.reduce((n, f) => n + f.size, 0);
    if (info.files.some((f) => f.size > MAX_FILE_BYTES) || total > MAX_TOTAL_BYTES) {
      setMessages([
        ...next,
        {
          role: "ai",
          text: "That file is too big for me to read — please attach files under 5 MB each (7 MB total).",
        },
      ]);
      return;
    }

    let files: { name: string; mimeType: string; data: string }[] = [];
    try {
      files = await Promise.all(
        info.files.map(async (f) => ({
          name: f.name,
          mimeType: f.type || "application/octet-stream",
          data: await fileToBase64(f),
        }))
      );
    } catch {
      setMessages([
        ...next,
        { role: "ai", text: "I could not read that file — please try attaching it again." },
      ]);
      return;
    }

    const history = next.slice(-11, -1);
    const result = await askAiChat({
      data: { message, model: info.model, history, files },
    });

    if (result.ok) {
      setMessages([...next, { role: "ai", text: result.reply }]);
    } else if (result.error === "no-key") {
      setMessages([
        ...next,
        {
          role: "ai",
          text: "AI is not set up yet — the Gemini API key still needs to be added in Vercel. Please check back soon, or email Ahmed at ahmadkaimkhani40@gmail.com.",
        },
      ]);
    } else if (result.error === "too-large") {
      setMessages([
        ...next,
        { role: "ai", text: "Those files are too big for me to read — please attach smaller ones." },
      ]);
    } else {
      setMessages([
        ...next,
        { role: "ai", text: "Something went wrong on my side — please try again in a moment." },
      ]);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI chat"
      className="keep-color"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <button
        type="button"
        aria-label="Close chat"
        onClick={close}
        style={{
          position: "absolute",
          inset: 0,
          border: 0,
          padding: 0,
          background: "rgba(0,0,0,0.8)",
          cursor: "pointer",
        }}
      />
      <div
        className="ai-chat-panel"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 760,
          maxHeight: "92svh",
          overflowY: "auto",
          borderRadius: 24,
        }}
      >
        <style>{`.ai-chat-panel > section{padding-top:44px!important;padding-bottom:36px!important}`}</style>
        <button
          type="button"
          aria-label="Close chat"
          onClick={close}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid rgba(215,226,234,0.25)",
            background: "#D7E2EA",
            color: "#0C0C0C",
            fontSize: 20,
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          &times;
        </button>
        <RetroAiChat
          className="keep-color"
          headline="Ask me anything"
          eyebrow="AI chat · online"
          subheadline="Ask about Ahmed, his projects — or anything at all."
          brandName="AHMED"
          modelName="GEMINI"
          models={["Swift", "Clever", "Deep"]}
          defaultModel={1}
          bodyColor="#1B1E22"
          screenColor="#0C0C0C"
          phosphorColor="#62c8d4"
          accentColor="#62c8d4"
          backgroundColor="transparent"
          width={720}
          scanlines
          sound
          autoFocus
          suggestions={[
            "What can Ahmed build?",
            "Tell me about Trap Tower",
            "What AI tools does he use?",
            "How can I hire him?",
            "Summarize a document",
            "Brainstorm app names",
          ]}
          placeholderPrompts={[
            "Ask me anything — code, ideas, or about Ahmed",
            "Explain black holes like I'm twelve",
            "Plan three days in Kyoto on a budget",
            "What did Ahmed build with AI?",
          ]}
          messages={messages}
          onSubmit={handleSubmit}
        >
          <p
            style={{
              margin: "18px 0 0",
              font: "500 11px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace",
              letterSpacing: "0.08em",
              textAlign: "center",
              color: "rgba(215,226,234,0.5)",
            }}
          >
            AI answers can be wrong — please verify important things.
          </p>
        </RetroAiChat>
      </div>
    </div>
  );
}
