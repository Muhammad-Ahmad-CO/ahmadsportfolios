import * as React from "react";
import { Github, Linkedin, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SocialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  email: string;
  emailUrl: string;
  phone: string;
  linkedin: string;
  github: string;
}

/** Uiverse-inspired hover card, retuned to the portfolio's monochrome theme. */
const SocialCard = React.forwardRef<HTMLDivElement, SocialCardProps>(
  ({ className, email, emailUrl, phone, linkedin, github, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("social-card", className)} {...props}>
        <style>{`
          .social-card {
            position: relative;
            width: 200px;
            height: 200px;
            background: #111214;
            border-radius: 30px;
            overflow: hidden;
            box-shadow: rgba(0, 0, 0, 0.55) 0px 18px 40px -18px;
            transition: transform 1s ease-in-out, box-shadow 1s ease-in-out;
            border: 1px solid rgba(215, 226, 234, 0.22);
          }
          .social-card .background {
            position: absolute;
            inset: 0;
            background-image: linear-gradient(43deg, #0C0C0C 0%, #3A424A 48%, #BBCCD7 100%);
            opacity: 0.85;
          }
          .social-card .logo {
            position: absolute;
            right: 50%;
            bottom: 50%;
            transform: translate(50%, 50%);
            transition: all 0.6s ease-in-out;
            font-size: 1.05rem;
            font-weight: 600;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #0C0C0C;
            white-space: nowrap;
          }
          .social-card:hover .logo {
            transform: translate(38px, -60px);
            letter-spacing: 0px;
            font-size: 0.8rem;
            color: #D7E2EA;
          }
          .social-card .box {
            position: absolute;
            display: flex;
            align-items: flex-end;
            justify-content: flex-end;
            padding: 10px;
            background: rgba(215, 226, 234, 0.28);
            border-top: 2px solid rgba(215, 226, 234, 0.75);
            border-right: 1px solid rgba(215, 226, 234, 0.6);
            border-radius: 10% 13% 42% 0%/10% 12% 75% 0%;
            box-shadow: rgba(0, 0, 0, 0.35) -7px 7px 29px 0px;
            transform-origin: bottom left;
            transition: all 1s ease-in-out;
            color: rgba(215, 226, 234, 0.85);
          }
          .social-card .box::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
          }
          .social-card .box:hover { color: #0C0C0C; }
          .social-card .box svg { position: relative; z-index: 1; }
          .social-card .box1 { width: 70%; height: 70%; bottom: -70%; left: -70%; }
          .social-card .box1::before {
            background: radial-gradient(circle at 30% 107%, #F2F6F9 0%, #D7E2EA 45%, #8C99A3 90%);
          }
          .social-card .box2 { width: 50%; height: 50%; bottom: -50%; left: -50%; transition-delay: 0.2s; }
          .social-card .box2::before {
            background: radial-gradient(circle at 30% 107%, #E4ECF2 0%, #BBCCD7 90%);
          }
          .social-card .box3 { width: 30%; height: 30%; bottom: -30%; left: -30%; transition-delay: 0.4s; }
          .social-card .box3::before {
            background: radial-gradient(circle at 30% 107%, #CFDAE2 0%, #9AA7B1 90%);
          }
          .social-card .box4 { width: 10%; height: 10%; bottom: -10%; left: -10%; transition-delay: 0.6s; }
          .social-card .box:hover::before { opacity: 1; }
          .social-card:hover { transform: scale(1.06); }
          .social-card:hover .box { bottom: -1px; left: -1px; }
          @media (prefers-reduced-motion: reduce) {
            .social-card, .social-card .box, .social-card .logo { transition-duration: 0.01ms; }
          }
        `}</style>

        <span className="background" aria-hidden />
        <span className="logo">Connect</span>

        <a
          className="box box1"
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub profile"
        >
          <Github className="h-5 w-5" />
        </a>
        <a
          className="box box2"
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn profile"
        >
          <Linkedin className="h-5 w-5" />
        </a>
        <a
          className="box box3"
          href={emailUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Email ${email}`}
        >
          <Mail className="h-4 w-4" />
        </a>
        <a
          className="box box4"
          href={`tel:${phone.replace(/[^+\d]/g, "")}`}
          aria-label={`Call ${phone}`}
        >
          <Phone className="h-3 w-3" />
        </a>
      </div>
    );
  },
);
SocialCard.displayName = "SocialCard";

export default SocialCard;
