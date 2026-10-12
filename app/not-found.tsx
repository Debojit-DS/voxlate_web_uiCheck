import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex min-h-[calc(100svh-76px)] items-center justify-center py-16 sm:py-24">
        <section aria-labelledby="not-found-title" className="page-container text-center">
          <p className="eyebrow">404 · Page not found</p>
          <h1 id="not-found-title" className="display-page mt-6">
            Nothing to <em className="block italic">translate here.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-[48ch] text-[16px] leading-relaxed text-slate sm:text-[17px]">
            <span className="block">The page you&apos;re looking for isn&apos;t here.</span>
            <span className="block">We checked. In several languages.</span>
            <span className="block">You can head home and pick up the conversation.</span>
          </p>
          <Button href="/" wide className="mt-8">
            Back to home
          </Button>
        </section>
      </main>
      <Footer />
    </div>
  );
}
