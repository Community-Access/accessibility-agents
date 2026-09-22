# web-component-specialist — Web Component Accessibility Specialist

> Audits web components (custom elements, Shadow DOM) for accessibility. Covers ElementInternals API, cross-shadow ARIA delegation, slot-based composition, form-associated custom elements, and shadow DOM focus management.

## Features

- Audits `ElementInternals` usage for accessible name, role, and state on custom elements
- Detects broken ARIA references across shadow DOM boundaries
- Reviews slot-based composition for correct accessible tree structure
- Validates form-associated custom elements for label association and form participation
- Checks shadow DOM focus management including `delegatesFocus`
- Supports Lit, Stencil, FAST, and vanilla custom elements

## When to Use It

- Building or reviewing custom elements that need ARIA semantics
- Debugging ARIA references that do not work across shadow DOM boundaries
- Ensuring form-associated custom elements participate correctly in form validation
- Auditing focus behavior inside shadow roots (tab order, focus trapping, delegation)
- Reviewing slot projections to confirm they produce a correct accessibility tree

## How It Works

1. **Component detection** - Identifies custom element definitions and their shadow DOM mode (open/closed)
2. **ElementInternals audit** - Checks whether components use `attachInternals()` for role, name, and state
3. **ARIA delegation audit** - Verifies cross-shadow ARIA references use `ARIAMixin` or `ElementInternals` instead of broken `id` references
4. **Slot audit** - Reviews projected content for correct ordering in the accessibility tree
5. **Form audit** - Validates `formAssociated`, `formStateRestoreCallback`, and label association
6. **Focus audit** - Checks `delegatesFocus`, `tabindex` handling, and keyboard interaction within shadow roots

## Handoffs

Each direction, with its agent and when.

| Direction | Agent | When |
|-----------|-------|------|
| Receives from | accessibility-lead | When custom elements are detected during a web audit |
| Hands off to | accessibility-lead | When general web accessibility concerns are found outside the component |
| Hands off to | aria-specialist | When complex ARIA patterns in custom elements need deeper review |
| Hands off to | keyboard-navigator | When shadow DOM focus management needs detailed keyboard testing |

## Sample Usage

```text
@web-component-specialist Audit this custom dropdown component for shadow DOM accessibility

@web-component-specialist Check if our Lit-based form controls use ElementInternals correctly

@web-component-specialist Review ARIA delegation in our design system's custom elements
```

## Related

- [accessibility-lead](./accessibility-lead.md) - Coordinates full web accessibility audits
- [aria-specialist](./aria-specialist.md) - Deep ARIA pattern expertise for complex widget roles
- [keyboard-navigator](./keyboard-navigator.md) - Focus management and keyboard interaction auditing
- [forms-specialist](./forms-specialist.md) - Form accessibility, complementary for form-associated custom elements
