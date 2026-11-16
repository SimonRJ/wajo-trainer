/* WAJO Trainer – modules 1-5: thinking tools and number */
(function (G) {
  var W = (G.WAJO = G.WAJO || { modules: [], mocks: [], team: [] });

  W.modules.push({
    id: "tools", title: "The Problem-Solver's Toolkit", icon: "🧰", strand: "Thinking",
    blurb: "Eight strategies that crack most Olympiad problems.",
    lesson: `
<p>WAJO questions are not about remembering formulas. They reward <b>thinking tools</b>. Before learning any topic, learn the moves that strong solvers reach for when they are stuck.</p>
<div class="key"><b>The eight moves</b>
<ol>
<li><b>Try small cases.</b> If the question says 100, try 1, 2, 3, 4 and look for a pattern.</li>
<li><b>Be systematic.</b> List cases in an order (smallest first) so you can't miss or double-count.</li>
<li><b>Work backwards.</b> Start from the end result and undo each step.</li>
<li><b>Draw it.</b> A diagram, table or number line turns words into something you can see.</li>
<li><b>Name the unknown.</b> Call it <i>x</i> and write an equation.</li>
<li><b>Look for what never changes.</b> Odd/even (parity), a total, a remainder. This is called an <i>invariant</i>.</li>
<li><b>Think about extremes.</b> What is the biggest or smallest something could be?</li>
<li><b>Check your answer</b> against the original question. It takes ten seconds and saves marks.</li>
</ol></div>
<div class="ex"><b>Worked example 1 (small cases).</b> How many squares of any size are on a 4×4 grid?
<p>Count by size: 1×1 squares: 16. 2×2 squares: 9. 3×3 squares: 4. 4×4 squares: 1. The pattern is square numbers: 16 + 9 + 4 + 1 = <b>30</b>. For an <i>n</i>×<i>n</i> grid it is 1² + 2² + … + <i>n</i>².</p></div>
<div class="ex"><b>Worked example 2 (invariant).</b> Seven cups stand upright. Each move you must flip exactly two cups. Can you get all seven upside down?
<p>Count the upright cups. Flipping two cups changes that count by −2, 0 or +2, so it stays <b>odd</b> forever. It starts at 7 (odd) and we want 0 (even). <b>Impossible.</b> Notice we proved it without trying every sequence of moves.</p></div>
<div class="ex"><b>Worked example 3 (work backwards).</b> Mia spends half her money, then $6 more, then half of what is left, and has $5. How much did she start with?
<p>Undo from the end: before the last halving she had 10. Before spending $6 she had 16. Before the first halving she had <b>$32</b>. Check: 32 → 16 → 10 → 5 ✓.</p></div>
<div class="tip">When you finish a problem, ask: <i>which tool did that?</i> Naming the tool is how it becomes a habit.</div>`,
    problems: [
      { id: "t1", d: 1, q: "I think of a number, double it, add 7, multiply the result by 3, then subtract 9. I get 60. What was my number?", a: 8, h: "Work backwards, undoing each step in reverse order.", s: "60 + 9 = 69. 69 ÷ 3 = 23. 23 − 7 = 16. 16 ÷ 2 = <b>8</b>." },
      { id: "t2", d: 1, q: "A 6×6 grid is made of unit squares. How many squares of all sizes have all four sides along the grid lines?", a: 91, h: "Count 1×1, 2×2, 3×3 … separately. How many positions can a 2×2 square take?", s: "A k×k square fits in (7−k)² positions. Total = 36 + 25 + 16 + 9 + 4 + 1 = <b>91</b>." },
      { id: "t3", d: 1, q: "At a party 12 people each shake hands exactly once with every other person. How many handshakes take place?", a: 66, h: "Each person shakes 11 hands, but that counts every handshake twice.", s: "12 × 11 ÷ 2 = <b>66</b>." },
      { id: "t4", d: 2, q: "A snail is at the bottom of a 10 m well. Each day it climbs 3 m and each night it slips back 2 m. On which day does it first reach the top?", a: 8, h: "Don't just divide 10 by 1. What happens on the day it gets out?", s: "After each full day and night it has gained 1 m. After 7 nights it is at 7 m. On day 8 it climbs 3 m and reaches 10 m before slipping. Day <b>8</b>." },
      { id: "t5", d: 2, q: "In how many ways can you make 50 cents using only 5c, 10c and 20c coins? (You don't have to use every type.)", a: 12, h: "Be systematic: fix the number of 20c coins first (0, 1 or 2).", s: "Zero 20c: the 10c count can be 0–5 (6 ways). One 20c: 30c left, 10c count 0–3 (4 ways). Two 20c: 10c left, 10c count 0–1 (2 ways). Total <b>12</b>." },
      { id: "t6", d: 3, q: "The numbers 1, 2, 3, …, 10 are written on a board. In a move, erase any two numbers and write the larger minus the smaller. Equal numbers give zero. After 9 moves one number is left. What is the smallest it could possibly be?", a: 1, h: "What happens to the sum being odd or even when a and b are replaced by a − b?", s: "a + b and a − b are both odd or both even, so the parity of the total never changes. The total starts at 55 (odd), so the last number is odd: it can't be 0. Getting 1 is possible: 10−9, 8−7, 6−5, 4−3, 2−1 leaves five 1s; then 1−1 = 0 twice leaves 0, 0, 1; then 0−0 = 0 and 1−0 = 1. Answer <b>1</b>." },
      { id: "t7", d: 2, q: "A farmer has chickens and rabbits. Altogether there are 30 heads and 86 legs. How many rabbits are there?", a: 13, h: "Pretend all 30 are chickens. How many legs are missing?", s: "30 chickens would have 60 legs. We need 26 more, and each rabbit adds 2 extra legs: 26 ÷ 2 = <b>13</b> rabbits." },
      { id: "t8", d: 2, q: "What is the last digit of 7<sup>2025</sup>?", a: 7, h: "Write the last digits of 7¹, 7², 7³, 7⁴, 7⁵. See a cycle?", s: "Last digits cycle 7, 9, 3, 1 with period 4. 2025 = 4 × 506 + 1, so it matches 7¹: last digit <b>7</b>." }
    ]
  });

  W.modules.push({
    id: "divis", title: "Divisibility & Primes", icon: "🔢", strand: "Number",
    blurb: "Divisibility tests, primes and prime factorisation.",
    lesson: `
<p>Number theory is the biggest single strand of WAJO. Almost every paper has several questions built from divisibility and primes. No calculators are allowed, so quick tests matter.</p>
<div class="key"><b>Divisibility tests</b>
<table><tr><th>By</th><th>Test</th></tr>
<tr><td>2, 5, 10</td><td>Look at the last digit.</td></tr>
<tr><td>4</td><td>Last <b>two</b> digits form a multiple of 4.</td></tr>
<tr><td>8</td><td>Last <b>three</b> digits form a multiple of 8.</td></tr>
<tr><td>3</td><td>Digit sum is a multiple of 3.</td></tr>
<tr><td>9</td><td>Digit sum is a multiple of 9.</td></tr>
<tr><td>6</td><td>Passes both the 2 test and the 3 test.</td></tr>
<tr><td>11</td><td>Alternating digit sum (＋ − ＋ − …) is a multiple of 11 (including 0).</td></tr>
</table></div>
<p><b>Why does the 9 test work?</b> Because 10, 100, 1000 … each leave remainder 1 when divided by 9. So 4725 = 4×1000 + 7×100 + 2×10 + 5 leaves the same remainder as 4 + 7 + 2 + 5 = 18. Understanding <i>why</i> lets you invent tests when you need them.</p>
<div class="key"><b>Primes</b>
<ul><li>A prime has exactly two divisors. 1 is <b>not</b> prime. 2 is the only even prime.</li>
<li>Primes under 50: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47. Learn them.</li>
<li>To test if <i>n</i> is prime, only try primes up to √<i>n</i>. For 97, try 2, 3, 5, 7 only.</li>
<li>Every whole number above 1 factorises into primes in exactly one way. E.g. 360 = 2³ × 3² × 5.</li></ul></div>
<div class="ex"><b>Worked example 1.</b> The number 3<i>A</i>4<i>B</i> is divisible by 72. Find all possibilities.
<p>72 = 8 × 9. For 9: 3 + <i>A</i> + 4 + <i>B</i> is a multiple of 9, so <i>A</i> + <i>B</i> = 2 or 11. For 8: the last three digits <i>A</i>4<i>B</i> must be a multiple of 8 (so <i>B</i> is even). Test each case: <i>A</i> + <i>B</i> = 2 gives 240 ✓ (8 × 30). <i>A</i> + <i>B</i> = 11 gives 348 ✗, 546 ✗, 744 ✓ (8 × 93), 942 ✗. So there are two answers: <b>3240</b> and <b>3744</b>. Being systematic found the second one.</p></div>
<div class="ex"><b>Worked example 2.</b> Two primes add to 45. What are they?
<p>45 is odd, so one prime is even and the other odd. The only even prime is 2, so the primes are 2 and 43. The trick "odd sum ⇒ one of them is 2" appears again and again.</p></div>
<div class="ex"><b>Worked example 3 (trailing zeros).</b> How many zeros end 30! = 30 × 29 × … × 1?
<p>Each zero needs a factor 10 = 2 × 5. Twos are plentiful, so count fives: multiples of 5 give 6, and 25 gives one extra. <b>7 zeros.</b></p></div>`,
    problems: [
      { id: "d1", d: 1, q: "The four-digit number 5<i>d</i>38 is divisible by 9. What is the digit <i>d</i>?", a: 2, h: "The digit sum must be a multiple of 9.", s: "5 + d + 3 + 8 = 16 + d must be 18, so d = <b>2</b>." },
      { id: "d2", d: 1, q: "What is the largest three-digit multiple of 7?", a: 994, h: "1001 = 7 × 11 × 13 is a famous multiple of 7.", s: "1001 is a multiple of 7, so 1001 − 7 = <b>994</b>." },
      { id: "d3", d: 1, q: "How many prime numbers are less than 50?", a: 15, h: "List them carefully. Remember 1 is not prime.", s: "2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47: <b>15</b> primes." },
      { id: "d4", d: 2, q: "The four-digit number 7<i>A</i>2<i>B</i> is odd and divisible by 45. What is <i>A</i> × <i>B</i>?", a: 20, h: "45 = 5 × 9. Odd and divisible by 5 fixes B.", s: "Odd and a multiple of 5 means B = 5. Digit sum 7 + A + 2 + 5 = 14 + A must be 18, so A = 4. The number is 7425 and A × B = <b>20</b>." },
      { id: "d5", d: 2, q: "What is the sum of the different prime factors of 2310?", a: 28, h: "Peel off small primes one at a time.", s: "2310 = 2 × 3 × 5 × 7 × 11. Sum = <b>28</b>." },
      { id: "d6", d: 2, q: "What is the smallest whole number greater than 1 that leaves remainder 1 when divided by each of 2, 3, 4, 5 and 6?", a: 61, h: "If n leaves remainder 1 each time, what can you say about n − 1?", s: "n − 1 is a multiple of 2, 3, 4, 5, 6, so of their LCM, 60. Smallest n = <b>61</b>." },
      { id: "d7", d: 2, q: "The number 2<i>d</i>71 is divisible by 11. What is the digit <i>d</i>?", a: 8, h: "Alternating sum: 2 − d + 7 − 1.", s: "2 − d + 7 − 1 = 8 − d must be a multiple of 11, so d = <b>8</b>. Check: 2871 = 11 × 261." },
      { id: "d8", d: 2, q: "Two prime numbers add up to 99. What is their product?", a: 194, h: "The sum is odd. What does that force?", s: "One prime must be even, so it is 2. The other is 97 (prime). Product = <b>194</b>." },
      { id: "d9", d: 3, q: "How many zeros are at the end of 50! (the product 50 × 49 × 48 × … × 2 × 1)?", a: 12, h: "Count factors of 5. Don't forget 25 and 50 each contain two.", s: "Multiples of 5 up to 50: 10. Multiples of 25: 2 more. Total <b>12</b> zeros." },
      { id: "d10", d: 3, q: "What is the smallest positive integer <i>n</i> such that 180 × <i>n</i> is a perfect cube?", a: 150, h: "Factorise 180. In a cube every prime's exponent is a multiple of 3.", s: "180 = 2² × 3² × 5. We need one more 2, one more 3 and two more 5s: n = 2 × 3 × 25 = <b>150</b>. (180 × 150 = 27000 = 30³.)" }
    ]
  });

  W.modules.push({
    id: "factors", title: "Factors, GCD & LCM", icon: "🧩", strand: "Number",
    blurb: "Counting divisors, greatest common divisors, least common multiples.",
    lesson: `
<p>Once a number is written as a product of primes, almost every question about its factors becomes a counting puzzle.</p>
<div class="key"><b>Counting divisors.</b> If <i>n</i> = p<sup>a</sup> × q<sup>b</sup> × r<sup>c</sup> then <i>n</i> has (a+1)(b+1)(c+1) divisors.
<p><i>Why?</i> A divisor chooses how many p's to use (0, 1, …, a: that's a+1 choices), how many q's, and how many r's. Multiply the choices.</p></div>
<div class="ex"><b>Worked example 1.</b> How many divisors does 72 have?
<p>72 = 2³ × 3². Divisors: (3+1)(2+1) = <b>12</b>.</p></div>
<div class="key"><b>GCD and LCM from prime factorisations</b>
<ul><li>GCD: take the <b>smaller</b> power of each prime.</li><li>LCM: take the <b>larger</b> power of each prime.</li>
<li>For two numbers: GCD × LCM = product of the numbers.</li>
<li><b>Euclid's trick:</b> gcd(a, b) = gcd(b, a − b). Keep subtracting (or taking remainders): gcd(91, 56) = gcd(56, 35) = gcd(35, 21) = gcd(21, 14) = gcd(14, 7) = 7.</li></ul></div>
<div class="key"><b>Divisors come in pairs.</b> If d divides n, so does n ÷ d. The pairs are different unless d × d = n. So <b>only perfect squares have an odd number of divisors</b>.</div>
<div class="ex"><b>Worked example 2 (the locker problem).</b> 100 lockers are closed. Student 1 toggles every locker, student 2 every 2nd, student 3 every 3rd … up to student 100. Which lockers end open?
<p>Locker <i>n</i> is toggled once per divisor of <i>n</i>. It ends open if toggled an odd number of times, i.e. if <i>n</i> is a perfect square: 1, 4, 9, …, 100. Ten lockers.</p></div>
<div class="ex"><b>Worked example 3.</b> Find the smallest number with exactly 10 divisors.
<p>10 = 10 or 5 × 2, so the shape is p⁹ or p⁴ × q. Smallest of each: 2⁹ = 512, and 2⁴ × 3 = 48. Answer <b>48</b>. Always give the biggest exponent to the smallest prime.</p></div>
<div class="tip">LCM questions are usually disguised as "when do things next line up?" (bells, traffic lights, runners on a track). GCD questions are disguised as "largest equal pieces" (tiles, groups).</div>`,
    problems: [
      { id: "f1", d: 1, q: "How many positive divisors does 360 have?", a: 24, h: "360 = 2³ × 3² × 5.", s: "(3+1)(2+1)(1+1) = <b>24</b>." },
      { id: "f2", d: 1, q: "What is the greatest common divisor of 84 and 126?", a: 42, h: "Try Euclid: gcd(126, 84) = gcd(84, 42).", s: "126 − 84 = 42 and 42 divides 84, so the GCD is <b>42</b>." },
      { id: "f3", d: 1, q: "What is the least common multiple of 12, 18 and 20?", a: 180, h: "12 = 2²×3, 18 = 2×3², 20 = 2²×5. Take the largest power of each prime.", s: "2² × 3² × 5 = <b>180</b>." },
      { id: "f4", d: 2, q: "Two numbers have greatest common divisor 6 and least common multiple 180. One of the numbers is 36. What is the other?", a: 30, h: "GCD × LCM = product of the two numbers.", s: "6 × 180 = 1080 = 36 × other, so the other is <b>30</b>." },
      { id: "f5", d: 3, q: "What is the smallest positive integer with exactly 12 positive divisors?", a: 60, h: "12 = 12 = 6×2 = 4×3 = 3×2×2. Each gives a shape like p⁵q or p²qr.", s: "Shapes: p¹¹ (2048), p⁵q (96), p³q² (72), p²qr (60). Smallest is 2² × 3 × 5 = <b>60</b>." },
      { id: "f6", d: 1, q: "Three bells ring every 6, 8 and 15 minutes. They all ring together at noon. After how many minutes do they next all ring together?", a: 120, h: "You need the least common multiple.", s: "LCM(6, 8, 15) = 2³ × 3 × 5 = <b>120</b> minutes." },
      { id: "f7", d: 2, q: "How many of the integers from 1 to 200 have an odd number of positive divisors?", a: 14, h: "Divisors pair up (d with n ÷ d), unless…", s: "Only perfect squares have an odd number of divisors. 14² = 196 ≤ 200 < 15², so <b>14</b>." },
      { id: "f8", d: 2, q: "What is the sum of all the positive divisors of 72?", a: 195, h: "Every divisor is (a power of 2 up to 8) × (a power of 3 up to 9).", s: "(1 + 2 + 4 + 8)(1 + 3 + 9) = 15 × 13 = <b>195</b>." },
      { id: "f9", d: 2, q: "A rectangular floor measures 252 cm by 180 cm. It is to be covered exactly with identical square tiles, as large as possible. What is the side length of each tile, in cm?", a: 36, h: "The tile side must divide both lengths.", s: "gcd(252, 180) = gcd(180, 72) = gcd(72, 36) = <b>36</b>." },
      { id: "f10", d: 3, q: "How many pairs of positive integers (a, b) with a ≤ b satisfy a × b = 144?", a: 8, h: "Count the divisors of 144, then pair them up. Watch the middle one.", s: "144 = 2⁴ × 3² has 15 divisors. They form 7 pairs plus 12 × 12, so <b>8</b> pairs." }
    ]
  });

  W.modules.push({
    id: "mod", title: "Remainders & Clock Arithmetic", icon: "🕰️", strand: "Number",
    blurb: "Modular arithmetic: last digits, cycles and remainders of huge numbers.",
    lesson: `
<p>What is the remainder when 2<sup>100</sup> is divided by 7? You can't compute 2<sup>100</sup>, but you don't need to. <b>Remainders behave nicely</b>: you can add and multiply them instead of the numbers themselves.</p>
<div class="key"><b>The rule.</b> To find the remainder of a sum or a product, replace each number by its remainder first.
<p>Example: 38 × 45 divided by 7. Since 38 leaves 3 and 45 leaves 3, the product leaves the same remainder as 3 × 3 = 9, which is <b>2</b>.</p>
<p>We write 38 ≡ 3 (mod 7), read "38 is congruent to 3 mod 7". Think of a clock with 7 hours.</p></div>
<div class="key"><b>Powers cycle.</b> Remainders of powers must eventually repeat, so find the cycle.</div>
<div class="ex"><b>Worked example 1.</b> Remainder of 2<sup>100</sup> on division by 7.
<p>Powers of 2 mod 7: 2, 4, 1, 2, 4, 1 … a cycle of length 3, and 2³ ≡ 1. Since 100 = 3 × 33 + 1, 2<sup>100</sup> = (2³)<sup>33</sup> × 2 ≡ 1 × 2 = <b>2</b>.</p></div>
<div class="ex"><b>Worked example 2 (last digits).</b> The last digit is the remainder mod 10. The last two digits are the remainder mod 100.
<p>Last digit of 3<sup>50</sup>: cycle 3, 9, 7, 1 (length 4). 50 = 4 × 12 + 2, so the last digit is <b>9</b>.</p></div>
<div class="ex"><b>Worked example 3 (several conditions).</b> Find the smallest number that leaves remainder 3 when divided by 5 and remainder 2 when divided by 7.
<p>List numbers that are 2 more than a multiple of 7: 2, 9, 16, 23 … Check each mod 5: 2, 4, 1, <b>3</b> ✓. Answer 23. Solutions then repeat every 35.</p></div>
<div class="key"><b>Squares are picky.</b> A square number can only leave remainder 0 or 1 when divided by 4, and only 0 or 1 when divided by 3. Its last digit is never 2, 3, 7 or 8. This proves many things are impossible.</div>
<div class="tip">Negative remainders save work: 6 ≡ −1 (mod 7), so 6<sup>99</sup> ≡ (−1)<sup>99</sup> = −1 ≡ 6.</div>`,
    problems: [
      { id: "r1", d: 2, q: "What is the remainder when 2<sup>100</sup> is divided by 7?", a: 2, h: "2³ = 8 leaves remainder 1.", s: "2³ ≡ 1, so 2⁹⁹ ≡ 1 and 2¹⁰⁰ ≡ <b>2</b> (mod 7)." },
      { id: "r2", d: 3, q: "What are the last two digits of 7<sup>2026</sup>? (Give your answer as a number.)", a: 49, h: "Compute 7⁴. Something lovely happens.", s: "7⁴ = 2401 ends in 01. 2026 = 4 × 506 + 2, so 7²⁰²⁶ ends like 7² = <b>49</b>." },
      { id: "r3", d: 2, q: "What is the remainder when 1 + 2 + 3 + … + 100 is divided by 9?", a: 1, h: "Find the sum, then use its digit sum.", s: "The sum is 5050. Digit sum 10, which leaves remainder <b>1</b>." },
      { id: "r4", d: 3, q: "What is the smallest positive integer that leaves remainder 2 when divided by 3, remainder 3 when divided by 5, and remainder 2 when divided by 7?", a: 23, h: "Remainder 2 mod 3 and mod 7 means remainder 2 mod 21. List: 2, 23, 44 …", s: "Numbers ≡ 2 (mod 21): 2, 23, 44 … 23 = 5 × 4 + 3 ✓. Answer <b>23</b>." },
      { id: "r5", d: 2, q: "What is the remainder when 123456789 is divided by 11?", a: 5, h: "Use the alternating digit sum, starting with + on the units digit.", s: "9 − 8 + 7 − 6 + 5 − 4 + 3 − 2 + 1 = <b>5</b>." },
      { id: "r6", d: 2, q: "What is the last digit of 3<sup>2026</sup> + 4<sup>2026</sup>?", a: 5, h: "Powers of 3 cycle with length 4; powers of 4 alternate 4, 6.", s: "2026 ≡ 2 (mod 4) so 3²⁰²⁶ ends in 9. Even powers of 4 end in 6. 9 + 6 = 15, last digit <b>5</b>." },
      { id: "r7", d: 3, q: "For how many integers <i>n</i> from 1 to 100 is <i>n</i>² + 1 divisible by 5?", a: 40, h: "Only the remainder of n mod 5 matters. Test n = 0, 1, 2, 3, 4.", s: "n² + 1 mod 5 for n ≡ 0,1,2,3,4 is 1, 2, 0, 0, 2. So n ≡ 2 or 3 (mod 5): 2 in every 5, giving <b>40</b>." },
      { id: "r8", d: 3, q: "What is the remainder when 1! + 2! + 3! + … + 50! is divided by 12?", a: 9, h: "From 4! onwards every term is a multiple of 12.", s: "4! = 24 and everything after is divisible by 12. 1 + 2 + 6 = <b>9</b>." },
      { id: "r9", d: 4, q: "What is the smallest positive integer <i>n</i> such that 7<i>n</i> leaves remainder 1 when divided by 26?", a: 15, h: "You want 7n = 26k + 1. Try k = 1, 2, 3, 4 …", s: "27, 53, 79, 105 → 105 = 7 × 15. So n = <b>15</b>." }
    ]
  });

  W.modules.push({
    id: "digits", title: "Digits & Place Value", icon: "🔟", strand: "Number",
    blurb: "Digit sums, palindromes, reversals and letter puzzles.",
    lesson: `
<p>WAJO loves questions about the digits of a number. The key is to translate digits into algebra.</p>
<div class="key"><b>Place value is algebra.</b> The two-digit number with digits <i>a</i> and <i>b</i> is 10<i>a</i> + <i>b</i>. The three-digit number <span class="ol">abc</span> is 100<i>a</i> + 10<i>b</i> + <i>c</i>. WAJO papers write a bar over the letters to show they are digits, not a product.</div>
<div class="ex"><b>Worked example 1 (reversals).</b> A two-digit number is reversed. Show the difference is always a multiple of 9.
<p>(10a + b) − (10b + a) = 9a − 9b = 9(a − b). And the <i>sum</i> is 11(a + b), always a multiple of 11. Two facts worth remembering.</p></div>
<div class="ex"><b>Worked example 2.</b> A two-digit number is 7 times the sum of its digits. Find all such numbers.
<p>10a + b = 7(a + b) gives 3a = 6b, so a = 2b. Digits: 21, 42, 63, 84.</p></div>
<div class="key"><b>Palindromes</b> read the same forwards and backwards. A 4-digit palindrome <span class="ol">abba</span> = 1001a + 110b = 11(91a + 10b), so <b>every 4-digit palindrome is a multiple of 11</b>. To count palindromes, choose the first half freely: there are 9 × 10 = 90 three-digit palindromes.</div>
<div class="ex"><b>Worked example 3 (counting digits).</b> How many digits has 2<sup>15</sup> × 5<sup>12</sup>?
<p>Pair twos with fives to make tens: 2³ × (2 × 5)<sup>12</sup> = 8 × 10<sup>12</sup>. That is 8 followed by 12 zeros: <b>13 digits</b>.</p></div>
<div class="ex"><b>Worked example 4 (letter puzzles).</b> In AB + BA = 154, different letters are different digits. Find A + B.
<p>AB + BA = 11(A + B) = 154, so A + B = <b>14</b>.</p></div>
<div class="tip">In letter puzzles, start with the column that tells you most. That is usually the leftmost (a carry can only be 0 or 1 when adding two numbers) or the units column.</div>`,
    problems: [
      { id: "g1", d: 2, q: "Some two-digit numbers are equal to 4 times the sum of their digits. What is the sum of all such numbers?", a: 120, h: "Write 10a + b = 4(a + b) and simplify.", s: "6a = 3b so b = 2a: 12, 24, 36, 48. Sum = <b>120</b>." },
      { id: "g2", d: 1, q: "How many three-digit palindromes are there?", a: 90, h: "Choose the first digit and the middle digit.", s: "First digit 1–9 (it is also the last), middle digit 0–9: 9 × 10 = <b>90</b>." },
      { id: "g3", d: 2, q: "Reversing the digits of a two-digit number increases it by 27. Its digits add to 11. What is the number?", a: 47, h: "The change on reversing is 9 × (difference of the digits).", s: "9(b − a) = 27, so b − a = 3, and a + b = 11. So a = 4, b = 7: <b>47</b>." },
      { id: "g4", d: 2, q: "How many digits does the number 2<sup>20</sup> × 5<sup>17</sup> have?", a: 18, h: "Pair up 2s and 5s to make powers of 10.", s: "2³ × 10¹⁷ = 8 followed by 17 zeros: <b>18</b> digits." },
      { id: "g5", d: 3, q: "What is the sum of the digits of 10<sup>20</sup> − 20?", a: 170, h: "Try 10⁴ − 20 = 9980 first, then 10⁵ − 20.", s: "10²⁰ − 20 has 20 digits: eighteen 9s followed by 80. Sum = 18 × 9 + 8 = <b>170</b>." },
      { id: "g6", d: 2, q: "A and B are digits with AB + BA = 121 (two-digit numbers) and A − B = 3. What is the two-digit number AB?", a: 74, h: "AB + BA = 11(A + B).", s: "A + B = 11 and A − B = 3 give A = 7, B = 4: <b>74</b>." },
      { id: "g7", d: 3, q: "How many three-digit numbers have digits that add up to 5?", a: 15, h: "Split by the first digit: 1, 2, 3, 4, 5.", s: "First digit 1: the other two sum to 4 (5 ways). First 2: 4 ways. 3: 3 ways. 4: 2 ways. 5: 1 way. Total <b>15</b>." },
      { id: "g8", d: 3, q: "A three-digit number <span class='ol'>abc</span> and its reverse <span class='ol'>cba</span> add to 1332. What is the largest possible value of <span class='ol'>abc</span>?", a: 963, h: "The sum is 101(a + c) + 20b.", s: "101(a + c) + 20b = 1332. Looking at the last digit, a + c ends in 2, so a + c = 12 and then b = 6. Largest: a = 9, c = 3: <b>963</b>." },
      { id: "g9", d: 2, q: "When all the whole numbers from 1 to 300 are written out, how many times is the digit 7 written?", a: 60, h: "Count 7s in the units place and the tens place separately.", s: "Units place: once every 10 numbers → 30. Tens place: 70–79, 170–179, 270–279 → 30. Total <b>60</b>." },
      { id: "g10", d: 4, q: "What is the largest four-digit palindrome that is divisible by 7?", a: 9779, h: "abba = 1001a + 110b, and 1001 = 7 × 143.", s: "1001a is always a multiple of 7, so 110b must be too, forcing b = 0 or 7. Largest: <b>9779</b>." }
    ]
  });
})(typeof window !== "undefined" ? window : globalThis);
