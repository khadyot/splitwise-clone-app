# Design Aesthetics — Splitwise

Four reference screenshots live in `references/`. They are not equal weight. Read this file before generating or modifying any UI.

## Primary reference: `01-primary-reference-light-clean.png`

This is the locked visual foundation. Pull from this one first for every screen:
- Light, warm off-white/cream background. No dark mode for v1.
- Solid black pill-shaped buttons for primary CTAs (`Continue`, `Add expense`, `Create group`).
- Circular pastel-colored icon badges for expense categories (soft purple, soft blue, soft orange, soft green backgrounds with a simple icon or emoji inside). Use this pattern for category tagging on expenses.
- Card-based transaction/expense list, each row showing category icon, description, who paid, date, and amount right-aligned.
- Clean rounded sans-serif typography throughout (system font stack or Inter is fine), no display/decorative fonts.
- Rounded input fields with thin borders, not heavy card shadows.
- A status chip pattern (like "You have 5 Active Bill") is a good model for a lightweight group-switcher or active-group indicator.

## Secondary references (borrow specific ideas only, do not copy their overall visual system)

- `02-secondary-slider-interaction-dark.png` and `04-secondary-receipt-scan-blue.png`: these show a vertical draggable slider for adjusting per-person split amounts. **Do not build this for v1.** It's a real interaction pattern worth revisiting later, but v1 uses plain numeric inputs per person under an "Edit split" toggle. Do not implement dark mode or receipt scanning from these references either, both are explicitly out of scope.
- `03-secondary-join-cta-purple.png`: borrow the concept of a clear, single-purpose "Join" action as a primary UI element, not the purple gradient or onboarding illustration. Our actual front door is a join-code entry screen, not a dashboard.

## Core UI rules

1. **The join-code entry screen is the app's front door**, not a dashboard or login screen. It should feel as fast as entering a coupon code: one input for the code, one for a name, one button.
2. **Default split is always equal.** Any UI for unequal or percentage splits sits behind a secondary "Edit split" action, never on the main add-expense screen by default.
3. **Balances use color signal**: amounts the user owes in a warm red/coral tone, amounts owed to the user in a green tone, consistent with the "at a glance" balance pattern validated in the flow research.
4. **No dead visual weight.** Every icon, badge, or card must map to a real, wired feature. Do not add decorative illustrations, mascots, or onboarding carousels.
5. **Currency symbol is never hardcoded in a component.** It always comes from the group's currency setting, rendered through a shared `formatCurrency()` utility.
