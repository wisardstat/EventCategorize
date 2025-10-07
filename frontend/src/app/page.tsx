import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <main className="w-full max-w-xl text-center space-y-8">
        <h1 className="text-3xl font-bold">welcome to page</h1>
        <nav className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/create-question"
            className="block rounded-lg border border-black/10 dark:border-white/20 p-6 hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <span className="text-lg font-medium">Create Question</span>
          </Link>
          <Link
            href="/present-answer"
            className="block rounded-lg border border-black/10 dark:border-white/20 p-6 hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <span className="text-lg font-medium">Present Answer</span>
          </Link>
        </nav>
      </main>
    </div>
  );
}
