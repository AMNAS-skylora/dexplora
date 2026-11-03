# Dexplora — Individual Traveller Billing / Complimentary Services

## Admin screens

- **New bookings:** Admin → Upcoming Trips → Manage Event → Add Traveller. Choose a billing mode, optionally waive an included ticket, add AC upgrades or other charge lines and enter the advance received. These initial settings are applied **per traveller** in the new booking.
- **Existing bookings and individual differences:** Admin → Upcoming Trips → Manage Event → Open Customer → **Traveller Billing & Free Services**. Each traveller has a separate named row. Edit the mode, ticket class, included ticket value, custom package amount, free reason and any extra charges, then press **Save Traveller Billing**.

## Billing modes per traveller

| Mode | Base package charge | Extras |
| --- | --- | --- |
| Regular | Original price snapshot | Charged unless individually marked Free |
| Fully Complimentary | ₹0 | ₹0 |
| Package Free | ₹0 | Charged unless individually marked Free |
| Included Sleeper Ticket Free | Base package price minus the explicitly entered included ticket value | Charged unless individually marked Free |
| Custom Package Amount | Admin-entered base charge | Charged unless individually marked Free |

**Do not subtract the included ticket if it is not part of the base price.** A separately added ticket can instead be entered as an additional `TICKET` service and individually marked **Free**.

## Example: ₹14,000 sleeper-inclusive package

- Regular sleeper = ₹14,000.
- AC upgrade difference ₹2,000 (additional charge) = ₹16,000.
- Package complimentary, AC upgrade ₹2,000 payable = ₹2,000.
- Full complimentary with AC upgrade = ₹0.
- Included sleeper ticket complimentary (ticket value ₹1,000) plus AC upgrade ₹2,000 = ₹15,000.
- Custom base ₹12,000 plus visa ₹1,500 = ₹13,500.

Charges belong to individual travellers. Booking total = sum of all traveller package charges plus chargeable extras. Staff-entered supplier/operating ticket cost is **not** treated as the traveller's sale price.

## Existing payments and historical bookings

Payment records are not erased or rewritten when a discount is applied. If prior payments exceed the new total, the excess is stored as `creditAmount` and displayed as **Refund/Credit reconciliation required**. This is a bookkeeping indicator, **not an automatic refund**. An administrator must handle actual refunds through the payment channel.

The initial package rate is saved per traveller at booking creation. Changing a departure's public rate later does not retroactively change historical customer bills. A past booking without new billing rows is loaded with an existing-price-compatible default, including previously free bookings.

Customer totals, balance and payment status are saved in MongoDB with `billingRows`. The admin billing action writes a separate `TravellerBillingAudit` record showing the before and after values.

## Important scope and limitations

- User permissions: individual billing adjustments require ADMIN or SUPER_ADMIN.
- New booking form presets apply to everyone in that booking; individual variations are edited on the customer page after creation.
- An admin-created enquiry is not a confirmed booking and does not consume seats.
- Live production deployment and real-MongoDB end-to-end checks are separate from GitHub commits. Check Vercel build limits and deployment status before calling this fully live.
- Refund processing, supplier ticket expenses and automatic payment collection require separate reconciliation workflows.
