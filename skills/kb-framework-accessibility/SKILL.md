---
name: kb-framework-accessibility
description: Reference data, not a reviewer. Framework-specific accessibility patterns and fix templates for React, Vue, Angular, Svelte, Next.js, and Tailwind CSS.
license: MIT
disable-model-invocation: true
user-invocable: false
metadata:
  tier: reference
  domain: cross-cutting
  output: none
  effort: low
  title: Framework Accessibility
---

## Framework-Specific Accessibility Patterns

## React / Next.js

### Common Pitfalls

Each pattern, with its issue and fix.

| Pattern | Issue | Fix |
|---------|-------|-----|
| `onClick` on `<div>` | Not keyboard accessible | Use `<button>` or add `role="button"`, `tabIndex={0}`, `onKeyDown` |
| `dangerouslySetInnerHTML` | May inject inaccessible content | Audit injected HTML for ARIA, headings, alt text |
| `React.Fragment` as root | May break landmark tree | Ensure fragments don't interrupt landmark nesting |
| Missing `key` on lists | Can cause focus loss on re-render | Use stable keys (not array index) for interactive lists |
| Portal without focus trap | Focus can escape to background | Wrap portal content in `FocusTrap` component |
| `useEffect` focus management | Focus may not fire on mount | Use `useRef` + `useEffect` with proper dependency array |

### Fix Templates

```jsx
// Bad: div as button
<div onClick={handleClick}>Submit</div>

// Good: semantic button
<button onClick={handleClick}>Submit</button>

// Bad: image without alt in Next.js
<Image src="/hero.jpg" width={800} height={400} />

// Good: image with alt
<Image src="/hero.jpg" width={800} height={400} alt="Team collaborating in a modern office" />

// Bad: no focus management on route change
useEffect(() => {
  // nothing
}, [location]);

// Good: focus management on route change
useEffect(() => {
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.focus();
    mainContent.scrollIntoView();
  }
}, [location]);

// Bad: link opening new tab
<a href={url} target="_blank">Resource</a>

// Good: link with new tab warning
<a href={url} target="_blank" rel="noopener noreferrer">
  Resource <span className="sr-only">(opens in new tab)</span>
</a>
```

## Vue

### Common Pitfalls

Each pattern, with its issue and fix.

| Pattern | Issue | Fix |
|---------|-------|-----|
| `v-html` with user content | May inject inaccessible markup | Sanitize and audit injected HTML |
| `v-if` on live regions | Removes element from DOM, breaks announcements | Use `v-show` for live regions instead |
| `<transition>` without focus | Focus lost when content transitions | Manage focus in `@after-enter` hook |
| `<teleport>` to body | Content outside app landmark tree | Add landmark roles to teleported content |

### Fix Templates

```vue
<!-- Bad: v-if on live region -->
<div v-if="message" aria-live="polite">{{ message }}</div>

<!-- Good: v-show keeps element in DOM -->
<div v-show="message" aria-live="polite">{{ message }}</div>

<!-- Bad: no focus after transition -->
<transition name="fade">
  <div v-if="showModal" class="modal">...</div>
</transition>

<!-- Good: focus managed after transition -->
<transition name="fade" @after-enter="focusModal">
  <div v-if="showModal" ref="modal" class="modal" tabindex="-1">...</div>
</transition>
```

## Angular

### Common Pitfalls

Each pattern, with its issue and fix.

| Pattern | Issue | Fix |
|---------|-------|-----|
| `[aria-label]` binding before Angular 20.2 | Those versions require the `attr.` prefix (current docs allow `[aria-label]`) | Use `[attr.aria-label]`, which works in every version |
| `@for` without a stable `track` (or legacy `*ngFor` without `trackBy`) | Focus loss on list re-render | `@for (item of items; track item.id)`; `NgFor` is deprecated since v20 |
| No `LiveAnnouncer` | Route changes not announced | Inject `LiveAnnouncer` and announce navigation |
| `OnPush` + live regions | Change detection may not trigger | Use `ChangeDetectorRef.markForCheck()` |

### Fix Templates

