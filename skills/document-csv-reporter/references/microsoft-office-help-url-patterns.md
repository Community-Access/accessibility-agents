# Document CSV Reporter reference: Microsoft Office Help URL Patterns

Part of the `document-csv-reporter` skill. Read this only when the task reaches these sections.

## Microsoft Office Help URL Patterns

Always write the CSV remediation text so the first sentence tells the reader what to do in the native application before any technical context appears.

### Word (DOCX) Rules to Help URLs

> Rule IDs match the canonical definitions in the `word-accessibility` format agent.

| Rule ID | Issue | Help URL |
|---------|-------|----------|
| `DOCX-E001` | Missing alt text on images | `https://support.microsoft.com/en-us/office/add-alternative-text-to-a-shape-picture-chart-smartart-graphic-or-other-object-44989b2a-903c-4d9a-b742-6a75b451c669` |
| `DOCX-E002` | Missing table header row | `https://support.microsoft.com/en-us/office/create-accessible-tables-in-word-cb464015-59dc-46a0-ac01-6217c62210e5` |
| `DOCX-E003` | Skipped heading levels | `https://support.microsoft.com/en-us/office/create-accessible-word-documents-d9bf3683-87ac-47ea-b91a-78dcacb3c66d#bkmk_headings` |
| `DOCX-E004` | Missing document title | `https://support.microsoft.com/en-us/office/create-accessible-word-documents-d9bf3683-87ac-47ea-b91a-78dcacb3c66d#bkmk_doctitle` |
| `DOCX-E005` | Merged or split table cells | `https://support.microsoft.com/en-us/office/create-accessible-tables-in-word-cb464015-59dc-46a0-ac01-6217c62210e5` |
| `DOCX-E006` | Ambiguous hyperlink text | `https://support.microsoft.com/en-us/office/create-accessible-word-documents-d9bf3683-87ac-47ea-b91a-78dcacb3c66d#bkmk_links` |
| `DOCX-E007` | No heading structure | `https://support.microsoft.com/en-us/office/create-accessible-word-documents-d9bf3683-87ac-47ea-b91a-78dcacb3c66d#bkmk_headings` |
| `DOCX-E008` | Document access restricted (IRM) | `https://support.microsoft.com/en-us/office/create-accessible-word-documents-d9bf3683-87ac-47ea-b91a-78dcacb3c66d` |
| `DOCX-E009` | Content controls without titles | `https://support.microsoft.com/en-us/office/create-accessible-word-documents-d9bf3683-87ac-47ea-b91a-78dcacb3c66d` |
| `DOCX-W001` | Nested tables | `https://support.microsoft.com/en-us/office/create-accessible-tables-in-word-cb464015-59dc-46a0-ac01-6217c62210e5` |
| `DOCX-W002` | Long alt text (>150 chars) | `https://support.microsoft.com/en-us/office/everything-you-need-to-know-to-write-effective-alt-text-df98f884-ca3d-456c-807b-1a1fa82f5dc2` |
| `DOCX-W003` | Manual list characters | `https://support.microsoft.com/en-us/office/create-accessible-word-documents-d9bf3683-87ac-47ea-b91a-78dcacb3c66d` |
| `DOCX-W004` | Blank table rows for spacing | `https://support.microsoft.com/en-us/office/create-accessible-tables-in-word-cb464015-59dc-46a0-ac01-6217c62210e5` |
| `DOCX-W005` | Heading exceeds 100 characters | `https://support.microsoft.com/en-us/office/create-accessible-word-documents-d9bf3683-87ac-47ea-b91a-78dcacb3c66d#bkmk_headings` |
| `DOCX-W006` | Watermark present | `https://support.microsoft.com/en-us/office/create-accessible-word-documents-d9bf3683-87ac-47ea-b91a-78dcacb3c66d#bkmk_watermarks` |
| `DOCX-T001` | Missing document language | `https://support.microsoft.com/en-us/office/create-accessible-word-documents-d9bf3683-87ac-47ea-b91a-78dcacb3c66d#bkmk_language` |
| `DOCX-T002` | Layout table with header markup | `https://support.microsoft.com/en-us/office/create-accessible-tables-in-word-cb464015-59dc-46a0-ac01-6217c62210e5` |
| `DOCX-T003` | Repeated blank characters | `https://support.microsoft.com/en-us/office/create-accessible-word-documents-d9bf3683-87ac-47ea-b91a-78dcacb3c66d#bkmk_whitespace` |

### Excel (XLSX) Rules to Help URLs

> Rule IDs match the canonical definitions in the `excel-accessibility` format agent.

