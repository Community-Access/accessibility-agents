# PDF Accessibility reference: Rule Layers

Part of the `pdf-accessibility` skill. Read this only when the task reaches these sections.

## Rule Layers

### Layer 1: PDF/UA Conformance Rules (PDFUA.*)

These rules map to Matterhorn Protocol checkpoints. Violations mean the PDF fails PDF/UA conformance.

| ID | Checkpoint | Severity | Description |
|----|-----------|----------|-------------|
| PDFUA.01.001 | 01 | error | No structure tree root - document has no tagged structure |
| PDFUA.01.002 | 01 | error | MarkInfo/Marked is not true - PDF not identified as tagged |
| PDFUA.01.003 | 01 | error | Content not enclosed in structure elements (untagged content) |
| PDFUA.01.004 | 01 | error | Structure element has no standard or role-mapped type |
| PDFUA.02.001 | 02 | error | Role map maps to non-standard structure type |
| PDFUA.06.001 | 06 | error | Document-level /Lang entry missing |
| PDFUA.06.002 | 06 | error | Language identifier is not valid BCP 47 |
| PDFUA.06.003 | 06 | warning | Span-level language change not marked |
| PDFUA.07.001 | 07 | error | Heading levels skip (H3 after H1 with no H2) |
| PDFUA.09.001 | 09 | error | Content outside page area is tagged (off-page content) |
| PDFUA.11.001 | 11 | error | Natural language for text cannot be determined |
| PDFUA.13.001 | 13 | error | Figure element has no /Alt text |
| PDFUA.13.002 | 13 | warning | /Alt text exceeds 250 characters |
| PDFUA.13.003 | 13 | error | Decorative image not marked as Artifact |
| PDFUA.14.001 | 14 | error | Inline image not tagged as Figure |
| PDFUA.15.001 | 15 | warning | Formula not tagged with /Formula or has no /Alt |
| PDFUA.17.001 | 17 | error | Content marked as Artifact also appears in structure tree |
| PDFUA.19.001 | 19 | error | Table has no TH (header) cells |
| PDFUA.19.002 | 19 | error | TH cell missing /Scope attribute |
| PDFUA.19.003 | 19 | error | Table does not use Headers attribute for complex spanning |
| PDFUA.20.001 | 20 | error | List not tagged with /L, /LI, /Lbl, /LBody |
| PDFUA.21.001 | 21 | error | Heading not tagged with /H or /H1-/H6 |
| PDFUA.25.001 | 25 | error | Tab order not consistent with structure order |
| PDFUA.26.001 | 26 | error | Form field has no tooltip (/TU entry) |
| PDFUA.26.002 | 26 | error | Form field not in structure tree |
| PDFUA.26.003 | 26 | warning | Form field tab order is unordered |
| PDFUA.28.001 | 28 | error | Link annotation not in structure tree |
| PDFUA.28.002 | 28 | error | Link has no alternate description |
| PDFUA.30.001 | 30 | error | XMP metadata and Info dictionary are inconsistent |
| PDFUA.31.001 | 31 | error | File not identified as PDF/UA (missing pdfuaid:part) |

### Layer 2: Best-Practice Rules (PDFBP.*)

These rules go beyond PDF/UA to ensure practical accessibility.

| ID | Severity | Description |
|----|----------|-------------|
| PDFBP.META.TITLE_PRESENT | error | Document title metadata missing |
| PDFBP.META.TITLE_DISPLAY | warning | Document should display title (not filename) in title bar |
| PDFBP.META.LANG_PRESENT | error | Document language not set |
| PDFBP.META.TAGGED_MARKER | error | PDF not marked as tagged |
| PDFBP.TEXT.EXTRACTABLE | error | No extractable text - likely image-only/scanned PDF |
| PDFBP.TEXT.UNICODE_MAP | warning | Missing ToUnicode maps - text may not extract correctly |
| PDFBP.TEXT.EMBEDDED_FONTS | warning | Fonts not embedded - rendering may vary across systems |
| PDFBP.TEXT.ACTUAL_TEXT | warning | Ligatures or special glyphs lack /ActualText replacement |
| PDFBP.STRUCT.STRUCTURE_TREE_PRESENT | error | No structure tree in document |
| PDFBP.STRUCT.READING_ORDER | warning | Reading order may not match visual order |
| PDFBP.IMG.ALT_PRESENT | error | Figures without alt text |
| PDFBP.IMG.ALT_QUALITY | warning | Alt text appears to be filename or auto-generated |
| PDFBP.IMG.DECORATIVE_ARTIFACT | tip | Decorative images should be marked as Artifact |
| PDFBP.NAV.BOOKMARKS_FOR_LONG_DOCS | warning | Document >10 pages without bookmarks |
| PDFBP.NAV.TOC_LINKED | tip | Table of contents entries should link to their targets |
| PDFBP.TAB.TH_PRESENT | error | Table has no header cells |
| PDFBP.TAB.SCOPE_SET | warning | Header cells missing scope attribute |
| PDFBP.TAB.COMPLEX_HEADERS | warning | Complex table (spanning cells) needs Headers attribute |
| PDFBP.FORMS.TAB_ORDER | warning | Form tab order should follow structure order |
| PDFBP.FORMS.TOOLTIP_PRESENT | error | Form field missing tooltip/label |
| PDFBP.LINK.IN_STRUCT | error | Link annotation not represented in structure tree |
| PDFBP.LINK.DESCRIPTIVE_TEXT | warning | Link text is URL or generic ("click here") |

### Layer 3: Quality/Pipeline Rules (PDFQ.*)

These rules catch process-level problems for CI/CD pipelines and documentation workflows.

| ID | Severity | Description |
|----|----------|-------------|
| PDFQ.REPO.NO_SCANNED_ONLY | error | Image-only PDF in repository - requires OCR or source rebuild |
| PDFQ.REPO.ENCRYPTED | warning | Encrypted PDF may block AT access |
| PDFQ.PIPE.SOURCE_REBUILD | tip | Consider rebuilding PDF from tagged source (Word, InDesign, LaTeX) |
| PDFQ.PIPE.VERAPDF_VALIDATE | tip | For full PDF/UA conformance, run veraPDF validation |
