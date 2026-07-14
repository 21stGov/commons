# AI-native Commons

_Proposal status: design direction · Last updated: 2026-07-10_

## The recommendation

Commons should become easy to consume in three modes:

1. **Humans** can browse, compare, copy, install, and understand components.
2. **Humans working with AI** can give an agent a stable Commons context and get
   a reviewable installation or implementation plan.
3. **Agents** can discover, inspect, select, and validate Commons components
   through deterministic machine-readable interfaces.

The key architectural decision is that **AI is an interface to Commons, not a
dependency of Commons**. The canonical sources remain versioned tokens,
component source, schemas, tests, and accessibility contracts. The website,
registry, CLI, Markdown documentation, Agent Skill, and MCP server are generated
or resolved from those sources.

This avoids a common failure mode: a polished AI assistant that gives answers
which have drifted away from the code users actually install.

## What “native” should mean

Native AI support does **not** mean adding a chatbot to the documentation site or
requiring a model API key. It means the project is deliberately legible and
operable by software agents:

- canonical information has stable URLs and versioned schemas;
- every operation has a deterministic, non-interactive form;
- agents can preview changes before writing them;
- outputs are bounded, structured, and attributable to a package version;
- accessibility requirements are data, not prose hidden in a long page;
- human-readable and machine-readable views point to the same source; and
- autonomous writes are local, reviewable, and never the default for a public
  remote service.

## The layered model

```text
Canonical Commons source
tokens · components · examples · tests · accessibility contracts
                         │
                         ▼
Generated component manifest and registry schema
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    Human docs      CLI / JSON      Markdown corpus
          │              │              │
          └──────────────┼──────────────┘
                         ▼
              Agent Skill + MCP server
```

Each layer is useful independently. MCP is the richest discovery interface, but
an agent with only HTTP and a JSON parser should still be able to use Commons.

## Layer 1: make the existing artifacts excellent for machines

This is the highest-value work and should happen before building an MCP server.

### Extend each registry item

Every component manifest should include enough context to select and implement
the component safely:

```json
{
  "$schema": "https://commonsui.com/schema/registry-item.v1.json",
  "schemaVersion": "1",
  "name": "button",
  "title": "Button",
  "version": "0.1.0",
  "status": "experimental",
  "description": "Initiates an immediate action.",
  "useWhen": ["Submitting a form", "Confirming an explicit action"],
  "avoidWhen": ["Navigating to another page"],
  "files": [],
  "dependencies": [],
  "registryDependencies": [],
  "compatibility": {
    "react": ">=19",
    "rtl": true,
    "forcedColors": true
  },
  "accessibility": {
    "standard": "WCAG 2.2 AA",
    "keyboard": ["Tab moves focus to the button", "Enter or Space activates"],
    "nameRequired": true,
    "targetSize": "44px project default",
    "highContrastTested": true,
    "screenReadersTested": []
  },
  "examples": [],
  "docs": "https://commonsui.com/components/button",
  "license": "MIT",
  "integrity": "sha256-…"
}
```

The exact fields can evolve, but several rules should not:

- publish a JSON Schema for every public manifest;
- distinguish normative requirements from helpful guidance;
- identify experimental, stable, deprecated, and removed components;
- include package and schema versions in every response;
- include content hashes for files copied by the CLI;
- use enums and structured arrays instead of prose when the values are
  programmatically meaningful; and
- compile and test every published example.

### Publish a catalog

Add a small, cacheable index such as `/r/index.json` containing component names,
summaries, categories, status, framework availability, and registry item URLs.
Agents should not need to download every component to answer “what date inputs
exist?”

### Offer clean Markdown

Every documentation page should have a stable Markdown representation. At
minimum, publish:

- `/llms.txt` as a concise map of the project and its most useful documentation;
- `/llms-full.txt` as an optional generated corpus for tools that want a larger
  context bundle;
- a Markdown URL for each component, pattern, token, accessibility contract,
  migration guide, and release note; and
- canonical links between the HTML, Markdown, and registry representations.

`llms.txt` is a community proposal rather than a guarantee that every model or
agent will consume it automatically. It is still inexpensive and useful as a
curated discovery document, but it should complement—not replace—semantic HTML,
a sitemap, schemas, and the registry.

### Make the CLI automation-grade

