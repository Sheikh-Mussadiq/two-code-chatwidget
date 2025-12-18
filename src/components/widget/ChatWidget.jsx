import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ArrowUp,
  MessageSquare,
  ChevronsUp,
  User,
  Mail,
  Phone,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import ContactForm from "./ContactForm";
import styles from "../../index.css?inline";

// const preprocessMarkdown = (text) => {
//   if (!text) return text;

//   let processed = text;

//   // Fix pattern: "- **Text- **" -> "- **Text**\n- **"
//   // This handles list items that are missing closing ** and newlines
//   processed = processed.replace(/- \*\*([^*\n]+?)- \*\*/g, "- **$1**\n- **");

//   // Fix pattern: "Text- **" at the start of what should be a new list item
//   // Add newline before "- **" when preceded by text without newline
//   processed = processed.replace(/([^\n])- \*\*/g, "$1\n- **");

//   // Fix: Detect last list item followed by regular sentence (no bullet)
//   // Pattern: "**LastItemText" followed by "If ", "Please ", "For ", "Let ", "Feel ", etc.
//   processed = processed.replace(
//     /\*\*([^*\n]+?)(If |Please |For |Let |Feel |Would |Should |Could |Can |Do |Have |Is |Are |Was |Were |This |That |The |A |An |We |You |I |Our |Your |My )/g,
//     "**$1**\n\n$2"
//   );

//   // Ensure bold markers are properly closed before newlines or end of string
//   processed = processed.replace(
//     /\*\*([^*\n]+?)(\n|$)/g,
//     (match, content, ending) => {
//       if (!content.trim().endsWith("**")) {
//         return `**${content.trim()}**${ending}`;
//       }
//       return match;
//     }
//   );

//   return processed;
// };

const STORAGE_KEYS = {
  USER_INFO: "twocode_chat_user_info",
  MESSAGES: "twocode_chat_messages",
};

const API_ENDPOINT = "https://tracking-software.aicumen.cloud/ai/chat";

