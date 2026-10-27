# System Planner

A local workbench for game system specifications, UI layouts, mind maps, and interaction prototypes. The interface is currently in Chinese. AI integration is not included.

## Quick start

1. Download this repository as a ZIP and extract it.
2. Double-click **`index.html` in the root folder** and open it with Chrome or Edge.
3. Start a new project, or open the included `.sysplan` example.

The root `index.html` is the **only runnable HTML entry point**. It bundles the editor, styles, Mermaid, and a starter example. Daily use requires no installation, Node.js, server, or internet connection. On Windows, `启动工具.cmd` is an optional shortcut to the same file.

To try the interaction demo, click **打开交互使用示例** at the bottom left, then **交互预览** at the top right. Save your current project before switching examples.

## Features

- **UI canvas:** multiple pages, image upload/drop/paste, frames, rectangles, text, pen, stroke eraser, undo and redo.
- **Layout tools:** marquee selection, groups, locking, snapping, alignment, equal spacing, resize, zoom, pan, duplication, and layer ordering.
- **Page states:** copy a page into independent variants; edit appearance, layout, visibility, disabled controls, rules, and state notes.
- **Interaction preview:** page navigation, overlays, closing overlays, back navigation, and state changes. Preview does not modify the design.
- **Components:** phone frames, buttons, cards, dialogs, input boxes, and notification dots.
- **Effect illustrations:** pulse, glow, float, and shake. SVG and HTML exports retain visual effects; print output is static.
- **Mind maps:** child and sibling topics, renaming, dragging, reparenting, and automatic layout.
- **Mermaid:** editable diagram source, flowchart/state/sequence templates, local rendering, and SVG export.
- **System specifications:** guided sections, control rules, state descriptions, and checks for missing information based on the bundled game-system-spec workflow snapshot.
- **Handoff exports:** HTML documents, Markdown, and SVG. Print the HTML document to PDF using your browser.

## Saving your work

Drafts are automatically stored in the current browser using IndexedDB. Use **保存项目文件** or **Ctrl+S** to download a portable `.sysplan` project, including its images. Use **打开项目** to load it again.

Save a project file before moving `index.html`, switching browsers or computers, or clearing browser data. Browser drafts are not a substitute for backups. Downloads go to the location selected by your browser. Undo history lasts only for the current session. Use one editing window per draft.

## Layout and state behavior

- Marquee selection includes fully enclosed, visible, unlocked objects.
- Click a group member to select the group. Hold Alt to select an individual member or temporarily ignore snapping.
- Alignment and spacing treat each group as one unit. Equal spacing requires at least three objects or groups.
- Locking prevents editing and deletion; it does not disable preview interactions.
- Page states are independent full-page snapshots. Later edits do not automatically propagate between states.
- Hidden controls appear faded in the editor and are omitted from previews and canvas exports. Disabled controls do not execute preview actions.
- Each click executes one configured action. Exported handoff HTML is a document; clickable interaction previews run inside the workbench.

## Keyboard shortcuts

| Action | Shortcut |
|---|---|
| Select / marquee / frame / rectangle / text | V / M / F / R / T |
| Pen / eraser / pan | P / E / H |
| Temporary pan | Hold Space and drag |
| Group / ungroup | Ctrl+G / Ctrl+Shift+G |
| Undo / redo | Ctrl+Z / Ctrl+Shift+Z |
| Save project file | Ctrl+S |
| Duplicate / copy / paste | Ctrl+D / Ctrl+C / Ctrl+V |
| Delete | Delete |
| Move selection | Arrow keys; Shift for 10 pixels |
| Mind-map child / sibling | Tab / Enter |

## Repository structure

The repository contains the editable source directly. There is no source ZIP to unpack.

```text
index.html                       # Only standalone entry point
README.md
public/
  workbench.template.html        # Development template
  app.js
  model.js
  studio-model.js
  storage.js
  styles.css
  vendor/
    mermaid.min.js                # Offline Mermaid bundle
    LICENSE
examples/                        # Editable .sysplan examples
references/                      # Planning workflow and verification notes
build-standalone.mjs
server.cjs
package.json
```

`启动工具.cmd` is an optional Windows shortcut to the root HTML file. The interaction example is available in `examples/` and from the editor's example button.

Local drafts, logs, and test exports are excluded by `.gitignore`. Keep your own `data/` and `exports/` folders when updating an existing checkout.

## Development

Use Node.js 22 or later. No dependency installation is required for the repository.

```sh
npm test
npm run build
```

The build reads `public/workbench.template.html` and updates only the root `index.html`. If `data/project.json` exists, its content becomes the initial project embedded in the generated file; otherwise, the build uses the supplied example. Use the example when preparing a public distribution.

For optional development-server mode:

```sh
npm start
```

Open `http://127.0.0.1:4317/`. Both `/` and `/index.html` serve the development template without creating another file named `index.html`. This mode saves to `data/` and exports to `exports/`; its storage is separate from standalone browser drafts.

## Current limitations

No AI chat, native XMind import/export, multiplayer collaboration, nested groups, component auto-layout, native DOCX output, or effect timeline editor. Frames are independent objects; group them with their contents to move everything together. The eraser removes entire pen strokes, not image pixels. Interaction previews do not evaluate conditional expressions, chained actions, or real game backend data.

The planning guide is a bundled workflow snapshot dated 2026-09-24. It does not call a language model, interpret images, generate rules, or detect semantic contradictions automatically. A desktop window at least 1100 pixels wide is recommended; narrow windows hide the property panel.

## Third-party component

Mermaid is bundled for offline diagram rendering. Its license is provided in `public/vendor/LICENSE`; version metadata is in `references/mermaid-package.json`.

