# Security policy

Commons is an open-source design system and toolchain used to build public
services. We appreciate responsible reports that help protect maintainers,
contributors, government teams, and the people who rely on those services.

| Policy detail | Value                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------- |
| Status        | Active                                                                                        |
| Owner         | 21st Gov maintainers                                                                          |
| Applies to    | Commons packages, CLI, registry, MCP server, documentation site, and deployment configuration |
| Last reviewed | 2026-07-14                                                                                    |

## Supported versions

Security fixes are made against the latest published release and the current
development branch. Older release lines are not supported unless a published
security advisory says otherwise. After a fix is available, users may need to
upgrade to the latest release to receive it.

## Report a vulnerability privately

Do not open a public issue for a suspected vulnerability.

Use GitHub's
[private vulnerability reporting](https://github.com/21stgov/commons/security/advisories/new)
to send the report directly to the maintainers. If GitHub private reporting is
unavailable, email [security@21stgov.com](mailto:security@21stgov.com) and ask
for a private reporting channel. Do not include exploit details, credentials,
personal information, resident data, or other sensitive material in the
initial email.

Include as much of the following as is safe and relevant:

- the affected package, component, service, version, or commit;
- the vulnerability type and potential impact;
- the conditions required to reproduce or exploit it;
- minimal reproduction steps or a proof of concept;
- known affected and unaffected environments;
- possible mitigations or remediation ideas; and
- your preferred disclosure timeline and whether you would like credit.

If the report involves a government deployment, describe the deployment model
without sharing secrets, production data, or information that identifies
residents.

## What happens after a report

Maintainers will review the report, ask for additional information when
needed, determine the affected versions, and coordinate remediation and
disclosure. Valid reports may result in a GitHub security advisory, patched
release, mitigation guidance, and reporter credit with permission.

Please allow time for investigation and coordinated disclosure. Do not publish
the vulnerability before maintainers have had a reasonable opportunity to
validate and remediate it. This project does not currently operate a bug bounty
program and cannot promise payment for reports.

## Report non-security issues publicly

Use the repository's public issue forms for ordinary bugs, accessibility
problems, documentation errors, and feature proposals. A bug that affects
accessibility but does not expose data or cross a security boundary should use
the accessibility issue form.
