# Agent System Usage Guide

## 🎯 Overview

This project uses a multi-agent system with 6 specialized agents to help with different aspects of development. Each agent is an expert in their domain and can be invoked directly or coordinated through the Orchestrator.

### Available Agents

| Agent | Skill Command | When to Use |
|-------|---------------|-------------|
| **Orchestrator** | `/orchestrator` | Complex multi-domain tasks, coordination needed |
| **Mobile Developer** | `/mobile` or `/mobile-dev` | React Native, iOS, Android development |
| **Web Developer** | `/web` or `/web-dev` | Frontend, React, Vue, CSS, responsive design |
| **Server Developer** | `/server` or `/server-dev` | Backend, APIs, databases, deployment |
| **QA Agent** | `/qa` | Testing, quality assurance, test automation |
| **Designer** | `/designer` | UI/UX design, accessibility, design systems |

---

## 🚀 Quick Start

### First Time Using the Agent System

1. **Understand your task**: What are you trying to accomplish?
2. **Choose the right agent**:
   - Simple, single-domain task? → Use specific agent directly
   - Complex, multi-step task? → Use Orchestrator
3. **Provide context**: Share relevant files, requirements, and constraints
4. **Review and iterate**: Validate the output and request refinements

### Example Scenarios

#### Scenario 1: Simple Task (Single Agent)
**Task**: "Fix the styling bug in the navigation bar"

**Approach**: Direct invocation
```
/web Fix the styling bug in the navigation bar - the menu items are not aligned properly on mobile
```

**Why**: This is a straightforward web development task that doesn't need coordination.

#### Scenario 2: Complex Task (Orchestrator)
**Task**: "Add user authentication to the app"

**Approach**: Use Orchestrator
```
/orchestrator Add user authentication with JWT tokens across web and mobile apps, including login, registration, and password reset
```

**Why**: This involves multiple domains (server, web, mobile, QA) and needs coordination.

---

## 📚 Detailed Agent Guide

### 1. Orchestrator Agent

**Purpose**: Coordinates complex tasks across multiple agents.

**When to Use**:
- Starting a new feature that spans frontend, backend, and testing
- Unsure which specialist to engage
- Need architectural decision-making
- Managing dependencies between agents

**How to Use**:
```
/orchestrator [Your complex request]
```

**Examples**:
```
/orchestrator Build a real-time chat feature for web and mobile

/orchestrator Optimize app performance - users report slow loading

/orchestrator Implement a payment system with Stripe integration
```

**What Orchestrator Does**:
1. Analyzes your request
2. Breaks it down into subtasks
3. Engages appropriate specialist agents
4. Coordinates handoffs and integration
5. Ensures quality gates are met

---

### 2. Mobile Developer Agent

**Purpose**: Expert in React Native, Flutter, iOS, and Android development.

**When to Use**:
- Building mobile app features
- Integrating native device features (camera, GPS, notifications)
- Optimizing mobile performance
- Handling platform-specific issues
- App deployment and configuration

**How to Use**:
```
/mobile [Your mobile development request]
```

**Examples**:
```
/mobile Implement camera functionality to take and preview photos

/mobile Add push notifications for new messages on iOS and Android

/mobile Optimize FlatList performance for the feed screen

/mobile Set up deep linking for social media sharing
```

**Collaboration**:
- Works with **Server** for API integration
- Works with **Designer** for mobile UI/UX patterns
- Works with **QA** for mobile testing strategies

---

### 3. Web Developer Agent

**Purpose**: Expert in modern frontend frameworks and web technologies.

**When to Use**:
- Building web application features
- Implementing responsive designs
- Optimizing web performance
- Fixing browser compatibility issues
- Setting up frontend build tools

**How to Use**:
```
/web [Your web development request]
```

**Examples**:
```
/web Create a responsive navigation with dropdown menus

/web Optimize bundle size and improve Lighthouse score

/web Implement infinite scroll with virtualization

/web Set up Tailwind CSS with our custom design system
```

**Collaboration**:
- Works with **Server** for API integration
- Works with **Designer** for design implementation
- Works with **QA** for frontend testing

---

### 4. Server Developer Agent

**Purpose**: Expert in backend APIs, databases, and infrastructure.

**When to Use**:
- Designing and implementing APIs
- Database schema design or optimization
- Authentication and authorization
- Deployment and CI/CD setup
- Server performance optimization
- Security-related backend work

