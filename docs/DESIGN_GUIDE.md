# StrategicSource — Canva Design Guide

Use these instructions to create Canva designs (social posts, presentations, PDFs, ads, email headers) that match the StrategicSource website exactly. Hand this document to Claude, a designer, or use it as a reference when building in Canva.

---

## Brand Colors

### Primary Palette

| Role | Hex | RGB | When to Use |
|------|-----|-----|-------------|
| **Navy** (Primary) | `#1C3F8E` | 28, 63, 142 | Headlines, section backgrounds, primary buttons, header/footer bars |
| **Navy Dark** | `#0A0D14` | 10, 13, 20 | Footer background, very dark overlays |
| **Copper/Orange** (Secondary) | `#D67C1F` | 214, 124, 31 | CTA buttons, accent highlights, badges, hover states, links |
| **White** | `#FFFFFF` | 255, 255, 255 | Card surfaces, text on dark backgrounds, button text |
| **Off-White/Light BG** | `#FAFBFC` | 250, 251, 252 | Page backgrounds, section alternating backgrounds |

### Supporting Colors

| Role | Hex | When to Use |
|------|-----|-------------|
| **Body Text** | `#1A2744` | Primary body text on light backgrounds |
| **Muted Text** | `#6B7280` | Secondary text, descriptions, subheadings on light backgrounds |
| **Border/Divider** | `#E5E8EB` | Card borders, section dividers, subtle separators |
| **Light Muted BG** | `#F0F2F5` | Alternating section backgrounds, input fields, subtle card backgrounds |
| **Red (Destructive)** | `#EF4444` | Warning elements, "At Risk" badges, failure/stakes messaging, loss stats |
| **Green (Success)** | `#27AE60` | Savings amounts, "On Track" badges, positive stats |
| **Yellow (Caution)** | `#F39C12` | "Needs Review" badges, medium-risk indicators |

### Color Usage Rules
- Navy backgrounds always use white text
- Copper/Orange is ONLY for CTAs, accents, and interactive highlights — never for large background areas
- The site alternates between white (`#FFFFFF`) and off-white (`#FAFBFC` or `#F0F2F5`) section backgrounds to create visual rhythm
- Red is reserved for failure-oriented messaging (stakes, warnings, cost of inaction)
- Never put navy text on a copper background or copper text on navy — always use white text on both

---

## Typography

### Font Families

| Role | Font | Google Fonts Link |
|------|------|-------------------|
| **Headings** | Plus Jakarta Sans | `Plus+Jakarta+Sans:wght@400;500;600;700;800` |
| **Body Text** | Inter | `Inter:wght@400;500;600` |

In Canva, search for "Plus Jakarta Sans" for headings and "Inter" for body. If Plus Jakarta Sans is not available, use **Poppins** or **DM Sans** as the closest substitute.

### Type Scale

| Element | Font | Weight | Size (Desktop) | Size (Mobile) | Color |
|---------|------|--------|-----------------|---------------|-------|
| **H1 (Hero headline)** | Plus Jakarta Sans | 800 (ExtraBold) | 64–72px | 40–48px | Navy `#1A2744` |
| **H2 (Section headline)** | Plus Jakarta Sans | 800 (ExtraBold) | 40–48px | 32–36px | Navy `#1C3F8E` |
| **H3 (Card/subsection title)** | Plus Jakarta Sans | 700 (Bold) | 24–28px | 20–22px | Navy `#1A2744` |
| **Body Large** | Inter | 400 (Regular) | 18–20px | 16–18px | Muted `#6B7280` |
| **Body Regular** | Inter | 400 (Regular) | 16px | 14–16px | Body `#1A2744` |
| **Body Small/Caption** | Inter | 500 (Medium) | 14px | 12–13px | Muted `#6B7280` |
| **Badge/Label** | Inter | 700 (Bold) | 12–13px | 11–12px | Varies (uppercase, letter-spacing 1–2px) |
| **Stat Number** | Plus Jakarta Sans | 800 (ExtraBold) | 36–52px | 28–36px | Copper `#D67C1F` or White |
| **Stat Label** | Inter | 500 (Medium) | 14px | 12px | Muted or White/60% |

### Typography Rules
- Headings are always **Plus Jakarta Sans**, always **ExtraBold (800)** or **Bold (700)**
- Body text is always **Inter**, always **Regular (400)** or **Medium (500)**
- Headlines use tight letter-spacing (tracking-tight, approx. -0.02em)
- Line height for headings: 1.1–1.15
- Line height for body: 1.6–1.7
- Use `text-balance` (balanced line wrapping) for headlines and subheads — avoid widows
- Badges and labels are UPPERCASE with wide letter-spacing (2–3px)

