# Contributing to BuildEstimate Pro

Thank you for investing your time in improving BuildEstimate Pro! We welcome contributions from general contractors, civil engineers, quantity surveyors, construction estimators, and software engineers.

---

## 🛠️ How to Contribute

### 1. Reporting Bugs & Inaccuracies
If you discover a formula discrepancy or a bug on job-site takeoffs:
- Search existing [GitHub Issues](https://github.com/heyshahid/buildestimate-app/issues) first.
- Open a new Issue detailing:
  - Material module (Concrete, Rebar, Framing, Drywall, Paint, Bid Proposal).
  - Expected output vs. actual calculation.
  - Dimensions / parameters used.
  - Industry code or regional standard reference (e.g. ACI 318, IBC, ASTM).

### 2. Suggesting New Calculation Modules
We are actively expanding material takeoff capabilities (e.g. roofing squares, insulation R-values, asphalt tonnage).
Please open a Feature Request issue detailing:
- The standard unit takeoff formulas.
- Typical waste factor ranges.
- Required inputs and resulting Bill of Quantities (BOQ) line items.

### 3. Submitting Code (Pull Requests)
1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/new-takeoff-module
   ```
2. Run test suites locally before submitting:
   ```bash
   pytest tests/
   ```
3. Commit with concise, descriptive commit messages:
   ```bash
   git commit -m "feat(concrete): add custom aggregate density selector"
   ```
4. Push to your fork and submit a Pull Request targeting `main`.

---

## 📐 Calculation Standards & Code Quality
- All dimensional calculations must support standard US customary units (feet, inches, cubic yards, square feet).
- Inline custom overrides must always be available for dropdown options (waste factors, grid spacings, stud spacings).
- PWA client logic must maintain zero third-party framework runtime dependencies for instant 60 FPS mobile performance.

---

## 👤 Maintainer
**Shahid Akram** ([@heyshahid](https://github.com/heyshahid))  
Lead Construction Operations & Paid Acquisition Specialist  
Email: [heyshahidakram@gmail.com](mailto:heyshahidakram@gmail.com)
