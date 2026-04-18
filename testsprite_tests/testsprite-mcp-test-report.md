
# TestSprite AI Testing Report(MCP)

---

## 1 Document Metadata
- **Project Name:** Archon
- **Date:** 2026-04-18
- **Prepared by:** TestSprite AI Team
- **Test Environment:** Development mode (Vite dev server, port 7162)

---

## 2 Requirement Validation Summary

### Requirement: User Authentication (email/password)
- **Description:** Supports sign in and sign up with email/password, GitHub OAuth, session management, and email domain validation.

#### Test TC001 Sign in with email/password to reach dashboard
- **Test Code:** [TC001_Sign_in_with_emailpassword_to_reach_dashboard.py](./TC001_Sign_in_with_emailpassword_to_reach_dashboard.py)
- **Test Error:** Sign-in form submitted but page remained on /auth; no redirect to dashboard occurred.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5db5fb5c-e359-40db-8c98-73f845610910/dc9d1312-8870-4d40-8b19-a6989b25fd8f
- **Status:** Failed
- **Severity:** HIGH
- **Analysis / Findings:** The sign-in form accepts the credentials visually but does not redirect the user to the dashboard. The Sign In form and button remain visible after submission. This suggests either a backend authentication failure, a session handling issue, or a client-side navigation bug. The credentials `testsprite@test.com` / provided password may not be registered in the database, or the auth endpoint may be returning an error that is not surfaced in the UI.

---

#### Test TC007 Sign up with whitelisted domain and valid password
- **Test Code:** [TC007_Sign_up_with_whitelisted_domain_and_valid_password.py](./TC007_Sign_up_with_whitelisted_domain_and_valid_password.py)
- **Test Error:** Sign-up form submitted but no redirect to dashboard occurred.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5db5fb5c-e359-40db-8c98-73f845610910/edf8372a-0b94-4a9f-bf76-461a1554e111
- **Status:** Failed
- **Severity:** HIGH
- **Analysis / Findings:** After filling the sign-up form with a whitelisted email and valid password, clicking Create Account multiple times had no effect. The page remained on the auth screen with no validation errors shown. The Create Account button may not be interactable via automation, or the backend sign-up endpoint may be failing silently.

---

### Requirement: Documentation Dashboard
- **Description:** Displays user documentation projects in a grid with status indicators, visibility badges, and quick actions.

#### Test TC004 View projects grid with status indicators
- **Test Code:** [TC004_View_projects_grid_with_status_indicators.py](./TC004_View_projects_grid_with_status_indicators.py)
- **Test Error:** Sign-in did not succeed; dashboard could not be reached.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5db5fb5c-e359-40db-8c98-73f845610910/f8f34a16-35cd-40fe-bf2e-efaac87de767
- **Status:** Failed
- **Severity:** HIGH
- **Analysis / Findings:** Blocked by the authentication failure in TC001. The sign-in page remained visible after multiple submit attempts. Previous attempts produced client-side validation errors and the UI returned to the sign-in state.

---