const ChatWidgetContent = ({
  title = "Chat Support",
  subtitle = "We typically reply within minutes",
  placeholder = "Type your message...",
  welcomeMessage = "Hello! 👋 How can I help you today?",
  formTitle = "Start a conversation",
  formSubtitle = "Please enter your details to begin chatting with us.",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // Removed duplicated userInfo state declaration

  const [userInfo, setUserInfo] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  // Removed internal form state in favor of ContactForm component
  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialResponseComplete, setIsInitialResponseComplete] = useState(
    () => messages.length > 0
  );
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (userInfo) {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
    }
  }, [userInfo]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Initial greeting effect
  useEffect(() => {
    if (isOpen && messages.length === 0 && !isTyping) {
      initiateConversation();
    }
  }, [isOpen, messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const initiateConversation = async () => {
    setIsTyping(true);
    const botMessageId = (Date.now() + 1).toString();

    try {
      // Send hidden "Hello" message
      // We pass empty user details as requested
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_details: {
            email: "",
            name: "",
            phone_number: "",
          },
          messages: [{ role: "user", content: "Hello" }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsTyping(false);

      const botMessage = {
        id: botMessageId,
        text: "",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split("\n");
        // Keep the last potentially incomplete line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const parsed = JSON.parse(line);
            if (
              parsed.event === "response.output_text.delta" &&
              parsed.content
            ) {
              accumulatedText += parsed.content;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMessageId
                    ? { ...msg, text: accumulatedText }
                    : msg
                )
              );
            }
          } catch {
            console.warn("Skipping malformed JSON line in stream:", line);
          }
        }
      }

      setIsInitialResponseComplete(true);
    } catch (error) {
      setIsTyping(false);
      setIsInitialResponseComplete(true); // Ensure form shows even on error
      console.error("Failed to initiate conversation:", error);
    }
  };

  const buildChatHistory = (currentMessages) => {
    return currentMessages
      .filter((msg) => msg.sender === "user" || msg.sender === "bot")
      .map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));
  };

  const handleFormSubmit = async (data) => {
    setUserInfo(data);

    // Send user details to AI for a personalized response
    setIsTyping(true);
    const botMessageId = (Date.now() + 1).toString();

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_details: {
            email: data.email,
            name: data.name,
            phone_number: data.phone,
          },
          messages: buildChatHistory(messages),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsTyping(false);

      const botMessage = {
        id: botMessageId,
        text: "",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const parsed = JSON.parse(line);
            if (
              parsed.event === "response.output_text.delta" &&
              parsed.content
            ) {
              accumulatedText += parsed.content;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMessageId
                    ? { ...msg, text: accumulatedText }
                    : msg
                )
              );
            }
          } catch {
            console.warn("Skipping malformed JSON line in stream:", line);
          }
        }
      }
    } catch (error) {
      setIsTyping(false);
      console.error("Failed to get AI response:", error);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !userInfo) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    const chatHistory = buildChatHistory(updatedMessages);

    const botMessageId = (Date.now() + 1).toString();

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_details: {
            email: userInfo.email,
            name: userInfo.name,
            phone_number: userInfo.phone || "",
          },
          messages: chatHistory,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsTyping(false);

      const botMessage = {
        id: botMessageId,
        text: "",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (
              parsed.event === "response.output_text.delta" &&
              parsed.content
            ) {
              accumulatedText += parsed.content;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMessageId
                    ? { ...msg, text: accumulatedText }
                    : msg
                )
              );
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } catch (error) {
      setIsTyping(false);
      if (error.name !== "AbortError") {
        const errorMessage = {
          id: botMessageId,
          text: "Sorry, something went wrong. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`font-sans antialiased fixed z-[999999] flex flex-col items-end transition-[bottom,right] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        isOpen ? "bottom-0 right-0 sm:bottom-6 sm:right-6" : "bottom-6 right-6"
      }`}
    >
      <div
        className={`
          relative flex flex-col overflow-hidden
          transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom-right
          ${
            isOpen
              ? "w-screen h-[100dvh] sm:w-[360px] sm:h-[520px] rounded-none sm:rounded-3xl bg-white shadow-none sm:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-none sm:border sm:border-slate-100"
              : "w-[300px] h-[58px] rounded-full bg-white shadow-lg shadow-slate-200/50 cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl border border-slate-100"
          }
        `}
      >
        {/* Closed State (Pill/Button) */}
        <div
          className={`
            absolute inset-0 flex items-center px-2 gap-4 transition-all duration-300 z-10
            ${
              isOpen
                ? "opacity-0 scale-90 pointer-events-none"
                : "opacity-100 scale-100 delay-100"
            }
          `}
          onClick={() => !isOpen && setIsOpen(true)}
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center relative shrink-0">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
          </div>

          {/* Text Info */}
          <div className="flex-1 min-w-0 text-left">
            <h3 className="text-sm font-semibold text-slate-900 leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500 truncate">
              {userInfo
                ? messages.length > 0
                  ? messages[messages.length - 1].text
                  : "Continue conversation"
                : formSubtitle}
            </p>
          </div>

          {/* Expand Icon */}
          <ChevronsUp className="w-5 h-5 text-slate-400" />
        </div>

        {/* Open State (Chat Window) */}
        {isOpen && (
          <div className="flex flex-col w-full h-full bg-white">
            {/* Header */}
            <div className="p-5 bg-white flex items-center gap-4 shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center relative shrink-0">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-900 leading-tight truncate">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 truncate">{subtitle}</p>
              </div>
              <button
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors duration-200 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 px-5 py-6 overflow-y-auto space-y-3 scroll-smooth custom-scrollbar flex flex-col overscroll-contain scroll-fade-mask">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`
                    max-w-[85%] p-3.5 px-5 rounded-2xl text-sm leading-relaxed shadow-sm animate-in slide-in-from-bottom-2 fade-in duration-300
                    ${
                      message.sender === "user"
                        ? "self-end bg-blue-600 text-white rounded-tr-sm"
                        : "self-start bg-slate-100 text-slate-800 rounded-tl-sm"
                    }
                  `}
                  >
                    {message.sender === "bot" ? (
                      <div className="prose prose-sm prose-slate max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {message.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      message.text
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-1.5 p-4 bg-slate-50 w-fit rounded-2xl rounded-tl-sm self-start border border-slate-100">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {!userInfo && isInitialResponseComplete ? (
                <ContactForm
                  onSubmit={handleFormSubmit}
                  subtitle="Please fill in your details so we can help you better."
                />
              ) : userInfo ? (
                <div className="p-4 bg-white">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-1.5 py-1.5 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
                    <input
                      type="text"
                      className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400 pl-3"
                      placeholder={placeholder}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                    />
                    <button
                      className="p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300"
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : null}

              {/* <div className="text-center py-2 text-[10px] text-slate-400 bg-slate-50/50 border-t border-slate-100">
              Powered by Your Company
            </div> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Shadow DOM wrapper component
export const ChatWidget = (props) => {
  const hostRef = useRef(null);
  const [shadowRoot, setShadowRoot] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (hostRef.current && !shadowRoot) {
      const shadow = hostRef.current.attachShadow({ mode: "open" });

      // Inject Tailwind styles
      const styleSheet = new CSSStyleSheet();
      styleSheet.replaceSync(styles);
      shadow.adoptedStyleSheets = [styleSheet];

      setShadowRoot(shadow);

      // Small delay to ensure styles are applied before rendering
      requestAnimationFrame(() => {
        setIsReady(true);
      });
    }
  }, [shadowRoot]);

  return (
    <div ref={hostRef} className="glow-chat-widget-host">
      {shadowRoot &&
        isReady &&
        createPortal(<ChatWidgetContent {...props} />, shadowRoot)}
    </div>
  );
};

export default ChatWidget;
