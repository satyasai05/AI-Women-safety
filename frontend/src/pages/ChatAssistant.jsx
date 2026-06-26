import { useRef, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { chatApi } from "../api/api";

const suggestions = [
  "Someone is following me",
  "How to stay safe at night",
  "Report a suspicious person",
  "Find nearby police station",
];

const ChatAssistant = () => {
  const [messages, setMessages] = useState([{ from: "bot", text: "Hi there! How can I help you stay safe today?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) {
      return;
    }

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatApi.send(input);
      setMessages((prev) => [...prev, { from: "bot", text: response.data.response }]);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Chat failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (value) => {
    setInput(value);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="rounded-[32px] bg-white/80 p-8 shadow-glass backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Chat Assistant</h2>
            <p className="mt-2 text-slate-600">Ask the AI for safety advice and get guided responses instantly.</p>
          </div>
          <div className="rounded-3xl bg-purple-50 px-5 py-3 text-sm font-semibold text-purple-800">
            Instant safety support
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] bg-slate-50 p-6 shadow-inner">
            <div className="mb-4 flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button
                  key={item}
                  onClick={() => handleSuggestion(item)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-primary hover:text-primary"
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="mb-6 max-h-[520px] space-y-4 overflow-y-auto pr-3">
              {messages.map((msg, index) => (
                <div key={index} className={`rounded-3xl p-4 ${msg.from === "user" ? "bg-primary text-white self-end" : "bg-white text-slate-700"}`}>
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="rounded-3xl bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#5b21c0] disabled:opacity-60"
              >
                {loading ? "Typing..." : "Send"}
              </button>
            </div>
          </div>
          <div className="rounded-[32px] bg-slate-50 p-6 shadow-inner">
            <h3 className="text-xl font-semibold text-slate-900">Safety Tips</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Stay in well-lit, populated areas.</li>
              <li>Share your location with trusted contacts.</li>
              <li>Avoid isolated shortcuts when possible.</li>
              <li>Use the SOS button immediately if threatened.</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatAssistant;
