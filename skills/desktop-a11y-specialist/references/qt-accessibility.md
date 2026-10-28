# Qt Widgets accessibility

Read this when the scope holds Qt Widgets code: `.ui` files from Qt Designer,
or C++ or Python (PyQt, PySide) that builds `QWidget` subclasses. Qt Quick and
QML are out of scope here.

## Where a widget's accessible name comes from

Qt's accessibility layer computes the name in this order. It is the same in Qt
5.15 and Qt 6 (`QAccessibleWidget::text` and the per-widget overrides in
`qtbase/src/widgets/accessible/`).

1. `accessibleName`, when it is set.
2. The widget's own visible text, for widgets that have one: a button's
   `text`, a check box or radio button label, a group box title.
3. A window's title, for top-level windows.
4. Otherwise, a buddy label: the text of a `QLabel` whose `buddy` is this
   widget and that has the same parent widget, with the `&` mnemonic stripped.
   If the parent is a `QGroupBox`, its title is used instead.

Two properties never become the name:

- `toolTip` becomes the accessible **Description**, not the Name.
- A `QLineEdit`'s `placeholderText` also becomes the Description, and only
  when there is no other description.

NVDA reads the Description, so an icon-only button that has only a tooltip,
or a line edit that has only a placeholder, can sound named in an NVDA spot
check. Its Name is still empty. Tools and features that read the Name, such as
Accessibility Insights, Narrator and speech input, find nothing to use. Do not
treat an NVDA pass as proof that a widget has a name.

## What to check

- **Every interactive widget has a name** from one of the four sources above.
  Report a widget with none as WCAG 4.1.2 Name, Role, Value.
- **Icon-only `QPushButton` and `QToolButton`** fail most often. A `toolTip` is
  good to have, but the fix is `accessibleName` (or visible text). Severity is
  serious: the control cannot be identified.
- **Line edits named only by a placeholder** need a buddy label or an
  `accessibleName`. The placeholder disappears when the user types. This
  matches the web rule that a placeholder is not a label.
- **Buddy labels** name the field only when the label and the field share a
  parent widget. A label in a different container leaves the field unnamed; set
  `accessibleName` or move the label. A buddy also gives the field its keyboard
  mnemonic, so check the label text has an `&` for one.
- **Names set in code** (`setAccessibleName(...)` in the dialog's source rather
  than in the `.ui` file) count for the widget they are called on. Match the
  call to the widget's `objectName` in the same dialog's `.ui` file before you
  clear a finding; the same `objectName` in another dialog is a different
  widget.
- **`focusPolicy` set to `Qt::NoFocus`** on an interactive widget is a WCAG
  2.1.1 Keyboard finding, unless the widget is a read-only display that the
  user never needs to reach. Record the exceptions you accept so a re-audit
  does not raise them again.
- **Tab order**: every `<tabstop>` in a `.ui` file names a widget that exists
  in that file, and the order follows the visual layout (WCAG 2.4.3 Focus
  Order).

## Examples

A `.ui` fragment where each widget gets its name from a source Qt uses:

```xml
<widget class="QLabel" name="searchLabel">
  <property name="text"><string>&amp;Search:</string></property>
  <property name="buddy"><cstring>searchField</cstring></property>
</widget>
<widget class="QLineEdit" name="searchField">
  <property name="placeholderText"><string>Title or user name</string></property>
</widget>
<widget class="QToolButton" name="copyButton">
  <property name="accessibleName"><string>Copy password</string></property>
  <property name="toolTip"><string>Copy password</string></property>
</widget>
```

The same in C++:

```cpp
searchLabel->setBuddy(searchField);          // names searchField, adds Alt+S
copyButton->setAccessibleName(tr("Copy password"));
copyButton->setToolTip(tr("Copy password")); // description, for sighted users too
```

## Sources

- [Qt accessibility overview](https://doc.qt.io/qt-6/accessible.html)
- [`qaccessiblewidget.cpp`, Name and Description](https://github.com/qt/qtbase/blob/dev/src/widgets/accessible/qaccessiblewidget.cpp)
- [`simplewidgets.cpp`, buttons and line edits](https://github.com/qt/qtbase/blob/dev/src/widgets/accessible/simplewidgets.cpp)

Based on a contribution by [@chrisnestrud](https://github.com/chrisnestrud)
([#218](https://github.com/Community-Access/accessibility-agents/pull/218)),
checked against the qtbase source.
