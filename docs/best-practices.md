# Agent System Best Practices

## 🎯 Core Principles

1. **Right Agent, Right Task**: Use specialized agents for their expertise
2. **Context is King**: More context = better results
3. **Iterate and Refine**: Start simple, add details as needed
4. **Trust but Verify**: Review agent output before applying
5. **Document Decisions**: Keep track of architectural choices

---

## 📝 Writing Effective Requests

### ✅ Good Request Structure

```
[Agent] [Action] [Target] [Context] [Constraints]

Example:
/server Create user authentication API using JWT with refresh tokens, PostgreSQL database
```

**Components**:
- **Agent**: Which agent to invoke
- **Action**: What to do (create, fix, optimize, design, test)
- **Target**: What specifically (API endpoint, component, feature)
- **Context**: Tech stack, current state, related systems
- **Constraints**: Requirements, limitations, preferences

### ❌ Poor vs ✅ Good Requests

**Poor**:
```
/web make it better
```
**Problems**: Vague, no target, no goal

**Good**:
```
/web Optimize the UserDashboard component - reduce re-renders and improve load time from 2s to <500ms
```
**Why**: Specific target, measurable goal, clear action

---

**Poor**:
```
/mobile fix the bug
```
**Problems**: Which bug? Where? How to reproduce?

**Good**:
```
/mobile Fix login bug on iOS 16 - keyboard doesn't appear when tapping email input field
```
**Why**: Platform-specific, reproducible, clear issue

---

**Poor**:
```
/designer design something
```
**Problems**: No context, no requirements, no reference to concepts

**Good**:
```
/designer Review concepts in docs/concept/img and design a user profile page with avatar upload, bio section, and activity feed
```
**Why**: References concepts, specific components, clear scope

---

## 🎨 Design Workflow Best Practices

### Always Start with Concept Images

**Workflow**:
```
1. Add design mockups/inspiration to docs/concept/img/
2. Invoke Designer
3. Designer extracts colors, fonts, patterns
4. Designer creates aligned designs
```

**Example**:
```bash
# 1. Add concept images
cp ~/Downloads/app-mockup.png docs/concept/img/

# 2. Invoke Designer
/designer Review the concept images and create a design system with color palette, typography, and component specs
```

### Design → Implementation → Test Loop

```
/designer Design feature
→ Review and approve design
→ /web or /mobile Implement design
→ /qa Test implementation
→ Iterate if needed
```

---

## 🔧 Development Workflow Best Practices

### Feature Development Flow

**Full-Stack Feature**:
```
/orchestrator [Feature description with full requirements]

Orchestrator coordinates:
1. /designer - UI/UX design (if needed)
2. /server - API endpoints
3. /web and/or /mobile - UI implementation
4. /qa - Comprehensive testing
```

**Example**:
```
/orchestrator Build a comments system:
- Users can add, edit, delete comments
- Real-time updates
- Nested replies (2 levels max)
- Moderation tools for admins
```

### Bug Fix Flow

**Simple Bug (Single Domain)**:
```
/[specific-agent] Fix [clear bug description with reproduction steps]
→ /qa Verify fix and add regression test
```

**Complex Bug (Multiple Domains)**:
```
/orchestrator [Bug description]
→ Orchestrator triages and coordinates fix
→ /qa Comprehensive testing
```

---

## ✅ Testing Best Practices

### Test-Driven Development

**Ideal Flow**:
```
1. /qa Write failing tests for [feature]
2. /[developer-agent] Implement feature to make tests pass
3. /qa Verify tests pass and add edge case tests
```

**Example**:
```
/qa Write unit tests for user registration including:
- Valid email/password
- Duplicate email rejection
- Password strength validation
- Database transaction handling
```

### Coverage Goals

**Per Component**:
- Business logic: >80%
- API endpoints: >70%
- UI components: Integration tests for critical paths

**Request**:
```
/qa Analyze test coverage for the authentication module and create a plan to reach 85% coverage
```

---

## 🚀 Performance Optimization Best Practices

### Systematic Approach

```
1. /orchestrator Profile app performance - identify bottlenecks
2. Orchestrator coordinates specialists:
   - /server: API response times, database queries
   - /web: Bundle size, render performance, LCP
   - /mobile: Startup time, FPS, memory usage
3. Each agent implements optimizations
4. /qa: Performance regression testing
```

### Measure Before and After

**Always include metrics**:
```
/web Optimize dashboard load time:
- Current: 3.2s LCP
- Target: <1.5s LCP
- Measure with Lighthouse
```

---

## 📐 Architecture Decision Best Practices

### Use Orchestrator for Arch Decisions

**When choosing technologies**:
```
/orchestrator Help choose state management solution for our React app:
- Current: Context API
- Complexity: Medium (10 components, 5 API endpoints)
- Team: 3 developers, familiar with React
- Scaling: Expect 2x growth in 6 months
```

**Orchestrator will**:
- Analyze requirements
- Present options (Context, Redux, Zustand, etc.)
- Explain trade-offs
- Recommend solution
- Document decision

---

## 🎯 Context Providing Best Practices

### Essential Context Elements

**1. Current State**:
```
Using React 18, TypeScript, Vite, Tailwind CSS
API: Express.js, PostgreSQL, Prisma ORM
Mobile: React Native 0.72, Redux Toolkit
```

**2. Goal**:
```
Build user profile feature where users can:
- Upload avatar
- Edit bio (500 char max)
- Set privacy settings
- View activity history
```

**3. Constraints**:
```
- Must work offline (sync later)
- WCAG 2.1 AA compliant
- <100ms response time for profile load
- Keep bundle size increase <50KB
```

