# How It Works

This document explains the technical implementation details of the TwoCode Chat Widget.

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

## API Integration

The widget communicates with a streaming AI endpoint:

- **Endpoint**: `https://tracking-software.aicumen.cloud/ai/chat`
- **Method**: `POST`
- **Streaming**: Uses `ReadableStream` to process Server-Sent Events (SSE) / NDJSON.
- **Payload**: Sends the full conversation history and user details (Name, Email, Phone) with each request.
- **Response**: Updates the bot's message in real-time as chunks arrive (`response.output_text.delta`).

## Data Persistence & State Management

The widget persists user data to maintain state across page reloads:

1. **User Details**: Name, Email, and Phone are saved to `localStorage` under `twocode_chat_user_info`.
2. **Chat History**: All messages are saved to `localStorage` under `twocode_chat_messages`.
3. **Closed State**: The widget pill displays dynamic content:
   - If no chat history: Shows the configured `formSubtitle`.
   - If chat exists: Shows the last message sent or received.

## Bundling (UMD)

The widget is bundled as a **Universal Module Definition (UMD)** library.

- **Entry Point**: `src/widget.jsx`
- **Output**: `dist-widget/two-code-chat-widget.umd.js`

When you run `npm run build:widget`:

1. Vite compiles the React code and Tailwind CSS.
2. It creates a single JavaScript file that contains everything (logic + styles).
3. It exposes a global object `TwoCodeChatWidget` on the `window` object.

This allows users to simply include one `<script>` tag and start using the widget immediately.
