import clsx from "clsx";
import { motion, useScroll } from "motion/react";
import { Link, useLocation } from "react-router";
import { Logo } from "./Logo/index.tsx";
import styles from "./Navbar.module.css";

import { useEffect, useState } from "react";
import { FLAGS } from "../flags.ts";
import { cn } from "../utils/index.ts";

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
      viewTransition={!isActive}
    >
      <span>{text}</span>
    </Link>
  );
};

function map(
  [o1, o2]: [number, number], // origin
  [d1, d2]: [number, number], // destination
  unit = ""
) {
  const s = (d2 - d1) / (o2 - o1); // scale
  const expr = `calc(((var(--scroll-progress) - ${o1}) * ${s} + ${d1}) * 1${unit})`; // transform expression
  const dMin = Math.min(d1, d2);
  const dMax = Math.max(d1, d2);
  return `clamp(${dMin}${unit}, ${expr}, ${dMax}${unit})`; // Return clamped value
}

function threshold(threshold: number, [v1, v2]: [number, number], unit = "") {
  const trigger = `(clamp(0, (var(--scroll-progress) - ${threshold}) * 999, 1)`;
  return `calc(${trigger} * (${v2} - ${v1}) + ${v1}) * 1${unit})`;
}

export const PageLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  // Check if ScrollTimeline is supported, and fallback on Framer Motion's useScroll if not.
  const { scrollY } = useScroll();
  const [scrollTimelineSupported, setScrollTimelineSupported] = useState(true);
  useEffect(() => setScrollTimelineSupported("ScrollTimeline" in window), []);

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
        className="group fixed top-0 left-0 w-full z-10"
        style={{
          // @ts-expect-error React.CSSProperties typing does not support CSS variables
          "--bg-opacity": map([130, 180], [0, 80], "%"),
          "--border-opacity": map([160, 220], [0, 100], "%"),
          "--header-pattern-opacity": map([0, 160], [0, 40], "%"),
          "--navbar-opacity": threshold(200, [100, 0], "%"),
          "--navbar-translate-x": threshold(200, [0, -13], "px"),
          "--logo-width": map([70, 160], [54, 38], "px"),
          "--header-blur": map([150, 220], [0, 9], "px"),
          "--margin-top": map([0, 160], [70, 0], "px"),
          "--font-size": map([0, 160], [1.3, 1], "rem"),
        }}
      >
        <div
          className={cn(
            "py-2",
            "[view-transition-name:header]",
            "bg-[#F7F7F7]/[var(--bg-opacity)] dark:bg-[#0F0F0F]/[var(--bg-opacity)]",
            "border-b border-[#E2E2E2]/[var(--border-opacity)] dark:border-[#242424]/[var(--border-opacity)]",
            "backdrop-blur-(--header-blur)"
          )}
        >
          <div className="[view-transition-name:header-pattern] absolute opacity-(--header-pattern-opacity) -z-10 top-0 left-0 w-full h-full bg-top-left bg-(image:--kube-background-light) dark:bg-(image:--kube-background-dark)" />

          <header className="max-w-4xl mx-auto w-full flex items-center px-8 mt-(--margin-top) gap-8 h-16">
            <Logo className="[view-transition-name:header-logo] w-(--logo-width) shrink-0" />

            <nav className="relative pt-px grow h-10 flex items-center">
              <ul className="[view-transition-name:header-nav] transition-[opacity,translate] duration-300 opacity-(--navbar-opacity) group-hover:opacity-100 list-none m-0 p-0 flex gap-9 text-(length:--font-size) uppercase translate-x-(--navbar-translate-x) group-hover:translate-x-0">
                <li>
                  <NavbarLink to="/" text="Hello" exact />
                </li>

                {FLAGS.WORKSHOP && (
                  <li>
                    <NavbarLink to="/workshop" text="Workshop" />
                  </li>
                )}

                {FLAGS.BLOG && (
                  <li>
                    <NavbarLink to="/blog" text="Blog" />
                  </li>
                )}

                <li>
                  <NavbarLink to="/cv" text="CV" />
                </li>
              </ul>
            </nav>
          </header>
        </div>
      </div>

      <main className="[view-transition-name:content-view] max-w-4xl w-full mx-auto flex flex-col gap-6 px-8 mt-64 mb-10">
        {children}
      </main>
    </motion.div>
  );
};
