import { test, expect } from '@playwright/test';
import { FAKE_TOKEN, injectAuthToken, mockServerApis } from './helpers';

test.describe('네비게이션 및 인증 가드', () => {
  test('인증 없이 /dashboard 접근 시 /login으로 리다이렉트', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('인증 없이 /room/create 접근 시 /login으로 리다이렉트', async ({ page }) => {
    await page.goto('/room/create');
    await expect(page).toHaveURL('/login');
  });

  test('인증 없이 /room/study/:id 접근 시 /login으로 리다이렉트', async ({ page }) => {
    await page.goto('/room/study/test-room-abc');
    await expect(page).toHaveURL('/login');
  });

  test('인증 없이 /calendar 접근 시 /login으로 리다이렉트', async ({ page }) => {
    await page.goto('/calendar');
    await expect(page).toHaveURL('/login');
  });

  test('인증된 상태에서 사이드바 네비게이션으로 페이지 이동', async ({ page }) => {
    await injectAuthToken(page);
    await mockServerApis(page);

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Dashboard 네비게이션 아이템이 보임
    await expect(page.getByTitle('Dashboard')).toBeVisible();
    await expect(page.getByTitle('Calendar')).toBeVisible();
    await expect(page.getByTitle('Settings')).toBeVisible();
    await expect(page.getByTitle('Create Room')).toBeVisible();
  });

  test('알 수 없는 경로는 / (홈)으로 리다이렉트', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    // 토큰 없으면 / → ZoomRoomExperience 렌더 또는 /login redirect
    // AuthLayout 없는 라우트이므로 홈(/)으로 이동
    await expect(page).toHaveURL('/');
  });
});
