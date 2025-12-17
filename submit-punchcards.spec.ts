import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper function to get previous week's Monday-Friday dates
function getPreviousWeekDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();

  // Get Monday of the current/most recent week
  const dayOfWeek = today.getDay();
  // If Sunday (0), go back 6 days to get last Monday
  // Otherwise, go back (dayOfWeek - 1) days to get to Monday of current week
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysToMonday);

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

// Helper function to check for and handle announcement splash screen
async function handleAnnouncementIfPresent(page: import('@playwright/test').Page): Promise<void> {
  // Check if the OK button exists (indicates an announcement is present)
  const okButton = page.locator('#btnACK');
  const isAnnouncementPresent = await okButton.isVisible({ timeout: 2000 }).catch(() => false);

  if (isAnnouncementPresent) {
    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                    📢 SYSTEM ANNOUNCEMENT                        ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');

    // Extract the announcement content from the splash carousel
    const carousel = page.locator('#splashCarousel');
    const announcementText = await carousel.textContent().catch(() => 'Unable to extract announcement text');

    // Clean up and format the text for logging
    const cleanedText = announcementText?.trim().replace(/\s+/g, ' ') || 'No content found';

    // Log the announcement with word wrapping for readability
    const words = cleanedText.split(' ');
    let line = '║ ';
    for (const word of words) {
      if (line.length + word.length > 68) {
        console.log(line.padEnd(69) + '║');
        line = '║ ';
      }
      line += word + ' ';
    }
    if (line.trim() !== '║') {
      console.log(line.padEnd(69) + '║');
    }

    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    // Click OK to dismiss the announcement
    await okButton.click();
    await page.waitForTimeout(500);
    console.log('✓ Announcement acknowledged');
  }
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
      // Default: current/most recent week (Monday-Friday)
      datesToProcess = getPreviousWeekDates();
      console.log('Processing current/most recent week (Monday-Friday)');
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

    // Check for and handle any system announcements
    await handleAnnouncementIfPresent(page);

    await expect(page.getByRole('heading', { name: 'News Posts' })).toBeVisible({ timeout: 5000 });
    console.log('✓ Login successful!');

    // Step 2: Process each date
    let successCount = 0;
    let skippedCount = 0;

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
      await page.waitForTimeout(500); // Wait for response

      // Check for error messages before proceeding
      const errorElement = page.locator('#lblErrorMaxMIN');
      const hasError = await errorElement.isVisible().catch(() => false);

      if (hasError) {
        const errorText = await errorElement.textContent() || 'Unknown error';

        // Check if it's a duplicate/overlapping punch error (safe to skip)
        if (errorText.includes('duplicate or overlapping punch')) {
          console.log('  ⚠ SKIPPED: Duplicate entry already exists for this date');
          console.log(`    Error: ${errorText.substring(0, 100)}...`);
          skippedCount++;

          // Navigate away via hamburger menu (avoids multiple Cancel button ambiguity)
          await page.locator('#menu-button').click();
          await page.waitForTimeout(500);

          // Continue to next date
          continue;
        } else {
          // Unknown error - fail the test
          console.error('  ✖ ERROR: Unexpected error encountered');
          console.error(`    ${errorText}`);
          throw new Error(`Submission failed: ${errorText}`);
        }
      }

      // No error - proceed with confirmation
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
    if (skippedCount > 0) {
      console.log(`  Skipped:   ${skippedCount} (duplicates already existed)`);
    }
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  });
});
