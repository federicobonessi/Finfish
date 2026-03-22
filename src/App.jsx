import { useState, useRef, useEffect } from "react";

const AGENTS = [
  {
    id: "macro",
    name: "Macro Strategist",
    role: "You are a macro hedge fund strategist. You analyze from a top-down perspective: interest rates, inflation, geopolitics, central bank policy, and cross-asset implications. You are cold, data-driven, and think in probabilities. You often disagree with fundamental analysts.",
    icon: "🌐",
    color: "#00d4ff",
    firm: "Global Macro Fund",
  },
  {
    id: "value",
    name: "Value Investor",
    role: "You are a deep value investor in the tradition of Graham & Dodd. You focus on balance sheets, intrinsic value, margin of safety, and long-term fundamentals. You are skeptical of momentum and growth narratives. You love cheap assets and hate paying up.",
    icon: "📊",
    color: "#ffd700",
    firm: "Long-Term Capital",
  },
  {
    id: "quant",
    name: "Quant Analyst",
    role: "You are a systematic quantitative analyst. You think in terms of factor exposures, statistical signals, volatility regimes, and historical patterns. You distrust qualitative narratives and prefer backtested, quantifiable signals. You speak in precise, technical language.",
    icon: "🤖",
    color: "#a78bfa",
    firm: "Systematic Alpha",
  },
  {
    id: "pm",
    name: "Private Banking PM",
    role: "You are a private banker managing UHNW portfolios. You think about wealth preservation, tax efficiency, diversification across asset classes and geographies, and client psychology. You are risk-averse and think in decades, not quarters.",
    icon: "🏛️",
    color: "#34d399",
    firm: "Private Wealth",
  },
  {
    id: "bear",
    name: "Contrarian Bear",
    role: "You are a professional short-seller and contrarian analyst. You look for overvalued assets, accounting irregularities, unsustainable business models, and crowded trades. You are skeptical of consensus views and always ask: what could go wrong?",
    icon: "🐻",
    color: "#f87171",
    firm: "Short Research",
  },
];

const SCENARIOS = [
  "ECB surprises markets with a 50bps rate hike. Analyze the impact on European equities, BTP-Bund spread, and real estate.",
  "Nvidia misses earnings by 20% and guides lower. How do you position?",
  "US inflation rebounds to 5% after three months of decline. Which assets outperform?",
  "Regional banking crisis in Europe: two mid-size banks face acute liquidity stress.",
  "Gold breaks $3,500/oz. Risk-off signal or new monetary narrative?",
  "China invades Taiwan: 72-hour scenario. Global market impact.",
];

// All API calls go through our secure serverless function
async function callAPI(system, userMessage) {
  const res = await fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, userMessage }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API error");
  return data.text;
}

