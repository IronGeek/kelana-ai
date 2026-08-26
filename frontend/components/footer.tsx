import Link from "next/link";

import { GitHubIcon } from "./icon/github";
import { TwitterIcon } from "./icon/twitter";
import { FacebookIcon } from "./icon/facebook";
import { InstagramIcon } from "./icon/instagram";
import { VolleyballIcon } from "lucide-react";

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

const Footer = () => {
  return (
    <footer className="w-full bottom-0 bg-background pt-4">
      <div className="mx-auto w-full max-w-screen-2xl divide-y rounded-tl-lg rounded-tr-lg p-4">
        <div className="flex flex-col items-center justify-between gap-4 pb-2 sm:flex-row">
          <Link className="flex items-center gap-2" href="/">
            <VolleyballIcon />
            <span className="text-xl">KelanaAI</span>
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
          <p className="text-muted-foreground text-sm">
            Copyright &copy; {new Date().getFullYear()} <strong>KelanaAI</strong>. All rights
            reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/">
              <GitHubIcon className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/">
              <FacebookIcon className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/">
              <InstagramIcon className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/">
              <TwitterIcon className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