---

## Layout & Spacing

### Grid
- Max content width: **1200px** centered
- Side padding: **24px** mobile, **48px** tablet, **64–96px** desktop
- Section vertical padding: **128px** (py-32 in Tailwind = 8rem)

### Spacing Scale
- Between major sections: **128px**
- Between heading and subtext: **24px**
- Between subtext and content cards: **64–80px**
- Between cards in a grid: **32px**
- Internal card padding: **32–40px**
- Between icon and text inside a card: **24px**

### Common Layouts
- **Hero**: 7/5 column split (text left, image/visual right)
- **Problem**: 5/7 column split (sticky heading left, scrolling cards right)
- **Guide/Authority**: 2-column with image left, text right
- **Plan**: 2-column card grid, centered
- **Stakes**: 2-column split (failure left in gray, success right in navy)
- **Stats**: 4-column row, centered, equal spacing
- **Testimonials**: Full-width quote cards
- **Final CTA**: Full-width navy background, centered text

---

## Component Patterns

### Buttons

**Primary CTA (Copper)**
- Background: Copper `#D67C1F`
- Text: White, Inter Bold, 16–18px
- Padding: 24px horizontal, 24px vertical
- Border radius: 12px
- Shadow: `0 4px 14px rgba(214, 124, 31, 0.3)`
- Hover: Slight lift (-2px translateY), deeper shadow
- Always includes right arrow icon (→) after text

**Secondary CTA (Navy)**
- Background: Navy `#1C3F8E`
- Text: White, Inter Bold, 16–18px
- Same padding, radius, and shadow pattern as primary
- Used for "Schedule a Review" in headers and result CTAs

**Outline Button**
- Background: Transparent
- Border: 1px solid `#E5E8EB`
- Text: Navy, Inter SemiBold, 16px
- Hover: Light muted background fill

### Cards
- Background: White `#FFFFFF`
- Border: 1px solid `#E5E8EB`
- Border radius: **24px** (rounded-3xl)
- Shadow: Subtle (`0 1px 3px rgba(0,0,0,0.05)`)
- Hover shadow: Medium (`0 4px 20px rgba(0,0,0,0.08)`)
- Padding: 32–40px

### Badges/Pills
- Background: Color at 10% opacity (e.g., navy at 5%, copper at 15%, red at 10%)
- Text: Full-color version of the background color
- Border: 1px solid color at 20% opacity
- Font: Inter Bold, 12px, UPPERCASE, letter-spacing 1.5px
- Padding: 4px 12px
- Border radius: Full/pill (9999px)

### Glass Panels
- Background: White at 80% opacity
- Backdrop blur: heavy (40px)
- Border: 1px solid white at 60% opacity
- Shadow: Large, very soft (`0 8px 40px -12px rgba(0,0,0,0.08)`)
- Used for floating overlay cards on hero images

### Stat Blocks
- Number: Plus Jakarta Sans, ExtraBold, 28–36px, Copper `#D67C1F`
- Label: Inter, Medium, 14px, Muted text
- Centered, in a 4-column row
- On dark backgrounds: Number in Copper, Label in White at 60% opacity

---

## Section-by-Section Reference

### Hero Section
- Near full-viewport height (90vh)
- Very subtle background: soft blurred gradient circles (navy at 5% opacity, copper at 5% opacity)
- Trust badge pill at top: icon + "Trusted by 700+ Dealerships"
- H1: ExtraBold, with one phrase highlighted in Navy `#1C3F8E`
- Subtext: Inter Regular, muted, max-width ~640px
- Two buttons side by side: Copper primary CTA + Outline secondary
- Right side: Image with navy gradient overlay, floating glass panel stat card

### Problem Section
- White background
- Left column: Large H2 in navy + body text in muted (sticky on scroll)
- Right column: 3 stacked cards with icon, title, description
- Final card has a light navy tint background to stand out (primary at 5%)
- Icons use Lucide-style simple line icons

### Guide / Authority Section
- Full-width Navy `#1C3F8E` background
- All text is white
- Left: Image with grayscale filter + navy overlay, floating stat card (Copper number)
- Right: H2 in white, empathy paragraph, proof paragraph
- 4-column stat row: Copper numbers, white labels
- Quote block: White/5% background with left copper border accent bar

### Plan Section
- Light gray background (`#F0F2F5` at 30% opacity)
- Centered H2 + subtext
- 2 cards side by side, each with:
  - Step number badge (navy circle, white text)
  - Icon in navy
  - H3 title
  - Body description
  - "Learn more" link in navy with arrow
- Below: Result callout bar with navy/5% background, copper accent text

