# BuildEstimate Pro

[![Live App](https://img.shields.io/badge/Live_App-heyshahid.github.io%2Fbuildestimate--app-EA580C?style=for-the-badge&logo=googlechrome&logoColor=white)](https://heyshahid.github.io/buildestimate-app/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable_Offline-10B981?style=for-the-badge&logo=pwa&logoColor=white)](https://heyshahid.github.io/buildestimate-app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)
[![Author: Shahid Akram](https://img.shields.io/badge/Author-Shahid_Akram-1E293B?style=for-the-badge&logo=github&logoColor=white)](https://github.com/heyshahid)
[![GitHub Stars](https://img.shields.io/github/stars/heyshahid/buildestimate-app?style=for-the-badge&logo=github&color=F59E0B)](https://github.com/heyshahid/buildestimate-app/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/heyshahid/buildestimate-app?style=for-the-badge&logo=github&color=3B82F6)](https://github.com/heyshahid/buildestimate-app/network/members)
[![Python Engine](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python&logoColor=white)](pyproject.toml)

> **Global Construction Material Takeoff & Contractor Bid Proposal Suite (Progressive Web App)**  
> Universal multi-region support across **North America (Imperial), GCC & Middle East (Metric), Asia & Subcontinent (1:2:4 Nominal Mix Ratios & CFT), and UK/Europe (Eurocode)**. Runs seamlessly offline on iOS, Android, macOS, and Windows.
> 
> **Support this Project:** If you find BuildEstimate Pro helpful for your engineering projects or construction estimates, please give it a **Star on GitHub**. It directly supports continuous open-source civil engineering tools!

---

## Live Web Application
Launch Tool: [https://heyshahid.github.io/buildestimate-app/](https://heyshahid.github.io/buildestimate-app/)  
*(Installable directly to mobile and desktop home screens).*

---

## Global Regional Construction Standards

BuildEstimate Pro is built for global civil engineering practices, adapting measurement units, material packaging, and realistic benchmark rates:

### 1. North America [US / CA] (ACI 318 / IBC Imperial)
- **Units:** Feet (ft), Inches (in), Cubic Yards (yd3).
- **Concrete Supply:** 10 yd3 ready-mix drum trucks; 80lb/60lb Quikrete pre-bagged mix.
- **Rebar:** ASTM Imperial sizes (#4 = 1/2" = 0.668 lb/ft).
- **Framing & Drywall:** 2x4 SPF studs at 16" or 24" OC; 4x8 (32 SF) and 4x12 (48 SF) 1/2" gypsum drywall; 4.5 gallon compound buckets.
- **Finishes:** US Gallons (coverage 350 SF/gal).
- **Default Currency:** USD ($) / CAD (C$).

### 2. GCC & Middle East [UAE / SA / QA / KW] (Metric SI)
- **Units:** Meters (m), Centimeters (cm), Millimeters (mm), Cubic Meters (m3).
- **Concrete Supply:** 8 m3 transit mixer trucks; 50kg OPC/SRC cement bags.
- **Rebar:** BS 4449 Grade 500B / ASTM A615M high-tensile metric deformed bars (10mm, 12mm, 16mm).
- **Framing & Drywall:** Light gauge steel C-studs (600mm / 400mm OC); 1.2x2.4m (2.88 m2) gypsum plasterboard.
- **Finishes:** Litres (coverage 10-12 m2/L), 18L / 20L paint drums.
- **Default Currencies:** AED, SAR, QAR, KWD.

### 3. Asia & Subcontinent [PK / IN / BD] (Nominal Mix Ratios & CFT Dual)
- **Units:** Dual Cubic Feet (CFT) and Cubic Meters (m3).
- **Concrete Mix Ratio Engine:** Accurate civil engineering takeoff based on the **1.54 Dry Factor**:
  - `1:2:4 (M15)`: Standard RCC slabs, beams, and roofs.
  - `1:1.5:3 (M20)`: High-strength RCC columns and heavy foundations.
  - `1:3:6 (M10)`: Plain Cement Concrete (PCC) lean base.
  - `1:1:2 (M25)`: Heavy water-retaining structures.
- **Ingredient Quantities:** Exact 50kg Cement Bags, Sand (CFT & m3), Crushed Stone / Bajri (CFT & m3), Steel Sariya (Grade 60 in kg and metric tons), and mixing water.
- **Masonry:** Standard Red Clay Brick takeoff (9" x 4.5" x 3") at 13.5 bricks/CFT with 1:6 or 1:4 cement-sand mortar.
- **Default Currencies:** PKR (Rs), INR (Rs), BDT (Tk).

### 4. UK & Europe [Eurocode BS EN] (EN 1992 / BS EN 206)
- **Units:** Metres (m), Millimetres (mm), Cubic Metres (m3).
- **Concrete:** C20/25 and C25/30 ready-mix concrete delivered in 6m3 to 8m3 trucks.
- **Rebar:** High-yield deformed steel H10, H12, H16, and BRC fabric mesh.
- **Framing & Plasterboard:** C16/C24 timber studwork (400mm / 600mm centers); 1200x2400mm plasterboard (2.88 m2).
- **Default Currencies:** GBP, EUR.

---

## Worldwide Currency & Country Engine
BuildEstimate Pro features dynamic global currency switching across 25 major construction markets:
- **North America**: United States (USD), Canada (CAD), Mexico (MXN)
- **Asia & Subcontinent**: Pakistan (PKR), India (INR), Bangladesh (BDT), Singapore (SGD), Malaysia (MYR)
- **GCC & Middle East**: UAE (AED), Saudi Arabia (SAR), Qatar (QAR), Kuwait (KWD), Oman (OMR), Bahrain (BHD), Turkey (TRY), Egypt (EGP)
- **UK & Europe**: United Kingdom (GBP), Germany (EUR), France (EUR), Spain (EUR), Italy (EUR)
- **Oceania & Others**: Australia (AUD), New Zealand (NZD), South Africa (ZAR), Brazil (BRL)

---

## Multilingual Translation Engine (8 Languages)
Full end-to-end internationalization with accurate civil engineering terminology and bidirectional text orientation:
- **English** (Default)
- **Arabic (العربية)** - Full RTL Layout
- **Urdu (اردو)** - Full RTL Layout
- **Hindi (हिन्दी)**
- **Bengali (বাংলা)**
- **Spanish (Español)**
- **French (Français)**
- **German (Deutsch)**

---

## Technical Architecture

```
BuildEstimate/
├── core/
│   ├── engine.py       # Mathematical takeoff formulas & mix ratio calculations
│   ├── models.py       # Pydantic data schemas
│   ├── pricing.py      # Regional benchmark pricing index
│   └── cli.py          # Command-line interface
├── tests/
│   └── test_takeoff.py # Automated pytest test suite (100% pass)
├── assets/
│   └── images/         # Architectural modern luxury jobsite backdrops
├── icons/              # Responsive PWA maskable icons
├── index.html          # Progressive Web App (Single-file offline suite)
├── sw.js               # Service Worker v8 (Offline caching & network-first navigation)
└── pyproject.toml      # Python package configuration
```

---

## Automated Verification
Run the calculation engine test suite:

```bash
uv run --with pytest --with pydantic pytest tests/
```

Expected result:
```
============================== 8 passed in 0.37s ==============================
```

---

## Fork & White-Label for Your Construction Business
Contractors, project managers, and engineering consultancies can white-label BuildEstimate Pro for their own firm:
1. Click **Fork** at the top right of this repository.
2. Clone your forked repo: `git clone https://github.com/YOUR_USERNAME/buildestimate-app.git`
3. Replace `./icons/icon.svg` with your company logo.
4. Customize default regional rates in `index.html` to match your local suppliers.
5. Deploy instantly for free using **GitHub Pages** or **Vercel**.

---

## Author & License
Engineered by **Shahid Akram** ([@heyshahid](https://github.com/heyshahid)).  
Licensed under the **MIT License**.
