**This document is a study guide for answering "design a big system" questions in a software engineering interview. It gives you a step-by-step method to follow, then walks through ten real-world examples - like how WhatsApp, Uber, Netflix, and Stripe work under the hood - so you can practise applying the method. It matters because interviews at top tech companies almost always include one of these problems, and most people fail by jumping to answers before understanding the question.**

**The main parts explained simply:**

- **The 7-step method** - A fixed checklist to run through every time: first agree on what the system must do, then estimate how big it will be, define the rules (API), pick a data store, draw the big picture, dive deep into two or three tricky parts, and finally name what will break and why. Following this order stops you from jumping to solutions too soon.

- **Doing the maths** - Before drawing anything, you work out how many requests per second the system will get and how much data it will store. This one step tells you whether you need one server or a thousand.

- **URL shortener (like bit.ly)** - How to turn a long web address into a short one and handle millions of clicks per day without a single bottleneck.

- **Rate limiter** - A door-bouncer for APIs that counts how many requests a user has made and turns them away if they go too fast. The tricky part is making this work across many servers at once.

- **News feed (like Twitter/Instagram)** - When someone posts, do you push a copy to every follower immediately, or wait until followers ask? The right answer is: both, depending on how popular the account is.

- **Chat (like WhatsApp)** - How messages travel in real time, get stored for offline users, and arrive in the right order without duplicates.

- **Nearby drivers (like Uber)** - How to find the closest driver in under a second when millions of drivers are moving and sending location updates every few seconds.

- **File sync (like Dropbox)** - Splitting files into small chunks so only the changed part re-uploads, and handling conflicts when two devices edit the same file offline.

- **Video streaming (like YouTube/Netflix)** - Storing video in many quality levels, serving it from servers close to the viewer, and letting the player automatically switch quality based on internet speed.

- **Notifications (push/email/SMS)** - Sending alerts through many channels at scale without sending the same message twice or losing important ones.

- **Distributed cache** - A very fast memory store that sits in front of a database. The key lesson is how to split the cache across many machines without causing a crash when you add or remove one.

- **Payments** - Never double-charge. Every payment is a series of small steps recorded in a permanent log, and every retry must be safe to run again without charging twice.

- **Common mistakes to avoid** - Picking a technology before doing the maths, ignoring skew (one user or one piece of data gets far more traffic than others), and not planning for what happens when any part of the system goes down.

**What to do with this:** Memorise the 7-step checklist and practise talking through it out loud. Then pick two or three of the case studies and sketch them from memory - without looking - until you can explain the one or two most important design decisions for each and why those choices were made.
