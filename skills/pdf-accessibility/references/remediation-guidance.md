# PDF Accessibility reference: Remediation Guidance

Part of the `pdf-accessibility` skill. Read this only when the task reaches these sections.

## Remediation Guidance

### Untagged PDF (Most Common Issue)

1. **Best approach:** Rebuild from source (Word, InDesign) with accessibility checked
2. **If no source:** Use Adobe Acrobat Pro > Accessibility > Add Tags
3. **For scanned PDFs:** Run OCR first (Adobe Acrobat, ABBYY FineReader), then add tags
4. **Verify:** Run veraPDF after tagging: `verapdf --flavour ua1 file.pdf`

### Missing Alt Text

1. Open in Adobe Acrobat Pro > Accessibility > Set Alternate Text
2. Or edit tags panel: find Figure elements, add /Alt attribute
3. Mark decorative images as Artifact (not Figure)
4. Alt text should describe the image's purpose, not format ("photo of..." -> describe what matters)

### Missing Document Title

1. File > Properties > Description > Title
2. Advanced > Reading Options > Display: Document Title (not File Name)
3. In tagged source (Word): File > Properties > Title

### Missing Language

1. File > Properties > Advanced > Language
2. For mixed-language documents: tag each language span with the correct language

### Table Remediation

1. Tags panel: ensure /Table contains /TR, /TH, /TD
2. Set /Scope on TH cells: "Column", "Row", or "Both"
3. For complex tables with spanning cells: use /Headers attribute on TD cells
4. Consider simplifying complex tables - split into multiple simple tables

### Bookmarks

1. Adobe Acrobat: View > Navigation Panels > Bookmarks > Options > New Bookmarks from Structure
2. Verify bookmarks match heading structure and link to correct pages

### Forms

1. Every field needs: Tooltip (/TU), Name, and correct tab order
2. Tab order: Page Properties > Tab Order > Use Document Structure
3. Group related fields with fieldsets
4. Required fields must be indicated in the tooltip, not just by color
