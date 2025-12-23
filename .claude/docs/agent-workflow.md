# Agent Collaboration Workflow

## Overview

This document defines the collaboration patterns, communication protocols, and escalation rules for the multi-agent system consisting of:

- **Orchestrator**: Central coordinator and decision-maker
- **Mobile Developer**: React Native, Flutter, iOS/Android specialist
- **Web Developer**: Frontend framework and web technology specialist
- **Server Developer**: Backend, API, and infrastructure specialist
- **QA Agent**: Testing, quality assurance, and validation specialist
- **Designer**: UI/UX design and accessibility specialist

## Core Principles

1. **Separation of Concerns**: Each agent focuses on their domain expertise
2. **Clear Handoffs**: Explicit context provided during task transitions
3. **Quality Gates**: Validation before proceeding to next stage
4. **Transparent Communication**: Status, blockers, and decisions visible to all
5. **User-Centric**: All agents prioritize user value and project goals

## Agent Interaction Patterns

### 1. Direct Invocation (Single Domain)

**When to use**: Task requires only one specialist

```
User → Specialist Agent → Completion
```

**Example**:
- User: "Fix styling bug in navigation bar"
- Action: Directly invoke `/web` (no orchestration needed)

### 2. Sequential Coordination (Dependencies)

**When to use**: Tasks must complete in specific order

```
User → Orchestrator → Agent A → Agent B → Agent C → Completion
```

**Example**:
- User: "Add user profile feature"
- Flow:
  1. Designer: Create UI mockups
  2. Server: Build profile API
  3. Web/Mobile: Implement UI
  4. QA: Test end-to-end

### 3. Parallel Execution (Independence)

**When to use**: Tasks can proceed simultaneously

```
User → Orchestrator → [Agent A, Agent B, Agent C] → Integration → Completion
```

**Example**:
- User: "Implement search across all platforms"
- Flow:
  1. Server: Build search API (parallel)
  2. Web: Implement web search UI (parallel)
  3. Mobile: Implement mobile search UI (parallel)
  4. Orchestrator: Coordinate integration testing

### 4. Iterative Collaboration (Feedback Loops)

**When to use**: Refinement through multiple cycles needed

```
User → Orchestrator → Agent A ⇄ Agent B ⇄ Agent A → Completion
```

**Example**:
- User: "Optimize performance"
- Flow:
  1. Developer: Implement optimization
  2. QA: Performance testing
  3. Developer: Refine based on results
  4. QA: Re-test
  5. (Repeat until goals met)

## Communication Protocols

### Task Initiation

**From User to Agent**:
```markdown
**Request**: [Clear description of what's needed]
**Context**: [Relevant background, constraints, requirements]
**Success Criteria**: [How to know it's done correctly]
**Priority**: [Urgency level]
```

**From Orchestrator to Specialist**:
```markdown
**Task**: [Specific subtask for this agent]
**Context**: [Project context, related work]
**Dependencies**: [What must exist before starting]
**Integration Points**: [How this connects with other agents' work]
**Quality Expectations**: [Standards to meet]
**Timeline**: [If time-sensitive]
```

### Progress Updates

Agents should report:
- ✅ **Completed**: Tasks finished and validated
- 🚧 **In Progress**: Current work, estimated completion
- ⚠️ **Blocked**: Obstacles preventing progress
- 🤔 **Clarification Needed**: Questions requiring input

### Handoff Protocol

When passing work to another agent:

1. **Document**: What was completed
2. **Artifacts**: Share relevant code, designs, or documents
3. **Context**: Explain decisions made and why
4. **Next Steps**: What the receiving agent should do
5. **Open Questions**: Any unresolved issues

## Quality Gates

### Before Implementation
- [ ] Requirements clearly understood
- [ ] Design approved (if UI work)
- [ ] API contracts defined (if integration)
- [ ] Test strategy documented

### During Implementation
- [ ] Code follows project standards
- [ ] Tests written alongside code
- [ ] Documentation updated
- [ ] No security vulnerabilities introduced

