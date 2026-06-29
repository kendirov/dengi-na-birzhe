"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-12 text-center"
      style={{ backgroundColor: "#05070d", color: "#e2e8f0" }}
    >
      <h1 className="text-lg font-semibold">Не удалось загрузить страницу</h1>
      <p className="mt-2 text-sm text-terminal-muted">
        Обновите вкладку или нажмите кнопку ниже.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm text-cyan hover:bg-cyan/15"
      >
        Попробовать снова
      </button>
    </div>
  );
}