```typescript
// Bad before Angular 20.2: plain property binding
<button [aria-label]="label">X</button>

// Good in every version: ARIA attribute binding
<button [attr.aria-label]="label">X</button>

// Bad: tracking by index (nodes are reused by position, so focus stays on a node whose item changed)
@for (item of items; track $index) { <li>{{ item.name }}</li> }

// Good: track a stable identity
@for (item of items; track item.id) { <li>{{ item.name }}</li> }

// Route change announcements
constructor(private liveAnnouncer: LiveAnnouncer, private router: Router) {
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe((event: NavigationEnd) => {
    this.liveAnnouncer.announce(`Navigated to ${this.getPageTitle()}`);
  });
}
```

## Svelte

### Common Pitfalls

Each pattern, with its issue and fix.

| Pattern | Issue | Fix |
|---------|-------|-----|
| `{#if}` without focus management | Focus lost when content appears | Use `use:action` to focus new content |
| `transition:` without motion check | Animations play regardless of user preference | Add `prefers-reduced-motion` check |
| `onclick` (Svelte 4: `on:click`) on non-interactive | Not keyboard accessible | Use `<button>` or add keyboard handlers |

### Fix Templates

```svelte
<!-- Bad: click on div -->
<div onclick={toggle}>Toggle</div>

<!-- Good: keyboard accessible -->
<button onclick={toggle}>Toggle</button>

<!-- Bad: animation without motion preference -->
<div transition:fly={{ y: 200 }}>Content</div>

<!-- Good: respects motion preference (Svelte 5.7+) -->
<script>
  import { prefersReducedMotion } from 'svelte/motion';
</script>

<div transition:fly={{ y: prefersReducedMotion.current ? 0 : 200, duration: prefersReducedMotion.current ? 0 : 300 }}>Content</div>
```

## Tailwind CSS

### Common Pitfalls

Each pattern, with its issue and fix.

| Pattern | Issue | Fix |
|---------|-------|-----|
| `outline-none` (v4) or `outline-hidden` | Removes focus indicator; in v4 `outline-none` also removes it in forced-colors mode | Use `outline-hidden` (v4), paired with `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500` |
| `text-gray-400` on `bg-white` | Fails 4.5:1 contrast | Use `text-gray-600` or darker |
| No `motion-reduce:` variant | Animations ignore user preference | Add `motion-reduce:transition-none` |
| Missing `focus:` styles | No visible focus indicator | Add `focus:ring-2 focus:ring-blue-500` |
| `sr-only` missing | Screen reader text not available | Add `<span class="sr-only">description</span>` |

### Contrast-Safe Tailwind Pairs

Each background, with a passing text color and its ratio. Ratios are for the Tailwind v4 default palette (OKLCH converted to sRGB; red-600 and green-700 sit outside sRGB, so those are approximate). `text-gray-500` (about 4.8:1) is the lightest gray that passes 4.5:1 on white.

| Background | Text | Ratio |
|-----------|-------------|-------|
| `bg-white` | `text-gray-600` | 7.56:1 |
| `bg-white` | `text-gray-700` | 10.31:1 |
| `bg-gray-50` | `text-gray-700` | 9.87:1 |
| `bg-gray-900` | `text-gray-300` | 12.06:1 |
| `bg-blue-600` | `text-white` | about 5.3:1 |
| `bg-red-600` | `text-white` | about 4.8:1 |
| `bg-green-700` | `text-white` | 4.94:1 |

### Fix Templates

```html
<!-- Bad: no focus indicator -->
<button class="bg-blue-500 text-white px-4 py-2 rounded outline-none">
  Submit
</button>

<!-- Good: visible focus indicator -->
<button class="bg-blue-500 text-white px-4 py-2 rounded focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
  Submit
</button>

<!-- Bad: low contrast -->
<p class="text-gray-400">Important information</p>

<!-- Good: adequate contrast -->
<p class="text-gray-700">Important information</p>

<!-- Bad: animation without motion preference -->
<div class="transition-transform duration-300 hover:scale-105">Card</div>

<!-- Good: respects motion preference -->
<div class="transition-transform duration-300 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100">Card</div>
```
