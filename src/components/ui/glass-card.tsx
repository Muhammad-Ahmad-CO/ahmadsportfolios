import * as React from "react";
import { Mail, Phone, Linkedin, Github } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, email, phone, linkedin, github, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("glass-card-wrap", className)} {...props}>
        <style>{`
          .glass-card-wrap {
            --c-bg: rgba(215,226,234,0.06);
            --c-border: rgba(215,226,234,0.18);
            --c-text: #D7E2EA;
            perspective: 1200px;
            width: 100%;
            max-width: 420px;
          }
          .glass-card {
            position: relative;
            border-radius: 28px;
            padding: 28px 26px;
            background: linear-gradient(160deg, rgba(215,226,234,0.10) 0%, rgba(187,204,215,0.04) 60%, rgba(12,12,12,0.55) 100%);
            border: 1px solid var(--c-border);
            backdrop-filter: blur(18px) saturate(140%);
            -webkit-backdrop-filter: blur(18px) saturate(140%);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.08),
              0 30px 60px -20px rgba(0,0,0,0.6);
            color: var(--c-text);
            transform-style: preserve-3d;
            transition: transform .8s cubic-bezier(.22,1,.36,1), box-shadow .6s ease;
            overflow: hidden;
          }
          .glass-card:hover {
            transform: rotateX(6deg) rotateY(-6deg) translateZ(10px);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.12),
              0 40px 80px -20px rgba(0,0,0,0.75),
              0 0 60px rgba(215,226,234,0.08);
          }
          .glass-card::before {
            content: "";
            position: absolute;
            inset: 0;
            background: radial-gradient(120% 80% at 0% 0%, rgba(215,226,234,0.18), transparent 50%);
            pointer-events: none;
          }
          .gc-circles {
            position: absolute;
            right: -30px;
            top: -30px;
            width: 180px;
            height: 180px;
            pointer-events: none;
          }
          .gc-circle {
            position: absolute;
            border-radius: 999px;
            border: 1px solid rgba(215,226,234,0.18);
            background: radial-gradient(circle at 30% 30%, rgba(215,226,234,0.18), rgba(215,226,234,0) 60%);
            animation: gc-float 6s ease-in-out infinite;
          }
          @keyframes gc-float {
            0%,100% { transform: translate3d(0,0,0); opacity: .85; }
            50% { transform: translate3d(-6px,8px,0); opacity: 1; }
          }
          .gc-title {
            font-size: 1.5rem;
            font-weight: 800;
            letter-spacing: -0.01em;
            text-transform: uppercase;
            margin: 0 0 6px;
          }
          .gc-sub {
            font-size: .8rem;
            letter-spacing: .12em;
            text-transform: uppercase;
            opacity: .6;
            margin: 0 0 22px;
          }
          .gc-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            border-radius: 14px;
            background: rgba(215,226,234,0.04);
            border: 1px solid rgba(215,226,234,0.10);
            transition: transform .35s ease, background .35s ease, border-color .35s ease;
            text-decoration: none;
            color: var(--c-text);
            font-size: .92rem;
          }
          .gc-row + .gc-row { margin-top: 10px; }
          .gc-row:hover {
            transform: translateX(6px);
            background: rgba(215,226,234,0.10);
            border-color: rgba(215,226,234,0.25);
          }
          .gc-row svg { flex-shrink: 0; opacity: .85; }
          .gc-socials {
            display: flex;
            gap: 10px;
            margin-top: 18px;
          }
          .gc-icon {
            width: 42px; height: 42px;
            display: inline-flex; align-items: center; justify-content: center;
            border-radius: 12px;
            border: 1px solid rgba(215,226,234,0.18);
            background: rgba(215,226,234,0.04);
            color: var(--c-text);
            transition: transform .35s ease, background .35s ease, border-color .35s ease;
          }
          .gc-icon:hover {
            transform: translateY(-3px);
            background: rgba(215,226,234,0.14);
            border-color: rgba(215,226,234,0.35);
          }
        `}</style>

        <div className="glass-card">
          <div className="gc-circles">
            {[
              { size: 170, pos: 8, delay: "0s" },
              { size: 140, pos: 25, delay: ".4s" },
              { size: 110, pos: 45, delay: ".8s" },
              { size: 80, pos: 65, delay: "1.2s" },
            ].map((c, i) => (
              <span
                key={i}
                className="gc-circle"
                style={{
                  width: c.size,
                  height: c.size,
                  right: c.pos,
                  top: c.pos,
                  animationDelay: c.delay,
                }}
              />
            ))}
          </div>

          <h3 className="gc-title">Get in touch</h3>
          <p className="gc-sub">Available for work</p>

          {email && (
            <a className="gc-row" href={`mailto:${email}`}>
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </a>
          )}
          {phone && (
            <a className="gc-row" href={`tel:${phone}`}>
              <Phone className="h-4 w-4" />
              <span>{phone}</span>
            </a>
          )}

          <div className="gc-socials">
            {linkedin && (
              <a className="gc-icon" href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {github && (
              <a className="gc-icon" href={github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
export default GlassCard;
