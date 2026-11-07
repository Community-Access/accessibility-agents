# Alt Text and Headings reference: Logo Alt Text

Part of the `alt-text-headings` skill. Read this only when the task reaches these sections.

## Logo Alt Text

Logo images should have alt text that identifies the company/organization, not describe the logo:

```html
<!-- GOOD -->
<a href="/"><img src="logo.svg" alt="Acme Corporation"></a>

<!-- BAD: describes appearance -->
<a href="/"><img src="logo.svg" alt="Blue circle with white A"></a>

<!-- BAD: redundant "logo" -->
<a href="/"><img src="logo.svg" alt="Acme Corporation logo"></a>

<!-- BAD: states the obvious -->
<a href="/"><img src="logo.svg" alt="Home page"></a>
```

When the logo is a link (usually to the home page), the alt text should identify the company. Screen readers already announce "link" so "home page" is unnecessary. If the logo is purely decorative (not a link, company name is visible nearby), use `alt=""`.
