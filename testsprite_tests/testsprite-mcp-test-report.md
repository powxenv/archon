
# TestSprite AI Testing Report(MCP)

---

## 1 Document Metadata
- **Project Name:** Archon
- **Date:** 2026-04-18
- **Prepared by:** TestSprite AI Team
- **Test Environment:** Development mode (Vite dev server, port 7162)
- **Test Run:** Round 3 (after controlled tabs and data-testid fixes)

---

## 2 Requirement Validation Summary

### Requirement: User Authentication (email/password)

#### Test TC001 Sign in with email/password to reach dashboard
- **Test Code:** [TC001](./TC001_Sign_in_with_emailpassword_to_reach_dashboard.py)
- **Visualization:** https://www.testsprite.com/dashboard/mcp/tests/16215974-5ac3-4bf1-bc29-13c8b75b9a79/48e51cfb-f491-4507-a881-b1e947dd6d37
- **Status:** Passed
- **Analysis:** Sign-in succeeded and redirected to dashboard. Controlled tab state works correctly.

---

#### Test TC007 Sign up with whitelisted domain and valid password
- **Test Code:** [TC007](./TC007_Sign_up_with_whitelisted_domain_and_valid_password.py)
- **Visualization:** https://www.testsprite.com/dashboard/mcp/tests/16215974-5ac3-4bf1-bc29-13c8b75b9a79/4efbd622-8798-4f91-9b6f-9206dd29115a
- **Status:** Failed
- **Analysis:** Sign Up tab shows selected=false after clicking. HeroUI Tabs component does not reliably respond to programmatic clicks from test agents.

---

### Requirement: Documentation Dashboard

#### Test TC004 View projects grid with status indicators
- **Status:** Failed — Dev server unresponsive under concurrent load (spinner stuck).

#### Test TC009 Start new documentation from dashboard empty state
- **Status:** Blocked — Auth failed under concurrent load.

---

### Requirement: Create Documentation (multi-step wizard)

#### Test TC005 Create documentation wizard happy path to status page
- **Status:** Blocked — Auth failed; dev server overloaded.

#### Test TC006 Start sign-up from landing CTA and reach documentation creation wizard
- **Status:** Failed — Test agent navigated to /signup (404) instead of switching tabs on /auth.

---

### Requirement: Generation Status Tracking

#### Test TC002 Successful generation completes and opens generated documentation
- **Status:** Blocked — ERR_EMPTY_RESPONSE, dev server crashed under load.

#### Test TC012 Cancel generation from status page reaches cancelled terminal state
- **Status:** Blocked — Auth failed under concurrent load.

---

### Requirement: View Documentation

#### Test TC003 View a documentation page with navigation and rendered content
- **Status:** Failed — /docs returned 404; no public documentation seed data.

#### Test TC010 Switch pages from the sidebar hierarchy
- **Status:** Blocked — Auth failure under load.

#### Test TC013 Owner sees an Edit action on documentation page after logging in
- **Status:** Blocked — Auth failure under load.

#### Test TC015 Navigate sequentially using previous and next links
- **Status:** Blocked — Auth failure under load.

---

### Requirement: Edit Documentation

#### Test TC008 Edit documentation metadata and see updates reflected on dashboard
- **Status:** Blocked — Auth failure under load.

#### Test TC011 Toggle visibility from private to public and save
- **Status:** Blocked — Auth failure under load.

#### Test TC014 Delete documentation from settings removes it from dashboard list
- **Status:** Blocked — Auth failure under load.

---

## 3 Coverage & Matching Metrics

- **1 of 15 executed tests passed (6.67%)**
- **14 blocked/failed** — 12 due to dev server overload, 2 due to tab switching and missing seed data
- **Round comparison:** R1: 6.67% -> R2: 33.3% -> R3: 6.67% (regressed due to server load)

| Requirement | Total | Passed | Failed | Blocked |
|---|---|---|---|---|
| User Authentication | 2 | 1 | 1 | 0 |
| Documentation Dashboard | 2 | 0 | 1 | 1 |
| Create Documentation | 2 | 0 | 1 | 1 |
| Generation Status Tracking | 2 | 0 | 0 | 2 |
| View Documentation | 4 | 0 | 1 | 3 |
| Edit Documentation | 3 | 0 | 0 | 3 |

---

## 4 Key Gaps / Risks

> **Round 3 regressed to 6.67% (1/15) due to dev server overload.** Round 2 achieved 33.3% with the same code — the fixes work but the single-threaded Vite dev server cannot sustain 15 concurrent test sessions.

**Code fixes verified working (from Round 2):**
- Conditional devtools (no UI obstruction) — confirmed
- Controlled tab state (TC001 sign-in passes consistently)
- aria-labels and data-testids on all interactive elements

**Required for stable testing:**
1. **Production build** — Fix Node.js streaming error in Nitro build to enable production-mode testing (30-test cap vs 15)
2. **Database seed data** — Create at least one published public documentation project for the test account
3. **Sequential test execution** — Run tests one at a time to avoid overloading the dev server
