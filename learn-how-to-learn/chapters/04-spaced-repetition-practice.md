# Chapter 4: Spaced Repetition in Practice: Flashcards, Anki and the Leitner Box

## Why this chapter matters

Imagine two students preparing for the same exam. Both study for ten hours. The first student, Maya, does all ten hours the night before - a single heroic, coffee-fuelled marathon. The second, Leo, does one hour a day for ten days, quizzing himself each time. They walk into the exam having spent exactly the same amount of time. Maya, drained and foggy, remembers a scattering of facts. Leo, calm and rested, remembers most of them - and he will still remember them next month, when Maya has forgotten almost everything.

That gap is not about talent. It is about *when* the studying happened. Leo used one of the two most powerful learning tools ever discovered, and it costs nothing but a little planning.

In this chapter you will learn exactly how that trick works, why it works, and - most importantly - how to *do it*. We'll build up from a simple deck of paper cards to the free software (**Anki**) that millions of students, doctors, and language learners rely on. By the end, you will be able to make your own first deck and start reviewing it this week.

Let's begin with the discovery that started it all.

---

## The oldest finding in memory science

Back in the 1880s, a German psychologist named **Hermann Ebbinghaus (1885)** ran a strange, lonely experiment: he memorised long lists of nonsense syllables (like "WID" or "ZOF") and then tested himself over and over to measure how fast he forgot them. What he found is now called the **forgetting curve** - the discovery that memory fades fast at first, then levels off. Learn something today, and without review you might lose more than half of it within days.

But Ebbinghaus found something hopeful too. Each time he *re-studied* the material, the forgetting slowed down. The curve got flatter. Memory, it turns out, is not a bucket that leaks at a fixed rate - it's more like a muscle that gets a little tougher each time you use it.

This is the **spacing effect** - the finding that you remember far more when you spread your study out over time instead of cramming it all at once. Psychologists also call spread-out study **distributed practice**, and the cram-it-all-at-once version **massed practice**.

Here is a rough picture of what the forgetting curve looks like, and what happens when you review:

```
 Memory
strength
  100% |*                           .-- review 3
       |  *                       .*'   (decays even slower)
       |    *          review 2 .*'
       |      *  review 1     .*'
       |        *  |        .*'
       |          *|_ _ _ .*'  <- each review "resets"
       |           '*.  .*'       the curve, flatter each time
       |              '*'
    0% +----------------------------------------> Time
        no review = fast forgetting (dashed floor)
```

How strong is the evidence? Extremely strong. In 2006, researchers **Cepeda, Pashler, Vul, Wixted and Rohrer** pooled together **839 comparisons from 317 experiments across 184 published articles** - one of the biggest reviews of its kind. Spaced practice beat massed practice in about **96% of the studies**. On average, spacing lifted recall from roughly **47% (crammed) to 61% (spaced)**. Same material, same effort, a huge jump - just from changing the timing.

**In short:** Memory fades on a predictable curve, but every spaced review flattens that curve, and the science backing this up is about as solid as psychology gets.

---

## Why spacing beats cramming

So why does spreading study out work so much better? A helpful way to picture it is **watering a plant**.

If you dump a whole watering can on a seedling at once, most of the water runs straight off the soil and is wasted. But if you water a little at a time, on a schedule that stretches out as the roots grow deeper, the water sinks in and the plant takes hold. Cramming is the flood; spacing is the steady watering. Your brain, like the soil, can only absorb so much at once.

There is a second, subtler reason. When you space reviews out, you give yourself time to *start* forgetting - and that turns out to be a good thing. Recalling something that has begun to slip is effortful, and that effort is exactly what tells your brain "this matters, keep it." When you cram, the answer is still sitting in the front of your mind, so recalling it is easy and teaches your brain almost nothing.

This connects to the other great memory tool, which we'll pair with spacing throughout this chapter: **retrieval practice**, also called **active recall** - the act of actively pulling an answer *out* of your memory (as with a flashcard) instead of just rereading it. Rereading feels productive but is mostly passive. Retrieval is the mental equivalent of a workout.

How much should you space things out? Cepeda's team answered this too. In a 2008 study of 1,354 people, tested over gaps as long as 105 days, they found a neat rule of thumb: **the ideal gap between reviews is about 10–20% of how long you want to remember something.** Want to remember it for a year? Review it roughly once a month. Want it for a week? Review every day or so. The longer you need the memory to last, the wider your spacing should stretch.

