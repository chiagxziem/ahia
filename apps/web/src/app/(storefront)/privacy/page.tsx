import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Ahia",
  description: "How Ahia collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-200 mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: February 24, 2026</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert prose-sm max-w-none flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">1. Information We Collect</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We collect information you provide directly, such as your name, email address, and
              shipping address when you create an account or place an order. We also collect
              information automatically, including your IP address, browser type, and browsing
              behavior on our site.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">2. How We Use Your Information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use the information we collect to process and fulfill orders, communicate with you
              about your orders and account, improve our services and user experience, and send
              promotional communications (with your consent).
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">3. Information Sharing</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We do not sell your personal information. We may share your information with trusted
              third-party service providers who assist us in operating our website, conducting our
              business, or serving our users, so long as those parties agree to keep this
              information confidential.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">4. Data Security</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We implement a variety of security measures to maintain the safety of your personal
              information. Your data is transmitted via Secure Socket Layer (SSL) technology and
              encrypted in our databases.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">5. Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use cookies to enhance your experience, analyze site usage, and assist in our
              marketing efforts. You can choose to disable cookies through your browser settings,
              but some parts of the site may not function properly.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">6. Your Rights</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You have the right to access, correct, or delete your personal data. You may also
              object to or restrict certain processing of your data. To exercise these rights,
              please contact us using the information below.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">7. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <Link
                href="mailto:privacy@ahia.store"
                className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
              >
                privacy@ahia.store
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
