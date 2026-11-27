# Optional package price cards

Admin > Packages > Edit or Create > Package Price Chart. Add cards, enter title/whole INR amount/unit/color/icon, toggle visibility, reorder or delete and save. Each package stores its own array in MongoDB. Existing packages without this array display no chart. Empty or fully hidden charts render no section. Selling price, departure overrides, booking and payment calculations remain unchanged. Example Manali prices from the reference are not automatically seeded; enter them in the correct package if required.

Staging checks: add four cards with distinct colors; save and reopen editor; check 2x2 public grid at phone/desktop widths; hide one, delete another, reorder and save; hide or remove all and verify the heading disappears; check another package is unaffected. Check invalid amount/title rejected and base selling price/booking remains unchanged.
