import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";
import { Html5Qrcode } from "html5-qrcode";

const T = {
  bg: "#F2F2F7",
  bgCard: "#FFFFFF",
  bgGlass: "rgba(255,255,255,0.72)",
  bgInput: "rgba(118,118,128,0.08)",
  primary: "#1C1C1E",
  secondary: "#3A3A3C",
  tertiary: "#636366",
  quaternary: "#AEAEB2",
  sep: "rgba(60,60,67,0.12)",
  accent: "#34C759",
  accentSoft: "rgba(52,199,89,0.12)",
  accentMid: "rgba(52,199,89,0.25)",
  red: "#FF3B30",
  redSoft: "rgba(255,59,48,0.10)",
  blue: "#007AFF",
  blueSoft: "rgba(0,122,255,0.10)",
  orange: "#FF9500",
  orangeSoft: "rgba(255,149,0,0.10)",
  prot: "#007AFF",
  protSoft: "rgba(0,122,255,0.10)",
  gluc: "#FF9500",
  glucSoft: "rgba(255,149,0,0.10)",
  lip: "#FF3B30",
  lipSoft: "rgba(255,59,48,0.10)",
};

const F = {
  display: "'SF Pro Display','Figtree','system-ui',sans-serif",
  text: "'SF Pro Text','Figtree','system-ui',sans-serif",
};

const R = { sm: 10, md: 14, lg: 20, xl: 28 };
const shadow = {
  sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  md: "0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
  lg: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
};

const card = (extra = {}) => ({
  background: T.bgCard,
  borderRadius: R.lg,
  boxShadow: shadow.md,
  overflow: "hidden",
  margin: "0 16px 12px",
  ...extra,
});

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: T.tertiary,
  marginBottom: 10,
  fontFamily: F.text,
};

const pill = (active, col = T.accent) => ({
  flex: 1,
  padding: "8px 0",
  borderRadius: R.sm,
  border: "none",
  fontFamily: F.text,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all .18s ease",
  background: active ? col : "transparent",
  color: active ? "#fff" : T.tertiary,
  boxShadow: active ? `0 2px 8px ${col}55` : "none",
});

const inputStyle = {
  background: T.bgInput,
  border: "none",
  borderRadius: R.sm,
  padding: "11px 14px",
  fontFamily: F.text,
  fontSize: 15,
  color: T.primary,
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
  WebkitAppearance: "none",
};

const btnPrimary = (col = T.accent) => ({
  background: col,
  color: "#fff",
  border: "none",
  borderRadius: R.md,
  padding: "11px 20px",
  fontFamily: F.text,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: `0 4px 14px ${col}44`,
  transition: "all .18s ease",
  letterSpacing: "-0.01em",
});

const btnGhost = {
  background: T.bgInput,
  color: T.accent,
  border: "none",
  borderRadius: R.sm,
  padding: "8px 16px",
  fontFamily: F.text,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all .18s ease",
};

const BK = {
  homme: [
    { min: 3,  max: 10,  a: 0.317, b: 0.669, c: 0.963 },
    { min: 10, max: 18,  a: 0.092, b: 1.0,   c: 2.10 },
    { min: 18, max: 30,  a: 0.063, b: 1.0,   c: 2.896 },
    { min: 30, max: 60,  a: 0.048, b: 1.0,   c: 3.653 },
    { min: 60, max: 200, a: 0.038, b: 1.0,   c: 2.755 },
  ],
  femme: [
    { min: 3,  max: 10,  a: 0.244, b: 0.669, c: 0.130 },
    { min: 10, max: 18,  a: 0.085, b: 1.0,   c: 0.388 },
    { min: 18, max: 30,  a: 0.062, b: 1.0,   c: 2.036 },
    { min: 30, max: 60,  a: 0.034, b: 1.0,   c: 3.538 },
    { min: 60, max: 200, a: 0.033, b: 1.0,   c: 1.765 },
  ],
};

const PAL = [1.40, 1.55, 1.70, 1.90, 2.10];

const GOALS = [
  { key: "loss",     icon: "↓", label: "Perte",   full: "Perte de poids",  desc: "Deficit -20%", factor: 0.80, col: T.red,    protF: 2.2, lipF: 0.25, tip: "-20% du TDEE = perte de 0,5 kg/sem sans fonte musculaire." },
  { key: "maintain", icon: "o", label: "Maintien", full: "Maintien",        desc: "Equilibre",    factor: 1.00, col: T.blue,   protF: 1.8, lipF: 0.28, tip: "Couvre exactement ta depense pour stabiliser le poids." },
  { key: "gain",     icon: "↑", label: "Masse",    full: "Prise de masse",  desc: "Surplus +10%", factor: 1.10, col: T.accent, protF: 2.4, lipF: 0.25, tip: "+10% du TDEE pour la synthese musculaire." },
];

function calcBMR({ sex, weight, age }) {
  if (!weight || !age) return 0;
  const rows = BK[sex === "femme" ? "femme" : "homme"];
  const r = rows.find(r => age >= r.min && age < r.max);
  if (!r) return 0;
  return (r.a * Math.pow(weight, r.b) + r.c) * 238.846;
}
function calcTDEE(p) { return Math.round(calcBMR(p) * (PAL[p.activityLevel ?? 0])); }
function getGoal(p) { return GOALS.find(g => g.key === (p.goal || "maintain")) || GOALS[1]; }
function calcAdjKcal(p) { return Math.round(calcTDEE(p) * getGoal(p).factor); }
function calcMacros(p) {
  const kcal = calcAdjKcal(p), g = getGoal(p), w = p.weight || 70;
  const prot = Math.round(w * g.protF);
  const lip = Math.round((kcal * g.lipF) / 9);
  const gluc = Math.max(0, Math.round((kcal - prot * 4 - lip * 9) / 4));
  return { prot, lip, gluc };
}
function calcWater(p) {
  return Math.round(((p.weight || 70) * 35 + [0, 200, 300, 400, 500, 600, 700][p.activityLevel ?? 0]) / 100) * 100;
}
function today() { return new Date().toISOString().slice(0, 10); }

