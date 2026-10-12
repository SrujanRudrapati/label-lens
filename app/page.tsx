export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-6">
      <header className="flex items-center justify-between">
        <span className="text-lead font-bold">Label Lens</span>
      </header>

      <section className="flex flex-col gap-3">
        <h1 className="text-title font-bold tracking-[-0.01em]">Point at a label.</h1>
        <p className="max-w-[62ch] text-ink-soft">We&apos;ll explain what it means for you.</p>
      </section>

      <div className="flex-1" />

      <button
        type="button"
        className="mb-4 h-16 w-full rounded-sheet bg-ink text-lead font-bold text-paper"
      >
        Scan a label
      </button>

      <p className="pb-4 text-meta text-ink-soft">Saved on this device only</p>
    </main>
  );
}
