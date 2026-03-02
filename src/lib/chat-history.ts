export type Msg = { role: "user" | "assistant"; content: string; timestamp: number };

export type ChatSession = {
  id: string;
  title: string;
  messages: Msg[];
  createdAt: number;
  updatedAt: number;
};

const SESSIONS_KEY = "mv-chat-sessions";
const ACTIVE_KEY = "mv-chat-active-session";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) {
      // Migrate from old single-history format
      const oldHistory = localStorage.getItem("mv-chat-history");
      if (oldHistory) {
        const msgs: Msg[] = JSON.parse(oldHistory);
        if (msgs.length > 0) {
          const session = createSessionFromMessages(msgs);
          saveSessions([session]);
          setActiveSessionId(session.id);
          localStorage.removeItem("mv-chat-history");
          return [session];
        }
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSessions(sessions: ChatSession[]) {
  // Keep last 20 sessions
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(-20)));
}

export function getActiveSessionId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveSessionId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

function createSessionFromMessages(msgs: Msg[]): ChatSession {
  const firstUserMsg = msgs.find((m) => m.role === "user");
  const title = firstUserMsg ? firstUserMsg.content.slice(0, 50) : "New Chat";
  return {
    id: generateId(),
    title,
    messages: msgs.slice(-50),
    createdAt: msgs[0]?.timestamp || Date.now(),
    updatedAt: msgs[msgs.length - 1]?.timestamp || Date.now(),
  };
}

export function createNewSession(): ChatSession {
  return {
    id: generateId(),
    title: "New Chat",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function updateSession(sessions: ChatSession[], sessionId: string, messages: Msg[]): ChatSession[] {
  const firstUserMsg = messages.find((m) => m.role === "user");
  const title = firstUserMsg ? firstUserMsg.content.slice(0, 50) : "New Chat";

  const exists = sessions.find((s) => s.id === sessionId);
  if (exists) {
    return sessions.map((s) =>
      s.id === sessionId
        ? { ...s, messages: messages.slice(-50), title, updatedAt: Date.now() }
        : s
    );
  }
  return [...sessions, { id: sessionId, title, messages: messages.slice(-50), createdAt: Date.now(), updatedAt: Date.now() }];
}

export function deleteSession(sessions: ChatSession[], sessionId: string): ChatSession[] {
  return sessions.filter((s) => s.id !== sessionId);
}

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}
