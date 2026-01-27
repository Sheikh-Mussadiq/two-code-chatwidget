# How It Works

This document explains the technical implementation details of the Plus Restoration Chat Widget.

## Architecture

The widget is built using React and Tailwind CSS, bundled with Vite. It uses a specific architecture to ensure it works reliably on any website without style conflicts.

### Shadow DOM Encapsulation

The most critical feature of this widget is its use of **Shadow DOM**.

Websites often have global CSS styles that can inadvertently affect third-party widgets (e.g., `div { margin: 20px; }`). To prevent this, the widget wraps its entire UI inside a Shadow Root.

In `src/components/widget/ChatWidget.jsx`:

1. A host `div` is rendered.
2. We attach a Shadow Root to this host using `attachShadow({ mode: 'open' })`.
3. We use `createPortal` to render the React component tree _inside_ this Shadow Root.

### Style Injection

Since Shadow DOM isolates styles, global styles don't leak in, but also **external styles don't get in**. This means we need to explicitly inject our styles into the Shadow DOM.

We import the Tailwind CSS file as a raw string using Vite's `?inline` query:

```javascript
import styles from "../../index.css?inline";
```

Then, we create a `CSSStyleSheet`, populate it with the Tailwind styles, and attach it to the Shadow Root:

```javascript
const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(styles);
shadow.adoptedStyleSheets = [styleSheet];
```

This ensures the widget has all its Tailwind utility classes available inside the isolated environment.

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

61. **Welcome Message**: A hardcoded welcome message is displayed at the top of the chat. This message is static and not saved in the message history.
62. **Conversation Initialization**:
    - When opened for the first time, calls `/conversation/start`.
    - The `conversation_id` is stored in `localStorage` for continuity.
63. **Proactive Interaction**:
    - The bot's response dictates the UI behavior.
    - If `response_type` is `options` or `boolean`, the `OptionsList` component renders selectable buttons.
    - **Note**: The user text input is disabled when options are active to ensure a structured conversation flow.
64. **Structured Data Submission**:
    - If `response_type` is `contact_form` or `collect_details` is true, the `ContactForm` renders dynamically based on requested `data_fields`.
    - Forms are submitted to `/conversation/submit-details`.
65. **Messaging**:
    - User messages are sent to `/conversation/send` with the current `conversation_id`.

## Data Persistence & State Management

The widget persists data to maintain state across page reloads:

1. **Conversation ID**: Saved to `localStorage` under `plus_restoration_chat_id`.
2. **User Details**: Saved to `localStorage` under `plus_restoration_chat_user_info`.
3. **Chat History**: All messages (including metadata like `response_type`) are saved to `localStorage` under `plus_restoration_chat_messages`.
4. **Session Timeout**: The widget implements a **3-hour inactivity timeout**. If a user returns after 3 hours since their last activity (sending/receiving a message), the chat history and conversation ID are cleared, and a new session starts automatically.
5. **Closed State**: The widget features a premium shield-style icon in the top-right corner.
   - **Visuals**: Includes a blue glow effect and a 2-second pulse animation for liveliness.
   - **UX Label**: A "Need help?" label is displayed below the shield.
   - **Online Status**: A pulsing green dot indicates active support availability.

## Bundling (UMD)

The widget is bundled as a **Universal Module Definition (UMD)** library.

- **Entry Point**: `src/widget.jsx`
- **Output**: `dist-widget/plus-restoration-chat-widget.umd.js`

When you run `npm run build:widget`:

1. Vite compiles the React code and Tailwind CSS.
2. It creates a single JavaScript file that contains everything (logic + styles).
3. It exposes a global object `PlusRestorationChatWidget` on the `window` object.

This allows users to simply include one `<script>` tag and start using the widget immediately.
