import Link from "next/link";
import Image from "next/image";
import ImageUploader from "@/components/ImageUploader";

export default function Home() {
  return (
    <main className="min-h-screen bg-chalk text-charcoal-brown font-sans">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight"
          aria-label="Under Limit home"
        >
          under limit<span className="text-terracotta">.</span>
        </Link>
        <Image
          src={"/logo.webp"}
          alt="Under Limit Logo"
          width={30}
          height={30}
        />
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 pb-20 pt-12 md:px-10 md:pb-28 md:pt-20 lg:grid-cols-2 lg:items-center font-onest">
        <div className="max-w-xl font-sans transition-all">
          <h1 className="text-5xl font-heading leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Fits the form
            <br />
            on the first
            <span className="text-terracotta"> try.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-charcoal-brown/70 sm:text-lg">
            Resize and compress your photos and signatures to match upload
            requirements. No accounts, no uploads, no unnecessary fuss.
          </p>

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
          <span>Developed by Aswin Sankar TK</span>
        </div>
      </footer>
    </main>
  );
}
