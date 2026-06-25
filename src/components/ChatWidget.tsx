"use client";

import { useEffect, useRef, useState } from "react";
import { Send, MessageCircle, X, Loader2 } from "lucide-react";

interface Msg { id: string; sender: "admin" | "couple"; body: string; created_at: string }

interface Props {
  fetchUrl: string;
  postUrl: string;
  myRole: "admin" | "couple";
  accentColor?: string;
  label?: string;
}

export default function ChatWidget({ fetchUrl, postUrl, myRole, accentColor = "#C5A46D", label = "שאלות ועדכונים" }: Props) {
  const [open,    setOpen]    = useState(false);
  const [msgs,    setMsgs]    = useState<Msg[]>([]);
  const [input,   setInput]   = useState("");
  const [sending, setSending] = useState(false);
  const [unread,  setUnread]  = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const otherRole = myRole === "admin" ? "couple" : "admin";

  async function load() {
    try {
      const r = await fetch(fetchUrl);
      if (!r.ok) return;
      const data: Msg[] = await r.json();
      setMsgs(data);
      if (!open) {
        const unreadCount = data.filter(m => m.sender === otherRole).length;
        setUnread(prev => {
          const prevTotal = msgs.filter(m => m.sender === otherRole).length;
          return Math.max(0, unreadCount - prevTotal + prev);
        });
      }
    } catch { /* ignore */ }
  }

  useEffect(() => { load(); }, [fetchUrl]);

  useEffect(() => {
    if (!open) return;
    setUnread(0);
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  async function send() {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setSending(true);
    setInput("");
    const optimistic: Msg = { id: crypto.randomUUID(), sender: myRole, body: text, created_at: new Date().toISOString() };
    setMsgs(prev => [...prev, optimistic]);
    try {
      await fetch(postUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: text }) });
      // Wait before reloading so the server has time to commit
      setTimeout(load, 800);
    } catch { /* ignore */ }
    setSending(false);
  }

  const DARK = "#1C1008";

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: 24, left: 24, zIndex: 9998,
          width: 52, height: 52, borderRadius: "50%",
          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
          color: "white", border: "none", cursor: "pointer",
          boxShadow: `0 4px 20px ${accentColor}55`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && unread > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            width: 18, height: 18, borderRadius: "50%",
            background: "rgb(220,38,38)", color: "white",
            fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{unread}</span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 88, left: 24, zIndex: 9997,
          width: 320, height: 440, borderRadius: 20,
          background: "#FDFAF5", border: `1.5px solid rgba(197,164,109,0.25)`,
          boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "0.9rem 1rem", borderBottom: "1px solid rgba(197,164,109,0.15)", background: `${accentColor}10` }}>
            <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, color: DARK, fontSize: 15 }}>
              💬 {label}
            </p>
            <p style={{ fontSize: 11, color: "rgba(28,16,8,0.4)", fontFamily: "Heebo, sans-serif" }}>
              {myRole === "couple" ? "שלחו לנו הודעה ונחזור אליכם" : "צ׳אט עם הזוג"}
            </p>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem", display: "flex", flexDirection: "column", gap: 8 }}>
            {msgs.length === 0 && (
              <p style={{ textAlign: "center", color: "rgba(28,16,8,0.38)", fontSize: 12, marginTop: "auto", marginBottom: "auto", fontFamily: "Heebo, sans-serif", lineHeight: 1.7, padding: "0 0.5rem" }}>
                חוויתם תקלה, חשבתם על רעיון להוסיף?<br />אנחנו תמיד כאן בשבילכם —<br />דברו עם הצוות שלנו
              </p>
            )}
            {msgs.map(m => {
              const isMe = m.sender === myRole;
              return (
                <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-start" : "flex-end" }}>
                  <div style={{
                    maxWidth: "78%", padding: "0.5rem 0.75rem", borderRadius: isMe ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                    background: isMe ? `${accentColor}18` : accentColor,
                    color: isMe ? DARK : "white",
                    fontSize: 13, fontFamily: "Heebo, sans-serif", lineHeight: 1.5,
                    border: isMe ? `1px solid ${accentColor}30` : "none",
                  }}>
                    {m.body}
                    <div style={{ fontSize: 9, opacity: 0.5, marginTop: 2, textAlign: "left" }}>
                      {new Date(m.created_at).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "0.6rem", borderTop: "1px solid rgba(197,164,109,0.15)", display: "flex", gap: 6 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="כתבו הודעה..."
              style={{
                flex: 1, borderRadius: 12, border: "1px solid rgba(197,164,109,0.25)",
                padding: "0.5rem 0.75rem", fontSize: 13, fontFamily: "Heebo, sans-serif",
                background: "white", color: DARK, outline: "none",
              }}
            />
            <button onClick={send} disabled={sending || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: 10, border: "none",
                background: input.trim() ? accentColor : "rgba(197,164,109,0.2)",
                color: "white", cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s",
              }}>
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