The current CLI is already moving in the right direction with a dry-run plan.
Add a stable machine interface before agents begin depending on its prose:

```sh
npx @21stgov/commons search date --json
npx @21stgov/commons inspect button --json
npx @21stgov/commons add button --dry-run --json
npx @21stgov/commons add button --yes
npx @21stgov/commons check --json
```

CLI requirements:

- `--json` emits versioned JSON to stdout and sends diagnostics to stderr;
- `--yes` is the explicit non-interactive mode;
- `--dry-run` returns the exact files, dependencies, and token changes;
- stable exit codes distinguish invalid input, network failure, conflicts,
  validation failure, and partial completion;
- writes are idempotent where possible and never overwrite changed local files
  silently;
- the result includes checksums and the Commons version used; and
- every write mode can produce a patch or diff for human review.

This interface benefits shell scripts and CI just as much as AI agents.

## Layer 2: repository guidance and a portable Agent Skill

These solve two different problems and should not be conflated.

### `AGENTS.md` for contributors to Commons

Add a concise root `AGENTS.md` containing the durable rules an agent needs while
working _on this repository_: architecture boundaries, package ownership,
commands, accessibility definition of done, generated-file rules, license
headers, and required verification. Add nested guidance only when a package
genuinely has different rules.

Codex discovers repository-level `AGENTS.md` files from the project root toward
the current working directory, allowing closer guidance to override broader
guidance. That makes it a good home for durable contribution rules, not product
documentation.

Avoid maintaining a separate, contradictory instruction corpus for each agent.
Where another tool requires a vendor-specific entry file, keep it very small and
point it to the canonical repository guidance.

### A `commons-ui` Agent Skill for users of Commons

Publish a portable Agent Skill that teaches supported agents _how to use
Commons in another project_. It should cover:

- choosing a component or government pattern;
- inspecting before installing;
- initializing Commons safely;
- applying agency tokens without weakening contrast guarantees;
- preserving keyboard and screen-reader behavior during customization;
- testing forced colors, RTL, reflow, and text enlargement;
- upgrading copied components; and
- recognizing when no Commons component is appropriate.

Suggested layout:

```text
skills/commons-ui/
├── SKILL.md
├── references/
│   ├── accessibility-contract.md
│   ├── component-selection.md
│   └── theming.md
└── scripts/
    └── verify-commons-project.mjs
```

The open Agent Skills specification uses a required `SKILL.md` plus optional
`scripts`, `references`, and `assets`, and recommends progressive disclosure.
That fits Commons well: keep selection and safety rules in the main skill, then
load detailed component or theming references only when needed.

The skill must never embed a stale copy of the catalog. It should query the CLI,
registry, or MCP server for versioned component facts.

## Layer 3: a public, read-only Commons MCP server

MCP is worthwhile once the underlying schemas and JSON CLI output are stable.
It gives supported clients a discoverable interface instead of requiring users
to paste documentation into every conversation.

### Deployment shape

Start with a stateless Streamable HTTP server at a URL such as:

```text
https://mcp.commonsui.com/mcp
```

Deploy it as a small Cloudflare Worker that reads the same generated registry
artifacts served by the documentation site. Public read operations should not
require authentication. Put cacheable catalog data at the edge and enforce
strict request-size, response-size, timeout, and rate limits.

Do not begin with a remote tool that edits repositories. A remote public server
cannot safely or portably see a user’s local working tree. Installation remains
the job of the local CLI; MCP can return the exact command and a structured
installation plan.

### Resources

MCP distinguishes application-provided **resources**, model-invoked **tools**,
and user-selected **prompts**. Use each for its intended role.

Proposed resources:

| URI                              | Contents                                             |
| -------------------------------- | ---------------------------------------------------- |
| `commons://catalog`              | Compact component and pattern catalog                |
| `commons://component/{name}`     | Versioned registry item and documentation links      |
| `commons://accessibility/{name}` | Normative accessibility contract and test status     |
| `commons://tokens/{theme}`       | Token metadata for light, dark, or high contrast     |
| `commons://guides/{slug}`        | Installation, theming, migration, and testing guides |
| `commons://releases/latest`      | Current stable versions and migration notices        |

### Tools

The first tool set should be small, bounded, and read-only:

