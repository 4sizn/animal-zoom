import { test, expect } from '@playwright/test';
import { FAKE_TOKEN, injectAuthToken, mockServerApis } from './helpers';

test.describe('인증 (Auth)', () => {
  test('로그인 페이지가 올바르게 렌더링된다', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Continue as demo' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Create account' }),
    ).toBeVisible();
  });

  test('"Continue as demo" 클릭 시 대시보드로 이동한다', async ({ page }) => {
    await mockServerApis(page);
    await page.goto('/login');

    await page.getByRole('button', { name: 'Continue as demo' }).click();

    await expect(page).toHaveURL('/dashboard', { timeout: 8000 });
  });

  test('잘못된 로그인 시 에러 메시지가 표시된다', async ({ page }) => {
    await mockServerApis(page);
    await page.goto('/login');

    await page.locator('#login-email').fill('wrong@example.com');
    await page.locator('#login-password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // 에러 메시지 또는 로그인 실패 상태 확인
    await expect(page.locator('text=invalid_credentials').or(
      page.locator('[class*="red"]').first()
    )).toBeVisible({ timeout: 5000 });
  });

  test('토큰이 있으면 / 경로에서 대시보드로 리다이렉트된다', async ({ page }) => {
    await injectAuthToken(page);
    await mockServerApis(page);

    await page.goto('/');

    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });

  test('로그아웃 시 /login으로 리다이렉트된다', async ({ page }) => {
    await injectAuthToken(page);
    await mockServerApis(page);

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });

    // 로그아웃 버튼 클릭
    await page.getByTitle('Logout').click();

    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
});
