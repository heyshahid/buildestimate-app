# Changelog

All notable changes to **BuildEstimate Pro** are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.4.0] - 2026-11-06
### Added
- **Dynamic Custom Overrides for Every Dropdown:** Added real-time inline custom input fields for Waste Factor Margin (`Custom Waste %`), Rebar Spacing (`Custom Spacing (Inches)`), Stud Spacing, Drywall Sheet Size, Paint Coats, Contingency Buffer, and Profit Margin.
- **Python CLI Core Engine (`core/engine.py`):** Python takeoff computation suite for terminal automation and headless server workflows.
- **Automated Test Suite (`tests/test_takeoff.py`):** Verified mathematical models against American Concrete Institute (ACI) formulas and IBC standards.
- **Cross-Platform One-Click Installers:** Added `install.ps1` (PowerShell) and `install.sh` (Bash) for seamless local offline operation.

### Changed
- Standard Thickness Quick Selector updated to include full **Custom (Any Size)** mode.
- Printable PDF Proposal optimized strictly to fit onto 1 single page without awkward page breaks or cut-offs.
- Bumped PWA Service Worker cache to `buildestimate-v3`.

---

## [2.0.0] - 2026-10-15
### Added
- **Master Project Proposal & Contractor Markup:** Financial synthesis engine integrating labor hours, direct materials, subcontractor quotes, contingency reserves, and profit margin markups.
- **1-Page Executive PDF Proposal:** Formal client-ready quote with signature block.
- **Offline PWA Service Worker:** Complete asset caching enabling mid-flight and remote job-site operation without cellular reception.

---

## [1.5.0] - 2026-09-20
### Added
- **Wall Framing & Drywall Module:** Stud spacing (16" and 24" OC), top and bottom plates, drywall sheets (4x8 and 4x12), screws, joint compound, and tape with door/window deductions.
- **Paint & Surface Area Module:** Finish coats, primer gallonage, 5-gallon buckets, and 1-gallon cans.

---

## [1.0.0] - 2026-08-01
### Added
- Initial open-source release of **BuildEstimate Pro**.
- Concrete slab cubic yardage and ready-mix truck loads calculator.
- #4 Rebar grid spacing and linear footage estimation.
