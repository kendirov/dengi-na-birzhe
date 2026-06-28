const ITEMS = [
  {
    title: "Цена пункта",
    text: "Сколько рублей даёт 1 пункт движения на 1 лот.",
  },
  {
    title: "Цена лота",
    text: "Сколько денег нужно на минимальную позицию.",
  },
  {
    title: "Спред",
    text: "Стоимость входа и выхода через bid/ask.",
  },
  {
    title: "Комиссия",
    text: "Может съедать идею, особенно в дорогих и спредовых инструментах.",
  },
  {
    title: "Оборот и сделки",
    text: "Есть ли в инструменте деньги и лента.",
  },
  {
    title: "Диапазон",
    text: "Двигается ли акция внутри дня.",
  },
  {
    title: "Крупный лот",
    text: "Ориентир: какой объём уже заметен относительно оборота.",
  },
];

export function ScreenerIntroPanel() {
  return (
    <section className="rounded-lg border border-terminal-border bg-terminal-card/80 px-4 py-4 md:px-5">
      <h1 className="text-lg font-semibold tracking-tight md:text-xl">
        Отбор инструментов для внутридневной торговли
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-terminal-muted">
        Смотрим не популярность акции, а торговые условия: цена пункта, спред,
        лот, комиссия, оборот, сделки и движение.
      </p>

      <div className="mt-4 border-t border-terminal-border/60 pt-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-terminal-muted">
          Что важно перед сделкой
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ITEMS.map((item) => (
            <li
              key={item.title}
              className="rounded border border-terminal-border/50 bg-terminal-surface/40 px-3 py-2 text-xs"
            >
              <span className="font-medium text-terminal-text">{item.title}</span>
              <span className="text-terminal-muted"> — {item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
