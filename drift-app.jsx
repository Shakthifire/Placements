import { useState, useEffect, useRef } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PATHS = [
  { id: "ux", label: "UX Designer", icon: "◈", color: "#FF6B35", skills: ["Figma", "User Research", "Prototyping", "Visual Design", "Usability Testing"] },
  { id: "copy", label: "Copywriter", icon: "❝", color: "#00D4AA", skills: ["Brand Voice", "SEO Writing", "Email Copy", "Ad Copy", "Storytelling"] },
  { id: "data", label: "Data Analyst", icon: "⬡", color: "#7C6AF7", skills: ["Excel/Sheets", "SQL Basics", "Data Viz", "Statistics", "Dashboards"] },
  { id: "pm", label: "Project Manager", icon: "◎", color: "#FFB800", skills: ["Stakeholder Comms", "Roadmapping", "Agile/Scrum", "Risk Management", "Prioritization"] },
  { id: "social", label: "Social Media Mgr", icon: "◉", color: "#FF4D6D", skills: ["Content Strategy", "Analytics", "Community Mgmt", "Trend Spotting", "Paid Ads"] },
];

const DAILY_SCENARIOS = {
  ux: [
    { id: 1, title: "The 9am Ambush", desc: "Your PM just moved the design review to 2pm TODAY. You have 3 hours to finish the mobile nav. What do you cut first?", type: "pressure", time: 300 },
    { id: 2, title: "User vs. Stakeholder", desc: "Users want 3-tap checkout. CEO wants his face on the homepage. You have one Figma frame to solve both or fight one. Choose.", type: "decision", time: 240 },
    { id: 3, title: "Usability Test Disaster", desc: "6/8 users failed Task 2. The feature ships tomorrow. Write the exact Slack message you send to your lead.", type: "write", time: 180 },
  ],
  copy: [
    { id: 1, title: "30 Seconds to Hook", desc: "Write a subject line for a re-engagement email to users who haven't opened in 90 days. 8 words max. Brand: a mindfulness app called Stillwater.", type: "write", time: 180 },
    { id: 2, title: "The Brief is Wrong", desc: "Client says 'make it pop' and 'professional but fun.' Their product is B2B accounting software. Rewrite their brief in one paragraph.", type: "write", time: 240 },
    { id: 3, title: "Cut It in Half", desc: "This 80-word product description performs terribly. Your job: cut it to 40 words and double the desire. Original: 'Our platform provides comprehensive solutions for modern businesses looking to streamline their workflow processes and increase overall team productivity through advanced automation.'", type: "edit", time: 300 },
  ],
  data: [
    { id: 1, title: "The CEO Wants One Number", desc: "Monthly revenue is up 12% but DAU is down 8% and churn is up 3%. CEO asks: 'Are we growing?' What's your answer and why?", type: "decision", time: 240 },
    { id: 2, title: "Bad Data. Ship Anyway?", desc: "The dataset has 23% nulls in the key column. Dashboard goes live in 2 hours. What do you do?", type: "pressure", time: 180 },
    { id: 3, title: "Correlation Crime Scene", desc: "A colleague says 'Ice cream sales cause drowning deaths — look at this chart!' Explain why they're wrong in 2 sentences a non-analyst will believe.", type: "write", time: 200 },
  ],
  pm: [
    { id: 1, title: "The Sprint is Burning", desc: "Day 3 of a 10-day sprint. Dev says feature A needs 5 more days. You have 4. Stakeholder presentation is fixed. What do you sacrifice?", type: "decision", time: 240 },
    { id: 2, title: "Conflict in the Standup", desc: "Design and Dev have been passive-aggressively arguing in Slack for 3 days. It's now awkward in standup. You have 5 minutes before the next meeting. What do you do?", type: "decision", time: 180 },
    { id: 3, title: "Scope Creep Is Knocking", desc: "Client sends 'just a small addition' that's actually 3 weeks of work. Write the reply that protects your timeline without losing the client.", type: "write", time: 300 },
  ],
  social: [
    { id: 1, title: "The Brand Just Went Viral (Badly)", desc: "A meme mocking your client's product has 200k shares. Your client wants to respond immediately. Draft the response — or argue why you shouldn't post anything.", type: "write", time: 300 },
    { id: 2, title: "Reach vs. Engagement", desc: "Post A: 50k reach, 200 comments. Post B: 8k reach, 1.2k comments. Your client asks which performed better. What do you say?", type: "decision", time: 180 },
    { id: 3, title: "Content Calendar Crisis", desc: "It's Thursday. Your scheduled Friday post is now tone-deaf due to breaking news. The week's content is gone. Build a 3-post emergency plan in 5 minutes.", type: "pressure", time: 300 },
  ],
};

const ARCHAEOLOGY_QUESTIONS = [
  "Have you ever taught someone how to do something?",
  "Have you organized an event, trip, or group project?",
  "Have you ever complained about a bad experience and knew exactly how to fix it?",
  "Have you written something — anything — that someone said was good?",
  "Have you made a decision under pressure that turned out right?",
  "Have you noticed a pattern others missed?",
  "Have you convinced someone to change their mind?",
];

// ─── CITY BUILDING ───────────────────────────────────────────────────────────

