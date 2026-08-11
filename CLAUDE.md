# iExpenseApps: Multi-Agent Development Framework

## Standing Rules for Claude Code Sessions

### 1. Plan-First Development
- **ALWAYS start in plan mode** for any non-trivial task
- Write a clear plan with:
  - Files to change
  - Approach and rationale
  - Risks and tradeoffs
- **WAIT for product owner approval** before writing code
- Trivial tasks (typo fixes, one-line changes) may skip planning

### 2. Role Assignment
**Main Session (Orchestrator)**
- Owns the full development task flow
- Writes code for main features and logic
- Delegates heavy lifting to subagents
- Manages code reviews and QA gates
- Makes final decisions on implementation

**Subagents (Specialized, Token-Conscious)**
- Only spawned when needed, not for every task
- Researcher: Studies comparable apps, suggests improvements (read-only)
- Reviewer: Reviews code quality/security after changes (read-only)
- QA: Writes/runs tests, validates functionality
- Each agent keeps its own context clean with narrow tool access

### 3. Keep Main Thread Lean
- Hand off large file-reading to agents (they have Glob, Grep, Read)
- Move research/investigation to researcher subagent
- Let reviewer/QA agents focus on their specialty
- Main session stays focused on orchestration and coding

### 4. Code Review & QA Gates (REQUIRED)
After ANY code changes:
1. **Reviewer subagent** runs to check quality and security
2. **QA subagent** writes and runs tests
3. Only commit when both give green light
4. Fixes go through same gate again

### 5. Commit Strategy
- Commit in **small, reviewable steps**
- One feature = one commit (unless large, then multiple logical commits)
- Clear, descriptive commit messages with context
- No mega-commits; easier to review and revert if needed

---

## Subagent Details

### researcher (Haiku Model)
- **Tools**: Read, Glob, Grep, WebSearch, WebFetch (read-only)
- **Use for**: Analyzing competitors, suggesting features, research questions
- **Output**: Prioritized plan for PO approval
- **Constraint**: Cannot modify code

### reviewer (Sonnet Model)
- **Tools**: Read, Glob, Grep (read-only)
- **Use for**: Post-change quality and security review
- **Output**: Specific findings with file:line references
- **Constraint**: Cannot modify code
- **Required**: Run after every code change

### qa (Sonnet Model)
- **Tools**: Read, Glob, Grep, Bash, Edit
- **Use for**: Test writing, test execution, validation
- **Output**: Test results, pass/fail counts, coverage gaps
- **Constraint**: Focused on testing only, not feature development
- **Required**: Run after every code change

---

## Workflow Summary
1. **Product owner** identifies task and approves plan
2. **Main session** (orchestrator) handles development and architecture
3. **Researcher** agent investigates if needed (before planning)
4. **Main session** writes code per approved plan
5. **Reviewer** agent audits for quality/security
6. **QA** agent writes tests and validates
7. **Main session** commits once both gates pass
8. Repeat for next task

**Key principle**: Token efficiency via delegation. Main thread stays focused; heavy lifting dispersed to specialized agents with appropriate models and tools.
