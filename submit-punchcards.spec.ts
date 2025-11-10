import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper function to get previous week's Monday-Friday dates
function getPreviousWeekDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();

  // Get last Monday (start of previous week)
  const dayOfWeek = today.getDay();
  const daysToLastMonday = dayOfWeek === 0 ? 8 : dayOfWeek + 6; // If Sunday, go back 8 days; otherwise dayOfWeek + 6
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysToLastMonday);

  // Add Monday through Friday
  for (let i = 0; i < 5; i++) {
    const date = new Date(lastMonday);
    date.setDate(lastMonday.getDate() + i);
    dates.push(date);
  }

  return dates;
}

// Helper function to get weekdays in a date range
function getWeekdaysInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    // Only include Monday (1) through Friday (5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// Helper function to format date as MM/DD/YYYY
function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

// Helper function to parse date from MM/DD/YYYY string
function parseDate(dateStr: string): Date {
  const [month, day, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

test.describe('Punch Card Submission Automation', () => {
  test('submit punch cards for employee', async ({ page }) => {
    // Set a longer timeout for this test (10 minutes for multiple entries)
    test.setTimeout(600000); // 10 minutes

    const username = process.env.ACUMEN_EMPLOYEE_USERNAME;
    const password = process.env.ACUMEN_EMPLOYEE_PASSWORD;

    if (!username || !password) {
      throw new Error('ACUMEN_EMPLOYEE_USERNAME and ACUMEN_EMPLOYEE_PASSWORD must be set in .env file');
    }

    // Determine which dates to process
    let datesToProcess: Date[];

    if (process.env.START_DATE && process.env.END_DATE) {
      // Use specified date range
      const startDate = parseDate(process.env.START_DATE);
      const endDate = parseDate(process.env.END_DATE);
      datesToProcess = getWeekdaysInRange(startDate, endDate);
      console.log(`Processing date range: ${process.env.START_DATE} to ${process.env.END_DATE}`);
    } else if (process.env.START_DATE) {
      // Use single date
      const startDate = parseDate(process.env.START_DATE);
      const dayOfWeek = startDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        datesToProcess = [startDate];
        console.log(`Processing single date: ${process.env.START_DATE}`);
      } else {
        console.log(`Skipping ${process.env.START_DATE} - not a weekday`);
        datesToProcess = [];
      }
    } else {
      // Default: previous week (Monday-Friday)
      datesToProcess = getPreviousWeekDates();
      console.log('Processing previous week (Monday-Friday)');
    }

    if (datesToProcess.length === 0) {
      console.log('✓ No dates to process!');
      return;
    }

    console.log(`Found ${datesToProcess.length} weekday(s) to process:\n${datesToProcess.map(d => `  - ${formatDate(d)}`).join('\n')}`);

    // Step 1: Login
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Logging in...');
    await page.goto('https://acumen.dcisoftware.com/Mobile/MobileHome/Login');

    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password/ Pin').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for successful login
    await page.waitForURL(/.*\/Mobile\/MobileHome/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'News Posts' })).toBeVisible({ timeout: 5000 });
    console.log('✓ Login successful!');

    // Step 2: Process each date
    let successCount = 0;

    for (let i = 0; i < datesToProcess.length; i++) {
      const date = datesToProcess[i];
      const formattedDate = formatDate(date);

      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Processing ${i + 1}/${datesToProcess.length}: ${formattedDate}`);

      // Navigate to New Entry via hamburger menu
      console.log('  → Opening hamburger menu...');
      await page.locator('#menu-button').click();
      await page.waitForTimeout(500);

      console.log('  → Clicking New Entry...');
      await page.locator('a[href="/Mobile/Entry/AddEntry"]').click();
      await page.waitForLoadState('load');
      await page.waitForTimeout(500);

      // Fill out the form
      console.log('  → Filling out form...');

      // Type client name and wait for autocomplete
      console.log('    • Typing client name "Kaden"...');
      const clientInput = page.locator('#txtClientAccount');
      await clientInput.fill('Kaden');

      // Wait for autocomplete dropdown to appear with actual content
      console.log('    • Waiting for autocomplete dropdown...');
      await page.locator('.ui-menu-item-wrapper:has-text("HILDRETH KADEN")').waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(500); // Brief pause for dropdown to fully render

      // Click the first item in the autocomplete dropdown
      console.log('    • Selecting "HILDRETH KADEN - MT2801"...');
      await page.locator('.ui-menu-item-wrapper:has-text("HILDRETH KADEN")').first().click();
      await page.waitForTimeout(500);

      // Enter date
      console.log(`    • Entering date: ${formattedDate}...`);
      await page.locator('#PunchDate').fill(formattedDate);

      // Enter check in time
      console.log('    • Entering check in time: 3:30 PM...');
      await page.locator('#PunchInTime').clear();
      await page.locator('#PunchInTime').fill('3:30 PM');

      // Enter check out time
      console.log('    • Entering check out time: 7:30 PM...');
      await page.locator('#PunchOutTime').clear();
      await page.locator('#PunchOutTime').fill('7:30 PM');

      // Select "Forgot to Clock In" reason and click Add
      console.log('    • Adding "Forgot to Clock In" reason...');
      await page.locator('#drpCustomReason').selectOption({ label: 'Forgot to Clock In' });
      await page.locator('i.fa-plus-circle.add-icon').first().click();
      await page.waitForTimeout(500);

      // Select "Forgot to Clock Out" reason and click Add
      console.log('    • Adding "Forgot to Clock Out" reason...');
      await page.locator('#drpCustomReason').selectOption({ label: 'Forgot to Clock Out' });
      await page.locator('i.fa-plus-circle.add-icon').first().click();
      await page.waitForTimeout(500);

      // Click Save
      console.log('    • Clicking Save...');
      await page.locator('#btnSubmitTransactionForm').click();
      await page.waitForTimeout(500); // Wait for modal to appear

      // Click Yes on the confirmation modal
      console.log('    • Confirming submission...');
      await page.getByRole('button', { name: 'Yes' }).click();
      await page.waitForTimeout(1500); // Wait for save to complete

      // Check for success
      console.log('  ✓ Entry submitted successfully!');
      successCount++;

      // Brief pause before next entry
      await page.waitForTimeout(1000);
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✓ Automation complete!`);
    console.log(`  Submitted: ${successCount} of ${datesToProcess.length} entries`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  });
});
