# PDF Accessibility reference: Remediation Guidance

Part of the `pdf-accessibility` skill. Read this only when the task reaches these sections.

## Remediation Guidance

### Untagged PDF (Most Common Issue)

1. **Best approach:** Rebuild from source (Word, InDesign) with accessibility checked
2. **If no source:** In Adobe Acrobat Pro, All tools > Prepare for accessibility > Automatically tag PDF
3. **For scanned PDFs:** Run OCR first (in Acrobat: All tools > Scan & OCR > Recognize text, or ABBYY FineReader), then add tags
4. **Verify:** Run veraPDF after tagging: `verapdf --flavour ua1 file.pdf` (use `--flavour ua2` for a PDF 2.0 file)

### Missing Alt Text

1. In Adobe Acrobat Pro, run All tools > Prepare for accessibility > Check for accessibility, then use Fix on the Figures Alternate Text result (opens the Set Alternate Text dialog)
2. Or edit in the Accessibility tags panel: find Figure elements, add /Alt attribute
3. Mark decorative images as Artifact (not Figure)
4. Alt text should describe the image's purpose, not format ("photo of..." -> describe what matters)

### Missing Document Title

1. Document properties (File menu on macOS, the hamburger menu on Windows) > Description > Title
2. Document properties > Initial View > Show: Document Title (not File Name)
3. In tagged source (Word): File > Properties > Title

### Missing Language

1. Document properties > Advanced > Reading Options > Language
2. For mixed-language documents: tag each language span with the correct language

### Table Remediation

1. Tags panel: ensure /Table contains /TR, /TH, /TD
2. Set /Scope on TH cells: "Column", "Row", or "Both". A table whose data cells name their headers through /Headers and the TH IDs does not need /Scope (Matterhorn 15-003)
3. For complex tables with spanning cells: use /Headers attribute on TD cells
4. Consider simplifying complex tables - split into multiple simple tables

### Bookmarks

1. Adobe Acrobat: View > Navigation Panels > Bookmarks > Options > New Bookmarks from Structure
2. Verify bookmarks match heading structure and link to correct pages

### Forms

1. Every field needs: Tooltip (/TU), Name, and correct tab order
2. Tab order: Page Thumbnails panel > Options > Page Properties > Tab Order > Use Document Structure (repeat for each page)
3. Group related fields with fieldsets
4. Required fields must be indicated in the tooltip, not just by color