**How to Use**:
```
/server [Your backend development request]
```

**Examples**:
```
/server Create a REST API endpoint for user registration

/server Optimize database queries for the posts feed

/server Implement JWT authentication with refresh tokens

/server Set up CI/CD pipeline with automated testing

/server Design database schema for multi-tenant application
```

**Collaboration**:
- Works with **Web/Mobile** to define API contracts
- Works with **QA** for API testing and test data
- Works with **Orchestrator** for architecture decisions

---

### 5. QA Agent

**Purpose**: Expert in testing strategy, test automation, and quality assurance.

**When to Use**:
- Developing test strategy for features
- Writing test cases (unit, integration, E2E)
- Setting up test automation
- Analyzing test coverage
- Verifying bug fixes
- Planning regression testing

**How to Use**:
```
/qa [Your testing or quality request]
```

**Examples**:
```
/qa Create comprehensive test suite for user authentication

/qa Write E2E tests for the checkout flow

/qa Analyze test coverage and identify gaps

/qa Verify that the login bug is fixed

/qa Set up automated testing in CI pipeline
```

**Collaboration**:
- Works with **all developers** for test requirements
- Works with **Orchestrator** for quality gates
- Uses test templates from `.claude/skills/qa/templates/`

---

### 6. Designer Agent

**Purpose**: Expert in UI/UX design, accessibility, and design systems.

**⭐ Special Feature**: Always references concept images in `docs/concept/img/` directory.

**When to Use**:
- Starting new UI features
- Creating or updating design systems
- Reviewing accessibility compliance
- Designing responsive layouts
- Conducting design audits
- Planning user flows

**How to Use**:
```
/designer [Your design request]
```

**Examples**:
```
/designer Review the concept images and design a user profile page

/designer Create a design system based on our concept images

/designer Audit the app for WCAG 2.1 accessibility compliance

/designer Design a mobile-friendly navigation menu

/designer Create component specifications for the design system
```

**Important Notes**:
- Designer ALWAYS checks `docs/concept/img/` before starting work
- Place your design concept images in `docs/concept/img/` directory
- Designer extracts colors, typography, and patterns from these images

**Collaboration**:
- Works with **Web/Mobile** for design implementation
- Works with **QA** for accessibility testing
- Uses design checklist from `.claude/skills/designer/templates/`

---

## 🔄 Agent Collaboration Workflows

### Workflow 1: New Feature Development

**Example**: Adding a social sharing feature

```
Step 1: /orchestrator Add social sharing to posts

Step 2: Orchestrator engages agents in sequence:
  → /designer Design sharing UI (checks concept images)
  → /server Implement sharing API and metadata generation
  → /web Integrate sharing UI on web
  → /mobile Integrate sharing UI on mobile
  → /qa Test sharing across all platforms

Step 3: Integration and validation
```

### Workflow 2: Bug Fix

**Example**: Login fails on iOS

```
Step 1: /orchestrator Login fails on iOS - users can't authenticate

Step 2: Orchestrator triages:
  → /mobile Investigate iOS login issue
  → /server Verify auth token handling
  → /qa Test fix across iOS versions

Step 3: Verification and regression testing
```

### Workflow 3: Performance Optimization

**Example**: App is slow

```
Step 1: /orchestrator App performance is poor - optimize it

Step 2: Orchestrator coordinates profiling:
  → /server Profile API response times
  → /web Check bundle size and render performance
  → /mobile Profile app startup and FPS
  → Each agent implements optimizations
  → /qa Performance testing and validation
```

---

## 💡 Best Practices

### ✅ Do's

1. **Be Specific**: Provide clear requirements and context
   ```
   ❌ "Make the app better"
   ✅ "Optimize the feed loading time - currently takes 3s, should be <1s"
   ```

2. **Use Direct Invocation for Simple Tasks**
   ```
   ❌ /orchestrator Fix typo in button text
   ✅ /web Fix typo in button text
   ```

3. **Use Orchestrator for Complex Tasks**
   ```
   ❌ /web Build entire authentication system
   ✅ /orchestrator Build authentication system with web, mobile, and backend
   ```

4. **Provide Context**
   ```
   ✅ "We're using React Native 0.72, TypeScript, and Redux for state management"
   ```

5. **Reference Existing Files**
   ```
   ✅ "Update the UserProfile component in src/components/UserProfile.tsx"
   ```

