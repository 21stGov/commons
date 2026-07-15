# Government adoption documentation

_Status: documentation plan · Audience: 21st Gov, Commons maintainers, public
technology leaders, procurement, counsel, security, accessibility, and delivery
teams · Last reviewed: 2026-07-15_

## Purpose

Cities and government agencies need more than component examples before they
can adopt a design system. Different reviewers need evidence that Commons is
usable, supportable, accessible, secure, legally understandable, and compatible
with the agency’s operating environment.

This document defines the adoption packet Commons should publish. It separates:

1. **adoption documentation** that helps a team implement Commons;
2. **assurance documentation** that helps accessibility, security, privacy, and
   architecture reviewers evaluate it;
3. **project policies** that explain how the open-source project is governed and
   maintained; and
4. **commercial or hosted terms** that are only necessary when 21st Gov sells a
   service, provides contractual support, or processes government data.

This is a product-documentation plan, not legal advice. Contracts, privacy
notices, accessibility representations, trademark terms, and jurisdiction-
specific clauses should be reviewed by qualified counsel before publication or
use in a procurement.

## The two adoption tracks

The documentation should always say which track it covers.

### Open-source / self-operated Commons

An agency uses the MIT-licensed tokens, CSS, React package, CLI, or copied
component source in its own repository and environment. 21st Gov does not
operate the agency application or receive resident data.

This track primarily needs excellent technical documentation, open-source
policies, release evidence, an accessibility baseline, and clear disclaimers.
It does **not** need a SaaS master agreement, uptime SLA, DPA, subprocessor list,
or GovRAMP authorization merely because an agency downloads open-source code.

### 21st Gov-hosted or supported service

21st Gov operates infrastructure, provides a managed registry, contracts for
support, or processes agency information. This track needs the open-source
packet plus service-specific contracts, data terms, security controls,
operations evidence, and commitments.

Avoid writing one ambiguous document that makes hosted-service promises about
the open-source project or treats self-hosted code as if 21st Gov controls its
availability.

## What an agency needs to move quickly

An evaluator should be able to answer these questions without scheduling a
sales call:

- What is Commons, what is stable, and what is still experimental?
- Which adoption model fits our stack and staffing?
- What runs in our environment, and what communicates with 21st Gov?
- Does Commons collect, transmit, or retain any data?
- How is it built, tested, released, updated, and supported?
- What accessibility evidence exists for this exact version?
- What security evidence and dependency information can we review?
- What will our team still be responsible for?
- How do we pilot, accept, deploy, roll back, and maintain it?
- What license, terms, trademarks, and contribution rules apply?
- If we buy hosting or support, what contract and service commitments apply?

## Tier 1: public project and legal documents

These should exist before a broad public release.

