**This document is a visual design review of the customer-facing online store — the pages your shoppers actually see and use. Ten reviewers looked at every major page and listed what looks unprofessional, confusing, or broken. It matters because a store that looks cheap or inconsistent loses customers before they even consider buying.**

**The main parts explained simply:**

- **Fake demo content on the homepage** — The storefront was showing made-up stats ("2,847 Orders This Week"), a fake coupon code ("WELCOME10"), and a fabricated countdown sale. Real shoppers see this and lose trust immediately. These have been turned off.

- **Buttons and colors ignoring the store's own theme** — The main button (used 352 times across the store) had its colors coded directly into it instead of reading from the store's color settings. This meant themed or branded stores looked half-styled — some parts matched the brand color, others didn't. This is the single biggest fix.

- **Inconsistent corner rounding** — Some cards had sharp corners, others had very round ones, even on the same page. This makes the store look like it was built by several different people who never talked to each other.

- **Duplicate components — the cheaper copy usually wins** — There are 4 different footer designs, 3 different loading animations, and 3 different star-rating widgets scattered across the store. Each has a polished version and a rough version; the rough one tends to be what customers see.

- **Text too small to read** — Several pages used text as small as 8–10px (very small) in a light gray color that barely passes basic readability standards. This looks cheap and is hard to read on a phone.

- **Mobile hero = black box** — On a phone screen, the top banner image showed as a completely black empty box. Customers landing on the store from a phone saw nothing useful above the fold.

- **Currency symbol hardcoded as "$"** — The mini cart, search results, and live search all showed "$" regardless of the store's actual currency setting. This breaks non-USD stores.

- **Raw order status codes shown to customers** — Instead of "In Progress," customers saw the internal code word "open." Fixes have been applied so plain-language labels ("In Progress," "Completed") now show everywhere.

- **What has already been fixed (shipped)** — The fake promo blocks, the low font size floor, the currency symbol, the plain-language order statuses, the shop-by-category tile design, and an empty product rail layout have all been corrected and verified.

**What to do with this:**

The most important next steps are to finish tokenizing the main button (so the store's brand color applies everywhere) and to do a radius consistency sweep so cards and buttons look unified. The post-purchase "thank you" and order-tracking pages are already the best-looking part of the store — use those as the visual target for every other page.
