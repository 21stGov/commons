# Platform support and infrastructure portability

_Status: living research and engineering policy · Audience: Commons maintainers,
agency architects, infrastructure teams, and contributors · Last reviewed:
2026-07-10_

## Decision

Commons is **Cloudflare-first, not Cloudflare-only**.

21st Gov can use Cloudflare as the reference platform for Commons-operated
documentation, registry delivery, large assets, security controls, and future
read-only MCP services. The artifacts agencies consume must remain portable:

- CSS custom properties and stylesheets;
- resolved JSON tokens and schemas;
- React/JavaScript packages and type declarations;
- component source distributed through the registry;
- static documentation and registry assets;
- package tarballs, checksums, SBOMs, and release evidence; and
- optional containers or prebuilt archives for infrastructure that needs them.

An agency must not need a Cloudflare account or Cloudflare runtime to use
Commons. It should be possible to build once and deploy the resulting static
artifacts to Azure, Google Cloud, AWS, a conventional VPS, an internal object
store, or an existing Apache, Nginx, or IIS server.

Windows, Linux, and macOS are all first-class contributor and CLI platforms.
Support is a testable contract, not a sentence in the README.

## Why this matters for local government

Local governments inherit infrastructure decisions from procurement cycles,
state contracts, managed-service providers, shared county or state platforms,
security policies, staffing, and decades of existing applications. A team may
have:

- Microsoft-heavy Windows Server, IIS, Entra ID, and Azure infrastructure;
- AWS or Google Cloud landing zones;
- a state or education cloud contract;
- Linux virtual machines with Apache or Nginx;
- a PHP, .NET, Java, Drupal, or WordPress application on an older server;
- an internal artifact repository and no direct production internet access;
- a self-hosted Git and CI environment;
- strict proxy, custom certificate authority, or allowlist requirements; or
- an air-gapped or intermittently connected network.

Commons can support this variety by keeping the core boring: standards-based
files, explicit schemas, ordinary HTTPS, no required hosted runtime, and build
outputs that can be mirrored.

## Separate the compatibility contracts

“Supports Azure” can mean several unrelated things. Commons should publish four
separate matrices.

### 1. Browser/runtime compatibility

Can a resident-facing application built with Commons run in the agency’s
supported browsers and assistive technologies?

This covers HTML, CSS, JavaScript, React, high contrast, forced colors, keyboard,
screen readers, zoom, text enlargement, reduced motion, touch, RTL, and language
behavior. It is independent of where the files are hosted.

### 2. Developer and CLI compatibility

Can a government employee or contractor install, inspect, test, and update
Commons from Windows, Linux, or macOS?

This covers Node.js, pnpm/npm, shells, paths, permissions, proxies, custom
certificate authorities, line endings, archives, and filesystem behavior.

### 3. Artifact-hosting compatibility

Can an agency serve built CSS, JavaScript, fonts, JSON, schemas, and registry
files from its existing platform?

This is mostly a static HTTP contract: HTTPS, correct media types, caching,
compression, CORS where cross-origin registry access is intended, integrity,
and predictable 404 behavior.

### 4. Documentation-application compatibility

Can an agency deploy a fork of the full Commons documentation application,
including any server-rendered or dynamic features?

This is the most provider-specific layer. Fumadocs/Next.js deployment adapters,
serverless runtimes, containers, and authentication do not belong in the core
design-system contract. Prefer static export for agency forks when it satisfies
the feature set; offer a container or provider adapter only when dynamic
behavior is actually required.

## Support levels

Every compatibility claim should use one of these labels:

| Level                     | Meaning                                                                                            | Evidence required                                       |
| ------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Reference**             | 21st Gov operates this path and uses it for Commons itself                                         | Production operation, runbook, monitoring, release test |
| **Tested**                | Commons CI or a maintained test environment verifies this path                                     | Automated matrix or repeatable release test             |
| **Documented**            | Maintainers provide and review instructions, but do not continuously test the complete environment | Current guide, community or agency validation date      |
| **Standards-compatible**  | The artifacts should work because the environment meets the published static/runtime contract      | Contract conformance; no provider-specific guarantee    |
| **Community**             | Community-maintained instructions or adapter                                                       | Named owner and last-verified version                   |
| **Unsupported / unknown** | No current evidence                                                                                | Explicit limitation; no implied commitment              |

