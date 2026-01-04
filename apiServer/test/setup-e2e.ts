// Mock uuid module for E2E tests
jest.mock('uuid', () => {
  const actual = jest.requireActual('uuid');
  return {
    ...actual,
    v4: jest.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9)),
  };
});
