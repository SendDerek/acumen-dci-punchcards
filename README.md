# Acumen DCI Punchcards Automation

Automated Playwright scripts for managing Acumen DCI punch card submissions and approvals.

## Why This Exists

This project was created to simplify the administrative requirements of family caregiving under state waiver programs. Our son, who has Down syndrome, is enrolled in Montana's 208 Waiver program, which enables him to receive care at home. Under this program, I serve as the employer of record, and my wife serves as his paid caregiver.

While the Acumen DCI system serves an important purpose in program compliance and documentation, the manual process of submitting and approving time entries each week can be time-consuming. After several months of managing these administrative tasks manually, we developed this automation to reduce the repetitive data entry burden, allowing us to focus more time on what matters most: caring for our son.

This tool may be helpful for other families in similar situations who are navigating employer-of-record arrangements in state waiver programs.

## Disclaimer

This software is provided "as-is" for automation of legitimate administrative tasks. Users are responsible for:
- Ensuring compliance with their program's policies and requirements
- Verifying the accuracy of all submitted information
- Maintaining appropriate records as required by their program
- Understanding that automation does not replace oversight and review

**Use at your own risk.** The authors assume no liability for any issues arising from the use of this software.

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
ACUMEN_EMPLOYEE_USERNAME=your_employee_username
ACUMEN_EMPLOYEE_PASSWORD=your_employee_password
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

- **Saturday 9 AM MST** (4 PM UTC): Submit previous week's punch cards
- **Saturday 10 AM MST** (5 PM UTC): Approve pending punch cards

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
