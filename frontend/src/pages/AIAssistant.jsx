/* SphereWalk Campus Explorer | v2.0 | Green Node Team */
/* Coded by Lucky */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logSearch, sendChatMessage } from '../services/api';
import './AIAssistant.css';

const CHIPS = ['Where is Computer Lab?', 'Who is HOD of CS?', 'Placement stats?', 'Upcoming events?', 'Admission fees?', 'Emergency contacts?'];

const STORAGE_KEY = 'spherewalk_chat_history';
const WELCOME_MSG = { id: 0, role: 'bot', text: 'Hi! I\'m SphereWalk Campus Assistant. Ask me anything about campus locations, events, placements, staff, or navigation!', actions: [] };

export default function AIAssistant() {
    const [messages, setMessages] = useState(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [WELCOME_MSG];
        } catch { return [WELCOME_MSG]; }
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatRef = useRef(null);
    const navigate = useNavigate();

    // Persist chat to sessionStorage whenever messages change
    useEffect(() => {
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch (err) { console.error("SessionStorage error:", err); }
    }, [messages]);

    useEffect(() => {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const send = async (text) => {
        if (!text?.trim() || loading) return;
        const userText = text.trim();

        const newMessages = [...messages, { id: Date.now(), role: 'user', text: userText, actions: [] }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        // Log search analytics
        logSearch(userText).catch((err) => { console.warn("Analytics log failed", err); });

        try {
            // Build message history for the API (only user/bot messages in text form)
            // Limit to last 10 messages to prevent 400 Bad Request (max 20)
            // Truncate long bot replies to prevent 400 Bad Request (max 2000 chars)
            const history = newMessages
                .map(m => ({ role: m.role === 'user' ? 'user' : 'bot', text: m.text.substring(0, 1900) }))
                .slice(-10);
            const response = await sendChatMessage(history);
            const botReply = response.data.reply || "Sorry, I couldn't get a response. Please try again.";
            const actions = response.data.actions || [];
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: botReply, actions }]);
        } catch (err) {
            console.error('Chat error:', err);
            const errMsg = err?.response?.data?.error || '';
            const msg = errMsg.includes('quota')
                ? 'The AI quota has been exceeded for today. Please generate a new Gemini API key at aistudio.google.com and restart the backend.'
                : 'Sorry, there was an error connecting to the AI. Please make sure the backend is running on port 5000 and try again.';
            setMessages(prev => [
                ...prev,
                { id: Date.now() + 1, role: 'bot', text: msg, actions: [] }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        const fresh = [WELCOME_MSG];
        setMessages(fresh);
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); } catch (err) { console.error("Clear chat error:", err); }
    };

    const voice = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { alert('Voice not supported in this browser'); return; }
        const sr = new SR();
        sr.onresult = e => send(e.results[0][0].transcript);
        sr.start();
    };

    const handleNavAction = (action) => {
        let url = action.route;
        const params = new URLSearchParams();
        if (action.dest) params.set('dest', action.dest);
        if (action.destLabel) params.set('label', action.destLabel);
        if (action.building) params.set('building', action.building);
        if (action.query && !action.dest) params.set('q', action.query);
        const qs = params.toString();
        if (qs) url += '?' + qs;
        navigate(url);
    };

    const formatText = (text) => {
        if (!text) return null;
        const lines = text.split('\n');
        const elements = [];
        let i = 0;

        while (i < lines.length) {
            let line = lines[i].trim();
            if (!line) { i++; continue; }

            // 1. Headers (###)
            if (line.startsWith('###')) {
                elements.push(<h3 key={i}>{line.replace(/^###\s*/, '')}</h3>);
                i++;
                continue;
            }

            // 2. Tables (| col | col |)
            if (line.startsWith('|')) {
                const tableRows = [];
                let headers = [];
                
                // Parse table structure
                while (i < lines.length && lines[i].trim().startsWith('|')) {
                    const row = lines[i].trim();
                    if (row.includes('---')) { i++; continue; } // Skip separator
                    
                    const cells = row.split('|').filter(c => c.trim()).map(c => c.trim());
                    if (headers.length === 0 && !row.includes('---')) {
                        headers = cells;
                    } else {
                        tableRows.push(cells);
                    }
                    i++;
                }

                elements.push(
                    <table key={`table-${i}`}>
                        <thead>
                            <tr>{headers.map((h, idx) => <th key={idx}>{renderInline(h)}</th>)}</tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row, rIdx) => (
                                <tr key={rIdx}>{row.map((cell, cIdx) => <td key={cIdx}>{renderInline(cell)}</td>)}</tr>
                            ))}
                        </tbody>
                    </table>
                );
                continue;
            }

            // 3. Bullets (- or *)
            if (line.startsWith('- ') || line.startsWith('* ')) {
                const listItems = [];
                while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
                    listItems.push(lines[i].trim().substring(2));
                    i++;
                }
                elements.push(
                    <ul key={`list-${i}`}>
                        {listItems.map((li, idx) => <li key={idx}>{renderInline(li)}</li>)}
                    </ul>
                );
                continue;
            }

            // 4. Regular Paragraphs
            elements.push(<p key={i}>{renderInline(line)}</p>);
            i++;
        }

        function renderInline(txt) {
            if (typeof txt !== 'string') return txt;
            // Handle **bold**
            const parts = txt.split(/(\*\*.*?\*\*)/g);
            return parts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j}>{part.slice(2, -2)}</strong>;
                }
                return part;
            });
        }

        return <div className="chat-markdown">{elements}</div>;
    };

    return (
        <div className="ai-page page">
            <div className="ai-wrap">
                <div className="ai-header-card card card-p">
                    <div className="ai-avatar-box"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg></div>
                    <div className="ai-header-text">
                        <h1>SphereWalk Campus Assistant</h1>
                        <p>Intelligent AI Guide</p>
                    </div>
                    <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Online</span>
                    <button
                        onClick={clearChat}
                        title="Clear chat history"
                        style={{ marginLeft: '8px', background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-2)' }}>
                        Clear
                    </button>
                </div>

                <div className="ai-chat" ref={chatRef}>
                    {messages.map(msg =>
                        msg.role === 'bot' ? (
                            <div key={msg.id} className="chat-row">
                                <div className="chat-avatar"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg></div>
                                <div className="bot-message-group">
                                    <div className="bubble bot">
                                        {formatText(msg.text)}
                                    </div>
                                    {msg.actions && msg.actions.length > 0 && (
                                        <div className="nav-actions">
                                            {msg.actions.map((action, idx) => (
                                                <button
                                                    key={idx}
                                                    className="nav-btn"
                                                    onClick={() => handleNavAction(action)}
                                                >
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div key={msg.id} className="chat-row user">
                                <div className="bubble user"><p>{msg.text}</p></div>
                            </div>
                        )
                    )}
                    {loading && (
                        <div className="chat-row">
                            <div className="chat-avatar"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg></div>
                            <div className="bubble bot thinking">
                                <div className="typing-dots"><span /><span /><span /></div>
                                <span className="scanning-text">Scanning Live Database...</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="ai-suggestions">
                    {CHIPS.map((c, i) => (
                        <button key={i} className="sugg-chip" onClick={() => send(c)} disabled={loading}>{c}</button>
                    ))}
                </div>

                <div className="ai-input-row card">
                    <input
                        className="ai-text-input"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && send(input)}
                        placeholder="Ask about locations, staff, events, placements..."
                        disabled={loading}
                    />
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={voice} title="Voice input" disabled={loading}>Mic</button>
                    <button className="btn btn-primary btn-sm" onClick={() => send(input)} disabled={!input.trim() || loading}>
                        {loading ? '...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
}
