# Animal Zoom

## 🎯 Project Overview

Animal Zoom is a modern application built with a sophisticated multi-agent development system.

---

## 🤖 Multi-Agent Development System

This project uses **6 specialized AI agents** to help with development, testing, and design. Each agent is an expert in their domain and can work independently or collaboratively.

### Available Agents

| Agent | Command | Expertise |
|-------|---------|-----------|
| **🎯 Orchestrator** | `/orchestrator` | Coordinates complex tasks across multiple agents |
| **📱 Mobile Developer** | `/mobile` | React Native, iOS, Android development |
| **🌐 Web Developer** | `/web` | Frontend frameworks, responsive design, web optimization |
| **🔧 Server Developer** | `/server` | Backend APIs, databases, infrastructure, CI/CD |
| **✅ QA Agent** | `/qa` | Testing strategy, test automation, quality assurance |
| **🎨 Designer** | `/designer` | UI/UX design, accessibility, design systems |

### Quick Start with Agents

#### For Simple Tasks (Single Agent)
```bash
# Fix a web styling issue
/web Fix the navigation menu alignment on mobile

# Add a mobile feature
/mobile Implement push notifications for new messages

# Create API endpoint
/server Create REST endpoint for user profile updates

# Write tests
/qa Write E2E tests for the login flow

# Design review (always references docs/concept/img/)
/designer Review concept images and design the user dashboard
```

#### For Complex Tasks (Orchestrator)
```bash
# Multi-domain feature
/orchestrator Build a real-time chat feature for web and mobile

# Performance optimization
/orchestrator Optimize app performance across all platforms

# New feature spanning multiple areas
/orchestrator Add user authentication with JWT across web, mobile, and backend
```

### 📚 Documentation

- **[Complete Agent Usage Guide](docs/agent-usage-guide.md)** - Comprehensive guide to using all agents
- **[Agent Collaboration Workflow](. claude/docs/agent-workflow.md)** - How agents work together
- **[Development Test Scenarios](docs/test-scenarios/dev-agents.md)** - Integration test scenarios

### 🎨 Design System

The Designer agent always references concept images in `docs/concept/img/` directory. Place your design mockups, color palettes, and style guides there for the Designer to reference.

**Example**:
```bash
# 1. Add your design concepts to docs/concept/img/
# 2. Invoke Designer
/designer Based on the concept images, create a design system for our app
```

### 📝 Templates & Resources

#### QA Test Template
Located at `.claude/skills/qa/templates/test-template.md`
- Standardized test case format
- Covers unit, integration, and E2E tests
- Includes code examples

#### Designer Checklist
Located at `.claude/skills/designer/templates/design-checklist.md`
- Comprehensive design review checklist
- UX, visual design, and accessibility validation
- WCAG 2.1 compliance checks

---

## 🚀 Getting Started

### Prerequisites
[To be filled based on your project's actual requirements]

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd animal-zoom

# Install dependencies
[installation commands]
```

### Development
```bash
# Start development server
[dev command]
```

---

## 🏗️ Project Structure

```
animal-zoom/
├── .claude/                    # Claude Code agent skills
│   ├── skills/
│   │   ├── orchestrator/      # Task coordination agent
│   │   ├── mobile-dev/        # Mobile development agent
│   │   ├── web-dev/           # Web development agent
│   │   ├── server-dev/        # Server development agent
│   │   ├── qa/                # Quality assurance agent
│   │   └── designer/          # UI/UX design agent
│   └── docs/
│       └── agent-workflow.md  # Agent collaboration patterns
│
├── docs/
│   ├── agent-usage-guide.md   # Complete agent usage guide
│   ├── concept/
│   │   └── img/               # Design concept images (for Designer)
│   ├── plans/                 # Implementation plans
│   └── test-scenarios/        # Testing scenarios
│
├── src/                        # Source code
│   └── [your app structure]
│
└── README.md                   # This file
```

---

## 🎓 Using the Agent System

### Decision Tree: Which Agent to Use?

```
Is it a simple task in ONE domain?
├─ YES → Use the specific agent directly
│   ├─ UI/Design? → /designer
│   ├─ Mobile? → /mobile
│   ├─ Web? → /web
│   ├─ Backend? → /server
│   └─ Testing? → /qa
│
└─ NO (complex, multi-domain, or unsure?)
    └─ Use /orchestrator → It will coordinate the right agents
```

### Agent Collaboration Example

**Task**: "Add social sharing feature to posts"

```
/orchestrator Add social sharing to posts

Orchestrator coordinates:
1. /designer → Designs sharing UI (references concept images)
2. /server → Builds sharing API and metadata generation
3. /web → Implements web sharing UI
4. /mobile → Implements mobile sharing UI
5. /qa → Tests sharing across all platforms
```

---

## ✅ Quality Standards

### Testing (Managed by QA Agent)
- Unit tests: >80% coverage for business logic
- Integration tests for API endpoints
- E2E tests for critical user journeys
- Automated testing in CI/CD pipeline

### Accessibility (Managed by Designer Agent)
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios validated

### Code Quality (All Agents)
- TypeScript for type safety
- Linting and formatting (ESLint, Prettier)
- Code reviews before merging
- Documentation for complex logic

---

## 🤝 Contributing

### Using Agents for Contributions

1. **For New Features**:
   ```bash
   /orchestrator [Describe the feature you want to build]
   ```

2. **For Bug Fixes**:
   ```bash
   # Simple bug in one area
   /[specific-agent] Fix [describe the bug]

   # Complex bug affecting multiple areas
   /orchestrator Investigate and fix [describe the bug]
   ```

3. **For Design Changes**:
   ```bash
   # First, add concept images to docs/concept/img/
   /designer Review concepts and [your design request]
   ```

4. **For Testing**:
   ```bash
   /qa Create test suite for [feature/component]
   ```

### Pull Request Process

1. Use agents to implement your changes
2. Ensure `/qa` validates your changes with tests
3. Have `/designer` review UI changes (if applicable)
4. Submit PR with clear description
5. Address review feedback

---

## 📊 Project Status

- ✅ Multi-agent system fully configured
- ✅ 6 specialized agents operational
- ✅ Comprehensive documentation complete
- ✅ Templates and checklists available
- ⏳ [Your project-specific milestones]

---

## 🔗 Resources

### Agent System Documentation
- [Complete Usage Guide](docs/agent-usage-guide.md)
- [Agent Workflow Patterns](.claude/docs/agent-workflow.md)
- [Test Scenarios](docs/test-scenarios/dev-agents.md)
- [Implementation Plan](docs/plans/PLAN_agent-roles.md)

### Templates
- [QA Test Template](.claude/skills/qa/templates/test-template.md)
- [Design Checklist](.claude/skills/designer/templates/design-checklist.md)

---

## 📝 License

[Your license here]

---

## 👥 Team

Developed with the help of a multi-agent AI system featuring:
- Orchestrator for coordination
- Specialized development agents (Mobile, Web, Server)
- Quality assurance automation
- Design system management

---

**Built with ❤️ using Claude Code Multi-Agent System**
# animal-zoom
