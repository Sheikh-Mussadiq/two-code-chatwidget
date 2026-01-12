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
  USER_INFO: "twocode_chat_user_info",
  MESSAGES: "twocode_chat_messages",
  CONVERSATION_ID: "twocode_chat_id",
  LAST_ACTIVITY: "twocode_chat_last_activity",
};

const SESSION_TIMEOUT_MS = 3 * 60 * 60 * 1000; // 3 hours
// const SESSION_TIMEOUT_MS = 5000; // 5 seconds test

const API_BASE = "https://tracking-software.aicumen.cloud";

const WELCOME_MESSAGE = "Hello! 👋 How can I help you today?";

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
        url.searchParams.append(key, queryParams[key])
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
        {/* Closed State */}
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
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center relative shrink-0">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h3 className="text-sm font-semibold text-slate-900 leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500 truncate">
              {messages.length > 0
                ? messages[messages.length - 1].text
                : subtitle}
              {/* // : WELCOME_MESSAGE */}
            </p>
          </div>
          <ChevronsUp className="w-5 h-5 text-slate-400" />
        </div>

        {/* Open State (Chat Window) */}
        {isOpen && (
          <div className="flex flex-col w-full h-full bg-white">
            <div className="p-5 bg-white flex items-center gap-4 shrink-0 border-b border-slate-50">
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

            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 px-5 py-6 overflow-y-auto space-y-4 scroll-smooth custom-scrollbar flex flex-col overscroll-contain">
                {/* Welcome Message (Not in history) */}
                <div className="flex flex-col gap-1">
                  <div className="max-w-[85%] p-3.5 px-5 rounded-2xl text-sm leading-relaxed shadow-sm self-start bg-slate-100 text-slate-800 rounded-tl-sm animate-in slide-in-from-bottom-2 fade-in duration-300">
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

                {messages.map((message) => (
                  <div key={message.id} className="flex flex-col gap-1">
                    <div
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
                    {message.sender === "bot" &&
                      messages.indexOf(message) === messages.length - 1 &&
                      showOptions && (
                        <OptionsList
                          options={options}
                          onSelect={handleOptionSelect}
                          disabled={isTyping}
                        />
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