function CityCanvas({ health, skillProgress, pathColor }) {
  const buildings = [
    { x: 40, baseH: 80, width: 28, skill: 0 },
    { x: 80, baseH: 120, width: 22, skill: 1 },
    { x: 115, baseH: 60, width: 32, skill: 2 },
    { x: 160, baseH: 100, width: 20, skill: 3 },
    { x: 192, baseH: 90, width: 26, skill: 4 },
  ];

  const groundY = 160;

  return (
    <svg viewBox="0 0 260 180" style={{ width: "100%", maxWidth: 320, filter: `saturate(${0.4 + health * 0.006})` }}>
      {/* Sky gradient */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={health > 50 ? "#0a0a2e" : "#1a0505"} />
          <stop offset="100%" stopColor={health > 50 ? "#1a1040" : "#2a0a0a"} />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1030" />
          <stop offset="100%" stopColor="#0a0820" />
        </linearGradient>
      </defs>

      <rect width="260" height="180" fill="url(#sky)" />

      {/* Moon or sun */}
      <circle
        cx="220" cy="28"
        r={health > 50 ? 14 : 10}
        fill={health > 50 ? "#fffacd" : "#ff4444"}
        opacity={health > 50 ? 0.9 : 0.6}
      />

      {/* Stars */}
      {health > 30 && [20, 60, 100, 140, 50, 90, 170, 200, 30, 130].map((x, i) => (
        <circle key={i} cx={x} cy={8 + (i * 7) % 40} r={0.8} fill="white" opacity={0.4 + (i % 3) * 0.2} />
      ))}

      {/* Decay cracks overlay */}
      {health < 40 && (
        <g opacity={0.3} stroke="#ff4444" strokeWidth="0.5" fill="none">
          <path d="M30,100 L45,120 L38,140" />
          <path d="M180,80 L190,100 L185,115" />
        </g>
      )}

      {/* Buildings */}
      {buildings.map((b, i) => {
        const prog = skillProgress[i] ?? 0;
        const h = Math.max(8, (b.baseH * prog) / 100);
        const decay = health < 50 ? (50 - health) / 50 : 0;
        const crumble = Math.floor(decay * (h * 0.4));
        const finalH = Math.max(8, h - crumble);
        const alpha = 0.3 + (prog / 100) * 0.7;
        const isBuilt = prog > 20;

        return (
          <g key={i}>
            {/* Building body */}
            <rect
              x={b.x} y={groundY - finalH}
              width={b.width} height={finalH}
              fill={pathColor}
              opacity={alpha * (1 - decay * 0.3)}
              rx={1}
            />
            {/* Windows */}
            {isBuilt && Array.from({ length: Math.floor(finalH / 14) }).map((_, r) =>
              Array.from({ length: Math.floor(b.width / 9) }).map((_, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={b.x + 4 + c * 9}
                  y={groundY - finalH + 6 + r * 14}
                  width={4} height={5}
                  fill={Math.random() > 0.3 ? "#fffbe6" : "transparent"}
                  opacity={0.7}
                />
              ))
            )}
            {/* Crumble debris */}
            {decay > 0.2 && (
              <g fill={pathColor} opacity={0.3}>
                <rect x={b.x + 2} y={groundY - 4} width={4} height={4} />
                <rect x={b.x + b.width - 4} y={groundY - 3} width={3} height={3} />
              </g>
            )}
          </g>
        );
      })}

      {/* Ground */}
      <rect x="0" y={groundY} width="260" height="20" fill="url(#ground)" />

      {/* Health pulse glow at base */}
      <rect
        x="0" y={groundY - 1}
        width="260" height="2"
        fill={pathColor}
        opacity={health > 50 ? 0.4 : 0.1}
      />
    </svg>
  );
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function SplashScreen({ onEnter }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div style={s.page}>
      <div style={{ ...s.splash, opacity: visible ? 1 : 0, transition: "opacity 1s ease" }}>
        <div style={s.splashGlyph}>⬡</div>
        <h1 style={s.splashTitle}>DRIFT</h1>
        <p style={s.splashSub}>Your career is a city.<br />Build it. Or watch it decay.</p>
        <div style={s.splashDivider} />
        <p style={s.splashMicro}>Not a course. Not a tracker. A consequence engine.</p>
        <button style={s.splashBtn} onClick={onEnter}>
          Enter the city →
        </button>
      </div>
    </div>
  );
}

function PathScreen({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <div style={s.page}>
      <div style={{ ...s.container, opacity: visible ? 1 : 0, transition: "opacity 0.6s ease" }}>
        <p style={s.stepLabel}>STEP 01 / 04</p>
        <h2 style={s.heading}>What city are you building?</h2>
        <p style={s.subtext}>This determines your daily simulations. No courses. Just real situations.</p>

        <div style={s.pathGrid}>
          {PATHS.map((p) => (
            <button
              key={p.id}
              style={{
                ...s.pathCard,
                borderColor: hovered === p.id ? p.color : "rgba(255,255,255,0.08)",
                background: hovered === p.id ? `${p.color}12` : "rgba(255,255,255,0.03)",
                transform: hovered === p.id ? "translateY(-3px)" : "translateY(0)",
              }}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(p)}
            >
              <span style={{ ...s.pathIcon, color: p.color }}>{p.icon}</span>
              <span style={s.pathLabel}>{p.label}</span>
              <div style={s.pathSkills}>
                {p.skills.slice(0, 3).map(sk => (
                  <span key={sk} style={{ ...s.skillPill, borderColor: `${p.color}44`, color: `${p.color}cc` }}>{sk}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArchaeologyScreen({ path, onDone }) {
  const [answers, setAnswers] = useState({});
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const toggle = (i) => setAnswers(prev => ({ ...prev, [i]: !prev[i] }));
  const yesCount = Object.values(answers).filter(Boolean).length;

  return (
    <div style={s.page}>
      <div style={{ ...s.container, opacity: visible ? 1 : 0, transition: "opacity 0.6s ease" }}>
        <p style={s.stepLabel}>STEP 02 / 04</p>
        <h2 style={s.heading}>Skill Archaeology</h2>
        <p style={s.subtext}>
          You already have skills buried under "I've never done this professionally."<br />
          Let's excavate them.
        </p>

        <div style={s.archBox}>
          {ARCHAEOLOGY_QUESTIONS.map((q, i) => (
            <button
              key={i}
              style={{
                ...s.archQ,
                borderColor: answers[i] ? path.color : "rgba(255,255,255,0.08)",
                background: answers[i] ? `${path.color}15` : "rgba(255,255,255,0.02)",
              }}
              onClick={() => toggle(i)}
            >
              <span style={{ ...s.archCheck, borderColor: answers[i] ? path.color : "rgba(255,255,255,0.2)", background: answers[i] ? path.color : "transparent" }}>
                {answers[i] ? "✓" : ""}
              </span>
              <span style={{ fontSize: "0.88rem", lineHeight: 1.5 }}>{q}</span>
            </button>
          ))}
        </div>

        {yesCount > 0 && (
          <div style={{ ...s.archResult, borderColor: `${path.color}44` }}>
            <span style={{ color: path.color, fontWeight: 700, fontSize: "1.5rem" }}>{yesCount}</span>
            <span style={s.archResultText}> transferable skills found. These aren't nothing — they're your foundation.</span>
          </div>
        )}

        <button
          style={{ ...s.primaryBtn, background: path.color, marginTop: "1.5rem" }}
          onClick={() => onDone(yesCount)}
        >
          Build on this foundation →
        </button>
      </div>
    </div>
  );
}

function MirrorScreen({ path, archaeologyScore, onDone }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const obstacles = [
    { id: "time", label: "\"I don't have time\"", truth: "You have time. You're spending it elsewhere. That's a priority problem, not a time problem." },
    { id: "ready", label: "\"I'm not ready yet\"", truth: "Ready is a myth. You get ready by doing, not by preparing to do. Every day you wait, you're just more behind." },
    { id: "talented", label: "\"I'm not talented enough\"", truth: "Nobody hiring you cares about talent. They care if you can do the job. Skills are earned, not born." },
    { id: "direction", label: "\"I don't know where to start\"", truth: "You just picked a path. You started 2 minutes ago. The question is whether you'll still be here next week." },
  ];

  const [picked, setPicked] = useState(null);

  return (
    <div style={s.page}>
      <div style={{ ...s.container, opacity: visible ? 1 : 0, transition: "opacity 0.6s ease" }}>
        <p style={s.stepLabel}>STEP 03 / 04</p>
        <h2 style={s.heading}>The Honest Mirror</h2>
        <p style={s.subtext}>Pick the lie you tell yourself most. We'll make it the thing you face every day.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "1.5rem" }}>
          {obstacles.map((o) => (
            <button
              key={o.id}
              style={{
                ...s.mirrorCard,
                borderColor: picked === o.id ? path.color : "rgba(255,255,255,0.08)",
                background: picked === o.id ? `${path.color}10` : "rgba(255,255,255,0.02)",
              }}
              onClick={() => setPicked(o.id)}
            >
              <div style={{ ...s.mirrorLabel, color: picked === o.id ? path.color : "rgba(255,255,255,0.8)" }}>
                {o.label}
              </div>
              {picked === o.id && (
                <div style={s.mirrorTruth}>{o.truth}</div>
              )}
            </button>
          ))}
        </div>

        {picked && (
          <button
            style={{ ...s.primaryBtn, background: path.color, marginTop: "1.5rem" }}
            onClick={() => onDone(picked)}
          >
            I can handle the truth →
          </button>
        )}
      </div>
    </div>
  );
}

function CityIntroScreen({ path, onDone }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const initProgress = path.skills.map(() => 10);

  return (
    <div style={s.page}>
      <div style={{ ...s.container, opacity: visible ? 1 : 0, transition: "opacity 0.6s ease", textAlign: "center" }}>
        <p style={s.stepLabel}>STEP 04 / 04</p>
        <h2 style={s.heading}>Your city is born.</h2>
        <p style={s.subtext}>Five districts. One per skill. Each one grows when you show up.<br />Each one crumbles when you don't.</p>

        <div style={{ margin: "1.5rem auto", maxWidth: 320 }}>
          <CityCanvas health={72} skillProgress={[10, 10, 10, 10, 10]} pathColor={path.color} />
        </div>

        <div style={s.cityLegend}>
          {path.skills.map((sk, i) => (
            <div key={i} style={s.legendItem}>
              <div style={{ ...s.legendDot, background: path.color, opacity: 0.3 + i * 0.14 }} />
              <span>{sk}</span>
            </div>
          ))}
        </div>

        <div style={{ ...s.warnBox, borderColor: `${path.color}44` }}>
          <span style={{ color: path.color }}>⚠</span> Miss 3 days in a row and your city starts to decay. There's no freeze. No pause. This is how careers actually work.
        </div>

        <button style={{ ...s.primaryBtn, background: path.color, marginTop: "1.5rem" }} onClick={onDone}>
          Start building →
        </button>
      </div>
    </div>
  );
}

function DashboardScreen({ path, state, onStartScenario, onOpenMirror, onOpenArchive }) {
  const health = state.health;
  const dayStreak = state.streak;
  const totalDone = state.completedScenarios.length;
  const avgSkill = Math.round(state.skillProgress.reduce((a, b) => a + b, 0) / state.skillProgress.length);

  const getHealthLabel = () => {
    if (health >= 80) return { text: "Thriving", color: "#00D4AA" };
    if (health >= 55) return { text: "Stable", color: "#FFB800" };
    if (health >= 30) return { text: "Crumbling", color: "#FF6B35" };
    return { text: "In Ruins", color: "#FF4D6D" };
  };
  const hl = getHealthLabel();

  return (
    <div style={s.page}>
      <div style={s.dashContainer}>

        {/* Header */}
        <div style={s.dashHeader}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ ...s.pathIconSm, color: path.color }}>{path.icon}</span>
              <span style={s.dashRole}>{path.label}</span>
            </div>
            <p style={s.dashSub}>Day {totalDone + 1} of building</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ ...s.healthBadge, borderColor: `${hl.color}44`, color: hl.color }}>
              {hl.text}
            </div>
            <div style={s.streakCount}>{dayStreak} day streak</div>
          </div>
        </div>

        {/* City */}
        <div style={s.cityWrap}>
          <CityCanvas health={health} skillProgress={state.skillProgress} pathColor={path.color} />
          <div style={{ ...s.healthBar }}>
            <div style={{ ...s.healthFill, width: `${health}%`, background: hl.color }} />
          </div>
          <div style={s.healthLabel}>City health: {health}%</div>
        </div>

        {/* Skills */}
        <div style={s.skillsRow}>
          {path.skills.map((sk, i) => (
            <div key={i} style={s.skillCol}>
              <div style={s.skillBarWrap}>
                <div style={{ ...s.skillBarFill, height: `${state.skillProgress[i]}%`, background: path.color }} />
              </div>
              <div style={s.skillName}>{sk.split(" ")[0]}</div>
            </div>
          ))}
        </div>

        {/* Today's scenario */}
        <div style={{ ...s.scenarioCard, borderColor: `${path.color}33` }}>
          <div style={s.scenarioMeta}>
            <span style={{ color: path.color, fontSize: "0.72rem", letterSpacing: "0.1em" }}>TODAY'S SIMULATION</span>
            <span style={s.pressureTag}>⏱ TIMED</span>
          </div>
          <h3 style={s.scenarioTitle}>
            {DAILY_SCENARIOS[path.id]?.[totalDone % DAILY_SCENARIOS[path.id].length]?.title ?? "The Real Work"}
          </h3>
          <p style={s.scenarioDesc}>
            {DAILY_SCENARIOS[path.id]?.[totalDone % DAILY_SCENARIOS[path.id].length]?.desc?.slice(0, 80)}...
          </p>
          <button style={{ ...s.primaryBtn, background: path.color, marginTop: "0.75rem" }} onClick={onStartScenario}>
            Enter simulation →
          </button>
        </div>

        {/* Bottom actions */}
        <div style={s.bottomRow}>
          <button style={s.ghostBtn} onClick={onOpenMirror}>
            🪞 Honest Mirror
          </button>
          <button style={s.ghostBtn} onClick={onOpenArchive}>
            🏛 Archive
          </button>
          <div style={{ ...s.avgBadge, borderColor: `${path.color}33` }}>
            <span style={{ color: path.color, fontWeight: 700 }}>{avgSkill}%</span>
            <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", display: "block" }}>avg skill</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioScreen({ path, scenario, onComplete, onSkip }) {
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(scenario.time);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [reflection, setReflection] = useState(null);
  const intervalRef = useRef(null);

  const typeColors = { pressure: "#FF4D6D", decision: "#FFB800", write: "#00D4AA", edit: "#7C6AF7" };
  const typeLabels = { pressure: "PRESSURE COOKER", decision: "JUDGMENT CALL", write: "CRAFT IT", edit: "SHARPEN IT" };

  useEffect(() => {
    if (started && !done) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(intervalRef.current); handleSubmit(true); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [started, done]);

  const handleSubmit = (timedOut = false) => {
    clearInterval(intervalRef.current);
    setDone(true);
    const score = timedOut ? "ran-out" : answer.trim().length > 30 ? "strong" : answer.trim().length > 0 ? "weak" : "blank";
    setReflection(score);
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const urgency = timeLeft < 30 ? "#FF4D6D" : timeLeft < 60 ? "#FFB800" : "rgba(255,255,255,0.5)";

  if (done) {
    const msgs = {
      strong: { icon: "◈", text: "Solid work. That's the kind of response that gets you hired.", gain: 12 },
      weak: { icon: "◎", text: "You started. That's real. Push deeper tomorrow — vague answers don't survive interviews.", gain: 5 },
      blank: { icon: "◉", text: "You left the field empty. That costs the city.", gain: 0 },
      "ran-out": { icon: "⬡", text: "Time's up. Real work doesn't wait. Try to be faster tomorrow.", gain: 3 },
    };
    const m = msgs[reflection];
    return (
      <div style={s.page}>
        <div style={{ ...s.container, textAlign: "center" }}>
          <span style={{ fontSize: "3rem", color: path.color }}>{m.icon}</span>
          <h2 style={{ ...s.heading, marginTop: "0.75rem" }}>Simulation complete.</h2>
          <div style={{ ...s.reflectBox, borderColor: `${path.color}33` }}>
            <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>{m.text}</p>
          </div>
          {answer && (
            <div style={s.yourAnswer}>
              <p style={s.yourAnswerLabel}>Your answer:</p>
              <p style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.6, fontSize: "0.9rem" }}>{answer}</p>
            </div>
          )}
          <div style={{ ...s.gainBadge, borderColor: `${path.color}44` }}>
            <span style={{ color: path.color, fontWeight: 700, fontSize: "1.3rem" }}>+{m.gain}</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}> skill pts</span>
          </div>
          <button style={{ ...s.primaryBtn, background: path.color, marginTop: "1.5rem" }} onClick={() => onComplete(m.gain)}>
            Back to the city →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        {!started ? (
          <>
            <div style={{ ...s.typeTag, color: typeColors[scenario.type], borderColor: `${typeColors[scenario.type]}44` }}>
              {typeLabels[scenario.type]}
            </div>
            <h2 style={s.heading}>{scenario.title}</h2>
            <div style={{ ...s.scenarioFullDesc, borderColor: `${path.color}33` }}>
              <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.8)" }}>{scenario.desc}</p>
            </div>
            <div style={s.timerWarn}>
              You have <strong style={{ color: path.color }}>{Math.floor(scenario.time / 60)}:{String(scenario.time % 60).padStart(2, "0")}</strong> minutes. Clock starts when you tap begin.
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button style={{ ...s.primaryBtn, background: path.color, flex: 1 }} onClick={() => setStarted(true)}>
                Begin →
              </button>
              <button style={s.skipBtn} onClick={onSkip}>Skip (costs health)</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>{scenario.title.toUpperCase()}</span>
              <span style={{ ...s.timer, color: urgency }}>{mins}:{secs}</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1rem" }}>
              {scenario.desc}
            </p>
            <textarea
              autoFocus
              style={{ ...s.bigTextarea, borderColor: `${path.color}44` }}
              placeholder="Type your response here. Think out loud."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              rows={7}
            />
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <button
                style={{ ...s.primaryBtn, background: path.color, flex: 1, opacity: answer.trim() ? 1 : 0.5 }}
                onClick={() => handleSubmit(false)}
              >
                Submit answer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ArchiveScreen({ path, completedScenarios, onBack }) {
  return (
    <div style={s.page}>
      <div style={s.container}>
        <button style={s.backLink} onClick={onBack}>← Back to city</button>
        <h2 style={s.heading}>Your Archive</h2>
        <p style={s.subtext}>Every simulation you've survived. This IS your portfolio.</p>

        {completedScenarios.length === 0 ? (
          <div style={s.emptyArchive}>No simulations completed yet. Your archive starts today.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
            {completedScenarios.map((sc, i) => (
              <div key={i} style={{ ...s.archiveEntry, borderColor: `${path.color}22` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: path.color, fontSize: "0.78rem" }}>Day {i + 1}</span>
                  <span style={{ ...s.gainSmall, color: path.color }}>+{sc.gain} pts</span>
                </div>
                <div style={s.archiveTitle}>{sc.title}</div>
                {sc.answer && <p style={s.archiveAnswer}>"{sc.answer.slice(0, 120)}{sc.answer.length > 120 ? "…" : ""}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WeeklyMirrorScreen({ path, state, onBack }) {
  const avgSkill = Math.round(state.skillProgress.reduce((a, b) => a + b, 0) / state.skillProgress.length);
  const daysActive = state.completedScenarios.length;
  const weakest = path.skills[state.skillProgress.indexOf(Math.min(...state.skillProgress))];
  const strongest = path.skills[state.skillProgress.indexOf(Math.max(...state.skillProgress))];

  return (
    <div style={s.page}>
      <div style={s.container}>
        <button style={s.backLink} onClick={onBack}>← Back to city</button>
        <h2 style={s.heading}>The Honest Mirror</h2>
        <p style={s.subtext}>No motivational fluff. Just what the numbers say.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
          <div style={{ ...s.mirrorStat, borderColor: `${path.color}33` }}>
            <div style={s.mirrorStatNum}>{daysActive}</div>
            <div style={s.mirrorStatLabel}>simulations completed</div>
            <div style={s.mirrorStatTruth}>
              {daysActive === 0 ? "You haven't started. Every day here is a day building. Every day not is a day decaying." :
               daysActive < 3 ? "You've started. Most people quit here. The question is: are you most people?" :
               daysActive < 7 ? "You're building a habit. It's fragile but it's real. Don't break the chain." :
               "You're in the top 5% of people who actually show up. That matters."}
            </div>
          </div>

          <div style={{ ...s.mirrorStat, borderColor: `${path.color}33` }}>
            <div style={s.mirrorStatNum}>{avgSkill}%</div>
            <div style={s.mirrorStatLabel}>average skill level</div>
            <div style={s.mirrorStatTruth}>
              {avgSkill < 20 ? "Ground floor. Good. Now build." :
               avgSkill < 50 ? `You're weakest in ${weakest}. That's the one holding you back right now.` :
               `${strongest} is your strongest skill. Lead with it.`}
            </div>
          </div>

          <div style={{ ...s.mirrorStat, borderColor: `${path.color}33` }}>
            <div style={s.mirrorStatNum}>{state.health}%</div>
            <div style={s.mirrorStatLabel}>city health</div>
            <div style={s.mirrorStatTruth}>
              {state.health >= 80 ? "Your city is thriving. Keep this up and you'll be job-ready in weeks, not months." :
               state.health >= 55 ? "Your city is stable but not growing. Consistency, not intensity, is what builds careers." :
               "Your city is crumbling. This is the moment most people quit. Most people don't get the job."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [path, setPath] = useState(null);
  const [gameState, setGameState] = useState(null);

  function initGame(selectedPath, archScore) {
    setGameState({
      health: 70,
      streak: 0,
      skillProgress: selectedPath.skills.map(() => 8 + Math.floor(archScore * 1.5)),
      completedScenarios: [],
    });
  }

  function handleScenarioComplete(gain) {
    setGameState(prev => {
      const newProgress = prev.skillProgress.map((p, i) =>
        i === prev.completedScenarios.length % prev.skillProgress.length
          ? Math.min(100, p + gain)
          : p
      );
      const scenario = DAILY_SCENARIOS[path.id]?.[prev.completedScenarios.length % DAILY_SCENARIOS[path.id].length];
      return {
        ...prev,
        health: Math.min(100, prev.health + (gain > 5 ? 5 : gain > 0 ? 2 : -8)),
        streak: gain > 0 ? prev.streak + 1 : 0,
        skillProgress: newProgress,
        completedScenarios: [...prev.completedScenarios, { ...scenario, gain }],
      };
    });
    setScreen("dashboard");
  }

  function handleSkip() {
    setGameState(prev => ({ ...prev, health: Math.max(0, prev.health - 12), streak: 0 }));
    setScreen("dashboard");
  }

  const currentScenario = path && gameState
    ? DAILY_SCENARIOS[path.id]?.[gameState.completedScenarios.length % DAILY_SCENARIOS[path.id].length]
    : null;

  return (
    <div style={s.root}>
      <BgNoise />
      {screen === "splash" && <SplashScreen onEnter={() => setScreen("path")} />}
      {screen === "path" && <PathScreen onSelect={(p) => { setPath(p); setScreen("archaeology"); }} />}
      {screen === "archaeology" && path && (
        <ArchaeologyScreen path={path} onDone={(score) => { setScreen("mirror"); }} />
      )}
      {screen === "mirror" && path && (
        <MirrorScreen path={path} onDone={(obstacle) => {
          initGame(path, 3);
          setScreen("city-intro");
        }} />
      )}
      {screen === "city-intro" && path && gameState && (
        <CityIntroScreen path={path} onDone={() => setScreen("dashboard")} />
      )}
      {screen === "dashboard" && path && gameState && (
        <DashboardScreen
          path={path}
          state={gameState}
          onStartScenario={() => setScreen("scenario")}
          onOpenMirror={() => setScreen("weekly-mirror")}
          onOpenArchive={() => setScreen("archive")}
        />
      )}
      {screen === "scenario" && path && currentScenario && (
        <ScenarioScreen
          path={path}
          scenario={currentScenario}
          onComplete={handleScenarioComplete}
          onSkip={handleSkip}
        />
      )}
      {screen === "archive" && path && gameState && (
        <ArchiveScreen
          path={path}
          completedScenarios={gameState.completedScenarios}
          onBack={() => setScreen("dashboard")}
        />
      )}
      {screen === "weekly-mirror" && path && gameState && (
        <WeeklyMirrorScreen
          path={path}
          state={gameState}
          onBack={() => setScreen("dashboard")}
        />
      )}
    </div>
  );
}

function BgNoise() {
  return (
    <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.03 }}>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const s = {
  root: {
    minHeight: "100vh",
    background: "#080810",
    fontFamily: "'Courier New', 'Courier', monospace",
    color: "rgba(255,255,255,0.88)",
    overflowX: "hidden",
    position: "relative",
  },
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "2rem 1rem 4rem",
    position: "relative",
    zIndex: 1,
  },
  container: {
    maxWidth: 480,
    width: "100%",
    paddingTop: "2rem",
  },

  // Splash
  splash: {
    maxWidth: 400,
    width: "100%",
    textAlign: "center",
    paddingTop: "5rem",
  },
  splashGlyph: {
    fontSize: "3.5rem",
    color: "#FF6B35",
    display: "block",
    marginBottom: "1rem",
    animation: "pulse 2s infinite",
  },
  splashTitle: {
    fontSize: "5rem",
    fontWeight: 700,
    letterSpacing: "0.35em",
    margin: 0,
    color: "white",
  },
  splashSub: {
    fontSize: "1.05rem",
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.8,
    marginTop: "1rem",
    fontFamily: "'Georgia', serif",
    fontStyle: "italic",
  },
  splashDivider: {
    width: 40,
    height: 1,
    background: "rgba(255,255,255,0.15)",
    margin: "1.5rem auto",
  },
  splashMicro: {
    fontSize: "0.72rem",
    color: "rgba(255,255,255,0.25)",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    margin: "0 0 2rem",
  },
  splashBtn: {
    display: "inline-block",
    background: "transparent",
    border: "1px solid rgba(255,107,53,0.6)",
    color: "#FF6B35",
    padding: "0.85rem 2.5rem",
    borderRadius: 0,
    fontSize: "0.9rem",
    letterSpacing: "0.1em",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // Typography
  stepLabel: {
    fontSize: "0.68rem",
    letterSpacing: "0.2em",
    color: "rgba(255,255,255,0.25)",
    margin: "0 0 0.75rem",
  },
  heading: {
    fontSize: "1.8rem",
    fontWeight: 700,
    margin: "0 0 0.5rem",
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
  },
  subtext: {
    color: "rgba(255,255,255,0.45)",
    fontSize: "0.88rem",
    lineHeight: 1.7,
    margin: 0,
    fontFamily: "'Georgia', serif",
    fontStyle: "italic",
  },

  // Path selection
  pathGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
    marginTop: "1.5rem",
  },
  pathCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 4,
    padding: "0.9rem 1rem",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  pathIcon: { fontSize: "1.4rem", flexShrink: 0 },
  pathLabel: { fontSize: "0.95rem", fontWeight: 600, flexShrink: 0 },
  pathSkills: { display: "flex", gap: "0.4rem", flexWrap: "wrap", marginLeft: "auto" },
  skillPill: {
    border: "1px solid",
    borderRadius: 2,
    padding: "0.15rem 0.45rem",
    fontSize: "0.65rem",
    letterSpacing: "0.05em",
  },

  // Archaeology
  archBox: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    marginTop: "1.5rem",
  },
  archQ: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 4,
    cursor: "pointer",
    textAlign: "left",
    color: "rgba(255,255,255,0.8)",
    transition: "all 0.2s",
  },
  archCheck: {
    width: 18,
    height: 18,
    border: "1px solid",
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.7rem",
    flexShrink: 0,
    marginTop: 1,
    transition: "all 0.15s",
    fontWeight: 700,
  },
  archResult: {
    marginTop: "1.25rem",
    padding: "1rem",
    border: "1px solid",
    borderRadius: 4,
    background: "rgba(255,255,255,0.02)",
  },
  archResultText: {
    fontSize: "0.88rem",
    color: "rgba(255,255,255,0.6)",
  },

  // Mirror
  mirrorCard: {
    padding: "0.9rem 1rem",
    border: "1px solid",
    borderRadius: 4,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s",
    background: "rgba(255,255,255,0.02)",
  },
  mirrorLabel: { fontSize: "0.95rem", fontWeight: 600, transition: "color 0.2s" },
  mirrorTruth: {
    marginTop: "0.5rem",
    fontSize: "0.82rem",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.65,
    fontFamily: "'Georgia', serif",
    fontStyle: "italic",
    paddingTop: "0.5rem",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },

  // City intro
  cityWrap: { position: "relative", textAlign: "center" },
  cityLegend: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    flexWrap: "wrap",
    marginTop: "1rem",
    fontSize: "0.7rem",
    color: "rgba(255,255,255,0.4)",
  },
  legendItem: { display: "flex", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: "50%" },
  warnBox: {
    marginTop: "1.25rem",
    padding: "0.9rem 1rem",
    border: "1px solid",
    borderRadius: 4,
    fontSize: "0.82rem",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.6,
    fontFamily: "'Georgia', serif",
    fontStyle: "italic",
  },

  // Dashboard
  dashContainer: {
    maxWidth: 440,
    width: "100%",
    padding: "1.5rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    zIndex: 1,
    position: "relative",
  },
  dashHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pathIconSm: { fontSize: "1.1rem" },
  dashRole: { fontSize: "1rem", fontWeight: 700, letterSpacing: "0.05em" },
  dashSub: { fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", margin: "0.2rem 0 0", letterSpacing: "0.08em" },
  healthBadge: {
    border: "1px solid",
    borderRadius: 2,
    padding: "0.2rem 0.6rem",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    display: "inline-block",
  },
  streakCount: { fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", marginTop: "0.3rem" },
  healthBar: {
    height: 3,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: "0.5rem",
  },
  healthFill: { height: "100%", borderRadius: 2, transition: "width 0.8s ease" },
  healthLabel: { fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", marginTop: "0.3rem", letterSpacing: "0.08em" },

  skillsRow: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "flex-end",
    height: 60,
    padding: "0 0.25rem",
  },
  skillCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" },
  skillBarWrap: {
    flex: 1,
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 2,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  skillBarFill: { width: "100%", borderRadius: 2, transition: "height 0.8s ease", minHeight: 2 },
  skillName: { fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em", textAlign: "center" },

  scenarioCard: {
    border: "1px solid",
    borderRadius: 4,
    padding: "1rem 1.1rem",
    background: "rgba(255,255,255,0.02)",
  },
  scenarioMeta: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" },
  pressureTag: {
    fontSize: "0.65rem",
    color: "#FF4D6D",
    letterSpacing: "0.1em",
    border: "1px solid rgba(255,77,109,0.3)",
    padding: "0.15rem 0.4rem",
    borderRadius: 2,
  },
  scenarioTitle: { fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.35rem", letterSpacing: "-0.01em" },
  scenarioDesc: { fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 },

  bottomRow: {
    display: "flex",
    gap: "0.6rem",
    alignItems: "center",
  },
  avgBadge: {
    marginLeft: "auto",
    border: "1px solid",
    borderRadius: 4,
    padding: "0.4rem 0.75rem",
    textAlign: "center",
    minWidth: 60,
  },

  // Scenario
  typeTag: {
    display: "inline-block",
    border: "1px solid",
    borderRadius: 2,
    padding: "0.2rem 0.5rem",
    fontSize: "0.68rem",
    letterSpacing: "0.12em",
    marginBottom: "1rem",
  },
  scenarioFullDesc: {
    border: "1px solid",
    borderRadius: 4,
    padding: "1.1rem",
    background: "rgba(255,255,255,0.02)",
    marginTop: "1rem",
  },
  timerWarn: {
    marginTop: "1rem",
    fontSize: "0.82rem",
    color: "rgba(255,255,255,0.45)",
    lineHeight: 1.6,
    fontFamily: "'Georgia', serif",
    fontStyle: "italic",
  },
  timer: {
    fontFamily: "'Courier New', monospace",
    fontSize: "1.6rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    transition: "color 0.3s",
  },
  bigTextarea: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid",
    borderRadius: 4,
    color: "rgba(255,255,255,0.9)",
    fontSize: "0.92rem",
    padding: "1rem",
    resize: "none",
    fontFamily: "'Georgia', serif",
    lineHeight: 1.7,
    outline: "none",
    boxSizing: "border-box",
  },
  skipBtn: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.3)",
    padding: "0.75rem 1rem",
    borderRadius: 2,
    fontSize: "0.78rem",
    cursor: "pointer",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
  },

  // Reflection
  reflectBox: {
    border: "1px solid",
    borderRadius: 4,
    padding: "1.1rem",
    margin: "1.25rem 0",
    background: "rgba(255,255,255,0.02)",
  },
  yourAnswer: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 4,
    padding: "0.9rem",
    marginBottom: "1rem",
    textAlign: "left",
  },
  yourAnswerLabel: { fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", margin: "0 0 0.4rem" },
  gainBadge: {
    display: "inline-block",
    border: "1px solid",
    borderRadius: 4,
    padding: "0.5rem 1.5rem",
  },

  // Archive
  emptyArchive: {
    marginTop: "2rem",
    color: "rgba(255,255,255,0.25)",
    fontSize: "0.88rem",
    fontStyle: "italic",
    fontFamily: "'Georgia', serif",
    textAlign: "center",
    padding: "2rem 0",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  archiveEntry: {
    border: "1px solid",
    borderRadius: 4,
    padding: "0.9rem 1rem",
    background: "rgba(255,255,255,0.02)",
  },
  archiveTitle: { fontWeight: 700, fontSize: "0.95rem", margin: "0.25rem 0 0.4rem" },
  archiveAnswer: { fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.6, fontStyle: "italic", fontFamily: "'Georgia', serif" },
  gainSmall: { fontSize: "0.78rem", fontWeight: 700 },

  // Mirror stats
  mirrorStat: {
    border: "1px solid",
    borderRadius: 4,
    padding: "1.1rem",
    background: "rgba(255,255,255,0.02)",
  },
  mirrorStatNum: { fontSize: "2.5rem", fontWeight: 700, lineHeight: 1, marginBottom: "0.2rem" },
  mirrorStatLabel: { fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: "0.75rem" },
  mirrorStatTruth: {
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.7,
    fontFamily: "'Georgia', serif",
    fontStyle: "italic",
    paddingTop: "0.75rem",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },

  // Shared
  primaryBtn: {
    display: "block",
    width: "100%",
    border: "none",
    color: "rgba(0,0,0,0.88)",
    padding: "0.85rem 1.5rem",
    borderRadius: 2,
    fontSize: "0.88rem",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.08em",
    fontFamily: "'Courier New', monospace",
    textTransform: "uppercase",
  },
  ghostBtn: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.45)",
    padding: "0.55rem 0.9rem",
    borderRadius: 2,
    fontSize: "0.75rem",
    cursor: "pointer",
    letterSpacing: "0.05em",
    fontFamily: "'Courier New', monospace",
    transition: "all 0.2s",
  },
  backLink: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.3)",
    cursor: "pointer",
    fontSize: "0.8rem",
    padding: 0,
    letterSpacing: "0.05em",
    marginBottom: "1.5rem",
    display: "block",
    fontFamily: "'Courier New', monospace",
  },
};
