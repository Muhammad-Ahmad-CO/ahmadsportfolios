import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

// TODO(owner): replace "G-XXXXXXX" with your real GA4 Measurement ID
// (Google Analytics → Admin → Data streams → your web stream → Measurement ID).
const GA_ID = "G-XXXXXXX";

function NotFoundComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0C0C0C] px-6 text-[#D7E2EA]">
      <div className="max-w-xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] opacity-50">Error 404</p>
        <h1 className="hero-heading mt-4 font-black uppercase" style={{ fontSize: "clamp(4rem, 18vw, 10rem)", lineHeight: 1 }}>
          404
        </h1>
        <p className="mt-6 text-lg md:text-xl opacity-80">
          This page wandered off like an untrained model.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-full bg-[#D7E2EA] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-[#0C0C0C] transition-opacity hover:opacity-85">
            Back to Home
          </Link>
          <Link to="/portfolio" className="rounded-full border-2 border-[#D7E2EA] px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-[#D7E2EA] hover:text-[#0C0C0C]">
            View Projects
          </Link>
        </div>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "Muhammad Ahmed" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Muhammad Ahmed — Portfolio" },
    ],
    scripts: [
      { src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, async: true },
      {
        children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Kanit:wght@200;300;400;500;600;700;800;900&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