Do not call a provider “supported” because its marketing page says it can host
React or static files. Test the actual Commons artifact, headers, routing,
installation, and upgrade flow.

## Portable artifact contract

### Packages

`@21stgov/commons-tokens`, `@21stgov/commons-core`, `@21stgov/commons-css`,
`@21stgov/commons-js`, and `@21stgov/commons-react` must not call a
Commons-operated service at runtime. They must not require Cloudflare bindings,
environment variables, a database, or an account.

Published packages should include conventional ESM/CSS/type exports, explicit
engine and peer ranges, licenses, checksums/provenance, and an SBOM at the
release level. If a package later adds browser network behavior, that is an
architectural change requiring an ADR, privacy review, documentation, and an
opt-in decision.

### Registry

The registry is portable when an ordinary static server can host it. Its
contract should define:

- versioned JSON Schema;
- `application/json; charset=utf-8` responses;
- stable item paths and index files;
- HTTPS for public delivery;
- explicit CORS policy when the CLI or browser reads across origins;
- immutable caching for content-addressed/versioned artifacts;
- short or revalidated caching for moving aliases and indexes;
- strong ETags or content hashes;
- useful, non-secret error responses;
- no directory listing requirement; and
- a complete downloadable mirror with manifest and checksums.

The CLI must accept a configurable registry base URL. An agency should be able
to mirror the public registry to an internal web server or artifact store
without rewriting registry items.

### Static documentation

Where feasible, publish a static documentation export containing semantic HTML,
CSS, JavaScript, images, Markdown, schemas, and the registry. Static output
maximizes portability and makes archival, security review, mirroring, and
restricted-network use much easier.

Dynamic conveniences—search indexing, theme generation, analytics, MCP, private
registry authentication—must degrade independently. Their failure must not make
the documentation or registry unusable.

### Fonts and media

Do not require a third-party font CDN. Ship self-hostable, properly licensed
font assets or a documented system-font fallback. Publish WOFF2 with correct
media types and caching. Provide ZIP artifacts in addition to POSIX-oriented
archives so Windows administrators are not asked to install extra tools.

## Deployment environments

The following table is a research baseline, not a claim that every path is
already tested.

| Environment                         | Likely deployment shape                                                                           | Initial support target      | Key work                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| Cloudflare                          | Workers Static Assets; optional Worker routes; R2 only for large assets                           | Reference                   | Wrangler/OpenNext guide, headers, caching, rollback                                                |
| Azure commercial                    | Static Web Apps for static export, or App Service/container for dynamic docs                      | Documented, then tested     | Azure CLI and PowerShell paths, Entra/proxy considerations                                         |
| Azure Government                    | App Service or agency-approved static/object hosting where available                              | Documented                  | Verify service availability and sovereign endpoints per agency tenant                              |
| Google Cloud                        | Cloud Storage behind HTTPS load balancing for static export; Cloud Run/container for dynamic docs | Documented, then tested     | Load balancer, cache, MIME, IAM, deployment guide                                                  |
| AWS commercial                      | Private S3 origin with CloudFront OAC for static export; container/service for dynamic docs       | Documented, then tested     | OAC, headers, invalidation, IaC example                                                            |
| AWS GovCloud or agency AWS boundary | Agency-approved services and partitions                                                           | Documented                  | Verify regional service availability and compliance boundary; avoid commercial-account assumptions |
| Linux VPS/on-prem                   | Prebuilt files served by Nginx or Apache; optional Node/container only for dynamic docs           | Tested for static artifacts | Example configs, TLS, MIME, cache, CORS, systemd/container notes                                   |
| Windows Server/on-prem              | Prebuilt files served by IIS                                                                      | Tested for static artifacts | `web.config`, Static Content role, JSON/WOFF2 MIME, cache, CORS, URL handling                      |
| Container platform                  | OCI image serving static files or running dynamic docs                                            | Documented, then tested     | Non-root image, read-only filesystem, health checks, SBOM, multi-arch decision                     |
| Internal object/artifact store      | Mirrored immutable registry and release bundle                                                    | Standards-compatible        | Mirror command, manifest, hashes, offline verification                                             |
| Air-gapped/restricted network       | Signed release bundle imported through agency process                                             | Documented                  | Offline install, package cache, registry mirror, update/advisory process                           |

