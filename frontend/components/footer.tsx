import Link from "next/link";

import { GitHubIcon } from "./icon/github";
import { TwitterIcon } from "./icon/twitter";
import { FacebookIcon } from "./icon/facebook";
import { InstagramIcon } from "./icon/instagram";
import { VolleyballIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  {
    title: "About Us",
    href: "/#about",
  },
  {
    title: "Contact",
    href: "/#contact",
  },
  {
    title: "Terms of Service",
    href: "/#terms",
  },
  {
    title: "Privacy Policy",
    href: "/#privacy",
  },
];

interface FooterProps {
  className?: string
}

const Footer = ({ className }: FooterProps) => {
  return (
    <footer className={cn("w-full bottom-0 bg-background", className)}>
      <div className="w-full divide-y rounded-tl-lg rounded-tr-lg p-4">
        <div className="flex flex-col items-center justify-between gap-4 pb-2 sm:flex-row">
          <Link className="flex items-center gap-1" href="/">
            <VolleyballIcon className="w-6 h-6" />
            <span className="text-2xl font-logo">KelanaAI</span>
          </Link>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            {links.map(({ title, href }) => (
              <li key={title}>
                <Link href={href}>{title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col-reverse items-center justify-between gap-4 py-3 sm:flex-row">
          <p className="text-sm">
            Copyright &copy; {new Date().getFullYear()} <strong>KelanaAI</strong>. All rights
            reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/">
              <GitHubIcon className="h-4 w-4" />
            </Link>
            <Link href="/">
              <FacebookIcon className="h-4 w-4" />
            </Link>
            <Link href="/">
              <InstagramIcon className="h-4 w-4" />
            </Link>
            <Link href="/">
              <TwitterIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
