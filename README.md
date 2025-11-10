# Punchcards Automation

Automated Playwright scripts for managing Acumen DCI punch card submissions and approvals.

## Overview

This project automates two workflows:
- **Employee Side**: Submit punch card entries for a date range
- **Employer Side**: Approve pending punch card entries

## Quick Start

### Local Development

1. **Install dependencies**:
```bash
npm install
```

2. **Create `.env` file**:
```bash
cp .env.example .env
```

3. **Add credentials** to `.env`:
```env
ACUMEN_EMPLOYER_USERNAME=your_employer_username
ACUMEN_EMPLOYER_PASSWORD=your_employer_password
ACUMEN_EMPLOYEE_USERNAME=heather_username
ACUMEN_EMPLOYEE_PASSWORD=heather_password
```

4. **Run scripts**:
```bash
# Submit punch cards (employee side)
npm run submit

# Approve punch cards (employer side)
npm run approve
```

### Automated Scheduling

This project includes GitHub Actions workflows for automated execution:

- **Monday 9 AM UTC**: Submit previous week's punch cards
- **Friday 5 PM UTC**: Approve pending punch cards

#### Setup

1. Push repository to GitHub
2. Add secrets in Settings → Secrets and variables → Actions:
   - `ACUMEN_EMPLOYER_USERNAME`
   - `ACUMEN_EMPLOYER_PASSWORD`
   - `ACUMEN_EMPLOYEE_USERNAME`
   - `ACUMEN_EMPLOYEE_PASSWORD`

See [CLAUDE.md](CLAUDE.md) for complete documentation.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run submit` | Submit punch cards (headless) |
| `npm run submit:headed` | Submit punch cards (visible browser) |
| `npm run approve` | Approve punch cards (headless) |
| `npm run approve:headed` | Approve punch cards (visible browser) |

## Features

- ✅ Automated date range calculation (weekdays only)
- ✅ Browser automation with Playwright
- ✅ GitHub Actions scheduling
- ✅ Environment variable configuration
- ✅ Detailed logging
- ✅ Error handling and retries

## Documentation

See [CLAUDE.md](CLAUDE.md) for complete documentation including:
- Detailed workflow descriptions
- Troubleshooting guide
- Architecture notes
- Development commands

## License

ISC
