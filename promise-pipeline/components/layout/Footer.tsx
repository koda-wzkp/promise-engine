import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <p className="font-serif text-sm font-semibold text-gray-900">
              Promise Pipeline
            </p>
            <p className="text-xs text-gray-500">
              From tracking to simulation. Built on Promise Theory.
            </p>
          </div>
          <div className="flex gap-6 text-xs text-gray-500">
            <Link href="/about" className="hover:text-gray-900">
              About
            </Link>
            <Link href="/blog" className="hover:text-gray-900">
              Blog
            </Link>
            <a
              href="https://github.com/koda-wzkp/promise-pipeline"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900"
            >
              GitHub
            </a>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Pleco. Open-source infrastructure for commitment accountability.
        </p>
      </div>
    </footer>
  );
}
