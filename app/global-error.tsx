"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "#05070d",
          color: "#e2e8f0",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 18, marginBottom: 8 }}>Деньги на бирже</h1>
          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 16 }}>
            Страница не загрузилась. Это не белый экран — просто сбой. Обновите или
            попробуйте снова.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "rgba(34, 211, 238, 0.12)",
              border: "1px solid rgba(34, 211, 238, 0.35)",
              color: "#22d3ee",
              borderRadius: 8,
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Попробовать снова
          </button>
        </div>
      </body>
    </html>
  );
}
