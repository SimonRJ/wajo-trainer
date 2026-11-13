/* WAJO Trainer – modules 11-14: geometry and the team paper */
(function (G) {
  var W = (G.WAJO = G.WAJO || { modules: [], mocks: [], team: [] });

  W.modules.push({
    id: "angles", title: "Angles & Polygons", icon: "📐", strand: "Geometry",
    blurb: "Angle chasing, isosceles triangles and regular polygons.",
    lesson: `
<p>WAJO diagrams are "not drawn to scale", so you can't measure. You must <b>chase angles</b>: start from what you know and push through the diagram one fact at a time.</p>
<div class="key"><b>The facts you chase with</b><ul>
<li>Angles on a straight line add to 180°. Angles round a point add to 360°.</li>
<li>Angles in a triangle add to 180°.</li>
<li><b>Exterior angle</b> of a triangle = sum of the two opposite interior angles.</li>
<li>Parallel lines: alternate angles (Z) are equal, corresponding angles (F) are equal, co-interior angles (C) add to 180°.</li>
<li><b>Isosceles triangle:</b> equal sides ⇔ equal base angles. Any time you see equal lengths, mark the equal angles.</li></ul></div>
<svg viewBox="0 0 320 130" class="fig" role="img" aria-label="Exterior angle of a triangle"><polygon points="40,110 200,110 130,25" fill="none" stroke="currentColor" stroke-width="2"/><line x1="200" y1="110" x2="290" y2="110" stroke="currentColor" stroke-width="2"/><text x="58" y="104" class="fm">a</text><text x="124" y="50" class="fm">b</text><text x="210" y="100" class="fa">a + b</text><path d="M225 110 A25 25 0 0 0 216 91" fill="none" stroke="var(--accent)" stroke-width="2"/></svg>
<div class="key"><b>Polygons with n sides</b><ul>
<li>Interior angles add to (n − 2) × 180°. <i>(Cut it into n − 2 triangles from one corner.)</i></li>
<li>Exterior angles always add to 360°. <i>(Walk round the shape: you make one full turn.)</i></li>
<li>Regular polygon: each exterior angle is 360° ÷ n, each interior angle is 180° minus that.</li></ul></div>
<div class="ex"><b>Worked example 1.</b> Each interior angle of a regular polygon is 156°. How many sides?
<p>Exterior angle = 180 − 156 = 24°. Sides = 360 ÷ 24 = <b>15</b>. Exterior angles are nearly always the fast way.</p></div>
<div class="ex"><b>Worked example 2 (isosceles chase).</b> In triangle ABC, AB = AC. D lies on AC with BD = BC = AD. Find angle A.
<p>Let angle A = x. Triangle ABD is isosceles (AD = BD), so angle ABD = x. The exterior angle BDC = x + x = 2x. Triangle BDC is isosceles (BD = BC), so angle C = 2x. Since AB = AC, angle ABC = 2x too. Triangle ABC: x + 2x + 2x = 180, so x = <b>36°</b>.</p>
<p>The technique: <b>call one angle x and write every other angle in terms of x</b>.</p></div>
<div class="tip">Clock problems: the minute hand moves 6° per minute, the hour hand 0.5° per minute. At 4:20 the hour hand is at 120 + 10 = 130°, the minute hand at 120°: they are 10° apart.</div>`,
    problems: [
      { id: "n1", d: 1, q: "What is the size, in degrees, of each interior angle of a regular polygon with 12 sides?", a: 150, h: "Find the exterior angle first.", s: "Exterior angle = 360 ÷ 12 = 30°. Interior = 180 − 30 = <b>150</b>°." },
      { id: "n2", d: 1, q: "The angles of a triangle are in the ratio 2 : 3 : 4. What is the largest angle, in degrees?", a: 80, h: "9 parts make 180°.", s: "One part is 20°, so the largest is 4 × 20 = <b>80</b>°." },
      { id: "n3", d: 1, q: "Each exterior angle of a regular polygon is 24°. How many sides does it have?", a: 15, h: "Exterior angles add to 360°.", s: "360 ÷ 24 = <b>15</b>." },
      { id: "n4", d: 4, q: "In triangle ABC, AB = AC. Point D lies on side AC so that BD = BC = AD. What is the size of angle BAC, in degrees?", a: 36, h: "Call angle A = x. Use the two smaller isosceles triangles to write the other angles in terms of x.", s: "Angle ABD = x, so exterior angle BDC = 2x, so angle C = 2x = angle ABC. Then x + 2x + 2x = 180 and x = <b>36</b>°." },
      { id: "n5", d: 2, q: "The interior angles of a polygon add up to 1980°. How many sides does it have?", a: 13, h: "(n − 2) × 180 = 1980.", s: "n − 2 = 11, so n = <b>13</b>." },
      { id: "n6", d: 3, q: "What is the size of the smaller angle, in degrees, between the hands of a clock at 3:40?", a: 130, h: "The hour hand has moved 40 minutes' worth past the 3.", s: "Hour hand: 90 + 40 × 0.5 = 110°. Minute hand: 40 × 6 = 240°. Difference = <b>130</b>°." },
      { id: "n7", d: 3, q: "A regular five-pointed star is drawn by joining the vertices of a regular pentagon with its five diagonals. What is the sum, in degrees, of the five angles at the points of the star?", a: 180, h: "Each point angle is between two diagonals from one vertex of the pentagon. Find the angle between a side and a diagonal first.", s: "The pentagon's interior angle is 108°. Each side makes 36° with the adjacent diagonal (isosceles triangle 108°, 36°, 36°), so each point is 108 − 36 − 36 = 36°. Five points: <b>180</b>°." },
      { id: "n8", d: 3, q: "ABCDE is a regular pentagon. What is the size of angle ACD, in degrees?", a: 72, h: "Triangle ABC is isosceles with apex angle 108°.", s: "Angle BCA = (180 − 108) ÷ 2 = 36°. Angle ACD = 108 − 36 = <b>72</b>°." },
      { id: "n9", d: 3, q: "ABCD is a square. An equilateral triangle ABE is drawn outside the square on side AB. What is the size of angle AED, in degrees?", a: 15, h: "Triangle ADE has AD = AE. What is angle DAE?", s: "Angle DAE = 90 + 60 = 150°. Triangle ADE is isosceles with AD = AE, so angle AED = (180 − 150) ÷ 2 = <b>15</b>°." }
    ]
  });

  W.modules.push({
    id: "area", title: "Area, Pythagoras & Similar Triangles", icon: "📏", strand: "Geometry",
    blurb: "Right triangles, scaling and area tricks.",
    lesson: `
<div class="key"><b>Pythagoras.</b> In a right-angled triangle with legs a, b and hypotenuse c: a² + b² = c².
<p>Know these whole-number triangles on sight, and their multiples:</p>
<p class="big">3-4-5 &nbsp; 5-12-13 &nbsp; 8-15-17 &nbsp; 7-24-25 &nbsp; 20-21-29 &nbsp; 9-40-41</p>
<p>So 15-20-25 and 10-24-26 are right-angled too. Spotting these replaces a page of arithmetic.</p></div>
<svg viewBox="0 0 320 140" class="fig" role="img" aria-label="Right triangle with squares idea"><polygon points="60,120 220,120 220,30" fill="none" stroke="currentColor" stroke-width="2"/><rect x="208" y="108" width="12" height="12" fill="none" stroke="currentColor"/><text x="135" y="136" class="fm">a</text><text x="228" y="80" class="fm">b</text><text x="122" y="66" class="fa">c</text></svg>
<div class="key"><b>Special triangles</b><ul><li>Half a square (45°-45°-90°): sides 1, 1, √2. The diagonal of a square is side × √2.</li>
<li>Half an equilateral triangle (30°-60°-90°): sides 1, √3, 2.</li></ul></div>
<div class="key"><b>Area tools</b><ul>
<li>Triangle: ½ × base × height. Triangles with the same base and height have the same area, whatever their shape.</li>
<li>Rhombus or kite: ½ × product of the diagonals.</li>
<li>Trapezium: average of the parallel sides × height.</li>
<li><b>Area two ways:</b> in a right triangle, ½ × leg × leg = ½ × hypotenuse × (height to hypotenuse).</li></ul></div>
<div class="key"><b>Similar triangles</b> have the same angles, so one is a scaled copy of the other. If lengths scale by k, then <b>areas scale by k²</b>.
<p>Look for them wherever there are parallel lines, or two right-angled triangles sharing an angle.</p></div>
<div class="ex"><b>Worked example 1.</b> In triangle ABC, DE is parallel to BC with D on AB, E on AC and AD : DB = 1 : 2. If the area of ABC is 90, find the area of the trapezium DBCE.
<p>Triangle ADE is similar to ABC with scale factor AD : AB = 1 : 3. So its area is 90 ÷ 9 = 10. The trapezium is 90 − 10 = <b>80</b>.</p></div>
<div class="ex"><b>Worked example 2.</b> A rectangle has perimeter 34 and diagonal 13. Find its area without finding its sides.
<p>l + w = 17 and l² + w² = 169. Then (l + w)² = l² + w² + 2lw gives 289 = 169 + 2lw, so lw = <b>60</b>.</p></div>
<div class="tip">Stuck on a geometry question? Draw an extra line: a height, a radius, or a line parallel to something. Most WAJO geometry needs exactly one helpful extra line.</div>`,
    problems: [
      { id: "m1", d: 1, q: "A right-angled triangle has legs of length 9 and 40. How long is its hypotenuse?", a: 41, h: "81 + 1600 = ?", s: "√1681 = <b>41</b>." },
      { id: "m2", d: 3, q: "What is the area of a triangle with sides 13, 14 and 15?", a: 84, h: "Drop the height onto the side of length 14. It splits the triangle into two famous right triangles.", s: "The height splits 14 into 5 and 9, giving triangles 5-12-13 and 9-12-15. Height 12: area = ½ × 14 × 12 = <b>84</b>." },
      { id: "m3", d: 2, q: "A rhombus has diagonals of length 10 and 24. What is its perimeter?", a: 52, h: "The diagonals of a rhombus cross at right angles and bisect each other.", s: "Each side is the hypotenuse of a 5-12-13 triangle. Perimeter = 4 × 13 = <b>52</b>." },
      { id: "m4", d: 1, q: "A vertical 2 m pole casts a shadow 3 m long. At the same time a tree casts a shadow 18 m long. How tall is the tree, in metres?", a: 12, h: "Similar triangles: the shadows are in ratio 1 : 6.", s: "The scale factor is 6, so the tree is 2 × 6 = <b>12</b> m." },
      { id: "m5", d: 2, q: "A square has a diagonal of length 12. What is its area?", a: 72, h: "A square is also a rhombus: area = ½ × product of diagonals.", s: "½ × 12 × 12 = <b>72</b>." },
      { id: "m6", d: 3, q: "A 25 m ladder leans against a vertical wall with its foot 7 m from the wall. The top of the ladder slips 4 m down the wall. How many metres does the foot slide outwards?", a: 8, h: "Find the height of the top before and after.", s: "Before: 7-24-25, top at 24 m. After: top at 20 m, so 15-20-25 gives foot at 15 m. It slid <b>8</b> m." },
      { id: "m7", d: 3, q: "In triangle ABC, points D on AB and E on AC are such that DE is parallel to BC and AD : DB = 2 : 3. The area of triangle ABC is 100. What is the area of trapezium DBCE?", a: 84, h: "The scale factor from ADE to ABC is AD : AB, not AD : DB.", s: "Scale factor 2/5, so area ADE = 100 × 4/25 = 16. Trapezium = 100 − 16 = <b>84</b>." },
      { id: "m8", d: 3, q: "A rectangle has perimeter 46 and a diagonal of length 17. What is its area?", a: 120, h: "Use (l + w)² = l² + w² + 2lw.", s: "l + w = 23, l² + w² = 289. 529 = 289 + 2lw, so lw = <b>120</b>." },
      { id: "m9", d: 3, q: "A regular hexagon has area 54. A triangle is formed by joining every second vertex of the hexagon. What is the area of this triangle?", a: 27, h: "Cut the hexagon into 6 equilateral triangles from the centre. Each of the three leftover corner triangles equals one of them in area.", s: "Each corner triangle cut off has two sides equal to the hexagon's side with 120° between them, which gives the same area as one of the six small equilateral triangles (one sixth of the hexagon). Three are removed, leaving half: <b>27</b>." },
      { id: "m10", d: 2, q: "A right-angled triangle has sides 15, 20 and 25. What is the length of the altitude drawn to the hypotenuse?", a: 12, h: "Calculate the area in two ways.", s: "Area = ½ × 15 × 20 = 150 = ½ × 25 × h, so h = <b>12</b>." },
      { id: "m11", d: 3, q: "A trapezium has parallel sides of length 10 and 22. Its other two sides both have length 10. What is its area?", a: 128, h: "Drop perpendiculars from the ends of the shorter parallel side.", s: "The overhang on each side is (22 − 10) ÷ 2 = 6, so the height is 8 (6-8-10). Area = 16 × 8 = <b>128</b>." }
    ]
  });

  W.modules.push({
    id: "circles", title: "Circles", icon: "⭕", strand: "Geometry",
    blurb: "Chords, tangents, touching circles and angle facts.",
    lesson: `
<p>The last question of the individual paper is often about circles touching each other. These look frightening but nearly always fall to one idea: <b>join the centres and use Pythagoras</b>.</p>
<div class="key"><b>Circle facts</b><ul>
<li>Circumference 2πr, area πr².</li>
<li>A radius drawn to the midpoint of a chord meets it at <b>90°</b>.</li>
<li>A tangent meets the radius at the point of contact at <b>90°</b>.</li>
<li>The two tangents from an outside point are equal in length.</li>
<li>When two circles touch, the line through their centres passes through the touching point. The centres are r₁ + r₂ apart (touching outside) or r₁ − r₂ apart (one inside the other).</li>
<li>The angle in a semicircle is 90°. An angle at the centre is twice the angle at the circumference on the same arc.</li>
<li>Opposite angles of a quadrilateral drawn inside a circle add to 180°.</li></ul></div>
<svg viewBox="0 0 320 170" class="fig" role="img" aria-label="Chord and radius"><circle cx="160" cy="85" r="70" fill="none" stroke="currentColor" stroke-width="2"/><line x1="104" y1="127" x2="216" y2="127" stroke="currentColor" stroke-width="2"/><line x1="160" y1="85" x2="160" y2="127" stroke="var(--accent)" stroke-width="2"/><line x1="160" y1="85" x2="216" y2="127" stroke="var(--accent)" stroke-width="2"/><rect x="160" y="117" width="10" height="10" fill="none" stroke="currentColor"/><text x="145" y="110" class="fa">d</text><text x="192" y="100" class="fa">r</text><text x="182" y="144" class="ft">half chord</text></svg>
<div class="ex"><b>Worked example 1 (chord).</b> A chord of length 16 lies in a circle of radius 10. How far is it from the centre?
<p>Half the chord is 8. Right triangle with hypotenuse 10 and leg 8: the distance is <b>6</b>.</p></div>
<div class="ex"><b>Worked example 2 (the ring).</b> A chord of the outer of two concentric circles has length 10 and just touches the inner circle. Find the area between the circles.
<p>Let the radii be <i>R</i> and <i>r</i>. The chord is tangent to the inner circle, so r, half the chord (5) and <i>R</i> form a right triangle: R² − r² = 25. The ring's area is πR² − πr² = <b>25π</b>. We never needed either radius!</p></div>
<div class="ex"><b>Worked example 3 (two circles on a line).</b> Circles of radius 9 and 4 touch each other and both sit on a straight line. How far apart are the points where they touch the line?
<p>Join the centres: length 9 + 4 = 13. Draw a horizontal line from the lower centre: this makes a right triangle with vertical side 9 − 4 = 5 and hypotenuse 13. The horizontal side is <b>12</b>.</p>
<p>In general the distance is 2√(r₁r₂). Here 2√36 = 12.</p></div>
<div class="key"><b>Incircle of a right triangle</b> with legs a, b and hypotenuse c has radius (a + b − c) ÷ 2. For any triangle, area = r × (half the perimeter).</div>`,
    problems: [
      { id: "o1", d: 2, q: "A chord of length 24 is drawn in a circle of radius 13. How far is the chord from the centre of the circle?", a: 5, h: "The perpendicular from the centre bisects the chord.", s: "Right triangle with hypotenuse 13 and leg 12: distance <b>5</b>." },
      { id: "o2", d: 2, q: "Point P is 17 units from the centre of a circle of radius 8. What is the length of a tangent from P to the circle?", a: 15, h: "The tangent meets the radius at 90°.", s: "8-15-17 right triangle: <b>15</b>." },
      { id: "o3", d: 2, q: "A, B and C lie on a circle with centre O. Angle AOB is 100°, and C lies on the larger arc AB. What is angle ACB in degrees?", a: 50, h: "Angle at the centre is twice the angle at the circumference.", s: "100 ÷ 2 = <b>50</b>°." },
      { id: "o4", d: 3, q: "Two circles have the same centre. A chord of the larger circle has length 20 and is tangent to the smaller circle. The area between the circles is kπ. What is k?", a: 100, h: "R² − r² is all you need.", s: "R² − r² = 10² = 100, so the area is <b>100</b>π." },
      { id: "o5", d: 3, q: "Circles with radii 9 and 4 touch each other externally. A straight line touches both circles, at points A and B. What is the length AB?", a: 12, h: "Join the centres (length 13) and build a right triangle with one side 9 − 4.", s: "AB² = 13² − 5² = 144, so AB = <b>12</b>." },
      { id: "o6", d: 2, q: "A square is drawn inside a circle of diameter 14 with all four corners on the circle. What is the area of the square?", a: 98, h: "The diagonal of the square is a diameter.", s: "Area = ½ × 14 × 14 = <b>98</b>." },
      { id: "o7", d: 2, q: "ABCD is a quadrilateral with all four vertices on a circle. Angle A is 75°. What is angle C in degrees?", a: 105, h: "Opposite angles of a cyclic quadrilateral.", s: "180 − 75 = <b>105</b>°." },
      { id: "o8", d: 3, q: "A circle is drawn inside a triangle with sides 8, 15 and 17, touching all three sides. What is its radius?", a: 3, h: "It's a right-angled triangle. Use r = (a + b − c) ÷ 2, or area = r × half-perimeter.", s: "(8 + 15 − 17) ÷ 2 = <b>3</b>. Check: area 60 = 3 × 20 ✓." },
      { id: "o9", d: 2, q: "AB is a diameter of a circle and has length 26. C is a point on the circle with AC = 10. What is the length BC?", a: 24, h: "What is angle ACB?", s: "Angle ACB = 90° (angle in a semicircle), so BC = √(676 − 100) = <b>24</b>." },
      { id: "o10", d: 4, q: "A quarter-circle has radius 12. A small circle fits inside it, touching both straight edges and the curved arc. Its radius can be written as a(√2 − 1). What is <i>a</i>?", a: 12, h: "The small circle's centre is at (r, r) from the corner, so r√2 from the corner. Then add r to reach the arc.", s: "r√2 + r = 12, so r = 12 ÷ (√2 + 1) = 12(√2 − 1). a = <b>12</b>." }
    ]
  });

  W.modules.push({
    id: "teamskills", title: "Team Paper & Writing Explanations", icon: "🤝", strand: "Thinking",
    blurb: "How to tackle the investigation and explain your reasoning for full marks.",
    lesson: `
<p>The team paper is completely different from the individual paper. Your team of four gets <b>one long investigation</b> on a single unfamiliar idea (past themes include look-and-say sequences, a faulty calculator, and a card game called Bulgarian Solitaire). It has many parts (A, B, C … up to about K) that build from easy to hard, and several parts ask you to <b>explain</b>.</p>
<div class="key"><b>How the parts work</b><ul>
<li>Early parts make you play with examples. They are giving you data: write the results down neatly, you will need them.</li>
<li>Middle parts ask you to spot a pattern and state a rule.</li>
<li>Late parts ask you to <b>prove</b> the rule or handle the general case.</li>
<li>Later parts usually depend on earlier answers, so a mistake in part A can sink part F. Have a second person check early parts.</li></ul></div>
<div class="key"><b>Team roles that work</b><ol>
<li><b>Reader/leader</b> reads everything first and hands out parts.</li>
<li><b>Two explorers</b> crunch the example cases in parallel.</li>
<li><b>Scribe/checker</b> writes final answers clearly on the answer sheet and checks each one.</li></ol>
<p>Talk quietly, share discoveries straight away, and never let two people silently do the same part.</p></div>
<div class="key"><b>Writing an explanation that earns full marks</b><ol>
<li><b>State the claim</b> in one sentence.</li>
<li><b>Give the reason</b>, using "because", "so", "therefore". An example is not a reason.</li>
<li><b>Cover every case.</b> If there are odd and even cases, do both.</li>
<li>Finish with the conclusion.</li></ol></div>
<div class="ex"><b>Weak answer:</b> "It always works, e.g. 3 + 5 = 8, 7 + 9 = 16."
<p><b>Strong answer:</b> "Claim: the sum of two odd numbers is even. Any odd numbers can be written 2a + 1 and 2b + 1. Their sum is 2a + 2b + 2 = 2(a + b + 1), which is a multiple of 2. So the sum is always even."</p></div>
<div class="key"><b>Three proof styles to know</b><ul>
<li><b>Algebra:</b> use letters so the argument covers every number at once.</li>
<li><b>Invariant:</b> "this quantity never changes, so we can never reach …".</li>
<li><b>It must repeat:</b> "there are only finitely many positions, so eventually one repeats, and from then on it cycles."</li></ul></div>
<div class="tip">Practise with the three investigations in the <a href="#/team">Team Round</a> section, then with real past team papers from the WAJO site. Even alone, write the explanations out in full sentences.</div>`,
    problems: [
      { id: "k1", d: 2, q: "Warm-up investigation. Take any three-digit number whose first and last digits differ, reverse it, and subtract the smaller from the larger (e.g. 732 − 237). Whatever you start with, the answer is always a multiple of which two-digit number (the largest that always works)?", a: 99, h: "Write the number as 100a + 10b + c and subtract its reverse.", s: "(100a + 10b + c) − (100c + 10b + a) = 99(a − c). Always a multiple of <b>99</b>." },
      { id: "k2", d: 3, q: "A calculator has only two buttons: one doubles the display and one subtracts 1. Starting from 1, what is the smallest number of button presses needed to display 13?", a: 6, h: "Work backwards from 13. An odd number can only have come from 'subtract 1'.", s: "Backwards: 13 is odd so it came from 14, which came from 7 (halving is quicker than coming down from 15), which came from 8, then 4, 2, 1. Forwards: 1 → 2 → 4 → 8 → 7 → 14 → 13, which is <b>6</b> presses. Checking every display reachable in 5 presses confirms 13 is not among them." },
      { id: "k3", d: 3, q: "In a game, 21 counters are on the table. Two players take turns removing 1, 2 or 3 counters. Whoever takes the last counter wins. How many counters should the first player take on the first turn to be sure of winning?", a: 1, h: "Which totals are bad to face? Start small: facing 4 counters, whatever you take, your opponent takes the rest.", s: "Multiples of 4 are losing positions to face: whatever you take (k), your opponent takes 4 − k. So take <b>1</b>, leaving 20, and then always reply to k with 4 − k." }
    ]
  });
})(typeof window !== "undefined" ? window : globalThis);