| Rule ID | Issue | Help URL |
|---------|-------|----------|
| `XLSX-E001` | Missing alt text on images/charts | `https://support.microsoft.com/en-us/office/add-alternative-text-to-a-shape-picture-chart-smartart-graphic-or-other-object-44989b2a-903c-4d9a-b742-6a75b451c669` |
| `XLSX-E002` | Missing table header row | `https://support.microsoft.com/en-us/office/create-accessible-excel-workbooks-6cc05fc5-1314-48b5-8eb3-683e49b3e593#bkmk_tableheaders` |
| `XLSX-E003` | Default sheet names | `https://support.microsoft.com/en-us/office/create-accessible-excel-workbooks-6cc05fc5-1314-48b5-8eb3-683e49b3e593#bkmk_sheettabs` |
| `XLSX-E004` | Merged cells in data tables | `https://support.microsoft.com/en-us/office/create-accessible-excel-workbooks-6cc05fc5-1314-48b5-8eb3-683e49b3e593#bkmk_mergedcells` |
| `XLSX-E005` | Ambiguous hyperlink text | `https://support.microsoft.com/en-us/office/create-accessible-excel-workbooks-6cc05fc5-1314-48b5-8eb3-683e49b3e593` |
| `XLSX-E006` | Missing workbook title | `https://support.microsoft.com/en-us/office/create-accessible-excel-workbooks-6cc05fc5-1314-48b5-8eb3-683e49b3e593#bkmk_doctitle` |
| `XLSX-E007` | Red-only negative number formatting | `https://support.microsoft.com/en-us/office/create-accessible-excel-workbooks-6cc05fc5-1314-48b5-8eb3-683e49b3e593#bkmk_color` |
| `XLSX-E008` | Workbook access restricted (IRM) | `https://support.microsoft.com/en-us/office/create-accessible-excel-workbooks-6cc05fc5-1314-48b5-8eb3-683e49b3e593` |
| `XLSX-W001` | Blank cells used for formatting | `https://support.microsoft.com/en-us/office/create-accessible-excel-workbooks-6cc05fc5-1314-48b5-8eb3-683e49b3e593` |
| `XLSX-W002` | Color-only data differentiation | `https://support.microsoft.com/en-us/office/create-accessible-excel-workbooks-6cc05fc5-1314-48b5-8eb3-683e49b3e593#bkmk_color` |
| `XLSX-W003` | Complex table structure | `https://support.microsoft.com/en-us/office/create-accessible-excel-workbooks-6cc05fc5-1314-48b5-8eb3-683e49b3e593#bkmk_mergedcells` |
| `XLSX-W004` | Empty worksheet | `https://support.microsoft.com/en-us/office/create-accessible-excel-workbooks-6cc05fc5-1314-48b5-8eb3-683e49b3e593` |
| `XLSX-W005` | Long alt text (>150 chars) | `https://support.microsoft.com/en-us/office/everything-you-need-to-know-to-write-effective-alt-text-df98f884-ca3d-456c-807b-1a1fa82f5dc2` |
| `XLSX-T001` | Sheet tab order not logical | `https://support.microsoft.com/en-us/office/create-accessible-excel-workbooks-6cc05fc5-1314-48b5-8eb3-683e49b3e593#bkmk_sheettabs` |
| `XLSX-T002` | Missing named ranges | `https://support.microsoft.com/en-us/office/create-accessible-excel-workbooks-6cc05fc5-1314-48b5-8eb3-683e49b3e593` |
| `XLSX-T003` | Missing workbook language | `https://support.microsoft.com/en-us/office/create-accessible-excel-workbooks-6cc05fc5-1314-48b5-8eb3-683e49b3e593` |

### PowerPoint (PPTX) Rules to Help URLs

> Rule IDs match the canonical definitions in the `powerpoint-accessibility` format agent.