| Tool                  | Purpose                                                           |
| --------------------- | ----------------------------------------------------------------- |
| `search_components`   | Find components and patterns by task, audience, or capability     |
| `get_component`       | Return one component’s structured contract and relevant resources |
| `plan_install`        | Resolve dependencies and return the exact dry-run CLI plan        |
| `explain_tokens`      | Resolve semantic tokens and contrast relationships for a theme    |
| `check_composition`   | Check a supplied component plan against known Commons usage rules |
| `get_migration_guide` | Return version-specific migration steps and deprecations          |

Every tool should have:

- narrow JSON Schema inputs with bounded string and array sizes;
- an output schema and structured result;
- explicit package, schema, and data versions;
- a read-only annotation where supported;
- links to the canonical source resources;
- useful errors with recovery guidance; and
- no model call inside the tool implementation.

The MCP specification supports structured tool output and output schemas. Use
both. The server should perform deterministic lookup and validation; the user’s
chosen model can do the explanation and composition.

### Prompts

Prompts are optional convenience workflows, not a substitute for tools:

- `choose-a-public-service-pattern`
- `plan-an-accessible-form`
- `audit-commons-usage`
- `migrate-a-commons-component`

Each prompt should gather missing context and then use Commons resources and
read-only tools. Do not make claims that a generated interface is accessible
merely because it used Commons components.

### Client setup

The docs site should generate current setup snippets for supported clients. For
example, Codex supports project-scoped MCP configuration and Streamable HTTP
servers; its configuration can point to the public URL. Claude Code also
supports project-scoped MCP configuration. Keep each adapter in a small
generated page while treating the MCP endpoint and schemas as canonical.

Never put secrets in a checked-in client configuration. The public read-only
server should not need any.

## Layer 4: local validation and carefully scoped writes

Later, Commons can add a local MCP mode backed by the CLI. Because it runs in the
consumer’s repository, it can offer operations such as:

- inspect installed Commons components;
- compare local files with the registry version;
- produce an upgrade patch;
- validate token overrides and contrast contracts;
- identify missing component tests; and
- run the project’s configured accessibility checks.

Write-capable tools should remain opt-in and should:

1. return a plan before applying it;
2. require client/user approval;
3. restrict writes to the declared project root;
4. preserve uncommitted work and refuse ambiguous overwrites;
5. return a diff and verification results; and
6. never commit, push, publish, or deploy unless the user separately requests it.

MCP’s own tool guidance recommends keeping a human able to deny tool
invocations. Commons should exceed that baseline because it serves public
institutions and may eventually operate in sensitive codebases.

## Human experience on the documentation site

Agent support should make the human interface better, not clutter it. Each
component page can offer:

- **Install** — the normal CLI command;
- **Inspect JSON** — the registry contract;
- **Copy Markdown** — concise component guidance;
- **Use with AI** — a short, provider-neutral prompt that references the exact
  component and version;
- **Open in MCP** — setup help, not an automatic permission grant;
- **Accessibility contract** — normative behavior, test matrix, and known
  limitations; and
- **Source and history** — repository link, release, license, and provenance.

“Copy prompt” text should be generated from component metadata and remain short.
It should ask the agent to inspect the installed project and return a plan before
changing code.

## Security, privacy, and public-sector trust

The AI-facing surface creates a supply-chain boundary. Treat it accordingly.

### Required safeguards

- Sign or hash registry assets and publish provenance with releases.
- Generate MCP results from versioned artifacts; never scrape the rendered docs
  at request time.
- Treat documentation and component descriptions as untrusted data, not hidden
  instructions to the model.
- Keep the public MCP server read-only and stateless initially.
- Do not accept source repositories, resident data, form submissions, secrets,
  or private agency configuration at the public endpoint.
- Do not log full prompts or supplied code. Collect only aggregate operational
  metrics needed to keep the service reliable.
- Apply Cloudflare rate limiting, request limits, timeouts, abuse controls, and
  safe caching.
- Return exact source/version attribution so users can reproduce every answer
  without AI.
- Threat-model prompt injection, malicious registry content, dependency
  confusion, path traversal, oversized output, SSRF, and stale-cache behavior.
- Include the MCP server, skill, schemas, and generated Markdown in release and
  security review.

### Accessibility safeguards

AI-generated code is not automatically accessible. Commons should never label
an output “compliant.” Instead it can report:

