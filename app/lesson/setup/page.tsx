import { LessonShell } from "@/components/lesson/LessonShell";
import { LessonSection } from "@/components/lesson/LessonSection";
import { StepTimeline } from "@/components/lesson/StepTimeline";
import { WorkspaceMap } from "@/components/lesson/WorkspaceMap";
import { ExerciseChecklist } from "@/components/lesson/ExerciseChecklist";

const firstLessonSteps = [
  {
    id: "reg",
    title: "Регистрация аккаунта",
    description:
      "Создаёте аккаунт у проп-компании или брокера. Получаете доступ к MOEX TQBR через проп-счёт.",
  },
  {
    id: "login",
    title: "Логин и пароль",
    description:
      "Сохраняете учётные данные в менеджере паролей. Без них не подключиться к торговому серверу.",
  },
  {
    id: "driver",
    title: "Установка привода",
    description:
      "QUIK, Transaq, RTrader или другой привод — скачиваете с сайта пропа, ставите по инструкции.",
  },
  {
    id: "connect",
    title: "Подключение",
    description:
      "Вводите логин/пароль, выбираете сервер, проверяете статус «Connected». Первый вход — без сделок.",
  },
  {
    id: "workspace",
    title: "Рабочее пространство",
    description:
      "Раскладываете стакан, ленту, график, позиции. Один шаблон — каждый день одинаковый экран.",
  },
  {
    id: "exercises",
    title: "Простые упражнения",
    description:
      "Лимитки, отмена, покупка/продажа, закрытие — на минимальном объёме или демо.",
  },
  {
    id: "experience",
    title: "Наработка опыта",
    description:
      "Скриншоты, дневник, запись экрана — фиксируете ошибки до того, как они стоят денег.",
  },
];

const workspaceItems = [
  { label: "Стакан", desc: "Bid/ask, глубина, плотности" },
  { label: "Лента", desc: "Time & Sales, агрессия рынка" },
  { label: "Кластера", desc: "Объём по цене за период" },
  { label: "График", desc: "Дневка + внутридневной контекст" },
  { label: "Новости", desc: "Фон, без бесконечного скролла" },
  { label: "Привод", desc: "Окно заявок, позиция, PnL" },
];

const equipmentItems = [
  "Современный процессор — терминал + запись без лагов",
  "Монитор 24\"+ или два экрана — стакан и график одновременно",
  "Доп. ПО: OBS для записи, скриншоты, таблица/дневник",
  "Запись видео занятий — разбор ошибок постфактум",
  "Скриншоты ключевых моментов — уровни, входы, стакан",
  "Дневник трейдера — параметры, а не эмоции",
];

const exercises = [
  {
    id: "e1",
    label: "Поставить лимитку на покупку ниже рынка",
    hint: "Цена ниже best bid — заявка встаёт в очередь",
  },
  {
    id: "e2",
    label: "Снять лимитку",
    hint: "Пробел или кнопка отмены — проверить, что заявка исчезла",
  },
  {
    id: "e3",
    label: "Поставить лимитку на продажу выше рынка",
    hint: "Цена выше best ask",
  },
  {
    id: "e4",
    label: "Купить / продать без путаницы",
    hint: "ЛКМ — покупка, ПКМ — продажа (в большинстве терминалов)",
  },
  {
    id: "e5",
    label: "Закрыть сделку обратной заявкой",
    hint: "Long → sell, short → buy",
  },
  {
    id: "e6",
    label: "Зайти двойным объёмом и выйти частями",
    hint: "Две лимитки на выход — контроль исполнения",
  },
];

export default function SetupLessonPage() {
  return (
    <LessonShell
      badge="LESSON 01"
      title="Первое занятие: настройка терминала"
      subtitle="Интерактивная презентация — от регистрации до первых упражнений"
      lessonIndex={1}
      nav={{ next: { href: "/lesson/orderbook", label: "Стакан и лента" } }}
    >
      <LessonSection
        number={1}
        title="Что делаем на первом занятии"
        subtitle="Кликайте по шагам — это ваш маршрут первого дня"
      >
        <StepTimeline steps={firstLessonSteps} />
      </LessonSection>

      <LessonSection
        number={2}
        title="Оптимальное рабочее место"
        subtitle="Минимум окон — максимум фокуса на рынке"
      >
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workspaceItems.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-terminal-border bg-terminal-bg/40 p-3 transition-colors hover:border-cyan/25"
            >
              <p className="font-mono text-sm font-semibold text-cyan">{item.label}</p>
              <p className="mt-1 text-xs text-terminal-muted">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="rounded-lg border border-amber/20 bg-amber/5 px-4 py-3 text-sm text-amber">
          Без посторонних раздражителей: мессенджеры, лишние вкладки, случайные звуки —
          всё это снижает качество решений.
        </p>
      </LessonSection>

      <LessonSection
        number={3}
        title="Требования к оборудованию"
        subtitle="Техника должна помогать, а не отвлекать"
      >
        <ul className="space-y-3">
          {equipmentItems.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-lg border border-terminal-border px-4 py-3 text-sm"
            >
              <span className="font-mono text-cyan">→</span>
              <span className="text-terminal-muted">{item}</span>
            </li>
          ))}
        </ul>
      </LessonSection>

      <LessonSection
        number={4}
        title="Схема рабочего экрана"
        subtitle="Интерактивная карта — кликните на зону"
      >
        <WorkspaceMap />
      </LessonSection>

      <LessonSection
        number={5}
        title="Первые упражнения"
        subtitle="Отмечайте выполненное — прогресс виден сразу"
      >
        <ExerciseChecklist exercises={exercises} />
      </LessonSection>
    </LessonShell>
  );
}
