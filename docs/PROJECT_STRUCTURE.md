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
│   │       ├── ChatWidget.jsx  # Main chat widget UI component
│   │       ├── ContactForm.jsx  # Dynamic contact form
│   │       └── OptionsList.jsx  # Selectable options/buttons
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
- Exposing the `PlusRestorationChatWidget` global object for initialization.

### `src/components/widget/ChatWidget.jsx`

The core React component for the chat interface. It:

- Uses Shadow DOM to encapsulate styles and prevent conflicts with the host page.
- Injects Tailwind styles directly into the Shadow DOM.
- Manages chat state (open/close, messages, form data).

## API Integration (V2)

The widget uses a structured conversation API (V2):

- **Base URL**: `https://tracking-software.aicumen.cloud`
- **Endpoints**:
  - `POST /conversation/start`: Starts a new conversation and returns an `AgentResponse`.
  - `POST /conversation/send`: Sends a user message and returns the next `AgentResponse`.
  - `POST /conversation/submit-details`: Submits collected form data (Name, Email, etc.).
- **Structured Responses**: The API returns an `AgentResponse` object with:
  - `ai_message`: Text content.
  - `response_type`: One of `text`, `options`, `boolean`, `contact_form`, `emergency_form`.
  - `options`/`data_fields`: Context-specific data for interactive elements.
  - `conversation_id`: Unique identifier for the session.

## User Flow (V2)

1. **Conversation Initialization**:
   - When opened for the first time, calls `/conversation/start`.
   - The `conversation_id` is stored in `localStorage` for continuity.
2. **Proactive Interaction**:
   - The bot's response dictates the UI behavior.
   - If `response_type` is `options` or `boolean`, the `OptionsList` component renders selectable buttons.
   - If `response_type` is `contact_form` or `collect_details` is true, the `ContactForm` renders dynamically based on requested `data_fields`.
3. **Structured Data Submission**:
   - Forms are submitted to `/conversation/submit-details`.
   - After submission, the widget automatically transitions back to chat mode.
4. **Messaging**:
   - User messages are sent to `/conversation/send` with the current `conversation_id`.

## Data Persistence & State Management

The widget persists data to maintain state across page reloads:

1. **Conversation ID**: Saved to `localStorage` under `plus_restoration_chat_id`.
2. **User Details**: Saved to `localStorage` under `plus_restoration_chat_user_info`.
3. **Chat History**: All messages (including metadata like `response_type`) are saved to `localStorage` under `plus_restoration_chat_messages`.

### `vite.config.js`

Configuration for Vite. It handles two build modes:

1.  **Serve/Dev**: Standard React app build for local development.
2.  **Library Build**: Bundles `src/widget.jsx` into a single UMD file (`dist-widget/plus-restoration-chat-widget.umd.js`) for external use.

### `tailwind.config.js`

Tailwind CSS configuration. It scans `.js` and `.jsx` files for utility classes and includes the `tailwindcss-animate` plugin.
