# WAJO Trainer

A free training course for the Western Australian Junior Mathematics Olympiad.

[Open the WAJO Exam Centre](https://simonrj.github.io/wajo-trainer/#/exams)

## Past-paper downloads

[Open the WAJO past-paper archive](https://simonrj.github.io/wajo-trainer/#/past)

- The archive serves separate question and worked-solution PDFs for each year from 2000 to 2026. The 2000–2025 editions include both the individual and team rounds, with bookmarks for each round.
- Most PDFs use the original competition pages. The [2006 question paper](papers/wajo-2006-questions.pdf) was typeset from the original combined edition, which prints the worked solutions directly below the questions. The [2006 solutions PDF](papers/wajo-2006-solutions.pdf) preserves that original edition.
- The [2026 question paper](papers/wajo-2026-questions.pdf) and [worked solutions](papers/wajo-2026-solutions.pdf) reproduce the 16 individual questions from the practice compilation. The question paper follows the 2025 WAJO booklet layout. The 2026 team round is pending a verified copy.

## Exam centre

The practice sitting follows the layout of the [official WAJO competition quiz](https://github.com/codersforcauses/wajo/blob/1c4b7e2/client/src/components/ui/Quiz/comp-start.tsx). The numbered question buttons sit below the answer field. Practice working tools and the submission review are available within the sitting.

- All 27 WAJO individual papers from 2000 to 2026 are available as 100-minute sittings, with 329 response entries and worked solutions. The two parts of 2015 Question 12 have separate entries.
- The [Team papers](https://simonrj.github.io/wajo-trainer/#/exams/team) section has all 26 available rounds from 2000 to 2025, with 45- or 50-minute sittings. Each part has space for a response, working and a sketch. The full team paper includes its original answer sheets where available.
- The timer continues across reloads and submits saved responses at zero. Navigation shows answered and flagged parts. Before submitting, the student can jump to an unanswered item, an answer with the wrong format or missing written working.
- Each question has a final answer field, a working area, a notation keypad and a finger or mouse sketchpad. The keypad inserts notation without evaluating it. Results keep the learner’s final answer and working with the corresponding key and worked solution.
- Integer-answer marks are automatic. The written items in the 2000–2019 papers use the submitted working and model solution for manual marking. Team parts are reviewed against the original worked solutions. A numerical team score is available where the source gives a per-part mark scale.
- Past papers have one sitting per browser. The three existing original mock papers support repeat attempts and retain untimed practice.
- The results show marks by topic and question value. Topic guidance uses the primary technique per question and links to related drills. Pending written reviews are excluded.
- Retry missed or skipped questions from a blank response area. The original sitting keeps its score, answers and working. Retries show the key and worked solution after the student checks a response.
- Exam attempts, working, sketches, reviews and retries are saved in this browser and included in the Progress backup. GitHub Pages serves the problem bank as static files. The exam interface reveals solutions after submission.

## Course and content

- 15 lessons, 136 practice problems and three team investigations
- Year-by-year past-paper catalogue and score tracker
- Daily Five, topic and level practice, review list, progress and backup
- Lessons: `data/number.js`, `data/algebra.js` and `data/geometry.js`
- Original papers and team investigations: `data/mocks.js` and `data/team.js`
- Past-paper prompts, keys and worked solutions: `data/wajo/`

## Source and marking notes

Past papers, worked solutions and original figures are credited to **WAJO (Western Australian Junior Mathematics Olympiad)**. The WA Mathematical Olympiads Committee makes the material available for educational use with source acknowledgement. The original pages were recovered from archived copies of UWA’s WAJO collection.

The 2000–2012 individual sitting and 2000–2025 team sitting displays use the archived question and solution pages. The 2013–2026 individual exam transcriptions come from ProblemSolvingEducation’s WAJO Practise compilation. The exam follows the mark value of each entry, including the 2026 compilation’s total of 41. The 2021 Question 12 key was corrected to 35 using [the official worked solution](papers/wajo-2021-solutions.pdf). The 2014 comparison question accepts a typed conclusion and written reasoning.

The [2025 individual instructions](papers/wajo-2025-questions.pdf) use integer answers. The [2019 individual instructions](papers/wajo-2019-questions.pdf) also require a solution to the final question. Reviewers can confirm alternate valid methods and assign marks for the written questions.

WAJO Trainer is an independent practice site. KaTeX is bundled locally for mathematical typesetting under its [MIT licence](vendor/katex/LICENSE). The exam centre uses PDF.js 5.6.205 to display archive pages under the [Apache 2.0 licence](vendor/pdfjs/LICENSE).

## Video narration

The [approved narration profile](tools/narration/) is the default for every new WAJO Trainer video.

## Run locally

```sh
python -m http.server 8000
node tools/check-exams.mjs
```

GitHub Pages publishes from `gh-pages`. Move that branch to the tested release to publish it. The Pages workflow checks the papers, marking and practice data before requesting the build.
