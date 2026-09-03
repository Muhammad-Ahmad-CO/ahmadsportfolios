import * as React from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { sendContactMessage } from "@/lib/contact.functions";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const send = useServerFn(sendContactMessage);
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string>("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setStatus("sending");
    setError("");
    try {
      await send({
        data: {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          subject: String(fd.get("subject") ?? ""),
          message: String(fd.get("message") ?? ""),
        },
      });
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <form onSubmit={onSubmit} className="cf-form">
      <style>{`
        .cf-form { display: grid; gap: 10px; width: 100%; }
        .cf-form input, .cf-form textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 13px;
          border-radius: 12px;
          background: rgba(215,226,234,0.05);
          border: 1px solid rgba(215,226,234,0.14);
          color: #D7E2EA;
          font-size: .86rem;
          font-family: inherit;
          outline: none;
          transition: border-color .3s ease, background .3s ease;
        }
        .cf-form input::placeholder, .cf-form textarea::placeholder {
          color: rgba(215,226,234,0.45);
        }
        .cf-form input:focus, .cf-form textarea:focus {
          border-color: rgba(215,226,234,0.45);
          background: rgba(215,226,234,0.09);
        }
        .cf-form textarea { resize: vertical; min-height: 96px; }
        .cf-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 11px 18px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-size: .8rem;
          letter-spacing: .1em;
          text-transform: uppercase;
          font-weight: 600;
          color: #0C0C0C;
          background: linear-gradient(180deg, #BBCCD7 0%, #D7E2EA 100%);
          transition: transform .25s ease, opacity .25s ease;
        }
        .cf-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .cf-btn:disabled { opacity: .6; cursor: not-allowed; }
        .cf-note { font-size: .74rem; line-height: 1.4; opacity: .8; margin: 0; }
        .cf-note.err { color: #ffb4b4; opacity: 1; }
        .cf-ok { display: inline-flex; align-items: center; gap: 8px; font-size: .8rem; }
        .cf-row { display: grid; gap: 10px; }
        @container (min-width: 560px) { .cf-row { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="cf-row">
        <input name="name" required maxLength={100} placeholder="Your name" aria-label="Your name" />
        <input
          name="email"
          type="email"
          required
          maxLength={255}
          placeholder="Your email"
          aria-label="Your email"
        />
      </div>
      <input name="subject" maxLength={150} placeholder="Subject (optional)" aria-label="Subject" />
      <textarea
        name="message"
        required
        minLength={5}
        maxLength={2000}
        placeholder="Your message..."
        aria-label="Your message"
      />

      <button className="cf-btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending
          </>
        ) : (
          <>
            Send message <Send className="h-4 w-4" />
          </>
        )}
      </button>

      {status === "sent" && (
        <p className="cf-note cf-ok" role="status">
          <CheckCircle2 className="h-4 w-4" /> Thanks! Your message has been sent.
        </p>
      )}
      {status === "error" && (
        <p className="cf-note err" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
