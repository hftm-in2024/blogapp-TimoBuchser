import { test, expect } from '@playwright/test';

test('should display the blog overview', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('mat-toolbar')).toContainText('Blogs');
  await expect(page.locator('h1')).toContainText('Blog-Übersicht');
});
