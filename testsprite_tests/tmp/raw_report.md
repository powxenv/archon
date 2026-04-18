
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** archon
- **Date:** 2026-04-18
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Sign in with email/password to reach dashboard
- **Test Code:** [TC001_Sign_in_with_emailpassword_to_reach_dashboard.py](./TC001_Sign_in_with_emailpassword_to_reach_dashboard.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/eb33306d-8111-4921-9c56-0d4f31b698a0
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Successful generation completes and opens generated documentation
- **Test Code:** [TC002_Successful_generation_completes_and_opens_generated_documentation.py](./TC002_Successful_generation_completes_and_opens_generated_documentation.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached — authentication cannot be completed because the sign-in form remains in a validation error state.

Observations:
- The sign-in page still shows 'Please enter a valid email address' and 'Password must be at least 8 characters' after entering the provided credentials.
- The Email and Password inputs have invalid=true and the Sign In form does not progress or redirect after multiple submit attempts.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/9950cde1-dcf7-4df2-b287-d345cf87e749
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 View a documentation page with navigation and rendered content
- **Test Code:** [TC003_View_a_documentation_page_with_navigation_and_rendered_content.py](./TC003_View_a_documentation_page_with_navigation_and_rendered_content.py)
- **Test Error:** TEST BLOCKED

The documentation could not be reached without authentication — the site redirected to the Sign In page when attempting to view a sample/published documentation page.

Observations:
- Clicking the 'Get Started' CTA navigated to /auth and displayed the Sign In form.
- There is no visible public documentation sidebar or sample page accessible from the landing flow; the UI only presents sign-in options.
- Access appears gated behind authentication, so a public reader cannot view published docs through the flow exercised.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/16cae227-39f5-49af-8f64-ef2a43c5fada
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 View projects grid with status indicators
- **Test Code:** [TC004_View_projects_grid_with_status_indicators.py](./TC004_View_projects_grid_with_status_indicators.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/73cfb1fb-119c-4d12-a5c9-cdf6aee25817
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Create documentation wizard happy path to status page
- **Test Code:** [TC005_Create_documentation_wizard_happy_path_to_status_page.py](./TC005_Create_documentation_wizard_happy_path_to_status_page.py)
- **Test Error:** TEST BLOCKED

The test cannot proceed because authentication failed with the provided credentials.

Observations:
- The login page shows the error message 'Credenciales invalidas'.
- The app remained on the login screen and the dashboard never loaded.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/5aa80ddc-92bb-42ea-9c04-04beeb1b93f7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Start sign-up from landing CTA and reach documentation creation wizard
- **Test Code:** [TC006_Start_sign_up_from_landing_CTA_and_reach_documentation_creation_wizard.py](./TC006_Start_sign_up_from_landing_CTA_and_reach_documentation_creation_wizard.py)
- **Test Error:** TEST FAILURE

The sign-up flow could not be completed — the Sign Up form would not stay active and the Create Account action could not be submitted, so no dashboard or wizard was reached.

Observations:
- Clicking the Sign Up tab repeatedly left the UI on the Sign In panel (Sign Up did not remain selected).
- The Create Account button never became reliably interactable; clicks returned stale/non-interactable errors.
- No navigation to the dashboard empty state occurred after repeated attempts.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/43737b39-1213-4916-95a9-56315e316388
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Sign up with whitelisted domain and valid password
- **Test Code:** [TC007_Sign_up_with_whitelisted_domain_and_valid_password.py](./TC007_Sign_up_with_whitelisted_domain_and_valid_password.py)
- **Test Error:** TEST FAILURE

Creating an account did not work — the form could not be successfully submitted and the app did not redirect to the dashboard.

Observations:
- Multiple attempts to submit 'Create Account' failed or the button was not interactable.
- The page remained on the authentication screen and did not navigate to a dashboard after submission attempts.
- The Sign Up tab and form state were unstable (tab sometimes not selected and form values cleared).
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/87fb3a2b-1d59-49db-9b6a-4bdcb7442e77
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Edit documentation metadata and see updates reflected on dashboard
- **Test Code:** [TC008_Edit_documentation_metadata_and_see_updates_reflected_on_dashboard.py](./TC008_Edit_documentation_metadata_and_see_updates_reflected_on_dashboard.py)
- **Test Error:** TEST BLOCKED

The test cannot proceed because the user could not be authenticated with the provided credentials and the dashboard/project settings cannot be reached.

Observations:
- Tried signing in 3 times (two click submits + one Enter); the app remained on the public landing or did not produce a confirmed authenticated session.
- No authenticated dashboard or existing project was available to open settings; the Create Documentation wizard was started but not submitted.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/b437634e-2ea4-417c-b263-092f185e7535
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Start new documentation from dashboard empty state
- **Test Code:** [TC009_Start_new_documentation_from_dashboard_empty_state.py](./TC009_Start_new_documentation_from_dashboard_empty_state.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/c1f5bd66-8b62-4724-b86c-4d05252be26a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Switch pages from the sidebar hierarchy
- **Test Code:** [TC010_Switch_pages_from_the_sidebar_hierarchy.py](./TC010_Switch_pages_from_the_sidebar_hierarchy.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached — authentication could not be completed, so the documentation viewer and sidebar cannot be accessed.

Observations:
- Submitting the Sign In form with the provided credentials kept the page on the Sign In screen.
- Email and Password fields remained populated and no navigation occurred.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/6f00fa12-5d5a-465c-8afc-80f69ce4d5ae
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Toggle visibility from private to public and save
- **Test Code:** [TC011_Toggle_visibility_from_private_to_public_and_save.py](./TC011_Toggle_visibility_from_private_to_public_and_save.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached — there are no existing documentation projects to open and change visibility for.

Observations:
- The app shows the onboarding screen with 'Get started with your first documentation' and a 'New Documentation' CTA.
- No project listing or project settings link was visible on the dashboard to open a project's visibility settings.
- Multiple sign-in attempts were made but the UI remained on the app onboarding screen, so a signed-in project could not be accessed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/67a1635b-dd66-4bdf-ab7c-a5411a012b0d
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Cancel generation from status page reaches cancelled terminal state
- **Test Code:** [TC012_Cancel_generation_from_status_page_reaches_cancelled_terminal_state.py](./TC012_Cancel_generation_from_status_page_reaches_cancelled_terminal_state.py)
- **Test Error:** TEST BLOCKED

The Sign In control cannot be accessed — the test cannot proceed to authenticate and start a generation.

Observations:
- The page shows the Sign In form with Email and Password fields filled, but there is no interactive index for the Sign In button available to click.
- Previous sign-in attempts (3) left the UI on the same sign-in screen, so authentication could not be confirmed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/f036a834-283a-4ee2-b932-4aca593646c0
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Owner sees an Edit action on documentation page after logging in
- **Test Code:** [TC013_Owner_sees_an_Edit_action_on_documentation_page_after_logging_in.py](./TC013_Owner_sees_an_Edit_action_on_documentation_page_after_logging_in.py)
- **Test Error:** TEST BLOCKED

Authentication cannot be completed from the current UI, so the test cannot proceed to verify the documentation viewer's Edit action.

Observations:
- The Sign In form is visible and both Email and Password fields are filled, but submitting does not navigate to the dashboard.
- The Sign In control is not present among the page's interactive elements, preventing a reliable submit.
- Multiple sign-in attempts returned the same sign-in page state with no dashboard access.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/79647126-5f1c-4f01-8ba3-fec38a64ac07
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Delete documentation from settings removes it from dashboard list
- **Test Code:** [TC014_Delete_documentation_from_settings_removes_it_from_dashboard_list.py](./TC014_Delete_documentation_from_settings_removes_it_from_dashboard_list.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/0dea607a-f6be-43bf-9068-935fc30043d2
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Navigate sequentially using previous and next links
- **Test Code:** [TC015_Navigate_sequentially_using_previous_and_next_links.py](./TC015_Navigate_sequentially_using_previous_and_next_links.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/607c1d34-b616-4538-ac6b-a7c53d83de9c/665cc97f-4d89-4ccf-9b66-db517f8aff36
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **33.33** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---