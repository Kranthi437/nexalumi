# NEXALUMI --- Product Vision, Requirements & AI Development Brief

**Working brand name:** NEXALUMI\
**Working tagline:** Your Digital Safety Partner\
**Product category:** Consumer cybersecurity and digital-safety
platform\
**Document purpose:** Give Cursor, Claude, or another AI coding agent a
clear product brief and implementation instructions.

> **Important brand/legal status:** NEXALUMI is a working name only. It
> has not been legally cleared. Before public launch, check exact and
> similar marks in the Indian IP India trademark database and WIPO,
> check company-name conflicts, domains and social handles, and obtain
> professional trademark advice. Do not represent the name as registered
> or guaranteed unique.

------------------------------------------------------------------------

## 1. Instructions to the AI development agent

Act as a senior product engineer, UX designer, application architect,
security engineer, and QA engineer.

Build NEXALUMI as a real, maintainable digital-safety product. The
product owner is a beginner programmer with QA automation experience.
Explain decisions in plain English and provide step-by-step
instructions.

### Non-negotiable development rules

1.  **Do not try to generate the entire production platform in one giant
    step.** Work in phases, keep the application runnable after each
    phase, and report what was completed.
2.  First inspect the existing repository and its conventions. Do not
    overwrite working code without explaining why.
3.  Create a concise implementation plan, architecture diagram, folder
    structure, and data model before major implementation.
4.  Prefer simple, readable, well-structured code over clever or
    unnecessarily complex abstractions.
5.  Do not create duplicate components, modules, services, utilities,
    API clients, validation logic, or database models.
6.  Reuse existing code after inspecting it. If a reusable function
    exists, extend it instead of creating another version.
7.  Keep UI pages focused on presentation and user interaction. Put
    business logic in reusable services/hooks/modules.
8.  Keep secrets, API keys, database credentials, and tokens out of
    source control and browser code. Use environment variables and
    provide `.env.example` with placeholders only.
9.  Add input validation, useful error handling, loading states, empty
    states, and accessible labels.
10. Use secure defaults. Never silently treat an unknown URL or message
    as safe.
11. Never open, navigate to, or execute a user-submitted suspicious URL
    as part of scanning.
12. Do not claim that AI can perfectly detect scams, AI-generated
    content, or every malicious URL. Explain uncertainty and evidence.
13. Do not invent integrations or pretend an external
    threat-intelligence service is connected. If credentials are absent,
    implement a clearly labelled demo/mock provider and document how to
    configure a real provider.
14. Add automated tests for important behavior. Keep tests deterministic
    and do not depend on live malicious URLs.
15. Do not add unnecessary dependencies. Explain why each significant
    dependency is needed.
16. Document setup, architecture, environment variables, database
    migrations, tests, deployment, limitations, and security decisions
    in English.
17. Do not store raw message or email content by default. Make retention
    explicit and user-controlled where feasible.
18. Do not implement offensive security features, malware execution,
    credential harvesting, or unauthorized scanning.
19. Do not use real customer data in development fixtures. Use clearly
    fictional sample data.
20. At the end of every phase, list changed files, commands to run, test
    results, known limitations, and the next recommended phase.

If a requirement is ambiguous, choose a safe and simple default,
document the assumption, and ask only questions that block
implementation.

------------------------------------------------------------------------

## 2. Product overview

NEXALUMI helps everyday people make safer decisions online. Users can
check suspicious links, scam messages, emails, and QR-code destinations
and receive understandable explanations and recommended next steps.

### Mission

Make digital safety understandable and accessible to everyone.

### Product promise

Help users recognize warning signs before they click, share information,
or make a payment.

### Target users

-   Individuals who use websites, messaging apps, email, online
    shopping, and digital payments.
-   Families who want straightforward online-safety guidance.
-   Later: small businesses and organizations that need employee-facing
    awareness and threat reporting.

### Product personality

-   Friendly, reassuring, clear, and trustworthy.
-   Professional enough for a global technology brand.
-   Avoid fear-based messaging, unnecessary technical jargon, and
    alarmist language.
-   Explain what was detected, why it matters, and what the user can do
    next.

### Brand direction

-   Name: NEXALUMI (working name, subject to clearance).
-   Tagline: Your Digital Safety Partner.
-   Visual idea: a distinctive shield combined with a small
    sparkle/check motif.
-   Do not copy another company's logo, interface, text, or
    illustrations.
-   Create an original logo concept and a simple text-based fallback
    logo.