### Before Handoff
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Build successful
- [ ] Integration tested with dependent systems

### Before Completion
- [ ] End-to-end testing passed
- [ ] Performance acceptable
- [ ] Accessibility validated (if UI)
- [ ] User acceptance criteria met

## Escalation Rules

### Technical Blockers

**Level 1 - Specialist Agent**:
- Agent attempts resolution within domain expertise
- Timeline: Immediate to 30 minutes

**Level 2 - Orchestrator**:
- If unresolved or cross-domain issue
- Orchestrator coordinates with other agents or recommends approach
- Timeline: 30 minutes to 2 hours

**Level 3 - User Consultation**:
- If requires business decision, architectural choice, or external input
- Present options with trade-offs to user
- Timeline: As needed for user availability

### Ambiguous Requirements

**Immediate Escalation**:
- Don't guess or assume
- Ask clarifying questions immediately
- Proceed only with clear understanding

### Quality Gate Failures

**Standard Process**:
1. Identify root cause
2. Determine if quick fix or redesign needed
3. If redesign: Escalate to Orchestrator
4. If quick fix: Implement and re-validate
5. Document learnings to prevent recurrence

## Domain Boundaries

### Mobile Developer
**Owns**:
- Native platform features (camera, GPS, notifications)
- Mobile UI/UX patterns
- Platform-specific performance optimization
- App store deployment

**Collaborates with**:
- Server: API integration, data sync
- Designer: Mobile-specific UI patterns
- QA: Platform-specific testing

