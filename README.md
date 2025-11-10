# Acumen DCI Punchcards Automation

Automated Playwright scripts for managing Acumen DCI punch card submissions and approvals.

## Why This Exists

This project was created to simplify the administrative requirements of family caregiving under state waiver programs. Our son, who has Down syndrome, is enrolled in Montana's 208 Waiver program, which enables him to receive care at home. Under this program, I serve as the employer of record, and my wife serves as his paid caregiver.

While the Acumen DCI system serves an important purpose in program compliance and documentation, the manual process of submitting and approving time entries each week can be time-consuming. After several months of managing these administrative tasks manually, we developed this automation to reduce the repetitive data entry burden, allowing us to focus more time on what matters most: caring for our son.

This tool may be helpful for other families in similar situations who are navigating employer-of-record arrangements in state waiver programs.

## For Other Families: Simple Setup Guide

If you're in a similar situation with state waiver programs and want to automate your punch card submissions, here's what this tool does in simple terms:

**What does this do?**
- Every Saturday morning, it automatically fills out your weekly punch cards (just like you would do manually)
- Then it automatically approves those punch cards (if you're the employer)
- You don't have to remember to do it every week - it runs on its own

**Do I need to know how to code?**
No! While this project involves code, you don't need to understand it. However, you will need:
- A GitHub account (free)
- About 30 minutes to set it up the first time
- Your Acumen DCI login credentials

**How do I get started?**

1. **Contact me for help**: I'm happy to help other families set this up for free. **[Click here to send me a message](https://github.com/SendDerek/acumen-dci-punchcards/issues/new?title=Help%20Request%3A%20Setup%20Assistance&body=Hi%20Derek%2C%0A%0AI%27m%20interested%20in%20setting%20up%20this%20automation%20for%20my%20family.%0A%0A**My%20situation%3A**%0A-%20State%2FProgram%3A%20%0A-%20Currently%20using%20Acumen%20DCI%3A%20Yes%20%2F%20No%0A%0A**Best%20way%20to%20contact%20me%3A**%0A-%20Email%3A%20%0A-%20Phone%20%28optional%29%3A%20%0A%0A**Questions%20or%20concerns%3A**%0A%0A)** and I'll walk you through it step by step.

2. **What I'll help you with**:
   - Creating a copy of this project for your family
   - Setting up your login credentials securely
   - Configuring the times and dates that work for you
   - Making sure everything runs correctly
   - Troubleshooting if anything goes wrong

3. **Is it safe?**
   - Your login credentials are stored securely online (not in the code itself)
   - The automation runs in the cloud, not on your computer
   - It only does exactly what you would do manually - nothing more

**Questions?** **[Click here to send me a message](https://github.com/SendDerek/acumen-dci-punchcards/issues/new?title=Question%20about%20Acumen%20DCI%20Automation&body=Hi%20Derek%2C%0A%0AI%20have%20a%20question%3A%0A%0A)** - I'm here to help other families dealing with the same administrative challenges.

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
