---
name: audit-native-app
description: Accessibility audit for React Native, Expo, iOS, or Android native applications. Routes to mobile-accessibility agent for platform-specific scanning.
mode: agent
agent: mobile-accessibility
tools:
  - askQuestions
  - readFile
  - editFiles
  - listDirectory
---

# Native App Accessibility Audit

Run a comprehensive accessibility audit on a mobile/native application.

## App to Audit

**Path:** `${input:appDir}`

## Instructions

### Step 1: Detect Platform

Scan the project to determine:
- **React Native / Expo** — look for `react-native` in package.json, `app.json`/`app.config.js`
- **iOS (UIKit/SwiftUI)** — look for `.xcodeproj`, `.swift`, `.storyboard` files
- **Android (Jetpack Compose / Views)** — look for `build.gradle`, `.kt`, `.java` files

### Step 2: Run Platform-Specific Audit

**React Native / Expo:**
- Check `accessible={true}` on interactive elements
- Verify `accessibilityLabel` — present, non-redundant, no "button" suffix
- Verify `accessibilityRole` — correct role for element type
- Check `accessibilityHint` — explains result of action when not obvious
- Verify `accessibilityState` — disabled, selected, checked, busy, expanded
- Check touch target sizes — minimum 44x44dp (iOS) / 48x48dp (Android)
- Verify `importantForAccessibility` usage on decorative elements
- Check gesture alternatives — every swipe must have a button alternative
- Verify focus order in scrollable lists (FlatList/SectionList)

**iOS:**
- Check `isAccessibilityElement`, `accessibilityLabel`, `accessibilityTraits`
- Verify Dynamic Type support
- Check VoiceOver navigation order

**Android:**
- Check `contentDescription`, `semantics {}` modifiers
- Verify touch target sizes (48x48dp minimum)
- Check TalkBack navigation

### Step 3: Report

Generate findings with:
- Platform and framework version
- Per-screen or per-component findings
- Severity scoring (Critical/Serious/Moderate/Minor)
- Platform-specific remediation code
- Testing instructions (how to verify with VoiceOver/TalkBack)
