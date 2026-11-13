/* WAJO Trainer – three full mock individual papers (original questions in WAJO style).
   Format: 16 questions, 100 minutes, marks 1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4 = 40. */
(function (G) {
  var W = (G.WAJO = G.WAJO || { modules: [], mocks: [], team: [] });

  W.mocks.push({ id: "mockA", title: "Mock Paper A", qs: [
    { q: "A rectangle has perimeter 40 cm. Its length is three times its width. What is its area in cm²?", a: 75, s: "Width w, length 3w: 8w = 40, so w = 5. Area = 5 × 15 = <b>75</b>." },
    { q: "How many two-digit numbers are multiples of 7?", a: 13, s: "From 14 = 7 × 2 to 98 = 7 × 14: <b>13</b> numbers." },
    { q: "Tom has twice as many marbles as Sue. If Tom gives Sue 9 marbles, they will have the same number. How many marbles does Tom have?", a: 36, s: "2s − 9 = s + 9 gives s = 18. Tom has <b>36</b>." },
    { q: "How many digits does the number 4<sup>5</sup> × 5<sup>12</sup> have?", a: 12, s: "2¹⁰ × 5¹² = 25 × 10¹⁰, which is 25 followed by 10 zeros: <b>12</b> digits." },
    { q: "An arithmetic sequence has first term 5 and tenth term 41. What is the sum of its first ten terms?", a: 230, s: "10 × (5 + 41) ÷ 2 = <b>230</b>." },
    { q: "How many three-digit numbers have digits whose product is 12?", a: 15, s: "Digit sets: {1, 2, 6} (6 orders), {1, 3, 4} (6 orders), {2, 2, 3} (3 orders). Total <b>15</b>." },
    { q: "A shop raises the price of a bike by 25%. By what percentage must the new price be reduced to return to the original price?", a: 20, s: "Original 100 → 125. To get back we remove 25 out of 125, which is <b>20</b>%." },
    { q: "Triangle ABC has a right angle at C, with AC = 6 and BC = 8. A square has one corner at C, two sides along CA and CB, and the opposite corner on AB. The side of the square is m/n in lowest terms. What is m + n?", a: 31, s: "Put C at the origin. The corner (s, s) lies on the line x/8 + y/6 = 1, so s(1/8 + 1/6) = 1 and s = 24/7. m + n = <b>31</b>." },
    { q: "A cyclist rides up a hill at 12 km/h and straight back down the same road at 36 km/h. What is her average speed for the whole ride, in km/h?", a: 18, s: "Take the hill as 36 km: up takes 3 h, down 1 h. 72 km in 4 h = <b>18</b> km/h." },
    { q: "How many of the integers from 1 to 200 are divisible by none of 2, 3 and 7?", a: 58, s: "Divisible by at least one: 100 + 66 + 28 − 33 − 14 − 9 + 4 = 142. So 200 − 142 = <b>58</b>." },
    { q: "How many four-digit palindromes are divisible by 9?", a: 10, s: "For abba the digit sum is 2(a + b), so a + b must be 9 or 18. a + b = 9: a = 1 to 9 (9 ways). a + b = 18: 9999. Total <b>10</b>." },
    { q: "Two circles have the same centre. A chord of the larger circle has length 14 and is tangent to the smaller circle. The area of the region between the circles is kπ. What is k?", a: 49, s: "R² − r² = 7² = 49, so the area is <b>49</b>π." },
    { q: "In a class of 30 students everyone plays at least one of tennis, hockey and swimming. 18 play tennis, 15 play hockey and 12 swim. 7 play tennis and hockey, 6 play hockey and swim, and 5 play tennis and swim. How many students play exactly one of the three sports?", a: 18, s: "30 = 18 + 15 + 12 − 7 − 6 − 5 + x gives x = 3 playing all three. Tennis only: 18 − 7 − 5 + 3 = 9. Hockey only: 15 − 7 − 6 + 3 = 5. Swimming only: 12 − 6 − 5 + 3 = 4. Total <b>18</b>." },
    { q: "How many integers n satisfy |n − 5| + |n + 3| ≤ 12?", a: 13, s: "Between −3 and 5 the sum of distances is 8. Each step outside adds 2, so we may go 2 beyond each end: n from −5 to 7, which is <b>13</b> integers." },
    { q: "What is the smallest positive integer that has exactly 15 positive divisors?", a: 144, s: "15 = 15 or 5 × 3, so the shape is p¹⁴ or p⁴q². Smallest: 2⁴ × 3² = <b>144</b> (2¹⁴ is far larger)." },
    { q: "Two circles of radius 9 and 4 touch each other and both rest on a horizontal line. A third, smaller circle sits in the gap between them, touching both circles and the line. Its radius is m/n in lowest terms. What is m + n?", a: 61, s: "Two circles of radii a, b on a line touch the line at points 2√(ab) apart. So 2√(9·4) = 2√(9r) + 2√(4r), i.e. 12 = 6√r + 4√r, √r = 6/5, r = 36/25. m + n = <b>61</b>." }
  ]});

  W.mocks.push({ id: "mockB", title: "Mock Paper B", qs: [
    { q: "A regular hexagon has area 60. O is its centre and A, B are two adjacent vertices. What is the area of triangle OAB?", a: 10, s: "The hexagon splits into 6 equal triangles: <b>10</b>." },
    { q: "What is 20% of 30% of 500?", a: 30, s: "30% of 500 is 150, and 20% of 150 is <b>30</b>." },
    { q: "The sum of three consecutive integers is 72. What is the largest of them?", a: 25, s: "The middle one is 24, so the largest is <b>25</b>." },
    { q: "How many different rectangles with whole-number side lengths have area 36? (A 4 × 9 rectangle is the same as a 9 × 4 one; a square counts as a rectangle.)", a: 5, s: "1 × 36, 2 × 18, 3 × 12, 4 × 9, 6 × 6: <b>5</b>." },
    { q: "What is the sum of all the two-digit multiples of 9?", a: 585, s: "18 + 27 + … + 99 = 9(2 + 3 + … + 11) = 9 × 65 = <b>585</b>." },
    { q: "How many integers between 100 and 200 have digits that add up to 12?", a: 8, s: "The number is 1bc with b + c = 11: b can be 2 to 9. <b>8</b> numbers." },
    { q: "A water tank is one-third full. After 60 litres are added it is three-quarters full. What is the capacity of the tank in litres?", a: 144, s: "3/4 − 1/3 = 5/12 of the tank is 60 L, so the tank holds 60 × 12 ÷ 5 = <b>144</b> L." },
    { q: "What is the area of a triangle with sides 13, 13 and 10?", a: 60, s: "The height to the base 10 makes a 5-12-13 triangle. Area = ½ × 10 × 12 = <b>60</b>." },
    { q: "Between noon and midnight on the same day, how many times do the hour and minute hands of a clock make a right angle?", a: 22, s: "In 12 hours the minute hand laps the hour hand 11 times, and in each lap it is 90° ahead once and 90° behind once: <b>22</b>." },
    { q: "What is the remainder when 3<sup>100</sup> is divided by 13?", a: 3, s: "3³ = 27 = 2 × 13 + 1, so 3³ ≡ 1. Then 3⁹⁹ ≡ 1 and 3¹⁰⁰ ≡ <b>3</b>." },
    { q: "A team of 2 boys and 2 girls is to be chosen from 5 boys and 4 girls. In how many ways can this be done?", a: 60, s: "C(5, 2) × C(4, 2) = 10 × 6 = <b>60</b>." },
    { q: "A circle is drawn inside a right-angled triangle with sides 20, 21 and 29 so that it touches all three sides. What is the radius of the circle?", a: 6, s: "r = (20 + 21 − 29) ÷ 2 = <b>6</b>. (Check: area 210 = 6 × 35.)" },
    { q: "How many three-digit numbers are equal to 19 times the sum of their digits?", a: 11, s: "100a + 10b + c = 19(a + b + c) simplifies to 9a = b + 2c. a = 1: (b, c) = (1,4), (3,3), (5,2), (7,1), (9,0). a = 2: (0,9), (2,8), (4,7), (6,6), (8,5). a = 3: (9,9). a ≥ 4 needs b + 2c ≥ 36, impossible. Total <b>11</b>." },
    { q: "Pens cost $7 each and books cost $11 each. Kim spends exactly $200 on pens and books. What is the largest total number of items she could have bought?", a: 28, s: "7x + 11y = 200. Working mod 7 gives y = 1, 8 or 15, with x = 27, 16, 5. The most items is 27 + 1 = <b>28</b>." },
    { q: "How many positive integers up to 1000 are perfect squares or perfect cubes (or both)?", a: 38, s: "Squares: 31. Cubes: 10. Both (sixth powers 1, 64, 729): 3. 31 + 10 − 3 = <b>38</b>." },
    { q: "A rectangular sheet of paper measures 8 cm by 4 cm. It is folded so that two diagonally opposite corners meet exactly, making a straight crease. The crease has length √k cm. What is k?", a: 20, s: "The crease is the perpendicular bisector of the diagonal. The diagonal has length √80 and slope 1/2, so the crease has slope −2 and crosses the full 4 cm height: it runs 2 cm across and 4 cm up, length √(4 + 16) = √<b>20</b>." }
  ]});

  W.mocks.push({ id: "mockC", title: "Mock Paper C", qs: [
    { q: "What is 1 + 2 + 3 + … + 20?", a: 210, s: "20 × 21 ÷ 2 = <b>210</b>." },
    { q: "The supplement of an angle is four times the angle. How many degrees is the angle?", a: 36, s: "x + 4x = 180, so x = <b>36</b>." },
    { q: "A book costs $12 plus half of its own price. How many dollars does it cost?", a: 24, s: "p = 12 + p/2, so p/2 = 12 and p = <b>24</b>." },
    { q: "What is the smallest positive integer that is divisible by every one of 1, 2, 3, 4, 5, 6, 7 and 8?", a: 840, s: "LCM = 2³ × 3 × 5 × 7 = <b>840</b>." },
    { q: "The mean of four numbers is 15. When a fifth number is included, the mean becomes 17. What is the fifth number?", a: 25, s: "Totals 60 and 85: the fifth number is <b>25</b>." },
    { q: "How many three-digit numbers are divisible by 4 and have units digit 6?", a: 45, s: "The last two digits must be 16, 36, 56, 76 or 96 (5 choices), with 9 choices of hundreds digit: <b>45</b>." },
    { q: "One tap fills a bath in 12 minutes and a second tap fills it in 24 minutes. With the plug out, the full bath drains in 16 minutes. If both taps are on and the plug is out, how many minutes does the empty bath take to fill?", a: 16, s: "1/12 + 1/24 − 1/16 = (4 + 2 − 3)/48 = 1/16 of the bath per minute: <b>16</b> minutes." },
    { q: "A rhombus has sides of length 13 and one diagonal of length 10. What is its area?", a: 120, s: "Half-diagonals 5 and 12 (5-12-13), so the diagonals are 10 and 24. Area = ½ × 10 × 24 = <b>120</b>." },
    { q: "A car travels the first half of the distance of a trip at 40 km/h and the second half at 60 km/h. What is its average speed for the whole trip, in km/h?", a: 48, s: "Take each half as 120 km: 3 h + 2 h = 5 h for 240 km: <b>48</b> km/h." },
    { q: "What is the smallest positive integer n for which n! ends in exactly 6 zeros?", a: 25, s: "20! to 24! each end in 4 zeros. 25 contributes two factors of 5, so 25! ends in 6 zeros: n = <b>25</b>." },
    { q: "Five different books, two of which are maths books, are to be arranged in a row on a shelf so that the two maths books are <b>not</b> next to each other. In how many ways can this be done?", a: 72, s: "All arrangements: 120. Maths books together: 2 × 4! = 48. 120 − 48 = <b>72</b>." },
    { q: "A circle has radius 10. Two parallel chords of lengths 12 and 16 lie on opposite sides of the centre. What is the distance between the chords?", a: 14, s: "Distances from the centre: √(100 − 36) = 8 and √(100 − 64) = 6. Total <b>14</b>." },
    { q: "Ten people stand in a row. For each k from 1 to 10, the k-th person says: 'Exactly k of us ten are liars.' Each person is either a liar (whose statement is false) or truthful. How many of the ten are liars?", a: 9, s: "The statements contradict one another, so at most one is true. If none were true there would be 10 liars, making person 10 truthful: contradiction. So exactly one is true and there are <b>9</b> liars (person 9 is the truthful one)." },
    { q: "How many ordered pairs (x, y) of positive integers satisfy 1/x + 1/y = 1/12?", a: 15, s: "Rearranged: (x − 12)(y − 12) = 144. Both brackets must be positive (two negatives would need a product less than 144). 144 = 2⁴ × 3² has <b>15</b> divisors, each giving one ordered pair." },
    { q: "How many positive divisors of 10! are perfect squares?", a: 30, s: "10! = 2⁸ × 3⁴ × 5² × 7. A square divisor uses even exponents: 5 choices for 2, 3 for 3, 2 for 5, 1 for 7. 5 × 3 × 2 × 1 = <b>30</b>." },
    { q: "A semicircle has diameter 20. A square is drawn inside it with one side lying along the diameter and the other two corners on the arc. What is the area of the square?", a: 80, s: "Let the side be s. A top corner is s/2 across and s up from the centre: (s/2)² + s² = 100, so 5s²/4 = 100 and s² = <b>80</b>." }
  ]});
})(typeof window !== "undefined" ? window : globalThis);
