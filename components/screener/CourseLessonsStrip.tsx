"use client";

import Link from "next/link";
import { COURSE_URL } from "@/lib/constants/brand";

type LessonLink = {
  num: number;
  title: string;
  fullTitle: string;
  href: string;
  external: boolean;
};

const LESSONS: LessonLink[] = [
  {
    num: 1,
    title: "Вводный урок",
    fullTitle: "Как получить торговый аккаунт и подключиться к практике",
    href: COURSE_URL,
    external: true,
  },
  {
    num: 2,
    title: "Обзор проп-компании",
    fullTitle: "Обзор проп-компании Live Investing Group",
    href: COURSE_URL,
    external: true,
  },
  {
    num: 3,
    title: "Установка терминала",
    fullTitle: "Установка и настройка торгового терминала",
    href: "/workspace",
    external: false,
  },
  {
    num: 4,
    title: "Плотности и айсберги",
    fullTitle: "Плотности и айсберги",
    href: "/lesson/density",
    external: false,
  },
  {
    num: 5,
    title: "Отскок от плотности",
    fullTitle: "Зарабатываем на отскоке от плотности",
    href: "/lesson/density",
    external: false,
  },
  {
    num: 6,
    title: "Спред и волатильность",
    fullTitle: "Зарабатываем на спреде и сборе волатильности",
    href: COURSE_URL,
    external: true,
  },
  {
    num: 7,
    title: "Пробой плотности",
    fullTitle: "Зарабатываем на пробое плотности",
    href: "/lesson/density",
    external: false,
  },
];

const CARD_CLASS =
  "group flex h-[46px] min-w-[92px] max-w-[116px] shrink-0 flex-col justify-center rounded border border-terminal-border/60 bg-[#06080c] px-1.5 py-1 transition-colors hover:border-cyan/30 hover:bg-[#0a0e14]";

function LessonCard({ lesson }: { lesson: LessonLink }) {
  const content = (
    <>
      <span className="font-mono text-[9px] leading-none text-cyan">
        {String(lesson.num).padStart(2, "0")}
      </span>
      <span className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-terminal-text/75 group-hover:text-terminal-text">
        {lesson.title}
      </span>
    </>
  );

  if (lesson.external) {
    return (
      <a
        href={lesson.href}
        target="_blank"
        rel="noopener noreferrer"
        title={lesson.fullTitle}
        className={CARD_CLASS}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={lesson.href} title={lesson.fullTitle} className={CARD_CLASS}>
      {content}
    </Link>
  );
}

/** Компактная лента занятий курса — между intro-карточками и таблицей скринера. */
export function CourseLessonsStrip() {
  return (
    <section
      aria-label="Занятия курса"
      className="flex min-w-0 items-center gap-2"
    >
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-terminal-muted">
        Занятия
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-terminal">
        {LESSONS.map((lesson) => (
          <LessonCard key={lesson.num} lesson={lesson} />
        ))}
      </div>

      <a
        href={COURSE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded border border-cyan/30 bg-cyan/5 px-2 py-1 text-[10px] font-medium whitespace-nowrap text-cyan transition-colors hover:border-cyan/45 hover:bg-cyan/10"
      >
        Открыть курс
      </a>
    </section>
  );
}