Provider guides must distinguish commercial regions from government/sovereign
environments. Product names can be the same while endpoints, available services,
identity configuration, CI location, and compliance boundary differ.

## Cloudflare reference architecture

Cloudflare Workers Static Assets can upload and serve HTML, CSS, images, JSON,
and other files with a Worker deployment, including integrated caching. That is
a good fit for the Commons-operated docs and registry because it keeps the
reference path small and edge-cached.

The reference deployment should still produce a provider-neutral output folder
before invoking Wrangler. Cloudflare configuration belongs in a deployment
adapter or app, not in the token, core, React, registry-schema, or CLI packages.

Cloudflare-only capabilities should be optional:

- R2 for large downloadable kits, fonts, or media;
- Workers for theme generation, private registries, or MCP;
- Turnstile for public forms;
- platform analytics and security controls; and
- Cloudflare-specific infrastructure as code.

If an agency does not use those features, the core adoption path remains
unchanged.

## Azure paths

Azure Static Web Apps can publish common static front-end frameworks and static
HTML exports. Azure App Service or a container is a better fit when the
documentation fork requires server-rendered behavior.

Azure Government requires separate validation. Service availability and
endpoints can differ from commercial Azure, and a CI service may run outside the
agency’s Azure Government boundary. Guides must not tell an Azure Government
team to use a commercial endpoint or external build service without calling out
the boundary.

Deliverables to research and test:

- static export deployment with Azure CLI;
- equivalent PowerShell deployment;
- App Service/container deployment for dynamic docs;
- `staticwebapp.config.json` or App Service configuration where appropriate;
- correct JSON, Markdown, WOFF2, source-map, and WASM media types if used;
- headers, CORS, caching, custom domains, and rollback;
- Azure Government endpoint and service-availability notes; and
- Azure DevOps Server/self-hosted CI option for restricted networks.

## Google Cloud paths

Google Cloud Storage can host static files, but custom-domain HTTPS normally
requires an external Application Load Balancer rather than the bucket website
endpoint alone. Cloud Run or another agency-approved compute service can host a
dynamic documentation container.

Deliverables to research and test:

- static export to Cloud Storage plus HTTPS load balancing;
- cache metadata and content types at upload;
- least-privilege IAM and public-vs-private origin decisions;
- Cloud Run container with non-root/read-only defaults;
- custom domain, rollback, logging, and cost notes; and
- Assured Workloads or other agency control requirements only when the target
  agency identifies them.

## AWS paths

For commercial AWS, a private S3 bucket behind CloudFront Origin Access Control
is a strong static pattern. AWS recommends OAC over the legacy OAI path, and it
avoids making the bucket itself publicly readable. A container or other
agency-approved service can run dynamic documentation features.

Deliverables to research and test:

- S3 origin plus CloudFront OAC, HTTPS, headers, and custom error behavior;
- versioned object caching and safe invalidation;
- CloudFormation or Terraform example plus a manual deployment path;
- logs, rollback, and least-privilege IAM;
- partition-aware examples; and
- explicit verification before claiming the same architecture works within an
  AWS GovCloud boundary.

Do not treat an S3 website endpoint and a private S3 CloudFront origin as
interchangeable: their HTTPS and origin-access behavior differs.

