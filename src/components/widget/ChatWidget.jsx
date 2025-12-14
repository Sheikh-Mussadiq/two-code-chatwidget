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
import styles from "../../index.css?inline";

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
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });
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
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

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

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const errors = { name: "", email: "", phone: "" };

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    setFormErrors(errors);

    if (!errors.name && !errors.email && !errors.phone) {
      const newUserInfo = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };
      setUserInfo(newUserInfo);

      const initialMessage = {
        id: Date.now().toString(),
        text: `Hi ${formData.name.trim()}! ${welcomeMessage}`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
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

            {!userInfo ? (
              /* Pre-chat Form */
              <form
                className="flex-1 p-6 flex flex-col min-h-0 overflow-y-auto overscroll-contain scroll-fade-mask"
                onSubmit={handleFormSubmit}
              >
                <h4 className="text-lg font-semibold text-slate-800">
                  {formTitle}
                </h4>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  {formSubtitle}
                </p>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="chat-name"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="chat-name"
                        type="text"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className={`
                        w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none
                        focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100
                        ${
                          formErrors.name
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }
                      `}
                      />
                    </div>
                    {formErrors.name && (
                      <div className="text-xs text-red-500 mt-1">
                        {formErrors.name}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="chat-email"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="chat-email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className={`
                        w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none
                        focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100
                        ${
                          formErrors.email
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }
                      `}
                      />
                    </div>
                    {formErrors.email && (
                      <div className="text-xs text-red-500 mt-1">
                        {formErrors.email}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="chat-phone"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="chat-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className={`
                        w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none
                        focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100
                        ${
                          formErrors.phone
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }
                      `}
                      />
                    </div>
                    {formErrors.phone && (
                      <div className="text-xs text-red-500 mt-1">
                        {formErrors.phone}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 cursor-pointer border-none"
                >
                  Start Chat
                </button>
              </form>
            ) : (
              /* Chat Content */
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
                      {message.text}
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

                {/* <div className="text-center py-2 text-[10px] text-slate-400 bg-slate-50/50 border-t border-slate-100">
                Powered by Your Company
              </div> */}
              </div>
            )}
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
