# Command: create-lesson

Создай или дополни обучающий урок.

## Input

Транскрипт, идея, номер занятия, или «урок про X».

## Steps

1. Skill: `trading-lesson-builder`
2. Template: `references/lesson-template.md`
3. Map to route if exists:
   - setup → `/lesson/setup`
   - orderbook → `/lesson/orderbook`
   - density → `/lesson/density`
   - terminal → `/workspace`
4. Slide blocks: `presentation-diagram-generator`
5. CourseLessonsStrip mapping if new lesson

## Output

- Lesson markdown
- Slide script
- Checklist + homework
- Files to create/update (if implementation requested)

## Style

CScalp, стакан, без воды. Link course: schoollive.ru/chellendzh-dengi-na-birzhe
