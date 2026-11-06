# Security Policy

## Supported Versions

We actively maintain and provide updates for the latest production releases of BuildEstimate Pro:

| Version | Supported          |
| ------- | ------------------ |
| 2.4.x   | :white_check_mark: |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

---

## Reporting a Vulnerability

BuildEstimate Pro runs as a client-side Progressive Web App (PWA) with zero remote server data logging. All user data, job-site estimates, and contractor markups are stored exclusively in local browser storage (`localStorage`).

If you believe you have discovered a security issue, vulnerability, or script injection flaw:

1. **Do not disclose the issue publicly** in GitHub issues or public forums.
2. Email the maintainer directly at **[heyshahidakram@gmail.com](mailto:heyshahidakram@gmail.com)** with:
   - Subject: `[SECURITY] BuildEstimate Pro Vulnerability Report`
   - Description of the vulnerability and attack vector.
   - Proof of concept (PoC) or reproduction steps.
   - Potential impact on client local data storage or offline service workers.

3. We will acknowledge receipt within 24 hours and provide an estimated timeline for remediation.