## VPS and on-premises web servers

The static export should work without Node.js installed on the production
server. Build in an approved workstation or CI environment, then deploy the
output directory.

### Apache HTTP Server

Provide a maintained Apache 2.4 example covering:

- document root and index behavior;
- `application/json` and font media types;
- compression and cache headers;
- security headers;
- CORS only on registry paths that need it;
- denial of directory listing and sensitive dotfiles;
- SPA fallback only if the built app actually needs it; and
- TLS termination assumptions.

Do not require `.htaccess`; offer both virtual-host configuration and a limited
`.htaccess` fallback for teams without server-level access.

### Nginx

Provide an Nginx example covering `root`, `try_files`, media types, cache rules,
security headers, CORS scope, compression, and exact 404 behavior for registry
items. Avoid rewriting every missing JSON request to HTML, which would turn a
registry error into a schema error.

### Microsoft IIS

Provide an IIS `web.config` and GUI/PowerShell notes covering:

- installation of the Static Content role;
- MIME maps for every emitted extension, because IIS does not serve unmapped
  types by default;
- cache, compression, and security headers;
- CORS only for intended registry resources;
- default documents and optional URL Rewrite behavior; and
- filesystem identity and read permissions.

Test with ordinary Windows paths, not only WSL.

### Other conventional servers

Caddy, lighttpd, Java application servers, .NET applications, PHP applications,
CMS platforms, and S3-compatible object storage are standards-compatible when
they satisfy the artifact-hosting contract. Add maintained recipes based on
agency demand rather than promising every possible stack in advance.

## Restricted, proxied, and offline environments

Government networks commonly require more than an alternate deployment target.
The toolchain should support:

- configurable npm and Commons registry URLs;
- HTTP(S) proxy settings documented for the actual Node client in use;
- enterprise/custom certificate authorities without an insecure “disable TLS
  verification” workaround;
- no mandatory postinstall download from an undeclared host;
- lockfiles and deterministic package resolution;
- an export command that creates a complete registry mirror;
- release bundles containing packages, registry, docs, schemas, licenses, SBOM,
  checksums, and provenance;
- offline signature and checksum verification;
- a documented security-advisory import/update process; and
- no requirement that the production server reach npm, GitHub, commonsui.com,
  or Cloudflare.

An offline workflow should be tested, not inferred. The test should begin with
an empty, network-disabled environment plus the published release bundle.

## Windows, Linux, and macOS development contract

### Common command surface

The primary documented commands should work unchanged in PowerShell, Command
Prompt, Bash, and Zsh:

```text
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm validate:contrast
npx @21stgov/commons init
npx @21stgov/commons add button --dry-run
```

Use Node scripts for cross-platform project automation. Avoid making Bash,
GNU-only utilities, Homebrew, WSL, or Visual Studio a hidden prerequisite.

When environment-variable syntax is unavoidable, show each shell explicitly:

```powershell
# PowerShell
$env:COMMONS_REGISTRY = "https://registry.example.gov/r"
```

```bat
:: Command Prompt
set COMMONS_REGISTRY=https://registry.example.gov/r
```

```sh
# Bash or Zsh
export COMMONS_REGISTRY="https://registry.example.gov/r"
```

Prefer a configuration file or CLI flag over environment-only setup when doing
so improves reproducibility.

### Package-manager setup

The repository pins pnpm in `package.json`. Documentation should link to pnpm’s
current installation page instead of assuming one global installation method.
Corepack is distributed with Node.js versions before Node 25 but may require an
update or separate installation; pnpm also documents npm, winget, Scoop,
Chocolatey, Homebrew, and standalone options with platform-specific caveats.

Do not make `curl | sh` the only setup path. It is unsuitable for many Windows
workstations and may be prohibited by agency policy on every OS.

### Filesystem and process rules

Commons code and tests should:

- use `node:path`, `node:fs`, `node:os`, and file URLs instead of concatenating
  separators;