- which Commons contracts apply;
- which automated checks passed;
- which checks failed or could not run;
- which manual keyboard and assistive-technology checks remain; and
- whether the consumer changed source in a way that invalidates the component’s
  tested baseline.

All AI setup and output views on the docs site must meet the same accessibility
bar as every other Commons interface. JSON and code examples need accessible
names, clear copy feedback, wrapping/scroll behavior that survives zoom and text
enlargement, and no color-only status communication.

## Evaluation

Agent support needs repeatable evaluation just like a component library.

Create a small, provider-neutral task suite:

1. Find the correct component for a destructive form action.
2. Explain why a link is not a button.
3. Plan installation without modifying a repository.
4. Apply an agency color while preserving the contrast contract.
5. Build a translated, RTL address form without hard-coded direction.
6. Identify an inaccessible customization to a Commons component.
7. Upgrade a locally modified component without destroying the modification.
8. Decline to claim WCAG conformance when manual testing is missing.

Measure selection accuracy, schema validity, task completion, unnecessary tool
calls, unsafe writes, accessibility regressions, token usage, latency, and the
percentage of answers with reproducible version/source attribution. Run the
suite across multiple MCP clients and model providers; Commons should not be
designed around one model’s quirks.

## Proposed roadmap

### Phase A — machine-readable foundation

- Define `registry-item.v1` and catalog schemas.
- Add accessibility, compatibility, status, example, provenance, and integrity
  metadata.
- Add `inspect`, `search`, `check`, and versioned `--json` CLI output.
- Generate Markdown component pages, `/llms.txt`, and `/llms-full.txt`.
- Add schema and link validation to CI.

**Exit criterion:** a script with no AI can discover a component, inspect its
contract, produce an install plan, and verify the response against a schema.

### Phase B — agent guidance

- Add the repository’s root `AGENTS.md`.
- Publish the `commons-ui` Agent Skill and validation script.
- Add provider-neutral “Use with AI” documentation and tested example prompts.
- Add the agent task evaluation suite.

**Exit criterion:** supported agents can follow Commons’ contribution and
consumer workflows without a pasted mega-prompt or vendor-specific copy of the
catalog.

### Phase C — public MCP preview

- Build the stateless, read-only Streamable HTTP server.
- Expose catalog, component, accessibility, token, and release resources.
- Ship the six bounded read-only tools.
- Add Cloudflare caching, rate limits, observability, and security tests.
- Test setup with Codex, Claude Code, and at least one additional MCP client.

**Exit criterion:** an agent can select and plan a Commons installation through
MCP, and every result identifies the exact canonical artifact and version.

### Phase D — local validation

- Add a local MCP mode backed by the CLI.
- Inspect installed source and emit upgrade diffs.
- Validate theme and component contracts locally.
- Keep writes preview-first and explicitly approved.

**Exit criterion:** local tools preserve unrelated changes, produce a reviewable
diff, and never make an unapproved external change.

## What not to build yet

- A documentation chatbot that is not grounded in versioned Commons artifacts.
- A model proxy or hosted code generator.
- A remote MCP tool with repository write access.
- Separate “Codex docs,” “Claude docs,” and “human docs” that drift apart.
- Autonomous accessibility certification.
- A vector database before catalog search proves it is necessary.
- Authentication, user accounts, or a database for public read-only data.
- Analytics that captures prompts, government source code, or resident data.

## Immediate next decisions

1. Approve the principle that MCP is a generated read-only view over the
   registry, not a new source of truth.
2. Lock the first machine-readable component and accessibility schema.
3. Reserve the endpoint (`mcp.commonsui.com/mcp` is the clearest option).
4. Decide whether the portable skill lives in this repository under `skills/`
   or in a separately installable 21st Gov skills repository.
5. Add the CLI’s versioned `--json` contract before Phase 1 write mode ships.

## Primary references

- [Model Context Protocol server primitives](https://modelcontextprotocol.io/specification/2025-11-25/server)
- [Model Context Protocol tools and structured output](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
- [Codex project guidance with `AGENTS.md`](https://developers.openai.com/codex/guides/agents-md)
- [Codex MCP configuration](https://developers.openai.com/codex/mcp)
- [Agent Skills specification](https://agentskills.io/specification)
- [`llms.txt` proposal](https://llmstxt.org/)

These references establish the current interoperability surface. Commons should
version its own contracts and avoid depending on undocumented client behavior.