The most striking proof comes from **Bahrick and colleagues (1993)**, who ran a remarkable *nine-year* study of people learning Spanish vocabulary. Their headline result: **13 study sessions spaced 56 days apart produced the same long-term recall as 26 sessions spaced only 14 days apart.** Half the total work, equal memory - with recall measured one to five years later. Wider spacing was not just as good; it was twice as *efficient*.

| | Massed (cramming) | Spaced (distributed) |
|---|---|---|
| Timing | All at once | Spread over days/weeks |
| Feels like | Smooth, easy, confident | Harder, more effortful |
| Short-term result | Looks good | Also good |
| Long-term result | Forgotten fast | Sticks for months/years |
| Effort per unit remembered | High (wasteful) | Low (efficient) |
| Cepeda et al. (2006) recall | ~47% | ~61% |

**In short:** Spacing wins because it forces effortful recall and lets each review sink in - and the wider you can stretch the gaps, the more memory you get per minute spent.

---

## The Leitner Box: spaced repetition you can hold in your hand

Knowing *that* you should space reviews is one thing. Actually keeping track of *which* card to review *when* is another - and this is where a clever German journalist comes in.

In his 1972 book *So lernt man lernen* ("How to Learn to Learn"), **Sebastian Leitner** described a beautifully simple physical system now called the **Leitner box system**. You need only a stack of flashcards and a few boxes (or labelled dividers in one long box). Here's the whole idea:

