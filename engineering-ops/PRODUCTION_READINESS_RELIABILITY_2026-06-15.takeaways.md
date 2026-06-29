**This document is an honest check-up of the platform's safety net — what happens if something goes wrong. Right now, if the database server crashes or a file gets lost, there is no way to get the data back. This matters because print jobs are physical: a lost order means a real customer gets the wrong product, or nothing at all, after they already paid.**

**The main parts explained simply:**

- **No database backups** — If the database were deleted or corrupted today, every tenant's orders, customers, payments, and products would be gone forever. There is nothing in place to recover them. This is the most urgent problem in the whole document.

- **Background jobs run inside the web request (sync mode)** — When the server processes a paid order, it also does extra work (like generating a PDF or sending an email) right then and there. If anything goes wrong mid-way, that work is lost silently — even if the customer already paid. Jobs should run separately in the background with automatic retries.

- **Print files can go missing without warning** — When a customer downloads their order files, if a print-ready PDF is missing, the system quietly skips it and sends the download anyway. The customer gets an incomplete ZIP, and the print job can start with no production file — with no alert to staff.

- **Most errors are invisible** — Only the PDF service has proper error tracking. If the main website or the design tool crashes, nobody finds out. Problems go unnoticed until a customer complains.

- **No Redis / job queue** — Redis is a fast memory store that holds background jobs safely. It is not set up, so there is no retry system, no job history, and no way to recover work that failed.

- **No health monitoring or uptime checks** — There is nothing watching the platform from the outside to alert staff if the site goes down, a scheduled task silently stops, or backups fail.

- **Dev settings running in production** — The environment is still configured for development (debug mode on, real payment credentials mixed in). This increases exposure if something goes wrong.

- **No disaster recovery plan** — There is no written, tested runbook for what to do when something breaks. A backup that has never been tested is not a real backup.

**What to do with this:**

Set up automatic database backups first — this is the single change that prevents permanent data loss. Then switch background jobs to run asynchronously (with Redis and a queue manager) so paid-order work is never lost silently. Everything else in the document builds on those two foundations.
