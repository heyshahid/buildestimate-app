# BuildEstimate Pro 2.0

[![Live App](https://img.shields.io/badge/Live_App-heyshahid.github.io%2Fbuildestimate--app-EA580C?style=for-the-badge&logo=googlechrome&logoColor=white)](https://heyshahid.github.io/buildestimate-app/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable_Offline-10B981?style=for-the-badge&logo=pwa&logoColor=white)](https://heyshahid.github.io/buildestimate-app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)
[![Author: Shahid Akram](https://img.shields.io/badge/Author-Shahid_Akram-1E293B?style=for-the-badge&logo=github&logoColor=white)](https://github.com/heyshahid)
[![GitHub Stars](https://img.shields.io/github/stars/heyshahid/buildestimate-app?style=for-the-badge&logo=github&color=F59E0B)](https://github.com/heyshahid/buildestimate-app/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/heyshahid/buildestimate-app?style=for-the-badge&logo=github&color=3B82F6)](https://github.com/heyshahid/buildestimate-app/network/members)
[![Tests: 16 Passing](https://img.shields.io/badge/Tests-16_Passing-10B981?style=for-the-badge&logo=pytest&logoColor=white)](tests/)

> **Universal Construction Takeoff, Cost Estimation, BOQ & Contractor Bidding Platform**  
> *"Measure Accurately. Estimate Confidently. Build Smarter."*  
> 
> Engineered for General Contractors, Civil Engineers, Quantity Surveyors, Project Managers, and Construction Estimators. Operates **100% Local-First and Offline** via Progressive Web App (PWA) architecture.

---

## 🌟 Live Web Application
Launch Tool: [https://heyshahid.github.io/buildestimate-app/](https://heyshahid.github.io/buildestimate-app/)  
*(Installable as a native desktop or mobile app via Chrome, Edge, and Safari).*

---

## 🏗️ 14-Module Platform Architecture

BuildEstimate Pro 2.0 transforms construction estimating from simple calculators into an integrated end-to-end management studio:

### 1. Executive Dashboard
- **Real-Time KPIs:** Total projects in pipeline, active construction jobs, estimated project value, direct materials vs labour costs.
- **Dynamic Cost Breakdown:** Interactive SVG visualization tracking materials (blue), trade labour (amber), and equipment/contingency/profit (green).
- **Recent Projects Feed:** Instant 1-click navigation into project workspaces and draft tenders.

### 2. Project Management Studio
- **Multi-Project Workspace:** Create, edit, duplicate, archive, and delete independent construction projects.
- **Active Project Context:** All calculations, material takeoffs, BOQ items, and quotations link directly to the active project.
- **Pre-Configured Demo Project:** 1-click loader for the *"Hillside Modern Residence - 2 Story RCC Villa"* including foundation takeoffs and 6 CSI BOQ line items.
- **Backward-Compatible Migration:** Automatically detects and upgrades legacy v1.0 `localStorage` estimates into project entities.

### 3. Construction Takeoff Calculators
- **Concrete & Foundations:** Monolithic slabs, footings, grade beams, 10 yd³ / 8 m³ ready-mix truck counts, and 80lb/60lb pre-bagged mix.
- **1.54 Dry Factor Nominal Mix Ratio Engine:** Accurate Subcontinent/Asia RCC calculations for `1:2:4 (M15)`, `1:1.5:3 (M20)`, `1:3:6 (M10)`, and `1:1:2 (M25)` with exact 50kg cement bags (1.25 CFT/bag), sand, bajri, steel, and water.
- **ACI 318 Rebar Reinforcement Grid:** Accounts for 3" edge clearance, 20ft stock sticks, wire tie counts, and support chairs.
- **Wall Framing & Studs:** 16" and 24" on-center spacing, 15% corner/T-wall factors, continuous 16ft top/bottom plates, and opening headers.
- **Brick Masonry:** Standard red clay bricks (9"x4.5"x3" at 13.5 bricks/CFT) and CMU blocks with 1:6 and 1:4 mortar factors.
- **Drywall & Ceilings:** 32 SF (4'x8') and 48 SF (4'x12') sheet counts, joint compound mud buckets, drywall screws, and tape rolls.
- **Architectural Paint:** Primer sealers, finish coats, 5-gallon buckets, 1-gallon cans, and liter packaging.
- **Executive Bid Proposal:** Direct costs, contingency buffers, sales tax, and transparent **Markup on Cost** vs **Margin on Selling Price** calculation mode.

### 4. Digital Blueprint & CAD Drawing Takeoff Studio
- **Interactive HTML5 CAD Canvas:** Smooth Pan and Zoom controls for viewing blueprints on desktop and tablets.
- **Scale Calibration:** Click two points along any dimension line to calibrate real-world feet or meters.
- **Area Polygon Takeoff:** Measure room areas, foundation footprints, ceiling spans, and roof pitches in SF and m².
- **Linear Run Takeoff:** Measure interior/exterior wall lengths, baseboards, and foundation trench runs in Linear Feet (LF) and meters.
- **Count Markers:** Drop numbered pins for columns, doors, windows, and electrical/plumbing fixtures.
- **Direct Calculator Push:** 1-click transfer of measured quantities straight into the Concrete Slab calculator, Wall Framing tool, or BOQ line items!

### 5. Central Material Library & Price Database
- **Comprehensive Material Catalog:** 30+ pre-configured civil materials across Concrete, Aggregates, Steel, Lumber, Masonry, Drywall, Paint, and Waterproofing.
- **Inline Rate Editing:** Click any unit price to update it live across your local price database.
- **Custom Material Creator:** Add jobsite materials with custom units, packaging, waste factors, and vendor information.
- **Civil Engineering Unit Converter:** Instant conversion between CFT ↔ m³, CY ↔ m³, SF ↔ m², Linear Feet ↔ Meters, Inches ↔ mm, and Tonnes ↔ lbs.
- **Price Book Import/Export:** Download or upload CSV material price books.

### 6. Labour Rates & Equipment Fleet Manager
- **Trade Crew Benchmarks:** Fully-burdened hourly and 8-hour daily billing rates for Lead Framers, Finishers, Masons, Ironworkers, and Laborers.
- **Heavy Plant & Machinery:** Rental rates and operator terms for Transit Concrete Pumps, Mini Excavators, Vibrators, Plate Compactors, and Scaffolding.

### 7. Master Parametric Cost Estimator
- Early-stage feasibility modeling based on gross building area (SF/m²), typology (Residential, Multi-family, Commercial, Industrial), and quality tiers.
- Parametric trade distribution across Substructure (15%), Superstructure (28%), MEP Systems (22%), Finishes (25%), and General Conditions (10%).

### 8. Bill of Quantities (BOQ) Studio
- Standard CSI MasterFormat itemization (Divisions 01 through 26).
- Itemized rate buildup: $\text{Unit Rate} = \text{Material} + \text{Labour} + \text{Equipment}$.
- **⚡ Import from Takeoffs:** 1-click action reading active takeoff calculations into formal BOQ lines.
- Filter by CSI division, live search, and CSV export.

### 9. Contractor Quotations & Proposal Studio
- **3 Professional Templates:**
  1. *Executive 1-Page Contractor Bid:* Clean, high-converting client quotation with formal signature blocks.
  2. *Detailed Itemized CSI Tender:* Multi-trade tender schedule with line item descriptions, quantities, and rates.
  3. *Milestone Draw Contract:* Progressive payment schedule (30% Mobilization/Foundation, 30% Framing, 30% Drywall/Finishes, 10% Substantial Completion Retainage).
- 1-Click Print & PDF Export.

### 10. Saved Estimates & Revisions
- Browse historical estimate records, filter by project, and restore prior calculations.

### 11. Verified Construction Suppliers Directory
- Contact details, fleet sizes, delivery radiuses, and lead times for ready-mix batch plants, lumber yards, and steel mills.

### 12. Global Regional Standards
- 25 national markets, 22 world currencies, and regional packaging dimensions (Imperial, Metric, Subcontinent CFT, Eurocode).

### 13. Civil Engineering Formulas & Technical Manual
- Mathematical reference documentation explaining the 1.54 Dry Factor derivation, ACI 318 rebar edge clearances, and Markup vs Margin equations.

### 14. Workspace & Company Profile Settings
- Manage your construction company name, license number, tax registration, estimator credentials, and default profit margins.

---

## 📐 Mathematical Parity & Civil Engineering Principles

BuildEstimate Pro enforces rigorous engineering standards across both its browser engine (`assets/js/engine.js`) and Python backend (`core/engine.py`):

1. **Concrete Dry Volume Factor (1.54):**
   $$\text{Dry Volume} = \text{Wet Volume} \times 1.54$$
   Accounts for void spaces between coarse aggregates and sand grains prior to water hydration.
2. **Rebar Grid with ACI 318 Concrete Cover:**
   $$\text{Net Length} = \text{Length} - (2 \times \text{Clearance})$$
   $$\text{Net Width} = \text{Width} - (2 \times \text{Clearance})$$
   $$\text{Linear Feet} = [(\text{Bars}_{\text{length}} \times \text{Net Length}) + (\text{Bars}_{\text{width}} \times \text{Net Width})] \times (1 + \text{Waste})$$
3. **Contractor Markup vs Profit Margin:**
   $$\text{Markup on Cost:} \quad \text{Price} = \text{Base Cost} \times (1 + \text{Markup}\%)$$
   $$\text{Margin on Selling Price:} \quad \text{Price} = \frac{\text{Base Cost}}{1 - \text{Margin}\%}$$

---

## 🧪 Automated Test Suite

Run unit and parity tests:
```bash
uv run --with pytest --with pydantic pytest tests/
```
100% of test cases pass:
- Concrete imperial & metric accuracy
- 1.54 Dry factor and nominal mix ratios (1:2:4, 1:1.5:3, 1:3:6)
- ACI 318 3" rebar edge clearances
- Brick masonry 1:6 and 1:4 mortar bags
- Wall framing studs & 15% corner/waste allowances
- Drywall sheet & compound estimation
- Paint coverage rates
- Financial bid markup vs margin modes

---

## 📄 License & Attribution
- **License:** MIT License. Free for commercial and personal construction estimating use.
- **Author:** [Shahid Akram](https://github.com/heyshahid)
- **Star on GitHub:** If you like BuildEstimate Pro, please star the repository at [heyshahid/buildestimate-app](https://github.com/heyshahid/buildestimate-app)!
