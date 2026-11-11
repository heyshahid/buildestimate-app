# BuildEstimate Pro 2.0 - Improvement & Development Roadmap

**Document:** Phased Engineering Implementation Roadmap  
**Target Release:** BuildEstimate Pro v2.0.0  
**Branch:** `v2-development`  
**Deployment Target:** GitHub Pages (`https://heyshahid.github.io/buildestimate-app/`)  
**Design System:** Technical Construction SaaS (#14213D Navy, #2563EB Blue, #F7F9FC Background, Inter Typography)  

---

## 1. Roadmap Architecture & Milestones Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                   BUILD ESTIMATE PRO 2.0 ROADMAP                       │
├─────────────┬─────────────────────────────────┬────────────────────────┤
│ Milestone   │ Focus Area                      │ Primary Deliverables   │
├─────────────┼─────────────────────────────────┼────────────────────────┤
│ Milestone 1 │ Audit, Stability & Parity       │ Audits, Token scrub,   │
│             │                                 │ Parity tests, Baseline │
├─────────────┼─────────────────────────────────┼────────────────────────┤
│ Milestone 2 │ UI Modernization & Projects     │ Dashboard, Sidebar nav,│
│             │                                 │ Multi-project workspace│
├─────────────┼─────────────────────────────────┼────────────────────────┤
│ Milestone 3 │ Materials, Labour & Equipment   │ Material DB, Pricing,  │
│             │                                 │ Crew rates, Equip cost │
├─────────────┼─────────────────────────────────┼────────────────────────┤
│ Milestone 4 │ BOQ Builder & Quotations        │ CSI BOQ, 7 PDF docs,   │
│             │                                 │ CSV/Excel exporters    │
├─────────────┼─────────────────────────────────┼────────────────────────┤
│ Milestone 5 │ Advanced Takeoff Tools          │ Earthwork, Roofing,    │
│             │                                 │ Flooring, MEP tools    │
├─────────────┼─────────────────────────────────┼────────────────────────┤
│ Milestone 6 │ PDF Blueprint Takeoff           │ Canvas viewer, Scale   │
│             │                                 │ calibration, Markup    │
├─────────────┼─────────────────────────────────┼────────────────────────┤
│ Milestone 7 │ Cost Tracking & Deployment      │ Budget vs Actual, PWA, │
│             │                                 │ Tests, Release v2.0    │
└─────────────┴─────────────────────────────────┴────────────────────────┘
```

---

## 2. Milestone Breakdown & Technical Specifications

### MILESTONE 1: Audit, Stability & Security Hardening (Current Milestone)
- [x] Complete comprehensive repository inspection.
- [x] Produce audit documentation:
  - `docs/PRODUCT_AUDIT.md`
  - `docs/CALCULATION_AUDIT.md`
  - `docs/TECHNICAL_AUDIT.md`
  - `docs/IMPROVEMENT_ROADMAP.md`
- [ ] Create and isolate `v2-development` Git branch.
- [ ] **Security Remediation:** Remove hardcoded GitHub token from `deploy_to_github.py`; implement secure environment variable resolution.
- [ ] Align calculation formulas between JavaScript and Python engines (Rebar clearance, stud corner allowances, profit markup vs margin).
- [ ] Establish automated calculation parity tests.

---

### MILESTONE 2: UI Modernization & Multi-Project Workspace
- **Objective:** Upgrade the single-page interface into a desktop-first, mobile-responsive professional construction estimating application without breaking existing calculators.
- **Deliverables:**
  1. **New 14-Module Organized Navigation:**
     1. Dashboard
     2. Projects
     3. Takeoff Tools (Houses Concrete, Framing, Drywall, Masonry, Paint, and New Calculators)
     4. Material Library
     5. Labour & Equipment
     6. Cost Estimator
     7. BOQ Builder
     8. Quotations
     9. Saved Estimates
     10. Reports
     11. Suppliers
     12. Regional Settings
     13. Help & Documentation
     14. Settings
  2. **Executive Construction Dashboard:**
     - KPI cards: Total Projects, Active Jobs, Draft Estimates, Pending Quotes, Estimated Project Value, Material Spend Summary, Labour Summary.
     - Quick Action Shortcuts: *Quick Create Project*, *New Takeoff*, *Concrete Calculator*, *BOQ Builder*, *Generate Quote*.
     - Helpful empty state with 1-click **Load Demo Project** capability.
  3. **Multi-Project Management Module:**
     - Project schema: Project Name, Client Name, Reference Code, Location, Country/Region, Project Type (Residential, Commercial, Industrial, Infrastructure, Renovation, Interior Fit-out), Currency, Measurement System, Dates, Notes.
     - Full CRUD: Create, Edit, Duplicate, Archive, and Delete projects with confirmation.
     - Dedicated Project Overview page displaying associated estimates, takeoffs, BOQ items, and quotations.

---

### MILESTONE 3: Central Material Library, Labour & Equipment Costing
- **Objective:** Enable reusable pricing and crew rate management across all estimates.
- **Deliverables:**
  1. **Central Material Database:**
     - Catalog categories: Cement, Sand, Aggregate, Steel, Bricks/Blocks, Timber, Drywall, Paint, Flooring, Roofing, Electrical, Plumbing, Insulation.
     - Material fields: Name, Category, Description, Unit, Package Size, Unit Rate, Currency, Supplier, Last Updated.
     - CSV Import / Export for material catalogs.
     - Comprehensive Unit Conversion Utility (kg, ton, bag, piece, CFT, m³, sq ft, m², litre, gallon).
  2. **Labour & Crew Management:**
     - Worker categories: Mason, Carpenter, Steel Fixer, Painter, Electrician, Plumber, General Laborer, Equipment Operator.
     - Hourly and daily crew billing rates, estimated hours, and overtime multipliers.
  3. **Equipment Costing Engine:**
     - Equipment types: Concrete Mixer, Transit Mixer, Excavator, Scaffold, Compactor, Generator.
     - Rental rates (Hourly, Daily, Monthly), mobilization fees, and operating fuel allowances.

---

### MILESTONE 4: Bill of Quantities (BOQ) & Professional Quotation Engine
- **Objective:** Generate tender-ready Bills of Quantities and client proposals with multiple document styles.
- **Deliverables:**
  1. **CSI / Work-Section BOQ Builder:**
     - Item Numbering, Work Section (Div 01 General, Div 02 Sitework, Div 03 Concrete, Div 04 Masonry, Div 06 Carpentry, Div 09 Finishes, etc.).
     - Quantity, Unit, Material Rate, Labour Rate, Equipment Rate, Total Rate, Total Amount.
     - 1-Click Generation of BOQ line items directly from Takeoff Calculators.
     - Real-time aggregation of direct costs, contingency, and profit.
  2. **Multi-Template Professional Quotation Suite:**
     - Template 1: *Simple Client Quotation* (executive summary, clean totals, payment schedule).
     - Template 2: *Detailed Contractor Proposal* (specifications, terms & conditions, itemized work).
     - Template 3: *Formal Bill of Quantities (BOQ)*.
     - Template 4: *Material Takeoff & Purchase List* (supplier-ready packaging specs).
     - Template 5: *Internal Cost Estimate* (contractor confidential cost breakdown).
  3. **Document Customization & PDF Generation:**
     - Company logo upload, contractor name, address, tax registration number, custom terms.
     - Crisp, print-optimized PDF generation and CSV/Excel spreadsheet export.

---

### MILESTONE 5: Additional Takeoff Calculators
- **Objective:** Expand material estimating across all core construction trades.
- **Deliverables:**
  1. **Earthwork & Excavation:** Trench volume, foundation pits, soil swell factor (10%-30%), compaction factor, backfill volume, dump truck loads.
  2. **Roofing Takeoff:** Pitched and flat roof surface area, slope pitch multiplier, roofing sheets / shingles, underlayment rolls, ridge caps.
  3. **Flooring & Tiles:** Floor area, tile dimensions (e.g. 60x60cm, 2x2ft), layout pattern cutting waste (10%-15%), tile adhesive mortar bags, grout weight (kg/lbs), skirting linear footage.
  4. **Steel Bar-Bending Schedule (BBS):** ASTM (#3 through #8) and Metric (8mm through 25mm) bar weight calculations, cutting lengths, standard hook/bend allowances, and wastage.
  5. **Electrical & Plumbing Quick Takeoffs:** Conduit lengths, wire run estimates, circuit counts, pipe lengths, and fixture allocations.

---

### MILESTONE 6: PDF Blueprint & Drawing Takeoff
- **Objective:** Allow estimators to measure dimensions directly on uploaded architectural drawings.
- **Deliverables:**
  1. PDF/Image drawing canvas loader (zoom, pan, fit-to-screen).
  2. Scale calibration tool (measure a known dimension like a 3ft door or 10ft dimension line).
  3. Measurement tools:
     - Linear Length tool (walls, trenches, pipes).
     - Polygon Area tool (slab footprint, room flooring, paintable ceilings).
     - Point Count tool (fixtures, columns, doors).
  4. Tagging & Assignment: Link calibrated measurements directly to project takeoff inputs.

---

### MILESTONE 7: Project Cost Tracking, Final Verification & Deployment
- **Objective:** Track actual expenses and verify complete production readiness.
- **Deliverables:**
  1. **Budget vs Actual Cost Tracking:**
     - Log actual purchase receipts, subcontractor invoices, and labour payroll.
     - Real-time variance visualization (Under budget vs Over budget alerts).
  2. **PWA & Offline Verification:**
     - Verify offline caching, service worker updates, and local storage retention.
  3. **Full Automated Test Execution:**
     - 100% pass across Python and JavaScript test suites.
  4. **Production Deployment:**
     - Merge `v2-development` into `main` and deploy live to GitHub Pages.
     - Verify live URL with HTTP 200 OK.

---

## 3. Non-Negotiable Quality Gates for Each Milestone

Before marking any milestone complete:
1. **Preserve Existing Features:** Existing calculators and saved data must remain operational.
2. **Formula Transparency:** All engineering assumptions must be clearly documented.
3. **Automated Testing:** Tests must pass with zero regression.
4. **Offline Capability:** Application must load and calculate without an active internet connection.
5. **No Fake Data:** Demo mode must be explicitly labelled; real projects must contain only user data.

