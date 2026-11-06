# BuildEstimate Pro Architecture

## System Philosophy

BuildEstimate Pro is engineered on three core principles:
1. **Zero Runtime Dependency Bloat:** The browser application runs on pure HTML5 and vanilla JavaScript without framework overhead (React, Angular, or Vue). This guarantees instant 60 FPS mobile rendering and sub-50ms boot times.
2. **Offline-First PWA:** Powered by a Service Worker (`sw.js`) implementing a Network-First strategy with fallback to Cache Storage.
3. **Dual Head: Web PWA & Python CLI:** Provides an interactive mobile interface for field personnel, combined with a Python CLI engine for automated headless back-office bid generation.

---

## Directory Structure

```
buildestimate-app/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Automated Python unit testing CI pipeline
├── core/
│   ├── __init__.py                # Package metadata
│   ├── engine.py                  # Takeoff computation engine (ACI 318, ASTM)
│   ├── models.py                  # Pydantic data schemas
│   ├── pricing.py                 # Material benchmark pricing database
│   └── cli.py                     # Rich terminal CLI runner
├── docs/
│   ├── ARCHITECTURE.md            # System architecture reference
│   ├── FIELD_GUIDE.md             # Job-site contractor manual
│   └── FORMULAS.md                # Engineering formulas reference
├── icons/                         # PWA icons (SVG, 192x192, 512x512)
├── tests/
│   └── test_takeoff.py            # Automated Pytest suite
├── CHANGELOG.md                   # Version release history
├── CITATION.cff                   # Software citation metadata
├── CODE_OF_CONDUCT.md             # Contributor Covenant v2.1
├── CONTRIBUTING.md                # Open-source contribution guidelines
├── LICENSE                        # MIT License
├── README.md                      # Primary documentation & quick-start
├── SECURITY.md                    # Vulnerability disclosure policy
├── index.html                     # Responsive single-page PWA application
├── install.ps1                    # One-click Windows PowerShell installer
├── install.sh                     # One-click macOS / Linux Bash installer
├── manifest.json                  # PWA Web App Manifest
├── pyproject.toml                 # Modern Python packaging configuration
├── requirements.txt               # Developer dependencies
├── robots.txt                     # Search engine crawler directive
├── sitemap.xml                    # Canonical search engine sitemap
├── sw.js                          # Service Worker cache controller
├── uninstall.ps1                  # Windows uninstaller script
└── uninstall.sh                   # Linux/macOS cleanup script
```
