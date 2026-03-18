# WireframeDSL — UI-as-Code Wireframing Tool

A browser-based tool for creating UI wireframes using a structured YAML DSL. Write DSL on the left, see a live preview on the right.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd <project-folder>

# Install dependencies
npm install
# or
bun install
```

### Running Locally

```bash
npm run dev
# or
bun dev
```

The app will be available at **http://localhost:8082**.

## Features

- **Monaco Editor** — Full-featured YAML code editor with syntax highlighting
- **Structured JSON Mode** — Switch between WireframeDSL (YAML) and JSON
- **Live Preview** — Real-time rendering of your DSL as UI components
- **Wireframe Mode** — Low-fidelity sketch style for early prototyping
- **UI Mode** — High-fidelity styled output using Tailwind/shadcn
- **Validation Console** — Instant feedback on YAML syntax and schema errors
- **Examples Catalog** — Browse `/examples` with many built-in templates and component combinations
- **Persistent Templates** — Create, update, delete, and publish templates stored on disk in `storage/templates.json`
- **Copy AST** — Export the parsed JSON AST to clipboard

## DSL Reference

The DSL is written in YAML. Every document starts with a root `window` component.

### Basic Structure

```yaml
component: window
title: My App
children:
  - component: text
    content: Hello World
```

### Supported Components

| Component    | Key Props                                      |
| ------------ | ---------------------------------------------- |
| `window`     | `title`, `children`                            |
| `row`        | `gap`, `children`                              |
| `column`     | `gap`, `children`                              |
| `grid`       | `columns`, `gap`, `children`                   |
| `card`       | `title`, `children`                            |
| `tabs`       | `tabs` (array of `{ label, children }`)        |
| `modal`      | `title`, `open`, `children`                    |
| `table`      | `columns`, `rows`                              |
| `input`      | `label`, `placeholder`, `type`                 |
| `textarea`   | `label`, `placeholder`                         |
| `select`     | `label`, `options`                             |
| `checkbox`   | `label`, `checked`                             |
| `button`     | `label`, `variant` (`primary`/`secondary`/`danger`) |
| `label`      | `text`                                         |
| `text`       | `content`                                      |

### Example — Login Form

```yaml
component: window
title: Login
children:
  - component: card
    title: Sign In
    children:
      - component: input
        label: Email
        placeholder: you@example.com
        type: email
      - component: input
        label: Password
        placeholder: "••••••••"
        type: password
      - component: row
        gap: 8
        children:
          - component: button
            label: Log In
            variant: primary
          - component: button
            label: Cancel
            variant: secondary
```

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — Dev server & build
- **Monaco Editor** — Code editing
- **Tailwind CSS** + **shadcn/ui** — Styling
- **js-yaml** — YAML parsing
- **Zod** — Schema validation

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start dev server         |
| `npm run build` | Production build         |
| `npm test`      | Run tests with Vitest    |

## License

MIT
