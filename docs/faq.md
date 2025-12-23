# Agent System FAQ

## 🤔 General Questions

### Q: What is the multi-agent system?
**A**: It's a development assistance system with 6 specialized AI agents, each expert in a specific domain (mobile, web, server, QA, design, and orchestration). You invoke agents using commands like `/web` or `/orchestrator` to get specialized help.

---

### Q: Which agent should I use?
**A**: Use the decision tree:
- **Simple, single-domain task** → Use specific agent (`/web`, `/mobile`, `/server`, `/qa`, `/designer`)
- **Complex or multi-domain task** → Use `/orchestrator`
- **Unsure?** → Use `/orchestrator` (it will route correctly)

See [Agent Selection Guide](agent-selection-guide.md) for detailed guidance.

---

### Q: Can I use multiple agents at once?
**A**: Use `/orchestrator` - it coordinates multiple agents for you automatically. Don't try to invoke multiple agents manually in one request.

**Example**:
```
✅ Good: /orchestrator Add authentication to web and mobile
❌ Wrong: /web and /mobile add authentication
```

---

### Q: What's the difference between agents and skills?
**A**: They're the same thing! "Agent" is the conceptual role (Mobile Developer), "skill" is the technical implementation (`.claude/skills/mobile-dev/`). Use the terms interchangeably.

---

## 🎨 Designer Agent Questions

### Q: How does Designer know our design direction?
**A**: Designer ALWAYS checks `docs/concept/img/` directory for concept images, mood boards, and design references before starting work. This ensures consistency with your project's visual direction.

---

### Q: What should I put in docs/concept/img/?
**A**: Place any design references:
- Mockups and wireframes
- Color palette inspirations
- Typography examples
- UI pattern references
- Brand guidelines
- Style tiles or mood boards

**Formats**: PNG, JPG, SVG, PDF

---

### Q: What if I don't have concept images yet?
**A**: Designer can still work, but results will be more generic. For best results:
1. Add at least a few reference images
2. Or describe your vision clearly
3. Designer will create initial concepts for you to iterate on

---

### Q: Does Designer write code?
**A**: No, Designer creates specifications, mockups, and design systems. Use `/web` or `/mobile` to implement the designs.

**Workflow**:
```
/designer Create button component spec
→ Review spec
→ /web Implement button component based on Designer's spec
```

---

## 📱 Mobile Agent Questions

### Q: Does Mobile agent work with both React Native and native code?
**A**: Yes! Mobile agent knows:
- React Native
- Flutter
- Native iOS (Swift/SwiftUI)
- Native Android (Kotlin/Java)

Specify your tech stack in the request for best results.

---

### Q: Can Mobile agent help with app store deployment?
**A**: Yes! Mobile agent can help with:
- App store configuration
- Build settings
- Code signing
- TestFlight/Beta setup
- App store submission guidelines

---

## 🌐 Web Agent Questions

### Q: Which frontend frameworks does Web agent support?
**A**: Web agent is expert in:
- React (most common)
- Vue
- Svelte
- Next.js, Nuxt, SvelteKit
- Vanilla JavaScript/TypeScript

Mention your framework in requests for tailored advice.

---

### Q: Can Web agent help with backend/APIs?
**A**: Web agent focuses on frontend. For APIs, use `/server`. For features needing both, use `/orchestrator` to coordinate them.

---

## 🔧 Server Agent Questions

### Q: What backend technologies does Server agent know?
**A**: Server agent is expert in:
- **Languages**: Node.js, Python, Go, Java, Ruby, PHP
- **Frameworks**: Express, FastAPI, Django, Flask, Spring Boot
- **Databases**: PostgreSQL, MySQL, MongoDB, Redis
- **Infrastructure**: Docker, Kubernetes, AWS, GCP, Azure

---

### Q: Can Server agent help with DevOps?
**A**: Yes! Server agent handles:
- CI/CD pipelines
- Docker containerization
- Deployment automation
- Monitoring setup
- Infrastructure as code

---

## ✅ QA Agent Questions

### Q: What types of tests can QA agent write?
**A**: QA agent writes:
- **Unit tests**: Jest, pytest, Go testing, etc.
- **Integration tests**: API testing, database testing
- **E2E tests**: Playwright, Cypress, Detox, Appium
- **Performance tests**: Load testing, benchmarks

---

### Q: Can QA agent run tests for me?
**A**: QA agent provides test code and commands, but you run them in your environment. QA can help debug test failures and improve coverage.

---

### Q: What's a good test coverage target?
**A**: QA agent recommends:
- Business logic: >80%
- API endpoints: >70%
- UI components: Integration tests for critical paths

Focus on **meaningful coverage**, not just hitting numbers.

---

## 🎯 Orchestrator Questions

### Q: When should I use Orchestrator?
**A**: Use Orchestrator when:
- Task spans multiple domains (frontend + backend + testing)
- You're unsure which agent to use
- Need architectural decisions
- Managing complex workflows

**Example**: "Add payment system" needs Server (API), Web/Mobile (UI), QA (tests) → Use Orchestrator

---

### Q: Can Orchestrator do the work itself?
**A**: No, Orchestrator **coordinates** other agents. Think of it as a project manager that:
1. Analyzes your request
2. Breaks it into subtasks
3. Assigns to appropriate agents
4. Coordinates handoffs
5. Ensures quality

---

### Q: Is Orchestrator slower than using specific agents?
**A**: Slightly, because it coordinates multiple agents. But for complex tasks, the coordination saves time overall by preventing miscommunication and rework.