function ArcRing({ value, max, color, size = 96, stroke = 5, children }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r, pct = Math.min(value / (max || 1), 1);
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}18`} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .6s cubic-bezier(.34,1.56,.64,1)" }} />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

function Bar({ value, max, color, height = 4, radius = 99 }) {
  return (
    <div style={{ height, borderRadius: radius, background: `${color}18`, overflow: "hidden" }}>
      <div style={{ height: "100%", background: color, width: `${Math.min(value / (max || 1) * 100, 100)}%`, borderRadius: radius, transition: "width .5s cubic-bezier(.34,1.56,.64,1)" }} />
    </div>
  );
}

const TrashBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="#FF3B30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
);
function MacroTag({ label, value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, background: `${color}12`, borderRadius: 99, padding: "4px 10px" }}>
      <div style={{ width: 6, height: 6, borderRadius: 99, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 600, color, fontFamily: F.text }}>{label} {value}g</span>
    </div>
  );
}

function SectionHeader({ title, action, onAction }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 8px" }}>
      <span style={{ fontSize: 20, fontWeight: 700, color: T.primary, fontFamily: F.display, letterSpacing: "-0.4px" }}>{title}</span>
      {action && <button onClick={onAction} style={{ ...btnGhost, fontSize: 13, padding: "6px 12px" }}>{action}</button>}
    </div>
  );
}

function Row({ label, value, col, last }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: last ? "none" : `1px solid ${T.sep}` }}>
      <span style={{ fontSize: 15, color: T.secondary, fontFamily: F.text }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 500, color: col || T.primary, fontFamily: F.text }}>{value}</span>
    </div>
  );
}

const ACT_LABELS = [
  "Sedentaire (pas ou peu d'exercice) — NAP 1.40",
  "Legerement actif (exercices legers ou sport 1 a 3 fois/sem) — NAP 1.55",
  "Moderement actif (exercices moderes 3 a 5 fois/sem) — NAP 1.70",
  "Tres actif (exercices soutenus 6 a 7 fois/sem) — NAP 1.90",
  "Intensement actif (exercices intenses et metier physique) — NAP 2.10",
];

function HomeTab({ profile, setProfile, onLogout, userEmail }) {
  const [edit, setEdit] = useState(false);
  const [editHero, setEditHero] = useState(false);
  const [local, setLocal] = useState(profile);
  const [photo, setPhoto] = useState(profile.photo || null);
  const fileRef = useRef(null);
  const bmr = Math.round(calcBMR(profile));
  const tdee = calcTDEE(profile);
  const adj = calcAdjKcal(profile);
  const macros = calcMacros(profile);
  const water = calcWater(profile);
  const g = getGoal(profile);
  const save = () => { setProfile(local); setEdit(false); };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhoto(ev.target.result);
      setProfile(p => ({ ...p, photo: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ paddingBottom: 90, background: T.bg, minHeight: "100vh" }}>
      <div style={{ padding: "56px 20px 16px", background: T.bgCard, boxShadow: shadow.sm }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.accent, fontFamily: F.text, letterSpacing: "0.04em", textTransform: "uppercase" }}>Mon profil</p>
          <button onClick={onLogout} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={T.red} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16,17 21,12 16,7" stroke={T.red} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke={T.red} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Photo de profil */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 64, height: 64, borderRadius: 99, overflow: "hidden", background: T.bgInput, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${T.accent}30` }}>
                {photo
                  ? <img src={photo} alt="profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 28 }}>👤</span>
                }
              </div>
              {editHero && (
                <button onClick={() => fileRef.current.click()} style={{ position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: 99, background: T.accent, border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 11 }}>✏️</button>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
            </div>

            {/* Nom + infos */}
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: T.primary, fontFamily: F.display, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
                {profile.name ? `Bonjour ${profile.name}` : "Bonjour"}
              </h1>

            </div>
          </div>

          <button onClick={() => { setLocal(profile); setEditHero(!editHero); }} style={{ ...btnGhost, marginTop: 4, fontSize: 13, padding: "7px 14px" }}>
            {editHero ? "Fermer" : "Modifier"}
          </button>
        </div>

        {/* Mini formulaire hero */}
        {editHero && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.sep}` }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ marginBottom: 10, padding: "10px 12px", background: T.bgInput, borderRadius: R.sm }}>
              <p style={{ margin: 0, fontSize: 11, color: T.quaternary, fontFamily: F.text }}>Compte connecté</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 500, color: T.secondary, fontFamily: F.text }}>{userEmail}</p>
            </div>
              <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Prenom / Pseudo</label>
              <input style={inputStyle} type="text" placeholder="Ton prenom" value={local.name || ""}
                onChange={e => setLocal({ ...local, name: e.target.value })} />
            </div>
            {/* Sexe */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Sexe</label>
              <div style={{ display: "flex", background: T.bgInput, borderRadius: R.sm, padding: 3, gap: 3 }}>
                {["homme", "femme"].map(s => (
                  <button key={s} style={{ ...pill(local.sex === s, T.blue), flex: 1, padding: "9px 0" }}
                    onClick={() => setLocal({ ...local, sex: s })}>
                    {s === "homme" ? "Homme" : "Femme"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {[["Poids", "weight", "kg"], ["Taille", "height", "cm"]].map(([lbl, key, unit]) => (
                <div key={key} style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 3 }}>{lbl} ({unit})</label>
                  <input style={{ ...inputStyle, fontSize: 13, padding: "9px 10px" }} type="number" placeholder={lbl} value={local[key] || ""}
                    onChange={e => setLocal({ ...local, [key]: +e.target.value })} />
                </div>
              ))}
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 3 }}>Date de naissance</label>
                <input style={{ ...inputStyle, fontSize: 11, padding: "9px 10px" }} type="date" value={local.birthdate || ""}
                  onChange={e => {
                    const age = Math.floor((new Date() - new Date(e.target.value)) / (365.25 * 24 * 60 * 60 * 1000));
                    setLocal({ ...local, birthdate: e.target.value, age });
                  }} />
              </div>
            </div>
            {/* Niveau d'activite NAP */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Niveau d'activite</label>
              {["Sedentaire", "Legerement actif", "Moderement actif", "Tres actif", "Intensement actif"].map((label, i) => (
                <div key={i} onClick={() => setLocal({ ...local, activityLevel: i })}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 6, borderRadius: R.sm, cursor: "pointer",
                    background: local.activityLevel === i ? T.accentSoft : T.bgInput,
                    border: `1px solid ${local.activityLevel === i ? T.accent : "transparent"}` }}>
                  <div style={{ width: 16, height: 16, borderRadius: 99, border: `2px solid ${local.activityLevel === i ? T.accent : T.quaternary}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {local.activityLevel === i && <div style={{ width: 8, height: 8, borderRadius: 99, background: T.accent }} />}
                  </div>
                  <span style={{ fontSize: 12, color: local.activityLevel === i ? T.accent : T.secondary, fontFamily: F.text, fontWeight: local.activityLevel === i ? 600 : 400 }}>{label}</span>
                </div>
              ))}
            </div>
            <button style={{ ...btnPrimary(), width: "100%", padding: "11px" }} onClick={() => { setProfile(local); setEditHero(false); }}>
              Enregistrer
            </button>
          </div>
        )}
      </div>

      <div style={{ ...card(), marginTop: 16, padding: 16 }}>
        <p style={labelStyle}>Objectif</p>
        <div style={{ display: "flex", background: T.bgInput, borderRadius: R.sm, padding: 3, gap: 3 }}>
          {GOALS.map(goal => {
            const active = (profile.goal || "maintain") === goal.key;
            return (
              <button key={goal.key} onClick={() => setProfile({ ...profile, goal: goal.key })}
                style={{ ...pill(active, goal.col), display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "10px 0", flex: 1 }}>
                <span style={{ fontSize: 17, lineHeight: 1 }}>{goal.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{goal.label}</span>
                <span style={{ fontSize: 10, opacity: 0.8, fontWeight: 400 }}>{goal.desc}</span>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 12, padding: "10px 12px", background: `${g.col}0e`, borderRadius: R.sm, borderLeft: `2.5px solid ${g.col}` }}>
          <p style={{ margin: 0, fontSize: 12, color: g.col, fontFamily: F.text, lineHeight: 1.5 }}>{g.tip}</p>
        </div>
      </div>

      <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 20px 0" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: T.tertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: F.text }}>Objectif calorique</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 52, fontWeight: 800, color: g.col, fontFamily: F.display, letterSpacing: "-2px", lineHeight: 1 }}>{adj || "-"}</span>
              <span style={{ fontSize: 16, color: T.tertiary, fontFamily: F.text }}>kcal/j</span>
            </div>
        </div>

        <div style={{ display: "flex", gap: 0, margin: "12px 20px", background: T.bgInput, borderRadius: R.sm, overflow: "hidden" }}>
          {[
            { l: "MB",      v: bmr,  sub: "Black & Al" },
            { l: "TDEE",    v: tdee, sub: "Activite" },
            { l: g.label,   v: adj,  sub: g.desc, col: g.col },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, padding: "10px 0", textAlign: "center", borderRight: i < 2 ? `1px solid ${T.sep}` : "none" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: item.col || T.primary, fontFamily: F.display }}>{item.v}</div>
              <div style={{ fontSize: 10, color: T.tertiary, fontFamily: F.text, marginTop: 1 }}>{item.l}</div>
              <div style={{ fontSize: 9, color: T.quaternary, fontFamily: F.text }}>{item.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { l: "Proteines", v: macros.prot, c: T.prot, kcal: Math.round(macros.prot * 4) },
              { l: "Glucides",  v: macros.gluc, c: T.gluc, kcal: Math.round(macros.gluc * 4) },
              { l: "Lipides",   v: macros.lip,  c: T.lip,  kcal: Math.round(macros.lip * 9) },
            ].map(m => (
              <div key={m.l} style={{ background: `${m.c}0e`, borderRadius: R.md, padding: "12px 10px", border: `1px solid ${m.c}20` }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: m.c, marginBottom: 8 }} />
                <div style={{ fontSize: 20, fontWeight: 800, color: m.c, fontFamily: F.display, letterSpacing: "-0.5px" }}>{m.v}g</div>
                <div style={{ fontSize: 10, color: T.tertiary, fontFamily: F.text, marginTop: 2 }}>{m.l}</div>
                <div style={{ fontSize: 10, color: T.quaternary, fontFamily: F.text }}>{m.kcal} kcal</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", background: T.bgInput, borderRadius: R.sm, padding: "10px 14px" }}>
            <span style={{ fontSize: 13, color: T.tertiary, fontFamily: F.text }}>Eau recommandee</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.blue, fontFamily: F.display }}>{water} ml</span>
          </div>
        </div>
      </div>

      {edit && (
        <div style={{ ...card(), padding: 0 }}>
          <div style={{ padding: "16px 16px 0" }}>
            <p style={labelStyle}>Informations personnelles</p>
            <div style={{ display: "flex", background: T.bgInput, borderRadius: R.sm, padding: 3, gap: 3, marginBottom: 14 }}>
              {["homme", "femme"].map(s => (
                <button key={s} style={{ ...pill(local.sex === s, T.blue), flex: 1, padding: "9px 0" }}
                  onClick={() => setLocal({ ...local, sex: s })}>
                  {s === "homme" ? "Homme" : "Femme"}
                </button>
              ))}
            </div>
          </div>
          {[["Poids", "weight", "kg"], ["Taille", "height", "cm"], ["Age", "age", "ans"]].map(([lbl, key, unit]) => (
            <div key={key} style={{ padding: "0 16px", marginBottom: 10 }}>
              <label style={{ fontSize: 13, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>{lbl} ({unit})</label>
              <input style={inputStyle} type="number" value={local[key] || ""} placeholder={lbl}
                onChange={e => setLocal({ ...local, [key]: +e.target.value })} />
            </div>
          ))}
          <div style={{ padding: "0 16px" }}>
            <label style={{ fontSize: 13, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Niveau d'activite</label>
            <select style={{ ...inputStyle, marginBottom: 0 }} value={local.activityLevel ?? 0}
              onChange={e => setLocal({ ...local, activityLevel: +e.target.value })}>
              {ACT_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
            </select>
          </div>
          <div style={{ padding: 16 }}>
            <button style={{ ...btnPrimary(), width: "100%", fontSize: 16, padding: "13px" }} onClick={save}>Enregistrer</button>
          </div>
        </div>
      )}

      {!edit && (
        <div style={{ ...card(), padding: 0 }}>
          <p style={{ ...labelStyle, padding: "14px 16px 0", marginBottom: 0 }}>Recapitulatif</p>
          {[
            ["Sexe",     profile.sex === "femme" ? "Femme" : "Homme", null],
            ["Poids",    profile.weight ? `${profile.weight} kg` : "-", null],
            ["Taille",   profile.height ? `${profile.height} cm` : "-", null],
            ["Age",      profile.age ? `${profile.age} ans` : "-", null],
            ["Activite", ["Sedentaire", "Legerement actif", "Moderement actif", "Tres actif", "Intensement actif"][profile.activityLevel ?? 0], T.blue],
            ["Objectif", g.full + " - " + g.desc, g.col],
          ].map(([k, v, c], i, arr) => (
            <Row key={k} label={k} value={v} col={c} last={i === arr.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

const MEALS = ["Petit dejeuner", "Collation matin", "Dejeuner", "Collation apres-midi", "Diner"];
const MEAL_KEYS = ["breakfast", "snack_am", "lunch", "snack_pm", "dinner"];
const MEAL_ICONS = ["☀️", "🍎", "🥗", "🧃", "🌙"];

const FOODS_DB = [
  // Viandes & poissons
  { name: "Poulet grillé 100g",        prot: 31,  gluc: 0,    lip: 3.6,  kcal: 165 },
  { name: "Boeuf haché 5% 100g",       prot: 21,  gluc: 0,    lip: 5,    kcal: 130 },
  { name: "Saumon 100g",               prot: 20,  gluc: 0,    lip: 13,   kcal: 208 },
  { name: "Thon en boite 100g",        prot: 25,  gluc: 0,    lip: 1,    kcal: 116 },
  { name: "Crevettes 100g",            prot: 18,  gluc: 0,    lip: 1,    kcal: 85  },
  { name: "Dinde 100g",                prot: 29,  gluc: 0,    lip: 1,    kcal: 135 },
  { name: "Oeuf entier",               prot: 6,   gluc: 0.6,  lip: 5,    kcal: 70,  unit: "unité" },  
  { name: "Blanc d'oeuf",              prot: 4,   gluc: 0.2,  lip: 0,    kcal: 17,  unit: "unité" },
  { name: "Jambon blanc 30g",          prot: 6,   gluc: 0.5,  lip: 1,    kcal: 35  },
  // Produits laitiers
  { name: "Fromage blanc 0% 100g",     prot: 8,   gluc: 4,    lip: 0.1,  kcal: 50  },
  { name: "Yaourt nature 125g",        prot: 5,   gluc: 6,    lip: 3,    kcal: 70  },
  { name: "Yaourt 0% 125g",            prot: 7,   gluc: 6,    lip: 0,    kcal: 50  },
  { name: "Lait entier 100ml",         prot: 3.2, gluc: 4.8,  lip: 3.6,  kcal: 65  },
  { name: "Lait demi-écrémé 100ml",    prot: 3.3, gluc: 5,    lip: 1.6,  kcal: 46  },
  { name: "Skyr nature 100g",          prot: 11,  gluc: 4,    lip: 0.2,  kcal: 63  },
  { name: "Parmesan 30g",              prot: 10,  gluc: 0,    lip: 10,   kcal: 130 },
  { name: "Emmental 30g",              prot: 8,   gluc: 0,    lip: 9,    kcal: 114 },
  // Féculents & céréales
  { name: "Riz blanc cuit 100g",       prot: 2.7, gluc: 28,   lip: 0.3,  kcal: 130 },
  { name: "Pâtes cuites 100g",         prot: 5,   gluc: 25,   lip: 0.9,  kcal: 131 },
  { name: "Pain complet 1 tranche",    prot: 3,   gluc: 12,   lip: 1,    kcal: 65  },
  { name: "Pain blanc 1 tranche",      prot: 2.5, gluc: 15,   lip: 0.7,  kcal: 75  },
  { name: "Flocons d'avoine 50g",      prot: 6,   gluc: 30,   lip: 3.5,  kcal: 185 },
  { name: "Quinoa cuit 100g",          prot: 4,   gluc: 19,   lip: 1.5,  kcal: 120 },
  { name: "Pomme de terre cuite 100g", prot: 2,   gluc: 17,   lip: 0.1,  kcal: 77  },
  { name: "Patate douce cuite 100g",   prot: 1.6, gluc: 20,   lip: 0.1,  kcal: 86  },
  { name: "Lentilles cuites 100g",     prot: 9,   gluc: 20,   lip: 0.4,  kcal: 116 },
  { name: "Pois chiches cuits 100g",   prot: 8.9, gluc: 27,   lip: 2.6,  kcal: 164 },
  // Fruits
  { name: "Banane",                    prot: 1.3, gluc: 23,   lip: 0.3,  kcal: 89,  unit: "unité" },
  { name: "Pomme",                     prot: 0.3, gluc: 14,   lip: 0.2,  kcal: 52,  unit: "unité" },
  { name: "Orange",                    prot: 1,   gluc: 12,   lip: 0.2,  kcal: 47,  unit: "unité" },
  { name: "Fraises 100g",              prot: 0.8, gluc: 8,    lip: 0.3,  kcal: 32  },
  { name: "Myrtilles 100g",            prot: 0.7, gluc: 14,   lip: 0.3,  kcal: 57  },
  { name: "Mangue 100g",               prot: 0.8, gluc: 15,   lip: 0.4,  kcal: 60  },
  { name: "Avocat 100g",               prot: 2,   gluc: 2,    lip: 15,   kcal: 160 },
  { name: "Kiwi",                      prot: 1.1, gluc: 15,   lip: 0.5,  kcal: 61,  unit: "unité" },
  // Légumes
  { name: "Épinards 100g",             prot: 2.9, gluc: 3.6,  lip: 0.4,  kcal: 23  },
  { name: "Brocoli 100g",              prot: 2.8, gluc: 7,    lip: 0.4,  kcal: 34  },
  { name: "Carotte 100g",              prot: 0.9, gluc: 10,   lip: 0.2,  kcal: 41  },
  { name: "Courgette 100g",            prot: 1.2, gluc: 3.1,  lip: 0.3,  kcal: 17  },
  { name: "Tomate 100g",               prot: 0.9, gluc: 3.9,  lip: 0.2,  kcal: 18  },
  { name: "Concombre 100g",            prot: 0.7, gluc: 3.6,  lip: 0.1,  kcal: 16  },
  { name: "Salade verte 100g",         prot: 1.4, gluc: 2.2,  lip: 0.2,  kcal: 15  },
  // Légumineuses & oléagineux
  { name: "Amandes 30g",               prot: 6,   gluc: 5,    lip: 14,   kcal: 170 },
  { name: "Noix 30g",                  prot: 4.5, gluc: 3,    lip: 19,   kcal: 196 },
  { name: "Beurre de cacahuète 30g",   prot: 7.5, gluc: 6,    lip: 16,   kcal: 190 },
  // Matières grasses
  { name: "Huile d'olive 10ml",        prot: 0,   gluc: 0,    lip: 10,   kcal: 90  },
  { name: "Beurre 10g",                prot: 0.1, gluc: 0.1,  lip: 8.2,  kcal: 74  },
  // Divers
  { name: "Whey protéine 30g",         prot: 22,  gluc: 3,    lip: 2,    kcal: 118 },
  { name: "Miel 15g",                  prot: 0.1, gluc: 12,   lip: 0,    kcal: 46  },
  { name: "Chocolat noir 20g",         prot: 1.6, gluc: 10,   lip: 6,    kcal: 110 },
];

 function NutritionTab({ profile, logs, setLogs, sportKcal, recipes, setRecipes, user }) {
  const [scanning, setScanning] = useState(false);
  const [recentFoods, setRecentFoods] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
const [searchLoading, setSearchLoading] = useState(false);
const searchOpenFoodFacts = async (query) => {
  if (query.length < 2) { setSearchResults([]); return; }
  setSearchLoading(true);
  try {
    const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&lc=fr&cc=fr&sort_by=unique_scans_n`);
    const data = await res.json();
    const results = (data.products || [])
      .filter(p => p.product_name && p.nutriments)
      .map(p => ({
        name: p.product_name,
        prot: Math.round(p.nutriments["proteins_100g"] || 0),
        gluc: Math.round(p.nutriments["carbohydrates_100g"] || 0),
        lip: Math.round(p.nutriments["fat_100g"] || 0),
        kcal: Math.round(p.nutriments["energy-kcal_100g"] || 0),
      }));
    setSearchResults(results);
  } catch (e) {
    console.error("Erreur recherche:", e);
  }
  setSearchLoading(false);
};
  const [swipedRecipe, setSwipedRecipe] = useState(null);
const [swipeOffset, setSwipeOffset] = useState(0);
const [modalTab, setModalTab] = useState("search");
const [newRecipe, setNewRecipe] = useState({ name: "", ingredients: [] });
const [recipeSearch, setRecipeSearch] = useState("");
const [recipeSearchResults, setRecipeSearchResults] = useState([]);
const [recipeQuantityModal, setRecipeQuantityModal] = useState(null);
const [recipeQuantity, setRecipeQuantity] = useState("100");
const [scanResult, setScanResult] = useState(null);
const [aiScanModal, setAiScanModal] = useState(false);
const [aiScanLoading, setAiScanLoading] = useState(false);
const [aiScanResults, setAiScanResults] = useState([]);
const [aiScanMeal, setAiScanMeal] = useState("lunch");
const [aiScanImage, setAiScanImage] = useState(null);
const [quantityModal, setQuantityModal] = useState(null);
const [editFood, setEditFood] = useState(null);
const [editQuantity, setEditQuantity] = useState("100");
const [quantity, setQuantity] = useState("100");
const saveRecipe = async () => {
  if (!newRecipe.name || newRecipe.ingredients.length === 0) return;
  const recipeToSave = { name: newRecipe.name, ingredients: newRecipe.ingredients };
  if (newRecipe.editIndex !== undefined) {
    const recipeId = recipes[newRecipe.editIndex]?.id;
    setRecipes(r => r.map((rec, i) => i === newRecipe.editIndex ? { ...rec, ...recipeToSave } : rec));
    try {
      if (recipeId) {
        await supabase.from("recipes").update({ name: recipeToSave.name, ingredients: recipeToSave.ingredients }).eq("id", recipeId);
      }
    } catch (e) {
      console.error("Erreur mise a jour:", JSON.stringify(e), e);
    }
  } else {
    setRecipes(r => [...r, recipeToSave]);
    try {
      await supabase.from("recipes").insert({ user_id: user.id, name: recipeToSave.name, ingredients: recipeToSave.ingredients });
    } catch (e) {
      console.error("Erreur sauvegarde:", JSON.stringify(e), e);
    }
  }
  setNewRecipe({ name: "", ingredients: [] });
  setModalTab("recipes");
};
const fileInputRef = useRef(null);
const [barcodeScanning, setBarcodeScanning] = useState(false);
const [showLiveScanner, setShowLiveScanner] = useState(false);
const [scannerContext, setScannerContext] = useState("nutrition");
const savedAddToRef = useRef(null);
const liveScannerRef = useRef(null);
const analyzeImageWithAI = async (base64Image, mediaType = "image/jpeg") => {
  setAiScanLoading(true);
  console.log("API KEY:", import.meta.env.VITE_ANTHROPIC_API_KEY);
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64Image },
            },
            {
              type: "text",
              text: `Analyse cette photo de repas et liste tous les aliments visibles. Pour chaque aliment, estime le grammage. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, avec ce format exact:
{"aliments": [{"nom": "Poulet grillé", "grammes": 150, "kcal": 248, "prot": 46, "gluc": 0, "lip": 5}, ...]}
Sois précis sur les estimations de grammage en fonction de ce que tu vois dans l'assiette.`
            }
          ]
        }]
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error("Erreur API détail:", errText);
      throw new Error(errText);
    }
    const data = await response.json();
    const text = data.content[0].text;
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    setAiScanResults(parsed.aliments.map(a => ({ ...a, selected: true })));
  } catch (e) {
    alert("Erreur lors de l'analyse. Vérifie ta clé API.");
    console.error(e);
  }
  setAiScanLoading(false);
};

const handleAiScanFile = (file) => {
  const img = new Image();
  const objectUrl = URL.createObjectURL(file);
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const jpegBase64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
    setAiScanImage(canvas.toDataURL("image/jpeg", 0.85));
    analyzeImageWithAI(jpegBase64, "image/jpeg");
    URL.revokeObjectURL(objectUrl);
  };
  img.src = objectUrl;
};
const startBarcodeScanner = async () => {
  setShowLiveScanner(true);
  setTimeout(() => { initLiveScanner("live-scanner"); }, 300);
};

const stopBarcodeScanner = () => {
  if (liveScannerRef.current) {
    liveScannerRef.current.stop().catch(() => {});
    liveScannerRef.current = null;
  }
  setShowLiveScanner(false);
};

const initLiveScanner = async (elementId) => {
  try {
    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode(elementId);
    liveScannerRef.current = scanner;
    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 150 } },
      async (decodedText) => {
        stopBarcodeScanner();
        await handleBarcodeScan(decodedText);
      },
      () => {}
    );
  } catch (e) {
    console.error("Scanner error:", e);
alert("Erreur scanner: " + String(e) + " msg: " + e?.message);
    setShowLiveScanner(false);
  }
};

const handleBarcodeScan = async (barcode) => {
  setBarcodeScanning(false);
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    if (data.status === 1) {
      const p = data.product;
      const n = p.nutriments;
      const food = {
        name: p.product_name || "Produit inconnu",
        prot: Math.round(n["proteins_100g"] || 0),
        gluc: Math.round(n["carbohydrates_100g"] || 0),
        lip: Math.round(n["fat_100g"] || 0),
        kcal: Math.round(n["energy-kcal_100g"] || 0),
      };
      if (scannerContext === "recipe") {
        setRecipeQuantityModal(food);
        setRecipeQuantity("100");
      } else {
        if (savedAddToRef.current) setAddTo(savedAddToRef.current);
        setQuantityModal(food);
        setQuantity("100");
      }
    } else {
      alert("Produit non trouvé dans la base de données.");
    }
  } catch (err) {
    alert("Erreur lors de la recherche du produit.");
  }
};
const handleScan = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
};
const addScannedIngredients = (ingredients) => {
  ingredients.forEach(ing => {
    const food = {
      name: ing.name + (ing.grams ? ` ${ing.grams}g` : ""),
      prot: ing.prot,
      gluc: ing.gluc,
      lip: ing.lip,
      kcal: ing.kcal,
    };
    setLogs(p => {
      const d = p[selDate] || { meals: {}, water: 0 };
      return { ...p, [selDate]: { ...d, meals: { ...d.meals, [addTo]: [...(d.meals[addTo] || []), food] } } };
    });
  });
  setScanResult(null);
  setAddTo(null);
};

  const [selDate, setSelDate] = useState(today());
  const [addTo, setAddTo] = useState(null);
  const [search, setSearch] = useState("");
  const adj = calcAdjKcal(profile);
  const macros = calcMacros(profile);
  const wGoal = calcWater(profile);
  const g = getGoal(profile);
  const day = logs[selDate] || { meals: {}, water: 0 };
  const all = Object.entries(day.meals || {}).filter(([key]) => key !== "null" && key !== null).flatMap(([, foods]) => foods);
  console.log("all foods:", all);
  const tP = all.reduce((s, f) => s + (f.prot || 0), 0);
  const tG = all.reduce((s, f) => s + (f.gluc || 0), 0);
  const tL = all.reduce((s, f) => s + (f.lip || 0), 0);
  const tK = all.reduce((s, f) => s + (f.kcal || 0), 0);
  const target = adj + sportKcal;
  const remain = Math.max(0, target - tK);
  const wNow = day.water || 0;

  const updW = v => setLogs(p => ({ ...p, [selDate]: { ...p[selDate] || {}, water: Math.max(0, (p[selDate]?.water || 0) + v) } }));
  const addFood = f => {
  setQuantityModal(f);
  setQuantity(f.unit === "unité" ? "1" : "100");
};

const confirmAddFood = (f, qty) => {
  const ratio = f.unit === "unité" ? qty : qty / 100;
const food = {
  name: f.unit === "unité" ? `${f.name.replace(/\s*\d+g$/i, "")} x${qty}` : `${f.name.replace(/\s*\d+g$/i, "")} ${qty}g`,
  prot: Math.round(f.prot * ratio * 10) / 10,
  gluc: Math.round(f.gluc * ratio * 10) / 10,
  lip: Math.round(f.lip * ratio * 10) / 10,
  kcal: Math.round(f.kcal * ratio),
};
  setRecentFoods(prev => {
    const filtered = prev.filter(r => r.name !== f.name);
    return [f, ...filtered].slice(0, 10);
  });
  if (!addTo) return;
  const d = logs[selDate] || { meals: {}, water: 0 };
const newLogs = { ...logs, [selDate]: { ...d, meals: { ...d.meals, [addTo]: [...(d.meals[addTo] || []), food] } } };
setLogs(newLogs);
  setQuantityModal(null);
  setAddTo(null);
  setSearch("");
};
  const remFood = (mk, idx) => setLogs(p => { const d = p[selDate] || { meals: {}, water: 0 }; const m = [...(d.meals[mk] || [])]; m.splice(idx, 1); return { ...p, [selDate]: { ...d, meals: { ...d.meals, [mk]: m } } }; });
  const filtered = search.length > 1 
  ? FOODS_DB.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
  : [];

  console.log("recipeQuantityModal:", recipeQuantityModal);
  return (
    <div style={{ paddingBottom: 90, background: T.bg, minHeight: "100vh" }}>
      <div style={{ padding: "56px 20px 16px", background: T.bgCard, boxShadow: shadow.sm }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.accent, fontFamily: F.text, letterSpacing: "0.04em", textTransform: "uppercase" }}>Alimentation</p>
        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => {
            const d = new Date(selDate);
            d.setDate(d.getDate() - 1);
            setSelDate(d.toISOString().slice(0, 10));
          }} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke={T.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 onClick={() => document.getElementById("datePickerNutri").click()}
            style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.blue, fontFamily: F.display, letterSpacing: "-0.5px", lineHeight: 1.08, cursor: "pointer", flex: 1, textAlign: "center" }}>
            {new Date(selDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </h1>
          <button onClick={() => {
            const d = new Date(selDate);
            d.setDate(d.getDate() + 1);
            setSelDate(d.toISOString().slice(0, 10));
          }} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke={T.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <input id="datePickerNutri" type="date" value={selDate} onChange={e => setSelDate(e.target.value)}
            style={{ display: "none" }} />
        </div>
        </div>

      <button onClick={() => setAiScanModal(true)}
        style={{ ...btnPrimary(T.blue), margin: "12px 16px 0", width: "calc(100% - 32px)", padding: "13px", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>🍽️</span> Scanner mon repas
      </button>
      <div style={{ ...card(), marginTop: 16, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <ArcRing value={tK} max={target} color={tK > target ? T.red : g.col} size={100} stroke={6}>
            <span style={{ fontSize: 18, fontWeight: 800, color: tK > target ? T.red : g.col, fontFamily: F.display, letterSpacing: "-1px" }}>{remain}</span>
            <span style={{ fontSize: 9, color: T.quaternary, fontFamily: F.text }}>restantes</span>
          </ArcRing>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 2px", fontSize: 12, color: T.tertiary, fontFamily: F.text }}>Objectif {g.full}</p>
            <p style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 800, color: T.primary, fontFamily: F.display, letterSpacing: "-0.5px" }}>{tK} <span style={{ fontSize: 14, fontWeight: 500, color: T.tertiary }}>/ {target} kcal</span></p>
            <Bar value={tK} max={target} color={tK > target ? T.red : g.col} height={5} />
            <p style={{ margin: "6px 0 0", fontSize: 11, color: T.tertiary, fontFamily: F.text }}>+{sportKcal} kcal sport inclus</p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.sep}` }}>
          {[
            { l: "Proteines", v: Math.round(tP), m: macros.prot, c: T.prot },
            { l: "Glucides",  v: Math.round(tG), m: macros.gluc, c: T.gluc },
            { l: "Lipides",   v: Math.round(tL), m: macros.lip,  c: T.lip },
          ].map(macro => (
            <ArcRing key={macro.l} value={macro.v} max={macro.m} color={macro.c} size={72} stroke={5}>
              <span style={{ fontSize: 14, fontWeight: 700, color: macro.c, fontFamily: F.display }}>{macro.v}</span>
              <span style={{ fontSize: 8, color: T.quaternary, fontFamily: F.text }}>/{macro.m}g</span>
            </ArcRing>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 6 }}>
          {["Proteines", "Glucides", "Lipides"].map((l, i) => (
            <span key={l} style={{ fontSize: 10, fontWeight: 600, color: [T.prot, T.gluc, T.lip][i], textAlign: "center", width: 72, fontFamily: F.text, display: "block" }}>
              {l}<br />
              <span style={{ color: T.quaternary, fontWeight: 400 }}>
                reste {Math.max(0, [macros.prot, macros.gluc, macros.lip][i] - Math.round([tP, tG, tL][i]))}g
              </span>
            </span>
          ))}
        </div>
      </div>

      {MEAL_KEYS.map((key, i) => {
        const foods = (day.meals || {})[key] || [];
        const mk = foods.reduce((s, f) => s + (f.kcal || 0), 0);
        return (
          <div key={key} style={{ ...card(), padding: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: T.bgInput, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{MEAL_ICONS[i]}</div>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.primary, fontFamily: F.text }}>{MEALS[i]}</p>
                  {foods.length > 0 && (
                    <div>
                      <p style={{ margin: "2px 0 4px", fontSize: 12, color: T.tertiary, fontFamily: F.text }}>{Math.round(mk)} kcal</p>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        <MacroTag label="P" value={Math.round(foods.reduce((s, f) => s + (f.prot || 0), 0))} color={T.prot} />
                        <MacroTag label="G" value={Math.round(foods.reduce((s, f) => s + (f.gluc || 0), 0))} color={T.gluc} />
                        <MacroTag label="L" value={Math.round(foods.reduce((s, f) => s + (f.lip || 0), 0))} color={T.lip} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => setAddTo(key)} style={{ ...btnGhost, padding: "7px 14px", fontSize: 13 }}>+ Ajouter</button>
            </div>
            {foods.length > 0 && (
              <div style={{ padding: "0 16px 14px" }}>
                {foods.map((f, fi) => (
  <div key={fi} style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.sep}` }}>
    <span style={{ fontSize: 14, color: T.secondary, fontFamily: F.text, fontWeight: 500, display: "block", marginBottom: 4 }}>
      {f.name.includes(' x') || f.name.match(/\d+g$/) ? (
        <>
          <span style={{ fontWeight: 700, color: T.primary }}>
            {f.name.includes(' x') ? f.name.split(' x')[1] : f.name.match(/(\d+g)$/)?.[1]} ×
          </span>
          {' '}{f.name.includes(' x') ? f.name.split(' x')[0] : f.name.replace(/\s\d+g$/, '')}
        </>
      ) : f.name}
    </span>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 6 }}>
        <MacroTag label="P" value={f.prot} color={T.prot} />
        <MacroTag label="G" value={f.gluc} color={T.gluc} />
        <MacroTag label="L" value={f.lip} color={T.lip} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.orange, fontFamily: F.display }}>{f.kcal} kcal</span>
        <button onClick={() => {
          setEditFood({ mealKey: key, foodIdx: fi, food: f });
          setEditQuantity(f.name.match(/(\d+)g$/) ? f.name.match(/(\d+)g$/)[1] : f.name.includes(' x') ? f.name.split(' x')[1] : "100");
        }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M11.013 1.427a1.75 1.75 0 012.474 2.474L4.62 12.768l-3.537.393.393-3.537 8.537-8.197z" stroke={T.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <TrashBtn onClick={() => remFood(key, fi)} />
      </div>
    </div>
  </div>
))}
              </div>
            )}
          </div>
        );
      })}
      <div style={{ ...card(), padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: T.primary, fontFamily: F.text }}>Hydratation</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.blue, fontFamily: F.display }}>{wNow}<span style={{ fontSize: 12, fontWeight: 500, color: T.tertiary }}> / {wGoal} ml</span></span>
        </div>
        <Bar value={wNow} max={wGoal} color={wNow >= wGoal ? T.accent : T.blue} height={6} />
        <p style={{ margin: "8px 0 14px", fontSize: 12, color: T.tertiary, fontFamily: F.text }}>Recommandation ANSES : {wGoal} ml/jour</p>
        <div style={{ display: "flex", gap: 8 }}>
          {[150, 250, 500].map(v => (
            <button key={v} style={{ flex: 1, background: T.bgInput, border: "none", borderRadius: R.sm, padding: "10px 0", fontSize: 13, fontWeight: 600, color: T.blue, cursor: "pointer", fontFamily: F.text }}
              onClick={() => updW(v)}>+{v}</button>
          ))}
          <button style={{ background: T.redSoft, border: "none", borderRadius: R.sm, padding: "10px 14px", fontSize: 13, fontWeight: 600, color: T.red, cursor: "pointer", fontFamily: F.text }}
            onClick={() => updW(-150)}>-150</button>
        </div>
      </div>