**4. Related Systems**:
```
Integrates with:
- Authentication service (JWT)
- Media upload service (S3)
- Notification service (push notifications)
```

---

## 🔄 Iteration Best Practices

### Start Broad, Then Refine

**Step 1 - High Level**:
```
/orchestrator Build social sharing feature
```

**Step 2 - Review Plan**:
```
Review Orchestrator's plan, provide feedback
```

**Step 3 - Specific Requests**:
```
/designer Adjust sharing UI - make buttons larger for better touch targets
/server Add rate limiting to sharing API - max 10 shares per minute
```

### Incremental Improvements

**Phase 1**: Basic functionality
```
/server Create basic sharing API - just URL and title
```

**Phase 2**: Enhanced features
```
/server Add sharing API enhancements:
- Generate og:image preview
- Track share analytics
- Support multiple platforms (Twitter, Facebook, LinkedIn)
```

---

## 📋 Template Usage Best Practices

### QA Test Template

**When to use**:
- Planning comprehensive test suite
- Documenting test cases
- Training new team members

**How to use**:
```
/qa Create test suite for checkout flow using the test template at .claude/skills/qa/templates/test-template.md
```

### Design Checklist

**When to use**:
- Before marking design as "complete"
- Design reviews
- Accessibility audits

**How to use**:
```
/designer Review UserProfile component using design checklist - ensure WCAG 2.1 AA compliance
```

---

## 🤝 Collaboration Best Practices

### Agent Handoffs

**Clear Handoffs**:
```
Step 1: /designer Create component spec
Wait for spec...

Step 2: /web Implement component based on spec from Designer
Provide spec to web developer...

Step 3: /qa Test component against spec
```

### Parallel Work

**When tasks are independent**:
```
/orchestrator Optimize performance:
- Server: Optimize API endpoints
- Web: Reduce bundle size
- Mobile: Improve startup time
(All can work in parallel)
```

---

## 🔒 Security Best Practices

### Security Reviews

**Before deploying auth/payment features**:
```
/server Review authentication implementation for security issues:
- SQL injection
- XSS vulnerabilities
- CSRF protection
- Rate limiting
- Input validation
```

### Sensitive Data

**Never commit sensitive data**:
```
/server Implement API key management using environment variables and secret management system
```

---

## ♿ Accessibility Best Practices

### Build Accessibility In

**From design phase**:
```
/designer Design user settings page ensuring:
- Color contrast ≥4.5:1
- Touch targets ≥44x44px
- Keyboard navigation support
- Screen reader compatibility
```

### Regular Audits

```
/designer Audit entire app for WCAG 2.1 AA compliance - provide detailed report with recommendations
```

---

## 📊 Quality Metrics Best Practices

### Define Success Criteria

**For features**:
```
/orchestrator Add search feature with success criteria:
- Test coverage >80%
- Response time <200ms
- Accessibility score 100 (Lighthouse)
- Works offline with cached results
```

### Track Over Time

**Regular check-ins**:
```
/qa Generate quality report:
- Test coverage trends (last 3 months)
- Bug density
- Performance metrics
- Accessibility compliance
```

---

## 🎓 Learning and Improvement

### Document Learnings

**After major features**:
```
What worked:
- Using Orchestrator for coordination
- Providing detailed context upfront

What to improve:
- Better estimates
- Earlier performance testing
```

### Review Agent Outputs

**Always review before applying**:
1. Read agent suggestions carefully
2. Understand the reasoning
3. Check for project-specific considerations
4. Test in dev environment first

---

## 🚫 Anti-Patterns to Avoid

### 1. Using Wrong Agent for Task

**❌ Don't**:
```
/designer Implement this API endpoint
```
**Designers don't code**

**✅ Do**:
```
/server Implement API endpoint
/designer Create API documentation design
```

---

### 2. Vague Requests

**❌ Don't**:
```
/orchestrator improve things
```

**✅ Do**:
```
/orchestrator Improve dashboard load time from 3s to <1s by optimizing API calls and implementing caching
```

---

### 3. Skipping Context

**❌ Don't**:
```
/server Add caching
```
**Missing**: What to cache? Redis? In-memory? TTL?

**✅ Do**:
```
/server Add Redis caching for user profile API:
- Cache user data for 5 minutes
- Invalidate on profile update
- Include cache headers in response
```

---

### 4. Ignoring Concept Images (Designer)

**❌ Don't**:
```
/designer Design homepage
(Without adding concepts to docs/concept/img/)
```

**✅ Do**:
```
# 1. Add concept images
# 2. Then:
/designer Review concept images and design homepage aligned with our visual direction
```

---

### 5. Not Testing

**❌ Don't**:
```
/web Add login form
(Deploy without tests)
```

**✅ Do**:
```
/web Add login form
/qa Write comprehensive tests for login form including:
- Valid/invalid inputs
- Error states
- Accessibility
- E2E flow
```

---

## ✅ Success Checklist

Before considering a task complete:

- [ ] Code implemented by appropriate agent(s)
- [ ] Tests written and passing (>80% coverage)
- [ ] Documentation updated
- [ ] Design aligned with concepts (if UI work)
- [ ] Accessibility validated (if UI work)
- [ ] Performance measured (if applicable)
- [ ] Security reviewed (if sensitive)
- [ ] Quality gates passed

---

## 🎯 Quick Reference

**For Simple Tasks**: Use specific agent directly
**For Complex Tasks**: Use Orchestrator
**For Design**: Always reference `docs/concept/img/`
**For Tests**: Use QA template
**For Quality**: Use design checklist
**When Unsure**: Default to Orchestrator

---

**Version**: 1.0.0
**Last Updated**: 2025-12-23
**Status**: Active
