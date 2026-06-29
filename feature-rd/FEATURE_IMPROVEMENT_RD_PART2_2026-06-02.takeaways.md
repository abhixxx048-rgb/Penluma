**This document is a deep check-up of 13 features already built into the platform. The research team read the real code, found the problems, and ranked them by how much harm they cause. The goal is not to add new things - it is to fix what is already there so it actually works the way a store owner expects.**

**The main parts explained simply:**

- **Three confirmed bugs** - Three serious problems were checked by hand and proven real. (1) When you click "Mark as Paid" on an invoice, the system flips the label to Paid but records no actual payment, so the balance still shows as owed in red. (2) The entire Packaging product type - boxes, envelopes, dielines - is built and working but impossible to reach because it is missing from the product-type dropdown. (3) Editing a customer's phone number can accidentally overwrite important internal data like their account number or status without any warning.

- **Silent lies (the biggest problem)** - The screen says "Saved" or "Paid" but the real information was quietly dropped or ignored. This shows up across invoices, inventory, checkout totals, notifications, and automation rules. The fix already exists in the code - it just needs to be connected correctly.

- **Features built but unreachable** - Working code that an owner can never get to because one small wiring step is missing. Adding about six lines of code unlocks the entire Packaging feature. The 3D product viewer is also dead code that no page even loads.

- **Two different numbers for the same fact** - The stock number a store owner edits is not the same number the checkout system checks. The cart total and the checkout total are calculated separately, which is why a customer can see a price jump between cart and payment.

- **Missing "loading / empty / error" states** - When something goes wrong, several screens show nothing at all or show a green "all clear" message. An empty screen looks like a bug; an error that looks like "no data" is misleading and erodes trust.

- **Raw technical labels shown to store owners** - Inventory shows "add/deduct" codes. Imposition shows UUIDs as press-sheet names. Automation uses `[bracket]` tokens that silently break if mistyped. These need plain words and guided pickers instead.

- **Dangerous actions with no warning** - Approving a proof, marking an invoice paid, or deleting a role happens with one tap and no explanation of what will change. The fix is a plain-language confirmation that spells out exactly what is at stake.

- **Dead ends when a setting is not configured** - When a payment gateway or shipping method is not set up, several features just silently disable with no explanation. Owners need a plain message explaining what is missing and a direct link to where they can fix it.

- **4-wave fix roadmap** - Fixes are grouped into four rounds. Round 1 stops the most harmful silent-lie bugs (invoice payment, checkout total, notification rollback). Round 2 unlocks the dead features and adds missing error states. Round 3 unifies duplicate data sources. Round 4 handles the larger rebuilds like a single shared shipping calculation.

**What to do with this:**

Fix the invoice "Mark as Paid" bug first - it directly touches money and trust. Then add the six lines that unlock the Packaging product type, since it is the cheapest high-impact change on the platform.
