import {
  type MetaFunction,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import Favicons from "virtual:favicons";
import { PageLayout } from "./components/PageLayout";
import { GlobalInitialRenderContext } from "./contexts/GlobalInitialRenderContext";
import "./global.css";
import { useIsInitialRender } from "./hooks/useIsInitialRender";
import * as styles from "./root.css";

export const meta: MetaFunction = () => {
  return [{ title: "KUBE : Software & Design" }];
};

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
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#f0f0ef"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#101013"
        />
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap"
          rel="stylesheet"
        />

        <script
          defer
          data-domain="kube.io"
          src="https://plausible.io/js/script.outbound-links.tagged-events.js"
        />
        <script children="window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }" />

        <Favicons />
        <Meta />
        <Links />
      </head>

      <body className="bg-top-left bg-fixed bg-(image:--kube-background-light) dark:bg-(image:--kube-background-dark) bg-(--palette-light-grey) dark:bg-(--palette-dark-grey)">
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