### Stakes Section
- White background
- Centered H2 + subtext
- Two-panel split:
  - **Left (Failure)**: Light gray background, X icons in red circles, italic closing line
  - **Right (Success)**: Navy background, check icons in copper circles, CTA button at bottom

### Cost of Waiting / Calculator Push
- Off-white background
- Subtle red-tinted blur in background
- Left: Red warning badge, bold H2 with red highlight phrase, 3 loss bullet points with red icons, Copper CTA button
- Right: White card with red-tinted rows showing loss amounts in red, "Based on actual data" disclaimer

### Final CTA Section
- Full-width Navy background with faint image overlay (5% opacity)
- Centered: Large H2 in white, subtext in white/80%, Copper CTA button
- Generous vertical padding (160px top and bottom)

### Footer
- Very dark background `#0A0D14`
- Logo in white (inverted)
- Muted description text at white/50%
- Link columns with white/50% text, white on hover
- Bottom bar with copyright at white/30%

---

## Image Treatment
- Hero images: Rounded corners (24px), shadow
- Guide section images: Grayscale filter, navy overlay at 40% (mix-blend-multiply)
- All decorative images use subtle gradient overlays to maintain brand color consistency
- No raw, unfiltered stock photos — always apply an overlay or filter

---

## Icon Style
- Use **Lucide** icon set (thin, clean line icons)
- Icon size: 16–24px in badges and inline, 32px in feature cards
- Icon color matches the section context (navy on light, white/copper on dark)
- Icons sit inside rounded containers: 48–56px square, rounded-2xl (16px radius), with a 5–10% tint of the icon color as background

---

## Motion & Animation (for Video/Animated Content)
- Elements fade in from below (20px translateY) with 0.5–0.6s duration
- Easing: `[0.16, 1, 0.3, 1]` (fast start, smooth decelerate)
- Stagger delay between items: 100–200ms
- Buttons lift slightly on hover (-2px translateY) with shadow increase
- Score rings animate via SVG stroke-dashoffset over 1.5 seconds

---

## Canva Quick-Start Templates

### Social Post (1080x1080)
- Background: Navy `#1C3F8E`
- Logo: Top-left, white, small (height ~40px)
- Headline: Plus Jakarta Sans, ExtraBold, 36–44px, White, centered
- One key stat: Plus Jakarta Sans, ExtraBold, 64px, Copper `#D67C1F`
- Stat label: Inter, Medium, 16px, White/70%
- Bottom CTA bar: Copper background strip, white text "Learn more at strategicsource.com"

### LinkedIn Banner (1584x396)
- Background: Navy `#1C3F8E`
- Left: Logo in white
- Center: Tagline in white, Plus Jakarta Sans Bold
- Right: 2–3 stat blocks (Copper numbers, white labels)
- Subtle gradient circle accents (copper at 10% opacity)

### Presentation Slide
- Background: Off-white `#FAFBFC`
- Title: Plus Jakarta Sans, ExtraBold, 36px, Navy
- Body: Inter, Regular, 18px, Muted `#6B7280`
- Accent bar: 4px left border in Copper on key callout boxes
- Cards: White, 1px border `#E5E8EB`, 16px border radius, 32px padding
- Slide number: Inter, Medium, 12px, Muted, bottom-right

### PDF Report Cover
- Full background: Navy `#1C3F8E`
- Large logo: Centered, white
- Title: Plus Jakarta Sans, ExtraBold, 48px, White
- Subtitle: Inter, Regular, 20px, White/70%
- Bottom accent: Thin copper line or copper badge pill

### Email Header (600x200)
- Background: White or Off-white
- Logo: Left-aligned, original colors, height ~32px
- Headline: Plus Jakarta Sans, Bold, 24px, Navy
- Accent: Thin copper underline or copper dot separator
- Keep it simple — email headers should be clean and fast-loading

---

## Do's and Don'ts

### Do
- Lead with navy and white — copper is the accent, not the base
- Use generous white space between elements
- Keep headlines short and punchy (under 12 words)
- Use the stat blocks ($1B+, 700+, 150+, 25+) prominently
- Always include a clear CTA with a copper button
- Use rounded corners on everything (12–24px radius)
- Apply subtle shadows — never harsh drop shadows

### Don't
- Don't use bright blue — the brand blue is a deep navy
- Don't make copper/orange the dominant color on any design
- Don't use thin font weights for headlines (always Bold or ExtraBold)
- Don't use generic stock photos without brand overlays
- Don't center-align body paragraphs (left-align body text, center-align only headlines and short subtext)
- Don't use more than 2 fonts — stick to Plus Jakarta Sans + Inter
- Don't use black (`#000000`) for text — use Navy `#1A2744` instead
- Don't crowd the layout — err on the side of more spacing