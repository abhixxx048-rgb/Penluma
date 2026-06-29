**This document checks whether your store can actually take money and turn it into a finished order — from signup, through adding a product to cart, paying, and getting it printed and shipped. The result is: the store is NOT ready to launch yet. There are four serious problems that could hurt real customers or lose real money on day one.**

**The main parts explained simply:**

- **The four must-fix problems (blockers)** — Four issues are so serious that any one of them alone would stop a launch. They are: (1) stock is never reduced when someone buys, so two customers can buy the same last item; (2) the "forgot password" link lies — it shows a success message but never sends an email, so any customer who forgets their password is permanently locked out; (3) there is a hidden backdoor code (`702702`) baked into the system that lets anyone bypass admin security; (4) when a product requires a customer to upload their artwork, that requirement is silently ignored — orders reach production with no artwork attached.

- **Signup and login** — Beyond the two blockers above, the OTP (one-time code) resend has no limit, so someone could flood an inbox. Admin password rules are also weaker than they should be.

- **Product page and pricing** — The pricing math is mostly correct, but extra charges based on the size a customer picks (for example "+$5 for A4") never actually apply — every customer pays the base price regardless of size chosen.

- **Cart** — Items stay "reserved" in the cart but stock is never actually held. If someone in another browser tab buys the last item, the cart doesn't know. Also, if a customer shops at two different stores on the same device, their carts can mix together.

- **Checkout and addresses** — Address fields (shipping, billing) are not properly checked by the server. A customer can submit blank or broken address data and the order saves it anyway. Shipping costs can silently change to $0 between the cart and the checkout summary.

- **Payments** — When a customer pays by cheque (offline), the screen wrongly shows "Payment Successful" even though no money has arrived yet. Orders paid by cheque then sit stuck forever with no reminder to the store owner. A missing configuration value (webhook secret) can cause all online card payments to get stuck in "pending" too.

- **Order confirmation email** — The email is sent before payment is confirmed, and it shows the wrong total (it leaves out shipping, tax, and any discounts).

- **Shipping and fulfillment** — This is the most incomplete part. There are no order statuses for "In Production," "Shipped," or "Fulfilled." The shipping carrier connection (EasyPost) is built but not turned on, so all orders ship at a flat rate only. Tracking numbers must be typed in by hand. Files needed to print an order can be missing with no warning.

**What to do with this:**

Fix the four blockers first — stock deduction, real password reset, remove the backdoor code, and stop dropping required artwork uploads. After those are resolved, the next most urgent step is fixing the order confirmation email (send it only after payment, and include the correct total). The fulfillment/production stage needs a dedicated build sprint before the store can handle real print orders end to end.
