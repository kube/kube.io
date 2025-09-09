import clsx from "clsx";
import { motion, useScroll } from "motion/react";
import { Link, useLocation } from "react-router";
import { Logo } from "./Logo/index.tsx";
import styles from "./Navbar.module.css";

import { useEffect, useRef, useState } from "react";
import { FLAGS } from "../flags.ts";
import { cn } from "../utils/index.ts";
import { scrollDerivedVariables } from "./PageLayout.css.ts";

type NavbarLinkProps = {
  to: string;
  text: string;
  exact?: true;
};

const NavbarLink: React.FC<NavbarLinkProps> = ({ to, text, exact }) => {
  const { pathname } = useLocation();
  const isActive = exact ? pathname === to : pathname.startsWith(to);
  return (
    <Link
      className={clsx(styles.navbarlink, isActive && styles.active)}
      to={to}
      data-text={text}
      viewTransition={pathname !== to}
    >
      <span>{text}</span>
    </Link>
  );
};

export const PageLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  // Check if ScrollTimeline is supported, and fallback on Framer Motion's useScroll if not.
  const { scrollY } = useScroll();
  const [scrollTimelineSupported, setScrollTimelineSupported] = useState(true);
  useEffect(() => setScrollTimelineSupported("ScrollTimeline" in window), []);

  // Needed for Safari: Tap does not trigger hover, so we use :focus to show the nav
  const headerRef = useRef<HTMLDivElement>(null);
  scrollY.on("change", () => headerRef.current?.blur());

  return (
    <motion.div
      className="flex flex-col gap-16 pb-20 scroll-progress-provider"
      style={{
        // @ts-expect-error React.CSSProperties typing does not support CSS variables
        "--scroll-progress": scrollTimelineSupported
          ? "var(--scroll-progress-root)"
          : scrollY,
      }}
    >
      <div
        className={cn(
          "fixed top-0 left-0 w-full z-10 contain-layout contain-style",
          scrollDerivedVariables
        )}
      >
        <div
          style={{ viewTransitionName: "header-gradient-mask" }}
          className="absolute top-0 left-0 w-full bg-(--palette-light-grey)/[30%] dark:bg-(--palette-dark-grey)/[80%] h-40 mask-linear-180 mask-linear-from-10% pointer-events-none"
        >
          <div className="absolute z-10 w-full h-full bg-top-left bg-(image:--kube-background-light) dark:bg-(image:--kube-background-dark) opacity-50" />
          <div className="absolute z-0 w-full h-28 bg-linear-to-b from-(--palette-light-grey) dark:from-(--palette-dark-grey)" />
        </div>

        <div
          tabIndex={-1}
          ref={headerRef}
          style={{ viewTransitionName: "header" }}
          className={cn(
            "py-2 group",
            "bg-[#F7F7F7]/[var(--bg-opacity)] dark:bg-[#0A0A0A]/[var(--bg-opacity)]",
            "border-b-2 border-[#DADADA]/[var(--border-opacity)] dark:border-[#303031]/[var(--border-opacity)]",
            "backdrop-blur-(--header-blur)",
            "focus:outline-none"
          )}
        >
          <div
            style={{ viewTransitionName: "header-pattern" }}
            className="absolute opacity-(--header-pattern-opacity) -z-10 top-0 left-0 w-full h-full bg-top-left bg-(image:--kube-background-light) dark:bg-(image:--kube-background-dark)"
          />

          <header className="max-w-4xl mx-auto w-full flex items-center px-8 mt-(--margin-top) gap-8 h-16">
            <Logo
              style={{ viewTransitionName: "header-logo" }}
              className="w-(--logo-width) shrink-0 touch-none"
              onMouseDown={() => headerRef.current?.focus()}
            />

            <nav className="relative pt-px grow h-10 flex items-center z-(--navbar-z-index) group-focus:z-20 active:z-20 group-hover:z-20">
              <ul
                style={{ viewTransitionName: "header-nav" }}
                className="transition-[opacity,translate] duration-300 opacity-(--navbar-opacity) group-focus:opacity-100 group-hover:opacity-100 list-none m-0 p-0 flex gap-9 text-(length:--font-size) uppercase translate-x-(--navbar-translate-x) group-hover:translate-x-0 group-focus:translate-x-0"
              >
                <NavbarLink to="/" text="Hello" exact />

                {FLAGS.WORKSHOP && (
                  <NavbarLink to="/workshop" text="Workshop" />
                )}

                {FLAGS.BLOG && <NavbarLink to="/blog" text="Blog" />}

                <NavbarLink to="/cv" text="CV" />
              </ul>
            </nav>
          </header>
        </div>
      </div>

      <main
        style={{ viewTransitionName: "content-view" }}
        className="max-w-4xl w-full mx-auto flex flex-col gap-6 px-8 mt-64 mb-10 overflow-x-hidden"
      >
        {children}
      </main>

      <div id="portal-root" className="absolute top-0 left-0 w-full" />
    </motion.div>
  );
};
