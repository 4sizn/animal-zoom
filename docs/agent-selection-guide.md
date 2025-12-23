# Agent Selection Guide

## 🎯 Purpose

This guide helps you choose the right agent for your task, avoiding common mistakes and maximizing efficiency.

---

## 🤔 Quick Decision Tree

```
START: What are you trying to do?
│
├─ 📱 Mobile-specific (camera, GPS, React Native, iOS/Android)?
│   └─ Use /mobile
│
├─ 🌐 Web-specific (HTML/CSS, React, responsive design, browser)?
│   └─ Use /web
│
├─ 🔧 Backend-specific (API, database, server, deployment)?
│   └─ Use /server
│
├─ ✅ Testing-related (write tests, coverage, QA)?
│   └─ Use /qa
│
├─ 🎨 Design-related (UI/UX, colors, accessibility, mockups)?
│   └─ Use /designer (will check docs/concept/img/)
│
├─ 🔀 Spans multiple domains OR you're unsure?
│   └─ Use /orchestrator
│
└─ 🤷 Still confused?
    └─ Use /orchestrator (it will route correctly)
```

---

## 📋 Task Type → Agent Mapping

### Frontend Development

| Task | Agent | Example |
|------|-------|---------|
| Fix styling bug | `/web` | "Fix navigation alignment on mobile" |
| Add React component | `/web` | "Create a dropdown menu component" |
| Optimize web performance | `/web` | "Reduce bundle size and improve Lighthouse score" |
| CSS/Tailwind work | `/web` | "Set up Tailwind with custom theme" |
| Browser compatibility | `/web` | "Fix layout issue in Safari" |

### Mobile Development

| Task | Agent | Example |
|------|-------|---------|
| React Native feature | `/mobile` | "Add pull-to-refresh on feed screen" |
| Native functionality | `/mobile` | "Implement camera with photo preview" |
| Push notifications | `/mobile` | "Add push notifications for messages" |
| Platform-specific issue | `/mobile` | "Fix keyboard covering input on iOS" |
| App deployment | `/mobile` | "Set up TestFlight deployment" |

### Backend Development

| Task | Agent | Example |
|------|-------|---------|
| Create API endpoint | `/server` | "Create POST /api/users endpoint" |
| Database work | `/server` | "Design schema for comments feature" |
| Authentication | `/server` | "Implement JWT authentication" |
| Deployment/DevOps | `/server` | "Set up CI/CD with GitHub Actions" |
| API optimization | `/server` | "Optimize slow database queries" |

### Testing & Quality

| Task | Agent | Example |
|------|-------|---------|
| Write tests | `/qa` | "Write unit tests for auth service" |
| Test strategy | `/qa` | "Create E2E test plan for checkout" |
| Bug verification | `/qa` | "Verify login bug is fixed" |
| Coverage analysis | `/qa` | "Analyze test coverage gaps" |
| Test automation | `/qa` | "Set up automated testing in CI" |

### Design & UX

| Task | Agent | Example |
|------|-------|---------|
| UI design | `/designer` | "Design user profile page" |
| Design system | `/designer` | "Create design system from concepts" |
| Accessibility audit | `/designer` | "Check WCAG compliance" |
| Color palette | `/designer` | "Extract colors from concept images" |
| Component specs | `/designer` | "Create button component spec" |

**Note**: Designer ALWAYS references `docs/concept/img/` directory.

### Complex / Multi-Domain

| Task | Agent | Example |
|------|-------|---------|
| New feature (full-stack) | `/orchestrator` | "Add real-time chat feature" |
| Architecture decision | `/orchestrator` | "Choose state management solution" |
| Performance optimization (all) | `/orchestrator` | "Optimize entire app performance" |
| Bug affecting multiple areas | `/orchestrator` | "Fix sync issue between web/mobile" |
| Unsure which agent | `/orchestrator` | Any ambiguous request |

---

## ✅ Best Agent Combinations

### Common Workflows

#### 1. New Full-Stack Feature
```
/orchestrator → coordinates:
  ├─ /designer (if UI needed)
  ├─ /server (API)
  ├─ /web or /mobile (UI implementation)
  └─ /qa (testing)
```

**Example**: "Add user profile editing"
- Designer designs the UI
- Server creates API endpoints
- Web/Mobile implement the UI
- QA writes tests

#### 2. Performance Optimization
```
/orchestrator → coordinates:
  ├─ /server (API optimization)
  ├─ /web (bundle size, rendering)
  ├─ /mobile (startup time, FPS)
  └─ /qa (performance testing)
```

#### 3. UI Redesign
```
/designer → /web or /mobile → /qa
```

**Example**: "Redesign dashboard"
- Designer creates mockups (references concept images)
- Developer implements
- QA tests accessibility

#### 4. API Development
```
/server → /web and /mobile → /qa
```

**Example**: "Add search API"
- Server creates search endpoint
- Web/Mobile integrate search UI
- QA tests API and integration

---

## ❌ Common Mistakes

### Mistake 1: Using Wrong Agent

**❌ Wrong**:
```
/designer Please implement this button component in React
```
**Why wrong**: Designer doesn't write code

**✅ Correct**:
```
/designer Create component spec for button
/web Implement the button component based on spec
```

---

### Mistake 2: Skipping Orchestrator for Complex Tasks

**❌ Wrong**:
```
/web Add user authentication
```
**Why wrong**: Authentication needs backend, frontend, and testing

**✅ Correct**:
```
/orchestrator Add user authentication with JWT
```
**Orchestrator will coordinate**: Server (JWT), Web (login UI), Mobile (login UI), QA (tests)

---

### Mistake 3: Too Vague