------------------------------------------------------------------------

## 3. Product principles and safety language

The platform is a decision-support tool, not a guarantee of safety.

Use these result categories consistently:

  -----------------------------------------------------------------------
  Result                  Meaning                 Suggested user wording
  ----------------------- ----------------------- -----------------------
  Known malicious         A trusted source or     "Known threat detected.
                          strong evidence         Do not open this link."
                          identifies a threat     

  Suspicious              One or more risk        "This looks suspicious.
                          indicators were found   Review the reasons
                                                  before proceeding."

  No known threat found   Available checks did    "No known threat was
                          not identify a known    found by the checks
                          threat                  performed. Stay
                                                  cautious."

  Unknown / unable to     Not enough information  "We could not verify
  check                   or provider unavailable this item. Treat it
                                                  with caution."
  -----------------------------------------------------------------------

Never label an item simply "100% safe." Explain that threat databases
can be incomplete or delayed.

------------------------------------------------------------------------

## 4. Scope and delivery roadmap

Build a responsive website first. Do not build a native mobile app in
the first release. Design the website so it can later support a mobile
app or progressive web app.

### Phase 0 --- Discovery and foundation

-   Inspect repository.
-   Confirm stack and runtime versions.
-   Create architecture and implementation plan.
-   Set up Git hygiene, linting, formatting, environment configuration,
    and test commands.
-   Create README and security notes.
-   Confirm local development works.

### Phase 1 --- Frontend prototype

Build a polished, responsive UI using fictional sample data: - Landing
page. - Sign-up and login screens (UI only until authentication is
implemented). - User dashboard. - Link Check screen. - Message Check
screen. - Scan History screen. - Settings and help pages. - Basic
admin-console UI only if it does not delay the core experience.

All demo results must be visibly labelled **Demo**. Do not imply a real
threat scan has occurred.

### Phase 2 --- Functional MVP

Implement: 1. Secure registration, login, logout, password reset, and
email verification using a reputable authentication solution. 2.
Dashboard with accurate counts derived from stored scan metadata. 3.
Link Check using a provider interface and a configured
threat-intelligence/reputation service. 4. Message Check using
explainable rule-based indicators first, with optional AI analysis
behind a provider interface. 5. Scan History with deletion and retention
controls. 6. Basic administrative functions with role-based access
control and audit logging.

### Phase 3 --- Additional checks

-   Email Check.
-   QR Check: decode an uploaded QR image locally where possible, then
    analyze the extracted destination as a URL.
-   Security Alerts and notification preferences.
-   Safety Academy: curated educational content.

### Phase 4 --- Hardening and release readiness

-   Security review and dependency audit.
-   Privacy review and data-retention review.
-   Accessibility review.
-   Performance and cross-browser testing.
-   Backup/restore and monitoring plan.
-   Independent security testing before production use.
-   Deployment and rollback documentation.

### Later possibilities (not MVP)

-   Browser extension.
-   Native mobile applications.
-   Family accounts and parental features.
-   Business/organization dashboard.
-   Organization awareness campaigns.
-   Additional identity-protection services, only after a clear legal,
    privacy, and operational review.

------------------------------------------------------------------------

## 5. Main modules and their purpose

### 5.1 Dashboard

**Purpose:** Give the user a clear summary of their digital-safety
activity.

Show: - Welcome message. - Overall recent activity. - Number of
links/messages checked. - Counts of known malicious, suspicious,
no-known-threat, and unknown results. - Recent scans. - Quick links to
Link Check and Message Check. - Practical safety tip.

Do not display a fabricated "protection score" unless its calculation is
transparent and meaningful. Do not imply that the user's device is
continuously protected if the platform only analyzes submitted items.

### 5.2 Link Check

**Purpose:** Analyze a submitted URL for known threats and suspicious
indicators.

User flow: 1. User pastes a URL. 2. Validate and normalize the input
safely. 3. Show a confirmation of the hostname/domain being checked. 4.
Query configured reputation/threat-intelligence providers. 5. Apply
additional safe URL-pattern checks. 6. Show a result category, evidence,
limitations, and recommended action. 7. Save scan metadata to history
according to the retention policy.

Possible checks: - URL syntax and hostname validation. - Known
phishing/malware reputation from a configured provider. - HTTPS presence
(not proof of safety). - IP-literal hosts, unusual ports, suspicious
encoding, misleading subdomains, URL shorteners, and lookalike
patterns. - Redirect analysis only through a hardened, isolated service
if it is added later.

