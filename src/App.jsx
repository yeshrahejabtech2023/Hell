import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'markdown-to-jsx';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMessage = { id: Date.now(), role: 'user', content: input };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: [...messages, userMessage].map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.content
            }))
          }),
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', content: data.content }]);
      } catch (error) {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', content: `Error: ${error.message}` }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="app-container">
      <main className="output-area">
        {messages.length === 0 && (
          <div style={{ opacity: 0.2, marginTop: '20vh', textAlign: 'center' }}>
            System ready.
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="markdown">
              <Markdown>{msg.content}</Markdown>
            </div>
          </div>
        ))}
        {isLoading && <div className="message ai loading">...</div>}
        <div ref={chatEndRef} />
      </main>

      <div className="input-container">
        <textarea
          className="input-box"
          rows="1"
          placeholder="Type here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleSubmit}
          disabled={isLoading}
          autoFocus
        />
      </div>
    </div>
  );
}

export default App;
