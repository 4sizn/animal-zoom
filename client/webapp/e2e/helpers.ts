import type { Page } from '@playwright/test';

export const FAKE_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.fakesignaturehere';

/**
 * localStorage에 가짜 토큰을 주입하여 인증된 상태로 시작
 */
export async function injectAuthToken(page: Page, token = FAKE_TOKEN) {
  await page.addInitScript((t) => {
    localStorage.setItem('auth_token', t);
  }, token);
}

/**
 * 서버 API 호출을 모두 모킹 (서버 없이 테스트 가능)
 */
export async function mockServerApis(page: Page, token = FAKE_TOKEN) {
  await page.route('**/localhost:3000/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes('/auth/demo')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, accessToken: token }),
      });
    } else if (url.includes('/auth/login')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'invalid_credentials' }),
      });
    } else if (url.includes('/users/me/3d-profile')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false }),
      });
    } else if (url.includes('/rooms') && method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, room: { id: 'room-e2e-test' } }),
      });
    } else if (url.match(/\/rooms\/[^/]+$/) && method === 'GET') {
      const roomId = url.split('/rooms/')[1]?.split('?')[0] ?? 'room-e2e-test';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          room: { id: roomId, name: 'E2E Test Room' },
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false }),
      });
    }
  });

  // Socket.io long-polling도 모킹
  await page.route('**/zoom/**', async (route) => {
    await route.abort();
  });
}
