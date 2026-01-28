import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ArrowUp, MessageSquare, ChevronsUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import ContactForm from "./ContactForm";
import OptionsList from "./OptionsList";
import styles from "../../index.css?inline";

const STORAGE_KEYS = {
  USER_INFO: "plus_restoration_chat_user_info",
  MESSAGES: "plus_restoration_chat_messages",
  CONVERSATION_ID: "plus_restoration_chat_id",
  LAST_ACTIVITY: "plus_restoration_chat_last_activity",
};

const SESSION_TIMEOUT_MS = 3 * 60 * 60 * 1000; // 3 hours
// const SESSION_TIMEOUT_MS = 5000; // 5 seconds test

const API_BASE = "https://tracking-software.aicumen.cloud";

const WELCOME_MESSAGE = "Welcome to Plus Restoration.";

const ChatWidgetContent = ({
  title = "Chat Support",
  subtitle = "We typically reply within minutes",
  placeholder = "Type your message...",
  formSubtitle = "Please enter your details to begin chatting with us.",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Helper to check if session should be reset
  const isSessionExpired = useCallback(() => {
    const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
    if (!lastActivity) return false;
    return Date.now() - parseInt(lastActivity, 10) > SESSION_TIMEOUT_MS;
  }, []);

  const [conversationId, setConversationId] = useState(() => {
    if (isSessionExpired()) {
      localStorage.removeItem(STORAGE_KEYS.MESSAGES);
      localStorage.removeItem(STORAGE_KEYS.CONVERSATION_ID);
      return null;
    }
    return localStorage.getItem(STORAGE_KEYS.CONVERSATION_ID) || null;
  });

  const [userInfo, setUserInfo] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [messages, setMessages] = useState(() => {
    if (isSessionExpired()) return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const updateActivity = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
  }, []);

  useEffect(() => {
    if (conversationId) {
      localStorage.setItem(STORAGE_KEYS.CONVERSATION_ID, conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    if (userInfo) {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
    }
  }, [userInfo]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, isTyping, scrollToBottom]);

  // Initial conversation start
  useEffect(() => {
    if (isOpen && !conversationId && messages.length === 0 && !isTyping) {
      initiateConversation();
    }
  }, [isOpen, conversationId, messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const callApi = async (path, body, method = "POST", queryParams = {}) => {
    try {
      const url = new URL(`${API_BASE}${path}`);
      Object.keys(queryParams).forEach((key) =>
        url.searchParams.append(key, queryParams[key]),
      );

      const response = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Call failed (${path}):`, error);
      throw error;
    }
  };

  const processAgentResponse = (response) => {
    if (response.conversation_id && !conversationId) {
      setConversationId(response.conversation_id);
    }

    setCurrentResponse(response);

    if (response.ai_message) {
      const botMessage = {
        id: Date.now().toString(),
        text: response.ai_message,
        sender: "bot",
        timestamp: new Date(),
        response_type: response.response_type,
        options: response.options,
        collect_details: response.collect_details,
        data_fields: response.data_fields,
      };
      setMessages((prev) => [...prev, botMessage]);
    }
    updateActivity();
  };

  const initiateConversation = async () => {
    setIsTyping(true);
    try {
      const data = await callApi("/conversation/start");
      processAgentResponse(data);
    } catch (error) {
      const errorMessage = {
        id: Date.now().toString(),
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (textOverride) => {
    const text = textOverride || inputValue.trim();
    if (!text) return;

    if (!textOverride) setInputValue("");

    const userMessage = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    updateActivity();

    try {
      const data = await callApi("/conversation/send", {
        conversation_id: conversationId,
        user_message: {
          role: "user",
          content: text,
        },
      });
      processAgentResponse(data);
    } catch (error) {
      const errorMessage = {
        id: Date.now().toString(),
        text: "Sorry, something went wrong. Let me try that again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = async (data) => {
    setIsTyping(true);
    try {
      // 1. Submit details
      await callApi("/conversation/submit-details", data, "POST", {
        conversation_id: conversationId,
      });

      // 2. Refresh state/userInfo locally
      setUserInfo(data);

      // 3. Send a hidden message to trigger next step if needed, or just wait for next response
      // According to documentation, submit-details is called when frontend collects form data.
      // We might need to send a follow-up or the API might respond with next step.
      // Current API contract for submit-details returns unknown.
      // Let's send a "Details submitted" or similar if the bot doesn't automatically respond.
      // Actually, typically the next message is expected from the user.
      // But if the bot was waiting for form, we should probably trigger the next step.
      await handleSend("Submitted my details");
    } catch (error) {
      console.error("Failed to submit details:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOptionSelect = (option) => {
    handleSend(option);
  };

  const formatTime = (date) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const lastMessage = messages[messages.length - 1];
  const showContactForm =
    lastMessage?.sender === "bot" &&
    (lastMessage.response_type === "contact_form" ||
      lastMessage.response_type === "emergency_form" ||
      lastMessage.collect_details);

  const getOptions = () => {
    if (lastMessage?.sender !== "bot") return null;
    if (lastMessage.response_type === "options") return lastMessage.options;
    if (lastMessage.response_type === "boolean") return ["Yes", "No"];
    return null;
  };

  const options = getOptions();
  const showOptions = !!options;

  return (
    <div
      className={`font-sans antialiased fixed z-[999999] flex flex-col items-end transition-[top,right] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        isOpen ? "top-0 right-0 sm:top-12 sm:right-6" : "top-12 right-6"
      }`}
    >
      <div
        className={`
          relative flex flex-col overflow-hidden
          transition-all duration-700 ease-[cubic-bezier(0.34,1.7,0.64,1)] origin-top-right
          ${
            isOpen
              ? "w-screen h-[100dvh] sm:w-[380px] sm:h-[600px] rounded-none sm:rounded-3xl bg-white shadow-2xl sm:shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-none sm:border sm:border-slate-100/50"
              : "w-[96px] h-[108px] cursor-pointer transition-all duration-500 group/widget"
          }
        `}
      >
        {/* Closed State */}
        <div
          className={`
            flex flex-col items-center justify-center gap-2 transition-all duration-500 z-10
            ${
              isOpen
                ? "opacity-0 scale-50 pointer-events-none absolute inset-0"
                : "opacity-100 scale-100 delay-200 absolute inset-0"
            }
          `}
          onClick={() => !isOpen && setIsOpen(true)}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border border-slate-100 overflow-hidden transition-all duration-500 group-hover/widget:rotate-6 animate-shield-pulse shield-glow">
              <img
                src="/shield-icon.png"
                alt="Support Shield"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
          </div>
          <p className="text-[12px] font-bold text-slate-800 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 whitespace-nowrap transition-transform duration-500 group-hover/widget:-translate-y-0.5">
            Need help?
          </p>
        </div>

        {/* Open State (Chat Window) */}
        {isOpen && (
          <div className="flex flex-col w-full h-full bg-white">
            <div className="p-4 bg-white flex items-center justify-between shrink-0 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center">
                  <img
                    src="/shield-icon.png"
                    alt="Plus Restoration"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <span className="text-lg font-bold text-slate-800">
                  Plus Restoration
                </span>
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

            <div className="flex-1 flex flex-col min-h-0 relative">
              {/* Mesh Blur Overlays */}
              {/* <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent backdrop-blur-[2px] z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent backdrop-blur-[2px] z-10 pointer-events-none" /> */}

              <div className="flex-1 px-5 py-6 overflow-y-auto space-y-4 scroll-smooth custom-scrollbar flex flex-col overscroll-contain scroll-fade-mask">
                {/* Welcome Message (Not in history) */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-md mt-1 overflow-hidden">
                    <img
                      src="/shield-icon.png"
                      alt="Bot"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <div className="p-3.5 px-5 rounded-2xl text-sm leading-relaxed shadow-sm bg-slate-100 text-slate-800 rounded-tl-sm animate-in slide-in-from-bottom-2 fade-in duration-300">
                      <div className="prose prose-sm prose-slate max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {WELCOME_MESSAGE}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {message.sender === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-md mt-1 overflow-hidden">
                        <img
                          src="/shield-icon.png"
                          alt="Bot"
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                    )}
                    <div
                      className={`flex flex-col gap-1 ${message.sender === "user" ? "items-end" : "items-start"} max-w-[80%]`}
                    >
                      <div
                        className={`
                        p-3.5 px-5 rounded-2xl text-sm leading-relaxed shadow-sm animate-in slide-in-from-bottom-2 fade-in duration-300
                        ${
                          message.sender === "user"
                            ? "bg-blue-600 text-white rounded-tr-sm"
                            : "bg-slate-100 text-slate-800 rounded-tl-sm"
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
                      <span className="text-[10px] text-slate-400 px-1">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sender === "bot" &&
                        messages.indexOf(message) === messages.length - 1 &&
                        showOptions && (
                          <div className="mt-2 w-full">
                            <OptionsList
                              options={options}
                              onSelect={handleOptionSelect}
                              disabled={isTyping}
                            />
                          </div>
                        )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-md mt-1 overflow-hidden">
                      <img
                        src="/shield-icon.png"
                        alt="Bot"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div className="flex gap-1.5 p-4 bg-slate-50 w-fit rounded-2xl rounded-tl-sm self-start border border-slate-100">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {showContactForm && (
                <ContactForm
                  onSubmit={handleFormSubmit}
                  data_fields={lastMessage.data_fields || ["name", "email"]}
                  isSubmitting={isTyping}
                  subtitle={formSubtitle}
                />
              )}

              {!showContactForm && (
                <div className="p-4 bg-white border-t border-slate-50">
                  <div
                    className={`flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-1.5 py-1.5 transition-all duration-200 ${!showOptions ? "focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100" : "opacity-75 cursor-not-allowed"}`}
                  >
                    <input
                      type="text"
                      className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400 pl-3 disabled:cursor-not-allowed"
                      placeholder={
                        showOptions
                          ? "Please select an option above"
                          : placeholder
                      }
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={isTyping || showOptions}
                    />
                    <button
                      className="p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300"
                      onClick={() => handleSend()}
                      disabled={!inputValue.trim() || isTyping || showOptions}
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
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
