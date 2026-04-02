export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="w-full max-w-3xl rounded-[2rem] border border-black/10 bg-white/80 p-10 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur sm:p-14">
        <div className="mb-8 inline-flex rounded-full border border-black/10 bg-black px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-white">
          Stage 0
        </div>
        <div className="space-y-6">
          <h1 className="text-5xl font-semibold tracking-tight text-balance text-zinc-950 sm:text-6xl">
            Hello World
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-600">
            Hardware Club Exchange is now running on a minimal Next.js starter.
            The next step is wiring up Supabase and replacing this placeholder
            with the actual internal marketplace.
          </p>
        </div>
      </div>
    </main>
  );
}
