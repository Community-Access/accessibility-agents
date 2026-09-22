# Alt Text and Headings reference: Image Analysis Workflow

Part of the `alt-text-headings` skill. Read this only when the task reaches these sections.

## Image Analysis Workflow

When you encounter images in the codebase, follow this workflow:

### VS Code 1.113 Image Workflow

VS Code 1.113 continues the native image-file reading support introduced in 1.112 via the `chat.imageSupport.enabled` setting. This enhances your image analysis capabilities:

**Enable image support:**

```json
{
  "chat.imageSupport.enabled": true,
  "imageCarousel.explorerContextMenu.enabled": true
}
```

**What this enables:**

- **Direct image reading:** Read local image files from disk without downloading or converting
- **Image carousel:** When multiple images are involved, view them in a dedicated carousel UI
- **Agent output images:** Screenshots from the integrated browser appear as selectable images in chat
- **Explorer context menu:** Right-click image files or folders > "Open Images in Carousel" for batch review

**Enhanced workflow with 1.113:**

1. Ask the user to enable `chat.imageSupport.enabled` if not already set
2. Read images directly using the file system tools
3. Images appear inline in the chat for visual comparison
4. Use the carousel view for reviewing multiple images at once
5. Compare existing alt text against what you see in the image

### Step 1: Find All Images

Search the codebase for image references:

- `<img>` tags in HTML/JSX
- Background images in CSS
- `<svg>` elements
- `<video>` and `<source>` elements
- Image imports in JavaScript/TypeScript
- Images referenced in markdown

### Step 2: Retrieve the Image

Images can be local or remote. Handle both:

**Local images** (relative paths like `./images/hero.png` or `src/assets/logo.svg`):

- Read the file directly from the workspace

**Remote images** (URLs like `https://cdn.example.com/banner.jpg`):

- Fetch the image so you can analyze it. Use the terminal to download it:

```bash
curl -sL "https://cdn.example.com/banner.jpg" -o /tmp/a11y-review-banner.jpg
```

- On Windows:

```powershell
Invoke-WebRequest -Uri "https://cdn.example.com/banner.jpg" -OutFile "$env:TEMP\a11y-review-banner.jpg"
```

- Then read the downloaded file for visual analysis
- Clean up temporary files when done
- If the URL is dynamic or templated (e.g., `src={user.avatarUrl}`), note that the image cannot be analyzed at build time and flag it for manual review

**Data URIs** (`src="data:image/png;base64,..."`):

- These are inline -- read and analyze directly

### Step 3: Analyze Each Image

For each image you can access:

1. **Look at the image** -- Use your vision capabilities to examine what the image actually contains
2. **Read the existing alt text** -- Check what `alt`, `aria-label`, or `aria-labelledby` text is provided
3. **Evaluate the context** -- Look at surrounding HTML/text to understand the image's role on the page
4. **Compare and assess** -- Does the alt text accurately describe what the image communicates in its context?

### Step 3: Rate the Alt Text Quality

For each image, assign a quality rating:

| Rating | Meaning | Action |
|--------|---------|--------|
| **Good** | Alt text accurately describes the image's purpose in context | No change needed |
| **Inaccurate** | Alt text exists but does not match the image content or misrepresents it | Suggest corrected text |
| **Incomplete** | Alt text partially describes the image but misses important information | Suggest enhanced text |
| **Generic** | Alt text is vague ("image", "photo", "icon") and adds no value | Suggest specific text |
| **Missing** | No alt attribute present | Ask about purpose, then suggest text |
| **Incorrect type** | Image is decorative but has descriptive alt, or meaningful but has empty alt | Suggest correct approach |

### Step 4: Generate Suggestions

When suggesting alt text, provide 2-3 options at different levels of detail:

```text
Image: hero-banner.jpg
Current alt: "banner"
Rating: Generic

I can see this image shows a diverse group of developers collaborating around a whiteboard 
covered in wireframe sketches, in a modern open-plan office with natural lighting.

Suggested alternatives:
1. Brief: "Development team collaborating on wireframe designs"
2. Descriptive: "Five developers gathered around a whiteboard sketching UI wireframes in an open office"
3. Contextual (for an "About Us" page): "Our development team during a design sprint, collaborating on product wireframes"

Which best fits the purpose of this image on your page, or would you like something different?
```

### Step 5: Ask Questions When Context Is Ambiguous

When you cannot determine the image's purpose from context alone, ask the user. Key questions to consider:

1. **Purpose**: "Is this image decorative (purely visual) or does it convey information the user needs?"
2. **Context**: "What is this image's role on the page? Is it illustrating a concept, showing a product, or purely aesthetic?"
3. **Audience**: "Would a screen reader user miss important information if this image were removed entirely?"
4. **Action**: "Does this image link somewhere or trigger an action? If so, what is the destination or action?"
5. **Data**: "This appears to be a chart/graph. Can you confirm what data it represents so I can write an accurate description?"
6. **Identity**: "This appears to show a person. Should the alt text identify them by name and role?"

Format your questions to help the user understand WHY you're asking:

```text
I found 3 images that need alt text. To write the best alternatives, I need some context:

1. "decorative-bg.svg" -- This looks like an abstract geometric pattern. 
   Is this purely decorative, or does the pattern convey meaning (like a brand identity element)?
   -> If decorative, I'll set alt="" and aria-hidden="true"
   -> If meaningful, I'll describe the pattern

2. "team-member.jpg" -- This shows a person at a desk. 
   Who is this person? Should I identify them by name?
   -> Example: "Alex Rivera, Senior Engineer" vs "Team member working at their desk"

3. "metrics-chart.png" -- This is a line chart with multiple data series.
   What data does this represent? I can see the axes but need confirmation on what the lines mean.
   -> I'll write a complete data description once I know the context
```

## Alt Text Comparison Report

When auditing a page or component, produce a structured report:

```text
## Alt Text Audit Report

###  Good Alt Text
- hero-image.jpg: "Customer support agent helping a client via video call" -- Accurate, descriptive, matches context

###  Needs Improvement
- product-photo.png: Current: "product" -> Suggested: "Wireless noise-canceling headphones in midnight blue, shown from front angle"
- team.jpg: Current: "team photo" -> Suggested: "The 12-person engineering team at the 2025 summer offsite"

###  Missing Alt Text
- banner.webp: No alt attribute. [Asking user about purpose...]
- icon-set.svg: No accessible name. Appears decorative -> Recommending: alt="" aria-hidden="true"

###  Wrong Category
- divider-line.png: Has alt="decorative line divider" but is purely decorative -> Change to: alt=""
```

## W3C Image Categories

The W3C WAI Images Tutorial defines seven image categories. Identifying the category determines the correct alt text approach:

| Category | Purpose | Alt Text Approach |
|----------|---------|-------------------|
| **Informative** | Conveys information (photos, illustrations) | Describe the content concisely |
| **Decorative** | Visual embellishment only | `alt=""` (empty string) |
| **Functional** | Inside a link or button | Describe the action/destination, not the image |
| **Text images** | Contain readable text | Alt text = the text in the image |
| **Complex** | Charts, diagrams, infographics | Short alt + long description |
| **Groups** | Multiple images forming a single concept | One image gets full alt, others get `alt=""` |
| **Image maps** | Clickable regions within an image | Each `<area>` gets its own `alt` |

**Context determines category:** The same image of a phone could be informative ("Samsung Galaxy S24"), functional ("Buy Samsung Galaxy S24"), or decorative (background lifestyle photo) depending on its role on the page.
