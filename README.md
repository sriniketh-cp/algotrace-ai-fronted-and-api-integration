# AlgoTrace AI

> An interactive Python execution tracer that helps students and developers understand algorithms one step at a time—with visualized variables, execution timelines, complexity analysis, and AI-powered guidance.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ESM-F7DF1E?logo=javascript&logoColor=111827)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

AlgoTrace AI is the frontend for an educational algorithm-tracing application. Write or select a Python program, send it to the tracing API, and inspect how the code executes through an interactive editor and visual timeline.

## Features

### Interactive execution tracing

- Edit Python code in a Monaco-powered editor.
- Run code against the configured tracing backend.
- Capture execution events, line numbers, function calls, returns, and runtime errors.
- Configure the maximum number of recorded steps, up to 50.

### Visual debugging

- View local variables at every execution step.
- Visualize arrays, scalar values, and generated series such as Fibonacci sequences.
- Highlight the active source line in the editor.
- Browse the complete execution timeline.
- Navigate to the first, previous, next, or final step.
- Play, pause, reset, and control trace playback speed.

### AI-assisted learning

When a Groq API key is configured, AlgoTrace AI provides:

- **Complexity analysis** — estimates time and space complexity.
- **Step explanations** — explains variable changes in plain English.
- **Code optimization** — provides interview-style, no-built-in-function optimization and standard Pythonic optimization.
- **Edge-case generation** — creates targeted stress tests and boundary cases.
- **Crash analysis** — explains runtime errors and suggests fixed code.
- **AlgoTutor** — a context-aware conversational tutor that can answer questions about the current code and execution trace.

### Responsive interface

The application includes a two-pane desktop layout and mobile editor/trace panel switching for smaller screens.

## Architecture

```text
src/
├── App.jsx                 # Main application state and user interactions
├── main.jsx                # React entry point
├── components/             # Visualizers, modals, banners, and tutor drawer
├── services/
│   └── aiService.js        # Groq-powered AI integrations
├── utils/                  # Examples, styles, playback speeds, and constants
├── App.css                 # Application-specific styles
└── index.css               # Global styles and design tokens
```

The frontend communicates with two external services:

1. **Tracing API** — receives Python source code at `POST /trace` and returns execution steps.
2. **Groq API** — provides optional AI analysis directly from the browser when a Groq key is configured.

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- A running AlgoTrace-compatible tracing backend
- Optional: a [Groq API key](https://console.groq.com/keys) for AI features

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/sriniketh-cp/algotrace-ai-fronted-and-api-integration.git
cd algotrace-ai-fronted-and-api-integration
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# URL of the AlgoTrace tracing backend
VITE_API_URL=http://localhost:8000

# Optional: enables AI-powered features
VITE_GROQ_API_KEY=your_groq_api_key
```

> `VITE_` variables are exposed to the browser by Vite. Do not use a privileged or production-secret API key in a publicly deployed frontend without adding an appropriate server-side proxy.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

## Backend API contract

The frontend expects the tracing backend to expose a `POST /trace` endpoint.

### Request

```json
{
  "code": "arr = [5, 2, 4]\nprint(arr)",
  "max_steps": 50
}
```

### Response

The response should include an execution step list. A typical response shape is:

```json
{
  "steps": [
    {
      "step": 1,
      "line": 1,
      "event": "line",
      "variables": {
        "arr": [5, 2, 4]
      }
    }
  ],
  "truncated": false,
  "timed_out": false,
  "error": null
}
```

Each step should provide at least `line`, `event`, and `variables`. The interface also uses `step` when displaying timeline positions.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint across the project. |

## Production build

```bash
npm run build
npm run preview
```

For deployment, publish the generated `dist/` directory using a static hosting provider such as GitHub Pages, Netlify, Vercel, or Cloudflare Pages. Configure `VITE_API_URL` and, if needed, `VITE_GROQ_API_KEY` in the hosting provider's environment settings before building.

## Usage workflow

1. Select an included example or choose **Custom**.
2. Write or modify Python code in the editor.
3. Set the maximum number of trace steps.
4. Select **Run Trace**.
5. Inspect the active line, variables, and timeline.
6. Use playback controls to move through the execution.
7. If configured, use the AI tools to analyze complexity, explain steps, generate edge cases, optimize code, or ask AlgoTutor questions.

## Security notes

- The tracing backend should execute submitted Python in an isolated sandbox with resource limits.
- Never execute untrusted Python directly on a production host without sandboxing.
- Treat `VITE_GROQ_API_KEY` as a browser-exposed credential. For production applications, route AI requests through a secure backend instead.
- Configure CORS on the tracing API to allow requests from the deployed frontend origin.

## Contributing

Contributions are welcome. To propose a change:

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-change
   ```
3. Install dependencies and make your changes.
4. Run the checks:
   ```bash
   npm run lint
   npm run build
   ```
5. Commit your work and open a pull request with a clear description.

## License

No license has been specified for this repository yet. Until a license is added, assume that the source code is not available for unrestricted redistribution or commercial use.

## Acknowledgements

- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Lucide React](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Groq](https://groq.com/)