#### Test TC009 Start new documentation from dashboard empty state
- **Test Code:** [TC009_Start_new_documentation_from_dashboard_empty_state.py](./TC009_Start_new_documentation_from_dashboard_empty_state.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5db5fb5c-e359-40db-8c98-73f845610910/b8667d37-d219-4f47-9710-b2d2aa51bd80
- **Status:** Passed
- **Severity:** LOW
- **Analysis / Findings:** Successfully reached the dashboard empty state and the New Documentation wizard was accessible via the empty-state call-to-action. This confirms the onboarding flow works for new users with no existing projects.

---

### Requirement: Create Documentation (multi-step wizard)
- **Description:** Multi-step wizard for creating documentation projects with name, type selection, repository URLs, branch selection, and custom AI instructions.

#### Test TC005 Create documentation wizard happy path to status page
- **Test Code:** [TC005_Create_documentation_wizard_happy_path_to_status_page.py](./TC005_Create_documentation_wizard_happy_path_to_status_page.py)
- **Test Error:** The wizard could not advance past the Add Repositories step; the Next button appeared to trigger "Add More" behavior instead of advancing the flow.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5db5fb5c-e359-40db-8c98-73f845610910/79d885a9-4f8e-4710-b3c3-3ca3af06a829
- **Status:** Failed
- **Severity:** HIGH
- **Analysis / Findings:** The wizard reached the Add Repositories step and a valid public repo URL was entered. However, clicking the Next button repeatedly returned the wizard to the Name step instead of advancing to branch selection. The TanStack Devtools overlay may also be obscuring interactive elements. The button selector may be ambiguous, with "Add More" and "Next" sharing a similar DOM structure.

---

#### Test TC006 Start sign-up from landing CTA and reach documentation creation wizard
- **Test Code:** [TC006_Start_sign_up_from_landing_CTA_and_reach_documentation_creation_wizard.py](./TC006_Start_sign_up_from_landing_CTA_and_reach_documentation_creation_wizard.py)
- **Test Error:** Sign-up flow returned a "Something went wrong!" error banner on /auth.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5db5fb5c-e359-40db-8c98-73f845610910/df3e6f5c-756d-45a7-9b88-e2712400309c
- **Status:** Blocked
- **Severity:** HIGH
- **Analysis / Findings:** The /auth page displayed an error banner with message "Something went wrong!" (network/error). Attempts to submit the Create Account form repeatedly failed or reverted to the Sign In panel. The dashboard and creation wizard could not be reached. This indicates a potential backend connectivity issue or auth service misconfiguration.

---

#### Test TC022 Wizard blocks submit when documentation name is missing
- **Test Code:** [TC022_Wizard_blocks_submit_when_documentation_name_is_missing.py](./TC022_Wizard_blocks_submit_when_documentation_name_is_missing.py)
- **Test Error:** Not executed (limited to 15 tests in dev mode).
- **Status:** Skipped
- **Severity:** MEDIUM

---

#### Test TC024 Wizard rejects non-HTTPS repository URL
- **Test Code:** [TC024_Wizard_rejects_nonHTTPS_repository_URL.py](./TC024_Wizard_rejects_nonHTTPS_repository_URL.py)
- **Test Error:** Not executed (limited to 15 tests in dev mode).
- **Status:** Skipped
- **Severity:** MEDIUM

---

#### Test TC019 Create documentation with multiple repositories and branch selection per repo
- **Test Code:** [TC019_Create_documentation_with_multiple_repositories_and_branch_selection_per_repo.py](./TC019_Create_documentation_with_multiple_repositories_and_branch_selection_per_repo.py)
- **Test Error:** Not executed (limited to 15 tests in dev mode).
- **Status:** Skipped
- **Severity:** MEDIUM

---

### Requirement: Generation Status Tracking
- **Description:** Real-time monitoring of documentation generation progress with cancel and regenerate options.

#### Test TC002 Successful generation completes and opens generated documentation
- **Test Code:** [TC002_Successful_generation_completes_and_opens_generated_documentation.py](./TC002_Successful_generation_completes_and_opens_generated_documentation.py)
- **Test Error:** Authentication failed; generation flow is unreachable without signing in.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5db5fb5c-e359-40db-8c98-73f845610910/ddcfaca3-9065-4d57-a025-3d4b8f81c6ae
- **Status:** Blocked
- **Severity:** HIGH
- **Analysis / Findings:** After submitting the provided credentials the app remained on the Sign In page across 3 attempts. No dashboard or project creation controls were visible. Blocked by the authentication failure.

---

#### Test TC012 Cancel generation from status page reaches cancelled terminal state
- **Test Code:** [TC012_Cancel_generation_from_status_page_reaches_cancelled_terminal_state.py](./TC012_Cancel_generation_from_status_page_reaches_cancelled_terminal_state.py)
- **Test Error:** Sign-in did not succeed; test cannot proceed to generation flow.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5db5fb5c-e359-40db-8c98-73f845610910/dae5ad4c-7854-49e3-a2c1-9f596e4e7067
- **Status:** Blocked
- **Severity:** HIGH
- **Analysis / Findings:** The sign-in form remained visible after submitting the provided credentials twice. No clear error message explaining the failure is shown. Blocked by the authentication failure.

---

#### Test TC017 Regenerate after failure with updated instructions returns to running state
- **Test Code:** [TC017_Regenerate_after_failure_with_updated_instructions_returns_to_running_state.py](./TC017_Regenerate_after_failure_with_updated_instructions_returns_to_running_state.py)
- **Test Error:** Not executed (limited to 15 tests in dev mode).
- **Status:** Skipped
- **Severity:** MEDIUM

---

### Requirement: View Documentation
- **Description:** Public documentation viewer with markdown rendering, syntax highlighting, mermaid diagrams, and sidebar navigation.

#### Test TC003 View a documentation page with navigation and rendered content
- **Test Code:** [TC003_View_a_documentation_page_with_navigation_and_rendered_content.py](./TC003_View_a_documentation_page_with_navigation_and_rendered_content.py)
- **Test Error:** Documentation is not publicly accessible; /docs showed "Page not found".
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5db5fb5c-e359-40db-8c98-73f845610910/d5d31deb-e040-47b3-bb06-63f820cc49e5
- **Status:** Failed
- **Severity:** HIGH
- **Analysis / Findings:** Clicking the Get Started CTA redirected to the sign-in page instead of opening a public documentation page. Direct navigation to /docs showed a "Page not found" message. No published documentation exists that is accessible to unauthenticated users, making the public viewer feature untestable without first creating documentation.

---

#### Test TC010 Switch pages from the sidebar hierarchy
- **Test Code:** [TC010_Switch_pages_from_the_sidebar_hierarchy.py](./TC010_Switch_pages_from_the_sidebar_hierarchy.py)
- **Test Error:** Documentation viewer was never reached; sidebar selection could not be tested.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5db5fb5c-e359-40db-8c98-73f845610910/1326d778-1dee-49ed-affd-59f8458607b9
- **Status:** Failed
- **Severity:** HIGH
- **Analysis / Findings:** Multiple attempts to reach the documentation viewer failed. Sign-in did not navigate to a published doc, and the creation flow's Next button was not interactable. The core precondition (access to a documentation viewer with a sidebar) was never met.

---

#### Test TC013 Owner sees an Edit action on documentation page after logging in
- **Test Code:** [TC013_Owner_sees_an_Edit_action_on_documentation_page_after_logging_in.py](./TC013_Owner_sees_an_Edit_action_on_documentation_page_after_logging_in.py)
- **Test Error:** Creation flow could not advance past Add Repositories step.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5db5fb5c-e359-40db-8c98-73f845610910/73dc7cd8-d46a-4fe8-908f-938a6f3e171c
- **Status:** Failed
- **Severity:** HIGH
- **Analysis / Findings:** The Add Repositories step shows a button that combines "Add More" and "Next" labels. Clicking it repeatedly only adds more repo inputs and does not advance the flow. The documentation viewer was never opened, so the Edit action could not be verified.

---

#### Test TC015 Navigate sequentially using previous and next links
- **Test Code:** [TC015_Navigate_sequentially_using_previous_and_next_links.py](./TC015_Navigate_sequentially_using_previous_and_next_links.py)
- **Test Error:** Creation flow could not be completed; viewer never loaded.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5db5fb5c-e359-40db-8c98-73f845610910/14b93351-73ec-4503-980d-7db3c2046911
- **Status:** Blocked
- **Severity:** HIGH
- **Analysis / Findings:** On /app/new the documentation name input is present but no interactive Next button was found. The viewer never loaded, so sequential navigation could not be tested.

---

#### Test TC018 Owner can navigate from docs viewer to edit settings
- **Test Code:** [TC018_Owner_can_navigate_from_docs_viewer_to_edit_settings.py](./TC018_Owner_can_navigate_from_docs_viewer_to_edit_settings.py)
- **Test Error:** Not executed (limited to 15 tests in dev mode).
- **Status:** Skipped
- **Severity:** MEDIUM

---

#### Test TC026 Open Ask AI action from a documentation page
- **Test Code:** [TC026_Open_Ask_AI_action_from_a_documentation_page.py](./TC026_Open_Ask_AI_action_from_a_documentation_page.py)
- **Test Error:** Not executed (limited to 15 tests in dev mode).
- **Status:** Skipped
- **Severity:** LOW

---

### Requirement: Edit Documentation
- **Description:** Edit documentation metadata, manage repositories, toggle visibility, regenerate, and delete.

#### Test TC008 Edit documentation metadata and see updates reflected on dashboard
- **Test Code:** [TC008_Edit_documentation_metadata_and_see_updates_reflected_on_dashboard.py](./TC008_Edit_documentation_metadata_and_see_updates_reflected_on_dashboard.py)
- **Test Error:** Sign-in could not be completed; dashboard could not be reached.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5db5fb5c-e359-40db-8c98-73f845610910/83d02fc1-9144-4743-a997-8995a9fb8187
- **Status:** Blocked
- **Severity:** HIGH
- **Analysis / Findings:** The sign-in page remained visible after three submission attempts. The Sign In submit control appeared disabled or was not present in the page's interactive elements, with a loading indicator SVG visible instead.

---

#### Test TC011 Toggle visibility from private to public and save
- **Test Code:** [TC011_Toggle_visibility_from_private_to_public_and_save.py](./TC011_Toggle_visibility_from_private_to_public_and_save.py)
- **Test Error:** No documentation project exists; dashboard shows empty state.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5db5fb5c-e359-40db-8c98-73f845610910/23c3f055-b762-463d-9184-4826fe54245a
- **Status:** Blocked
- **Severity:** MEDIUM
- **Analysis / Findings:** The dashboard shows the onboarding/empty state with "Get started with your first documentation" message. No project items, settings links, or visibility controls are visible. A project must first be created before this test can run.

---

#### Test TC014 Delete documentation from settings removes it from dashboard list
- **Test Code:** [TC014_Delete_documentation_from_settings_removes_it_from_dashboard_list.py](./TC014_Delete_documentation_from_settings_removes_it_from_dashboard_list.py)
- **Test Error:** Create-documentation wizard is blocked on the Add Repositories step.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5db5fb5c-e359-40db-8c98-73f845610910/dfe3217c-8394-46dc-8e6e-148c0f6d0b51
- **Status:** Blocked
- **Severity:** HIGH
- **Analysis / Findings:** The Add Repositories step's Next button triggers "Add More" behavior instead of advancing the flow. Because the documentation project cannot be created, the delete/verification steps cannot be performed.

---

#### Test TC020 Update repositories and branches in documentation settings
- **Test Code:** [TC020_Update_repositories_and_branches_in_documentation_settings.py](./TC020_Update_repositories_and_branches_in_documentation_settings.py)
- **Test Error:** Not executed (limited to 15 tests in dev mode).
- **Status:** Skipped
- **Severity:** MEDIUM

---

### Requirement: Landing Page
- **Description:** Marketing landing page with hero section, feature cards, and call-to-action.

#### Test TC021 Navigate landing content and start authentication
- **Test Code:** [TC021_Navigate_landing_content_and_start_authentication.py](./TC021_Navigate_landing_content_and_start_authentication.py)
- **Test Error:** Not executed (limited to 15 tests in dev mode).
- **Status:** Skipped
- **Severity:** MEDIUM

---

### Requirement: User Authentication Validation
- **Description:** Validation of sign-up form with edge cases for email domain and password requirements.

#### Test TC023 Block sign up with non-whitelisted email domain
- **Test Code:** [TC023_Block_sign_up_with_nonwhitelisted_email_domain.py](./TC023_Block_sign_up_with_nonwhitelisted_email_domain.py)
- **Test Error:** Not executed (limited to 15 tests in dev mode).
- **Status:** Skipped
- **Severity:** MEDIUM

---

#### Test TC025 Block sign up with too-short password
- **Test Code:** [TC025_Block_sign_up_with_tooshort_password.py](./TC025_Block_sign_up_with_tooshort_password.py)
- **Test Error:** Not executed (limited to 15 tests in dev mode).
- **Status:** Skipped
- **Severity:** MEDIUM

---

#### Test TC016 Retry a failed generation from dashboard
- **Test Code:** [TC016_Retry_a_failed_generation_from_dashboard.py](./TC016_Retry_a_failed_generation_from_dashboard.py)
- **Test Error:** Not executed (limited to 15 tests in dev mode).
- **Status:** Skipped
- **Severity:** MEDIUM

---

## 3 Coverage & Matching Metrics

- **6.67% of executed tests passed** (1 of 15 executed tests)
- **11 tests skipped** due to dev mode limitation (max 15 tests)

| Requirement | Total Tests | Passed | Failed | Blocked | Skipped |
|---|---|---|---|---|---|
| User Authentication (email/password) | 5 | 0 | 2 | 0 | 3 |
| Documentation Dashboard | 3 | 1 | 1 | 0 | 1 |
| Create Documentation (multi-step wizard) | 5 | 0 | 1 | 1 | 3 |
| Generation Status Tracking | 3 | 0 | 0 | 2 | 1 |
| View Documentation | 6 | 0 | 3 | 1 | 2 |
| Edit Documentation | 4 | 0 | 0 | 3 | 1 |
| Landing Page | 1 | 0 | 0 | 0 | 1 |

---

## 4 Key Gaps / Risks

> **1 of 15 executed tests passed (6.67%). 11 tests were skipped due to dev mode limits.**

**Critical Issues:**

1. **Authentication is non-functional for automated testing** - The sign-in form accepts credentials visually but does not redirect to the dashboard. This blocked 8 of 15 tests. Root cause may be: credentials not registered in the database, auth endpoint returning errors that are not surfaced in the UI, or a session handling bug. The sign-up flow also shows a "Something went wrong!" error banner, suggesting a backend auth service issue.

2. **Wizard "Next" button ambiguity in Add Repositories step** - The Add Repositories step has a button that appears to serve dual purpose ("Add More" and "Next"). TestSprite agents cannot distinguish between the two actions, causing the wizard to add more inputs instead of advancing. This requires clearer button separation or distinct accessibility labels.

3. **No public documentation available for anonymous viewing** - The /docs route returns "Page not found" when no documentation slug is provided. There are no published public documentation pages for unauthenticated users to browse, making the documentation viewer feature untestable without first creating content through the blocked creation flow.

**Recommendations:**

- Verify the test account `testsprite@test.com` exists in the database and the credentials are correct
- Run the app in production mode (`bun run build && bun run preview`) for better test stability and to allow all 30 tests to execute
- Add distinct `aria-label` attributes to the wizard's "Add More" and "Next" buttons for testability
- Create at least one published public documentation entry for viewer testing
- Investigate the auth error banner ("Something went wrong!") that appears during sign-up attempts
