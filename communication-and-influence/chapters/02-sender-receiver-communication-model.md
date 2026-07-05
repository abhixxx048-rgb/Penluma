# 2. How Communication Actually Works: The Sender–Receiver Model

Every time you send an email, run a meeting, or ask your manager for a raise, you are running a small machine with moving parts. Most people never see those parts - they just feel it when the machine breaks and a message lands wrong. This chapter opens up that machine. Once you can see the parts, you can spot exactly where communication is failing and fix that one part, instead of vaguely trying to "communicate better."

## 2.1 The Classic Model: Sender, Message, Channel, Receiver

In 1948, a mathematician named Claude Shannon, working with Warren Weaver, built a model to explain how information travels from one point to another. They were originally solving a phone-line engineering problem, but their model turned out to describe human conversation so well that it became the foundation of modern communication theory. It is sometimes called **the "mother of all models"** because almost every communication framework you'll ever encounter is a descendant of it.

Here is the core idea, translated into plain, everyday language:

- **Sender** - The person (or team, or company) who has an idea and wants to share it. In a work example: you, wanting to tell your team the project deadline moved up.
- **Encoding** - Turning that idea, which lives only in your head as a fuzzy thought, into words, tone, gestures, or images that another person can actually receive. You "encode" your thought into a sentence like: "Heads up - the client moved the deadline to Friday."
- **Message** - The actual content that travels - the words you chose, the slide you built, the voicemail you left.
- **Channel** - The medium the message travels through: face-to-face, a phone call, a video call, a chat message, an email, a printed memo.
- **Decoding** - The receiver translating your words back into an idea inside their own head. This is where their assumptions, mood, and background knowledge get involved.
- **Receiver** - The person who gets the message and makes meaning out of it.
- **Feedback** - The receiver's response, which flows back to the sender - a nod, a reply email, a confused look, a follow-up question.
- **Noise** - Anything that distorts the message on its way from sender to receiver. More on this below - it's the part almost everyone underestimates.

Notice something important: the idea in your head and the idea that lands in the other person's head are *never the exact same thing*. Communication is not a courier service that delivers a sealed box unchanged. It is more like a translation relay - your thought gets converted into symbols (words), those symbols travel through a channel, and then the receiver reconstructs their own version of your thought from those symbols. If any step in that chain is weak, what arrives is a distorted copy of what you meant.