| Document                         | Why agencies need it                                                                               | Current state                                     | Canonical location                                              |
| -------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------- |
| MIT `LICENSE`                    | Establishes rights to use, copy, modify, and redistribute                                          | Exists                                            | Repository root; linked from website                            |
| Third-party notices              | Identifies obligations for copied or bundled upstream code                                         | Exists; maintain continuously                     | Repository root and release artifacts                           |
| Terms of website use             | Covers the docs site, downloads, public registry, and site conduct                                 | Published — draft, review needed         | [commonsui.com/terms](https://commonsui.com/terms)                         |
| Privacy notice                   | States exactly what the website and hosted endpoints collect, why, retention, sharing, and choices | Published — draft, review needed         | [commonsui.com/privacy](https://commonsui.com/privacy)                     |
| Accessibility statement          | States the site’s commitment, known limitations, feedback channel, and response process            | Published — draft                                 | [commonsui.com/accessibility-statement](https://commonsui.com/accessibility-statement) |
| Trademark and brand policy       | Explains permitted use of “Commons,” logos, forks, and compatibility claims                        | Draft needed before ecosystem growth              | Repository and website                                          |
| Disclaimer / scope statement     | Prevents “uses Commons” from being represented as automatic legal or WCAG compliance               | Published — draft                                 | [commonsui.com/disclaimer](https://commonsui.com/disclaimer)               |
| Acceptable use policy            | Defines misuse of public registry, MCP, or other hosted services                                   | Published — draft                                 | [commonsui.com/acceptable-use](https://commonsui.com/acceptable-use)       |
| Copyright and attribution policy | Explains headers, notices, copied-source obligations, and downstream attribution                   | Partial in game plan                              | Repository docs                                                 |

### Terms that should be reviewed by counsel

For the open-source and documentation surface:

- website terms of use;
- privacy notice and analytics disclosure;
- accessibility statement wording and feedback commitments;
- trademark/brand-use policy;
- acceptable use for the registry, MCP, or APIs;
- warranty and compliance disclaimers consistent with the MIT license;
- contribution terms, including the choice of Developer Certificate of Origin
  (DCO) or Contributor License Agreement (CLA); and
- a policy for government-contributed code and contributor authority.

Do not publish empty legal placeholders that look authoritative. Until reviewed,
label drafts clearly and keep the website’s actual data practices narrower than
the unfinished policy.

## Tier 2: open-source governance and lifecycle

| Document               | Minimum contents                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `GOVERNANCE.md`        | 21st Gov stewardship, decision rights, maintainer roles, escalation, conflict handling                                     |
| `CODE_OF_CONDUCT.md`   | Community behavior, reporting channel, enforcement process                                                                 |
| `SECURITY.md`          | Supported versions, private reporting, response targets, disclosure coordination, safe-harbor position reviewed by counsel |
| `SUPPORT.md`           | Community vs paid support, channels, response expectations, out-of-scope requests                                          |
| Release policy         | SemVer/Changesets rules, channels, artifacts, release evidence, emergency releases                                         |
| Version support policy | Supported versions, maintenance windows, LTS decision, end-of-support notice                                               |
| Deprecation policy     | Notice periods, replacement guidance, removal rules, accessibility/security exceptions                                     |
| Contribution guide     | Setup, tests, review, accessibility definition of done, DCO/CLA, licensing                                                 |
| Maintainer guide       | Triage, release, security embargo, access control, offboarding                                                             |
| Public roadmap         | Delivered, committed, exploratory, and explicitly out-of-scope work                                                        |

Commons publishes
[`/.well-known/security.txt`](https://commonsui.com/.well-known/security.txt)
(RFC 9116), pointing to the vulnerability disclosure policy in `SECURITY.md`. A
security policy and `security.txt` complement one another; neither replaces an
actual response process.

## Tier 3: implementation documentation

These documents shorten the path from approval to a successful pilot.

### Start and decide

1. **Five-minute orientation** — what Commons is, who it is for, maturity, and
   one working example.
2. **Adoption decision guide** — copied source vs React package vs CSS/token
   core vs self-hosted registry.
3. **Prerequisites and compatibility matrix** — Node, package manager,
   frameworks, browser support, assistive technologies, CSP, SSR, RTL, and
   forced-colors support, plus Windows, Linux, and macOS development and
   Cloudflare, Azure, GCP, AWS, VPS, and on-premises deployment status. Use the
   living [platform-support research](platform-support.md) as the
   evidence source.
4. **Thirty-minute quickstart** — initialize, install one component, render it,
   run tests, and remove or roll back the change.
5. **Reference application** — a small, deployable local-government service that
   demonstrates forms, validation, language, errors, and accessibility tests.

### Design and integrate

6. **Architecture overview** — system context, package boundaries, data flows,
   trust boundaries, deployment modes, and shared responsibility. The first
   version is in [architecture.md](architecture.md).
7. **Reference architectures** — diagrams for React source-owned, package-based,
   legacy CSS, internal registry, and restricted-network deployments.
8. **Registry and CLI specification** — schemas, configuration, network calls,
   authentication, exit codes, dry-run behavior, overwrite rules, and mirrors.
9. **Token and theming guide** — agency brand mapping, contrast guarantees,
   high-contrast behavior, dark mode, typography, and prohibited overrides.
10. **Content and plain-language guide** — labels, errors, instructions, help,
    reading level, and content patterns for public services.
11. **Internationalization and RTL guide** — translation keys, text expansion,
    locale formatting, language switching, and bidirectional testing.
12. **Integration guides** — Next.js/React, server-rendered or legacy sites,
    forms, routing, analytics, authentication, and common agency platforms as
    demand becomes known.

### Prove and launch

13. **Accessibility test guide** — keyboard, screen reader, zoom/reflow, text
    spacing, forced colors, reduced motion, touch, mobile, and document testing.
14. **Security integration guide** — CSP, dependency scanning, secrets,
    untrusted content, file uploads, third-party scripts, and secure defaults.
15. **Privacy integration guide** — data minimization, notices, form fields,
    analytics, logs, retention, and avoiding resident data in support requests.
16. **Pilot playbook** — scope, stakeholders, risk tier, success measures,
    training, feedback, go/no-go review, and exit plan.
17. **Acceptance checklist** — objective evidence for functionality,
    accessibility, security, performance, privacy, operations, and support.
18. **Migration guide** — inventory, component mapping, incremental rollout,
    coexistence, content changes, visual regression, and rollback.

### Operate and improve

19. **Upgrade guide** — version selection, local modifications, diff review,
    codemods, retesting, and rollback.
20. **Operations runbook** — build, release, registry mirroring, cache behavior,
    backup, restore, monitoring, alerting, and incident escalation.
21. **Troubleshooting guide** — common install, build, style, hydration,
    keyboard, screen-reader, and high-contrast failures.
22. **Training curriculum** — separate tracks for developers, designers,
    content authors, accessibility testers, procurement, and service owners.
23. **Adoption metrics guide** — measures that improve services without tracking
    residents or treating accessibility as a vanity score.

## The component documentation contract

Every stable component should use the same documentation shape:

1. Summary and status
2. When to use
3. When not to use
4. Anatomy and variants
5. Content guidance
6. Interaction and keyboard behavior
7. Accessible name, role, state, and focus behavior
8. Touch, zoom, reflow, forced-colors, and reduced-motion behavior
9. Internationalization, text expansion, and RTL behavior
10. React API and CSS/token API
11. Dependencies and installation files
12. Tested examples and anti-patterns
13. Security and privacy considerations
14. Browser and assistive-technology test matrix
15. Known limitations
16. ACR/VPAT mapping where applicable
17. Version, last reviewed date, source, and changelog

Examples must be runnable and tested. Accessibility notes must identify both the
behavior Commons provides and the work the adopter must still do.

## Tier 4: assurance and procurement packet

Agencies routinely send overlapping questionnaires. Publishing a reusable,
versioned packet reduces repeated work and makes claims consistent.

### Product and architecture

- one-page product overview and maturity statement;
- architecture overview and reference architectures;
- deployment models and supported environments;
- system inventory and external dependencies;
- data-flow and trust-boundary diagrams;
- shared-responsibility matrix;
- current roadmap and known limitations; and
- implementation, migration, and exit strategy.

### Accessibility

- product accessibility statement;
- Accessibility Conformance Report (ACR), commonly prepared with the latest
  appropriate VPAT template;
- WCAG 2.2 AA component test results, while clearly mapping the U.S. state and
  local government legal baseline of WCAG 2.1 AA;
- component and release scope covered by each report;
- browser, OS, keyboard, zoom, forced-colors, and assistive-technology matrix;
- known defects, workarounds, remediation owners, and target versions;
- accessibility support and issue-escalation process; and
- instructions for agencies to test their complete implementation.

The Department of Justice’s Title II rule applies to web content and mobile apps
provided directly or through contractual, licensing, or other arrangements.
That makes vendor evidence relevant, but the agency still must evaluate the
complete service. Section508.gov procurement guidance shows why agencies often
request an ACR/VPAT even when their exact legal framework differs.

### Security and software supply chain

- security whitepaper and threat model;
- secure development lifecycle mapped to the current final NIST SSDF, with
  draft revisions tracked but not represented as final requirements;
- release signing and provenance process;
- machine-readable SBOM for each release, aligned with current CISA minimum
  elements;
- dependency, vulnerability, patch, and coordinated disclosure policy;
- supported-version and security-update commitments;
- CI/CD, maintainer access, secrets, branch protection, and release controls;
- independent assessment or penetration-test summary when one exists;
- incident-response process and agency notification commitments for hosted
  services; and
- completed CISA Software Acquisition Guide response or a reusable crosswalk.

### Privacy and data governance

- product data sheet listing every collected, generated, transmitted, stored,
  logged, and disclosed data category;
- purpose, legal-role assumptions, retention, deletion, export, and backup
  behavior;
- subprocessors and processing locations for hosted services;
- encryption, access control, tenancy, and administrative access;
- analytics and telemetry behavior, including how to disable it;
- public-records, legal hold, audit export, and records-retention capabilities;
- data ownership and return/deletion at termination; and
- a NIST Privacy Framework crosswalk when useful to an agency review.

For the open-source packages, the ideal answer is short: no account, no
telemetry, no Commons runtime call, and no data sent to 21st Gov. Keep that claim
true rather than solving a documentation problem created by unnecessary data
collection.

### Operations and resilience

- support model and escalation path;
- service-level objectives and SLA for paid hosted services;
- status page and maintenance policy;
- business continuity and disaster recovery plan;
- documented RTO and RPO for each hosted service tier;
- backup, restoration, rollback, and data-export testing;
- capacity, rate-limit, and denial-of-service behavior; and
- service termination and transition assistance.

## Documents only needed for hosted or paid offerings

Do not delay the open-source project to draft every possible commercial form.
Prepare these when the corresponding offering is real:

| Document                           | Trigger                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| Master Services Agreement          | 21st Gov sells hosted service or contractual support                                  |
| Order form / Statement of Work     | An agency buys a defined scope, implementation, or support package                    |
| Service Level Agreement            | 21st Gov makes availability or response-time commitments                              |
| Data Processing Addendum           | 21st Gov processes personal or agency data for the customer                           |
| Security addendum                  | Contract includes customer-specific security controls, audits, or notifications       |
| Records-management addendum        | Hosted service creates or holds records subject to agency schedules or disclosure law |
| Accessibility rider                | Contract defines testing, reporting, remediation, and acceptance duties               |
| Subprocessor schedule              | Third parties process customer data or operate material hosted functions              |
| Business associate agreement       | The offering handles PHI in a role requiring HIPAA terms                              |
| CJIS addendum / security agreement | The offering is approved to handle criminal justice information                       |
| PCI responsibility matrix          | The offering stores, processes, or transmits payment-card data                        |
| GovRAMP package                    | A hosted cloud service handling government data targets agencies that require GovRAMP |
| Insurance and vendor forms         | A procurement requires certificates, W-9, registration, or representations            |

Never claim FedRAMP, GovRAMP, CJIS, HIPAA, PCI, SOC 2, or another authorization
because the underlying Cloudflare service has a certification. The boundary,
configuration, operating controls, contract, and 21st Gov service itself must be
evaluated for the claim being made.

## Publication model

### Repository as canonical source

Keep technical and project-policy source in versioned Markdown near the code.
Reviews can then update a component and its evidence together. Release tags
preserve the documentation that applied to an older version.

### Commons documentation site

Render the repository sources into accessible web pages at commonsui.com. Add:

- visible status, owner, product version, last-reviewed date, and canonical URL;
- print-friendly and clean Markdown views;
- stable anchors and change history;
- downloadable procurement packet by product version;
- accessible diagrams with equivalent text or tables; and
- an obvious way to report accessibility, security, and documentation issues.

### 21st Gov legal site

Corporate legal terms that apply across projects can live under 21stgov.com,
while Commons-specific schedules and product facts remain in the Commons repo.
Each rendered Commons page should link to the exact governing version instead of
copying text that can drift.

## Required document metadata

Every assurance or policy document should identify:

```yaml
title: Security policy
status: approved
owner: Security lead
applies_to: Commons 1.x public packages and registry
version: 1.0
effective_date: 2027-01-15
last_reviewed: 2027-01-15
next_review: 2028-01-15
canonical_url: https://commonsui.com/security
contact: security@21stgov.com
```

Use `draft`, `approved`, `deprecated`, or `superseded` consistently. A draft
must never look like a current contractual commitment.

## Suggested repository structure

```text
docs/
├── adoption/
│   ├── decision-guide.md
│   ├── quickstart.md
│   ├── pilot-playbook.md
│   ├── acceptance-checklist.md
│   └── migration.md
├── architecture/
│   ├── system-context.md
│   ├── deployment-models.md
│   ├── data-flows.md
│   ├── threat-model.md
│   ├── shared-responsibility.md
│   └── decisions/
├── assurance/
│   ├── accessibility/
│   ├── security/
│   ├── privacy/
│   ├── sbom/
│   └── procurement/
├── operations/
│   ├── support.md
│   ├── releases.md
│   ├── upgrades.md
│   └── incident-response.md
└── policies/
    ├── governance.md
    ├── trademark.md
    └── attribution.md
```

Root-level community files such as `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`,
`SUPPORT.md`, `GOVERNANCE.md`, and `CODE_OF_CONDUCT.md` should remain easy to
find at the repository root even when detailed supporting material lives under
`docs/`.

## Architecture decision records

Use short Architecture Decision Records (ADRs) for choices an agency may need to
understand or challenge. Start with:

1. Base UI as the React primitive layer
2. React plus framework-agnostic CSS for v1
3. Own-your-code CLI and registry distribution
4. DTCG tokens and Style Dictionary
5. WCAG 2.2 AA as the product baseline
6. Code-first design source
7. Cloudflare static-first documentation and registry
8. No telemetry in runtime packages
9. Community stewardship under the 21st Gov name
10. Read-only MCP as a generated registry view

Each ADR should include context, decision, alternatives, accessibility impact,
security/privacy impact, operational consequences, reversibility, owner, and
status. ADRs explain why the system looks this way; they do not replace current
operating documentation.

## Reusable agency intake

Publish a short intake worksheet so Commons can tailor an adoption plan without
starting from scratch:

- entity type, population served, and service criticality;
- current frameworks, hosting, identity, forms, CMS, and browser requirements;
- languages, RTL needs, assistive-technology support, and accessibility process;
- data classifications and integrations;
- network, cloud, and self-hosting restrictions;
- security frameworks and procurement questionnaires;
- records, retention, disclosure, and audit requirements;
- support, training, rollout, and deadline needs; and
- whether the agency wants open-source self-operation, paid support, or hosting.

Do not collect resident data, credentials, confidential architecture, or other
sensitive material through a generic public intake form.

## Priority order

### Now: before Phase 1 public components

1. Keep the architecture overview current.
2. Add `SECURITY.md`, vulnerability reporting, and `security.txt` planning.
3. Decide DCO vs CLA and publish governance and conduct policies.
4. Define the component documentation contract and status vocabulary.
5. Write the adoption decision guide, compatibility matrix, and quickstart.
6. Create ADRs for the locked architectural decisions.
7. Add Windows, Linux, and macOS CI plus cross-platform CLI fixtures.
8. Draft the trademark and attribution policies.

### Before a public 1.0

1. Publish the support, release, version, and deprecation policies.
2. Publish the accessibility statement, component evidence, and scoped ACR.
3. Generate SBOMs and provenance for releases.
4. Publish the security whitepaper, threat model, and SSDF/CISA acquisition
   response.
5. Ship the pilot playbook, acceptance checklist, migration, upgrade, and
   troubleshooting guides.
6. Obtain counsel review of public legal and contribution terms.

### Before hosted service or paid operational commitments

1. Freeze and document the service boundary and data flows.
2. Complete the hosted security, privacy, subprocessor, records, and resilience
   packet.
3. Draft and review the MSA, order/SOW, SLA, DPA, security, accessibility, and
   records schedules appropriate to the service.
4. Decide which assessments or authorizations the target agencies actually
   require before pursuing costly certifications.
5. Test incident notification, export, deletion, backup, restore, and exit.

## Primary references

- [DOJ Title II web and mobile accessibility rule fact sheet](https://www.ada.gov/resources/2024-03-08-web-rule/)
- [DOJ small-entity compliance guide](https://www.ada.gov/resources/small-entity-compliance-guide/)
- [Section508.gov guidance on vendor accessibility information](https://www.section508.gov/buy/request-accessibility-information/)
- [Section508.gov ACR/VPAT FAQ](https://www.section508.gov/sell/acr-vpat-faq/)
- [NIST Secure Software Development Framework](https://csrc.nist.gov/Projects/ssdf/publications)
- [CISA 2025 SBOM minimum elements](https://www.cisa.gov/sites/default/files/2025-08/2025_CISA_SBOM_Minimum_Elements.pdf)
- [CISA Software Acquisition Guide for Government Enterprise Consumers](https://www.cisa.gov/sites/default/files/2024-07/PDM24050%20Software%20Acquisition%20Guide%20for%20Government%20Enterprise%20ConsumersV2_508c.pdf)
- [RFC 9116 `security.txt`](https://www.rfc-editor.org/rfc/rfc9116.html)
- [NIST Privacy Framework](https://www.nist.gov/privacy-framework)
- [NARA records-management language for contracts](https://www.archives.gov/records-mgmt/policy/records-mgmt-language)
- [GovRAMP government cloud security overview](https://govramp.org/government-cloud-security)

Requirements vary by jurisdiction, data type, service, and procurement. Use
these sources as a baseline for transparent product documentation, then let each
agency identify its controlling laws, policies, contract clauses, and approval
process.
