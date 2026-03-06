---
name: review-mobile
description: Mobile accessibility specialist for React Native, Expo, iOS, and Android. Audits accessibilityLabel, accessibilityRole, touch targets, screen reader compatibility.
mode: agent
agent: mobile-accessibility
tools:
  - askQuestions
  - readFile
  - editFiles
---

# Mobile Accessibility Review

Review React Native, Expo, iOS (SwiftUI/UIKit), or Android (Jetpack Compose/Views) for mobile accessibility compliance.

## Platform

**Code to review:** `${input:files}`

## Instructions

### Step 1: Identify Platform and Framework

Ask the user:

1. **Platform** -- React Native, Expo, iOS (Swift), Android (Kotlin/Java)?
2. **Screen reader** -- TalkBack (Android), VoiceOver (iOS), both?
3. **Components** -- Buttons, touchables, forms, navigation, custom gestures?
4. **Known issues** -- Elements not announced, double-tap not working?

### Step 2: Check Accessibility Props (React Native/Expo)

**Every touchable element needs:**
- `accessibilityLabel` -- Descriptive label ("Submit form" not "Button")
- `accessibilityRole` -- "button", "link", "header", "text", etc.
- `accessibilityHint` -- Additional context ("Opens settings screen")
- `accessible={true}` -- Marks as accessibility element

**Touch targets:**
- Minimum 44x44pt (iOS) or 48x48dp (Android)
- Use `hitSlop` to expand touchable area if visual is smaller

Check: `mobile-accessibility` skill for full prop reference

### Step 3: Check iOS-Specific (Swift)

**UIKit:**
- `isAccessibilityElement = true`
- `accessibilityLabel = "Submit form"`
- `accessibilityTraits = .button`

**SwiftUI:**
- `.accessibilityLabel("Submit form")`
- `.accessibilityAddTraits(.isButton)`
- `.accessibilityHint("Opens settings")`

### Step 4: Check Android-Specific (Kotlin/Java)

**Views API:**
```kotlin
button.contentDescription = "Submit form"
button.importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_YES
```

**Jetpack Compose:**
```kotlin
Button(
    onClick = {},
    modifier = Modifier.semantics {
        contentDescription = "Submit form"
        role = Role.Button
    }
) {}
```

### Step 5: Check Common Issues

1. **Images as buttons** -- Must have accessibilityRole="button" + label
2. **Icon-only buttons** -- Must have label even if visual is just icon
3. **State changes** -- "Selected" announced with accessibilityState
4. **Dynamic content** -- Use accessibilityLiveRegion (Android) or UIAccessibility.post (iOS)
5. **Custom gestures** -- Document with accessibilityHint

### Step 6: Provide Remediation

For each issue:
- WCAG criterion (often 4.1.2 Name, Role, Value)
- Platform-specific fix (React Native, iOS, Android)
- Code example showing correct props
- Screen reader testing instructions

## Expected Output

- Mobile accessibility prop audit
- Touch target size verification
- Screen reader compatibility assessment
- Platform-specific code fixes
- Testing guide for TalkBack/VoiceOver
