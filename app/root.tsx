import { Outlet, Scripts, ScrollRestoration } from "react-router";
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

export default function Root() {
  return (
    <html lang="en" className={styles.root}>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        {/* Ugly fix until Vanilla-Extract works well with React-Router v7 (needs React-Router update to properly inject CSS modules) */}
        <link rel="stylesheet" href="/assets/root-DmZBihRf.css" />
      </head>

      <body className="bg-left-top bg-[image:var(--kube-background-light)] dark:bg-[image:var(--kube-background-dark)] bg-[--palette-light-grey] dark:bg-[--palette-dark-grey]">
        <GlobalInitialRenderContext.Provider value={useIsInitialRender()}>
          <PageLayout>
            <Outlet />
          </PageLayout>
        </GlobalInitialRenderContext.Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
