// File: src/App.jsx
import { useEffect, useRef, useState } from "react";
import "./App.css";
import Logo from './assets/images/logo.jpg';     // Relative path to logo.jpg
import User from './assets/images/user.png'; // Relative path to download.jpeg';


const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDUIQEFPC34RFlMEDwmCt5nDpmrN5oL7Zg";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState("dark_mode");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const savedChats = localStorage.getItem("saved-chats");
    const savedTheme = localStorage.getItem("themeColor") || "dark_mode";

    if (savedChats) setMessages(JSON.parse(savedChats));
    setTheme(savedTheme);
    document.body.classList.toggle("light_mode", savedTheme === "light_mode");
  }, []);

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages]);

  const toggleTheme = () => {
    const newTheme = theme === "light_mode" ? "dark_mode" : "light_mode";
    setTheme(newTheme);
    document.body.classList.toggle("light_mode", newTheme === "light_mode");
    localStorage.setItem("themeColor", newTheme);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return; // Prevent submit while loading

    const newMessages = [
      ...messages,
      { type: "outgoing", text: input }
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true); // Set loading

    // Add loading message with "... loading"
    const loadingMessage = { type: "incoming", text: "... loading", loading: true };
    setMessages([...newMessages, loadingMessage]);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: input }] }],
        }),
      });

      const data = await res.json();
      const responseText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/\*\*(.*?)\*\*/g, "$1") || "No response.";

      // Add a delay to show loading animation
      setTimeout(() => {
        const updated = [...newMessages, { type: "incoming", text: responseText }];
        setMessages(updated);
        localStorage.setItem("saved-chats", JSON.stringify(updated));
        setIsLoading(false); // Done loading
      }, 1000); // 1 second delay
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { type: "incoming", text: "Error fetching response." }]);
      setIsLoading(false); // Done loading
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setMessages([]);
    localStorage.removeItem("saved-chats");
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleSuggestionClick = (text) => {
    setInput(text);
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Hello, there</h1>
        <p className="subtitle">How can I help you today?</p>

        <ul className="suggestion-list">
          {[
            "Help me plan a game night with my 5 best friends for under $100.",
            "What are the best tips to improve my public speaking skills?",
            "Can you help me find the latest news on web development?",
            "Write JavaScript code to sum all elements in an array."
          ].map((text, i) => (
            <li key={i} className="suggestion" onClick={() => handleSuggestionClick(text)}>
              <h4 className="text">{text}</h4>
              <span className="icon material-symbols-rounded">draw</span>
            </li>
          ))}
        </ul>
      </header>

      <div className="chat-list" ref={chatContainerRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.type} ${msg.loading ? "loading" : ""}`}>
            <div className="message-content">
                <img
                className="avatar"
                src={msg.type === "incoming" ? Logo : User}
                alt={msg.type === "incoming" ? "AI Avatar" : "User Avatar"}
              />
              <p className="text">{msg.text}</p>
              {msg.loading && (
                <div className="loading-indicator">
                  <div className="loading-bar"></div>
                  <div className="loading-bar"></div>
                  <div className="loading-bar"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Custom Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete All Chats?</h3>
            <p>Are you sure you want to delete all the chats?</p>
            <div className="modal-actions">
              <button className="modal-btn yes" onClick={confirmDelete}>Yes</button>
              <button className="modal-btn no" onClick={cancelDelete}>No</button>
            </div>
          </div>
        </div>
      )}
      <div className="typing-area" style={{ marginBottom: "48px" }}>
        <form onSubmit={handleSubmit} className="typing-form">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Enter a prompt here"
              className="typing-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
              disabled={isLoading} // Disable input while loading
            />
            {/* Prompt icon styled like the theme toggle */}
            <span className="icon material-symbols-rounded" style={{ marginRight: "8px", alignSelf: "center" }}>
              chat_bubble
            </span>
            <button
              type="submit"
              id="send-message-button"
              className="icon material-symbols-rounded"
              disabled={!input.trim() || isLoading} // Disable button while loading
            >
              send
            </button>
          </div>
          <div className="action-buttons">
            <span onClick={toggleTheme} className="icon material-symbols-rounded">
              {theme === "light_mode" ? "dark_mode" : "light_mode"}
            </span>
            <span onClick={handleDelete} className="icon material-symbols-rounded">delete</span>
          </div>
        </form>
      </div>
      {/* Glassmorphism Footer */}
      <footer
        style={{
          width: "100%",
          position: "fixed",
          bottom: 0,
          left: 0,
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px 0", // Increased padding for more space
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: "0 2px 16px 0 rgba(0,0,0,0.08)",
          fontSize: "15px",
          color: theme === "light_mode" ? "#222" : "#fff"
        }}
      >
        Developed by{" "}
        <a
          href="https://www.linkedin.com/in/mohamed-afshan-ashath-048692283/"
          target="_blank"
          rel="noopener noreferrer"
          className="disclaimer-link"
          style={{
            color: "#0072b1",
            marginLeft: "6px",
            textDecoration: "underline",
            fontWeight: 500
          }}
        >
          Mohamed Afshan
        </a>
      </footer>
    </div>
  );
}

export default App;
