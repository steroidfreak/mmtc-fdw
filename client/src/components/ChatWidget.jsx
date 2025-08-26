import { useState } from 'react';
import api from '../api';
import './ChatWidget.css';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const send = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(m => [...m, { from: 'user', text: userText }]);
    setInput('');
    try {
      const res = await api.post('/chat', { message: userText });
      const { helpers, explanation } = res.data;
      const helperLines = helpers.map(h => `${h.name} (${h.nationality}) - ${h.skills.join(', ')}`).join('\n');
      const reply = `${explanation}\n\n${helperLines}`;
      setMessages(m => [...m, { from: 'bot', text: reply }]);
    } catch {
      setMessages(m => [...m, { from: 'bot', text: 'Sorry, I could not get recommendations.' }]);
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
              <div key={i} className={`msg ${m.from}`}>{m.text}</div>
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
