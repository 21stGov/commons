# Commons UI — Claude Agent Skill

A [Claude Agent Skill](https://docs.claude.com/en/docs/claude-code/skills) that
teaches Claude how to build with [Commons](https://commonsui.com) correctly:
installing components with the CLI (own-your-code), the React and
framework-agnostic (`.cui-*` + `commons-js`) paths, design tokens and theming,
and honoring each component's normative accessibility contract.

It complements the [Commons MCP server](https://commonsui.com/docs/mcp): the MCP
gives an agent live registry data (search, inspect, plan), and this skill gives
it the procedural know-how for using that data well.

## Install

**Claude Code** — copy the skill into a skills directory it loads:

```sh
# project-scoped (this repo/project only)
mkdir -p .claude/skills && cp -r skills/commons-ui .claude/skills/

# or user-scoped (all your projects)
mkdir -p ~/.claude/skills && cp -r skills/commons-ui ~/.claude/skills/
```

**claude.ai / Claude API** — upload or reference `SKILL.md` per your client's
skill mechanism.

Claude loads the skill automatically when a task matches its `description`
(building Commons or `.cui-*` UI). No configuration needed once it's in a skills
directory.
