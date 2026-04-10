import { test, expect, Page, Locator } from '@playwright/test';

const BASE = 'https://foreteller.pages.dev';

// MUI v8 DatePicker uses spinbutton segments (DD, MM, YYYY).
// After typing the day digits, MUI auto-advances to the next segment.
async function fillMuiDate(page: Page, datePickerIndex: number, day: string, month: string, year: string) {
  const daySpins = page.locator('span[aria-label="Day"][role="spinbutton"]');
  const dayField = daySpins.nth(datePickerIndex);
  await dayField.click();
  // Type day — MUI auto-advances to month
  await page.keyboard.type(day, { delay: 50 });
  // Small pause to let MUI advance focus
  await page.waitForTimeout(200);
  // Type month — MUI auto-advances to year
  await page.keyboard.type(month, { delay: 50 });
  await page.waitForTimeout(200);
  // Type year
  await page.keyboard.type(year, { delay: 50 });
  // Click outside to confirm
  await page.keyboard.press('Escape');
}

test.describe('Foreteller — Smoke Tests', () => {

  test('homepage loads with title and language selector', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('text=Foreteller')).toBeVisible();
    await expect(page.locator('button:has-text("EN")')).toBeVisible();
    await expect(page.locator('button:has-text("DE")')).toBeVisible();
    await expect(page.locator('button:has-text("UA")')).toBeVisible();
    await expect(page.locator('button:has-text("RU")')).toBeVisible();
  });

  test('language switch changes subtitle text', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('text=WISDOM OF STARS AND NUMBERS')).toBeVisible();

    await page.locator('button:has-text("DE")').click();
    await expect(page.locator('text=WEISHEIT DER STERNE UND ZAHLEN')).toBeVisible({ timeout: 5000 });

    await page.locator('button:has-text("RU")').click();
    await expect(page.locator('text=МУДРОСТЬ ЗВЕЗД И ЧИСЕЛ')).toBeVisible({ timeout: 5000 });
  });

  test('mode toggle switches between analysis and compatibility', async ({ page }) => {
    await page.goto(BASE);
    const analysisBtn = page.locator('button:has-text("Personal Analysis")');
    const compatBtn = page.locator('button:has-text("Compatibility")');
    await expect(analysisBtn).toBeVisible();
    await expect(compatBtn).toBeVisible();

    await compatBtn.click();
    await expect(page.locator('text=Partner 1')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Partner 2')).toBeVisible({ timeout: 5000 });

    await analysisBtn.click();
    await expect(page.locator('text=Partner 1')).not.toBeVisible();
  });

  test('analysis form requires date before submit', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('button:has-text("Reveal the Mystery")').click();
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
  });

  test('personal analysis flow — fill form and get results', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(BASE);
    await page.locator('button:has-text("EN")').click();

    // Fill date using MUI spinbutton segments: DD.MM.YYYY = 15.06.1990
    await fillMuiDate(page, 0, '15', '06', '1990');

    // Select female
    await page.locator('button:has-text("Female")').click();

    // Submit
    await page.locator('button:has-text("Reveal the Mystery")').click();

    // Wait for results to appear
    await expect(page.locator('text=Pythagoras')).toBeVisible({ timeout: 90_000 });
  });

  test('compatibility form — fill both partners and get results', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(BASE);
    await page.locator('button:has-text("EN")').click();

    // Switch to compatibility mode
    await page.locator('button:has-text("Compatibility")').click();
    await expect(page.locator('text=Partner 1')).toBeVisible({ timeout: 5000 });

    // Fill Partner 1 date (index 0): 15.06.1990
    await fillMuiDate(page, 0, '15', '06', '1990');

    // Fill Partner 2 date (index 1): 22.03.1992
    await fillMuiDate(page, 1, '22', '03', '1992');

    // Submit
    await page.locator('button:has-text("Check Compatibility")').click();

    // Wait for AI-generated content
    await expect(page.locator('h3').first()).toBeVisible({ timeout: 90_000 });
  });

  test('compatibility results respect selected language (EN)', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(BASE);
    await page.locator('button:has-text("EN")').click();

    // Switch to compatibility mode
    await page.locator('button:has-text("Compatibility")').click();
    await expect(page.locator('text=Partner 1')).toBeVisible({ timeout: 5000 });

    // Fill dates
    await fillMuiDate(page, 0, '10', '01', '1985');
    await fillMuiDate(page, 1, '20', '07', '1988');

    // Submit
    await page.locator('button:has-text("Check Compatibility")').click();

    // Wait for the "Consulting the stars..." spinner to disappear (means API responded)
    await expect(page.getByText('Consulting the stars...')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Consulting the stars...')).not.toBeVisible({ timeout: 90_000 });

    // Get all visible text after results loaded
    const bodyText = await page.locator('body').textContent() || '';

    // Results in English should NOT contain Russian section headers
    const russianHeaders = /Синергия Душ|Нумерологический Резонанс|Звездное Притяжение|Совет Космоса/;
    expect(bodyText).not.toMatch(russianHeaders);

    // Results should contain English section headers
    const englishHeaders = /Soul Synergy|Numerical Resonance|Stellar Attraction|Cosmic Advice/i;
    expect(bodyText).toMatch(englishHeaders);
  });

  test('footer links are present', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('text=Viktor Ralchenko')).toBeVisible();
    await expect(page.locator('a[href*="linkedin"]')).toBeVisible();
    await expect(page.locator('a[href*="mailto"]')).toBeVisible();
  });
});
