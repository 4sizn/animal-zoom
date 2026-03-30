import { test, expect } from '@playwright/test';
import { FAKE_TOKEN, injectAuthToken, mockServerApis } from './helpers';

test.describe('방(Room) 기능', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page);
    await mockServerApis(page);
  });

  test('방 생성 페이지가 올바르게 렌더링된다', async ({ page }) => {
    await page.goto('/room/create');

    await expect(page.getByText('Create a room')).toBeVisible();
    await expect(page.locator('#room-name')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Create room' }),
    ).toBeVisible();
  });

  test('방 이름 없이 제출하면 에러가 표시된다', async ({ page }) => {
    await page.goto('/room/create');

    await page.getByRole('button', { name: 'Create room' }).click();

    await expect(page.getByText('Room name is required.')).toBeVisible();
  });

  test('방 이름 입력 후 생성하면 스터디룸으로 이동한다', async ({ page }) => {
    await page.goto('/room/create');

    await page.locator('#room-name').fill('E2E Test Room');
    await page.getByRole('button', { name: 'Create room' }).click();

    // POST /rooms 모킹에 의해 room-e2e-test로 navigate
    await expect(page).toHaveURL('/room/study/room-e2e-test', { timeout: 8000 });
  });

  test('스터디룸 페이지가 로드된다', async ({ page }) => {
    await page.goto('/room/study/room-e2e-test');

    // aside(채팅 사이드바)가 DOM에 마운트될 때까지 대기 (React 렌더 완료 신호)
    const chatSidebar = page.locator('aside');
    await chatSidebar.waitFor({ state: 'attached', timeout: 20000 });

    // Desktop에서 사이드바가 viewport 안에 있음 (기본 open)
    await expect(chatSidebar).toBeInViewport({ timeout: 10000 });
  });

  test('채팅 사이드바를 열고 닫을 수 있다', async ({ page }) => {
    await page.goto('/room/study/room-e2e-test');

    const chatSidebar = page.locator('aside');
    await chatSidebar.waitFor({ state: 'attached', timeout: 20000 });

    // Desktop에서 사이드바는 처음부터 열려 있음 → viewport 안에 있음
    await expect(chatSidebar).toBeInViewport({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Close chat' })).toBeVisible();

    // 닫기 → CSS translateX(100%)로 viewport 밖으로 이동
    await page.getByRole('button', { name: 'Close chat' }).click();
    await expect(chatSidebar).not.toBeInViewport({ timeout: 5000 });

    // 다시 열기
    await page.getByRole('button', { name: 'Open chat' }).click();
    await expect(chatSidebar).toBeInViewport({ timeout: 5000 });
  });

  test('채팅 사이드바에서 연결 중 메시지가 표시된다', async ({ page }) => {
    await page.goto('/room/study/room-e2e-test');

    // aside가 DOM에 나타날 때까지 대기
    await page.locator('aside').waitFor({ state: 'attached', timeout: 20000 });

    // socket 연결 안 됨 → "Connecting chat..." 표시 (token은 있지만 socket 미연결)
    await expect(
      page.getByText('Connecting chat...').or(
        page.locator('textarea#study-chat-input')
      ).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('채팅 사이드바를 닫을 수 있다', async ({ page }) => {
    await page.goto('/room/study/room-e2e-test');

    const chatSidebar = page.locator('aside');
    await chatSidebar.waitFor({ state: 'attached', timeout: 20000 });

    // Desktop에서 사이드바는 처음부터 열려 있음
    await expect(chatSidebar).toBeInViewport({ timeout: 5000 });

    // 닫기 → viewport 밖으로 이동
    await page.getByRole('button', { name: 'Close chat' }).click();
    await expect(chatSidebar).not.toBeInViewport({ timeout: 5000 });
  });

  test('방으로 돌아가기 버튼으로 대시보드로 이동', async ({ page }) => {
    await page.goto('/room/create');

    await page.getByRole('button', { name: 'Back' }).click();

    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });
});
