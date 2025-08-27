import { useState } from 'react';
import api from '../api';
import './ChatWidget.css';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const baseURL = api.defaults.baseURL;

  const send = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(m => [...m, { from: 'user', text: userText }, { from: 'bot', text: '' }]);
    setInput('');
    try {
      const res = await fetch(`${baseURL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let botText = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        botText += decoder.decode(value, { stream: true });
        setMessages(m => {
          const updated = [...m];
          updated[updated.length - 1] = { from: 'bot', text: botText };
          return updated;
        });
      }
    } catch {
      setMessages(m => {
        const updated = [...m];
        updated[updated.length - 1] = { from: 'bot', text: 'Sorry, I could not get recommendations.' };
        return updated;
      });
    }
  };

  return (
    <div>
      <button className="chat-toggle" onClick={() => setOpen(o => !o)}>
        {open ? 'Close' : 'Chat'}
      </button>
      {open && (
        <div className="chat-box">
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.from}`}>
                <div className="bubble">{m.text}</div>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Tell me your requirements..."
            />
            <button onClick={send}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
