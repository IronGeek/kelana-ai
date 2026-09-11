import Link from "next/link";

import { GitHubIcon } from "./icon/github";
import { TwitterIcon } from "./icon/twitter";
import { FacebookIcon } from "./icon/facebook";
import { InstagramIcon } from "./icon/instagram";
import { VolleyballIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { ThemeToggler } from "./navbar/theme";

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
  navbar?: boolean
  className?: string
}

const Footer = ({ className, navbar }: FooterProps) => {
  return (
    <footer className={cn("w-full bottom-0 bg-background text-xs", className)}>
      <div className="w-full">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row border-b-1 border-dotted p-4">
          <Link className="flex items-center gap-1" href="/">
            <VolleyballIcon className="w-6 h-6" />
            <span className="text-lg font-logo">KelanaAI</span>
          </Link>

          <ul className="flex flex-wrap items-center justify-center divide-x">
            {links.map(({ title, href }) => (
              <li key={title} className="px-2 last:pr-0">
                <Link href={href}>{title}</Link>
              </li>
            ))}
            { !navbar ? <ThemeToggler variant="ghost" className="cursor-pointer border-none hover:bg-background" /> : null }
          </ul>
        </div>
        <div className="flex flex-col-reverse items-center justify-between gap-4 py-2 sm:flex-row py-4 px-4">
          <p>
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
