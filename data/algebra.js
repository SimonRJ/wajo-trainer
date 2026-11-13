/* WAJO Trainer – modules 6-10: algebra, sequences, counting, logic */
(function (G) {
  var W = (G.WAJO = G.WAJO || { modules: [], mocks: [], team: [] });

  W.modules.push({
    id: "words", title: "Equations & Word Problems", icon: "⚖️", strand: "Algebra",
    blurb: "Ages, ratios, percentages, speed, work rates and averages.",
    lesson: `
<p>The early and middle questions of the individual paper are often word problems. They are worth quick, safe marks if you can turn English into equations.</p>
<div class="key"><b>The method</b><ol><li>Choose a letter for the thing you are asked for.</li><li>Translate each sentence into an equation.</li><li>Solve, then <b>re-read the question</b>: did it ask for x, or for something built from x?</li></ol></div>
<div class="key"><b>Percentages multiply.</b> "Up 20%" means × 1.2. "Down 25%" means × 0.75. A 20% rise followed by a 20% fall is × 1.2 × 0.8 = 0.96: a 4% <i>loss</i>, not zero.</div>
<div class="ex"><b>Worked example 1 (average speed).</b> Zoe drives 120 km at 60 km/h and returns at 40 km/h. What is her average speed?
<p>It is <b>not</b> 50. Average speed = total distance ÷ total time = 240 ÷ (2 + 3) = <b>48 km/h</b>. She spends longer at the slow speed, so the average leans towards it.</p></div>
<div class="ex"><b>Worked example 2 (work rates).</b> Pipe A fills a tank in 4 hours, pipe B in 12 hours. Together?
<p>Add <i>rates</i>, not times. A does 1/4 of the tank per hour, B does 1/12. Together 1/4 + 1/12 = 1/3 per hour: <b>3 hours</b>.</p></div>
<div class="ex"><b>Worked example 3 (ratios).</b> a : b = 3 : 4 and b : c = 6 : 5. Find a : b : c.
<p>Make the b's match using LCM(4, 6) = 12: a : b = 9 : 12 and b : c = 12 : 10. So a : b : c = <b>9 : 12 : 10</b>.</p></div>
<div class="key"><b>Averages are totals in disguise.</b> "The mean of 6 numbers is 15" simply means "the total is 90". Convert every mean into a total straight away.</div>
<div class="ex"><b>Worked example 4 (symmetric tricks).</b> If x + y = 8 and xy = 13, find x² + y².
<p>Don't solve for x and y. Use (x + y)² = x² + 2xy + y²: 64 = x² + y² + 26, so x² + y² = <b>38</b>.</p></div>
<div class="tip">Useful units: distance = speed × time. For trains passing bridges, the distance travelled is bridge length <b>plus</b> train length.</div>`,
    problems: [
      { id: "a1", d: 1, q: "A father is 4 times as old as his son. In 20 years he will be twice as old as his son. How old is the father now?", a: 40, h: "Let the son be s. Then 4s + 20 = 2(s + 20).", s: "4s + 20 = 2s + 40 gives s = 10. The father is <b>40</b>." },
      { id: "a2", d: 1, q: "A $200 jacket has its price raised by 20%, and the new price is then cut by 25%. What is the final price in dollars?", a: 180, h: "Multiply by 1.2, then by 0.75.", s: "200 × 1.2 = 240. 240 × 0.75 = <b>180</b>." },
      { id: "a3", d: 2, q: "A cyclist rides 60 km at 30 km/h, then another 60 km at 60 km/h. What is the average speed for the whole trip, in km/h?", a: 40, h: "Total distance ÷ total time.", s: "Time = 2 h + 1 h = 3 h. 120 ÷ 3 = <b>40</b> km/h." },
      { id: "a4", d: 2, q: "Ali, Ben and Cy share $105 so that Ali : Ben = 2 : 3 and Ben : Cy = 4 : 5. How many dollars does Cy get?", a: 45, h: "Make Ben's share match in both ratios.", s: "Ali : Ben : Cy = 8 : 12 : 15, total 35 parts. One part is $3, so Cy gets 15 × 3 = <b>45</b>." },
      { id: "a5", d: 2, q: "Ann can paint a fence in 6 hours. Bob can paint it in 3 hours. Working together, how many <b>minutes</b> do they take?", a: 120, h: "Add the fractions of fence painted per hour.", s: "1/6 + 1/3 = 1/2 fence per hour, so 2 hours = <b>120</b> minutes." },
      { id: "a6", d: 1, q: "The mean of five numbers is 12. When one number is removed, the mean of the remaining four is 10. What number was removed?", a: 20, h: "Turn the means into totals.", s: "Totals: 60 and 40. Removed number = <b>20</b>." },
      { id: "a7", d: 2, q: "If x + y = 10 and xy = 21, what is x² + y²?", a: 58, h: "Expand (x + y)².", s: "x² + y² = (x + y)² − 2xy = 100 − 42 = <b>58</b>." },
      { id: "a8", d: 3, q: "A train 150 m long passes a signal post in 6 seconds. At the same speed, how many seconds does it take to completely cross a bridge 350 m long?", a: 20, h: "To clear the bridge the train travels bridge + train length.", s: "Speed = 150 ÷ 6 = 25 m/s. Distance = 350 + 150 = 500 m. Time = <b>20</b> s." },
      { id: "a9", d: 3, q: "A jug holds 10 litres of cordial that is 30% syrup. How many litres of water must be added to make it 20% syrup?", a: 5, h: "The amount of syrup (3 L) doesn't change.", s: "3 L must be 20% of the new total, so the total is 15 L. Add <b>5</b> L." },
      { id: "a10", d: 1, q: "Three consecutive odd numbers add to 111. What is the largest of them?", a: 39, h: "The middle number is the average.", s: "Middle = 111 ÷ 3 = 37, so the numbers are 35, 37, <b>39</b>." },
      { id: "a11", d: 3, q: "If x + 1/x = 5, what is the value of x² + 1/x²?", a: 23, h: "Square both sides.", s: "(x + 1/x)² = x² + 2 + 1/x² = 25, so x² + 1/x² = <b>23</b>." }
    ]
  });

  W.modules.push({
    id: "seq", title: "Sequences, Sums & Patterns", icon: "📈", strand: "Algebra",
    blurb: "Arithmetic sequences, Gauss's trick, telescoping and recurrences.",
    lesson: `
<p>When young Gauss was asked to add 1 + 2 + … + 100, he paired 1 with 100, 2 with 99, and so on: 50 pairs each worth 101, total 5050. That pairing idea drives this whole topic.</p>
<div class="key"><b>Arithmetic sequences</b> go up by a fixed step d.
<ul><li>n-th term = first + (n − 1) × d. <i>(There are n − 1 steps to reach term n.)</i></li>
<li>Sum = (number of terms) × (first + last) ÷ 2. <i>Number of terms × the average term.</i></li>
<li>1 + 2 + … + n = n(n + 1)/2. These are the <b>triangular numbers</b>: 1, 3, 6, 10, 15, 21 …</li>
<li>1 + 3 + 5 + … (first n odd numbers) = n².</li></ul></div>
<div class="ex"><b>Worked example 1.</b> Find the sum 4 + 7 + 10 + … + 301.
<p>How many terms? (301 − 4) ÷ 3 = 99 steps, so 100 terms. Sum = 100 × (4 + 301) ÷ 2 = <b>15250</b>. The classic error is to forget the "+1" when counting terms.</p></div>
<div class="key"><b>Telescoping.</b> Because 1/(n(n+1)) = 1/n − 1/(n+1), sums like 1/(1×2) + 1/(2×3) + 1/(3×4) collapse: (1 − 1/2) + (1/2 − 1/3) + (1/3 − 1/4) = 1 − 1/4.</div>
<div class="key"><b>Powers of 2.</b> 1 + 2 + 4 + … + 2<sup>n</sup> = 2<sup>n+1</sup> − 1. (Add 1 to the left and watch it double up the line.)</div>
<div class="ex"><b>Worked example 2 (recurrence).</b> In how many ways can you climb 5 stairs taking 1 or 2 steps at a time?
<p>Your last move was either a 1-step (from stair 4) or a 2-step (from stair 3). So ways(5) = ways(4) + ways(3). Starting from ways(1) = 1, ways(2) = 2: 1, 2, 3, 5, <b>8</b>. Fibonacci numbers!</p></div>
<div class="tip">For any "find the pattern" question, write the differences between terms. Constant differences mean a linear rule (an + b). Constant <i>second</i> differences mean a quadratic rule (an² + bn + c).</div>`,
    problems: [
      { id: "s1", d: 1, q: "What is the 100th term of the sequence 7, 11, 15, 19, …?", a: 403, h: "There are 99 steps of 4 from the first term.", s: "7 + 99 × 4 = <b>403</b>." },
      { id: "s2", d: 1, q: "What is 1 + 3 + 5 + … + 99?", a: 2500, h: "How many odd numbers are there from 1 to 99?", s: "There are 50 odd numbers, and the sum of the first n odd numbers is n²: <b>2500</b>." },
      { id: "s3", d: 2, q: "What is the sum of all the multiples of 3 from 3 to 300?", a: 15150, h: "Factor out the 3.", s: "3(1 + 2 + … + 100) = 3 × 5050 = <b>15150</b>." },
      { id: "s4", d: 2, q: "The triangular numbers are 1, 3, 6, 10, … where the n-th is 1 + 2 + … + n. For which n does the n-th triangular number first exceed 1000?", a: 45, h: "n(n + 1)/2 > 1000 means n(n + 1) > 2000. What is √2000 roughly?", s: "44 × 45 ÷ 2 = 990 and 45 × 46 ÷ 2 = 1035, so n = <b>45</b>." },
      { id: "s5", d: 3, q: "The sum 1/(1×2) + 1/(2×3) + 1/(3×4) + … + 1/(99×100) equals m/n in lowest terms. What is m + n?", a: 199, h: "1/(k(k+1)) = 1/k − 1/(k+1).", s: "The sum telescopes to 1 − 1/100 = 99/100. m + n = <b>199</b>." },
      { id: "s6", d: 2, q: "An arithmetic sequence has 3rd term 11 and 9th term 35. What is its 20th term?", a: 79, h: "From the 3rd to the 9th term is 6 steps.", s: "6d = 24 so d = 4. 20th term = 35 + 11 × 4 = <b>79</b>." },
      { id: "s7", d: 3, q: "In how many ways can you climb a staircase of 10 stairs if each move takes you up 1 or 2 stairs?", a: 89, h: "ways(n) = ways(n − 1) + ways(n − 2).", s: "1, 2, 3, 5, 8, 13, 21, 34, 55, <b>89</b>." },
      { id: "s8", d: 2, q: "What is 1 − 2 + 3 − 4 + 5 − … − 98 + 99?", a: 50, h: "Group in pairs: (1 − 2) + (3 − 4) + …", s: "49 pairs each worth −1, plus the final 99: −49 + 99 = <b>50</b>." },
      { id: "s9", d: 2, q: "A row of n squares made from matchsticks (sharing sides) uses 4, 7, 10, … matches for n = 1, 2, 3, …. What is the longest row you can make with 100 matches?", a: 33, h: "Each extra square needs 3 more matches.", s: "A row of n squares needs 3n + 1 matches. 3n + 1 ≤ 100 gives n = <b>33</b>." },
      { id: "s10", d: 2, q: "What is 1 + 2 + 4 + 8 + … + 512?", a: 1023, h: "Add 1 to the sum and see what happens.", s: "The sum is 2¹⁰ − 1 = <b>1023</b>." }
    ]
  });

  W.modules.push({
    id: "power", title: "Algebra Power Tools", icon: "🛠️", strand: "Algebra",
    blurb: "Difference of squares, clever factorising, integer equations, absolute value.",
    lesson: `
<p>The hard (3 and 4 mark) algebra questions nearly always use one of a handful of tricks. Master these and they turn from impossible to routine.</p>
<div class="key"><b>Difference of two squares:</b> a² − b² = (a − b)(a + b).
<p>So 51² − 49² = 2 × 100 = 200, and 98 × 102 = 100² − 2² = 9996.</p></div>
<div class="ex"><b>Worked example 1.</b> Find all positive integers x, y with x² − y² = 21.
<p>(x − y)(x + y) = 21. Factor pairs of 21: 1 × 21 and 3 × 7. Solve each: x − y = 1, x + y = 21 → (11, 10). x − y = 3, x + y = 7 → (5, 2). Both factors must have the same parity, because their sum is 2x.</p></div>
<div class="key"><b>Simon's favourite factoring trick.</b> An equation like xy + x + y = 20 is begging for a +1: xy + x + y + 1 = (x + 1)(y + 1) = 21. Now use factor pairs.
<p>Same idea for 1/x + 1/y = 1/n: multiply out to get xy − nx − ny = 0, add n², and factor as (x − n)(y − n) = n².</p></div>
<div class="ex"><b>Worked example 2 (linear integer equations).</b> Stamps cost 3c and 5c. In how many ways can you spend exactly 31c?
<p>3x + 5y = 31. Step y through 0, 1, 2 … and keep those where 31 − 5y is a multiple of 3: y = 2 (x = 7), y = 5 (x = 2). Two ways. Notice y goes up in 3s while x goes down in 5s.</p></div>
<div class="key"><b>Absolute value</b> |x| is distance from 0, and |x − a| is the distance from x to a on the number line.
<p>So |x − 2| + |x − 8| = 10 asks: where is the total distance to 2 and to 8 equal to 10? Between 2 and 8 the total is always 6. Outside, each step away adds 2, so go 2 further out: x = 0 or x = 10.</p></div>
<div class="key"><b>Identities to know</b><ul>
<li>(a + b)² = a² + 2ab + b²</li><li>(a − b)² = a² − 2ab + b²</li>
<li>a³ + b³ = (a + b)(a² − ab + b²)</li></ul></div>`,
    problems: [
      { id: "p1", d: 1, q: "What is 2025² − 2024²?", a: 4049, h: "Difference of two squares.", s: "(2025 − 2024)(2025 + 2024) = <b>4049</b>." },
      { id: "p2", d: 1, q: "What is 1001² − 999²?", a: 4000, h: "(a − b)(a + b).", s: "2 × 2000 = <b>4000</b>." },
      { id: "p3", d: 3, q: "How many pairs of <b>positive</b> integers (x, y) satisfy 3x + 5y = 100?", a: 6, h: "100 − 5y must be a positive multiple of 3. Try y = 1, 2, 3 … and spot the pattern.", s: "y = 2, 5, 8, 11, 14, 17 give x = 30, 25, 20, 15, 10, 5. (y = 20 gives x = 0, not positive.) <b>6</b> pairs." },
      { id: "p4", d: 3, q: "How many pairs of positive integers (x, y) satisfy x² − y² = 45?", a: 3, h: "(x − y)(x + y) = 45. List factor pairs.", s: "1 × 45 → (23, 22). 3 × 15 → (9, 6). 5 × 9 → (7, 2). <b>3</b> pairs." },
      { id: "p5", d: 3, q: "Positive integers x and y satisfy xy + x + y = 34. What is x + y?", a: 10, h: "Add 1 to both sides and factorise.", s: "(x + 1)(y + 1) = 35 = 5 × 7 (1 × 35 would make x = 0). So x, y are 4 and 6: sum <b>10</b>." },
      { id: "p6", d: 3, q: "The equation |x − 3| + |x + 2| = 9 has two solutions. How far apart are they on the number line?", a: 9, h: "Between −2 and 3 the total distance is 5. Each step outside adds 2.", s: "We need 4 more than 5, so go 2 beyond each end: x = 5 and x = −4. Distance apart = <b>9</b>." },
      { id: "p7", d: 2, q: "How many integers n (positive, negative or zero) satisfy n² < 200?", a: 29, h: "14² = 196 and 15² = 225.", s: "n ranges from −14 to 14: <b>29</b> integers." },
      { id: "p8", d: 4, q: "If a + b = 7 and a² + b² = 29, what is a³ + b³?", a: 133, h: "Find ab first, then use a³ + b³ = (a + b)(a² − ab + b²).", s: "2ab = 49 − 29 = 20, so ab = 10. a³ + b³ = 7 × (29 − 10) = <b>133</b>." },
      { id: "p9", d: 4, q: "How many pairs of positive integers (x, y) with x ≤ y satisfy 1/x + 1/y = 1/6?", a: 5, h: "Rearrange to (x − 6)(y − 6) = 36.", s: "36 has 9 divisors, giving 4 pairs with different factors and 6 × 6: <b>5</b> pairs. (They are (7,42), (8,24), (9,18), (10,15), (12,12).)" },
      { id: "p10", d: 3, q: "What is the largest prime factor of 2<sup>10</sup> − 1?", a: 31, h: "2¹⁰ − 1 = (2⁵ − 1)(2⁵ + 1).", s: "31 × 33 = 31 × 3 × 11. Largest prime factor: <b>31</b>." }
    ]
  });

  W.modules.push({
    id: "count", title: "Counting", icon: "🎲", strand: "Counting & Logic",
    blurb: "Multiplication principle, arrangements, choosing and inclusion–exclusion.",
    lesson: `
<p>"How many…?" is the most common question opening in WAJO. Good counting is organised counting.</p>
<div class="key"><b>Multiplication principle.</b> If a task is done in stages with a, b, c … choices at each stage, there are a × b × c … ways in total.
<p>Three-digit numbers with all digits different: 9 choices for the first (not 0), then 9, then 8: 648.</p></div>
<div class="key"><b>Arrangements.</b> n different objects can be lined up in n! = n × (n−1) × … × 1 ways. If some are identical, divide by the factorial of each repeat: the letters of NOON can be arranged in 4!/(2! × 2!) = 6 ways.</div>
<div class="key"><b>Choosing.</b> The number of ways to choose r things from n when order doesn't matter is written C(n, r) or <sup>n</sup>C<sub>r</sub>:
<p>C(n, 2) = n(n − 1)/2 &nbsp;&nbsp; C(n, 3) = n(n − 1)(n − 2)/6</p>
<p><i>Why divide?</i> Picking in order gives n(n−1)(n−2) lists, but each group of 3 was listed 3! = 6 times.</p></div>
<div class="ex"><b>Worked example 1 (grid paths).</b> How many shortest routes go from the bottom-left to the top-right of a 3 × 2 grid of streets?
<p>Every route is 3 Rights and 2 Ups in some order: choose which 2 of the 5 moves are Ups. C(5, 2) = <b>10</b>.</p></div>
<div class="key"><b>Count the opposite.</b> "At least one" is easier as total − none. Three-digit numbers with at least one 7: 900 − (8 × 9 × 9) = 252.</div>
<div class="key"><b>Inclusion–exclusion.</b> |A or B| = |A| + |B| − |A and B|. For three sets: add the singles, subtract the pairs, add back the triple.</div>
<div class="ex"><b>Worked example 2.</b> How many numbers from 1 to 60 are divisible by 2 or 3?
<p>30 + 20 − 10 (multiples of 6, counted twice) = <b>40</b>.</p></div>
<div class="ex"><b>Worked example 3 (stars and bars).</b> Share 5 identical lollies among 3 children.
<p>Draw the lollies as stars and use 2 bars to split them: ★★|★|★★. Any arrangement of 5 stars and 2 bars works: C(7, 2) = <b>21</b>.</p></div>`,
    problems: [
      { id: "c1", d: 1, q: "How many three-digit numbers have three different digits?", a: 648, h: "The first digit can't be 0.", s: "9 × 9 × 8 = <b>648</b>." },
      { id: "c2", d: 2, q: "In how many different ways can the letters of the word LEVEL be arranged?", a: 30, h: "5 letters, but L appears twice and E appears twice.", s: "5! ÷ (2! × 2!) = 120 ÷ 4 = <b>30</b>." },
      { id: "c3", d: 1, q: "In how many ways can a committee of 3 be chosen from 8 people?", a: 56, h: "C(8, 3) = 8 × 7 × 6 ÷ 6.", s: "<b>56</b>." },
      { id: "c4", d: 2, q: "A robot moves on a grid from (0, 0) to (4, 3). Each move is one unit right or one unit up. How many different paths can it take?", a: 35, h: "7 moves in total; choose which 3 are 'up'.", s: "C(7, 3) = <b>35</b>." },
      { id: "c5", d: 3, q: "How many of the integers from 1 to 100 are divisible by at least one of 2, 3 or 5?", a: 74, h: "Inclusion–exclusion with multiples of 2, 3, 5, then 6, 10, 15, then 30.", s: "50 + 33 + 20 − 16 − 10 − 6 + 3 = <b>74</b>." },
      { id: "c6", d: 2, q: "How many diagonals does a polygon with 12 sides have?", a: 54, h: "From each vertex, diagonals go to all but itself and its two neighbours.", s: "12 × 9 ÷ 2 = <b>54</b>." },
      { id: "c7", d: 2, q: "Five friends sit in a row of five seats. Amy and Bea insist on sitting next to each other. How many seating arrangements are possible?", a: 48, h: "Glue Amy and Bea together into one 'super-person'.", s: "4 units can be arranged in 4! = 24 ways, and the pair can swap: 24 × 2 = <b>48</b>." },
      { id: "c8", d: 3, q: "In how many ways can 7 identical lollies be shared among 3 children, if some children may get none?", a: 36, h: "Stars and bars: 7 stars, 2 bars.", s: "C(9, 2) = <b>36</b>." },
      { id: "c9", d: 3, q: "How many four-digit numbers have their digits in strictly increasing order from left to right (like 1389)?", a: 126, h: "Once you choose 4 different digits, how many ways can they be put in increasing order? Can 0 be used?", s: "0 can't appear (it would have to be first). Any 4 digits from 1–9 give exactly one such number: C(9, 4) = <b>126</b>." },
      { id: "c10", d: 2, q: "How many three-digit numbers contain at least one digit 5?", a: 252, h: "Count those with no 5 and subtract.", s: "No 5: 8 × 9 × 9 = 648. 900 − 648 = <b>252</b>." }
    ]
  });

  W.modules.push({
    id: "logic", title: "Logic, Chance & Invariants", icon: "🧠", strand: "Counting & Logic",
    blurb: "Pigeonhole principle, probability, truth-tellers and things that never change.",
    lesson: `
<p>These are the questions that feel like puzzles. They need little knowledge but very clear thinking, and they dominate the team paper.</p>
<div class="key"><b>Pigeonhole principle.</b> If you put more than n pigeons into n holes, some hole has at least two. To <i>guarantee</i> something, imagine the worst possible luck.
<p>A drawer has red, blue and green socks. How many must you take to be sure of a matching pair? Worst luck: one of each colour (3 socks). The 4th must match. Answer 4.</p></div>
<div class="key"><b>Probability</b> = favourable outcomes ÷ total outcomes, when all outcomes are equally likely. Rolling two dice gives 36 equally likely outcomes. List them in a 6 × 6 table when unsure.</div>
<div class="ex"><b>Worked example 1.</b> Two dice are rolled. What is the chance the total is 9?
<p>(3,6), (4,5), (5,4), (6,3): 4 outcomes out of 36 = <b>1/9</b>.</p></div>
<div class="key"><b>Truth and lies.</b> Pick one person and suppose they tell the truth. Follow the consequences. If you hit a contradiction, they must be lying. Go through the cases one by one.</div>
<div class="ex"><b>Worked example 2.</b> Ann says "Bob is lying." Bob says "Cal is lying." Cal says "Ann and Bob are both lying." Who tells the truth?
<p>Suppose Ann is truthful. Then Bob lies, so Cal is truthful, so Ann lies. Contradiction. So Ann lies, Bob is truthful, Cal lies. (Check Cal: "both lying" is false because Bob is truthful ✓.) Only <b>Bob</b>.</p></div>
<div class="key"><b>Invariants and colouring.</b> To show something is impossible, find a quantity that never changes.
<p>A chessboard with two opposite corners removed can't be tiled by 31 dominoes: each domino covers one black and one white square, but the removed corners are the same colour, leaving 30 of one colour and 32 of the other.</p></div>
<div class="ex"><b>Worked example 3 (count it another way).</b> A knockout tournament has 64 players. How many matches?
<p>Every match eliminates exactly one player, and 63 players must be eliminated. <b>63 matches.</b> No need to add 32 + 16 + 8 + …</p></div>`,
    problems: [
      { id: "l1", d: 2, q: "A drawer holds 10 red, 10 blue and 10 green socks. Without looking, what is the smallest number of socks you must take to be certain of having three socks of the same colour?", a: 7, h: "Worst luck: you have two of each colour.", s: "With 6 socks you might have 2 of each colour. The 7th forces three of one colour: <b>7</b>." },
      { id: "l2", d: 2, q: "Two fair dice are rolled. The probability that the total is 8 is m/n in lowest terms. What is m + n?", a: 41, h: "List the pairs that total 8.", s: "(2,6), (3,5), (4,4), (5,3), (6,2): 5/36. m + n = <b>41</b>." },
      { id: "l3", d: 3, q: "What is the smallest number of integers you must choose from 1 to 20 to be certain that two of them differ by exactly 10?", a: 11, h: "Pair the numbers: (1, 11), (2, 12), …", s: "There are 10 pairs {k, k + 10}. You can choose 10 numbers with one from each pair, but an 11th must complete a pair: <b>11</b>." },
      { id: "l4", d: 3, q: "Ann says 'Bob is lying.' Bob says 'Cal is lying.' Cal says 'Ann and Bob are both lying.' Each person is either truthful or lying. How many of them are telling the truth?", a: 1, h: "Assume Ann is truthful and follow the chain.", s: "Ann truthful ⇒ Bob lies ⇒ Cal truthful ⇒ Ann lies: contradiction. So Ann lies, Bob is truthful, Cal lies. <b>1</b>." },
      { id: "l5", d: 2, q: "A bag holds 3 red and 2 blue marbles. Two are drawn without replacement. The probability both are red is m/n in lowest terms. What is m + n?", a: 13, h: "3/5 for the first, then 2/4 for the second.", s: "3/5 × 2/4 = 3/10. m + n = <b>13</b>." },
      { id: "l6", d: 3, q: "Two opposite corner squares are removed from an 8×8 chessboard. Dominoes each cover two adjacent squares and may not overlap. What is the largest number of dominoes that can be placed on the board?", a: 30, h: "Colour matters: what colours are the removed corners?", s: "The removed corners are the same colour, leaving 30 squares of that colour and 32 of the other. Each domino needs one of each, so at most <b>30</b> (and 30 can be done)." },
      { id: "l7", d: 2, q: "100 players enter a knockout tennis tournament (the loser of each match is eliminated; players get a bye when numbers are odd). How many matches are played to find the champion?", a: 99, h: "How many players must be eliminated?", s: "Each match eliminates one player and 99 must go: <b>99</b> matches." },
      { id: "l8", d: 4, q: "Among 80 identical-looking coins, one is heavier than the rest. Using a two-pan balance, what is the smallest number of weighings that guarantees finding it?", a: 4, h: "One weighing has three outcomes: left heavy, right heavy, balanced. So split into three groups.", s: "Each weighing can cut the possibilities to a third. 3³ = 27 < 80 ≤ 81 = 3⁴, so <b>4</b> weighings (split 27/27/26, and so on)." },
      { id: "l9", d: 2, q: "Three fair coins are tossed. The probability of getting exactly two heads is m/n in lowest terms. What is m + n?", a: 11, h: "There are 8 equally likely outcomes.", s: "HHT, HTH, THH: 3/8. m + n = <b>11</b>." }
    ]
  });
})(typeof window !== "undefined" ? window : globalThis);
