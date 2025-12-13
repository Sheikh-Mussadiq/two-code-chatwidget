# Project Structure

This document provides an overview of the folder structure and key files in the Glow Chat Widget project.

## Directory Layout

```text
glow-chat-widget/
├── dist-widget/                # Output directory for the library build (UMD bundle)
├── docs/                       # Documentation files
├── public/                     # Static assets
├── src/                        # Source code
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components (custom minimal versions)
│   │   └── widget/             # Core widget components
│   │       └── ChatWidget.jsx  # Main chat widget UI component
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   ├── pages/                  # Demo pages (Index, NotFound)
│   ├── App.jsx                 # Main App component for Dev mode
│   ├── main.jsx                # Entry point for Dev mode
│   ├── widget.jsx              # Entry point for Library build (UMD)
│   └── index.css               # Global styles and Tailwind directives
├── eslint.config.js            # ESLint configuration
├── jsconfig.json               # JavaScript configuration for IDE support
├── package.json                # Project dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
└── vite.config.js              # Vite build configuration
```

## Key Files

### `src/widget.jsx`

The entry point for the standalone widget library. It handles:

- Checking if the widget container exists.
- Creating the container in the DOM.
- Mounting the React application (`ChatWidget`) into the container.
- Exposing the `TwoCodeChatWidget` global object for initialization.

### `src/components/widget/ChatWidget.jsx`

The core React component for the chat interface. It:

- Uses Shadow DOM to encapsulate styles and prevent conflicts with the host page.
- Injects Tailwind styles directly into the Shadow DOM.
- Manages chat state (open/close, messages, form data).

### `vite.config.js`

Configuration for Vite. It handles two build modes:

1.  **Serve/Dev**: Standard React app build for local development.
2.  **Library Build**: Bundles `src/widget.jsx` into a single UMD file (`dist-widget/two-code-chat-widget.umd.js`) for external use.

### `tailwind.config.js`

Tailwind CSS configuration. It scans `.js` and `.jsx` files for utility classes and includes the `tailwindcss-animate` plugin.
