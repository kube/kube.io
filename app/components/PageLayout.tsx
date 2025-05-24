import clsx from "clsx";
import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import { Link, useLocation } from "react-router";
import { Logo } from "./Logo";
import styles from "./Navbar.module.css";

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
      viewTransition
    >
      <span>{text}</span>
    </Link>
  );
};

export const PageLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { scrollY } = useScroll();

  const scrollY_ = useMotionValue(scrollY.get());

  scrollY.on("change", (y) => {
    if (y === 0 && Math.abs(scrollY_.get() - scrollY.get()) > 130) {
      animate(scrollY_, y, { type: "spring", stiffness: 300, damping: 40 });
    } else {
      scrollY_.stop();
      scrollY_.set(y);
    }
  });

  return (
    <motion.div
      className="flex flex-col gap-16 pb-20"
      style={{
        // @ts-expect-error CSS Variables are not typed in Framer Motion
        "--bg-opacity": useTransform(scrollY_, [130, 180], [0, 0.8]),
        "--header-pattern-opacity": useTransform(scrollY_, [0, 160], [0, 0.4]),
        "--navbar-opacity": useTransform(scrollY_, (y) => (y > 200 ? 0 : 1)),
        "--navbar-translate-x": useTransform(scrollY_, (y) =>
          y > 200 ? "-13px" : "0px"
        ),
        "--logo-width": useTransform(scrollY_, [70, 160], ["54px", "38px"]),
        "--header-blur": useTransform(scrollY_, [150, 220], ["0px", "9px"]),
        "--margin-top": useTransform(scrollY_, [0, 160], ["70px", "0px"]),
        "--font-size": useTransform(scrollY_, [0, 160], ["1.3rem", "1rem"]),
        "--border-opacity": useTransform(scrollY_, [180, 220], [0, 0.8]),
      }}
    >
      <div className="group fixed top-0 left-0 w-full z-10">
        <div
          className={cn(
            "py-2",
            "border-b bg-[#F7F7F7] border-[#DFDFDF] dark:bg-[#0F0F0F] dark:border-[#242424]",
            "border-opacity-[--border-opacity] dark:border-opacity-[--border-opacity]",
            "bg-opacity-[--bg-opacity] dark:bg-opacity-[--bg-opacity]",
            "backdrop-blur-[--header-blur]"
          )}
        >
          <div className="absolute opacity-[--header-pattern-opacity] -z-10 top-0 left-0 w-full h-full bg-left-top bg-[image:var(--kube-background-light)] dark:bg-[image:var(--kube-background-dark)]" />

          <header className="max-w-4xl mx-auto w-full flex items-center px-8 mt-[--margin-top] gap-8 h-16">
            <Logo className="w-[--logo-width] flex-shrink-0" />

            <nav className="relative pt-[1px] grow h-10 flex items-center">
              <ul className="transition-[opacity,transform] duration-300 opacity-[--navbar-opacity] group-hover:opacity-100 list-none m-0 p-0 flex gap-9 text-[length:var(--font-size)] uppercase translate-x-[--navbar-translate-x] group-hover:translate-x-0">
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

      <motion.main className="[view-transition-name:content-view] max-w-4xl w-full mx-auto flex flex-col gap-6 px-8 mt-64 mb-10">
        {children}
      </motion.main>
    </motion.div>
  );
};