<div id="reader" style={{ display: "none" }}></div>
{aiScanModal && (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", alignItems: "flex-end", backdropFilter: "blur(4px)" }}>
    <div style={{ background: T.bgCard, borderRadius: `${R.xl}px ${R.xl}px 0 0`, padding: "0 0 40px", width: "100%", maxWidth: 430, margin: "0 auto", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(0,0,0,0.12)" }}>
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: T.bgCard, borderBottom: `1px solid ${T.sep}` }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: T.primary, fontFamily: F.text }}>🍽️ Scanner mon repas</span>
        <button onClick={() => { setAiScanModal(false); setAiScanResults([]); setAiScanImage(null); }}
          style={{ background: T.bgInput, border: "none", borderRadius: 99, width: 28, height: 28, fontSize: 16, color: T.tertiary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {!aiScanImage && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ ...btnPrimary(T.blue), padding: "13px", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", borderRadius: R.md, textAlign: "center" }}>
              <span>📷</span> Prendre une photo
              <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                onChange={e => e.target.files[0] && handleAiScanFile(e.target.files[0])} />
            </label>
            <label style={{ ...btnPrimary(T.tertiary), padding: "13px", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", borderRadius: R.md, textAlign: "center" }}>
              <span>🖼️</span> Choisir une photo
              <input type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => e.target.files[0] && handleAiScanFile(e.target.files[0])} />
            </label>
          </div>
        )}
        {aiScanImage && (
          <img src={aiScanImage} alt="repas" style={{ width: "100%", borderRadius: R.lg, marginBottom: 16, maxHeight: 200, objectFit: "cover" }} />
        )}
        {aiScanLoading && (
          <div style={{ textAlign: "center", padding: 32 }}>
            <p style={{ fontSize: 24, marginBottom: 8 }}>🔍</p>
            <p style={{ fontSize: 14, color: T.tertiary, fontFamily: F.text }}>Analyse de ton repas en cours...</p>
          </div>
        )}
        {aiScanResults.length > 0 && (
          <div>
            <p style={{ ...labelStyle, marginBottom: 10 }}>Aliments détectés — modifie si besoin</p>
            {aiScanResults.map((food, i) => (
              <div key={i} style={{ background: food.selected ? T.accentSoft : T.bgInput, borderRadius: R.md, padding: "10px 12px", marginBottom: 8, border: `1px solid ${food.selected ? T.accent : "transparent"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <input value={food.nom} onChange={e => setAiScanResults(r => r.map((x, xi) => xi === i ? { ...x, nom: e.target.value } : x))}
                    style={{ ...inputStyle, fontSize: 13, padding: "4px 8px", flex: 1, marginRight: 8 }} />
                  <button onClick={() => setAiScanResults(r => r.map((x, xi) => xi === i ? { ...x, selected: !x.selected } : x))}
                    style={{ background: food.selected ? T.accent : T.bgInput, border: "none", borderRadius: 99, width: 24, height: 24, cursor: "pointer", color: food.selected ? "#fff" : T.quaternary, fontSize: 12, flexShrink: 0 }}>
                    {food.selected ? "✓" : "○"}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 6 }}>
                  {[["g", "grammes"], ["kcal", "kcal"], ["P", "prot"], ["G", "gluc"], ["L", "lip"]].map(([lbl, key]) => (
                    <div key={key}>
                      <label style={{ fontSize: 9, color: T.quaternary, fontFamily: F.text, display: "block", marginBottom: 2 }}>{lbl}</label>
                      <input type="number" value={food[key] || ""}
                        onChange={e => setAiScanResults(r => r.map((x, xi) => xi === i ? { ...x, [key]: +e.target.value } : x))}
                        style={{ ...inputStyle, fontSize: 11, padding: "4px 6px", textAlign: "center" }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => setAiScanResults(r => [...r, { nom: "", grammes: 0, kcal: 0, prot: 0, gluc: 0, lip: 0, selected: true }])}
              style={{ ...btnGhost, width: "100%", marginBottom: 12, textAlign: "center" }}>+ Ajouter un aliment manquant</button>
            <p style={{ ...labelStyle, marginBottom: 8 }}>Ajouter à quel repas ?</p>
            <div style={{ display: "flex", background: T.bgInput, borderRadius: R.sm, padding: 3, gap: 3, marginBottom: 14, flexWrap: "wrap" }}>
              {MEAL_KEYS.map((key, i) => (
                <button key={key} onClick={() => setAiScanMeal(key)}
                  style={{ ...pill(aiScanMeal === key, T.accent), flex: 1, padding: "7px 0", fontSize: 11, minWidth: 60 }}>
                  {MEAL_ICONS[i]}
                </button>
              ))}
            </div>
            <button onClick={() => {
              const selected = aiScanResults.filter(f => f.selected);
              const d = logs[selDate] || { meals: {}, water: 0 };
              const newFoods = selected.map(f => ({
                name: `${f.nom} ${f.grammes}g`,
                prot: f.prot,
                gluc: f.gluc,
                lip: f.lip,
                kcal: f.kcal,
              }));
              const newLogs = { ...logs, [selDate]: { ...d, meals: { ...d.meals, [aiScanMeal]: [...(d.meals[aiScanMeal] || []), ...newFoods] } } };
              setLogs(newLogs);
              setAiScanModal(false);
              setAiScanResults([]);
              setAiScanImage(null);
            }} style={{ ...btnPrimary(T.accent), width: "100%", padding: "13px", fontSize: 15 }}>
              Ajouter au repas
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)}
{editFood && (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
    <div style={{ background: T.bgCard, borderRadius: R.xl, padding: 24, width: "100%", maxWidth: 340, boxShadow: shadow.lg }}>
      <p style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, color: T.primary, fontFamily: F.text }}>{editFood.food.name.replace(/\s*\d+g$/, "").replace(/\s*x\d+$/, "")}</p>
      <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 6 }}>
        {editFood.food.name.includes(' x') ? "Quantité (nombre)" : "Quantité (grammes)"}
      </label>
      <input type="number" value={editQuantity} onChange={e => setEditQuantity(e.target.value)}
        style={{ ...inputStyle, marginBottom: 16, fontSize: 16 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setEditFood(null)}
          style={{ flex: 1, background: T.bgInput, border: "none", borderRadius: R.md, padding: "12px", fontFamily: F.text, fontSize: 15, fontWeight: 600, color: T.tertiary, cursor: "pointer" }}>
          Annuler
        </button>
        <button onClick={() => {
          const f = editFood.food;
          const isUnit = f.name.includes(' x');
          const baseName = f.name.replace(/\s*\d+g$/, "").replace(/\s*x\d+$/, "");
          const origQty = isUnit ? parseInt(f.name.split(' x')[1]) : parseInt(f.name.match(/(\d+)g$/)?.[1] || "100");
          const origRatio = isUnit ? origQty : origQty / 100;
          const origProt = f.prot / origRatio;
          const origGluc = f.gluc / origRatio;
          const origLip = f.lip / origRatio;
          const origKcal = f.kcal / origRatio;
          const newQty = +editQuantity;
          const newRatio = isUnit ? newQty : newQty / 100;
          const updatedFood = {
            name: isUnit ? `${baseName} x${newQty}` : `${baseName} ${newQty}g`,
            prot: Math.round(origProt * newRatio * 10) / 10,
            gluc: Math.round(origGluc * newRatio * 10) / 10,
            lip: Math.round(origLip * newRatio * 10) / 10,
            kcal: Math.round(origKcal * newRatio),
          };
          const d = logs[selDate] || { meals: {}, water: 0 };
          const updatedMeals = { ...d.meals };
          const mealFoods = [...(updatedMeals[editFood.mealKey] || [])];
          mealFoods[editFood.foodIdx] = updatedFood;
          updatedMeals[editFood.mealKey] = mealFoods;
          const newLogs = { ...logs, [selDate]: { ...d, meals: updatedMeals } };
          setLogs(newLogs);
          setEditFood(null);
        }}
          style={{ ...btnPrimary(T.accent), flex: 1, padding: "12px" }}>
          Modifier
        </button>
      </div>
    </div>
  </div>
)}
{quantityModal && (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
    <div style={{ background: T.bgCard, borderRadius: R.xl, padding: 24, width: "100%", maxWidth: 340, boxShadow: shadow.lg }}>
      <p style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: T.primary, fontFamily: F.text }}>{quantityModal.name}</p>
      <p style={{ margin: "0 0 8px", fontSize: 13, color: T.tertiary, fontFamily: F.text }}>Pour 100g : {quantityModal.prot}g P · {quantityModal.gluc}g G · {quantityModal.lip}g L · {quantityModal.kcal} kcal</p>
{quantity > 0 && (
  <div style={{ margin: "0 0 16px", padding: "10px 12px", background: T.accentSoft, borderRadius: R.sm }}>
    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.accent, fontFamily: F.text }}>
      Pour {quantity}{quantityModal.unit === "unité" ? " unité(s)" : "g"} :
      {" "}{Math.round(quantityModal.prot * (quantityModal.unit === "unité" ? +quantity : +quantity/100))}g P
      {" · "}{Math.round(quantityModal.gluc * (quantityModal.unit === "unité" ? +quantity : +quantity/100))}g G
      {" · "}{Math.round(quantityModal.lip * (quantityModal.unit === "unité" ? +quantity : +quantity/100))}g L
      {" · "}{Math.round(quantityModal.kcal * (quantityModal.unit === "unité" ? +quantity : +quantity/100))} kcal
    </p>
  </div>
)}
      <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 6 }}>
            {quantityModal.unit === "unité" ? "Quantité (nombre)" : "Quantité (grammes)"}
          </label>
      <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
        style={{ ...inputStyle, marginBottom: 16, fontSize: 16 }} 
placeholder={quantityModal.unit === "unité" ? "Nombre d'unités" : "Quantité en grammes"} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setQuantityModal(null)}
          style={{ flex: 1, background: T.bgInput, border: "none", borderRadius: R.md, padding: "12px", fontFamily: F.text, fontSize: 15, fontWeight: 600, color: T.tertiary, cursor: "pointer" }}>
          Annuler
        </button>
        <button onClick={() => confirmAddFood(quantityModal, +quantity)}
          style={{ ...btnPrimary(T.accent), flex: 1, padding: "12px" }}>
          Ajouter
        </button>
      </div>
    </div>
</div>
)}{showLiveScanner && (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <p style={{ color: "#fff", fontFamily: F.text, fontSize: 16, marginBottom: 16 }}>Pointez vers le code-barre</p>
    <div id="live-scanner" style={{ width: 300, height: 200, borderRadius: R.md, overflow: "hidden" }} />
    <button onClick={stopBarcodeScanner}
      style={{ marginTop: 24, background: T.red, border: "none", borderRadius: R.md, padding: "12px 32px", color: "#fff", fontFamily: F.text, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
      Annuler
    </button>
  </div>
)}
{addTo && (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 300, display: "flex", alignItems: "flex-end", backdropFilter: "blur(4px)" }}>
    <div style={{ background: T.bgCard, borderRadius: `${R.xl}px ${R.xl}px 0 0`, padding: "0 0 40px", width: "100%", maxWidth: 430, margin: "0 auto", maxHeight: "78vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(0,0,0,0.12)" }}>
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: T.bgCard, borderBottom: `1px solid ${T.sep}` }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: T.primary, fontFamily: F.text }}>Ajouter un aliment</span>
        <button onClick={() => setAddTo(null)} style={{ background: T.bgInput, border: "none", borderRadius: 99, width: 28, height: 28, fontSize: 16, color: T.tertiary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      </div>
<div style={{ padding: "0 16px 12px", borderBottom: `1px solid ${T.sep}` }}>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleScan} />
        <button onClick={() => { setScannerContext("nutrition"); savedAddToRef.current = addTo; setAddTo(null); startBarcodeScanner(); }}
          style={{ ...btnPrimary(T.blue), width: "100%", padding: "12px", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4M21 9V5a2 2 0 00-2-2h-4M21 15v4a2 2 0 01-2 2h-4M7 8v8M10 8v8M14 8v8M17 8v8"/>
          </svg>
          Scanner un code-barre
        </button>
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
  <input
    type="number"
    placeholder="Ou saisir le code-barre manuellement..."
    style={{ ...inputStyle, fontSize: 13 }}
    onKeyDown={async (e) => {
      if (e.key === "Enter" && e.target.value.length > 5) {
        await handleBarcodeScan(e.target.value);
        e.target.value = "";
      }
    }}
  />
</div>
        {scanResult && (          <div style={{ marginTop: 12 }}>
            <p style={{ ...labelStyle, marginBottom: 8 }}>Résultat du scan — vérifie et corrige</p>
            {scanResult.map((ing, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: T.bgInput, borderRadius: R.sm, marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <input value={ing.name} onChange={e => setScanResult(r => r.map((x, xi) => xi === i ? { ...x, name: e.target.value } : x))}
                    style={{ ...inputStyle, fontSize: 13, padding: "4px 8px", marginBottom: 4 }} />
                  <div style={{ display: "flex", gap: 6 }}>
                    {[["g", "grams"], ["P", "prot"], ["G", "gluc"], ["L", "lip"], ["kcal", "kcal"]].map(([lbl, key]) => (
                      <div key={key} style={{ flex: 1 }}>
                        <span style={{ fontSize: 9, color: T.quaternary, fontFamily: F.text }}>{lbl}</span>
                        <input type="number" value={ing[key]} onChange={e => setScanResult(r => r.map((x, xi) => xi === i ? { ...x, [key]: +e.target.value } : x))}
                          style={{ ...inputStyle, fontSize: 11, padding: "3px 6px" }} />
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => setScanResult(r => r.filter((_, xi) => xi !== i))}
                  style={{ background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: 18, marginLeft: 8 }}>×</button>
              </div>
            ))}
            <button onClick={() => setScanResult(r => [...r, { name: "", grams: 0, prot: 0, gluc: 0, lip: 0, kcal: 0 }])}
              style={{ ...btnGhost, width: "100%", marginBottom: 10, textAlign: "center" }}>+ Ajouter un ingrédient</button>
            <button onClick={() => addScannedIngredients(scanResult)}
              style={{ ...btnPrimary(T.accent), width: "100%", padding: "12px" }}>
              Valider et ajouter au repas
            </button>
          </div>
        )}
      </div>
      {/* Onglets */}
      <div style={{ display: "flex", background: T.bgInput, borderRadius: R.sm, padding: 3, gap: 3, margin: "12px 16px" }}>
        {[["search", "🔍 Recherche"], ["recipes", "📋 Mes recettes"], ["create", "➕ Créer recette"]].map(([key, label]) => (
          <button key={key} onClick={() => setModalTab(key)}
            style={{ ...pill(modalTab === key, T.accent), flex: 1, padding: "8px 0", fontSize: 11 }}>
            {label}
          </button>
        ))}
      </div>

      {recipeQuantityModal && (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
    <div style={{ background: T.bgCard, borderRadius: R.xl, padding: 24, width: "100%", maxWidth: 340, boxShadow: shadow.lg }}>
      <p style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: T.primary, fontFamily: F.text }}>{recipeQuantityModal.name}</p>
      <p style={{ margin: "0 0 8px", fontSize: 13, color: T.tertiary, fontFamily: F.text }}>Pour 100g : {recipeQuantityModal.prot}g P · {recipeQuantityModal.gluc}g G · {recipeQuantityModal.lip}g L · {recipeQuantityModal.kcal} kcal</p>
{recipeQuantity > 0 && (
  <div style={{ margin: "0 0 16px", padding: "10px 12px", background: T.accentSoft, borderRadius: R.sm }}>
    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.accent, fontFamily: F.text }}>
      Pour {recipeQuantity}{recipeQuantityModal.unit === "unité" ? " unité(s)" : "g"} :
      {" "}{Math.round(recipeQuantityModal.prot * (recipeQuantityModal.unit === "unité" ? +recipeQuantity : +recipeQuantity/100))}g P
      {" · "}{Math.round(recipeQuantityModal.gluc * (recipeQuantityModal.unit === "unité" ? +recipeQuantity : +recipeQuantity/100))}g G
      {" · "}{Math.round(recipeQuantityModal.lip * (recipeQuantityModal.unit === "unité" ? +recipeQuantity : +recipeQuantity/100))}g L
      {" · "}{Math.round(recipeQuantityModal.kcal * (recipeQuantityModal.unit === "unité" ? +recipeQuantity : +recipeQuantity/100))} kcal
    </p>
  </div>
)}
      <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 6 }}>
        {recipeQuantityModal.unit === "unité" ? "Quantité (nombre)" : "Quantité (grammes)"}
      </label>
      <input type="number" value={recipeQuantity} onChange={e => setRecipeQuantity(e.target.value)}
        style={{ ...inputStyle, marginBottom: 16, fontSize: 16 }}
        placeholder={recipeQuantityModal.unit === "unité" ? "Nombre d'unités" : "Quantité en grammes"} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setRecipeQuantityModal(null)}
          style={{ flex: 1, background: T.bgInput, border: "none", borderRadius: R.md, padding: "12px", fontFamily: F.text, fontSize: 15, fontWeight: 600, color: T.tertiary, cursor: "pointer" }}>
          Annuler
        </button>
        <button onClick={() => {
          const f = recipeQuantityModal;
          const qty = +recipeQuantity;
          const ratio = f.unit === "unité" ? qty : qty / 100;
          const ing = {
            name: f.unit === "unité" ? `${f.name.replace(/\s*\d+g$/i, "")} x${qty}` : `${f.name.replace(/\s*\d+g$/i, "")} ${qty}g`,
            grams: qty,
            kcal: Math.round(f.kcal * ratio),
            prot: Math.round(f.prot * ratio * 10) / 10,
            gluc: Math.round(f.gluc * ratio * 10) / 10,
            lip: Math.round(f.lip * ratio * 10) / 10,
          };
          setNewRecipe(r => ({ ...r, ingredients: [...r.ingredients, ing] }));
          setRecipeQuantityModal(null);
          setRecipeSearchResults([]);
          setRecipeSearch("");
        }}
          style={{ ...btnPrimary(T.accent), flex: 1, padding: "12px" }}>
          Ajouter
        </button>
      </div>
    </div>
  </div>
)}{/* Onglet Recherche */}
      {modalTab === "search" && (
        <div>
          <div style={{ padding: "0 16px 12px", display: "flex", gap: 8, alignItems: "center" }}>
        <input style={{ ...inputStyle, fontSize: 15, flex: 1 }} placeholder="Rechercher un aliment..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") searchOpenFoodFacts(search); }} />
        <button onClick={() => searchOpenFoodFacts(search)}
          style={{ background: T.blue, border: "none", borderRadius: R.sm, padding: "11px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
          {recentFoods.length > 0 && search === "" && (
            <div style={{ padding: "0 16px 8px" }}>
              <p style={{ ...labelStyle, marginBottom: 8 }}>Récemment utilisés</p>
              {recentFoods.map((f, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: `1px solid ${T.sep}`, cursor: "pointer", background: T.bgInput, borderRadius: R.sm, marginBottom: 6 }}
                  onClick={() => addFood(f)}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: T.primary, fontFamily: F.text }}>{f.name}</p>
                    <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                      <MacroTag label="P" value={f.prot} color={T.prot} />
                      <MacroTag label="G" value={f.gluc} color={T.gluc} />
                      <MacroTag label="L" value={f.lip} color={T.lip} />
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.orange, fontFamily: F.display }}>{f.kcal} kcal</span>
                </div>
              ))}
            </div>
          )}
          {searchLoading && (
  <div style={{ padding: "16px 20px", textAlign: "center" }}>
    <p style={{ margin: 0, fontSize: 13, color: T.tertiary, fontFamily: F.text }}>Recherche en cours...</p>
  </div>
)}
{(search.length > 1 ? [...filtered, ...searchResults.filter(r => !filtered.find(f => f.name.toLowerCase() === r.name.toLowerCase()))] : []).map((f, i) => (
  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: `1px solid ${T.sep}`, cursor: "pointer" }}
    onClick={() => addFood(f)}>
    <div>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: T.primary, fontFamily: F.text }}>{f.name}</p>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <MacroTag label="P" value={f.prot} color={T.prot} />
        <MacroTag label="G" value={f.gluc} color={T.gluc} />
        <MacroTag label="L" value={f.lip} color={T.lip} />
      </div>
    </div>
    <span style={{ fontSize: 14, fontWeight: 700, color: T.orange, fontFamily: F.display }}>{f.kcal} kcal</span>
  </div>
))}
        </div>
      )}

{/* Onglet Mes recettes */}
      {modalTab === "recipes" && (
        <div style={{ padding: "0 16px" }}>
          {recipes.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32 }}>
              <p style={{ fontSize: 24, marginBottom: 8 }}>📋</p>
              <p style={{ fontSize: 13, color: T.tertiary, fontFamily: F.text }}>Aucune recette. Crée ta première recette !</p>
              <button onClick={() => setModalTab("create")} style={{ ...btnPrimary(T.accent), marginTop: 12, padding: "10px 20px" }}>
                Créer une recette
              </button>
            </div>
          ) : recipes.map((recipe, i) => {
            const totalKcal = recipe.ingredients.reduce((s, ing) => s + (ing.kcal || 0), 0);
            const totalProt = recipe.ingredients.reduce((s, ing) => s + (ing.prot || 0), 0);
            const totalGluc = recipe.ingredients.reduce((s, ing) => s + (ing.gluc || 0), 0);
            const totalLip = recipe.ingredients.reduce((s, ing) => s + (ing.lip || 0), 0);
            return (
  <div key={i} style={{ background: T.bgCard, borderRadius: R.lg, padding: 14, marginBottom: 10, boxShadow: shadow.sm }}>
  {/* Contenu carte */}
<div style={{ background: T.bgCard, borderRadius: R.lg, padding: 14, boxShadow: shadow.sm, position: "relative" }}>    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.primary, fontFamily: F.text }}>{recipe.name}</p>
      <span style={{ fontSize: 14, fontWeight: 700, color: T.orange, fontFamily: F.display }}>{totalKcal} kcal</span>
    </div>
    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
      <MacroTag label="P" value={Math.round(totalProt)} color={T.prot} />
      <MacroTag label="G" value={Math.round(totalGluc)} color={T.gluc} />
      <MacroTag label="L" value={Math.round(totalLip)} color={T.lip} />
    </div>
    <p style={{ margin: "0 0 10px", fontSize: 11, color: T.quaternary, fontFamily: F.text }}>
      {recipe.ingredients.length} ingrédient{recipe.ingredients.length > 1 ? "s" : ""}
    </p>
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => {
        setQuantityModal({ name: recipe.name, prot: Math.round(totalProt), gluc: Math.round(totalGluc), lip: Math.round(totalLip), kcal: totalKcal, unit: "unité" });
        setQuantity("1");
      }} style={{ ...btnPrimary(T.accent), flex: 1, padding: "10px" }}>
        Ajouter au repas
      </button>
      <button onClick={() => {
        setNewRecipe({ ...recipe, editIndex: i });
        setModalTab("create");
      }} style={{ background: T.bgInput, border: "none", borderRadius: R.sm, padding: "10px 14px", cursor: "pointer" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M11.013 1.427a1.75 1.75 0 012.474 2.474L4.62 12.768l-3.537.393.393-3.537 8.537-8.197z" stroke={T.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
<button onClick={async () => {
        setRecipes(r => r.filter((_, ri) => ri !== i));
        if (recipe.id) {
          await supabase.from("recipes").delete().eq("id", recipe.id);
        }
      }}        style={{ background: T.redSoft, border: "none", borderRadius: R.sm, padding: "10px 14px", cursor: "pointer" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke={T.red} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</div>            );
          })}
        </div>
      )}
{/* Onglet Créer recette */}
      {modalTab === "create" && (
        <div style={{ padding: "0 16px 20px" }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Nom de la recette</label>
            <input style={inputStyle} placeholder="Ex: Overnight oats, Omelette..." value={newRecipe.name}
              onChange={e => setNewRecipe(r => ({ ...r, name: e.target.value }))} />
          </div>

          {/* Ajouter via code-barre */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input type="number" placeholder="Code-barre produit..." style={{ ...inputStyle, flex: 1, fontSize: 13 }}
              onKeyDown={async (e) => {
                if (e.key === "Enter" && e.target.value.length > 5) {
                  try {
                    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${e.target.value}.json`);
                    const data = await res.json();
                    if (data.status === 1) {
                      const n = data.product.nutriments;
                      const ing = {
                        name: data.product.product_name || "Produit",
                        kcal: Math.round(n["energy-kcal_100g"] || 0),
                        prot: Math.round(n["proteins_100g"] || 0),
                        gluc: Math.round(n["carbohydrates_100g"] || 0),
                        lip: Math.round(n["fat_100g"] || 0),
                      };
                      setNewRecipe(r => ({ ...r, ingredients: [...r.ingredients, ing] }));
                      e.target.value = "";
                    } else {
                      alert("Produit non trouvé.");
                    }
                  } catch {
                    alert("Erreur lors de la recherche.");
                  }
                }
              }} />
            <button onClick={() => { setScannerContext("recipe"); startBarcodeScanner(); }}
              style={{ ...btnPrimary(T.blue), padding: "11px 14px", fontSize: 13, flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4M21 9V5a2 2 0 00-2-2h-4M21 15v4a2 2 0 01-2 2h-4M7 8v8M10 8v8M14 8v8M17 8v8"/>
              </svg>
            </button>
          </div>
          <div id="reader2" style={{ display: "none" }}></div>

          <p style={{ ...labelStyle, marginBottom: 8 }}>Ingrédients</p>
          {newRecipe.ingredients.map((ing, i) => (
            <div key={i} style={{ background: T.bgInput, borderRadius: R.sm, padding: "10px 12px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <input placeholder="Nom de l'ingrédient" value={ing.name}
                  onChange={e => setNewRecipe(r => ({ ...r, ingredients: r.ingredients.map((x, xi) => xi === i ? { ...x, name: e.target.value } : x) }))}
                  style={{ ...inputStyle, fontSize: 13, padding: "6px 10px", flex: 1, marginRight: 8 }} />
                <TrashBtn onClick={() => setNewRecipe(r => ({ ...r, ingredients: r.ingredients.filter((_, xi) => xi !== i) }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 6 }}>
                {[["Grammes", "grams"], ["Kcal", "kcal"], ["Protéines", "prot"], ["Glucides", "gluc"], ["Lipides", "lip"]].map(([lbl, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: 10, color: T.quaternary, fontFamily: F.text, display: "block", marginBottom: 2 }}>{lbl}</label>
                    <input type="number" value={ing[key] || ""}  placeholder="0"
                      onChange={e => setNewRecipe(r => ({ ...r, ingredients: r.ingredients.map((x, xi) => xi === i ? { ...x, [key]: +e.target.value } : x) }))}
                      style={{ ...inputStyle, fontSize: 12, padding: "6px 8px" }} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginBottom: 12 }}>
            <p style={{ ...labelStyle, marginBottom: 8 }}>Rechercher un ingrédient</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input style={{ ...inputStyle, flex: 1, fontSize: 13 }} placeholder="Rechercher..."
                value={recipeSearch}
                onChange={e => setRecipeSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") document.getElementById("recipeSearchBtn").click(); }} />
              <button id="recipeSearchBtn" onClick={async () => {
                const local = FOODS_DB.filter(f => f.name.toLowerCase().includes(recipeSearch.toLowerCase()));
if (local.length > 0) {
  setRecipeSearchResults(local);
} else {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(recipeSearch)}&search_simple=1&action=process&json=1&page_size=10&lc=fr&cc=fr&sort_by=unique_scans_n`);
    const data = await res.json();
    const results = (data.products || [])
      .filter(p => p.product_name && p.nutriments)
      .map(p => ({
        name: p.product_name,
        prot: Math.round(p.nutriments["proteins_100g"] || 0),
        gluc: Math.round(p.nutriments["carbohydrates_100g"] || 0),
        lip: Math.round(p.nutriments["fat_100g"] || 0),
        kcal: Math.round(p.nutriments["energy-kcal_100g"] || 0),
      }));
    setRecipeSearchResults([...local, ...results]);
  } catch (e) {
    setRecipeSearchResults(local);
  }
}
              }}
                style={{ background: T.blue, border: "none", borderRadius: R.sm, padding: "11px 14px", cursor: "pointer" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            {recipeSearchResults.length > 0 && (
              <div style={{ maxHeight: 200, overflowY: "auto", background: T.bgCard, borderRadius: R.sm, boxShadow: shadow.sm }}>
                {recipeSearchResults.map((f, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: `1px solid ${T.sep}`, cursor: "pointer" }}
                    onClick={() => {
                      setRecipeQuantityModal(f);
                      setRecipeQuantity(f.unit === "unité" ? "1" : "100");
                    }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: T.primary, fontFamily: F.text }}>{f.name}</p>
                      <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                        <MacroTag label="P" value={f.prot} color={T.prot} />
                        <MacroTag label="G" value={f.gluc} color={T.gluc} />
                        <MacroTag label="L" value={f.lip} color={T.lip} />
                      </div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.orange, fontFamily: F.display }}>{f.kcal} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </div><button onClick={() => setNewRecipe(r => ({ ...r, ingredients: [...r.ingredients, { name: "", grams: "", kcal: "", prot: "", gluc: "", lip: "" }] }))}
            style={{ ...btnGhost, width: "100%", marginBottom: 12, textAlign: "center" }}>+ Ajouter manuellement</button>

<button onClick={saveRecipe}
            style={{ ...btnPrimary(T.accent), width: "100%", padding: "12px" }}>
            {newRecipe.editIndex !== undefined ? "Mettre à jour la recette" : "Sauvegarder la recette"}
          </button>
        </div>
      )}    </div>  </div>
)}
</div>
)}
const SPORT_CATS = [
  { key: "musculation", icon: "💪", label: "Musculation", col: T.blue },
  { key: "marche",      icon: "🚶", label: "Marche",      col: T.accent },
  { key: "velo",        icon: "🚴", label: "Velo",        col: T.orange },
  { key: "course",      icon: "🏃", label: "Course",      col: T.red },
  { key: "natation",    icon: "🏊", label: "Natation",    col: "#5AC8FA" },
  { key: "autre",       icon: "⚡", label: "Autre",       col: T.tertiary },
];

// MET par activité (source : Compendium of Physical Activities)
const MET_DB = [
  // Musculation
  { type: "musculation", name: "Musculation legere",   met: 3.5 },
  { type: "musculation", name: "Musculation moderee",  met: 5.0 },
  { type: "musculation", name: "Musculation intense",  met: 6.0 },
  { type: "musculation", name: "CrossFit",             met: 7.0 },
  // Marche
  { type: "marche", name: "Marche lente",              met: 2.5 },
  { type: "marche", name: "Marche moderee",            met: 3.5 },
  { type: "marche", name: "Marche rapide",             met: 4.5 },
  { type: "marche", name: "Randonnee",                 met: 5.3 },
  // Velo
  { type: "velo", name: "Velo leger (<16 km/h)",       met: 4.0 },
  { type: "velo", name: "Velo modere (16-22 km/h)",    met: 8.0 },
  { type: "velo", name: "Velo intense (>22 km/h)",     met: 10.0 },
  { type: "velo", name: "Home trainer modere",         met: 7.0 },
  // Course
  { type: "course", name: "Course lente (7 km/h)",     met: 7.0 },
  { type: "course", name: "Course moderee (9 km/h)",   met: 9.0 },
  { type: "course", name: "Course rapide (12 km/h)",   met: 11.5 },
  { type: "course", name: "Sprint",                    met: 14.0 },
  // Natation
  { type: "natation", name: "Natation legere",         met: 5.0 },
  { type: "natation", name: "Natation moderee",        met: 7.0 },
  { type: "natation", name: "Natation intense",        met: 10.0 },
  // Autre
  { type: "autre", name: "Yoga",                       met: 2.5 },
  { type: "autre", name: "Football",                   met: 7.0 },
  { type: "autre", name: "Tennis",                     met: 7.3 },
  { type: "autre", name: "Basketball",                 met: 6.5 },
  { type: "autre", name: "Danse",                      met: 4.5 },
  { type: "autre", name: "Escalade",                   met: 7.5 },
];

// ─── Liste d'exercices communs pour l'autocomplete ───
const EXERCISE_LIST = [
  "Developpe couche", "Developpe incline", "Developpe decline", "Developpe militaire",
  "Squat", "Leg press", "Fentes", "Leg curl", "Leg extension",
  "Soulevé de terre", "Rowing barre", "Rowing haltere", "Tirage poulie haute",
  "Curl biceps barre", "Curl halteres", "Curl marteau",
  "Dips", "Triceps poulie", "Extension triceps",
  "Lateral raise", "Face pull", "Shrugs",
  "Crunch", "Planche", "Leg raise", "Ab wheel",
  "Tractions", "Pompes", "Hip thrust",
];

// ─── Composant WorkoutProgram ───
function WorkoutProgram({ user, programs, setPrograms, sessions, setSessions }) {
  const [view, setView] = useState("list"); // list | create | session | history | chart
  const [selectedProg, setSelectedProg] = useState(null);
  const [selectedExo, setSelectedExo] = useState(null);
  const [newProgName, setNewProgName] = useState("");
  const [newExoName, setNewExoName] = useState("");
  const [exoSearch, setExoSearch] = useState("");
  const [currentSession, setCurrentSession] = useState(null); // séance en cours
  const [restTimer, setRestTimer] = useState(null);
  const [restLeft, setRestLeft] = useState(0);
  const timerRef = useRef(null);

  // Timer de repos
  const startRest = (seconds) => {
    clearInterval(timerRef.current);
    setRestLeft(seconds);
    setRestTimer(seconds);
    timerRef.current = setInterval(() => {
      setRestLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setRestTimer(null); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Créer un programme
const createProgram = async () => {
  if (!newProgName.trim()) return;
  const prog = { id: Date.now(), name: newProgName.trim(), exercises: [] };
  setPrograms(p => [...p, prog]);
  setSelectedProg(prog);
  setNewProgName("");
  setView("session_edit");
  if (user) {
    await supabase.from("workout_programs").insert({
      user_id: user.id,
      name: prog.name,
      exercises: prog.exercises,
    });
  }
};

  // Ajouter exercice au programme
const addExercise = async (progId) => {
  const name = newExoName.trim() || exoSearch.trim();
  if (!name) return;
  const exo = { id: Date.now(), name, sets: 3, reps: 10, rest: 90, note: "" };
  const updatedPrograms = programs.map(pr => pr.id === progId
    ? { ...pr, exercises: [...pr.exercises, exo] }
    : pr
  );
  setPrograms(updatedPrograms);
  setNewExoName(""); setExoSearch("");
  if (user) {
    const prog = updatedPrograms.find(p => p.id === progId);
    if (prog) {
      await supabase.from("workout_programs").update({ exercises: prog.exercises }).eq("user_id", user.id).eq("name", prog.name);
    }
  }
};

const removeExercise = async (progId, exoId) => {
  const updatedPrograms = programs.map(pr => pr.id === progId
    ? { ...pr, exercises: pr.exercises.filter(e => e.id !== exoId) }
    : pr
  );
  setPrograms(updatedPrograms);
  if (user) {
    const prog = updatedPrograms.find(p => p.id === progId);
    if (prog) {
      await supabase.from("workout_programs").update({ exercises: prog.exercises }).eq("user_id", user.id).eq("name", prog.name);
    }
  }
};

const updateExo = async (progId, exoId, field, val) => {
  const updatedPrograms = programs.map(pr => pr.id === progId
    ? { ...pr, exercises: pr.exercises.map(e => e.id === exoId ? { ...e, [field]: val } : e) }
    : pr
  );
  setPrograms(updatedPrograms);
  if (user) {
    const prog = updatedPrograms.find(p => p.id === progId);
    if (prog) {
      await supabase.from("workout_programs")
        .update({ exercises: prog.exercises })
        .eq("user_id", user.id)
        .eq("id", prog.id);
    }
  }
};

  // Démarrer une séance
  const startSession = (prog) => {
    const session = {
      id: Date.now(),
      date: today(),
      progId: prog.id,
      progName: prog.name,
      sets: prog.exercises.map(e => ({
        exoId: e.id,
        exoName: e.name,
        plannedSets: e.sets,
        plannedReps: e.reps,
        rest: e.rest,
        done: Array.from({ length: e.sets }, () => ({ reps: e.reps, weight: "", done: false, note: "" })),
      })),
    };
    setCurrentSession(session);
    setView("active_session");
  };

  // Mettre à jour une série dans la séance en cours
  const updateSet = (exoIdx, setIdx, field, val) => {
    setCurrentSession(s => {
      const sets = s.sets.map((ex, ei) => ei === exoIdx
        ? { ...ex, done: ex.done.map((st, si) => si === setIdx ? { ...st, [field]: val } : st) }
        : ex
      );
      return { ...s, sets };
    });
  };

  // Terminer la séance
const finishSession = async () => {
  const key = currentSession.progId;
  const newSession = { ...currentSession, finishedAt: Date.now() };
  setSessions(prev => ({ ...prev, [key]: [...(prev[key] || []), newSession] }));
  setCurrentSession(null);
  setView("list");
  if (user) {
    await supabase.from("workout_sessions").insert({
      user_id: user.id,
      program_id: currentSession.progId,
      program_name: currentSession.progName,
      date: currentSession.date,
      sets: currentSession.sets,
    });
  }
};
  // Dernier record pour un exercice
  const getLastRecord = (progId, exoName) => {
    const hist = sessions[progId] || [];
    for (let i = hist.length - 1; i >= 0; i--) {
      const exo = hist[i].sets.find(s => s.exoName === exoName);
      if (exo) return exo.done;
    }
    return null;
  };

  const filteredExos = EXERCISE_LIST.filter(e => e.toLowerCase().includes(exoSearch.toLowerCase()));

  // ── Vue : liste des programmes ──
  if (view === "list") return (
    <div style={{ margin: "0 16px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ ...labelStyle, marginBottom: 0 }}>Mes programmes</p>
        <button onClick={() => setView("create")} style={{ ...btnPrimary(T.blue), padding: "7px 14px", fontSize: 13 }}>+ Programme</button>
      </div>
      {programs.length === 0 ? (
        <div style={{ background: T.bgCard, borderRadius: R.lg, padding: 24, textAlign: "center", boxShadow: shadow.sm }}>
          <p style={{ margin: 0, fontSize: 24, marginBottom: 6 }}>🏋️</p>
          <p style={{ margin: 0, fontSize: 13, color: T.tertiary, fontFamily: F.text }}>Aucun programme. Cree le tien !</p>
        </div>
      ) : programs.map(prog => (
        <div key={prog.id} style={{ background: T.bgCard, borderRadius: R.lg, boxShadow: shadow.sm, padding: 16, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.primary, fontFamily: F.text }}>{prog.name}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: T.tertiary, fontFamily: F.text }}>{prog.exercises.length} exercice{prog.exercises.length > 1 ? "s" : ""}</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setSelectedProg(prog); setView("session_edit"); }} style={{ ...btnGhost, fontSize: 12, padding: "6px 10px" }}>Editer</button>
              <button onClick={() => startSession(prog)} style={{ ...btnPrimary(T.blue), padding: "7px 14px", fontSize: 13 }}>Lancer</button>
              <button onClick={async () => {
                setPrograms(p => p.filter(pr => pr.id !== prog.id));
                if (user && prog.id) {
                  await supabase.from("workout_programs").delete().eq("id", prog.id);
                }
              }} style={{ background: T.redSoft, border: "none", borderRadius: R.sm, padding: "7px 10px", cursor: "pointer" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke={T.red} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          {(sessions[prog.id]?.length > 0) && (
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button onClick={() => { setSelectedProg(prog); setView("history"); }}
                style={{ ...btnGhost, fontSize: 12, padding: "6px 10px", color: T.orange }}>
                📋 {sessions[prog.id].length} seance{sessions[prog.id].length > 1 ? "s" : ""}
              </button>
              <button onClick={() => { setSelectedProg(prog); setSelectedExo(prog.exercises[0]); setView("chart"); }}
                style={{ ...btnGhost, fontSize: 12, padding: "6px 10px", color: T.blue }}>
                📈 Evolution
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ── Vue : créer programme ──
  if (view === "create") return (
    <div style={{ ...card(), padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ ...labelStyle, marginBottom: 0 }}>Nouveau programme</p>
        <button onClick={() => setView("list")} style={{ background: "none", border: "none", color: T.quaternary, cursor: "pointer", fontSize: 20 }}>×</button>
      </div>
      <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Nom du programme</label>
      <input style={inputStyle} placeholder="Ex: Full Body, Push Day..." value={newProgName}
        onChange={e => setNewProgName(e.target.value)} />
      <button style={{ ...btnPrimary(), width: "100%", padding: "11px", marginTop: 12 }} onClick={createProgram}>
        Creer le programme
      </button>
    </div>
  );

  // ── Vue : éditer programme (ajouter exercices) ──
  if (view === "session_edit" && selectedProg) {
    const prog = programs.find(p => p.id === selectedProg.id);
    return (
      <div style={{ margin: "0 16px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <button onClick={() => setView("list")} style={{ background: "none", border: "none", color: T.blue, cursor: "pointer", fontSize: 13, fontFamily: F.text, padding: 0 }}>← Retour</button>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 700, color: T.primary, fontFamily: F.display }}>{prog?.name}</p>
          </div>
          <button onClick={() => { setSelectedProg(prog); startSession(prog); }} style={{ ...btnPrimary(T.accent), padding: "7px 14px", fontSize: 13 }}>▶ Lancer</button>
        </div>

        {/* Exercices */}
        {prog?.exercises.map(exo => (
          <div key={exo.id} style={{ background: T.bgCard, borderRadius: R.lg, boxShadow: shadow.sm, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.primary, fontFamily: F.text }}>{exo.name}</p>
              <TrashBtn onClick={() => removeExercise(prog.id, exo.id)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[["Series", "sets"], ["Reps", "reps"], ["Repos (s)", "rest"]].map(([lbl, field]) => (
                <div key={field}>
                  <label style={{ fontSize: 10, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 3 }}>{lbl}</label>
                  <input type="number" value={exo[field] || ""} onChange={e => updateExo(prog.id, exo.id, field, e.target.value === "" ? "" : +e.target.value)}
                    style={{ ...inputStyle, fontSize: 13, padding: "8px 10px" }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 10, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 3 }}>Note</label>
              <input type="text" placeholder="Ex: barre, prise large..." value={exo.note}
                onChange={e => updateExo(prog.id, exo.id, "note", e.target.value)}
                style={{ ...inputStyle, fontSize: 12 }} />
            </div>
          </div>
        ))}

        {/* Ajouter exercice */}
        <div style={{ background: T.bgCard, borderRadius: R.lg, boxShadow: shadow.sm, padding: 14 }}>
          <p style={{ ...labelStyle, marginBottom: 8 }}>Ajouter un exercice</p>
          <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Rechercher ou saisir..." value={exoSearch}
            onChange={e => { setExoSearch(e.target.value); setNewExoName(e.target.value); }} />
          {exoSearch.length > 0 && (
            <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 8 }}>
              {filteredExos.map((e, i) => (
                <div key={i} onClick={() => { setNewExoName(e); setExoSearch(e); }}
                  style={{ padding: "9px 12px", borderRadius: R.sm, cursor: "pointer", fontSize: 13, fontFamily: F.text,
                    background: newExoName === e ? T.accentSoft : "transparent",
                    color: newExoName === e ? T.accent : T.secondary }}>
                  {e}
                </div>
              ))}
            </div>
          )}
          <button style={{ ...btnPrimary(T.blue), width: "100%", padding: "10px" }} onClick={() => addExercise(prog.id)}>
            + Ajouter
          </button>
        </div>
      </div>
    );
  }

  // ── Vue : séance active ──
  if (view === "active_session" && currentSession) return (
    <div style={{ margin: "0 16px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, color: T.tertiary, fontFamily: F.text }}>Seance en cours</p>
          <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 800, color: T.primary, fontFamily: F.display }}>{currentSession.progName}</p>
        </div>
        <button onClick={finishSession} style={{ ...btnPrimary(T.accent), padding: "9px 16px", fontSize: 13 }}>Terminer ✓</button>
      </div>

      {/* Timer repos */}
      {restTimer !== null && (
        <div style={{ ...card(), padding: 14, marginBottom: 0, background: restLeft > 0 ? T.bgCard : T.accentSoft, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 12, color: T.tertiary, fontFamily: F.text }}>Temps de repos</p>
          <p style={{ margin: "4px 0 0", fontSize: 36, fontWeight: 800, color: restLeft > 0 ? T.orange : T.accent, fontFamily: F.display }}>
            {restLeft > 0 ? `${restLeft}s` : "C'est parti !"}
          </p>
        </div>
      )}

      {currentSession.sets.map((exo, ei) => {
        const lastRecord = getLastRecord(currentSession.progId, exo.exoName);
        return (
          <div key={ei} style={{ background: T.bgCard, borderRadius: R.lg, boxShadow: shadow.sm, padding: 16, marginBottom: 12 }}>
            <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: T.primary, fontFamily: F.text }}>{exo.exoName}</p>
            <p style={{ margin: "0 0 12px", fontSize: 11, color: T.quaternary, fontFamily: F.text }}>Repos prevu : {exo.rest}s</p>

            {/* En-tete colonnes */}
            <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr 1fr 56px", gap: 4, marginBottom: 6 }}>
              {["S", "Reps", "kg", "lbs", "Préc.", ""].map((h, i) => (
                <span key={i} style={{ fontSize: 10, color: T.quaternary, fontFamily: F.text, fontWeight: 600 }}>{h}</span>
              ))}
            </div>

            {exo.done.map((st, si) => {
              const prev = lastRecord?.[si];
              return (
                <div key={si} style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr 1fr 56px", gap: 6, marginBottom: 8, alignItems: "center", background: si >= exo.plannedSets ? T.redSoft : "transparent", borderRadius: R.sm, padding: si >= exo.plannedSets ? "4px" : 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: st.done ? T.accent : T.tertiary, fontFamily: F.display }}>S{si + 1}</span>
                  <input type="number" value={st.reps || ""} onChange={e => updateSet(ei, si, "reps", e.target.value === "" ? "" : +e.target.value)}
                    style={{ ...inputStyle, fontSize: 13, padding: "7px 8px", textAlign: "center",
                      background: st.done ? T.accentSoft : T.bgInput,
                      border: st.done ? `1px solid ${T.accent}40` : "none" }} />
                  <input type="number" step="0.5" placeholder="kg"
                    value={st.weight === "" || st.weight === undefined || st.weight === null ? "" : Math.round(+st.weight * 10) / 10}
                    onChange={e => {
                      const val = e.target.value;
                      updateSet(ei, si, "weight", val === "" ? "" : +val);
                    }}
                    style={{ ...inputStyle, fontSize: 13, padding: "7px 6px", textAlign: "center",
                      background: st.done ? T.accentSoft : T.bgInput,
                      border: st.done ? `1px solid ${T.accent}40` : "none" }} />
                  <input type="number" step="0.5" placeholder="lbs"
                    value={st.weight === "" || st.weight === undefined || st.weight === null ? "" : Math.round(+st.weight * 2.20462 * 10) / 10}
                    onChange={e => {
                      const val = e.target.value;
                      const kg = val === "" ? "" : Math.round(+val / 2.20462 * 100) / 100;
                      updateSet(ei, si, "weight", kg);
                    }}
                    style={{ ...inputStyle, fontSize: 13, padding: "7px 6px", textAlign: "center",
                      background: st.done ? "#FFF3E0" : T.bgInput,
                      border: st.done ? `1px solid ${T.orange}40` : "none" }} />
                  <span style={{ fontSize: 11, color: T.quaternary, fontFamily: F.text, textAlign: "center" }}>
                    {prev ? `${prev.reps}r × ${prev.weight || "-"}kg` : "-"}
                  </span>
                  {si >= exo.plannedSets ? (
                    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                      <button onClick={() => {
                        updateSet(ei, si, "done", !st.done);
                        if (!st.done) startRest(exo.rest);
                      }} style={{ width: 28, height: 28, borderRadius: 99, border: "none", cursor: "pointer",
                        background: st.done ? T.accent : T.bgInput,
                        color: st.done ? "#fff" : T.quaternary, fontSize: 13 }}>
                        {st.done ? "✓" : "○"}
                      </button>
                      <button onClick={() => {
                        setCurrentSession(s => {
                          const sets = s.sets.map((ex, i) => i === ei
                            ? { ...ex, done: ex.done.filter((_, idx) => idx !== si) }
                            : ex
                          );
                          return { ...s, sets };
                        });
                      }} style={{ width: 28, height: 28, borderRadius: 99, border: "none", cursor: "pointer", background: T.redSoft, color: T.red, fontSize: 13 }}>
                        🗑️
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => {
                      updateSet(ei, si, "done", !st.done);
                      if (!st.done) startRest(exo.rest);
                    }} style={{ width: 32, height: 32, borderRadius: 99, border: "none", cursor: "pointer",
                      background: st.done ? T.accent : T.bgInput,
                      color: st.done ? "#fff" : T.quaternary, fontSize: 16 }}>
                      {st.done ? "✓" : "○"}
                    </button>
                  )}
                </div>
              );
            })}

            {/* Note séance */}
            <input type="text" placeholder="Note pour cet exercice..." value={exo.done[0]?.note || ""}
              onChange={e => updateSet(ei, 0, "note", e.target.value)}
              style={{ ...inputStyle, fontSize: 12, marginTop: 4 }} />
            <button onClick={() => {
              setCurrentSession(s => {
                const sets = s.sets.map((ex, i) => i === ei
                  ? { ...ex, done: [...ex.done, { reps: ex.plannedReps, weight: "", done: false, note: "" }] }
                  : ex
                );
                return { ...s, sets };
              });
            }} style={{ marginTop: 8, background: T.blue, border: "none", borderRadius: R.sm, padding: "10px 0", width: "100%", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: F.text }}>
              + Série bonus
            </button>
            </div>
        );
      })}
    </div>
  );

  // ── Vue : historique des séances ──
  if (view === "history" && selectedProg) {
    const hist = sessions[selectedProg.id] || [];
    return (
      <div style={{ margin: "0 16px 12px" }}>
        <button onClick={() => setView("list")} style={{ background: "none", border: "none", color: T.blue, cursor: "pointer", fontSize: 13, fontFamily: F.text, padding: "0 0 10px" }}>← Retour</button>
        <p style={{ ...labelStyle, marginBottom: 10 }}>Historique — {selectedProg.name}</p>
        {hist.length === 0 ? (
          <p style={{ fontSize: 13, color: T.tertiary, fontFamily: F.text }}>Aucune seance enregistree.</p>
        ) : [...hist].reverse().map((s, i) => (
          <div key={i} style={{ background: T.bgCard, borderRadius: R.lg, boxShadow: shadow.sm, padding: 16, marginBottom: 10 }}>
            <p style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: T.primary, fontFamily: F.text }}>
              {new Date(s.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })}
            </p>
            {s.sets.map((exo, ei) => (
              <div key={ei} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: ei < s.sets.length - 1 ? `1px solid ${T.sep}` : "none" }}>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: T.secondary, fontFamily: F.text }}>{exo.exoName}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {exo.done.filter(st => st.done).map((st, si) => (
                    <span key={si} style={{ fontSize: 11, background: T.accentSoft, color: T.accent, borderRadius: 99, padding: "3px 10px", fontFamily: F.text, fontWeight: 600 }}>
                      S{si + 1}: {st.reps}r × {st.weight || "-"}kg
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // ── Vue : graphique évolution ──
  if (view === "chart" && selectedProg) {
    const prog = programs.find(p => p.id === selectedProg.id);
    const hist = sessions[selectedProg.id] || [];
    const exoName = selectedExo?.name || prog?.exercises[0]?.name;

    // Données : max poids par séance pour l'exo sélectionné
    const chartData = hist.map(s => {
      const exo = s.sets.find(e => e.exoName === exoName);
      const maxW = exo ? Math.max(...exo.done.filter(st => st.done && st.weight).map(st => +st.weight), 0) : 0;
      const totalReps = exo ? exo.done.filter(st => st.done).reduce((sum, st) => sum + st.reps, 0) : 0;
      return { date: s.date, maxWeight: maxW, totalReps };
    }).filter(d => d.maxWeight > 0);

    const maxW = chartData.length ? Math.max(...chartData.map(d => d.maxWeight)) : 100;
    const minW = chartData.length ? Math.min(...chartData.map(d => d.maxWeight)) : 0;
    const svgW = 320, svgH = 120, padL = 30, padR = 10, padT = 14, padB = 24;
    const cW = svgW - padL - padR, cH = svgH - padT - padB;
    const xOf = i => padL + i / Math.max(chartData.length - 1, 1) * cW;
    const yOf = v => padT + cH - (v - minW) / Math.max(maxW - minW, 1) * cH;

    return (
      <div style={{ margin: "0 16px 12px" }}>
        <button onClick={() => setView("list")} style={{ background: "none", border: "none", color: T.blue, cursor: "pointer", fontSize: 13, fontFamily: F.text, padding: "0 0 10px" }}>← Retour</button>
        <p style={{ ...labelStyle, marginBottom: 10 }}>Evolution — {selectedProg.name}</p>

        {/* Sélecteur d'exercice */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {prog?.exercises.map(e => (
            <button key={e.id} onClick={() => setSelectedExo(e)}
              style={{ padding: "6px 12px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 12, fontFamily: F.text, fontWeight: 600,
                background: selectedExo?.id === e.id ? T.blue : T.bgInput,
                color: selectedExo?.id === e.id ? "#fff" : T.secondary }}>
              {e.name}
            </button>
          ))}
        </div>

        {chartData.length < 2 ? (
          <div style={{ background: T.bgCard, borderRadius: R.lg, padding: 24, textAlign: "center", boxShadow: shadow.sm }}>
            <p style={{ margin: 0, fontSize: 13, color: T.tertiary, fontFamily: F.text }}>Effectue au moins 2 seances pour voir l'evolution 📈</p>
          </div>
        ) : (
          <div style={{ background: T.bgCard, borderRadius: R.lg, boxShadow: shadow.sm, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: T.tertiary, fontFamily: F.text }}>Poids max actuel</p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: T.blue, fontFamily: F.display }}>{chartData[chartData.length - 1].maxWeight} kg</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 11, color: T.tertiary, fontFamily: F.text }}>Progression</p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 800, fontFamily: F.display,
                  color: chartData[chartData.length-1].maxWeight >= chartData[0].maxWeight ? T.accent : T.red }}>
                  {chartData[chartData.length-1].maxWeight >= chartData[0].maxWeight ? "+" : ""}
                  {+(chartData[chartData.length-1].maxWeight - chartData[0].maxWeight).toFixed(1)} kg
                </p>
              </div>
            </div>
            <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height={svgH}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.blue} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={T.blue} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Aire */}
              {chartData.length > 1 && (
                <path d={`M ${xOf(0)},${yOf(chartData[0].maxWeight)} ` +
                  chartData.slice(1).map((d,i) => `L ${xOf(i+1)},${yOf(d.maxWeight)}`).join(" ") +
                  ` L ${xOf(chartData.length-1)},${padT+cH} L ${xOf(0)},${padT+cH} Z`}
                  fill="url(#chartGrad)" />
              )}
              {/* Ligne */}
              <polyline points={chartData.map((d,i) => `${xOf(i)},${yOf(d.maxWeight)}`).join(" ")}
                fill="none" stroke={T.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {/* Points */}
              {chartData.map((d, i) => (
                <g key={i}>
                  <circle cx={xOf(i)} cy={yOf(d.maxWeight)} r="4" fill={T.bgCard} stroke={T.blue} strokeWidth="2" />
                  <text x={xOf(i)} y={yOf(d.maxWeight) - 8} textAnchor="middle" fontSize="9" fill={T.blue} fontFamily={F.text} fontWeight="700">{d.maxWeight}kg</text>
                  <text x={xOf(i)} y={svgH - 4} textAnchor="middle" fontSize="8" fill={T.quaternary} fontFamily={F.text}>
                    {new Date(d.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </text>
                </g>
              ))}
            </svg>

            {/* Tableau récap */}
            <div style={{ marginTop: 12, borderTop: `1px solid ${T.sep}`, paddingTop: 10 }}>
              <p style={{ ...labelStyle, marginBottom: 8 }}>Recapitulatif des seances</p>
              {[...chartData].reverse().map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.sep}` }}>
                  <span style={{ fontSize: 12, color: T.secondary, fontFamily: F.text }}>
                    {new Date(d.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.blue, fontFamily: F.display }}>{d.maxWeight} kg</span>
                    <span style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text }}>{d.totalReps} reps</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

const MOCK = [
  { type: "musculation", date: "2026-04-04", duration: 65, kcal: 380, steps: 0,    name: "Full Body" },
  { type: "marche",      date: "2026-04-04", duration: 45, kcal: 210, steps: 6200, name: "Marche rapide" },
  { type: "velo",        date: "2026-04-03", duration: 90, kcal: 620, steps: 0,    name: "Sortie velo" },
  { type: "musculation", date: "2026-04-02", duration: 70, kcal: 410, steps: 0,    name: "Upper Body" },
  { type: "marche",      date: "2026-04-02", duration: 30, kcal: 130, steps: 4100, name: "Balade" },
  { type: "marche",      date: "2026-04-01", duration: 60, kcal: 280, steps: 8500, name: "Randonnee" },
  { type: "velo",        date: "2026-04-01", duration: 60, kcal: 430, steps: 0,    name: "Home trainer" },
];

function SportTab({ setSportKcal, profile, acts, setActs, user, workoutPrograms, setWorkoutPrograms, workoutSessions, setWorkoutSessions }) {
  const [active, setActive] = useState("musculation");
  const [synced, setSynced] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);
const [editSession, setEditSession] = useState(null);
const [editSessionForm, setEditSessionForm] = useState(null);
  const [editAct, setEditAct] = useState(null);
  const [editActForm, setEditActForm] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: today(), type: "musculation", metEntry: null, duration: "", name: "", km: "" });
  const catDef = SPORT_CATS.find(c => c.key === active);
  const weight = profile?.weight || 75;

  const sync = () => {
    setSynced(true); setActs(MOCK);
    setSportKcal(MOCK.filter(a => a.date === today()).reduce((s, a) => s + a.kcal, 0));
  };

  // Calcul kcal via MET
  const calcKcal = (met, duration) => Math.round(met * weight * (duration / 60));

  const saveActivity = async () => {
    if (!form.metEntry || !form.duration) return;
    const kcal = calcKcal(form.metEntry.met, +form.duration);
    const newAct = {
      type: form.type,
      date: form.date,
      duration: +form.duration,
      kcal,
      steps: 0,
      name: form.name || form.metEntry.name,
      km: form.km ? +form.km : null,
    };
    const updated = [...acts, newAct];
    setActs(updated);
    setSportKcal(updated.filter(a => a.date === today()).reduce((s, a) => s + a.kcal, 0));
    setForm({ date: today(), type: "musculation", metEntry: null, duration: "", name: "", km: "" });
    if (user) {
      await supabase.from("sport_logs").insert({
        user_id: user.id,
        date: newAct.date,
        type: newAct.type,
        name: newAct.name,
        duration: newAct.duration,
        kcal: newAct.kcal,
        steps: newAct.steps || 0,
        km: newAct.km || null,
      });
    }
    setShowForm(false);
  };

  const removeAct = async (idx) => {
  const act = acts[idx];
  const updated = acts.filter((_, i) => i !== idx);
  setActs(updated);
  setSportKcal(updated.filter(a => a.date === today()).reduce((s, a) => s + a.kcal, 0));
  if (user && act.id) {
    await supabase.from("sport_logs").delete().eq("id", act.id);
  }
};

  const filtered = active === "musculation"
    ? Object.values(workoutSessions || {}).flat().sort((a, b) => b.date.localeCompare(a.date))
    : acts.filter(a => a.type === active);
  const cut = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const last7 = acts.filter(a => a.type === active && a.date >= cut);
  const avgK = last7.length ? Math.round(last7.reduce((s, a) => s + a.kcal, 0) / 7) : 0;
  const avgM = last7.length ? Math.round(last7.reduce((s, a) => s + a.duration, 0) / 7) : 0;
  const avgS = last7.length ? Math.round(last7.reduce((s, a) => s + (a.steps || 0), 0) / 7) : 0;

  const metOptions = MET_DB.filter(m => m.type === form.type);
  const previewKcal = form.metEntry && form.duration ? calcKcal(form.metEntry.met, +form.duration) : null;

  return (
    <div style={{ paddingBottom: 90, background: T.bg, minHeight: "100vh" }}>
      {editSession !== null && editSessionForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", alignItems: "flex-end", backdropFilter: "blur(4px)" }}>
          <div style={{ background: T.bgCard, borderRadius: `${R.xl}px ${R.xl}px 0 0`, padding: "0 0 40px", width: "100%", maxWidth: 430, margin: "0 auto", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(0,0,0,0.12)" }}>
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: T.bgCard, borderBottom: `1px solid ${T.sep}` }}>
              <div>
                <span style={{ fontSize: 17, fontWeight: 700, color: T.primary, fontFamily: F.text }}>Modifier la séance</span>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: T.tertiary, fontFamily: F.text }}>{editSessionForm.progName}</p>
              </div>
              <button onClick={() => setEditSession(null)} style={{ background: T.bgInput, border: "none", borderRadius: 99, width: 28, height: 28, fontSize: 16, color: T.tertiary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {editSessionForm.sets.map((exo, ei) => (
                <div key={ei} style={{ background: T.bgCard, borderRadius: R.lg, boxShadow: shadow.sm, padding: 14, marginBottom: 12, border: `1px solid ${T.sep}` }}>
                  <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: T.secondary, fontFamily: F.text }}>{exo.exoName}</p>
                  {exo.done.map((st, si) => (
                    <div key={si} style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr", gap: 6, marginBottom: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: st.done ? T.accent : T.quaternary, fontFamily: F.display }}>S{si + 1}</span>
                      <input type="number" value={st.reps || ""} onChange={e => {
                        const newSets = editSessionForm.sets.map((ex, i) => i === ei ? { ...ex, done: ex.done.map((s, j) => j === si ? { ...s, reps: e.target.value === "" ? "" : +e.target.value, done: true } : s) } : ex);
                        setEditSessionForm(f => ({ ...f, sets: newSets }));
                      }} style={{ ...inputStyle, fontSize: 14, padding: "8px 10px", textAlign: "center", background: st.done ? T.accentSoft : T.bgInput }} />
                      <input type="number" step="0.5" value={st.weight || ""} onChange={e => {
                        const newSets = editSessionForm.sets.map((ex, i) => i === ei ? { ...ex, done: ex.done.map((s, j) => j === si ? { ...s, weight: e.target.value, done: true } : s) } : ex);
                        setEditSessionForm(f => ({ ...f, sets: newSets }));
                      }} style={{ ...inputStyle, fontSize: 14, padding: "8px 10px", textAlign: "center", background: st.done ? T.accentSoft : T.bgInput }} />
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={() => setEditSession(null)} style={{ flex: 1, background: T.bgInput, border: "none", borderRadius: R.md, padding: "13px", fontFamily: F.text, fontSize: 15, fontWeight: 600, color: T.tertiary, cursor: "pointer" }}>
                  Annuler
                </button>
                <button onClick={async () => {
                  const sessionId = editSessionForm.id;
                  const updatedSets = editSessionForm.sets;
                  setWorkoutSessions(prev => {
                    const key = editSessionForm.progId;
                    const updated = (prev[key] || []).map(s => s.id === sessionId ? { ...s, sets: updatedSets } : s);
                    return { ...prev, [key]: updated };
                  });
                  if (user && sessionId) {
                    await supabase.from("workout_sessions").update({ sets: updatedSets }).eq("id", sessionId);
                  }
                  setEditSession(null);
                }} style={{ ...btnPrimary(T.accent), flex: 1, padding: "13px" }}>
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {editAct !== null && editActForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: T.bgCard, borderRadius: R.xl, padding: 24, width: "100%", maxWidth: 340, boxShadow: shadow.lg }}>
            <p style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, color: T.primary, fontFamily: F.text }}>{editActForm.name}</p>
            <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 6 }}>Durée (minutes)</label>
            <input type="number" value={editActForm.duration} onChange={e => setEditActForm({ ...editActForm, duration: +e.target.value })}
              style={{ ...inputStyle, marginBottom: 12, fontSize: 16 }} />
            {editActForm.type === "velo" && (
              <>
                <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 6 }}>Distance (km)</label>
                <input type="number" value={editActForm.km || ""} onChange={e => setEditActForm({ ...editActForm, km: e.target.value })}
                  style={{ ...inputStyle, marginBottom: 12, fontSize: 16 }} />
              </>
            )}
            <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 6 }}>Calories brûlées</label>
            <input type="number" value={editActForm.kcal} onChange={e => setEditActForm({ ...editActForm, kcal: +e.target.value })}
              style={{ ...inputStyle, marginBottom: 16, fontSize: 16 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEditAct(null)}
                style={{ flex: 1, background: T.bgInput, border: "none", borderRadius: R.md, padding: "12px", fontFamily: F.text, fontSize: 15, fontWeight: 600, color: T.tertiary, cursor: "pointer" }}>
                Annuler
              </button>
              <button onClick={async () => {
                const updated = acts.map((a, i) => i === editAct ? { ...a, ...editActForm } : a);
                setActs(updated);
                setSportKcal(updated.filter(a => a.date === today()).reduce((s, a) => s + a.kcal, 0));
                if (user && editActForm.id) {
                  await supabase.from("sport_logs").update({ duration: editActForm.duration, kcal: editActForm.kcal, km: editActForm.km || null }).eq("id", editActForm.id);
                }
                setEditAct(null);
              }} style={{ ...btnPrimary(T.accent), flex: 1, padding: "12px" }}>
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ padding: "56px 20px 16px", background: T.bgCard, boxShadow: shadow.sm }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.accent, fontFamily: F.text, letterSpacing: "0.04em", textTransform: "uppercase" }}>Sport</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 4 }}>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, color: T.primary, fontFamily: F.display, letterSpacing: "-0.8px", lineHeight: 1.08 }}>Activite</h1>
          <button onClick={() => setShowForm(!showForm)} style={{ ...btnPrimary(showForm ? T.tertiary : T.accent), padding: "9px 18px", fontSize: 14 }}>
            {showForm ? "Annuler" : "+ Activite"}
          </button>
        </div>
      </div>

      {/* Formulaire ajout manuel */}
      {showForm && (
        <div style={{ ...card(), marginTop: 16, padding: 16 }}>
          <p style={{ ...labelStyle, marginBottom: 12 }}>Nouvelle activite</p>

          {/* Date */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ ...inputStyle, fontSize: 13 }} />
          </div>

          {/* Type de sport */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 6 }}>Type de sport</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SPORT_CATS.map(c => (
                <button key={c.key} onClick={() => setForm(f => ({ ...f, type: c.key, metEntry: null }))}
                  style={{ padding: "7px 12px", borderRadius: R.sm, border: "none", cursor: "pointer", fontFamily: F.text, fontSize: 12, fontWeight: 600,
                    background: form.type === c.key ? c.col : T.bgInput,
                    color: form.type === c.key ? "#fff" : T.secondary }}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activite specifique */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Activite specifique</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {metOptions.map((m, i) => (
                <div key={i} onClick={() => setForm(f => ({ ...f, metEntry: m }))}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: R.sm, cursor: "pointer",
                    background: form.metEntry?.name === m.name ? T.accentSoft : T.bgInput,
                    border: `1px solid ${form.metEntry?.name === m.name ? T.accent : "transparent"}` }}>
                  <span style={{ fontSize: 13, color: form.metEntry?.name === m.name ? T.accent : T.secondary, fontFamily: F.text, fontWeight: form.metEntry?.name === m.name ? 600 : 400 }}>{m.name}</span>
                  <span style={{ fontSize: 11, color: T.quaternary, fontFamily: F.text }}>MET {m.met}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Duree */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Duree (minutes)</label>
            <input type="number" placeholder="45" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} style={inputStyle} />
          </div>

          {/* Distance km - uniquement pour le vélo */}
          {form.type === "velo" && (
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Distance (km)</label>
              <input type="number" placeholder="Ex: 30" value={form.km} onChange={e => setForm(f => ({ ...f, km: e.target.value }))} style={inputStyle} />
            </div>
          )}

          {/* Nom personnalise */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Nom (optionnel)</label>
            <input type="text" placeholder="Ex: Seance du lundi" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
          </div>

          {/* Preview kcal */}
          {previewKcal !== null && (
            <div style={{ marginBottom: 14, padding: "12px 14px", background: T.accentSoft, borderRadius: R.sm, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: T.accent, fontFamily: F.text, fontWeight: 600 }}>Calories estimees</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: T.accent, fontFamily: F.display }}>{previewKcal} kcal</span>
            </div>
          )}

          <button style={{ ...btnPrimary(), width: "100%", padding: "12px" }} onClick={saveActivity}>
            Enregistrer l'activite
          </button>
        </div>
      )}


      {/* Tabs categories */}
      <div style={{ margin: "0 16px 12px", background: T.bgCard, borderRadius: R.lg, padding: 4, display: "flex", gap: 4, boxShadow: shadow.sm, flexWrap: "wrap" }}>
        {SPORT_CATS.map(c => (
          <button key={c.key} style={{ ...pill(active === c.key, c.col), flex: 1, padding: "9px 0", minWidth: 60 }}
            onClick={() => setActive(c.key)}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Stats 7j */}
      <div style={{ display: "flex", gap: 10, margin: "0 16px 12px" }}>
        {[
          { l: "Kcal brulees", v: avgK ? avgK + " kcal" : "-", c: catDef?.col || T.accent },
          { l: "Duree moy.",   v: avgM ? avgM + " min" : "-",   c: T.blue },
          { l: active === "marche" ? "Pas moy." : "Seances", v: active === "marche" ? (avgS ? avgS.toLocaleString() : "-") : (last7.length || "-"), c: T.orange },
        ].map(s => (
          <div key={s.l} style={{ flex: 1, background: T.bgCard, borderRadius: R.lg, padding: "14px 10px", textAlign: "center", boxShadow: shadow.sm }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: s.c, fontFamily: F.display, letterSpacing: "-0.5px" }}>{s.v}</div>
            <div style={{ fontSize: 10, color: T.tertiary, fontFamily: F.text, marginTop: 3 }}>{s.l}<br />moy. 7j</div>
          </div>
        ))}
      </div>

      {/* Programme musculation — visible seulement sur l'onglet musculation */}
      {active === "musculation" && (
        <WorkoutProgram user={user} programs={workoutPrograms} setPrograms={setWorkoutPrograms} sessions={workoutSessions} setSessions={setWorkoutSessions} />
      )}

      {/* Historique */}
      <div style={{ padding: "0 16px" }}>
        <p style={labelStyle}>Historique - {catDef?.label}</p>
        {filtered.length === 0 ? (
          <div style={{ background: T.bgCard, borderRadius: R.lg, padding: 32, textAlign: "center", boxShadow: shadow.sm }}>
            <p style={{ margin: 0, fontSize: 28, marginBottom: 8 }}>📭</p>
            <p style={{ margin: 0, fontSize: 15, color: T.tertiary, fontFamily: F.text }}>
              Aucune activite enregistree
            </p>
          </div>
        ) : active === "musculation" ? filtered.map((a, i) => {
          const totalCharge = (a.sets || []).reduce((total, exo) =>
            total + exo.done.filter(s => s.done).reduce((s, st) => s + ((+st.weight || 0) * (+st.reps || 0)), 0), 0);
          return (
            <div key={i} style={{ background: T.bgCard, borderRadius: R.lg, boxShadow: shadow.sm, padding: 16, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                onClick={() => setExpandedSession(expandedSession === i ? null : i)}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.primary, fontFamily: F.text }}>💪 {a.progName} {expandedSession === i ? "▲" : "▼"}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: T.tertiary, fontFamily: F.text }}>
                    {new Date(a.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })}
                    {" · "}<span style={{ color: T.blue, fontWeight: 700 }}>{Math.round(totalCharge)}kg</span>
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={e => e.stopPropagation()}>
                  <button onClick={(e) => { e.stopPropagation(); setEditSession(i); setEditSessionForm(JSON.parse(JSON.stringify(a))); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M11.013 1.427a1.75 1.75 0 012.474 2.474L4.62 12.768l-3.537.393.393-3.537 8.537-8.197z" stroke={T.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button onClick={async (e) => {
                    e.stopPropagation();
                    const key = a.progId;
                    setWorkoutSessions(prev => {
                      const updated = (prev[key] || []).filter(s => s.id !== a.id);
                      return { ...prev, [key]: updated };
                    });
                    if (user && a.id) {
                      await supabase.from("workout_sessions").delete().eq("id", a.id);
                    }
                  }} style={{ background: T.redSoft, border: "none", borderRadius: 99, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke={T.red} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              {expandedSession === i && (
                <div style={{ marginTop: 12 }}>
                  {(a.sets || []).map((exo, ei) => (
                    <div key={ei} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: ei < a.sets.length - 1 ? `1px solid ${T.sep}` : "none" }}>
                      <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: T.secondary, fontFamily: F.text }}>{exo.exoName}</p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {exo.done.filter(st => st.done).map((st, si) => (
                          <span key={si} style={{ fontSize: 11, background: T.accentSoft, color: T.accent, borderRadius: 99, padding: "3px 10px", fontFamily: F.text, fontWeight: 600 }}>
                            S{si + 1}: {st.reps}r × {st.weight || "-"}kg
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }) : filtered.map((a, i) => (
          <div key={i} style={{ background: T.bgCard, borderRadius: R.lg, boxShadow: shadow.sm, padding: 16, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.primary, fontFamily: F.text }}>{a.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: T.tertiary, fontFamily: F.text }}>
                  {new Date(a.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ background: T.orangeSoft, borderRadius: 99, padding: "4px 12px" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.orange, fontFamily: F.display }}>{a.kcal} kcal</span>
                </div>
                <button onClick={() => {
                  const idx = acts.findIndex(x => x.id === a.id);
                  setEditAct(idx >= 0 ? idx : null);
                  setEditActForm({ ...a });
                }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M11.013 1.427a1.75 1.75 0 012.474 2.474L4.62 12.768l-3.537.393.393-3.537 8.537-8.197z" stroke={T.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <TrashBtn onClick={() => removeAct(acts.findIndex(x => x.id === a.id))} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <div style={{ background: T.bgInput, borderRadius: R.sm, padding: "7px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>⏱</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.secondary, fontFamily: F.text }}>{a.duration} min</span>
              </div>
              {a.steps > 0 && (
                <div style={{ background: T.bgInput, borderRadius: R.sm, padding: "7px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14 }}>👟</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.secondary, fontFamily: F.text }}>{a.steps.toLocaleString()} pas</span>
                </div>
              )}
              {a.km && (
                <div style={{ background: T.bgInput, borderRadius: R.sm, padding: "7px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14 }}>🚴</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.secondary, fontFamily: F.text }}>{a.km} km</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const VISCERAL_ZONES = [
  { min: 1,  max: 9,  label: "Normal",     col: "#34C759" },
  { min: 10, max: 14, label: "Eleve",      col: "#FF9500" },
  { min: 15, max: 30, label: "Tres eleve", col: "#FF3B30" },
];

function getVisceralZone(v) {
  return VISCERAL_ZONES.find(z => v >= z.min && v <= z.max) || VISCERAL_ZONES[0];
}

function WeightSparkline({ entries }) {
  if (entries.length < 2) return null;
  const vals = entries.map(e => e.val);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const range = Math.max(maxV - minV, 0.5);
  const W = 220, H = 44, pad = 6;
  const x = (i) => pad + i / (entries.length - 1) * (W - pad * 2);
  const y = (v) => pad + (1 - (v - minV) / range) * (H - pad * 2);
  const pts = entries.map((e, i) => `${x(i)},${y(e.val)}`).join(" ");
  const area = `M ${x(0)},${y(entries[0].val)} `
    + entries.slice(1).map((e, i) => `L ${x(i + 1)},${y(e.val)}`).join(" ")
    + ` L ${x(entries.length - 1)},${H} L ${x(0)},${H} Z`;
  const last = entries[entries.length - 1];
  const first = entries[0];
  const trend = last.val - first.val;

  return (
    <div style={{ position: "relative" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={trend <= 0 ? T.accent : T.red} stopOpacity="0.18" />
            <stop offset="100%" stopColor={trend <= 0 ? T.accent : T.red} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#spGrad)" />
        <polyline points={pts} fill="none" stroke={trend <= 0 ? T.accent : T.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {entries.map((e, i) => (
          <circle key={i} cx={x(i)} cy={y(e.val)} r="3" fill={T.bgCard} stroke={trend <= 0 ? T.accent : T.red} strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  );
}

function WeightTab({ profile, setProfile, weightLogs, setWeightLogs, bodyLogs, setBodyLogs, setBodyLogsLocal, setWeightLogsLocal, user }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: today(), weight: "", fat: "", muscle: "", visceral: "" });

  const saveEntry = () => {
    if (!form.weight) return;
    const w = parseFloat(form.weight);
    const f = form.fat ? parseFloat(form.fat) : null;
    const m = form.muscle ? parseFloat(form.muscle) : null;
    const v = form.visceral ? parseInt(form.visceral) : null;
    const newWeightLogs = { ...weightLogs, [form.date]: w };
    const newBodyLogs = { ...bodyLogs, [form.date]: { weight: w, fat: f, muscle: m, visceral: v } };
    setWeightLogs(newWeightLogs);
    setBodyLogs(newBodyLogs);
    setProfile(p => ({ ...p, weight: w }));
    setForm({ date: today(), weight: "", fat: "", muscle: "", visceral: "" });
    setShowForm(false);
  };

  const entries = Object.entries(bodyLogs)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, data]) => ({ date, val: data.weight, fat: data.fat, muscle: data.muscle, visceral: data.visceral }));

  const last = entries[entries.length - 1];
  const prev = entries[entries.length - 2];
  const lastW = last?.val ?? profile.weight ?? 0;
  const prevW = prev?.val ?? null;
  const diffW = prevW !== null ? +(lastW - prevW).toFixed(1) : null;
  const lastFat = last?.fat ?? null;
  const lastMuscle = last?.muscle ?? null;
  const lastVisceral = last?.visceral ?? null;
  const vZone = lastVisceral !== null ? getVisceralZone(lastVisceral) : null;
  const g = getGoal(profile);
  const targetWeight = profile.targetWeight || (
    g.key === "loss" ? Math.max(50, (profile.weight || 80) - 5) :
    g.key === "gain" ? (profile.weight || 80) + 3 :
    (profile.weight || 80)
  );
  const diffToTarget = +(lastW - targetWeight).toFixed(1);
  const fatPct = lastFat ?? 0;
  const musclePct = lastMuscle ?? 0;

return (
    <div style={{ paddingBottom: 90, background: T.bg, minHeight: "100vh" }}>
      
      <div style={{ padding: "56px 20px 16px", background: T.bgCard, boxShadow: shadow.sm }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.accent, fontFamily: F.text, letterSpacing: "0.04em", textTransform: "uppercase" }}>Poids</p>
        <h1 style={{ margin: "4px 0 0", fontSize: 34, fontWeight: 800, color: T.primary, fontFamily: F.display, letterSpacing: "-0.8px", lineHeight: 1.08 }}>Composition</h1>
      </div>

      {/* Encart Poids actuel avec + intégré */}
      <div style={{ ...card(), marginTop: 16, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: T.tertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: F.text }}>Poids actuel</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 52, fontWeight: 800, color: T.primary, fontFamily: F.display, letterSpacing: "-2px", lineHeight: 1 }}>{lastW || "-"}</span>
              <span style={{ fontSize: 18, color: T.tertiary, fontFamily: F.text }}>kg</span>
              {diffW !== null && (
                <span style={{ fontSize: 16, fontWeight: 700, fontFamily: F.display, color: diffW === 0 ? T.tertiary : diffW < 0 ? (g.key === "gain" ? T.red : T.accent) : (g.key === "loss" ? T.red : T.accent) }}>
                  {diffW > 0 ? "+" : ""}{diffW} kg
                </span>
              )}
            </div>
          </div>
          {/* Bouton + pour ajouter une pesée */}
          <button onClick={() => setShowForm(!showForm)} style={{ width: 36, height: 36, borderRadius: 99, background: showForm ? T.bgInput : T.blue, border: "none", color: "#fff", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: showForm ? "none" : `0 4px 12px ${T.blue}44`, marginTop: 4, flexShrink: 0 }}>
            {showForm ? "×" : "+"}
          </button>
        </div>

        {/* Formulaire pesée intégré */}
        {showForm && (
          <div style={{ padding: "14px 20px 20px", borderTop: `1px solid ${T.sep}`, marginTop: 14 }}>
            <p style={{ ...labelStyle, marginBottom: 12 }}>Nouvelle pesee</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ ...inputStyle, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Poids (kg) *</label>
                <input type="number" step="0.1" placeholder="70.5" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} style={{ ...inputStyle, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Masse grasse (%)</label>
                <input type="number" step="0.1" placeholder="18.5" value={form.fat} onChange={e => setForm(f => ({ ...f, fat: e.target.value }))} style={{ ...inputStyle, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Masse musculaire (%)</label>
                <input type="number" step="0.1" placeholder="38.0" value={form.muscle} onChange={e => setForm(f => ({ ...f, muscle: e.target.value }))} style={{ ...inputStyle, fontSize: 13 }} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Graisse viscerale (indice 1-30)</label>
              <input type="number" step="1" min="1" max="30" placeholder="7" value={form.visceral} onChange={e => setForm(f => ({ ...f, visceral: e.target.value }))} style={inputStyle} />
              <p style={{ margin: "4px 0 0", fontSize: 11, color: T.quaternary, fontFamily: F.text }}>Norme : 1-9 normal - 10-14 eleve - 15+ tres eleve</p>
            </div>
            <button style={{ ...btnPrimary(), width: "100%", padding: "12px" }} onClick={saveEntry}>Enregistrer la pesee</button>
          </div>
        )}

        <div style={{ padding: "14px 20px", marginTop: showForm ? 0 : 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: T.tertiary, fontFamily: F.text }}>Objectif {g.icon} {g.full}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: g.col, fontFamily: F.display }}>
              {targetWeight} kg
              {diffToTarget !== 0 && <span style={{ fontSize: 11, fontWeight: 500, color: T.tertiary }}> ({diffToTarget > 0 ? "+" : ""}{diffToTarget} kg)</span>}
            </span>
          </div>
        </div>

        {entries.length >= 2 && (
          <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${T.sep}`, paddingTop: 14 }}>
          </div>
        )}
      </div>

      <div style={{ ...card(), padding: 20 }}>
        <p style={{ ...labelStyle, marginBottom: 16 }}>Composition corporelle</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: T.redSoft, borderRadius: R.lg, padding: "14px 14px 16px", border: `1px solid ${T.red}18` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: 99, background: T.red }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T.tertiary, fontFamily: F.text }}>Masse grasse</span>
            </div>
            <ArcRing value={fatPct} max={100} color={T.red} size={80} stroke={5}>
              <span style={{ fontSize: 16, fontWeight: 800, color: T.red, fontFamily: F.display }}>{lastFat !== null ? lastFat + "%" : "-"}</span>
            </ArcRing>
            {lastFat !== null && lastW > 0 && <p style={{ margin: "10px 0 0", fontSize: 12, color: T.tertiary, fontFamily: F.text, textAlign: "center" }}>aprox. {+(lastW * lastFat / 100).toFixed(1)} kg</p>}
            {lastFat === null && <p style={{ margin: "10px 0 0", fontSize: 11, color: T.quaternary, fontFamily: F.text, textAlign: "center" }}>Ajouter lors d'une pesee</p>}
          </div>
          <div style={{ background: T.blueSoft, borderRadius: R.lg, padding: "14px 14px 16px", border: `1px solid ${T.blue}18` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: 99, background: T.blue }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T.tertiary, fontFamily: F.text }}>Masse musculaire</span>
            </div>
            <ArcRing value={musclePct} max={100} color={T.blue} size={80} stroke={5}>
              <span style={{ fontSize: 16, fontWeight: 800, color: T.blue, fontFamily: F.display }}>{lastMuscle !== null ? lastMuscle + "%" : "-"}</span>
            </ArcRing>
            {lastMuscle !== null && lastW > 0 && <p style={{ margin: "10px 0 0", fontSize: 12, color: T.tertiary, fontFamily: F.text, textAlign: "center" }}>aprox. {+(lastW * lastMuscle / 100).toFixed(1)} kg</p>}
            {lastMuscle === null && <p style={{ margin: "10px 0 0", fontSize: 11, color: T.quaternary, fontFamily: F.text, textAlign: "center" }}>Ajouter lors d'une pesee</p>}
          </div>
        </div>
        <div style={{ marginTop: 12, borderRadius: R.lg, padding: "14px 16px", background: vZone ? `${vZone.col}10` : T.bgInput, border: `1px solid ${vZone ? vZone.col + "28" : T.sep}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.secondary, fontFamily: F.text }}>Graisse viscerale</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: T.quaternary, fontFamily: F.text }}>Indice 1 - 30</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: vZone?.col || T.quaternary, fontFamily: F.display, letterSpacing: "-1px" }}>{lastVisceral !== null ? lastVisceral : "-"}</span>
              {vZone && <div style={{ background: vZone.col + "22", borderRadius: 99, padding: "2px 10px", marginTop: 2, display: "inline-block" }}><span style={{ fontSize: 11, fontWeight: 700, color: vZone.col, fontFamily: F.text }}>{vZone.label}</span></div>}
            </div>
          </div>
          <div style={{ position: "relative", height: 8, borderRadius: 99, overflow: "hidden", background: `linear-gradient(90deg,${T.accent} 0%,${T.accent} 30%,${T.orange} 30%,${T.orange} 47%,${T.red} 47%,${T.red} 100%)` }}>
            {lastVisceral !== null && <div style={{ position: "absolute", left: `${Math.min((lastVisceral - 1) / 29 * 100, 97)}%`, top: -2, width: 12, height: 12, borderRadius: 99, background: T.bgCard, border: `2.5px solid ${vZone?.col || T.primary}`, boxShadow: shadow.sm, transition: "left .4s" }} />}
          </div>
          {lastVisceral === null && <p style={{ margin: "8px 0 0", fontSize: 11, color: T.quaternary, fontFamily: F.text, textAlign: "center" }}>Ajouter lors d'une pesee</p>}
        </div>
      </div>

      <div style={{ ...card(), padding: 16 }}>
        <p style={{ ...labelStyle, marginBottom: 10 }}>Objectif de poids</p>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Poids cible (kg)</label>
            <input type="number" step="0.5" value={profile.targetWeight || ""} placeholder={String(targetWeight)} onChange={e => setProfile(p => ({ ...p, targetWeight: +e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ background: `${g.col}12`, borderRadius: R.md, padding: "10px 14px", flexShrink: 0, border: `1px solid ${g.col}30`, textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>{g.icon}</div>
            <div style={{ fontSize: 10, color: g.col, fontWeight: 700, fontFamily: F.text, marginTop: 2 }}>{g.label}</div>
          </div>
        </div>
        {profile.targetWeight && lastW > 0 && (
          <div style={{ marginTop: 12, padding: "10px 12px", background: T.bgInput, borderRadius: R.sm }}>
            <span style={{ fontSize: 13, color: T.secondary, fontFamily: F.text }}>
              Il vous reste <strong style={{ color: Math.abs(diffToTarget) < 0.5 ? T.accent : g.col }}>{Math.abs(diffToTarget)} kg</strong>
              {" "}{diffToTarget > 0 ? "a perdre" : diffToTarget < 0 ? "a prendre" : "- objectif atteint !"}
            </span>
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <div style={{ ...card(), padding: 0 }}>
          <p style={{ ...labelStyle, padding: "14px 16px 0", marginBottom: 0 }}>Historique</p>
          {[...entries].reverse().slice(0, 6).map((e, i, arr) => {
            const prevE = arr[i + 1];
            const d = prevE ? +(e.val - prevE.val).toFixed(1) : null;
            return (
              <div key={e.date} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: i === arr.slice(0, 6).length - 1 ? "none" : `1px solid ${T.sep}` }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.primary, fontFamily: F.text }}>
                    {new Date(e.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                    {e.fat !== null && <span style={{ fontSize: 11, color: T.red, fontFamily: F.text }}>{e.fat}%</span>}
                    {e.muscle !== null && <span style={{ fontSize: 11, color: T.blue, fontFamily: F.text }}>{e.muscle}%</span>}
                    {e.visceral !== null && <span style={{ fontSize: 11, color: getVisceralZone(e.visceral).col, fontFamily: F.text }}>{e.visceral}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {d !== null && <span style={{ fontSize: 12, fontWeight: 600, color: d < 0 ? (g.key === "gain" ? T.red : T.accent) : (d > 0 ? (g.key === "loss" ? T.red : T.accent) : T.quaternary), fontFamily: F.text }}>{d > 0 ? "+" : ""}{d} kg</span>}
                  <span style={{ fontSize: 17, fontWeight: 800, color: T.primary, fontFamily: F.display, letterSpacing: "-0.5px" }}>{e.val} kg</span>
<button onClick={async () => {
  const newBodyLogs = { ...bodyLogs };
  const newWeightLogs = { ...weightLogs };
  delete newBodyLogs[e.date];
  delete newWeightLogs[e.date];
  if (user) {
    const { error } = await supabase.from("weight_logs").delete().eq("user_id", user.id).eq("date", e.date);
  }
  setBodyLogsLocal(newBodyLogs);
  setWeightLogsLocal(newWeightLogs);
}} style={{ background: "none", border: "none", color: T.quaternary, cursor: "pointer", fontSize: 17, padding: 0 }}><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="#FF3B30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MiniBarChart({ data, objective, accentColor, overColor, height = 110 }) {
  const maxV = Math.max(...data.map(d => d.value), objective, 100);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height, paddingTop: 4 }}>
      {data.map((d, i) => {
        const over = d.value > objective;
        const barH = d.hasData ? Math.round((d.value / maxV) * (height - 24)) : 0;
        const objH = Math.round((objective / maxV) * (height - 24));
        const barColor = !d.hasData ? T.bgInput : over ? (overColor || accentColor) : accentColor;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height }}>
            <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative" }}>
              <div style={{ position: "absolute", bottom: objH, left: 0, right: 0, borderTop: `1.5px dashed ${T.sep}` }} />
              <div style={{ width: "100%", height: barH, background: barColor, borderRadius: "5px 5px 0 0", transition: "height .5s cubic-bezier(.34,1.56,.64,1)", opacity: d.hasData ? 1 : 0.3 }} />
            </div>
            <span style={{ fontSize: 9, color: T.quaternary, fontFamily: F.text }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

const PERIOD = [{ k: "day", l: "Auj." }, { k: "week", l: "7j" }, { k: "month", l: "4 sem." }, { k: "year", l: "1 an" }];

function StatsTab({ profile, logs, weightLogs, setWeightLogs, acts, sessions, programs }) {
  const [period, setPeriod] = useState("week");
  const [weightPeriod, setWeightPeriod] = useState("week");
  const [sportPeriod, setSportPeriod] = useState("week");
  const [weightInput, setWeightInput] = useState("");
  const [weightDate, setWeightDate] = useState(today());
  const adj = calcAdjKcal(profile);
  const g = getGoal(profile);

  const getDays = () => {
    const days = [], now = new Date();
    const n = period === "day" ? 1 : period === "week" ? 7 : period === "month" ? 28 : 52;
    const step = period === "year" ? 7 : 1;
    for (let i = n - 1; i >= 0; i -= step) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const allF = logs[key] ? Object.entries(logs[key].meals || {}).filter(([k]) => k !== "null" && k !== null).flatMap(([, foods]) => foods) : [];
      const kcal = allF.length > 0 ? allF.reduce((s, f) => s + (f.kcal || 0), 0) : 0;
      days.push({ label: period === "year" ? d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : d.toLocaleDateString("fr-FR", { weekday: "short" }), value: Math.round(kcal), date: key, hasData: allF.length > 0 });
    }
    return days;
  };

  const getWeightDays = () => {
  const now = new Date();
  const nMap = { week: 7, month: 30, fourmonths: 120, year: 365 };
  const n = nMap[weightPeriod] || 7;
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - n);
  
  // Récupère toutes les pesées dans la période
  const entries = Object.entries(weightLogs)
    .filter(([date]) => date >= startDate.toISOString().slice(0, 10))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({
      label: new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      date,
      value
    }));
  
  return entries;
};

  const saveWeight = () => {
    if (!weightInput) return;
    setWeightLogs(prev => ({ ...prev, [weightDate]: parseFloat(weightInput) }));
    setWeightInput("");
  };

  const days = getDays();
  // Fusionne activités manuelles + séances musculation
  const getAllSportForDate = (date) => {
    const manualKcal = (acts || []).filter(a => a.date === date).reduce((s, a) => s + (a.kcal || 0), 0);
    const muscuKcal = Object.values(sessions || {}).flat().filter(s => s.date === date).length > 0 ? 200 : 0;
    return manualKcal + muscuKcal;
  };

  const sport = days.map(d => {
    const kcalSport = getAllSportForDate(d.date);
    const hasMuscu = Object.values(sessions || {}).flat().some(s => s.date === d.date);
    const hasManual = (acts || []).some(a => a.date === d.date);
    return { ...d, value: kcalSport, hasData: hasMuscu || hasManual };
  });
  const avgK = Math.round(days.reduce((s, d) => s + d.value, 0) / days.length);
  const avgS = Math.round(sport.reduce((s, d) => s + d.value, 0) / sport.length);
  const periodStart = days[0]?.date || "";
  const sportDays = (() => {
    const now = new Date();
    const nMap = { week: 7, month: 30, fourmonths: 120, year: 365 };
    const n = nMap[sportPeriod] || 7;
    const start = new Date(now); start.setDate(start.getDate() - n);
    return start.toISOString().slice(0, 10);
  })();
  const filteredActsSport = [
    ...(acts || []).filter(a => a.date >= sportDays),
    ...Object.values(sessions || {}).flat().filter(s => s.date >= sportDays).map(s => ({ kcal: 200 }))
  ];
  const totalSportPeriod = filteredActsSport.reduce((s, a) => s + (a.kcal || 0), 0);
  const periodEnd = days[days.length - 1]?.date || "";
  const filteredActs = [
    ...(acts || []).filter(a => a.date >= periodStart && a.date <= periodEnd),
    ...Object.values(sessions || {}).flat().filter(s => s.date >= periodStart && s.date <= periodEnd).map(s => ({ kcal: 200 }))
  ];
  const totalSport = filteredActs.reduce((s, a) => s + (a.kcal || 0), 0);

  const weightDays = getWeightDays();
  const weightValues = weightDays.filter(d => d.value !== null).map(d => d.value);
  const firstW = weightValues[0] || profile.weight || 0;
  const lastW = weightValues[weightValues.length - 1] || profile.weight || 0;
  const diffW = weightValues.length > 1 ? +(lastW - firstW).toFixed(1) : 0;
  const minW = weightValues.length ? Math.min(...weightValues) : 0;
  const maxW = weightValues.length ? Math.max(...weightValues) : 100;

  const WEIGHT_PERIODS = [{ k: "week", l: "7 jours" }, { k: "month", l: "1 mois" }, { k: "fourmonths", l: "4 mois" }, { k: "year", l: "1 an" }];

  return (
    <div style={{ paddingBottom: 90, background: T.bg, minHeight: "100vh" }}>
      <div style={{ padding: "56px 20px 16px", background: T.bgCard, boxShadow: shadow.sm }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.accent, fontFamily: F.text, letterSpacing: "0.04em", textTransform: "uppercase" }}>Statistiques</p>
        <h1 style={{ margin: "4px 0 12px", fontSize: 34, fontWeight: 800, color: T.primary, fontFamily: F.display, letterSpacing: "-0.8px", lineHeight: 1.08 }}>Bilan</h1>
        <div style={{ display: "flex", background: T.bgInput, borderRadius: R.sm, padding: 3, gap: 3 }}>
          {PERIOD.map(p => (
            <button key={p.k} style={{ ...pill(period === p.k, T.primary), flex: 1, padding: "7px 0" }} onClick={() => setPeriod(p.k)}>{p.l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, margin: "16px 16px 12px" }}>
        {[
          { l: "Moy. kcal/j", v: avgK,   u: "kcal",  c: avgK > adj ? T.red : g.col, sub: `obj. ${adj}` },
          { l: "Moy. sport",  v: avgS,   u: "kcal",  c: T.orange,                   sub: "par jour" },
          { l: "Objectif",    v: g.icon, u: g.label, c: g.col,                       sub: g.desc },
        ].map(k => (
          <div key={k.l} style={{ flex: 1, background: T.bgCard, borderRadius: R.lg, padding: "14px 10px", textAlign: "center", boxShadow: shadow.sm }}>
            <div style={{ fontSize: k.l === "Objectif" ? 26 : 20, fontWeight: 800, color: k.c, fontFamily: F.display, letterSpacing: "-0.5px", lineHeight: 1 }}>{k.v}</div>
            <div style={{ fontSize: 9, color: k.c, fontWeight: 600, fontFamily: F.text, marginTop: 2 }}>{k.u}</div>
            <div style={{ fontSize: 9, color: T.quaternary, fontFamily: F.text }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card(), padding: 16 }}>
        <p style={{ ...labelStyle, marginBottom: 4 }}>Calories alimentaires</p>
        <p style={{ margin: "2px 0 12px", fontSize: 12, color: T.quaternary, fontFamily: F.text }}>Ligne pointillee = {adj} kcal/j ({g.label})</p>
        <MiniBarChart data={days} objective={adj} accentColor={T.accent} overColor={T.red} />
      </div>

      <div style={{ ...card(), padding: 16 }}>
        <p style={{ ...labelStyle, marginBottom: 4 }}>Calories sport brulees</p>
        <p style={{ margin: "2px 0 12px", fontSize: 12, color: T.quaternary, fontFamily: F.text }}>Ligne pointillee = objectif 300 kcal/j</p>
        <MiniBarChart data={sport} objective={300} accentColor={T.orange} overColor={T.accent} />
      </div>

      <div style={{ ...card(), padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <p style={{ ...labelStyle, marginBottom: 4 }}>Evolution du poids</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: T.primary, fontFamily: F.display, letterSpacing: "-1px" }}>{lastW || profile.weight || "-"}</span>
              <span style={{ fontSize: 13, color: T.tertiary, fontFamily: F.text }}>kg</span>
              {diffW !== 0 && <span style={{ fontSize: 13, fontWeight: 700, color: diffW < 0 ? (g.key === "loss" ? T.accent : T.red) : (g.key === "gain" ? T.accent : T.red), fontFamily: F.text }}>{diffW > 0 ? "+" : ""}{diffW} kg</span>}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", background: T.bgInput, borderRadius: R.sm, padding: 3, gap: 3, marginBottom: 16 }}>
          {WEIGHT_PERIODS.map(p => (
            <button key={p.k} style={{ ...pill(weightPeriod === p.k, T.blue), flex: 1, padding: "7px 0", fontSize: 11 }} onClick={() => setWeightPeriod(p.k)}>{p.l}</button>
          ))}
        </div>

        {weightValues.length === 0 ? (
          <div style={{ height: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{ fontSize: 24 }}>📉</span>
            <p style={{ margin: 0, fontSize: 13, color: T.tertiary, fontFamily: F.text }}>Aucune mesure sur cette periode</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <svg viewBox="0 0 360 120" width="100%" height={120} style={{ overflow: "visible" }}>
              {/* Ligne de courbe */}
              {weightValues.length > 1 && (
                <polyline
                  points={weightDays.filter(p => p.value !== null).map((p, i, arr) => {
                    const idx = weightDays.indexOf(p);
                    const x = 28 + idx / (weightDays.length - 1 || 1) * 324;
                    const y = 10 + 86 - (p.value - minW) / Math.max(maxW - minW, 1) * 86;
                    return `${x},${y}`;
                  }).join(" ")}
                  fill="none" stroke={T.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
              )}
              {/* Points */}
              {weightDays.map((p, i) => p.value !== null && (
                <g key={i}>
                  <circle cx={28 + i / (weightDays.length - 1 || 1) * 324} cy={10 + 86 - (p.value - minW) / Math.max(maxW - minW, 1) * 86} r="4" fill={T.bgCard} stroke={T.blue} strokeWidth="2" />
                  <text x={28 + i / (weightDays.length - 1 || 1) * 324} y={10 + 86 - (p.value - minW) / Math.max(maxW - minW, 1) * 86 - 8} textAnchor="middle" fontSize="8.5" fill={T.blue} fontFamily={F.text} fontWeight="600">{p.value}</text>
                </g>
              ))}
            </svg>
          </div>
        )}

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.sep}` }}>
          <p style={{ ...labelStyle, marginBottom: 10 }}>Ajouter une mesure</p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="date" value={weightDate} onChange={e => setWeightDate(e.target.value)} style={{ ...inputStyle, flex: 1, fontSize: 13, padding: "9px 12px" }} />
            <input type="number" step="0.1" placeholder="70.5" value={weightInput} onChange={e => setWeightInput(e.target.value)} style={{ ...inputStyle, flex: 1, padding: "9px 12px" }} />
            <button onClick={saveWeight} style={{ ...btnPrimary(T.blue), padding: "9px 18px", fontSize: 14, flexShrink: 0 }}>+</button>
          </div>
          {Object.entries(weightLogs).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 3).map(([date, val]) => (
            <div key={date} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.sep}` }}>
              <span style={{ fontSize: 13, color: T.tertiary, fontFamily: F.text }}>{new Date(date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: T.primary, fontFamily: F.display }}>{val} kg</span>
                <button onClick={() => setWeightLogs(p => { const n = { ...p }; delete n[date]; return n; })} style={{ background: "none", border: "none", color: T.quaternary, cursor: "pointer", fontSize: 16, padding: 0 }}><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="#FF3B30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card(), padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ ...labelStyle, marginBottom: 0 }}>Repartition activites</p>
        </div>
        <div style={{ display: "flex", background: T.bgInput, borderRadius: R.sm, padding: 3, gap: 3, marginBottom: 14 }}>
          {[{ k: "week", l: "7j" }, { k: "month", l: "1 mois" }, { k: "fourmonths", l: "4 mois" }, { k: "year", l: "1 an" }].map(p => (
            <button key={p.k} style={{ ...pill(sportPeriod === p.k, T.blue), flex: 1, padding: "7px 0", fontSize: 11 }} onClick={() => setSportPeriod(p.k)}>{p.l}</button>
          ))}
        </div>
        {SPORT_CATS.map(cat => {
           const muscuActs = cat.key === "musculation" ? Object.values(sessions || {}).flat().filter(s => s.date >= sportDays).map(s => ({ kcal: 200, type: "musculation" })) : [];
const tot = [...filteredActsSport, ...muscuActs].filter(a => a.type === cat.key).reduce((s, a) => s + (a.kcal || 0), 0);
          const pct = totalSportPeriod ? Math.round(tot / totalSport * 100) : 0;
          return (
            <div key={cat.key} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, color: T.secondary, fontFamily: F.text }}>{cat.icon} {cat.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: cat.col, fontFamily: F.display }}>{tot} kcal <span style={{ fontSize: 11, fontWeight: 500, color: T.tertiary }}>({pct}%)</span></span>
              </div>
              <Bar value={tot} max={totalSportPeriod} color={cat.col} height={5} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { icon: (a) => a ? <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M2 9.5L11 2l9 7.5V20a1 1 0 01-1 1H14v-5H8v5H3a1 1 0 01-1-1V9.5z" fill="currentColor" /></svg> : <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M2 9.5L11 2l9 7.5V20a1 1 0 01-1 1H14v-5H8v5H3a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" /></svg>, label: "Profil" },
  { icon: (a) => a ? <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" fill="currentColor" opacity=".15" /><circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5" /><path d="M7 11h8M11 7v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> : <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5" /><path d="M7 11h8M11 7v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>, label: "Nutrition" },
  { icon: (a) => a ? <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="9" width="4" height="10" rx="1" fill="currentColor" /><rect x="9" y="5" width="4" height="14" rx="1" fill="currentColor" /><rect x="15" y="7" width="4" height="12" rx="1" fill="currentColor" /></svg> : <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="9" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="9" y="5" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="15" y="7" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>, label: "Sport" },
  { icon: (a) => a ? <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><ellipse cx="11" cy="17" rx="7" ry="2.5" fill="currentColor" opacity=".18" /><rect x="10" y="13" width="2" height="4" rx="1" fill="currentColor" /><rect x="7" y="12" width="8" height="2" rx="1" fill="currentColor" /><ellipse cx="11" cy="8" rx="6" ry="5" fill="currentColor" opacity=".15" /><ellipse cx="11" cy="8" rx="6" ry="5" stroke="currentColor" strokeWidth="1.5" /><path d="M8 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> : <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><ellipse cx="11" cy="17" rx="7" ry="2.5" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2,2" /><rect x="10" y="13" width="2" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="7" y="12" width="8" height="2" rx="1" stroke="currentColor" strokeWidth="1.3" /><ellipse cx="11" cy="8" rx="6" ry="5" stroke="currentColor" strokeWidth="1.5" /><path d="M8 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>, label: "Poids" },
  { icon: (a) => a ? <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 16l4-4 3 3 4-5 3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><rect x="2" y="2" width="18" height="18" rx="4" fill="currentColor" opacity=".12" /><rect x="2" y="2" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" /></svg> : <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 16l4-4 3 3 4-5 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><rect x="2" y="2" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" /></svg>, label: "Stats" },
];

// ─── Ecran Connexion / Inscription ───
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handle = async () => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Compte cree ! Verifie ton email pour confirmer puis connecte-toi.");
        setMode("login");
      }
    } catch (e) {
      setError(e.message || "Une erreur est survenue");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🥗</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: T.primary, fontFamily: F.display }}>Nutri Act</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: T.tertiary, fontFamily: F.text }}>Ton coach nutrition & sport</p>
        </div>

        <div style={{ background: T.bgCard, borderRadius: R.xl, padding: 24, boxShadow: shadow.lg }}>
          {/* Tabs login/signup */}
          <div style={{ display: "flex", background: T.bgInput, borderRadius: R.sm, padding: 3, gap: 3, marginBottom: 20 }}>
            {[["login", "Se connecter"], ["signup", "Creer un compte"]].map(([k, l]) => (
              <button key={k} style={{ ...pill(mode === k, T.accent), flex: 1, padding: "9px 0" }} onClick={() => { setMode(k); setError(""); }}>
                {l}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Email</label>
            <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: T.tertiary, fontFamily: F.text, display: "block", marginBottom: 4 }}>Mot de passe</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
              style={inputStyle} />
          </div>

          {error && (
            <div style={{ background: T.redSoft, borderRadius: R.sm, padding: "10px 12px", marginBottom: 14 }}>
              <p style={{ margin: 0, fontSize: 13, color: T.red, fontFamily: F.text }}>{error}</p>
            </div>
          )}
          {success && (
            <div style={{ background: T.accentSoft, borderRadius: R.sm, padding: "10px 12px", marginBottom: 14 }}>
              <p style={{ margin: 0, fontSize: 13, color: T.accent, fontFamily: F.text }}>{success}</p>
            </div>
          )}

          <button style={{ ...btnPrimary(), width: "100%", padding: "13px", fontSize: 16, opacity: loading ? 0.7 : 1 }}
            onClick={handle} disabled={loading}>
            {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Creer mon compte"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [profile, setProfile] = useState({ sex: "homme", weight: 80, height: 178, age: 30, activityLevel: 2, goal: "maintain" });
  const [logs, setLogs] = useState({});
  const [sportKcal, setSportKcal] = useState(0);
  const [sportActs, setSportActs] = useState([]);
  const [workoutPrograms, setWorkoutPrograms] = useState([]);
  const [workoutSessions, setWorkoutSessions] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [weightLogs, setWeightLogs] = useState({});
  const [bodyLogs, setBodyLogs] = useState({});

  // Verifier si l'utilisateur est deja connecte
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Charger les données quand l'utilisateur est connecté
  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);
  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const steps = logs[todayKey]?.steps || 0;
    const stepsKcal = Math.round(steps * 0.04);
    const actsKcal = sportActs.filter(a => a.date === todayKey).reduce((s, a) => s + a.kcal, 0);
    const total = stepsKcal + actsKcal;
    setSportKcal(prev => prev !== total ? total : prev);
  }, [logs, sportActs]);

  const loadData = async () => {
    // Profil
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (prof) setProfile({ sex: prof.sex || "homme", weight: prof.weight || 80, height: prof.height || 178, age: prof.age || 30, activityLevel: prof.activity_level ?? 2, goal: prof.goal || "maintain", targetWeight: prof.target_weight, name: prof.name, photo: prof.photo, birthdate: prof.birthdate });

    // Nutrition
    const { data: nutri } = await supabase.from("nutrition_logs").select("*").eq("user_id", user.id);
    if (nutri) {
      const logsObj = {};
      nutri.forEach(n => { logsObj[n.date] = { meals: n.meals || {}, water: n.water || 0 }; });
      setLogs(logsObj);
    }

    // Poids
    const { data: weights } = await supabase.from("weight_logs").select("*").eq("user_id", user.id);
    if (weights) {
      const wObj = {}, bObj = {};
      weights.forEach(w => {
        wObj[w.date] = w.weight;
        bObj[w.date] = { weight: w.weight, fat: w.fat, muscle: w.muscle, visceral: w.visceral };
      });
      setWeightLogs(wObj);
      setBodyLogs(bObj);
    }
  // Recettes
    const { data: recipesData } = await supabase.from("recipes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (recipesData) {
      setRecipes(recipesData.map(r => ({ id: r.id, name: r.name, ingredients: r.ingredients })));
    }

    // Activités sport
    const { data: sportsData } = await supabase.from("sport_logs").select("*").eq("user_id", user.id);
    if (sportsData) {
      setSportActs(sportsData.map(a => ({
        id: a.id,
        type: a.type,
        date: a.date,
        duration: a.duration,
        kcal: a.kcal,
        steps: a.steps || 0,
        name: a.name,
        km: a.km || null,
      })));
    }
  // Programmes musculation
    const { data: programsData } = await supabase.from("workout_programs").select("*").eq("user_id", user.id);
    if (programsData) {
      setWorkoutPrograms(programsData.map(p => ({
        id: p.id,
        name: p.name,
        exercises: p.exercises || [],
      })));
    }
  // Séances musculation
    const { data: sessionsData } = await supabase.from("workout_sessions").select("*").eq("user_id", user.id);
    if (sessionsData) {
      const sessionsObj = {};
      sessionsData.forEach(s => {
        const key = s.program_id;
        if (!sessionsObj[key]) sessionsObj[key] = [];
        sessionsObj[key].push({
          id: s.id,
          date: s.date,
          progId: s.program_id,
          progName: s.program_name,
          sets: s.sets || [],
          finishedAt: s.created_at,
        });
      });
      setWorkoutSessions(sessionsObj);
    }
  };
    

  // Sauvegarder le profil
  const saveProfile = async (newProfile) => {
    setProfile(newProfile);
    await supabase.from("profiles").upsert({
      id: user.id,
      name: newProfile.name,
      sex: newProfile.sex,
      weight: newProfile.weight,
      height: newProfile.height,
      age: newProfile.age,
      birthdate: newProfile.birthdate,
      activity_level: newProfile.activityLevel,
      goal: newProfile.goal,
      target_weight: newProfile.targetWeight,
      photo: newProfile.photo,
    });
  };

  // Sauvegarder les logs nutrition
  const saveLogs = async (newLogs) => {
  console.log("saveLogs appelé type:", typeof newLogs, newLogs);
  if (typeof newLogs === "function") {
    const resolved = newLogs(logs);
    setLogs(resolved);
    await saveLogsToSupabase(resolved);
  } else {
    setLogs(newLogs);
    await saveLogsToSupabase(newLogs);
  }
};

const saveLogsToSupabase = async (logsData) => {
  if (!logsData || typeof logsData !== "object") return;
  console.log("logsData type:", typeof logsData, Array.isArray(logsData));
  const dates = Object.keys(logsData).sort();
  for (const date of dates) {
    const entry = logsData[date];
    if (!entry) continue;
    console.log("Envoi:", date, entry.meals, entry.water);
    const { error } = await supabase.from("nutrition_logs").upsert({
      user_id: user.id,
      date: date,
      meals: entry.meals || {},
      water: entry.water || 0,
    }, { onConflict: "user_id,date" });
    if (error) console.error("Erreur:", error);
  }
};

  // Sauvegarder les logs poids
  const saveWeightLogs = async (newLogs) => {
    setWeightLogs(newLogs);
  }

  const saveBodyLogs = async (newLogs) => {
    console.log("saveBodyLogs appelé avec:", Object.keys(newLogs));
    setBodyLogs(newLogs);
    const dates = Object.keys(newLogs).sort();
    for (const date of dates) {
      const entry = newLogs[date];
      await supabase.from("weight_logs").upsert({
        user_id: user.id,
        date: date,
        weight: entry.weight,
        fat: entry.fat,
        muscle: entry.muscle,
        visceral: entry.visceral,
      }, { onConflict: "user_id,date" });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile({ sex: "homme", weight: 80, height: 178, age: 30, activityLevel: 2, goal: "maintain" });
    setLogs({}); setWeightLogs({}); setBodyLogs({});
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🥗</div>
        <p style={{ fontSize: 15, color: T.tertiary, fontFamily: F.text }}>Chargement...</p>
      </div>
    </div>
  );

  if (!user) return <AuthScreen onAuth={setUser} />;

  const pages = [
    <HomeTab      profile={profile} setProfile={saveProfile} onLogout={logout} userEmail={user.email} />,
    <NutritionTab profile={profile} logs={logs} setLogs={saveLogs} sportKcal={sportKcal} recipes={recipes} setRecipes={setRecipes} user={user} />,
    <SportTab setSportKcal={setSportKcal} profile={profile} acts={sportActs} setActs={setSportActs} user={user} workoutPrograms={workoutPrograms} setWorkoutPrograms={setWorkoutPrograms} workoutSessions={workoutSessions} setWorkoutSessions={setWorkoutSessions} />,
    <WeightTab profile={profile} setProfile={saveProfile} weightLogs={weightLogs} setWeightLogs={saveWeightLogs} bodyLogs={bodyLogs} setBodyLogs={saveBodyLogs} setBodyLogsLocal={setBodyLogs} setWeightLogsLocal={setWeightLogs} user={user} />,
    <StatsTab profile={profile} logs={logs} weightLogs={weightLogs} setWeightLogs={saveWeightLogs} acts={sportActs} sessions={workoutSessions} programs={workoutPrograms} />,
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`*{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;box-sizing:border-box;} body{margin:0;background:#F2F2F7;} input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;} select option{background:#fff;color:#1C1C1E;} ::-webkit-scrollbar{display:none;}`}</style>
      <div style={{ background: T.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative", fontFamily: F.text }}>
        <div style={{ overflowY: "auto", paddingBottom: 0 }}>
          {pages[tab]}
        </div>
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: T.bgGlass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: `0.5px solid ${T.sep}`, display: "flex", paddingBottom: "env(safe-area-inset-bottom,0)", zIndex: 200 }}>
          {NAV_ITEMS.map((item, i) => {
            const active = tab === i;
            return (
              <button key={i} onClick={() => setTab(i)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer", color: active ? T.accent : T.quaternary, transition: "color .15s ease" }}>
                {item.icon(active)}
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, marginTop: 3, fontFamily: F.text, letterSpacing: "-0.01em", color: active ? T.accent : T.quaternary }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}