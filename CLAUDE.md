# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Playwright automation project designed to automate the approval of punch cards for Heather at Acumen powered by DCI. The project uses TypeScript and Playwright to interact with the punch card approval system.

**Target URL**: https://acumen.dcisoftware.com/Mobile/Entry/PendingEntries

## Quick Start

### Initial Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
```

3. Edit `.env` and add your Acumen credentials:
```
# Employer credentials (for approving punch cards)
ACUMEN_EMPLOYER_USERNAME=your_employer_username
ACUMEN_EMPLOYER_PASSWORD=your_employer_password

# Employee credentials (for Heather to submit punch cards)
ACUMEN_EMPLOYEE_USERNAME=heather_username
ACUMEN_EMPLOYEE_PASSWORD=heather_password
```

### Running Locally

**Employer Side - Approve Punch Cards:**
```bash
# Approve all pending punch cards (headless mode)
npm run approve

# Run with visible browser (watch it work)
npm run approve:headed

# Run in debug mode (step through the automation)
npm run approve:debug
```

**Employee Side - Submit Punch Cards:**
```bash
# Submit punch cards for previous week (Monday-Friday)
npm run submit

# Submit for a specific date
START_DATE=11/04/2025 npm run submit

# Submit for a date range
START_DATE=11/04/2025 END_DATE=11/08/2025 npm run submit

# Run with visible browser (watch it work)
npm run submit:headed

# Debug mode
npm run submit:debug
```

### Automated Scheduling (GitHub Actions)

The repository includes GitHub Actions workflows for automated punch card processing:

#### Setup GitHub Actions

1. **Push repository to GitHub** (if not already):
```bash
git remote add origin https://github.com/YOUR_USERNAME/punchcards.git
git branch -M main
git push -u origin main
```

2. **Configure GitHub Secrets**:
   - Go to your repository on GitHub
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret" and add each of the following:
     - `ACUMEN_EMPLOYER_USERNAME` - Your employer username
     - `ACUMEN_EMPLOYER_PASSWORD` - Your employer password
     - `ACUMEN_EMPLOYEE_USERNAME` - Employee (Heather's) username
     - `ACUMEN_EMPLOYEE_PASSWORD` - Employee (Heather's) password

#### Workflow Schedules

**Submit Punch Cards** (`.github/workflows/submit-punchcards.yml`):
- **Automatic**: Every Saturday at 4:00 PM UTC (9:00 AM MST)
- **Purpose**: Submits punch cards for the previous week (Monday-Friday)
- **Manual trigger**: Go to Actions → Submit Punch Cards → Run workflow
  - Optional: Specify custom date range

**Approve Punch Cards** (`.github/workflows/approve-punchcards.yml`):
- **Automatic**: Every Saturday at 5:00 PM UTC (10:00 AM MST)
- **Purpose**: Approves all pending punch cards (runs 1 hour after submission)
- **Manual trigger**: Go to Actions → Approve Punch Cards → Run workflow

#### Viewing Workflow Results

1. Go to the "Actions" tab in your GitHub repository
2. Click on the workflow run you want to inspect
3. View logs, download artifacts (on failure), and check status

#### Manual Workflow Execution

To manually run a workflow:
1. Go to Actions tab
2. Select the workflow (Submit or Approve)
3. Click "Run workflow" button
4. For submit workflow: optionally enter START_DATE and END_DATE
5. Click "Run workflow"

## Automation Workflows

### Employer Side - Approve Punch Cards

The automation script (`approve-punchcards-single.spec.ts`) performs the following steps in a single browser session:

1. **Authentication**:
   - Logs in to the Acumen portal using employer credentials from `.env`
   - Waits for successful login and verifies by checking for "News Posts" heading

2. **Navigate to Pending Entries**:
   - Clicks the hamburger menu in the top right
   - Selects "Pending Entries" from the menu
   - Counts all pending entries for "HILDRETH HEATHER"

3. **Approve Each Entry**:
   - Clicks on the first pending entry
   - Clicks the "Approve" button (`#btnApprovePunch`)
   - Confirms approval by clicking "Yes" (`#btnSubmitApprove`)
   - Verifies the entry is marked as "Approved"
   - Returns to pending entries via hamburger menu
   - Repeats until all entries are approved

4. **Completion**:
   - Reports the total number of entries approved with formatted output

### Employee Side - Submit Punch Cards

The automation script (`submit-punchcards.spec.ts`) performs the following steps:

1. **Date Calculation**:
   - By default: Calculates previous week's Monday-Friday dates
   - With `START_DATE`: Processes single date (if weekday)
   - With `START_DATE` and `END_DATE`: Processes all weekdays in range
   - Always skips weekends (Saturday/Sunday)

