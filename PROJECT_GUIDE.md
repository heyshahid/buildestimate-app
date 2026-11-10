# BuildEstimate App

## Project Overview
Construction cost estimation web application and PWA for contractors, builders, and clients. Computes material takeoffs, labor rates, contingency budgets, and instant cost estimations.

- **Type**: Interactive Web Application / PWA
- **Live URL**: https://heyshahid.github.io/buildestimate-app/
- **GitHub Repository**: https://github.com/heyshahid/buildestimate-app
- **Branch**: main

## Project Structure
- `index.html`: Core cost estimator dashboard interface.
- `sw.js`: Service worker for offline PWA operation.
- `manifest.json`: Web App manifest.
- `assets/`: App styles, backgrounds, and images.
- `icons/`: PWA app icons and favicons.
- `core/`: Python estimation calculation models.
- `deploy_to_github.py`: 1-Click deployment script to push updates directly to GitHub Pages.

## How to Work on this Project
1. Edit `index.html` to adjust estimates, formulas, or UI components.
2. Run locally using Python:
   ```bash
   python -m http.server 8000
   ```
3. Deploy changes to GitHub Pages:
   ```bash
   python deploy_to_github.py
   ```