- use `os.tmpdir()` rather than assuming `/tmp`;
- spawn executables with argument arrays rather than shell-interpolated strings;
- avoid relying on executable bits or symbolic links;
- handle spaces, Unicode, and long paths;
- reject case-colliding registry paths before writing on case-insensitive
  filesystems;
- reject Windows reserved names and trailing-dot/trailing-space path segments;
- prevent `..`, absolute-path, drive-letter, UNC, and symlink traversal outside
  the project root;
- define UTF-8 encoding explicitly;
- preserve user files and avoid changing line endings unnecessarily;
- use atomic writes where the filesystem permits;
- close file handles before rename/delete operations; and
- never assume a command shim has no `.cmd` companion on Windows.

### Repository rules

Add and maintain:

- `.gitattributes` for predictable text normalization and binary files;
- `.editorconfig` for encoding, final newlines, and indentation;
- case-collision checks in the registry build;
- a no-POSIX-only-commands check for package scripts;
- path fixtures containing spaces and non-ASCII characters; and
- documented Windows Developer Mode only if a future feature truly requires
  symlinks.

## Cross-platform CI contract

GitHub Actions provides Ubuntu, Windows, and macOS runners and supports matrix
jobs. Commons should make all three required checks for CLI/package changes.

Recommended pull-request matrix:

```yaml
strategy:
  fail-fast: false
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
runs-on: ${{ matrix.os }}
```

The matrix should run the pinned package manager and supported minimum Node
version. A separate Linux job can test the newest supported Node release so the
full OS matrix does not multiply unnecessarily.

Required release-path tests:

1. Install from packed package tarballs rather than workspace links.
2. Build tokens and compare normalized outputs across operating systems.
3. Run CLI fixtures in paths with spaces and Unicode.
4. Test CRLF and LF consumer files.
5. Test case collisions and Windows-reserved paths.
6. Run `init` twice to prove idempotence.
7. Run dry-run and write mode against a local registry fixture.
8. Prove no write escapes the fixture root.
9. Verify ZIP and tar release bundles.
10. Test a self-hosted/offline registry configuration.

Do not merge a platform-specific failure as “probably fine” without either
fixing it or changing the documented support level with a clear rationale.

## Assistive-technology platform coverage

First-class operating-system support includes accessibility testing, not just a
successful TypeScript build.

The release evidence should grow toward:

| Platform   | Representative coverage                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| Windows    | Edge and Chrome, keyboard, Windows High Contrast/forced colors, NVDA, JAWS where available, 200–400% zoom  |
| macOS      | Safari and Chrome, keyboard, VoiceOver, increased contrast, reduced motion, zoom and text scaling          |
| Linux      | Firefox and Chromium, keyboard, forced-color equivalents where available, Orca coverage for core workflows |
| iOS/iPadOS | Safari, VoiceOver, text enlargement, orientation, touch targets, reduced motion                            |
| Android    | Chrome, TalkBack, font/display scaling, switch access where available, touch targets                       |

Not every component needs every manual combination on every commit. Define a
risk-based smoke matrix for pull requests and a broader release matrix, then
publish the actual combinations tested rather than saying “screen-reader
compatible.”

## Documentation rules

- Use `<project-root>` and portable relative paths instead of `/Users/name` or
  `C:\Users\name` in shared examples.
- Label shell blocks (`powershell`, `bat`, `sh`) accurately.
- If a command is identical, show it once and say it works on all supported
  platforms.
- Provide portal, CLI, and infrastructure-as-code paths where reasonable; do not
  assume every agency permits a hosted CI service.
- Never make WSL the Windows support story. It can be an optional workflow, but
  native PowerShell and Windows filesystems must work.
- Include uninstall, rollback, and cleanup instructions.
- State whether a guide was tested, on which version, and when.
- Keep provider-specific credentials out of screenshots and example files.

## Proposed compatibility manifest

Publish a versioned machine-readable document so the website, CLI, and
procurement packet use the same claims:

