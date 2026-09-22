# The first real audit, September 2026

The top item on the 7.0 roadmap was to run one audit end to end before building
anything else, on the grounds that the findings pipeline had passed its
self-tests but had never seen real output. This is what happened.

## What was audited

`example/` is a shop page with 49 accessibility defects planted on purpose,
each marked with an `ISSUE` comment. That makes it the one target where recall
can be measured rather than estimated.

The comments were stripped first, because auditing them would measure whether a
specialist can read a comment. `scripts/audit-fixture.mjs` does the strip and
writes a line map beside the copy.

Nine specialists ran in parallel against the stripped page, dispatched with the
pointer prompt from the dispatch contract, each asked to return only JSON.

## What worked

Every stage of the pipeline ran on real output, with these results.

| Stage | Result |
|---|---|
| Dispatch | 9 specialists in parallel, all returned |
| Schema | 9 of 9 payloads validated with no errors |
| Merge | 141 findings combined, scored 32, graded F |
| Render | Every required section, 2,677 lines |
| Delta | Second round: 12 fixed, score 32 to 41 |
| Report quality | Passed both the markdown accessibility gate and markdownlint |

Recall against the answer key was 49 of 49. Every planted defect was found,
confirmed by hand for the four the grader could not match and by ten
independent spot checks against distinctive signatures.

The specialists also returned about 100 findings beyond the key. The fixture's
comments are not an exhaustive list of what is wrong with the page, so most of
those are real.

## What broke

### The merge was not deduplicating

The important one. The merge keyed on rule identifier plus location, and every
specialist invents its own rule namespace. Nine specialists produced 141
findings and the merge combined exactly zero of them.

In the report a reader saw:

| Location | Findings | What it actually is |
|---|---:|---|
| `index.html:103` | 8 | one div used as a button |
| `index.html:41` | 6 | one div used as a button |
| `index.html:124` | 5 | one span used as a close button |

Thirty-three locations carried more than one finding. The report told someone
to fix 141 things when there were roughly 60. This is precisely the failure the
design claims to prevent, and it took a real audit to see it: the self-test
used two payloads that happened to agree on a rule identifier.

**Fixed.** `collapseSameDefect` now compares co-located findings on what they
say, not on an identifier they were never going to share. The bar for merging
is high, because one line legitimately carries several defects: the phone input
at `index.html:91` has both no label and a positive tabindex, and those stay
separate. A merged finding keeps the worst severity, every skill that reported
it, and every rule identifier, so nothing is lost.

Result on the same data: 141 findings become 103, with 27 clusters merged.
Eight tests in the findings contract hold the behaviour, including the case
that must not merge.

### The recall grader was wrong

The first grader reported 86 percent and named seven misses. All seven had been
found. It compared findings numbered against the stripped copy with an answer
key numbered against the original.

**Fixed** in two steps: the fixture prep now emits a line map, and matching is
content-first, using the code at each planted defect rather than the wording of
its comment. A comment reading "2.23:1 on #333 - FAILS" shares almost no words
with a finding that says the same thing in prose, but both mention `#666666`.

The grader is still approximate. It reported 45 of 49 on the final run; the
remaining four were confirmed by hand. It is a sanity check, not a measurement
to defend.

## What this says about the package

The infrastructure held. Nine parallel dispatches, schema validation, scoring,
rendering and delta all worked first time on real output, and the generated
report passes the standards this project enforces on other people.

The defect was in the part that had only ever been tested against data written
to test it. One real run found it in twenty minutes.

## Reproducing

```bash
node scripts/audit-fixture.mjs /tmp/audit-run
# dispatch the specialists against /tmp/audit-run/site, writing JSON to
# /tmp/audit-run/findings
node scripts/audit-recall.mjs /tmp/audit-run/findings
node skills/a11y-core/scripts/render-report.mjs /tmp/audit-run/findings/*.json \
  --template web --out WEB-ACCESSIBILITY-AUDIT.md
```

## What is still not proven

A fixture is a page someone built to be broken. Its defects are the ones the
author thought of, planted where a reader would look. A real site fails in
messier ways: defects behind interaction, in framework output nobody wrote by
hand, in states that only appear after a login. The next audit should be one of
those, and it should be run by someone who does not already know the answer.