```
  SENDER                                        RECEIVER
 (has an idea)                              (builds their own idea)
     |                                              ^
     v                                              |
 [ENCODING]  --message-->  [CHANNEL]  --->  [DECODING]
   turns idea    (words,    (email,          rebuilds
   into words     tone,      call,           meaning from
   /tone/visuals) images)    face-to-face)    the message
     |                          ^                   |
     |                          |                   |
     +------ NOISE can distort at every step -------+
                                |
                           **Analogy:** Think of sending a message like mailing a flat-pack furniture kit instead of the finished chair. You (the sender) disassemble your idea into parts (words) and pack instructions (tone, structure). The receiver has to assemble it themselves using your instructions, their own tools (background knowledge), and their own patience level (mood, time pressure). If the instructions are unclear or a part is missing, they build something different from what you had in your garage.

Example: A product manager says in a status meeting, "We're deprioritizing the mobile fix for now." She means: "It's still important, just not this sprint, because the payment bug is more urgent." The engineer decodes it as: "Mobile doesn't matter anymore." Same message, two very different reconstructed ideas - because the decoding step filled in gaps with the engineer's own assumptions.

This model matters because it gives you a diagnostic checklist. When a message goes wrong, you can ask: Was the idea unclear even to the sender? Was it poorly encoded (bad word choice)? Was the wrong channel used? Was there noise in transit? Did the receiver decode it through a biased lens? Was there no feedback loop to catch the error early? Instead of one vague complaint ("we have a communication problem"), you get six specific, fixable checkpoints.

> **Key takeaway:** Communication is a multi-step relay - idea, encoding, message, channel, decoding, meaning, feedback - and a breakdown can happen at any single step, so fixing "communication" means finding which step actually broke.

> **Section summary:** The sender–receiver model breaks communication into simple steps: you turn a thought into words (encoding), send it through some channel, and the other person turns those words back into a thought (decoding), then responds (feedback). Nothing is copied perfectly - every step can distort the message a little, which is exactly why good communicators check their work instead of assuming they were understood.

## 2.2 Noise: The Three Kinds of Static That Wreck a Message

Shannon and Weaver used the word **noise** for anything that interferes with a message getting through cleanly. In their original engineering context, noise meant literal static on a phone line. In human communication, researchers have expanded this into three distinct categories. Learning to name them is one of the fastest ways to get better at diagnosing miscommunication in real time.

### Physical noise

This is interference in the outside, physical environment. It is the easiest to spot because you can usually hear or see it.

> **Example:** You're presenting on a video call and your microphone keeps cutting out, or a jackhammer is running outside the conference room, or the Wi-Fi lags and half your sentence gets clipped. The audience missed words purely because of environmental interference - not because your ideas were bad.

### Psychological noise

This is interference happening *inside* a person's head, caused by their internal state rather than the outside world: stress, anxiety, distraction, boredom, anger, preconceptions, or bias.

> **Example:** Your manager is reading your performance update right after a tense call with their own boss. They're not fully present. They skim, miss your caveat about a delay, and later act surprised - even though it was in the email. Their internal stress state acted as noise, even though the message itself was clear.

### Semantic noise

This is interference caused by the meaning of the words themselves - jargon, ambiguity, unfamiliar vocabulary, or acronyms that mean different things to different people. Semantic ("relating to meaning") noise happens even when both people are calm, attentive, and in a quiet room, because the mismatch is in the language, not the environment or the mindset.

> **Example:** A finance lead tells a new hire, "We need to true this up before EOD, or the run-rate numbers will be off." Three technical terms in one sentence ("true up," "EOD," "run-rate") that the new hire quietly nods along to without understanding. No stress, no distraction - just a vocabulary gap acting as noise.

| Type of noise | Where it comes from | Workplace example |
| --- | --- | --- |
| Physical | The outside environment | Bad phone signal, loud office, a slide that's too small to read from the back of the room |
| Psychological | Inside the receiver's (or sender's) mind | Distraction, stress, defensiveness, assuming you already know what's coming |
| Semantic | The words and symbols themselves | Jargon, acronyms, vague pronouns ("they said it's fine" - who is "they"?) |

> **Best practice:** Before an important conversation, do a fast three-question noise check: Is the environment quiet enough (physical)? Is the other person in the right headspace right now, or should this wait (psychological)? Am I using words this specific person will understand (semantic)? Skilled communicators run this check automatically, almost without noticing.

> **Common mistake:** Treating every miscommunication as a semantic problem - "I just need to explain it better" - when the real issue is psychological (the person is overwhelmed and not absorbing anything right now) or physical (they're on a spotty train Wi-Fi and missed half the call). Rewriting your message won't fix a bad signal or a distracted mind.

> **Section summary:** Noise is anything that garbles a message, and it comes in three flavors: physical (environment), psychological (state of mind), and semantic (confusing words). Before blaming your wording, check whether the real problem is actually the room, the person's mood, or the moment - because each type of noise needs a completely different fix.

## 2.3 The Curse of Knowledge: Why Experts Are Bad at Explaining Things

Once you know something well, it becomes almost impossible to imagine *not* knowing it. This effect is called the **curse of knowledge** - a term popularized by brothers Chip and Dan Heath in their book *Made to Stick*, building on earlier academic research into why experts struggle to teach beginners.

The Heaths illustrate it with a now-famous experiment from Stanford. One person (the "tapper") is given a well-known song and asked to tap its rhythm on a table. Another person (the "listener") has to guess the song from the tapping alone. Tappers predicted listeners would guess correctly about 50% of the time. In reality, listeners guessed correctly only about **2.5% of the time** - roughly 1 in 40. Why such a huge gap? Because while the tapper taps, they can't help but "hear" the full song, complete with melody and lyrics, in their own head. To the listener, it's just a series of disconnected knocks. The tapper's own knowledge made it almost impossible for them to imagine what the message sounded like without that knowledge already in place.

> **Analogy:** The curse of knowledge is like trying to remember what it felt like to not know how to ride a bike, once you can ride one perfectly. You can't "un-know" the balance and the muscle memory, so when you try to teach a child, you say things like "just find your balance" - advice that means nothing to someone who has never felt it.

> **Example:** A senior engineer tells a junior teammate, "Just spin up a container and mount the volume, should take two minutes." To the senior engineer, this genuinely feels like two minutes of work - they've done it hundreds of times. To the junior teammate, three unfamiliar concepts just flew by, and what should be a quick task turns into an hour of quiet, embarrassed struggling because they're afraid to ask what "mount the volume" even means.

This is exactly why executives, doctors, engineers, and lawyers are often the *worst* people to explain their own field to a general audience - not because they don't understand it, but because they understand it too well to remember what confusion feels like. Harvard Business Review has written about this pattern in leadership: strategies described in abstract, expert-level language ("we're pivoting to a platform-led growth model") fail to drive action because frontline employees don't share the years of context that made the phrase feel obvious to the executive who coined it.

The fix is not to "dumb things down" - that phrase itself is a little insulting and misses the point. The fix is to deliberately rebuild the bridge of context that you, the expert, no longer notice you're missing for the other person.

> **Best practice:** Before explaining something you know well, ask yourself: "What did I believe about this topic before I learned what I now know?" Then start there, not at your current level of understanding. Concrete examples, analogies, and stories work better than abstract summaries precisely because they don't require the listener to already share your mental shortcuts.

> **Common mistake:** Assuming silence or a nod means understanding. People often nod along to avoid looking slow, especially with a manager, senior colleague, or a client they want to impress. Nodding is not feedback that closes the loop - a specific question or a paraphrase back is.

> **Section summary:** The curse of knowledge means that the better you understand something, the harder it becomes to explain it simply, because you forget what it's like not to know it. Fight this by explaining from the listener's starting point, using concrete examples and stories instead of expert shorthand, and by checking understanding directly instead of trusting a nod.

## 2.4 One-Way vs. Two-Way Communication: Why the Feedback Loop Is Everything

Look back at the diagram from earlier. Notice the arrow labeled **feedback** running back from the receiver to the sender. That arrow is not decoration - it's the single feature that separates communication that actually works from communication that just feels like it works.

- **One-way communication** - A message travels from sender to receiver with no return path. The sender has no way of knowing whether it landed correctly. Example: a company-wide memo posted with no way to ask questions, or a lecture with no Q&A.
- **Two-way communication** - A message travels from sender to receiver, and the receiver's reaction - a question, a paraphrase, a confused pause - travels back to the sender, who can then adjust. Example: a manager explains a new process and asks, "Can you walk me through how you'd handle the first ticket that comes in?"

One-way communication is faster and easier for the sender. That is exactly why it's overused: emailing an entire team is quicker than checking each person understood. But speed for the sender is not the same as accuracy for the receiver. Without feedback, a sender has no way to detect that "true this up before EOD" landed as confusion, not clarity, until the mistake shows up days later as a missed deadline or a wrong deliverable.

> **Example:** A CEO records a five-minute video announcing a company reorganization and sends it out with no live Q&A and no channel for questions. Employees privately reinterpret ambiguous lines ("some roles will evolve") as "layoffs are coming," and rumors spread faster than any follow-up correction can travel. The lack of a feedback loop didn't just fail to help - it actively let a wrong meaning multiply unchecked.

Feedback loops matter because they let you catch a decoding error while it's still small and cheap to fix, instead of after it has turned into a missed deadline, a wasted week of work, or a damaged relationship. This is why skilled communicators build feedback into the message itself, rather than hoping it happens naturally.

> **Best practice:** End important messages with a feedback prompt that requires more than a yes/no answer. Instead of "Does that make sense?" (which almost always gets a reflexive "yes"), ask "What's your plan for the first step?" or "Can you tell me back what you heard, in your own words?" This forces real decoding to surface, so you can catch a misunderstanding immediately instead of a week later.

> **Common mistake:** Confusing "I sent it" with "I communicated it." A sent email, a posted Slack message, or a slide deck emailed after a meeting is a one-way transmission until someone confirms what they understood. Many workplace conflicts trace back to one person saying "I told you" and the other saying "I never understood that," and both are telling the truth - the message was sent, but never actually completed the loop.

> **Section summary:** One-way communication sends a message with no way to check it landed correctly; two-way communication adds a feedback loop so the sender can catch and fix misunderstandings early. Because sending a message is not the same as being understood, strong communicators deliberately build in a moment for the other person to react, question, or repeat back what they heard.

## 2.5 Choosing the Right Channel: Richness and Fit

The **channel** is the medium your message travels through - face-to-face, video call, phone call, live chat, or email. Organizational researchers Richard Daft and Robert Lengel developed **media richness theory** in the 1980s to explain why the same message can succeed in one channel and completely fail in another. Their core idea: channels differ in how much information they can carry beyond the bare words, and the right channel depends on how complex or emotionally loaded the message is.

A "rich" channel carries many extra signals at once: tone of voice, facial expression, pacing, body language, and instant back-and-forth feedback. A "lean" channel strips most of that away, leaving mostly bare text.

```
   LEANER                                            RICHER
     |                                                   |
  Posted memo      Email/chat      Phone call      Video call     In-person
  (no feedback,    (text only,    (tone, pace,    (tone + face,  (tone, face,
   no tone)         delayed)       fast feedback)  near real-time) body language,
                                                                    instant feedback)
