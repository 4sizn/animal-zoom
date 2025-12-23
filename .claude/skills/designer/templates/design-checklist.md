# Design Review Checklist

## Project Information
- **Feature/Component**: [Name]
- **Designer**: [Name]
- **Date**: [Date]
- **Design Reference**: ✅ Checked `docs/concept/img/`
- **Status**: [ ] In Progress  [ ] Ready for Review  [ ] Approved

---

## 🎨 Design Concept Alignment

### Reference Images
- [ ] Reviewed all images in `docs/concept/img/` directory
- [ ] Extracted color palette from concept images
- [ ] Identified typography from concept images
- [ ] Noted design patterns and styles from concepts
- [ ] Aligned design direction with project vision

**Concept Notes**:
[Describe how this design aligns with or extends the concept images]

---

## 🎯 User Experience (UX)

### User Flow
- [ ] User journey is clear and intuitive
- [ ] Navigation is logical and consistent
- [ ] User can complete tasks efficiently
- [ ] Error states are handled gracefully
- [ ] Success states provide clear feedback

### Information Architecture
- [ ] Content hierarchy is clear
- [ ] Important information is prominent
- [ ] Related content is grouped logically
- [ ] Page structure follows conventions

### Interaction Design
- [ ] Interactive elements are obvious
- [ ] Hover/focus states are defined
- [ ] Loading states are designed
- [ ] Transitions and animations are smooth
- [ ] Feedback is immediate and clear

**UX Notes**:
[Any UX considerations or decisions]

---

## 🎨 Visual Design (UI)

### Layout & Composition
- [ ] Layout uses consistent grid system
- [ ] Spacing follows design system (from concept)
- [ ] Visual hierarchy is clear
- [ ] White space is used effectively
- [ ] Balance and alignment are correct

### Color
- [ ] Colors match concept images palette
- [ ] Brand colors applied consistently
- [ ] Color usage is purposeful
- [ ] Sufficient contrast (see Accessibility section)
- [ ] Dark mode considered (if applicable)

**Color Palette**:
```
Primary: #______
Secondary: #______
Accent: #______
Background: #______
Text: #______
```

### Typography
- [ ] Fonts match concept images
- [ ] Font hierarchy is clear (H1-H6, body, caption)
- [ ] Line heights are readable (1.5 for body text)
- [ ] Font sizes are appropriate
- [ ] Text is legible on all backgrounds

**Typography Scale**:
```
H1: [size/weight]
H2: [size/weight]
Body: [size/weight]
Caption: [size/weight]
```

### Components
- [ ] Components follow design system
- [ ] Components are reusable
- [ ] All states documented (default, hover, active, disabled)
- [ ] Components work at all sizes
- [ ] Icons are consistent and clear

---

## ♿ Accessibility (WCAG 2.1 AA)

### Color Contrast
- [ ] Text contrast ≥ 4.5:1 (normal text)
- [ ] Text contrast ≥ 3:1 (large text 18pt+)
- [ ] UI element contrast ≥ 3:1
- [ ] Contrast checked with tool (WebAIM, Stark)

**Contrast Ratios**:
- Primary text: [ratio]
- Secondary text: [ratio]
- Interactive elements: [ratio]

### Focus & Navigation
- [ ] Focus indicators are visible
- [ ] Tab order is logical
- [ ] Keyboard navigation works
- [ ] Skip links provided (if needed)

### Semantic Meaning
- [ ] Design uses semantic hierarchy
- [ ] Information conveyed beyond color alone
- [ ] Icons have text labels or tooltips
- [ ] Alt text specified for images

### Touch & Interaction
- [ ] Touch targets ≥ 44x44px
- [ ] Sufficient spacing between interactive elements
- [ ] Gestures have alternatives
- [ ] No time-based limitations without option to extend

### Additional Considerations
- [ ] Supports `prefers-reduced-motion`
- [ ] Works with screen magnification (200%+)
- [ ] High contrast mode considered
- [ ] Text can be resized to 200%

**Accessibility Notes**:
[Any specific a11y considerations]

---

## 📱 Responsive Design

### Breakpoints
- [ ] Mobile (320px - 767px) designed
- [ ] Tablet (768px - 1023px) designed
- [ ] Desktop (1024px+) designed
- [ ] Components adapt gracefully

### Mobile Considerations
- [ ] Touch-friendly interactions
- [ ] Readable without zooming
- [ ] No horizontal scrolling
- [ ] Critical content prioritized

### Cross-Platform
- [ ] Works on iOS
- [ ] Works on Android
- [ ] Works on web browsers
- [ ] Platform-specific patterns respected

---

## 🔧 Technical Specifications

### Assets
- [ ] Images exported (PNG, JPG, SVG)
- [ ] Icons exported (SVG preferred)
- [ ] Image optimization specified
- [ ] Retina/high-DPI assets provided

### CSS/Styling
- [ ] Design tokens defined (colors, spacing, typography)
- [ ] CSS variables specified
- [ ] Animation specs documented (duration, easing)
- [ ] Responsive breakpoints documented

### Handoff
- [ ] Component specifications complete
- [ ] Spacing and sizing documented
- [ ] All states documented
- [ ] Developer notes provided

---

## ✅ Final Review

### Completeness
- [ ] All screens/states designed
- [ ] Error states included
- [ ] Loading states included
- [ ] Empty states included
- [ ] Success states included

### Consistency
- [ ] Matches design system
- [ ] Consistent with concept images
- [ ] Consistent with other features
- [ ] No duplicate or conflicting patterns

### Quality
- [ ] Design is polished
- [ ] No placeholder content (lorem ipsum)
- [ ] Realistic data used
- [ ] Edge cases considered

### Documentation
- [ ] Component usage documented
- [ ] Design decisions explained
- [ ] Accessibility notes included
- [ ] Developer handoff complete

---

## 📝 Notes & Decisions

### Design Decisions
[Document key design decisions and rationale]

### Open Questions
- [ ] [Question 1]
- [ ] [Question 2]

### Known Limitations
[Any constraints or limitations]

### Future Improvements
[Ideas for future iterations]

---

## 👥 Review & Approval

### Reviewers
- [ ] Developer review
- [ ] Product review
- [ ] Accessibility review
- [ ] Stakeholder approval

### Feedback
[Feedback from reviews]

---

**Checklist Completed By**: [Name]
**Date**: [Date]
**Status**: [ ] In Review  [ ] Changes Requested  [ ] Approved
