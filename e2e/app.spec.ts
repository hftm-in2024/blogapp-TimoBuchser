import { test, expect } from '@playwright/test';
import blogs from '../src/app/data/blogs.json';

test('shows all blog posts in the overview', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('mat-toolbar')).toContainText('HFTM Web Applications');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog-Übersicht');
  const cards = page.locator('app-blog-card');
  await expect(cards).toHaveCount(blogs.length);
  for (const blog of blogs) {
    const card = cards.filter({ has: page.locator('mat-card-title', { hasText: blog.title }) });
    await expect(card).toHaveCount(1);
    await expect(card.locator('mat-card-title')).toHaveText(blog.title);
    await expect(card.locator('mat-card-content')).toContainText(blog.contentPreview);
    await expect(card.getByRole('link', { name: 'Details', exact: true })).toHaveAttribute(
      'href',
      `/blog/${blog.id}`,
    );
  }
});

test('navigates from the overview to a blog detail and back', async ({ page }) => {
  const blog = blogs[0];
  await page.goto('/');
  const card = page.locator('app-blog-card').filter({
    has: page.locator('mat-card-title', { hasText: blog.title }),
  });
  await card.getByRole('link', { name: 'Details', exact: true }).click();
  await expect(page).toHaveURL(`/blog/${blog.id}`);
  await expect(page.locator('article mat-card-title')).toHaveText(blog.title);
  await expect(page.locator('article mat-card-content')).toContainText(blog.contentPreview);
  await page
    .getByRole('navigation', { name: 'Hauptnavigation' })
    .getByRole('link', { name: 'Blog', exact: true })
    .click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('app-blog-card')).toHaveCount(blogs.length);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog-Übersicht');
});
