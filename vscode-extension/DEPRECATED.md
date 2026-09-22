# Deprecated

This extension is superseded by the Accessibility Agents package at the
repository root.

VS Code, Copilot CLI and the Copilot app install Agent Plugins natively, and
the package publishes its skills through that mechanism. The `@a11y` chat
participant this extension provided is replaced by the skills themselves:
`/accessibility-lead`, `/web-accessibility-wizard` and the rest appear in the
slash menu without an extension in between.

The source is kept so a final version can be published pointing existing
users at the package. It is not part of the build and is not validated.

See `modern.md` for the migration and `docs/MODERNIZATION-CONFORMANCE.md`
for what replaced it.
