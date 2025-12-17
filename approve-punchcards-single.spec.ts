import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

test.describe('Punch Card Approval Automation', () => {
  test('login and approve all pending punch cards for Heather', async ({ page }) => {
    // Set a longer timeout for this test (10 minutes for many entries)
    test.setTimeout(600000); // 10 minutes
    const username = process.env.ACUMEN_EMPLOYER_USERNAME;
    const password = process.env.ACUMEN_EMPLOYER_PASSWORD;

    if (!username || !password) {
      throw new Error('ACUMEN_EMPLOYER_USERNAME and ACUMEN_EMPLOYER_PASSWORD must be set in .env file');
    }

    // Step 1: Login
    console.log('Navigating to login page...');
    await page.goto('https://acumen.dcisoftware.com/Mobile/MobileHome/Login');

    console.log('Logging in...');
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password/ Pin').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for successful login
    await page.waitForURL(/.*\/Mobile\/MobileHome/, { timeout: 10000 });

    // Check for and handle any system announcements
    await handleAnnouncementIfPresent(page);

    await expect(page.getByRole('heading', { name: 'News Posts' })).toBeVisible({ timeout: 5000 });
    console.log('✓ Login successful!');

    // Step 2: Navigate to Pending Entries via hamburger menu
    console.log('\nOpening hamburger menu...');
    const hamburgerMenu = page.locator('#menu-button');
    await hamburgerMenu.click();
    await page.waitForTimeout(500); // Wait for menu animation

    console.log('Clicking Pending Entries...');
    await page.locator('a[href="/Mobile/Entry/PendingEntries"]').click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(500); // Brief pause for list to load
    console.log('✓ Navigated to Pending Entries');

    // Step 3: Get count of pending entries
    const pendingEntriesHeader = await page.textContent('h1, h2, .page-title, [class*="title"]').catch(() => '');
    console.log(`Page header: ${pendingEntriesHeader}`);

    // Find all pending entry links within the entries div
    const entriesDiv = page.locator('#entriesDiv');
    const entryLinks = entriesDiv.locator('a');
    const entryCount = await entryLinks.count();
    console.log(`\nFound ${entryCount} pending entries`);

    if (entryCount === 0) {
      console.log('✓ No pending entries to approve!');
      return;
    }

    // Step 4: Approve each entry one by one
    let approvedCount = 0;

    // We need to loop and always click the first entry since the list updates after each approval
    for (let i = 0; i < entryCount; i++) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Processing entry ${i + 1} of ${entryCount}...`);

      // Wait a moment for the list to update
      await page.waitForTimeout(1000);

      // Find the first pending entry link in the entries div
      const firstEntry = page.locator('#entriesDiv a').first();

      // Check if entry exists
      const isVisible = await firstEntry.isVisible().catch(() => false);
      if (!isVisible) {
        console.log('⚠ No more pending entries found');
        break;
      }

      // Get the entry details before clicking
      const entryText = await firstEntry.textContent();
      console.log(`Entry: ${entryText?.substring(0, 100).trim()}...`);

      // Click on the entry to view details
      await firstEntry.click();

      // Wait for the detail page to load (use 'load' instead of 'networkidle' to avoid timeout)
      await page.waitForLoadState('load');
      await page.waitForTimeout(500); // Brief pause for page to settle

      // Click the Approve button
      console.log('  → Clicking Approve button...');
      await page.locator('#btnApprovePunch').click();

      // Wait for confirmation dialog
      await page.waitForTimeout(500);

      // Click Yes on the confirmation dialog
      console.log('  → Confirming approval...');
      await page.locator('#btnSubmitApprove').click();

      // Wait for the approval to process
      await page.waitForTimeout(1000); // Wait for approval to process

      // Verify approval was successful by checking for "Approved" status
      const approvedStatus = await page.locator('text="Approved"').isVisible().catch(() => false);
      if (approvedStatus) {
        console.log('  ✓ Entry approved successfully!');
        approvedCount++;
      } else {
        console.log('  ⚠ Warning: Could not confirm approval status');
      }

      // Navigate back to pending entries via hamburger menu
      console.log('  → Returning to pending entries list...');
      await page.locator('#menu-button').click();
      await page.waitForTimeout(500); // Wait for menu animation
      await page.locator('a[href="/Mobile/Entry/PendingEntries"]').click();
      await page.waitForLoadState('load');
      await page.waitForTimeout(500); // Brief pause for list to update
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✓ Automation complete!`);
    console.log(`  Approved: ${approvedCount} of ${entryCount} entries`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  });
});