**Critical security requirements:** - Do not visit the submitted URL in
the user's browser or backend as part of the basic scan. - Do not fetch
arbitrary URLs from the server without a dedicated SSRF-safe design. -
If server-side retrieval is ever implemented, block loopback, private,
link-local, reserved, and internal IP ranges; validate DNS results and
every redirect; defend against DNS rebinding; restrict schemes, ports,
response size, timeouts, and content types; use network isolation and
egress controls. - Do not send sensitive query strings or tokens to
third-party providers without appropriate privacy controls. - Do not log
full URLs if they may contain credentials or personal tokens. Consider
redaction or hashing.

### 5.3 Message Check

**Purpose:** Help users identify possible scam messages from SMS,
messaging apps, and social platforms.

User flow: 1. User pastes message text. 2. The application identifies
possible warning signs. 3. The result explains each warning sign. 4. The
user receives safe next steps.

Possible indicators: - Urgency or threats. - Unexpected prizes or
refunds. - Requests for OTP, password, PIN, or bank details. - Requests
for payment or gift cards. - Impersonation of banks, delivery companies,
government bodies, or support teams. - Suspicious links, phone numbers,
or contact details. - Requests to move a conversation to another
channel.

Use deterministic rules for clear patterns and optional AI for
contextual explanation. AI output must be treated as untrusted and must
not override strong security rules. Do not state that a message is
fraudulent solely because it has poor grammar or unusual wording.

### 5.4 Email Check

**Purpose:** Help users inspect phishing indicators in an email.

Initial safe MVP input: - Sender address. - Display name. - Subject. -
Message body (optional). - Extracted links (optional).

Later, consider `.eml` upload with strict file-size, MIME-type, parsing,
malware-handling, and privacy controls.

Analyze: - Sender/display-name mismatch. - Domain similarity and
impersonation signals. - Suspicious links and known threat reputation. -
Urgent payment or credential requests. - Unexpected attachments
(metadata only unless safe file scanning is separately designed).

Do not request email account passwords. Do not connect to a user's
mailbox without explicit consent and a carefully reviewed integration.

### 5.5 QR Check

**Purpose:** Decode a QR code and analyze the destination before the
user opens it.

-   Accept common image formats with size/type validation.
-   Decode the QR destination without navigating to it.
-   Display the extracted domain clearly.
-   Pass the destination to the Link Check service.
-   Warn if the QR code contains a non-web action, such as a payment
    URI, phone number, or Wi-Fi configuration.
-   Never automatically open the decoded destination.

### 5.6 Scan History

**Purpose:** Let users review previous checks.

Store only what is necessary: - Scan ID. - User ID. - Scan type. -
Timestamp. - Result category. - Provider/check metadata. - Redacted or
minimized indicator summary.

Default: do not persist raw message/email content. If raw content
retention is later offered, make it opt-in, explain the risk, provide
deletion controls, and define a retention period.

### 5.7 Security Alerts

**Purpose:** Notify users about important platform findings and account
events.

-   In-app notifications first.
-   Email notifications only with consent and verified addresses.
-   User preferences for categories and frequency.
-   No exaggerated or fear-based marketing alerts.
-   Do not claim to monitor accounts or devices continuously unless that
    capability exists.

### 5.8 Safety Academy

**Purpose:** Teach users simple, practical security habits.

Topics: - Phishing and fake websites. - OTP and payment scams. - Fake
customer support. - QR-code scams. - Account security and MFA. - Safe
online shopping. - Social engineering. - What to do after clicking a
suspicious link.

Content must be original or properly licensed, reviewed, dated, and
written in plain language.

### 5.9 Admin Console

**Purpose:** Operate the service safely.

-   Role-based access.
-   User account status and support actions.
-   Scan volume and provider health metrics.
-   Abuse/rate-limit monitoring.
-   Audit logs for sensitive admin actions.
-   Manage educational content and alert templates.
-   Operational configuration without exposing secrets.

Admins should not be able to casually browse users' raw private
messages. Restrict access and log any exceptional support access.

### 5.10 Authentication and account settings

-   Registration and login.
-   Email verification.
-   Password reset.
-   Secure session management.
-   MFA where supported.
-   Profile and notification preferences.
-   Account deletion and data export where applicable.
-   Privacy notice and terms acceptance records.

------------------------------------------------------------------------

## 6. Recommended technology approach