| Rule ID | Issue | Help URL |
|---------|-------|----------|
| `PPTX-E001` | Missing alt text on images | `https://support.microsoft.com/en-us/office/add-alternative-text-to-a-shape-picture-chart-smartart-graphic-or-other-object-44989b2a-903c-4d9a-b742-6a75b451c669` |
| `PPTX-E002` | Missing slide titles | `https://support.microsoft.com/en-us/office/create-accessible-powerpoint-presentations-6f7772b2-2f33-4bd2-8ca7-dae3b2b3ef25#bkmk_slidetitles` |
| `PPTX-E003` | Duplicate slide titles | `https://support.microsoft.com/en-us/office/create-accessible-powerpoint-presentations-6f7772b2-2f33-4bd2-8ca7-dae3b2b3ef25#bkmk_slidetitles` |
| `PPTX-E004` | Missing table header row | `https://support.microsoft.com/en-us/office/create-accessible-powerpoint-presentations-6f7772b2-2f33-4bd2-8ca7-dae3b2b3ef25#bkmk_tableheaders` |
| `PPTX-E005` | Ambiguous hyperlink text | `https://support.microsoft.com/en-us/office/create-accessible-powerpoint-presentations-6f7772b2-2f33-4bd2-8ca7-dae3b2b3ef25#bkmk_links` |
| `PPTX-E006` | Incorrect reading order | `https://support.microsoft.com/en-us/office/create-accessible-powerpoint-presentations-6f7772b2-2f33-4bd2-8ca7-dae3b2b3ef25#bkmk_readingorder` |
| `PPTX-E007` | Presentation access restricted (IRM) | `https://support.microsoft.com/en-us/office/create-accessible-powerpoint-presentations-6f7772b2-2f33-4bd2-8ca7-dae3b2b3ef25` |
| `PPTX-W001` | Missing presentation title | `https://support.microsoft.com/en-us/office/create-accessible-powerpoint-presentations-6f7772b2-2f33-4bd2-8ca7-dae3b2b3ef25` |
| `PPTX-W002` | Tables used for layout | `https://support.microsoft.com/en-us/office/create-accessible-powerpoint-presentations-6f7772b2-2f33-4bd2-8ca7-dae3b2b3ef25#bkmk_tableheaders` |
| `PPTX-W003` | Merged table cells | `https://support.microsoft.com/en-us/office/create-accessible-powerpoint-presentations-6f7772b2-2f33-4bd2-8ca7-dae3b2b3ef25#bkmk_tableheaders` |
| `PPTX-W004` | Audio/video without captions | `https://support.microsoft.com/en-us/office/create-accessible-powerpoint-presentations-6f7772b2-2f33-4bd2-8ca7-dae3b2b3ef25#bkmk_captions` |
| `PPTX-W005` | Color-only meaning | `https://support.microsoft.com/en-us/office/create-accessible-powerpoint-presentations-6f7772b2-2f33-4bd2-8ca7-dae3b2b3ef25#bkmk_color` |
| `PPTX-W006` | Long alt text (>150 chars) | `https://support.microsoft.com/en-us/office/everything-you-need-to-know-to-write-effective-alt-text-df98f884-ca3d-456c-807b-1a1fa82f5dc2` |
| `PPTX-T001` | Missing section names | `https://support.microsoft.com/en-us/office/create-accessible-powerpoint-presentations-6f7772b2-2f33-4bd2-8ca7-dae3b2b3ef25` |
| `PPTX-T002` | Excessive animations | `https://support.microsoft.com/en-us/office/create-accessible-powerpoint-presentations-6f7772b2-2f33-4bd2-8ca7-dae3b2b3ef25#bkmk_animations` |
| `PPTX-T003` | Missing slide notes | `https://support.microsoft.com/en-us/office/create-accessible-powerpoint-presentations-6f7772b2-2f33-4bd2-8ca7-dae3b2b3ef25` |
| `PPTX-T004` | Missing presentation language | `https://support.microsoft.com/en-us/office/create-accessible-powerpoint-presentations-6f7772b2-2f33-4bd2-8ca7-dae3b2b3ef25` |

### PDF Rules to Help URLs

Each rule ID, with its issue and help URL.

| Rule ID | Issue | Help URL |
|---------|-------|----------|
| `PDFUA.TaggedPDF` | Document not tagged | `https://helpx.adobe.com/acrobat/using/creating-accessible-pdfs.html#tag_pdf` |
| `PDFUA.Title` | Missing document title | `https://helpx.adobe.com/acrobat/using/creating-accessible-pdfs.html#add_title` |
| `PDFUA.Language` | Missing document language | `https://helpx.adobe.com/acrobat/using/creating-accessible-pdfs.html#set_language` |
| `PDFUA.BookmarksPresent` | Missing bookmarks | `https://helpx.adobe.com/acrobat/using/creating-accessible-pdfs.html#bookmarks` |
| `PDFUA.AltText` | Missing alt text | `https://helpx.adobe.com/acrobat/using/creating-accessible-pdfs.html#alt_text` |
| `PDFUA.TableHeaders` | Missing table headers | `https://helpx.adobe.com/acrobat/using/creating-accessible-pdfs.html#tables` |
| `PDFUA.ReadingOrder` | Incorrect reading order | `https://helpx.adobe.com/acrobat/using/creating-accessible-pdfs.html#reading_order` |
| `PDFUA.Headings` | Heading structure issues | `https://helpx.adobe.com/acrobat/using/creating-accessible-pdfs.html#headings` |
| `PDFUA.ListTags` | Missing list tags | `https://helpx.adobe.com/acrobat/using/creating-accessible-pdfs.html#lists` |
| `PDFBP.Contrast` | Low contrast text | `https://helpx.adobe.com/acrobat/using/creating-accessible-pdfs.html#contrast` |
| `PDFBP.Scanned` | Scanned (image-only) PDF | `https://helpx.adobe.com/acrobat/using/creating-accessible-pdfs.html#scanned` |
| `PDFQ.Searchable` | Text not searchable/selectable | `https://helpx.adobe.com/acrobat/using/creating-accessible-pdfs.html#ocr` |
