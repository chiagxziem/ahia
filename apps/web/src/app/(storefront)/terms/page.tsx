import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Ahia",
  description: "Terms and conditions for using Ahia.",
};

export default function TermsPage() {
  return (
    <div className="small-container w-full px-4 py-16 md:py-24">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: February 24, 2026</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert prose-sm flex max-w-none flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              By accessing and using Ahia, you agree to be bound by these Terms of Service and all
              applicable laws and regulations. If you do not agree with any of these terms, you are
              prohibited from using this site.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">2. Use License</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Permission is granted to temporarily access and use Ahia for personal, non-commercial
              transitory viewing and purchasing only. This license does not include any resale or
              commercial use of the site or its contents.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">3. Account Responsibilities</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account and password.
              You agree to accept responsibility for all activities that occur under your account.
              You must notify us immediately of any unauthorized use.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">4. Product Information</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We make every effort to display our products as accurately as possible. However,
              colors, dimensions, and other details may vary slightly due to screen settings and
              manufacturing processes. We reserve the right to limit quantities and refuse orders at
              our discretion.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">5. Pricing and Payment</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              All prices are displayed in USD and are subject to change without notice. We reserve
              the right to modify or discontinue any product without notice. Payment is processed
              securely through our third-party payment providers.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">6. Limitation of Liability</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ahia shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">7. Contact</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If you have any questions about these Terms, please contact us at{" "}
              <Link
                href="mailto:support@ahia.store"
                className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
              >
                support@ahia.store
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
