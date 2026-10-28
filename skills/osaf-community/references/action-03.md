# Community action 3: Provide accessible and respectful ways to contribute and collaborate

Part of the `osaf-community` skill. Read this when action 3 is in scope.

- ID: `provide-accessible-and-respectful-ways-to-contribute-and-collaborate`
- Effort and cadence: Extended; Initial setup + ongoing
- Canonical source: [Community phase, action 3](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/blob/b2ea31a2e38cbab3e774e4142575b78876b9b53f/framework/phases/community-phase.md#3-provide-accessible-and-respectful-ways-to-contribute-and-collaborate)

## Why it matters

Accessible tools and processes allow more people to share expertise, influence
decisions, and take on responsibility. Contributions can include testing, issue
reproduction, documentation, design feedback, research, mentoring, translation,
community support, governance, and leadership.

## Definition of Done

1. Contributor guidance documents accessible synchronous and asynchronous ways
   to participate.
2. Collaboration tools and workflows have been reviewed for significant
   accessibility and usability barriers, with alternatives documented as needed.
3. A code of conduct or equivalent policy is adopted and enforced.
4. Contributors can request accommodations without unnecessary public
   disclosure.

## Recommended steps, adapted from the framework

1. Identify accessible ways to participate.
   - Create clearly scoped accessibility issues using labels such as
     `accessibility` with `good first issue` and `accessibility` with
     `help wanted`.
   - Make meeting agendas and accessible materials available in advance when
     practical.
   - Explicitly document non-code contribution opportunities.
   - Provide asynchronous options such as issues, discussions, mailing lists,
     meeting notes, transcripts, or summaries.
   - Provide captions and describe meaningful visual information during
     meetings and presentations when practical.
   - Avoid requiring camera use, spoken participation, or a single
     communication channel unless the project has a compelling need for this.
2. Review collaboration tools for accessibility, addressing barriers or
   providing alternatives. Check for keyboard access, screen reader support,
   captions, transcripts, accessible chat, accessible documents, magnification
   and reflow support, and understandable interaction patterns.
3. Adopt and enforce a code of conduct. GitHub provides guidance for
   [adding a code of conduct to a project](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-code-of-conduct-to-your-project).
   Ensure disability-related harassment, dismissive behavior, personal attacks,
   and disclosure of private information get handled consistently via the
   project's community standards.
4. Provide a way to request accommodations without requiring unnecessary public
   disclosure. Identify an accessibility or accommodation contact for
   significant community meetings and events.

## How to do it in this repository

- **Item 1** is a "Ways to participate" section in `CONTRIBUTING.md` (or
  `ACCESSIBILITY.md`): the asynchronous channels the project actually has,
  any meetings and how their materials and notes are shared, and the non-code
  contributions it welcomes. List only channels that exist.
- **Item 2 is a review, not a guess.** List the tools the project uses (GitHub,
  a chat platform, a forum, a video call service, a shared document editor)
  and, for each, what was checked and by whom. GitHub's own accessibility is
  documented at [accessibility.github.com](https://accessibility.github.com/documentation).
  For tools nobody has tested with assistive technology, say so and record an
  alternative (for example, meeting notes posted to a discussion).
- **Item 3.** Check for `CODE_OF_CONDUCT.md` (root, `docs/` or `.github/`, or an
  organization-level `.github` repository). If missing, hand off to
  `repo-manager`. If present, check that it covers disability-related
  harassment, dismissive behavior, personal attacks and disclosure of private
  information, and names a reporting contact. "Enforced" is the maintainers'
  practice; record it as their statement.
- **Item 4** needs a private route: an email address or a form, named in
  `CONTRIBUTING.md` and in any event page. That is maintainer input; never
  invent an address.

## Hand-offs

- `contributions-hub` - check the community health files (code of conduct,
  contributing, security, support) and score what is missing.
- `repo-manager` - generate `CODE_OF_CONDUCT.md` (Contributor Covenant) or
  `CONTRIBUTING.md` when absent; it asks for the contact method.
- `markdown-a11y-assistant` (router) - audit the contributor documents for
  accessibility.

## Evidence to report

- The section that documents ways to participate, with lines.
- The tool review: each tool, what was checked, by whom, and the alternative.
- The code of conduct path and its reporting contact.
- The accommodation contact, or that the maintainer must provide one.
