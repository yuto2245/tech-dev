import { useCallback, useEffect, useMemo, useState } from "react";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  type: "text" | "sandbox";
  content: string;
  command?: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    type: "text",
    content:
      "こんにちは！コマンドを指示すると仮想Linux環境で実行し、結果をお伝えします。"
  }
];

const API_BASE = "/api";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sandboxUrl, setSandboxUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSandboxUrl = useCallback(async () => {
    const response = await fetch(`${API_BASE}/sandbox/url`);
    const data = await response.json();
    setSandboxUrl(data.url);
  }, []);

  useEffect(() => {
    fetchSandboxUrl().catch((error) => {
      console.error("Failed to fetch sandbox url", error);
    });
  }, [fetchSandboxUrl]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      type: "text",
      content: input
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      if (input.startsWith("bash:")) {
        const command = input.replace(/^bash:/, "").trim();
        const res = await fetch(`${API_BASE}/sandbox/exec`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command })
        });
        const data = await res.json();
        const assistant: ChatMessage = {
          id: Date.now() + 1,
          role: "assistant",
          type: "sandbox",
          content: data.output,
          command: data.command
        };
        setMessages((prev) => [...prev, assistant]);
      } else {
        const assistant: ChatMessage = {
          id: Date.now() + 1,
          role: "assistant",
          type: "text",
          content:
            "仮想環境へのコマンドは 'bash:' で始めて入力してください。例: bash: ls"
        };
        setMessages((prev) => [...prev, assistant]);
      }
    } catch (error) {
      const assistant: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        type: "text",
        content: `エラーが発生しました: ${String(error)}`
      };
      setMessages((prev) => [...prev, assistant]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const openModal = useCallback(async () => {
    await fetchSandboxUrl();
    setShowModal(true);
  }, [fetchSandboxUrl]);

  const closeModal = () => setShowModal(false);

  const renderMessage = useCallback((message: ChatMessage) => {
    if (message.type === "sandbox") {
      return (
        <div key={message.id} className="message sandbox">
          <div className="meta">コマンド: {message.command}</div>
          <pre>{message.content}</pre>
          <button className="button-secondary" onClick={openModal}>
            仮想環境を表示
          </button>
        </div>
      );
    }
    return (
      <div key={message.id} className={`message ${message.role}`}>
        <p>{message.content}</p>
      </div>
    );
  }, [openModal]);

  const modal = useMemo(() => {
    if (!showModal || !sandboxUrl) return null;
    return (
      <div className="modal-backdrop" onClick={closeModal}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <header>
            <h2>仮想Linux環境</h2>
          </header>
          <iframe title="sandbox" src={sandboxUrl} width="960" height="600" />
          <button onClick={closeModal} className="button-secondary">
            閉じる
          </button>
        </div>
      </div>
    );
  }, [sandboxUrl, showModal]);

  return (
    <div className="app">
      <header className="header">
        <h1>AgentApp Sandbox Demo</h1>
        <button className="button-secondary" onClick={openModal} disabled={!sandboxUrl}>
          仮想環境を表示
        </button>
      </header>
      <main className="chat">
        <div className="messages">{messages.map(renderMessage)}</div>
      </main>
      <footer className="composer">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="bash: ls のように入力するとコンテナで実行されます"
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "送信中..." : "送信"}
        </button>
      </footer>
      {modal}
    </div>
  );
}