**Rule of thumb**:
- Simple task? Use specific agent (faster)
- Complex task? Use Orchestrator (more efficient overall)

---

## 🛠️ Workflow Questions

### Q: Can I interrupt an agent mid-task?
**A**: Yes! If an agent is going in the wrong direction, provide clarification or corrections immediately.

---

### Q: How do I provide feedback on agent output?
**A**: Be specific:

**❌ Vague**: "This isn't right"
**✅ Specific**: "The button color should be #3B82F6 (blue-500) to match our brand, not the current green"

---

### Q: Can agents remember previous conversations?
**A**: Agents have access to the current conversation context. For best results, reference earlier work explicitly:

```
/web Earlier you created the UserProfile component - now add an edit button to it
```

---

## 📝 Templates & Resources Questions

### Q: What templates are available?
**A**: Two main templates:
1. **QA Test Template**: `.claude/skills/qa/templates/test-template.md`
   - For comprehensive test case documentation
2. **Design Checklist**: `.claude/skills/designer/templates/design-checklist.md`
   - For design reviews and accessibility audits

---

### Q: Where can I find more documentation?
**A**: Key docs:
- **[Usage Guide](agent-usage-guide.md)** - Comprehensive how-to
- **[Selection Guide](agent-selection-guide.md)** - Which agent to use
- **[Best Practices](best-practices.md)** - Dos and don'ts
- **[Workflow Patterns](.claude/docs/agent-workflow.md)** - Collaboration details
- **[Test Scenarios](test-scenarios/dev-agents.md)** - Integration examples

---

## 🚨 Troubleshooting

### Q: Agent doesn't understand my request
**A**: Provide more context:
- **Current state**: What exists now?
- **Goal**: What do you want?
- **Constraints**: Any limitations?
- **Tech stack**: What technologies?

**Example**:
```
❌ Vague: /server fix the API
✅ Clear: /server Fix POST /api/users endpoint - currently returns 500 error when email field is missing, should return 400 with validation error
```

---

### Q: Agent suggests something that won't work for my project
**A**: Tell the agent about your constraints:

```
/web The suggested approach won't work because we need to support IE11. Please provide an alternative without ES6 features.
```

---

### Q: Multiple agents gave conflicting advice
**A**: Use Orchestrator to arbitrate:

```
/orchestrator Web agent suggested Redux, Mobile agent suggested Context API for shared state management. Help me choose the right approach for our cross-platform app.
```

---

### Q: Agent produced code with bugs
**A**: Report it to QA agent:

```
/qa The UserProfile component has a bug - avatar upload fails on files >2MB. Please write tests to catch this and verify the fix.
```

---

### Q: How do I report issues with the agent system?
**A**: Document:
1. Which agent you used
2. Your request (exact text)
3. What you expected
4. What happened instead
5. Your tech stack/environment

Share with your team or project maintainers.

---

## 💡 Best Practices Questions

### Q: How specific should my requests be?
**A**: Be as specific as helpful:
- **Too vague**: "Make it better"
- **Too specific**: "Change line 47 to use const instead of let"
- **Just right**: "Optimize the data fetching in UserList component - currently causing re-renders on every keystroke"

---

### Q: Should I ask for everything at once or break it up?
**A**: Depends:
- **Complex feature**: Let Orchestrator break it down
- **Series of independent tasks**: Make separate requests
- **Related changes**: Group in one request

**Example (good grouping)**:
```
/web Update UserCard component:
- Add hover effect
- Fix avatar alignment
- Update typography to match design system
```

---

### Q: How do I learn to use the system effectively?
**A**: Follow the learning path:

**Week 1**: Use single agents for simple tasks
**Week 2**: Learn templates and resources
**Week 3**: Use Orchestrator for complex tasks
**Week 4**: Master context-providing and agent selection

See [Best Practices](best-practices.md) for detailed guidance.

---

## 🎓 Advanced Questions

### Q: Can I customize agent behavior?
**A**: Agent behavior is defined in their SKILL.md files in `.claude/skills/[agent-name]/`. You can review these to understand their capabilities, but customization requires modifying the skill files.

---

### Q: Can I add new agents?
**A**: Technically yes, by creating new skill files in `.claude/skills/`, but it's usually better to use existing agents creatively. If you have a genuine need for a new specialized agent, consult the [Claude Code documentation](https://github.com/anthropics/claude-code).

---

### Q: What's the difference between asking Orchestrator vs a specific agent for complex tasks?
**A**:

**Orchestrator**:
- Coordinates multiple specialists
- Makes architectural decisions
- Ensures integration

**Specific Agent (even for complex tasks)**:
- Deep expertise in one area
- Faster for single-domain complexity
- Still collaborates if needed

**Example**: "Optimize React rendering" - use `/web` even though it's complex, because it's single-domain.

---

## 🔗 Related Resources

- [Agent Usage Guide](agent-usage-guide.md)
- [Agent Selection Guide](agent-selection-guide.md)
- [Best Practices](best-practices.md)
- [Workflow Documentation](.claude/docs/agent-workflow.md)

---

## ❓ Still Have Questions?

1. Check the [complete documentation](agent-usage-guide.md)
2. Review [best practices](best-practices.md)
3. Look at [example scenarios](agent-selection-guide.md)
4. When in doubt: `/orchestrator [your question]`

---

**Version**: 1.0.0
**Last Updated**: 2025-12-23
**Status**: Active