```json
{
  "$schema": "https://commonsui.com/schema/platform-support.v1.json",
  "commonsVersion": "0.1.0",
  "reviewed": "2026-07-10",
  "development": {
    "node": ">=24",
    "consumerNode": ">=22",
    "packageManager": "pnpm@10.15.1",
    "operatingSystems": [
      { "id": "windows", "level": "tested" },
      { "id": "linux", "level": "tested" },
      { "id": "macos", "level": "tested" }
    ]
  },
  "deployment": [
    { "id": "cloudflare-workers-static-assets", "level": "reference" },
    { "id": "generic-static-http", "level": "standards-compatible" }
  ]
}
```

Do not publish `tested` until the corresponding automation or recorded manual
test exists. The example describes the target state, not current evidence.

## Implementation backlog

### Foundation

- Add `.gitattributes` and `.editorconfig`.
- Add required Windows, Ubuntu, and macOS CI jobs.
- Add cross-platform CLI path and line-ending fixtures.
- Audit package scripts and build code for POSIX assumptions.
- Define the registry HTTP and mirror contract.
- Generate ZIP and tar release bundles with checksums.

### Deployment recipes

- Cloudflare Workers Static Assets reference guide.
- Generic static-server contract and conformance test.
- IIS `web.config` example tested on Windows Server.
- Apache 2.4 virtual-host and `.htaccess` examples.
- Nginx example with strict registry 404 behavior.
- Azure commercial static and dynamic guides.
- Azure Government notes with sovereign endpoint warnings.
- Google Cloud Storage/load-balancer and Cloud Run guides.
- AWS S3/CloudFront OAC guide and partition caveats.
- Container and offline mirror guides.

### Evidence

- Machine-readable compatibility manifest.
- Provider recipe test date and owner.
- Cross-platform release report.
- Browser/assistive-technology matrix by component version.
- Public list of known platform limitations.

## Open research questions

- Can the selected Fumadocs feature set produce a complete static export without
  losing essential search, live examples, or versioning?
- Which Azure services are actually available in the target agencies’ Azure
  Government regions and procurement boundaries?
- Which AWS government deployments require a separate static pattern because
  CloudFront or other global services sit outside the desired boundary?
- What is the smallest OCI image that can serve docs and registry without
  introducing a new maintenance burden?
- How should the CLI honor enterprise proxies and custom CAs using the selected
  Node HTTP client without unsafe global TLS overrides?
- What bundle format best supports an offline npm cache, registry mirror,
  licenses, SBOM, provenance, and security advisories together?
- Which legacy CMS integrations are requested often enough to warrant maintained
  recipes?
- What support window for Node and Windows Server best matches agency upgrade
  cycles without holding the project on end-of-life runtimes?

## Primary sources

- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Azure Static Web Apps documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Government App Service deployment](https://learn.microsoft.com/en-us/azure/azure-government/documentation-government-howto-deploy-webandmobile)
- [Azure Government deployment with Azure Pipelines and boundary warning](https://learn.microsoft.com/en-us/azure/azure-government/connect-with-azure-pipelines)
- [Google Cloud static website hosting](https://docs.cloud.google.com/storage/docs/hosting-static-website)
- [AWS CloudFront Origin Access Control for S3](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [Apache HTTP Server 2.4 configuration](https://httpd.apache.org/docs/current/en/configuring.html)
- [Nginx `try_files` and core HTTP configuration](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)
- [IIS static-content MIME mappings](https://learn.microsoft.com/en-us/iis/configuration/system.webserver/staticcontent/mimemap)
- [pnpm installation and compatibility](https://pnpm.io/installation)
- [Corepack installation and offline workflow](https://github.com/nodejs/corepack#readme)
- [GitHub Actions multi-operating-system matrices](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations)

Provider services, sovereign-cloud availability, CLI behavior, and supported
runtime versions change. Re-verify the relevant primary documentation before
publishing a deployment recipe or making a procurement claim.
