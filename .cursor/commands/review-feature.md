# Command: review-feature

Ревью текущих изменений (branch / uncommitted).

## Checklist

### Architecture
- [ ] Минимальный scope?
- [ ] Provider/scoring не сломан?
- [ ] Нет дублирования?

### Security
- [ ] Нет secrets в diff?
- [ ] agent: security-auditor

### Types & lint
- [ ] `npm run lint`
- [ ] Types compile (build)

### Trading logic
- [ ] Формулы документированы?
- [ ] Mock/live labels correct?

### UI
- [ ] Expensive minimalism?
- [ ] 3-second clarity?

### Tests
- [ ] Manual QA checklist if no automated tests

## Output

Findings: blocking / suggestion / nit
Verdict: merge-ready | needs work

## Optional

Launch Bugbot subagent for PR-style review