- You start every new card in **Box 1**.
- **Box 1 you review every day.** Box 2 every few days. Box 3 weekly. Box 4 every two weeks. Box 5 monthly.
- When you get a card **right**, it graduates to the *next* box up (so you'll see it less often).
- When you get a card **wrong**, it falls all the way back to **Box 1** (so you'll drill it daily until it sticks).

Think of it as a **conveyor belt**. Every card you know well rides further down the line and is seen less and less. Every card you stumble on gets yanked back to the start. Over time, your hardest cards cluster in Box 1 where you drill them, and your solid cards drift into Box 5 where they just get a monthly tune-up.

```
   THE LEITNER BOX SYSTEM
   (right = move up a box; wrong = back to Box 1)

   +-------+   +-------+   +-------+   +-------+   +-------+
   | BOX 1 |-->| BOX 2 |-->| BOX 3 |-->| BOX 4 |-->| BOX 5 |
   | daily |   | ~3 dy |   | weekly|   | ~2 wk |   |monthly|
   +-------+   +-------+   +-------+   +-------+   +-------+
      ^  ^________|___________|___________|___________|
      |     a wrong answer sends the card ALL the way back
      |
   new cards
   start here
```

The genius of this is that it does the scheduling *for* you. You never have to decide what to review - the boxes decide. Cards you find hard automatically get more attention; cards you've mastered automatically get left alone. That is spaced repetition, running on nothing but cardboard.

If you want to start today with zero technology, this is the way. Grab index cards, label five boxes, and go. Many people find the physical, tactile version keeps them motivated in a way apps don't.

**In short:** The Leitner box turns spacing into a simple game - right answers move a card up the conveyor belt to be seen less often, wrong answers send it back to daily drilling - and it needs nothing but cards and boxes.

---

## Anki: the Leitner box, automated

The paper Leitner box is wonderful, but it has limits. With five boxes you only get five possible schedules, and once you have thousands of cards, shuffling paper gets clumsy. Computers can do better - and that's where our next character enters.

In the 1980s, a frustrated biochemistry student in Poznań, Poland, named **Piotr Woźniak** turned himself into a human memory experiment. He logged years of data on his own recall - exactly when he remembered things and when he forgot - and from it built a scheduling formula. In his 1990 master's thesis, "Optimization of Learning," he published this algorithm, called **SM-2**, openly and for free. That act seeded nearly every modern flashcard app, including **Anki**, the free program most learners use today.

SM-2 is really just the Leitner idea with the dial turned up. Instead of five fixed boxes, each individual card gets its *own* personalised schedule. The key piece is the **ease factor** - a per-card multiplier that decides how fast a card's review gaps grow. A brand-new card typically shows up again after **1 day, then 6 days, and after that the gap multiplies by the ease factor** (which starts at 2.5). So a card might come back after 1 day, 6 days, 15 days, 38 days, and so on, stretching further each time you get it right - exactly like Cepeda's "10–20% of the retention interval" rule, but calculated automatically for every card.

When you review a card in Anki, you don't sort it into a box. Instead you tell the app how it went by pressing one of four buttons:

- **Again** - I forgot. (Card resets to a short interval.)
- **Hard** - I got it, but it was a struggle.
- **Good** - I remembered it fine.
- **Easy** - Instant, no effort. (Card's gap jumps up a lot.)

Based on your honest answer, Anki reschedules the card and shows it to you again at just the right moment - ideally right before you'd otherwise forget it.

One more term worth knowing: a **leech** is a card you keep failing over and over. Anki automatically flags leeches (by default after 8 lapses) and can suspend them, so a few troublesome cards don't quietly eat all your review time.

A quick honest note on the algorithm. Woźniak's original schedule uses *expanding* gaps, and that feels obviously right. But **Karpicke and Roediger (2007)** found that plain, *equally-spaced* reviews actually beat expanding ones for durable, two-days-later memory. Their conclusion was reassuring: the exact *shape* of the schedule matters far less than simply spacing at all, and getting that crucial first review right. Modern Anki has since moved to a newer default scheduler called **FSRS**, which uses your personal review history to predict when you're about to forget each card, rather than relying on fixed multipliers. You do not need to understand any of this to benefit. The lesson is: don't agonise over settings. *Any* real spacing crushes cramming.

**In short:** Anki is a Leitner box with an unlimited number of custom-timed boxes - you just answer honestly, and it schedules each card for the moment you're about to forget it.

---

## Writing cards that actually work

Here is the truth that trips up almost every beginner: **spaced repetition only works as well as your cards do.** A great schedule can't rescue a badly written card. So this section may be the most practical in the whole book.

The single most important rule comes from Woźniak himself, and it's called the **minimum information principle**: put *one* fact on *one* card. Small, simple cards are fast to review, easy to remember, and easy to schedule. Big, stuffed cards - especially long lists - are what Woźniak calls memory poison, because you'll get *part* of them right and *part* wrong every time, so they never settle.

When you do need to learn a list or a sentence, use a **cloze deletion** - a fill-in-the-blank card, where you hide one word, like "The capital of France is [...]." Cloze cards are quick to make and easy to recall, and they let you break a big fact into several small, single-idea cards.

Woźniak's other golden rule is even more basic: **understand it first, then memorise it.** His rule number one is literally "Do not learn if you do not understand." Flashcards are brilliant for *facts and associations* - vocabulary, dates, formulas, definitions - but weak for *understanding, reasoning, and skills*. Memorising an orphaned fact you don't grasp is a recipe for a card you fail forever.

Here's what good and bad cards look like side by side:

| BAD card | Why it fails | GOOD card |
|---|---|---|
| Front: "France?" Back: a paragraph on French history, geography, and cuisine | Crams many facts onto one card; you can never get it fully "right" | Front: "Capital of France?" Back: "Paris" |
| Front: "List all 12 cranial nerves" | Long list = partial failure every time (memory poison) | 12 small cloze cards: "Cranial nerve I is the [...] nerve." → "olfactory" |
| Front: "What is photosynthesis?" (you don't yet understand it) | Memorising before understanding = a permanent leech | First learn the concept, *then*: "Photosynthesis converts CO₂ + water + light into glucose and [...]" → "oxygen" |
| Front: a blurry wall of text | Slow to read, easy to misjudge, boring to review | A card with a clear image or a single cloze deletion |

Two more tips. Use **images** where you can - a picture is often faster to make and easier to recall than a sentence. And always **answer honestly.** It is tempting to press "Easy" just to clear your queue faster, but that lies to the scheduler and quietly destroys the timing that makes the whole system work. If you forgot, press "Again." The system only helps you if you tell it the truth.

**In short:** One fact per card, understand before you memorise, use cloze deletions and images, and always grade yourself honestly - good cards are what make good spacing possible.

---

## Does it really work? The evidence and the honest limits

Let's step back and ask the fair question: how much does all this actually pay off in the real world?

The broadest verdict comes from **Dunlosky and colleagues (2013)**, who reviewed ten popular study techniques - highlighting, rereading, summarising, and so on. Only *two* earned their top "high utility" rating: **distributed practice** (spacing) and **practice testing** (retrieval). Those are precisely the two ingredients that spaced-repetition flashcards combine. When the leading researchers rank study methods, the exact thing you've just learned to do sits at the very top.

There's real-world data too. In medicine, students grinding for the **USMLE Step 1** board exam lean heavily on shared Anki decks - the famous "AnKing" deck, built on the *First Aid* textbook, has become almost standard. A study by **Deng, Gluckstein and Larsen (2015)** found a dose-response link: roughly **every 1,700 flashcards a student reviewed was associated with about one extra point** on their Step 1 score.

But - and this matters - be honest about what that number means. It is a *correlation*, not proof. Hard-working, motivated students are the ones who choose to grind thousands of Anki cards in the first place, so some of that score boost is really just diligence showing up. The effect is real and worth having, but it's modest and tangled with who uses the tool. Anki is a powerful lever; it is not magic that pours knowledge into your head.

And remember the limits we've already met: spaced repetition is superb for facts and associations, but it will not, by itself, teach you to *reason*, to *solve problems*, or to *do* a skill. It's the memory scaffolding underneath understanding - not a replacement for it.

**In short:** The two techniques that make up spaced-repetition flashcards are the only two rated "high utility" by Dunlosky et al. (2013), and the med-school data is genuinely encouraging - as long as you remember it's a strong aid for facts, not a magic knowledge machine.

---

## Common Mistakes

- **Cramming disguised as SRS.** Reviewing a giant batch the night before an exam defeats the entire point of spacing. *Fix:* do a small amount *every day* - the schedule only works if you show up daily.
- **Overstuffed cards.** Long lists or paragraph-length answers guarantee constant partial failures. *Fix:* one fact per card; break lists into separate cloze cards.
- **Adding too many new cards.** Piling on 500+ new cards a day builds a review "debt" that snowballs into burnout. *Fix:* start with 10–20 new cards a day and let the load stabilise before adding more.
- **Memorising before understanding.** Orphaned facts you don't grasp become permanent leeches. *Fix:* learn the concept first (Woźniak's rule #1), then make the card.
- **Gaming the buttons.** Hitting "Easy" to clear your queue faster lies to the scheduler. *Fix:* answer honestly, every time.
- **Ignoring leeches.** A handful of failing cards can devour most of your review time. *Fix:* rewrite or delete any card you've failed 8+ times.
- **Quitting after a backlog.** Miss a week, see 400 cards due, panic, and abandon the app forever - the number-one reason people give up. *Fix:* when a backlog hits, chip away at a fixed number a day; don't try to clear it in one sitting.
- **Obsessing over the "perfect" algorithm.** Fiddling endlessly with settings instead of studying. *Fix:* accept the defaults, write good cards, and just show up.

---

## Try This

1. **Build a 20-card deck this week.** Pick one thing you actually want to learn - 20 foreign words, 20 anatomy terms, 20 historical dates. Write each as a single-fact card following the minimum information principle. Paper Leitner box or Anki, your choice.
2. **Review it every day for seven days straight.** Set a fixed time - after breakfast, on the commute. The daily habit matters more than the length; even five minutes counts. Grade yourself honestly.
3. **Turn one messy card into cloze cards.** Find a card with a list or a fat paragraph on it and split it into three or four fill-in-the-blank cloze cards. Notice how much easier those small cards are to review.

---

## Key Takeaways

- The **spacing effect** - remembering more when study is spread out rather than crammed - was first documented by **Ebbinghaus (1885)** with his forgetting curve.
- **Cepeda et al. (2006)** pooled 839 comparisons and found spacing beat cramming in ~96% of studies, lifting recall from about **47% to 61%**.
- **Cepeda et al. (2008)** rule of thumb: space reviews at roughly **10–20% of how long you want to remember** - a year's memory needs monthly review.
- **Bahrick et al. (1993):** 13 sessions spaced 56 days apart matched 26 sessions spaced 14 days apart - half the work, equal long-term recall.
- The **Leitner box** (Sebastian Leitner, 1972) implements spacing physically: right answers move a card up (seen less often), wrong answers drop it back to daily Box 1.
- **Anki** automates this using **Woźniak's SM-2** algorithm (1990): cards return after 1 day, 6 days, then a gap multiplied by an **ease factor** (default 2.5).
- Write good cards: **one fact per card** (minimum information principle), use **cloze deletions** and images, understand before you memorise, and grade honestly.
- **Dunlosky et al. (2013)** rated only two of ten study techniques "high utility": distributed practice and practice testing - exactly what flashcards combine.
- Effects are real but not magic: **Deng et al. (2015)** linked ~1,700 Anki cards to +1 USMLE point, but that's a correlation, and SRS builds memory, not understanding.
