# BuildEstimate Pro

[![Live App](https://img.shields.io/badge/Live_App-heyshahid.github.io%2Fbuildestimate--app-EA580C?style=for-the-badge&logo=googlechrome&logoColor=white)](https://heyshahid.github.io/buildestimate-app/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable_Offline-10B981?style=for-the-badge&logo=pwa&logoColor=white)](https://heyshahid.github.io/buildestimate-app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)
[![Author: Shahid Akram](https://img.shields.io/badge/Author-Shahid_Akram-1E293B?style=for-the-badge&logo=github&logoColor=white)](https://github.com/heyshahid)

> **Mobile-First Construction Material Takeoff & Contractor Bid Proposal Suite (Progressive Web App)**  
> Runs seamlessly on **iOS, Android, and Desktop**. Installable directly to home screens without an app store. Instant field calculations for concrete, rebar, framing, drywall, paint, and 1-page PDF client bids.

---

## Live Web Application
Launch Tool: [https://heyshahid.github.io/buildestimate-app/](https://heyshahid.github.io/buildestimate-app/)  
*(Installable directly to iOS, Android, macOS, and Windows home screens).*

---

## Overview & Field Workflows
**BuildEstimate Pro** is an open-source, mobile-first construction estimation suite tailored for general contractors, project managers, construction estimators, and Virtual Assistants.

It simplifies job-site takeoffs into instant, real-time calculations:
- **Concrete & Slab Takeoff:** Calculate cubic yards, ready-mix truck counts, and rebar grid requirements (#4 rebar) with customizable waste factor margins (5% to 25%+ or custom value).
- **Wall Framing & Drywall Takeoff:** Calculate stud counts (16" or 24" OC or custom), 16ft top/bottom plates, drywall sheets (4x8 and 4x12), drywall screws, joint compound (mud), and tape with automated door/window deductions.
- **Paint & Surface Coatings:** Calculate finish coats, primer gallonage, 5-gallon buckets, and 1-gallon cans based on square footage and coat counts.
- **Master Project Proposal & Contractor Markup:** Synthesize material costs, labor hours, subcontractor bids, equipment rentals, contingency reserves, and contractor profit margins into an executive client quote.
- **1-Page PDF Export / Print:** Generates a professional, print-ready Bill of Quantities (BOQ) with client signature block formatted strictly to fit on 1 single page without awkward page breaks.
- **Local Storage Vault:** Automatically saves recent estimates on your device for offline job-site reference.

---

## Mobile App (PWA) Features
- **Android:** 1-tap "Install App" prompt saves to your home screen as a native standalone app.
- **iOS (iPhone/iPad):** Open in Safari $\rightarrow$ Tap Share $\rightarrow$ "Add to Home Screen".
- **Offline Capable:** Powered by Service Workers (`sw.js`) and Web App Manifest (`manifest.json`).

---

## Material Estimation Formulas

$$\text{Cubic Yards} = \frac{\text{Length (ft)} \times \text{Width (ft)} \times \frac{\text{Thickness (in)}}{12}}{27} \times (1 + \text{Waste Factor})$$

$$\text{Ready-Mix Truck Loads} = \lceil \frac{\text{Total Cubic Yards}}{10} \rceil$$

$$\text{Wall Studs (16\" OC)} = \left(\frac{\text{Wall Length (ft)} \times 12}{16} + 1\right) \times 1.15 \quad (\text{includes corners, intersections, and waste})$$

---

## Tech Stack
- **Frontend:** Pure HTML5, Modern Tailwind CSS
- **App Platform:** Progressive Web App (PWA)
- **Zero Dependencies:** Pure vanilla JS logic for instant 60 FPS mobile responsiveness.

---

## Search & Topic Tags
`concrete-calculator`, `construction-calculator`, `construction-management`, `contractor-bidding`, `cost-estimator`, `drywall-estimator`, `framing-calculator`, `material-takeoff`, `progressive-web-app`, `pwa`

---

## Author
**Shahid Akram**  
*Construction Operations, Estimating & Paid Acquisition Specialist*  
- Live Web App: [heyshahid.github.io/buildestimate-app](https://heyshahid.github.io/buildestimate-app/)  
- GitHub: [github.com/heyshahid](https://github.com/heyshahid)  
- Portfolio: [byshahid.vercel.app](https://byshahid.vercel.app/)  
- LinkedIn: [linkedin.com/in/shahidakram](https://www.linkedin.com/in/shahidakram/)  
- Blogger: [byshahid.blogspot.com](https://byshahid.blogspot.com/)  
- Substack: [byshahidakram.substack.com](https://byshahidakram.substack.com/)  
- Email: [heyshahidakram@gmail.com](mailto:heyshahidakram@gmail.com)

---

## License
This project is open-source under the [MIT License](LICENSE).