Use a straightforward, widely supported stack. If the repository already
has a good stack, inspect it and explain before changing it.

### Suggested default stack

  -----------------------------------------------------------------------
  Layer                   Suggested technology    Reason
  ----------------------- ----------------------- -----------------------
  Frontend                React + JavaScript      Reusable UI and shared data contracts
                                                  safety

  Build tooling           Vite                    Simple local
                                                  development

  Styling                 CSS in App.css and       Lightweight, responsive
                          index.css                styling without a UI framework

  Backend                 Node.js + JavaScript    One primary language
                                                  across frontend/backend

  API                     REST with documented    Easy to test and
                          request/response        integrate
                          schemas                 

  Database                PostgreSQL              Reliable relational
                                                  storage

  Authentication          Managed auth provider   Avoid writing password
                          such as Supabase Auth,  handling from scratch
                          or another reputable    
                          provider                

  Database hosting        Managed                 Easier early operations
                          PostgreSQL/Supabase     

  Testing                 Vitest + React Testing  Layered automated
                          Library; API            testing
                          integration tests;      
                          Playwright for          
                          end-to-end UI           

  Source control          Git + GitHub            Versioning and
                                                  collaboration

  Deployment              Choose after MVP;       Avoid premature
                          document hosting,       infrastructure
                          secrets, migrations and complexity
                          rollback                
  -----------------------------------------------------------------------

Do not add Python or a separate microservice unless there is a concrete
need. Keep the first version as a modular monolith rather than splitting
it into microservices.

### Architecture direction

``` text
Browser
  |
  v
React + JavaScript UI
  |
  v
Backend REST API
  |
  +--> Authentication / Authorization
  |
  +--> Link Analysis Service
  |       +--> Threat Intelligence Provider Adapter
  |       +--> Safe URL Rules
  |
  +--> Message Analysis Service
  |       +--> Rule-Based Indicators
  |       +--> Optional AI Provider Adapter
  |
  +--> Scan History Service
  |
  +--> Notification Service (later)
  |
  v
PostgreSQL
```

External providers must be called from the backend, not directly from
browser code when credentials are involved.

------------------------------------------------------------------------

## 7. Core data model proposal

Design and document migrations before implementation. Avoid storing
unnecessary personal data.

Potential entities:

### User

-   `id`
-   `email`
-   `display_name`
-   `role`
-   `created_at`
-   `updated_at`
-   `status`

Authentication credentials should be managed by the authentication
provider, not stored as plain text or custom password fields.

### Scan

-   `id`
-   `user_id`
-   `scan_type` (`url`, `message`, `email`, `qr`)
-   `result_category`
-   `risk_level` (with documented meaning)
-   `created_at`
-   `provider_summary`
-   `redacted_subject` or safe summary only, if needed

Do not store raw submitted content by default.

### ScanFinding

-   `id`
-   `scan_id`
-   `finding_code`
-   `severity`
-   `explanation`
-   `source`
-   `created_at`

### Notification

-   `id`
-   `user_id`
-   `category`
-   `title`
-   `body`
-   `read_at`
-   `created_at`

### AuditLog

-   `id`
-   `actor_user_id`
-   `action`
-   `target_type`
-   `target_id`
-   `created_at`
-   `metadata` (redacted; no secrets)

Add appropriate foreign keys, indexes, access policies, and
retention/deletion behavior. Review whether row-level security is needed
for the chosen database/auth architecture.

------------------------------------------------------------------------

## 8. API design proposal

Use versioned endpoints and consistent response schemas. Exact paths may
be adjusted during architecture review.

  Method   Endpoint                      Purpose
  -------- ----------------------------- -----------------------------------------
  POST     `/api/v1/scans/url`           Analyze a URL
  POST     `/api/v1/scans/message`       Analyze a message
  POST     `/api/v1/scans/email`         Analyze email indicators
  POST     `/api/v1/scans/qr`            Decode and analyze QR destination
  GET      `/api/v1/scans`               List current user's scan history
  GET      `/api/v1/scans/:id`           Get a scan result owned by current user
  DELETE   `/api/v1/scans/:id`           Delete a scan record
  GET      `/api/v1/dashboard/summary`   Get dashboard counts
  GET      `/api/v1/notifications`       List notifications
  PATCH    `/api/v1/notifications/:id`   Mark notification read
  GET      `/api/v1/profile`             Get current user's profile
  PATCH    `/api/v1/profile`             Update allowed profile fields

