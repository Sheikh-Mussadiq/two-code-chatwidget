import { createRoot } from "react-dom/client";
import ChatWidget from "./components/widget/ChatWidget.jsx";

class Widget {
  static init(options = {}) {
    // Check if widget container already exists
    if (document.getElementById("two-code-chat-widget-container")) {
      return;
    }

    // Create container
    const container = document.createElement("div");
    container.id = "two-code-chat-widget-container";
    document.body.appendChild(container);

    // Render widget
    const root = createRoot(container);
    root.render(<ChatWidget {...options} />);
  }
}

// Expose to window object
if (typeof window !== "undefined") {
  window.TwoCodeChatWidget = Widget;
}

export default Widget;
