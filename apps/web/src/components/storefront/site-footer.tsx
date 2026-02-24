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
      <div className="w-full max-w-300 mx-auto px-4 md:px-8">
        {/* Top section — brand left, links far right */}
        <div className="py-12 md:py-16 flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-3 md:max-w-xs">
            <Link href="/" className="text-lg font-bold tracking-tight w-fit">
              Ahia
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Curated essentials, beautifully minimal. Premium quality and exceptional design.
            </p>
          </div>

          {/* Link columns — pushed right */}
          <div className="flex gap-16 sm:gap-20">
            {Object.values(FOOTER_LINKS).map((section) => (
              <div key={section.title} className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </span>
                <nav className="flex flex-col gap-2.5">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
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
        <div className="border-t border-border/30 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Ahia. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="https://x.com"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              X / Twitter
            </Link>
            <Link
              href="https://github.com"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
