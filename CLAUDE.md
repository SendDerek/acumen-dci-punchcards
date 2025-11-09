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

3. Edit `.env` and add your Acumen employer credentials:
```
ACUMEN_EMPLOYER_USERNAME=your_username
ACUMEN_EMPLOYER_PASSWORD=your_password
```

Note: Employee credentials (for Heather) can be added later for employee-side automation.

### Running the Automation

```bash
# Approve all pending punch cards (headless mode)
npm run approve

# Run with visible browser (watch it work)
npm run approve:headed

# Run in debug mode (step through the automation)
npm run approve:debug
```

## Automation Workflow

The automation script (`approve-punchcards-single.spec.ts`) performs the following steps in a single browser session:

1. **Authentication**:
   - Logs in to the Acumen portal using credentials from `.env`
   - Waits for successful login and verifies by checking for "News Posts" heading

2. **Navigate to Pending Entries**:
   - Clicks the hamburger menu in the top right
   - Selects "Pending Entries" from the menu
   - Counts all pending entries for "HILDRETH HEATHER"

3. **Approve Each Entry**:
   - Clicks on the first pending entry
   - Clicks the "Approve" button
   - Confirms approval by clicking "Yes" in the dialog
   - Verifies the entry is marked as "Approved"
   - Clicks "Back" to return to the list
   - Repeats until all entries are approved

4. **Completion**:
   - Reports the total number of entries approved with formatted output

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

- **`approve-punchcards-single.spec.ts`**: Main automation script that handles login and approves all pending punch cards in a single browser session
- **`example.spec.ts`**: Sample Playwright test (can be removed if not needed)
- **`playwright.config.ts`**: Playwright configuration
- **`.env`**: Contains credentials (not in git, must be created from `.env.example`)

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
  - **Employee Credentials**: `ACUMEN_EMPLOYEE_USERNAME` and `ACUMEN_EMPLOYEE_PASSWORD` - Reserved for future employee-side automation (Heather submitting punch cards)
- **Single Session Pattern**: The automation performs login and approval in a single browser session for reliability
- **Target Employee**: Current automation specifically looks for and approves entries for "HILDRETH HEATHER"
- **Dual-Side Design**: Project is structured to support both employer-side (approval) and employee-side (submission) automation

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
