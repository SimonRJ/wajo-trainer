# WAJO Trainer

A free, self-contained training course for the **Western Australian Junior Mathematics Olympiad (WAJO)**.

**Live site:** https://simonrj.github.io/wajo-trainer/

- 14 lessons (thinking tools, number theory, algebra, counting and logic, geometry, team-paper skills)
- 130 practice problems with hints and worked solutions, checked automatically
- 3 timed mock individual papers in the real format (16 questions, 100 minutes, 40 marks)
- Links to every real past paper (2000–2026) with a score tracker and timer
- 3 team-paper style investigations with model answers
- Progress tracking, review list, daily five, backup/restore

## Running costs: none

Plain HTML, CSS and JavaScript served by GitHub Pages. No build step, no server, no database, no accounts,
no third-party scripts or fonts. Progress is stored in the browser's `localStorage`.

## Editing content

- Lessons and problems: `data/number.js`, `data/algebra.js`, `data/geometry.js`
- Mock papers: `data/mocks.js`
- Team investigations: `data/team.js`

Each problem is `{ id, d (level 1-4), q (question), a (integer answer), h (hint), s (solution) }`.

## Credits

Unofficial and not affiliated with WAMOC or UWA. All questions are original, written in the style of the
competition. Official information and past papers: https://enrichedmaths.maths.uwa.edu.au/wajo/
