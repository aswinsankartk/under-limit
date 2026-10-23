import Link from "next/link";
import ImageUploader from "@/components/ImageUploader";

export default function Home() {
  return (
    <main className="min-h-screen bg-chalk text-charcoal-brown">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight"
          aria-label="Under Limit home"
        >
          under limit<span className="text-terracotta">.</span>
        </Link>

        <Link
          href="#resizer"
          className="rounded-full border border-charcoal-brown/20 px-5 py-2.5 text-sm font-medium transition-colors hover:border-terracotta hover:text-terracotta"
        >
          Start resizing
        </Link>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 pb-20 pt-12 md:px-10 md:pb-28 md:pt-20 lg:grid-cols-2 lg:items-center">
        <div className="max-w-xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
            A little less hassle.
          </p>

          <h1 className="text-5xl font-medium leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Fits the form
            <br />
            on the first
            <span className="text-terracotta"> try.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-charcoal-brown/70 sm:text-lg">
            Resize and compress your photos and signatures to match upload
            requirements. No accounts, no uploads, no unnecessary fuss.
          </p>

          <Link
            href="#resizer"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-terracotta px-7 py-3.5 text-sm font-semibold text-chalk transition-colors hover:bg-charcoal-brown"
          >
            Resize your image
            <span className="ml-3" aria-hidden="true">
              →
            </span>
          </Link>

          <p className="mt-5 text-xs text-charcoal-brown/60">
            Free to use · Processed in your browser
          </p>
        </div>

        <div
          id="resizer"
          className="rounded-3xl border border-charcoal-brown/10 bg-white/60 p-5 shadow-sm sm:p-8"
        >
          <ImageUploader />
        </div>
      </section>

      <footer className="border-t border-charcoal-brown/10 px-6 py-6 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-charcoal-brown/60 sm:flex-row sm:items-center sm:justify-between">
          <span>under limit.</span>
          <span>Fits the form on the first try.</span>
        </div>
      </footer>
    </main>
  );
}