2. **Authentication**:
   - Logs in to the Acumen portal using employee credentials from `.env`
   - Waits for successful login

3. **For Each Date**:
   - Opens hamburger menu and selects "New Entry"
   - Fills out the punch card form:
     - Client: Types "Kaden" and selects first autocomplete result (HILDRETH KADEN - MT2801)
     - Date: Enters the date being processed (MM/DD/YYYY)
     - Check In: 3:30 PM
     - Check Out: 7:30 PM
     - Adds reason: "Forgot to Clock In"
     - Adds reason: "Forgot to Clock Out"
   - Clicks Save (`#btnSubmitTransactionForm`)
   - Waits for submission to complete

4. **Completion**:
   - Reports the total number of entries submitted with formatted output

## Development Commands

### Playwright Test Commands

```bash
# Run all tests (including example.spec.ts)
npx playwright test

# Run tests in headed mode (show browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Run tests in UI mode (interactive test runner)
npx playwright test --ui

# View the last test report
npx playwright show-report

# Generate tests using Playwright's test generator
npx playwright codegen
```

## Project Structure

### Key Files

- **`approve-punchcards-single.spec.ts`**: Employer-side automation that approves all pending punch cards
- **`submit-punchcards.spec.ts`**: Employee-side automation that submits punch card entries for a date range
- **`example.spec.ts`**: Sample Playwright test (can be removed if not needed)
- **`playwright.config.ts`**: Playwright configuration
- **`.env`**: Contains credentials for both employer and employee (not in git, must be created from `.env.example`)

## Project Configuration

### Test Configuration (playwright.config.ts)

- **Test Directory**: Tests are located in the root directory (`./`)
- **Parallel Execution**: Tests run in parallel by default (`fullyParallel: true`)
- **Browser Projects**: Configured for Chromium, Firefox, and WebKit
- **CI Behavior**:
  - Retries failed tests 2 times on CI
  - Runs tests serially on CI (workers: 1)
  - Fails build if `test.only` is found
- **Tracing**: Enabled on first retry for failed tests

## Architecture Notes

- **Module System**: CommonJS (`"type": "commonjs"` in package.json)
- **TypeScript**: Project uses TypeScript for type safety
- **Environment Variables**: Managed with `dotenv` package, loaded in test files
  - **Employer Credentials**: `ACUMEN_EMPLOYER_USERNAME` and `ACUMEN_EMPLOYER_PASSWORD` - Used for approving punch cards
  - **Employee Credentials**: `ACUMEN_EMPLOYEE_USERNAME` and `ACUMEN_EMPLOYEE_PASSWORD` - Used for submitting punch cards
  - **Date Range (Optional)**: `START_DATE` and `END_DATE` - Control which dates the employee-side automation processes
- **Single Session Pattern**: Both automations perform login and actions in a single browser session for reliability
- **Target Employee/Client**:
  - Employer-side: Approves entries for "HILDRETH HEATHER"
  - Employee-side: Submits entries for client "HILDRETH KADEN - MT2801"
- **Dual-Side Design**: Complete automation system covering both:
  - **Employer**: Approve pending punch cards (weekly)
  - **Employee**: Submit punch card entries for date ranges (weekly, with weekday filtering)
- **Date Handling**:
  - Employee automation calculates previous week's Monday-Friday dates by default
  - Automatically skips weekends (Saturday/Sunday)
  - Supports custom date ranges via environment variables
- **Time Consistency**: Employee entries always use 3:30 PM - 7:30 PM shift

## Troubleshooting

### Login Failures

If you get authentication errors:
- Verify your credentials in the `.env` file
- Check that you're using the correct variable names: `ACUMEN_EMPLOYER_USERNAME` and `ACUMEN_EMPLOYER_PASSWORD`
- Try running with `npm run approve:headed` to see what's happening during login

### No Entries Found

If the script reports 0 pending entries but you know there are some:
- Check that the employee name in the script matches the actual name in the system
- Run with `npm run approve:headed` to visually inspect what's happening
- The page structure may have changed; update selectors in `approve-punchcards.spec.ts`

### Selectors Not Working

If buttons or elements can't be found:
- Use `npx playwright codegen` to generate new selectors
- Inspect the page and update the locators in the script
- The site may have been updated; check the current HTML structure

### Employee Submission Issues

If the employee-side automation fails:
- **Client autocomplete**: If "Kaden" doesn't autocomplete, increase the wait time in the script
- **Date format**: Ensure dates are in MM/DD/YYYY format
- **Weekend dates**: The script automatically skips weekends, so check the console output to see which dates are being processed
- **Form validation**: Run with `npm run submit:headed` to see if any form fields have validation errors
- **Previous week calculation**: The script calculates Monday-Friday of the previous week. If today is Tuesday, it will process Monday-Friday of last week.