All user-specific endpoints must enforce server-side authorization.
Never trust a user ID supplied by the browser as proof of ownership.

### Example scan response

``` json
{
  "scanId": "example-scan-id",
  "scanType": "url",
  "result": "suspicious",
  "riskLevel": "high",
  "summary": "Several suspicious indicators were found.",
  "findings": [
    {
      "code": "URL_SHORTENER",
      "severity": "medium",
      "explanation": "The URL uses a shortened link, which hides its final destination."
    }
  ],
  "limitations": [
    "No scanner can guarantee detection of every threat."
  ],
  "recommendedActions": [
    "Do not enter passwords or payment information.",
    "Verify the destination through the official organization."
  ],
  "checkedAt": "ISO-8601 timestamp"
}
```

Use schema validation on both request and response boundaries. Do not
return internal stack traces, provider secrets, or sensitive debug
information to clients.

------------------------------------------------------------------------

## 9. UI/UX requirements

### General design

-   Responsive desktop, tablet, and mobile layouts.
-   Friendly, clean, uncluttered interface.
-   Deep navy, blue, teal, white, and restrained warning colors.
-   Rounded cards with clear hierarchy and readable typography.
-   Accessible contrast, keyboard navigation, visible focus states, and
    labels.
-   Do not rely on color alone to communicate risk.
-   Include loading, empty, error, offline/provider-unavailable, and
    success states.
-   Use original icons/illustrations or assets with licenses that permit
    use.

### Main navigation

-   Dashboard
-   Link Check
-   Message Check
-   Email Check
-   QR Check
-   Scan History
-   Security Alerts
-   Safety Academy
-   Settings
-   Help & Support

Hide future-phase modules or label them "Coming soon"; do not present
non-functional controls as working features.

### Landing page sections

1.  Hero: "Make every click a safer one."
2.  Short explanation of NEXALUMI.
3.  Link and message checking entry points.
4.  How it works (three simple steps).
5.  Main features.
6.  Privacy-first explanation.
7.  Educational content preview.
8.  Clear call to action.
9.  Footer with privacy, terms, contact, and help links.

### Dashboard example content

Use sample/demo data only in the prototype: - "Welcome back" - "Your
recent safety activity" - "Links checked" - "Suspicious items" - "Recent
scans" - "Quick checks" - "Safety tip of the day"

Clearly label all sample results as demo data.

------------------------------------------------------------------------

## 10. Security, privacy, and abuse prevention requirements

Security is a core part of this product, not a later cosmetic task.

-   Enforce HTTPS in deployed environments.
-   Use secure, HTTP-only, SameSite cookies where cookie-based sessions
    are selected.
-   Apply authorization checks on every protected backend operation.
-   Apply rate limits to authentication and scanning endpoints.
-   Validate input size, type, and format.
-   Use parameterized database queries/ORM safely.
-   Protect against XSS, CSRF where relevant, injection, broken access
    control, and insecure direct object references.
-   Restrict CORS to approved origins.
-   Use security headers and a sensible Content Security Policy.
-   Keep dependencies updated and run vulnerability audits.
-   Redact secrets and personal data from logs.
-   Encrypt data in transit and use managed encryption at rest where
    available.
-   Define data retention, deletion, backup, and incident-response
    procedures.
-   Obtain consent and disclose third-party processing before sending
    user content to AI or threat-intelligence services.
-   Provide a privacy notice describing collected data, purpose,
    retention, sharing, and user rights.
-   Consider applicable Indian data-protection requirements and other
    laws in markets where the product operates; obtain qualified legal
    advice.
-   Do not claim regulatory compliance or certification without evidence
    and review.

### AI safety

-   Treat submitted messages and provider output as untrusted data.
-   Defend against prompt injection in user-submitted content.
-   Do not let analyzed text issue system instructions or trigger tools.
-   Do not send content to an AI provider unless the user has been
    informed and the feature is configured.
-   Make AI output explainable and clearly identify uncertainty.
-   Do not use AI output as the sole basis for account bans or serious
    adverse decisions.

------------------------------------------------------------------------

## 11. Testing strategy

The owner has QA automation experience and wants a testable product.

### Frontend tests

-   Render and interaction tests for forms and results.
-   Input validation and boundary cases.
-   Loading, empty, error, and retry states.
-   Accessibility checks for key flows.

### Backend/API tests

-   Valid and invalid request payloads.
-   Authentication and authorization.
-   User A cannot read or delete User B's scans.
-   Rate limiting.
-   Provider timeout, provider error, and unavailable credentials.
-   Data minimization and deletion.
-   Consistent API response schemas.