```

The theory's practical rule: **match the channel's richness to the message's complexity and emotional weight.** A simple, unambiguous fact ("the meeting moved to 3pm") is fine over chat - a lean channel is efficient and doesn't waste anyone's time. A complex, ambiguous, or emotionally sensitive message (a layoff, a tough piece of feedback, a negotiation, resolving a conflict between teammates) needs a richer channel, because it benefits from tone, facial cues, and immediate feedback to prevent misreading.

| Situation | Best-fit channel | Why |
| --- | --- | --- |
| Confirming a meeting time | Chat or email | Simple, unambiguous fact; speed matters more than richness |
| Giving critical performance feedback | In-person or video call | High emotional stakes; tone and facial cues prevent it from reading as harsher (or softer) than intended |
| Negotiating a contract detail | Phone or video call | Ambiguous, back-and-forth; needs fast feedback to avoid stalemate over text |
| Announcing a policy to 500 people | Written memo + live Q&A session | Needs a permanent, precise written record, plus a rich channel for questions |

> **Example:** A manager needs to tell a direct report their project was cancelled due to budget cuts. Sent as a two-line email, the message reads as cold and dismissive, even if that wasn't the intent - there's no tone to soften it, and no room for the employee to ask "what does this mean for me?" in real time. Delivered on a short call instead, the same news comes with a calmer tone, a chance to answer the employee's immediate worry about their role, and a visible sense that the manager isn't hiding behind text.

> **Best practice:** Before you hit send or pick up the phone, ask two questions: "How ambiguous or emotionally loaded is this message?" and "How much feedback will I need in real time to get it right?" The higher the answer to either, the richer your channel should be. Recent workplace research has also found nuance here: people often prefer email for reducing simple uncertainty (getting a fact confirmed) but still reach for face-to-face or video when a situation is genuinely equivocal - that is, when the meaning itself is unclear or contested, not just the facts.

> **Common mistake:** Defaulting to email or chat for everything because it's convenient for the sender, even for messages that are sensitive, ambiguous, or likely to be misread. Convenience for you is not the same as clarity for them - and a lean channel used on a rich-message situation is one of the most common causes of workplace conflict that "shouldn't have happened."

> **Section summary:** Channels range from lean (text, memos) to rich (in-person, video), based on how much tone, feedback, and nuance they carry alongside the words. Simple, factual messages work fine in lean channels, but anything complex, ambiguous, or emotionally sensitive needs a richer channel - choosing the wrong one is a common, avoidable cause of miscommunication.
