**This document is a step-by-step guide for the technical team to package the entire Print-Flow-360 platform into Docker containers - self-contained boxes that make the software easy to deploy and run anywhere. It matters because today the platform runs on a manual bare-metal setup that is harder to reproduce, scale, or hand off; containers fix that. The guide starts by fixing a critical existing mistake before covering every service, every setting, and every known failure.**

**The main parts explained simply:**

- **The broken starting point** - The one Docker file already in the codebase is wired to the wrong database (MySQL on port 3306), but the platform actually uses PostgreSQL on port 5432. Nothing works until this is fixed. The guide lists exactly four things to correct before anything else.

- **Dockerfiles (packaging recipes)** - Each part of the platform needs its own recipe that tells Docker how to build and run it. This document provides new recipes for the Laravel API, the admin dashboard, the customer storefront, and the PDF service. Only the PDF service already has a good recipe; the rest are new.

- **docker-compose.yml (the master on/off switch)** - A single file that starts all the services together in the right order, with the right settings. The existing one is broken; this document replaces it with a corrected version that includes the database, a cache layer (Redis), a local file store (MinIO), and all the app services.

- **Environment variables (the settings sheet)** - Every service needs a list of secret keys and connection addresses. Some of these must be identical across services or things silently fail - for example, the `APP_KEY` must be the exact same value in both the Laravel API and the PDF service, or file operations return a silent error with no useful message.

- **SSR vs. browser API addresses** - The admin dashboard talks to the Laravel API in two different ways: from inside the server (using the internal container name `api:8000`) and from the user's browser (using the public web address). If only one is set correctly, the dashboard either shows a blank page on load or breaks in the browser. Both must be set.

- **Reverse proxy (the traffic director)** - A proxy sits in front of all services and sends each request to the right place. Tenant stores (each store owner's customer-facing site) use their own subdomain, and the proxy must pass the real store address through unchanged or the wrong store loads. The document shows how to set this up with either Traefik or nginx.

- **Rollout order (the safe launch sequence)** - The guide recommends bringing services up in a specific order - database first, then the API, then workers, then the frontends, then the proxy, and the PDF service last - so that each step is low-risk and the old bare-metal setup remains available as a fallback throughout.

- **Troubleshooting table** - A plain list of 17 known failure symptoms (for example: blank admin screen, 401 errors, cache not clearing, jobs never running) with the exact cause and fix for each.

**What to do with this:**

Fix the four database issues listed in Section 0 first - nothing else works until those are corrected. Then follow the rollout order in Section 7, keeping the existing bare-metal setup running until the container path is fully tested.
