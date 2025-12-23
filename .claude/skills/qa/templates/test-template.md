# Test Case Template

## Test Information
- **Feature**: [Feature name]
- **Test Type**: [ ] Unit  [ ] Integration  [ ] E2E
- **Priority**: [ ] High  [ ] Medium  [ ] Low
- **Created**: [Date]
- **Last Updated**: [Date]

---

## Test Scenario: [Brief description]

### Objective
[What this test is trying to validate]

### Preconditions
- [ ] [Condition 1 - e.g., User is logged in]
- [ ] [Condition 2 - e.g., Database has test data]
- [ ] [Condition 3 - e.g., API is running]

### Test Data
```
[Required test data]
- Email: test@example.com
- Password: TestPass123!
- etc.
```

---

## Test Steps

### Test Case 1: [Happy Path / Main Scenario]
**Steps**:
1. [Action 1]
2. [Action 2]
3. [Action 3]

**Expected Result**:
- [Expected behavior 1]
- [Expected behavior 2]

**Actual Result**: [To be filled during execution]

**Status**: [ ] Pass  [ ] Fail  [ ] Blocked

---

### Test Case 2: [Error / Edge Case]
**Steps**:
1. [Action 1]
2. [Action 2]

**Expected Result**:
- [Expected error message or behavior]

**Actual Result**: [To be filled during execution]

**Status**: [ ] Pass  [ ] Fail  [ ] Blocked

---

### Test Case 3: [Boundary Condition]
**Steps**:
1. [Action 1]
2. [Action 2]

**Expected Result**:
- [Expected behavior]

**Actual Result**: [To be filled during execution]

**Status**: [ ] Pass  [ ] Fail  [ ] Blocked

---

## Code Example (For Automated Tests)

```javascript
// Unit Test Example
describe('[Feature Name]', () => {
  it('should [expected behavior]', () => {
    // Arrange
    const input = '...';

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe('expected');
  });

  it('should handle errors gracefully', () => {
    expect(() => functionUnderTest(null)).toThrow();
  });
});
```

```javascript
// E2E Test Example
test('should complete user flow', async ({ page }) => {
  await page.goto('/feature');
  await page.fill('[name="input"]', 'test value');
  await page.click('button[type="submit"]');
  await expect(page.locator('.success')).toBeVisible();
});
```

---

## Coverage Checklist

- [ ] Happy path tested
- [ ] Error conditions tested
- [ ] Boundary values tested
- [ ] Edge cases tested
- [ ] Null/undefined inputs tested
- [ ] Invalid inputs tested
- [ ] Performance acceptable
- [ ] Accessibility validated

---

## Dependencies
- [ ] [Dependent feature 1]
- [ ] [Dependent API 1]
- [ ] [Dependent service 1]

---

## Notes
[Any additional notes, blockers, or observations]

---

## Automation Status
- [ ] Manual test only
- [ ] Automated test written
- [ ] Automated test in CI/CD pipeline
- [ ] Regression test suite

---

**Tested By**: [Name]
**Test Environment**: [ ] Local  [ ] Dev  [ ] Staging  [ ] Production
**Browser/Device**: [Chrome 120 / iPhone 14 Pro / etc.]