export default function FinFish() {
  const [scenario, setScenario] = useState("");
  const [selectedAgents, setSelectedAgents] = useState(AGENTS.map((a) => a.id));
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);
  const [synthesis, setSynthesis] = useState("");
  const [synthLoading, setSynthLoading] = useState(false);
  const [phase, setPhase] = useState("input");
  const [progress, setProgress] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (results.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [results]);

  const toggleAgent = (id) => {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const runSimulation = async () => {
    if (!scenario.trim() || selectedAgents.length === 0) return;
    setLoading(true);
    setResults([]);
    setSynthesis("");
    setPhase("running");
    setProgress(0);

    const agentsToRun = AGENTS.filter((a) => selectedAgents.includes(a.id));

    for (let i = 0; i < agentsToRun.length; i++) {
      const agent = agentsToRun[i];
      setActiveAgent(agent.id);
      setProgress(Math.round(((i + 0.5) / agentsToRun.length) * 100));

      try {
        const system = `${agent.role}

You are participating in a multi-agent financial simulation called FinFish. Other analysts with different perspectives are also analyzing this scenario. Be direct, opinionated, and specific. Structure your response as:
1. **Immediate Read** (2-3 sentences): Your gut reaction
2. **Key Risks** (bullet points): What worries you most
3. **Opportunity** (1-2 sentences): What this creates
4. **Positioning** (specific): What you would actually do

Keep it sharp and under 250 words. No hedging. This is your professional conviction.`;

        const userMessage = `Scenario: ${scenario}\n\nProvide your analysis as ${agent.name} at ${agent.firm}.`;
        const text = await callAPI(system, userMessage);

        setResults((prev) => [
          ...prev,
          { agent, text, timestamp: new Date().toLocaleTimeString() },
        ]);
      } catch (err) {
        setResults((prev) => [
          ...prev,
          {
            agent,
            text: `Error: ${err.message}`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }

      setProgress(Math.round(((i + 1) / agentsToRun.length) * 100));
    }

    setActiveAgent(null);
    setLoading(false);
    setPhase("results");
  };

  const runSynthesis = async () => {
    if (results.length === 0) return;
    setSynthLoading(true);

    const allAnalyses = results
      .map((r) => `=== ${r.agent.name} (${r.agent.firm}) ===\n${r.text}`)
      .join("\n\n");

    try {
      const system =
        "You are a Chief Investment Officer synthesizing views from multiple analysts. Identify areas of consensus, key disagreements, and produce a balanced but decisive final recommendation. Be concrete. Format with: **Consensus**, **Key Disagreements**, **CIO Verdict**, **Trade Idea**.";
      const userMessage = `Scenario: ${scenario}\n\nAnalyst Views:\n${allAnalyses}\n\nProvide your CIO synthesis.`;
      const text = await callAPI(system, userMessage);
      setSynthesis(text);
    } catch (err) {
      setSynthesis(`Synthesis failed: ${err.message}`);
    }

    setSynthLoading(false);
  };

  const reset = () => {
    setPhase("input");
    setResults([]);
    setSynthesis("");
    setScenario("");
    setProgress(0);
  };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div style={styles.root}>
      <div style={styles.gridBg} />

      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>FIN</span>
          <span style={styles.logoAccent}>FISH</span>
        </div>
        <p style={styles.tagline}>Multi-Agent Financial Simulation Engine</p>
      </header>

      <main style={styles.main}>
        {phase === "input" && (
          <div style={styles.inputPhase}>
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>⚡</span>
                <h2 style={styles.cardTitle}>Scenario</h2>
              </div>
              <textarea
                style={styles.textarea}
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="Describe the financial scenario or market event to simulate..."
                rows={4}
              />
              <div style={styles.presets}>
                <span style={styles.presetsLabel}>Quick scenarios:</span>
                <div style={styles.presetGrid}>
                  {SCENARIOS.map((s, i) => (
                    <button key={i} style={styles.presetBtn} onClick={() => setScenario(s)}>
                      {s.substring(0, 48)}…
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>👥</span>
                <h2 style={styles.cardTitle}>Select Agents</h2>
                <span style={styles.agentCount}>
                  {selectedAgents.length}/{AGENTS.length} active
                </span>
              </div>
              <div style={styles.agentGrid}>
                {AGENTS.map((agent) => {
                  const active = selectedAgents.includes(agent.id);
                  return (
                    <button
                      key={agent.id}
                      style={{
                        ...styles.agentCard,
                        borderColor: active ? agent.color : "#2a2a3a",
                        background: active ? `${agent.color}15` : "transparent",
                        opacity: active ? 1 : 0.45,
                      }}
                      onClick={() => toggleAgent(agent.id)}
                    >
                      <span style={styles.agentIcon}>{agent.icon}</span>
                      <div style={styles.agentInfo}>
                        <div style={{ ...styles.agentName, color: active ? agent.color : "#888" }}>
                          {agent.name}
                        </div>
                        <div style={styles.agentFirm}>{agent.firm}</div>
                      </div>
                      {active && (
                        <div style={{ ...styles.activeDot, background: agent.color }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <button
              style={{
                ...styles.runBtn,
                opacity: scenario.trim() && selectedAgents.length > 0 ? 1 : 0.4,
                cursor: scenario.trim() && selectedAgents.length > 0 ? "pointer" : "not-allowed",
              }}
              onClick={runSimulation}
              disabled={!scenario.trim() || selectedAgents.length === 0}
            >
              <span style={styles.runBtnIcon}>▶</span>
              RUN SIMULATION
            </button>
          </div>
        )}

        {phase === "running" && (
          <div style={styles.runningPhase}>
            <div style={styles.runningHeader}>
              <div style={styles.pulseRing} />
              <h2 style={styles.runningTitle}>Simulation Running</h2>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <div style={styles.progressText}>{progress}% complete</div>

            {results.map((r, i) => (
              <ResultCard key={i} result={r} formatText={formatText} />
            ))}

            {activeAgent && (
              <div style={styles.thinkingCard}>
                <div style={styles.thinkingDots}>
                  <span className="thinking-dot-1" style={styles.dot} />
                  <span className="thinking-dot-2" style={styles.dot} />
                  <span className="thinking-dot-3" style={styles.dot} />
                </div>
                <span style={styles.thinkingText}>
                  {AGENTS.find((a) => a.id === activeAgent)?.name} is analyzing...
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {phase === "results" && (
          <div style={styles.resultsPhase}>
            <div style={styles.resultsHeader}>
              <h2 style={styles.resultsTitle}>
                Simulation Complete — {results.length} Agents
              </h2>
              <div style={styles.scenarioTag}>{scenario.substring(0, 100)}…</div>
            </div>

            {results.map((r, i) => (
              <ResultCard key={i} result={r} formatText={formatText} />
            ))}

            <section style={styles.synthesisSection}>
              {!synthesis && !synthLoading && (
                <button style={styles.synthBtn} onClick={runSynthesis}>
                  <span>◈</span> GENERATE CIO SYNTHESIS
                </button>
              )}
              {synthLoading && (
                <div style={styles.synthLoading}>
                  <div style={styles.synthSpinner} />
                  <span>CIO synthesizing all views...</span>
                </div>
              )}
              {synthesis && (
                <div style={styles.synthesisCard}>
                  <div style={styles.synthHeader}>
                    <span style={styles.synthIcon}>◈</span>
                    <h3 style={styles.synthTitle}>CIO Synthesis</h3>
                  </div>
                  <div
                    style={styles.synthBody}
                    dangerouslySetInnerHTML={{ __html: formatText(synthesis) }}
                  />
                </div>
              )}
            </section>

            <button style={styles.resetBtn} onClick={reset}>
              ← NEW SIMULATION
            </button>
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080811; }
        @keyframes gridMove { from { background-position: 0 0; } to { background-position: 40px 40px; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.7; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes progressPulse { 0%, 100% { box-shadow: 0 0 8px #00d4ff88; } 50% { box-shadow: 0 0 20px #00d4ffcc; } }
        @keyframes dot1 { 0%, 100% { opacity: 0.2; } 33% { opacity: 1; } }
        @keyframes dot2 { 0%, 100% { opacity: 0.2; } 66% { opacity: 1; } }
        @keyframes dot3 { 0%, 100% { opacity: 0.2; } 100% { opacity: 1; } }
        .thinking-dot-1 { animation: dot1 1.2s infinite; }
        .thinking-dot-2 { animation: dot2 1.2s infinite; }
        .thinking-dot-3 { animation: dot3 1.2s infinite; }
        textarea::placeholder { color: #444; }
        textarea:focus { outline: none; border-color: #00d4ff88 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0d0d1a; }
        ::-webkit-scrollbar-thumb { background: #2a2a4a; border-radius: 2px; }
      `}</style>
    </div>
  );
}

function ResultCard({ result, formatText }) {
  const { agent, text, timestamp } = result;
  return (
    <div style={{ ...cardStyles.wrapper, borderLeftColor: agent.color, animation: "fadeUp 0.4s ease forwards" }}>
      <div style={cardStyles.header}>
        <span style={cardStyles.icon}>{agent.icon}</span>
        <div>
          <div style={{ ...cardStyles.name, color: agent.color }}>{agent.name}</div>
          <div style={cardStyles.firm}>{agent.firm}</div>
        </div>
        <div style={cardStyles.time}>{timestamp}</div>
      </div>
      <div style={cardStyles.body} dangerouslySetInnerHTML={{ __html: formatText(text) }} />
    </div>
  );
}

const cardStyles = {
  wrapper: { background: "#0d0d1a", border: "1px solid #1a1a2e", borderLeft: "3px solid", borderRadius: "8px", padding: "20px", marginBottom: "16px" },
  header: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" },
  icon: { fontSize: "22px" },
  name: { fontFamily: "'Space Mono', monospace", fontSize: "13px", fontWeight: "700", letterSpacing: "0.5px" },
  firm: { fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#555", marginTop: "2px" },
  time: { marginLeft: "auto", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "#333" },
  body: { fontFamily: "'DM Sans', sans-serif", fontSize: "14px", lineHeight: "1.7", color: "#c8c8d8" },
};

const styles = {
  root: { minHeight: "100vh", background: "#080811", color: "#e0e0f0", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" },
  gridBg: { position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", animation: "gridMove 8s linear infinite", pointerEvents: "none", zIndex: 0 },
  header: { position: "relative", zIndex: 1, textAlign: "center", padding: "48px 24px 32px", borderBottom: "1px solid #1a1a2e" },
  logo: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "8px" },
  logoIcon: { fontSize: "28px", color: "#00d4ff", animation: "pulse 3s ease-in-out infinite", display: "inline-block" },
  logoText: { fontFamily: "'Space Mono', monospace", fontSize: "32px", fontWeight: "700", color: "#ffffff", letterSpacing: "4px" },
  logoAccent: { fontFamily: "'Space Mono', monospace", fontSize: "32px", fontWeight: "700", color: "#00d4ff", letterSpacing: "4px" },
  tagline: { fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#444", letterSpacing: "2px", textTransform: "uppercase" },
  main: { position: "relative", zIndex: 1, maxWidth: "820px", margin: "0 auto", padding: "32px 24px 80px" },
  inputPhase: { display: "flex", flexDirection: "column", gap: "24px" },
  card: { background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: "10px", padding: "24px" },
  cardHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" },
  cardIcon: { fontSize: "18px" },
  cardTitle: { fontFamily: "'Space Mono', monospace", fontSize: "14px", color: "#ffffff", letterSpacing: "1px", textTransform: "uppercase" },
  agentCount: { marginLeft: "auto", fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#00d4ff" },
  textarea: { width: "100%", background: "#080811", border: "1px solid #2a2a3a", borderRadius: "6px", color: "#e0e0f0", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", lineHeight: "1.6", padding: "14px", resize: "vertical", transition: "border-color 0.2s" },
  presets: { marginTop: "16px" },
  presetsLabel: { fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "#444", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "10px" },
  presetGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
  presetBtn: { background: "transparent", border: "1px solid #1a1a2e", borderRadius: "6px", color: "#666", fontFamily: "'DM Sans', sans-serif", fontSize: "12px", padding: "10px 12px", cursor: "pointer", textAlign: "left", lineHeight: "1.4", transition: "all 0.2s" },
  agentGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  agentCard: { display: "flex", alignItems: "center", gap: "12px", padding: "14px", border: "1px solid", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s", position: "relative", textAlign: "left", background: "transparent" },
  agentIcon: { fontSize: "20px", flexShrink: 0 },
  agentInfo: { flex: 1, minWidth: 0 },
  agentName: { fontFamily: "'Space Mono', monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.3px" },
  agentFirm: { fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#555", marginTop: "2px" },
  activeDot: { width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, animation: "pulse 2s ease-in-out infinite" },
  runBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", width: "100%", padding: "18px", background: "linear-gradient(135deg, #00d4ff22, #00d4ff11)", border: "1px solid #00d4ff44", borderRadius: "8px", color: "#00d4ff", fontFamily: "'Space Mono', monospace", fontSize: "14px", fontWeight: "700", letterSpacing: "3px", transition: "all 0.3s" },
  runBtnIcon: { fontSize: "16px" },
  runningPhase: { display: "flex", flexDirection: "column", gap: "0" },
  runningHeader: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" },
  pulseRing: { width: "12px", height: "12px", borderRadius: "50%", background: "#00d4ff", animation: "pulse 1s ease-in-out infinite", flexShrink: 0 },
  runningTitle: { fontFamily: "'Space Mono', monospace", fontSize: "14px", color: "#00d4ff", letterSpacing: "2px", textTransform: "uppercase" },
  progressBar: { height: "2px", background: "#1a1a2e", borderRadius: "1px", marginBottom: "8px", overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #00d4ff, #a78bfa)", borderRadius: "1px", transition: "width 0.5s ease", animation: "progressPulse 1.5s ease-in-out infinite" },
  progressText: { fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "#444", marginBottom: "24px", textAlign: "right" },
  thinkingCard: { display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: "8px", marginBottom: "16px" },
  thinkingDots: { display: "flex", gap: "4px" },
  dot: { width: "5px", height: "5px", borderRadius: "50%", background: "#00d4ff", display: "inline-block" },
  thinkingText: { fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "#555", letterSpacing: "0.5px" },
  resultsPhase: { display: "flex", flexDirection: "column", gap: "0" },
  resultsHeader: { marginBottom: "24px" },
  resultsTitle: { fontFamily: "'Space Mono', monospace", fontSize: "14px", color: "#ffffff", letterSpacing: "1px", marginBottom: "8px" },
  scenarioTag: { fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#555", fontStyle: "italic" },
  synthesisSection: { marginTop: "24px", marginBottom: "32px" },
  synthBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%", padding: "16px", background: "linear-gradient(135deg, #a78bfa22, #a78bfa11)", border: "1px solid #a78bfa44", borderRadius: "8px", color: "#a78bfa", fontFamily: "'Space Mono', monospace", fontSize: "13px", fontWeight: "700", letterSpacing: "2px", cursor: "pointer" },
  synthLoading: { display: "flex", alignItems: "center", gap: "14px", padding: "20px", color: "#a78bfa", fontFamily: "'Space Mono', monospace", fontSize: "12px" },
  synthSpinner: { width: "16px", height: "16px", border: "2px solid #a78bfa33", borderTop: "2px solid #a78bfa", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  synthesisCard: { background: "linear-gradient(135deg, #0d0d1a, #12121f)", border: "1px solid #a78bfa33", borderRadius: "10px", overflow: "hidden" },
  synthHeader: { display: "flex", alignItems: "center", gap: "10px", padding: "16px 20px", borderBottom: "1px solid #a78bfa22", background: "#a78bfa11" },
  synthIcon: { fontSize: "18px", color: "#a78bfa" },
  synthTitle: { fontFamily: "'Space Mono', monospace", fontSize: "13px", color: "#a78bfa", letterSpacing: "1px", textTransform: "uppercase" },
  synthBody: { padding: "20px", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", lineHeight: "1.8", color: "#c8c8d8" },
  resetBtn: { background: "transparent", border: "1px solid #2a2a3a", borderRadius: "6px", color: "#555", fontFamily: "'Space Mono', monospace", fontSize: "11px", letterSpacing: "2px", padding: "12px 20px", cursor: "pointer", alignSelf: "flex-start" },
};
