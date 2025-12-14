import ChatWidget from "@/components/widget/ChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Demo Header */}
      {/* <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-800 text-lg">
              ChatWidget
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
            >
              Features
            </a>
            <a
              href="#demo"
              className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
            >
              Demo
            </a>
            <a
              href="#embed"
              className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
            >
              Embed
            </a>
          </nav>
        </div>
      </header> */}

      {/* Hero Section */}
      {/* <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Demo Active
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Beautiful Chat Widget
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-900">
              for Your Website
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            A modern, minimal, and fully customizable chat widget with Shadow
            DOM encapsulation. Perfect for customer support and engagement.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5">
              Get Started
            </button>
            <button className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
              View Documentation
            </button>
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      {/* <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
          Key Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              ),
              title: "Shadow DOM",
              description:
                "Fully encapsulated styles that won't conflict with your existing CSS.",
            },
            {
              icon: (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              ),
              title: "Smooth Animations",
              description:
                "Delightful micro-interactions and transitions for a premium feel.",
            },
            {
              icon: (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              ),
              title: "Fully Responsive",
              description:
                "Works beautifully on all devices, from mobile to desktop.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-slate-900 flex items-center justify-center text-slate-600 group-hover:text-white transition-colors mb-5">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section> */}

      {/* Documentation Section */}
      {/* <section id="embed" className="max-w-6xl mx-auto px-6 py-20">
        <div className="space-y-12"> */}
      {/* Quick Start */}
      {/* <div className="bg-slate-900 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Quick Start
            </h2>
            <p className="text-slate-400 text-center mb-8 max-w-2xl mx-auto">
              Get up and running in less than a minute. Simply copy and paste
              the code below before your closing &lt;/body&gt; tag.
            </p>
            <div className="bg-slate-800 rounded-xl p-6 overflow-x-auto">
              <pre className="text-sm text-slate-300 font-mono">
                {`<!-- 1. Add the widget script -->
<script src="https://your-domain.com/two-code-chat-widget.umd.js"></script>

<!-- 2. Initialize the widget -->
<script>
  TwoCodeChatWidget.init({
    title: "Chat Support",
    subtitle: "We typically reply within minutes",
    welcomeMessage: "Hello! 👋 How can I help you today?",
    primaryColor: "#0f172a"
  });
</script>`}
              </pre>
            </div>
          </div> */}

      {/* Configuration Options */}
      {/* <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Configuration Options
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-4 font-semibold text-slate-700">
                        Option
                      </th>
                      <th className="p-4 font-semibold text-slate-700">Type</th>
                      <th className="p-4 font-semibold text-slate-700">
                        Default
                      </th>
                      <th className="p-4 font-semibold text-slate-700">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono text-sm text-purple-600">
                        title
                      </td>
                      <td className="p-4 text-sm text-slate-600">string</td>
                      <td className="p-4 text-sm text-slate-500">
                        "Chat Support"
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        The main title displayed in the widget header.
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono text-sm text-purple-600">
                        subtitle
                      </td>
                      <td className="p-4 text-sm text-slate-600">string</td>
                      <td className="p-4 text-sm text-slate-500">
                        "We typically..."
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        Subtitle text below the main title.
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono text-sm text-purple-600">
                        welcomeMessage
                      </td>
                      <td className="p-4 text-sm text-slate-600">string</td>
                      <td className="p-4 text-sm text-slate-500">
                        "Hello! 👋..."
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        Initial message from the bot when chat starts.
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono text-sm text-purple-600">
                        placeholder
                      </td>
                      <td className="p-4 text-sm text-slate-600">string</td>
                      <td className="p-4 text-sm text-slate-500">
                        "Type your..."
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        Placeholder text for the message input.
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono text-sm text-purple-600">
                        formTitle
                      </td>
                      <td className="p-4 text-sm text-slate-600">string</td>
                      <td className="p-4 text-sm text-slate-500">
                        "Start a conversation"
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        Title for the pre-chat form.
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono text-sm text-purple-600">
                        formSubtitle
                      </td>
                      <td className="p-4 text-sm text-slate-600">string</td>
                      <td className="p-4 text-sm text-slate-500">
                        "Please enter..."
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        Subtitle/instructions for the pre-chat form.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      {/* <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-slate-500 text-sm">
          Chat Widget Demo • Click the chat button in the corner to try it out
        </div>
      </footer> */}

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto my-12 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">
          Chat Widget Demo
        </h1>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-8">
          <p className="text-blue-800 mb-2">
            This is a demo page showing the TwoCode Chat Widget in action. The
            widget is loaded at the bottom right of the page.
          </p>
          <p className="text-blue-700 font-medium">
            You can interact with the widget by clicking on the chat icon.
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">
              About This Demo
            </h2>
            <p className="text-slate-600 leading-relaxed">
              This page demonstrates how to integrate the TwoCode Chat Widget
              into a webpage. The widget is loaded as a UMD module and
              initialized with default settings.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              Configuration
            </h3>
            <p className="text-slate-600 mb-4">
              The widget is initialized with the following settings:
            </p>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 overflow-x-auto">
              <pre className="text-sm text-slate-800 font-mono">
                <code className="block whitespace-pre overflow-x-auto">
                  {`TwoCodeChatWidget.init({
  title: "Chat Support",
  subtitle: "We're here to help!",
  welcomeMessage: "Hello! 👋 How can I help you today?",
  placeholder: "Type your message...",
  formTitle: "Start a conversation",
  formSubtitle: "Please enter your details to begin chatting with us."
});`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
      {/* The actual widget */}
      <ChatWidget
        title="Chat Support"
        subtitle="We typically reply within minutes"
        welcomeMessage="Hello! 👋 How can I help you today?"
        placeholder="Type your message..."
      />
    </div>
  );
};

export default Index;
