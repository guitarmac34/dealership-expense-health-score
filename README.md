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
  - **Framer Motion** for animations (question transitions, animated score ring)
  - **Lucide React** for icons
  - **Tailwind CSS v4** for styling
  - **Wouter** for routing (embedded in a larger marketing site)

  ## Screens

  1. **Intro** — Stats, value prop, "Start Your Assessment" CTA
  2. **Question Flow** — One question at a time, sticky progress bar, fade/slide transitions
  3. **Results** — Animated SVG score ring, savings hero card, category breakdown table, CTA

  ## Scoring Logic

  - Questions 2–10 (9 questions) each contribute 0–10 points
  - Raw score = sum of all 9 question scores (max 90)
  - Final score = `Math.round((rawScore / 90) * 100)`
  - Savings = `benchmark.avgPerRoof × rooftopCount × answerFactor` per category

  ## Expense Categories Covered

  Credit Card Processing, Credit Bureau, Small Package Shipping, Vehicle History Reports, Uniforms & Laundry, Auto Parts (Non-OE), Shop Supplies, Office Supplies, Printed Products, Debt & Treasury Optimization, Work Opportunity Tax Credits, Property Tax Reduction, Telecom Services, Waste & Recycling, Janitorial Supplies, Mats & Carpets, and Vendor Compliance Recovery.

  ## Live Demo

  [strategicsource.com/health-score](https://strategicsource.com/health-score)

  ---

  Built by StrategicSource · © 2026