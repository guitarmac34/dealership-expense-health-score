# Dealership Expense Health Score

An interactive lead-generation assessment tool for [StrategicSource](https://strategicsource.com) — a B2B expense management company serving auto dealership groups.

## What It Does

Dealership group leaders answer **10 questions** about their expense management practices and receive:

- A personalized **Expense Health Score** (0–100)
- An **estimated annual savings number** broken down by expense category
- A category-by-category status breakdown (On Track / Needs Review / At Risk)
- A CTA to schedule a free Spend Strategy Review

All benchmark data is real — derived from **2,184 sourcing projects** across **226 dealership groups** over 13 months.

## Tech Stack

- **React 18** with TypeScript
- **Vite** — library-mode build for embeddable IIFE bundle
- **Framer Motion** for animations (question transitions, animated score ring)
- **Lucide React** for icons
- **Tailwind CSS v3** with `ss-` prefix for CSS isolation
- **Shadow DOM** for style encapsulation when embedded in WordPress

## Architecture

```
WordPress Page                     Vercel
┌──────────────────────┐          ┌──────────────────────────┐
│ <div id="ss-health-  │          │ React SPA                │
│   score"></div>       │          │ /dist/embed.iife.js      │
│ <script src="...     │ ───────► │                          │
│   /embed.iife.js">   │          │ /api/submit-contact.ts   │
│ </script>            │          │   (serverless function)  │
└──────────────────────┘          └──────────┬───────────────┘
                                             │ POST (server-side)
                                             ▼
                                  ┌──────────────────────┐
                                  │ HubSpot Contacts API │
                                  └──────────────────────┘
```

## Embed in WordPress

Add a **Custom HTML** block to any WordPress page with:

```html
<div id="ss-health-score"></div>
<script src="https://your-vercel-domain.vercel.app/dist/embed.iife.js" async></script>
```

Optional: set a custom CTA URL via data attribute:

```html
<div id="ss-health-score" data-cta-url="https://strategicsource.com/contact"></div>
```

## Screens

1. **Intro** — Stats, value prop, "Start Your Assessment" CTA
2. **Question Flow** — One question at a time, sticky progress bar, fade/slide transitions
3. **Contact Gate** — Lead capture form (name, email, company, phone) before results
4. **Results** — Animated SVG score ring, savings hero card, category breakdown table, CTA

## Scoring Logic

- Questions 2–10 (9 questions) each contribute 0–10 points
- Raw score = sum of all 9 question scores (max 90)
- Final score = `Math.round((rawScore / 90) * 100)`
- Savings = `benchmark.avgPerRoof × rooftopCount × answerFactor` per category

## Updating Questions

Edit `src/config/questions.json` and push to `main`. Vercel auto-deploys — no WordPress changes needed.

## HubSpot Setup

1. Create a [HubSpot Private App](https://developers.hubspot.com/docs/api/private-apps) with `crm.objects.contacts.write` and `crm.objects.contacts.read` scopes.
2. Create custom contact properties in HubSpot:
   - `health_score` (number)
   - `estimated_annual_savings` (number)
   - `rooftop_count` (number)
   - `health_score_grade` (single-line text)
   - `lead_source` (single-line text)
3. Add the private app token as a Vercel environment variable: `HUBSPOT_PRIVATE_APP_TOKEN`

## Development

```bash
npm install
npm run dev      # Start dev server at localhost:5173
npm run build    # Build embed.iife.js to dist/
```

## Expense Categories Covered

Credit Card Processing, Credit Bureau, Small Package Shipping, Vehicle History Reports, Uniforms & Laundry, Auto Parts (Non-OE), Shop Supplies, Office Supplies, Printed Products, Debt & Treasury Optimization, Work Opportunity Tax Credits, Property Tax Reduction, Telecom Services, Waste & Recycling, Janitorial Supplies, Mats & Carpets, and Vendor Compliance Recovery.

---

Built by StrategicSource · 2026