**Does NOT**:
- Web-specific implementation
- Backend architecture decisions
- Design system creation (Designer's domain)

### Web Developer
**Owns**:
- Web framework implementation (React, Vue, etc.)
- Responsive design
- Browser compatibility
- Web performance optimization
- Frontend build configuration

**Collaborates with**:
- Server: API integration, SSR configuration
- Designer: Design system implementation
- Mobile: Shared component patterns

**Does NOT**:
- Backend logic
- Native mobile development
- Database schema design

### Server Developer
**Owns**:
- API design and implementation
- Database schema and queries
- Authentication/authorization
- Server infrastructure
- CI/CD pipeline
- Performance and scalability

**Collaborates with**:
- Mobile/Web: API contracts, data formats
- QA: Test environments, data setup
- Designer: N/A (indirect through API design)

**Does NOT**:
- UI implementation
- Client-side logic
- Design decisions

### QA Agent
**Owns**:
- Test strategy and planning
- Test case design
- Automated testing implementation
- Quality metrics and reporting
- Bug verification and regression testing
- Performance testing

**Collaborates with**:
- All agents: Test requirements, bug reports
- Orchestrator: Quality gates, release readiness

**Does NOT**:
- Feature implementation
- Architecture decisions
- Design reviews

### Designer
**Owns**:
- User experience design
- Visual design and branding
- Design system creation
- Accessibility standards
- Interaction patterns
- Prototyping

**Collaborates with**:
- Mobile/Web: Implementation feasibility
- Orchestrator: UX strategy alignment
- QA: Accessibility testing

**Does NOT**:
- Code implementation
- Technical architecture
- Backend design

## Example Workflows

### Workflow 1: New Feature - "Add Dark Mode"

1. **User Request**: "Implement dark mode across the app"

2. **Orchestrator Analysis**:
   - Identify: Design system + Web + Mobile + QA
   - Sequence: Design → Implementation → Testing

3. **Designer** (`/designer`):
   - Create dark mode color palette
   - Define switching behavior
   - Document accessibility considerations
   - **Handoff**: Design tokens, specifications

4. **Web Developer** (`/web`):
   - Implement theme context/provider
   - Apply dark mode styles
   - Add theme toggle UI
   - **Handoff**: Web implementation complete

5. **Mobile Developer** (`/mobile`):
   - Implement theme system
   - Apply dark mode styles
   - Add theme toggle UI
   - **Handoff**: Mobile implementation complete

6. **QA Agent** (`/qa`):
   - Test theme switching on all platforms
   - Validate color contrast (accessibility)
   - Test theme persistence
   - **Completion**: All tests pass

### Workflow 2: Bug Fix - "Login Fails on iOS"

1. **User Report**: "Users can't log in on iOS app"

2. **Orchestrator Triage**:
   - Identify: Likely Mobile + Server issue
   - Route to Mobile first for investigation

3. **Mobile Developer** (`/mobile`):
   - Reproduce issue
   - Check API requests
   - **Finding**: Auth token not being sent correctly
   - **Fix**: Update token handling
   - **Handoff**: Request Server verification

4. **Server Developer** (`/server`):
   - Verify auth token validation
   - Check logs
   - **Finding**: Token format issue in iOS client
   - **Collaborate**: Confirm fix with Mobile

5. **QA Agent** (`/qa`):
   - Test login on iOS
   - Verify auth flow
   - Test related scenarios
   - **Completion**: Bug verified as fixed

### Workflow 3: Architecture Decision - "Choose State Management"

1. **User Question**: "What state management should we use?"

2. **Orchestrator** (`/orchestrator`):
   - Assess: Project complexity, team expertise, scalability needs
   - Consult: Web/Mobile developers for input
   - **Analysis**:
     - Option A: Redux (robust, tested, learning curve)
     - Option B: Context + Hooks (simpler, React-native)
     - Option C: MobX (reactive, less boilerplate)

3. **Web Developer** (`/web`):
   - Input: "Context + Hooks sufficient for our current needs"
   - Note: "Can migrate to Redux later if needed"

4. **Mobile Developer** (`/mobile`):
   - Input: "Agree, React Native supports Context well"

5. **Orchestrator Decision**:
   - **Recommendation**: Context + Hooks
   - **Rationale**: Simpler, no library dependency, team familiar
   - **Migration Path**: Document when Redux would be needed
   - **User Approval**: Present recommendation

## Conflict Resolution

### Technical Disagreements

**Process**:
1. Each agent presents their perspective with rationale
2. Orchestrator facilitates discussion
3. Consider trade-offs: performance, maintainability, cost, timeline
4. Make decision based on project priorities
5. Document decision and reasoning

### Priority Conflicts

**Process**:
1. Escalate to Orchestrator
2. Assess impact and urgency of each task
3. Consider dependencies
4. User input if business priorities unclear
5. Sequence work appropriately

### Resource Constraints

**Process**:
1. Identify bottleneck (time, expertise, tools)
2. Explore alternatives: parallel work, defer features, external help
3. Adjust scope if necessary
4. Communicate impact to user

## Success Metrics

A well-functioning agent system demonstrates:

- ✅ **Clear Communication**: No ambiguity in handoffs
- ✅ **Efficient Routing**: Right agent engaged first time
- ✅ **Quality Outcomes**: Gates passed without repeated failures
- ✅ **Smooth Integration**: Components work together seamlessly
- ✅ **User Satisfaction**: Goals achieved, expectations met
- ✅ **Team Velocity**: Work progresses without unnecessary delays

## Anti-Patterns to Avoid

❌ **Agent Overreach**: Specialist making decisions outside domain
❌ **Unclear Handoffs**: Incomplete context or artifacts
❌ **Skipping Quality Gates**: Moving forward with known issues
❌ **Siloed Work**: Not considering integration needs
❌ **Duplicate Effort**: Multiple agents working on same problem
❌ **Assumed Understanding**: Not clarifying ambiguous requirements
❌ **Bottlenecked Orchestration**: Over-relying on Orchestrator for simple tasks

## Continuous Improvement

After each significant project or milestone:

1. **Retrospective**: What worked well? What didn't?
2. **Process Refinement**: Update workflows based on learnings
3. **Documentation**: Update this guide with new patterns
4. **Training**: Share best practices across agents

---

**Version**: 1.0.0
**Last Updated**: 2025-12-23
**Status**: Active
