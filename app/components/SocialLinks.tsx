import { cn } from "../utils";
import GithubIcon from "./icons/Github";
import LinkedInIcon from "./icons/LinkedIn";
import StackOverflowIcon from "./icons/StackOverflow";

import React from "react";
import { Link } from "react-router";

const SocialLinkIcon: React.FC<{
  to: string;
  icon: (props: any) => React.ReactElement;
  className: string;
}> = ({ to, icon: Icon, className }) => (
  <Link to={to} target="_blank">
    <Icon
      className={cn(
        "h-10 w-10 hover:scale-105 transition-all active:scale-90 active:brightness-100 hover:brightness-90 dark:hover:brightness-150",
        className
      )}
    />
  </Link>
);

export const SocialLinks: React.FC = () => (
  <footer className="flex gap-7">
    <SocialLinkIcon
      to="//github.com/kube"
      icon={GithubIcon}
      className="fill-[#6e5494]"
    />
    <SocialLinkIcon
      to="//linkedin.com/in/cfeijoo"
      icon={LinkedInIcon}
      className="fill-[#0077b5]"
    />
    <SocialLinkIcon
      to="//stackoverflow.com/users/1914206/kube"
      icon={StackOverflowIcon}
      className="fill-[#ff9900]"
    />
  </footer>
);