**❌ Wrong**:
```
/orchestrator Make the app better
```
**Why wrong**: No specific goal or metric

**✅ Correct**:
```
/orchestrator Improve app performance - target <2s load time and 60 FPS
```

---

### Mistake 4: Forgetting Designer's Concept Reference

**❌ Wrong**:
```
/designer Design a profile page (without concept images)
```
**Why wrong**: Designer should align with project's visual direction

**✅ Correct**:
```
# 1. Add concept images to docs/concept/img/
# 2. Then:
/designer Review concept images and design a profile page
```

---

### Mistake 5: Using Orchestrator for Simple Tasks

**❌ Inefficient**:
```
/orchestrator Fix typo in button text
```
**Why inefficient**: Overhead of coordination for trivial task

**✅ Efficient**:
```
/web Fix typo in button text
```

---

## 🎯 Optimization Tips

### Tip 1: Start Specific, Escalate if Needed

1. Try specific agent first for simple tasks
2. If it turns complex, use Orchestrator

**Example**:
```
/mobile Add loading spinner
→ Turns out needs API changes →
/orchestrator Add loading states with API retry logic
```

### Tip 2: Provide Context Upfront

Include:
- Current state
- Goal
- Constraints
- Tech stack

**Example**:
```
/server Create user search API
Context: PostgreSQL database, Express server, need pagination
```

### Tip 3: Reference Existing Work

```
✅ Good: /web Update UserProfile component in src/components/UserProfile.tsx
❌ Vague: /web Update the profile thing
```

### Tip 4: Use Templates

- QA tasks: Reference `.claude/skills/qa/templates/test-template.md`
- Design reviews: Reference `.claude/skills/designer/templates/design-checklist.md`

### Tip 5: Batch Related Tasks

**❌ Inefficient**:
```
/server Create user endpoint
(wait)
/server Create post endpoint
(wait)
/server Create comment endpoint
```

**✅ Efficient**:
```
/server Create three API endpoints: users, posts, and comments
```

---

## 🔍 Scenario-Based Examples

### Scenario 1: "Users can't log in"

**Analysis**:
- Could be frontend, backend, or both
- Need investigation

**Solution**:
```
/orchestrator Users can't log in - investigate and fix
```

**Why**: Orchestrator will triage (mobile? web? server?) and coordinate fix.

---

### Scenario 2: "Add dark mode"

**Analysis**:
- Needs design (colors)
- Needs implementation (web/mobile)
- Should reference concept images

**Solution**:
```
/orchestrator Add dark mode to web and mobile apps
→ Orchestrator coordinates:
  /designer Create dark mode palette (checks concepts)
  /web Implement dark mode
  /mobile Implement dark mode
  /qa Test theme switching
```

---

### Scenario 3: "Navigation menu overlaps content on small screens"

**Analysis**:
- Specific to web
- CSS/responsive design issue

**Solution**:
```
/web Fix navigation menu overlap on small screens
```

**Why**: Simple, web-specific, no coordination needed.

---

### Scenario 4: "Improve test coverage"

**Analysis**:
- Testing-specific
- Might span multiple areas

**Solution**:
```
/qa Analyze test coverage and create plan to reach 80%
```

**Why**: QA agent specializes in coverage analysis and test strategy.

---

### Scenario 5: "Design a new onboarding flow"

**Analysis**:
- Starts with UX/design
- Then implementation
- Then testing

**Solution**:
```
Step 1: /designer Review concepts and design onboarding flow
Step 2: /web or /mobile Implement onboarding (after design approved)
Step 3: /qa Test onboarding flow

OR use Orchestrator:
/orchestrator Design and implement new onboarding flow
```

---

## 📊 Agent Efficiency Matrix

| Task Complexity | Domain | Recommended Agent | Efficiency |
|----------------|--------|-------------------|------------|
| Simple | Single | Specific Agent | ⚡⚡⚡ High |
| Simple | Multi | Orchestrator | ⚡⚡ Medium |
| Complex | Single | Specific Agent | ⚡⚡ Medium |
| Complex | Multi | Orchestrator | ⚡⚡⚡ High |
| Unclear | Any | Orchestrator | ⚡⚡⚡ High |

**Key Insight**: Use specific agents for simple, single-domain tasks. Use Orchestrator for everything else.

---

## 🎓 Learning the System

### Week 1: Single Agents
Practice with specific agents:
- `/web` - Fix small UI issues
- `/server` - Create simple endpoints
- `/mobile` - Add basic features
- `/qa` - Write unit tests
- `/designer` - Review existing UI

### Week 2: Templates
Use the templates:
- Write tests using QA template
- Use design checklist for reviews

### Week 3: Orchestrator
Start using Orchestrator for:
- Features spanning multiple areas
- Performance optimization
- Architecture decisions

### Week 4: Mastery
- Instinctively know which agent to use
- Provide optimal context
- Batch tasks efficiently

---

## 🆘 Still Unsure?

**Default to Orchestrator**:
```
/orchestrator [your request]
```

Orchestrator will:
1. Analyze your request
2. Route to appropriate agent(s)
3. Coordinate if multiple agents needed
4. Ensure quality throughout

**You can't go wrong with Orchestrator** - it's the "smart router" of the system.

---

## ✅ Summary Checklist

Before invoking an agent, ask:

- [ ] Is this task in a single domain? → Use specific agent
- [ ] Does this span multiple domains? → Use Orchestrator
- [ ] Am I designing UI? → Did I add concept images to `docs/concept/img/`?
- [ ] Have I provided enough context?
- [ ] Is this specific enough?
- [ ] Have I referenced relevant files/code?

---

**Version**: 1.0.0
**Last Updated**: 2025-12-23
**Status**: Active