6. **Place Concept Images for Designer**
   ```
   ✅ Put design mockups in docs/concept/img/ before asking Designer
   ```

### ❌ Don'ts

1. **Don't Use Wrong Agent**
   ```
   ❌ /designer Implement API endpoint (Designer can't code)
   ✅ /server Implement API endpoint
   ```

2. **Don't Be Vague**
   ```
   ❌ "Fix the thing"
   ✅ "Fix the navigation menu not closing on mobile when clicking outside"
   ```

3. **Don't Skip Agent for Their Domain**
   ```
   ❌ Asking mobile agent to write backend code
   ✅ /orchestrator [task] (let Orchestrator coordinate)
   ```

4. **Don't Ignore Agent Recommendations**
   ```
   If QA says tests are needed, write them
   If Designer says contrast is too low, fix it
   ```

---

## 🎓 Learning Path

### For New Users

**Week 1**: Start with single agents
- Try `/web` for simple UI changes
- Try `/server` for simple API endpoints
- Try `/mobile` for simple mobile features

**Week 2**: Use templates and checklists
- Use QA test template for writing tests
- Use Designer checklist for design reviews

**Week 3**: Use Orchestrator for complex tasks
- Let Orchestrator coordinate multi-agent tasks
- Observe how agents collaborate

**Week 4**: Master the system
- Know when to use each agent
- Provide optimal context for best results
- Leverage templates efficiently

---

## 🔧 Troubleshooting

### "Which agent should I use?"

**Decision Tree**:
1. Is it a simple task in one domain? → Use specific agent
2. Does it span multiple domains? → Use Orchestrator
3. Unsure? → Use Orchestrator (it will route to correct agent)

### "Agent doesn't understand my request"

**Solution**: Provide more context
- What are you trying to achieve? (goal)
- What's the current state? (context)
- What have you tried? (attempts)
- What constraints exist? (limitations)

### "How do I get Designer to use my concept images?"

**Solution**:
1. Place images in `docs/concept/img/` directory
2. Invoke: `/designer Review concept images and [your request]`
3. Designer automatically checks that directory

### "Tests are failing after changes"

**Solution**:
```
/qa The [feature] tests are failing after my changes - help me fix them
```

### "Need to coordinate multiple agents"

**Solution**:
```
/orchestrator [describe the full scope of work]
```

---

## 📋 Templates & Resources

### Available Templates

1. **QA Test Template**: `.claude/skills/qa/templates/test-template.md`
   - Use for writing comprehensive test cases
   - Covers unit, integration, and E2E tests

2. **Designer Checklist**: `.claude/skills/designer/templates/design-checklist.md`
   - Use for design reviews
   - Covers UX, visual design, accessibility

### Additional Resources

- **Agent Workflow**: `.claude/docs/agent-workflow.md` - Detailed collaboration patterns
- **Test Scenarios**: `docs/test-scenarios/dev-agents.md` - Integration test scenarios
- **Plan Documentation**: `docs/plans/PLAN_agent-roles.md` - System architecture and decisions

---

## 🎯 Success Metrics

You're using the agent system effectively when:

- ✅ Tasks are completed efficiently with appropriate agent
- ✅ Code quality is high (tests pass, accessible, performant)
- ✅ Agents collaborate smoothly on complex tasks
- ✅ Design aligns with concept images
- ✅ Test coverage is maintained (>80%)
- ✅ Documentation stays up to date

---

## 📞 Getting Help

### Common Questions

**Q: Can I use multiple agents in one request?**
A: Use `/orchestrator` - it will coordinate multiple agents for you.

**Q: How do I know if my test coverage is good?**
A: Ask `/qa Analyze test coverage for [feature]`

**Q: How do I ensure my design is accessible?**
A: Ask `/designer Audit [component] for WCAG 2.1 compliance`

**Q: What if agents disagree on approach?**
A: `/orchestrator` will facilitate discussion and recommend best approach.

### Need More Help?

1. Check the detailed SKILL.md for each agent in `.claude/skills/[agent-name]/`
2. Review agent workflow documentation in `.claude/docs/agent-workflow.md`
3. Look at test scenarios in `docs/test-scenarios/`

---

**Version**: 1.0.0
**Last Updated**: 2025-12-23
**Status**: Active

Happy building! 🚀
