import Link from "next/link";

const FOOTER_LINKS = {
  shop: {
    title: "Shop",
    links: [
      { href: "/categories", label: "All Products" },
      { href: "/categories?c=new", label: "New Arrivals" },
      { href: "/categories?c=accessories", label: "Accessories" },
      { href: "/categories?c=apparel", label: "Apparel" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border/30 bg-background">
      <div className="mx-auto w-full max-w-300 px-4 md:px-8">
        {/* Top section — brand left, links far right */}
        <div className="flex flex-col gap-10 py-12 md:flex-row md:items-start md:justify-between md:py-16">
          {/* Brand */}
          <div className="flex flex-col gap-3 md:max-w-xs">
            <Link href="/" className="w-fit text-lg font-bold tracking-tight">
              Ahia
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Curated essentials, beautifully minimal. Premium quality and exceptional design.
            </p>
          </div>

          {/* Link columns — pushed right */}
          <div className="flex gap-16 sm:gap-20">
            {Object.values(FOOTER_LINKS).map((section) => (
              <div key={section.title} className="flex flex-col gap-3">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {section.title}
                </span>
                <nav className="flex flex-col gap-2.5">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-2 border-t border-border/30 py-6 sm:flex-row sm:gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Ahia. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="https://x.com"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              X / Twitter
            </Link>
            <Link
              href="https://github.com"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
