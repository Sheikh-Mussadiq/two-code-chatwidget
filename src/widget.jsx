import { createRoot } from "react-dom/client";
import ChatWidget from "./components/widget/ChatWidget.jsx";

class Widget {
  static init(options = {}) {
    // Check if widget container already exists
    if (document.getElementById("plus-restoration-chat-widget-container")) {
      return;
    }

    // Create container
    const container = document.createElement("div");
    container.id = "plus-restoration-chat-widget-container";
    document.body.appendChild(container);

    // Render widget
    const root = createRoot(container);
    root.render(<ChatWidget {...options} />);
  }
}

// Expose to window object
if (typeof window !== "undefined") {
  window.PlusRestorationChatWidget = Widget;
}

export default Widget;
