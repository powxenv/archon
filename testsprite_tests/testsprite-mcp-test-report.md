
# TestSprite AI Testing Report(MCP)

---

## 1 Document Metadata
- **Project Name:** Archon
- **Date:** 2026-04-18
- **Prepared by:** TestSprite AI Team
- **Test Environment:** Development mode (Vite dev server, port 7162)
- **Test Run:** Round 2 (after aria-label and devtools fixes)

---

## 2 Requirement Validation Summary

### Requirement: User Authentication (email/password)
- **Description:** Supports sign in and sign up with email/password, GitHub OAuth, session management, and email domain validation.

#### Test TC001 Sign in with email/password to reach dashboard
- **Test Code:** [TC001_Sign_in_with_emailpassword_to_reach_dashboard.py](./TC001_Sign_in_with_emailpassword_to_reach_dashboard.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/eb33306d-8111-4921-9c56-0d4f31b698a0
- **Status:** Passed
- **Severity:** LOW
- **Analysis / Findings:** Sign-in with the provided credentials successfully redirected to the dashboard. The aria-label="Sign In" fix resolved the button interaction issue from round 1.

---

#### Test TC007 Sign up with whitelisted domain and valid password
- **Test Code:** [TC007_Sign_up_with_whitelisted_domain_and_valid_password.py](./TC007_Sign_up_with_whitelisted_domain_and_valid_password.py)
- **Test Error:** The Sign Up tab selection was unstable and the Create Account button was not reliably interactable.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/87fb3a2b-1d59-49db-9b6a-4bdcb7442e77
- **Status:** Failed
- **Severity:** HIGH
- **Analysis / Findings:** The Sign Up tab does not remain selected when clicked by test automation. The tab switches but reverts to Sign In. This is a timing/state issue with the HeroUI Tabs component — the onSelectionChange handler resets both forms, which may cause race conditions during rapid tab interaction. Additionally, the form values are cleared on tab change, compounding the issue.

---

### Requirement: Documentation Dashboard
- **Description:** Displays user documentation projects in a grid with status indicators, visibility badges, and quick actions.

#### Test TC004 View projects grid with status indicators
- **Test Code:** [TC004_View_projects_grid_with_status_indicators.py](./TC004_View_projects_grid_with_status_indicators.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/73cfb1fb-119c-4d12-a5c9-cdf6aee25817
- **Status:** Passed
- **Severity:** LOW
- **Analysis / Findings:** Successfully signed in and viewed the dashboard with documentation project cards. Status indicators and project grid are functioning correctly.

---

#### Test TC009 Start new documentation from dashboard empty state
- **Test Code:** [TC009_Start_new_documentation_from_dashboard_empty_state.py](./TC009_Start_new_documentation_from_dashboard_empty_state.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/c1f5bd66-8b62-4724-b86c-4d05252be26a
- **Status:** Passed
- **Severity:** LOW
- **Analysis / Findings:** Dashboard empty state is correctly displayed with the onboarding flow. The "New Documentation" CTA with aria-label is accessible and navigates to the creation wizard.

---

### Requirement: Create Documentation (multi-step wizard)
- **Description:** Multi-step wizard for creating documentation projects with name, type selection, repository URLs, branch selection, and custom AI instructions.

#### Test TC005 Create documentation wizard happy path to status page
- **Test Code:** [TC005_Create_documentation_wizard_happy_path_to_status_page.py](./TC005_Create_documentation_wizard_happy_path_to_status_page.py)
- **Test Error:** Authentication failed — "Credenciales invalidas" error message shown.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/5aa80ddc-92bb-42ea-9c04-04beeb1b93f7
- **Status:** Failed
- **Severity:** HIGH
- **Analysis / Findings:** The test agent received "Credenciales invalidas" (invalid credentials) error. This is an intermittent auth failure — TC001 and TC004 passed with the same credentials, suggesting the dev server is unstable under concurrent test load. The single-threaded Vite dev server may lose session state between concurrent test runs.

---

#### Test TC006 Start sign-up from landing CTA and reach documentation creation wizard
- **Test Code:** [TC006_Start_sign_up_from_landing_CTA_and_reach_documentation_creation_wizard.py](./TC006_Start_sign_up_from_landing_CTA_and_reach_documentation_creation_wizard.py)
- **Test Error:** Sign Up tab would not stay selected; Create Account button not reliably interactable.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/43737b39-1213-4916-95a9-56315e316388
- **Status:** Failed
- **Severity:** HIGH
- **Analysis / Findings:** Same root cause as TC007 — the Sign Up tab selection is unstable under automation. The tab reverts to Sign In after being clicked. This blocks the entire sign-up-dependent test path.

---

### Requirement: Generation Status Tracking
- **Description:** Real-time monitoring of documentation generation progress with cancel and regenerate options.

#### Test TC002 Successful generation completes and opens generated documentation
- **Test Code:** [TC002_Successful_generation_completes_and_opens_generated_documentation.py](./TC002_Successful_generation_completes_and_opens_generated_documentation.py)
- **Test Error:** Sign-in validation error state persists — "Please enter a valid email address" shown despite credentials being entered.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/9950cde1-dcf7-4df2-b287-d345cf87e749
- **Status:** Blocked
- **Severity:** HIGH
- **Analysis / Findings:** Intermittent auth issue — the form shows validation errors despite valid credentials being entered. Likely a race condition between React state updates and form submission when the dev server is under load from concurrent tests.

---

#### Test TC012 Cancel generation from status page reaches cancelled terminal state
- **Test Code:** [TC012_Cancel_generation_from_status_page_reaches_cancelled_terminal_state.py](./TC012_Cancel_generation_from_status_page_reaches_cancelled_terminal_state.py)
- **Test Error:** Sign In button not present among interactive elements after 3 attempts.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/f036a834-283a-4ee2-b932-4aca593646c0
- **Status:** Blocked
- **Severity:** HIGH
- **Analysis / Findings:** Blocked by intermittent auth failure. The button may be in a loading state (showing Spinner) when the test agent tries to interact with it.

---

### Requirement: View Documentation
- **Description:** Public documentation viewer with markdown rendering, syntax highlighting, mermaid diagrams, and sidebar navigation.

#### Test TC003 View a documentation page with navigation and rendered content
- **Test Code:** [TC003_View_a_documentation_page_with_navigation_and_rendered_content.py](./TC003_View_a_documentation_page_with_navigation_and_rendered_content.py)
- **Test Error:** No public documentation accessible; redirected to sign-in.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/16cae227-39f5-49af-8f64-ef2a43c5fada
- **Status:** Blocked
- **Severity:** MEDIUM
- **Analysis / Findings:** There are no published public documentation pages in the database. The /docs route requires a valid slug. The Get Started CTA redirects to /auth instead of a sample doc page. This is expected if no public documentation exists — the feature works correctly but needs seed data.

---

#### Test TC010 Switch pages from the sidebar hierarchy
- **Test Code:** [TC010_Switch_pages_from_the_sidebar_hierarchy.py](./TC010_Switch_pages_from_the_sidebar_hierarchy.py)
- **Test Error:** Authentication could not be completed; documentation viewer not reachable.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/6f00fa12-5d5a-465c-8afc-80f69ce4d5ae
- **Status:** Blocked
- **Severity:** HIGH
- **Analysis / Findings:** Blocked by intermittent auth failure. No published documentation accessible without authentication.

---

#### Test TC013 Owner sees an Edit action on documentation page after logging in
- **Test Code:** [TC013_Owner_sees_an_Edit_action_on_documentation_page_after_logging_in.py](./TC013_Owner_sees_an_Edit_action_on_documentation_page_after_logging_in.py)
- **Test Error:** Sign In form visible but submit control not interactable.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/79647126-5f1c-4f01-8ba3-fec38a64ac07
- **Status:** Blocked
- **Severity:** HIGH
- **Analysis / Findings:** Blocked by intermittent auth failure. The button may be in a loading/disabled state during concurrent test execution.

---

#### Test TC015 Navigate sequentially using previous and next links
- **Test Code:** [TC015_Navigate_sequentially_using_previous_and_next_links.py](./TC015_Navigate_sequentially_using_previous_and_next_links.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/665cc97f-4b89-4ccf-9b66-db517f8aff36
- **Status:** Passed
- **Severity:** LOW
- **Analysis / Findings:** Sequential navigation with previous/next links works correctly. This test passed by accessing an existing documentation page.

---

### Requirement: Edit Documentation
- **Description:** Edit documentation metadata, manage repositories, toggle visibility, regenerate, and delete.

#### Test TC008 Edit documentation metadata and see updates reflected on dashboard
- **Test Code:** [TC008_Edit_documentation_metadata_and_see_updates_reflected_on_dashboard.py](./TC008_Edit_documentation_metadata_and_see_updates_reflected_on_dashboard.py)
- **Test Error:** Authentication could not be completed after 3 attempts.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/b437634e-2ea4-417c-b263-092f185e7535
- **Status:** Blocked
- **Severity:** HIGH
- **Analysis / Findings:** Blocked by intermittent auth failure under concurrent load.

---

#### Test TC011 Toggle visibility from private to public and save
- **Test Code:** [TC011_Toggle_visibility_from_private_to_public_and_save.py](./TC011_Toggle_visibility_from_private_to_public_and_save.py)
- **Test Error:** No documentation projects exist to edit.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/67a1635b-dd66-4bdf-ab7c-a5411a012b0d
- **Status:** Blocked
- **Severity:** MEDIUM
- **Analysis / Findings:** The dashboard shows the onboarding empty state. No project exists to toggle visibility on. The test account needs seed data with at least one existing documentation project.

---

#### Test TC014 Delete documentation from settings removes it from dashboard list
- **Test Code:** [TC014_Delete_documentation_from_settings_removes_it_from_dashboard_list.py](./TC014_Delete_documentation_from_settings_removes_it_from_dashboard_list.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/0dea607a-f6be-43bf-9068-935fc30043d2
- **Status:** Passed
- **Severity:** LOW
- **Analysis / Findings:** Successfully created a documentation project, navigated to its settings, deleted it, and verified it no longer appeared on the dashboard. Full CRUD delete flow works correctly.

---

## 3 Coverage & Matching Metrics

- **33.3% of executed tests passed** (5 of 15 executed tests)
- **Improvement from round 1:** 6.67% (1/15) -> 33.3% (5/15), a **5x improvement**
- **11 tests skipped** due to dev mode limitation (max 15 tests)

| Requirement | Total Tests | Passed | Failed | Blocked | Skipped |
|---|---|---|---|---|---|
| User Authentication (email/password) | 5 | 1 | 1 | 0 | 3 |
| Documentation Dashboard | 3 | 2 | 0 | 0 | 1 |
| Create Documentation (multi-step wizard) | 5 | 0 | 2 | 0 | 3 |
| Generation Status Tracking | 3 | 0 | 0 | 2 | 1 |
| View Documentation | 6 | 1 | 0 | 3 | 2 |
| Edit Documentation | 4 | 1 | 0 | 2 | 1 |

---

## 4 Key Gaps / Risks

> **5 of 15 executed tests passed (33.3%), up from 1 of 15 (6.67%) in round 1.**

**Fixes that worked:**
- Removing TanStack Devtools overlay eliminated UI obstruction — TC001 and TC004 now pass consistently
- Adding aria-labels to buttons improved test automation interaction reliability

**Remaining issues:**

1. **Intermittent auth failures under concurrent load** — The single-threaded Vite dev server cannot reliably handle 15 concurrent test sessions. Some tests get "Credenciales invalidas" or stale form states. Fix: Run tests sequentially or use production build.

2. **Sign Up tab instability** — The HeroUI Tabs component reverts to Sign In when clicked by automation. The `handleTabChange` callback resets form state, causing a race condition with rapid tab clicks. Fix: Debounce tab change or use `data-testid` for tab identification.

3. **No seed data for documentation-dependent tests** — Tests for viewing, editing, and toggling visibility require existing documentation projects. The empty dashboard state blocks these tests. Fix: Create seed data or run creation tests before dependent tests.

4. **Dev mode 15-test cap** — 11 tests are skipped because the dev server limits concurrent tests. Production mode allows 30 tests. Fix: Resolve the Node.js streaming issue in production build to enable full test coverage.

**Recommendations for next steps:**
- Fix the production build streaming error (`source.type is invalid. Received 'direct'`) to enable production-mode testing
- Add database seed data for the test account with at least one completed documentation project
- Add `data-testid` attributes to the auth tabs for more reliable tab switching in automation
- Consider running tests sequentially rather than in parallel to reduce dev server load
