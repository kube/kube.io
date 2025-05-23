import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { PageLayout } from "./components/PageLayout";
import { GlobalInitialRenderContext } from "./contexts/GlobalInitialRenderContext";
import "./global.css";
import { useIsInitialRender } from "./hooks/useIsInitialRender";
import * as styles from "./root.css";

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export function ErrorBoundary() {
  return <h1>Something went wrong</h1>;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={styles.root}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <Meta />
        <Links />
      </head>

      <body className="bg-left-top bg-[image:var(--kube-background-light)] dark:bg-[image:var(--kube-background-dark)] bg-[--palette-light-grey] dark:bg-[--palette-dark-grey]">
        <GlobalInitialRenderContext.Provider value={useIsInitialRender()}>
          <PageLayout>{children}</PageLayout>
        </GlobalInitialRenderContext.Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
