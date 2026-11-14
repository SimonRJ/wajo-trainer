# WAJO Trainer

A free training course for the Western Australian Junior Mathematics Olympiad.

[Open the WAJO Exam Centre](https://simonrj.github.io/wajo-trainer/#/exams)

## Past-paper downloads

[Open the WAJO past-paper archive](https://simonrj.github.io/wajo-trainer/#/past)

- The archive serves separate question and worked-solution PDFs for each year from 2000 to 2026. The 2000–2025 editions include both the individual and team rounds, with bookmarks for each round.
- Most PDFs use the original competition pages. The [2006 question paper](papers/wajo-2006-questions.pdf) was typeset from the original combined edition, which prints the worked solutions directly below the questions. The [2006 solutions PDF](papers/wajo-2006-solutions.pdf) preserves that original edition.
- The [2026 question paper](papers/wajo-2026-questions.pdf) and [worked solutions](papers/wajo-2026-solutions.pdf) reproduce the 16 individual questions from the practice compilation. The 2026 team round is pending an original source.

## Individual exam centre

- The 14 WAJO individual papers from 2013 to 2026 contain 197 response entries and their worked solutions. The two parts of 2015 Question 12 have separate entries.
- Each timed paper runs for 100 minutes. The timer continues across reloads and submits the saved responses at zero. Question navigation shows answered and flagged items. Before submitting, the student can jump back to an unanswered item, an answer with the wrong format, or missing written working.
- Each question has a final answer field, a working area, a notation keypad and a finger or mouse sketchpad. The keypad inserts notation without evaluating it. Results keep the learner’s final answer and working with the corresponding key and worked solution.
- Integer-answer marks are automatic. Written-solution items in the 2013–2019 papers are marked by a reviewer using the submitted working and model solution. A score with outstanding written marks is provisional. Other questions support working feedback alongside their automatic mark.
- Past papers have one sitting per browser. The three existing original mock papers support repeat attempts and retain untimed practice.
- Exam attempts, working, sketches and reviews are saved in this browser and included in the Progress backup. GitHub Pages serves the problem bank as static files. The exam interface reveals solutions after submission.

## Course and content

- 14 lessons, 130 practice problems and three team investigations
- Year-by-year past-paper catalogue and score tracker
- Daily Five, review list, progress and backup
- Lessons: `data/number.js`, `data/algebra.js` and `data/geometry.js`
- Original papers and team investigations: `data/mocks.js` and `data/team.js`
- Past-paper prompts, keys and worked solutions: `data/wajo/`

## Source and marking notes

Past papers, worked solutions and original figures are credited to **WAJO (Western Australian Junior Mathematics Olympiad)**. The WA Mathematical Olympiads Committee makes the material available for educational use with source acknowledgement. The original pages were recovered from archived copies of UWA’s WAJO collection.

The online exam set list and transcriptions come from ProblemSolvingEducation’s WAJO Practise compilation. The exam follows the mark value of each entry, including the 2026 compilation’s total of 41. The 2021 Question 12 key was corrected to 35 using [the official worked solution](papers/wajo-2021-solutions.pdf). The 2014 comparison question accepts a typed conclusion and written reasoning.

The [2025 individual instructions](papers/wajo-2025-questions.pdf) use integer answers. The [2019 individual instructions](papers/wajo-2019-questions.pdf) also require a solution to the final question. Reviewers can confirm alternate valid methods and assign marks for the written questions.

WAJO Trainer is an independent practice site. KaTeX is bundled locally for mathematical typesetting under its [MIT licence](vendor/katex/LICENSE).

## Run locally

```sh
python -m http.server 8000
node tools/check-exams.mjs
```