### Security-focused tests

-   Malformed URLs and unusual schemes.
-   Localhost/private-IP URL inputs are rejected or handled safely
    without fetching.
-   Redirect and DNS-rebinding defenses if any fetching is introduced.
-   Very large input and upload rejection.
-   Script/HTML payloads rendered as text, never executed.
-   Prompt-injection text does not change system behavior.
-   Secrets are not exposed in responses or logs.

### End-to-end user journeys

1.  Register/login.
2.  Open dashboard.
3.  Submit a sample URL.
4.  Review findings and recommended actions.
5.  Submit a sample scam message.
6.  Review explanation.
7.  View scan history.
8.  Delete a scan.
9.  Update notification/privacy settings.

Use safe, fictional fixtures. Never use live malicious URLs as routine
test inputs.

------------------------------------------------------------------------

## 12. Required repository documentation and deliverables

Create and maintain:

-   `README.md` --- overview and local setup.
-   `docs/PRODUCT_REQUIREMENTS.md` --- product requirements and scope.
-   `docs/ARCHITECTURE.md` --- architecture and component
    responsibilities.
-   `docs/DATA_MODEL.md` --- entities, relationships, retention.
-   `docs/API.md` --- endpoints and schemas.
-   `docs/SECURITY.md` --- threat model, security controls, known
    limitations.
-   `docs/PRIVACY.md` --- data collection and retention assumptions;
    mark legal review as required.
-   `docs/TEST_PLAN.md` --- test coverage and commands.
-   `docs/DEPLOYMENT.md` --- deployment, migrations, secrets, rollback.
-   `.env.example` --- placeholders only.
-   Database migrations and seed scripts with fictional demo data.
-   Automated tests and CI workflow where practical.

Do not create empty documents merely to claim completion. Fill them with
accurate project-specific information.

------------------------------------------------------------------------

## 13. Definition of done

A phase is complete only when:

-   The application starts using documented commands.
-   The implemented user flow works end to end.
-   No core button is decorative or misleading.
-   Input validation and errors are handled.
-   Tests for the phase pass.
-   Lint/type checks pass.
-   No secrets are committed.
-   Documentation is updated.
-   Demo behavior is clearly labelled.
-   Known limitations are disclosed.

Before production, obtain independent security and privacy review. A
successful local build is not proof that a cybersecurity product is safe
for public use.

------------------------------------------------------------------------

## 14. Copy-and-paste master instruction for Cursor / Claude

Use this instruction after placing this document in the repository as
`NEXALUMI_PRODUCT_BRIEF.md`:

> Read `NEXALUMI_PRODUCT_BRIEF.md` completely and treat it as the
> product requirements source of truth.
>
> I am a beginner developer with QA automation experience. Guide me in
> simple English. First inspect the repository and report the current
> stack, existing structure, and anything reusable. Do not change files
> yet.
>
> Next, create a phased implementation plan and propose the
> architecture, folder structure, database design, security approach,
> and test strategy. Identify decisions that require my approval.
>
> After I approve the plan, implement Phase 0 and Phase 1 only. Build a
> polished responsive frontend prototype with clearly labelled demo
> data. Do not pretend scans are real until real backend integrations
> are configured.
>
> Keep code simple, reusable, secure, and maintainable. Do not duplicate
> existing modules or introduce unnecessary dependencies. Do not expose
> secrets in frontend code. Do not automatically open submitted URLs.
> Keep raw message/email content out of persistent storage by default.
>
> After each phase, run the relevant tests and checks, explain the
> results, list every changed file, provide exact commands to run
> locally, document limitations, and wait for my approval before moving
> to the next phase.
>
> Never claim a feature, integration, security control, legal clearance,
> or test has been completed unless it has actually been implemented and
> verified.

------------------------------------------------------------------------

## 15. First task for the AI agent

The first task is **not** to build the complete security engine.

1.  Inspect the repository and available development environment.
2.  Confirm Node.js and package-manager versions.
3.  Propose the simplest suitable architecture.
4.  Create the project skeleton and documentation.
5.  Build the responsive NEXALUMI landing page and dashboard using demo
    data.
6.  Build the Link Check and Message Check screens as UI prototypes.
7.  Add basic component and interaction tests.
8.  Run the project and provide beginner-friendly setup instructions.

**Keep the first milestone small, working, and reviewable.**
