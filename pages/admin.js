import { useState, useEffect, useCallback } from 'react';

const S = {
  page:    { fontFamily: "'Inter', system-ui, sans-serif", background: '#f5f2ed', minHeight: '100vh', color: '#2a1f15' },
  sidebar: { width: '220px', background: '#2a1f15', minHeight: '100vh', padding: '0', position: 'fixed', top: 0, left: 0, display: 'flex', flexDirection: 'column' },
  sideTop: { padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  sideTitle: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.1rem', color: '#f9f5ee', fontWeight: 400, margin: '0 0 0.15rem' },
  sideSub:   { fontSize: '0.65rem', color: 'rgba(249,245,238,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' },
  navItem:   (a) => ({ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1.25rem', cursor: 'pointer', background: a ? 'rgba(200,180,154,0.15)' : 'none', borderLeft: a ? '2px solid #c8b49a' : '2px solid transparent', color: a ? '#f9f5ee' : 'rgba(249,245,238,0.5)', fontSize: '0.82rem', transition: 'all 0.15s', userSelect: 'none' }),
  main:    { marginLeft: '220px', padding: '2rem 2.5rem', maxWidth: '960px' },
  header:  { marginBottom: '2rem' },
  h1:      { fontSize: '1.4rem', fontWeight: 600, color: '#2a1f15', margin: '0 0 0.25rem' },
  sub:     { fontSize: '0.82rem', color: '#9a8a7a' },
  card:    { background: '#fff', border: '0.5px solid #e0d8cc', borderRadius: '8px', padding: '1.25rem 1.5rem', marginBottom: '1rem' },
  statGrid:{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' },
  stat:    { background: '#fff', border: '0.5px solid #e0d8cc', borderRadius: '8px', padding: '1rem 1.25rem' },
  statNum: { fontSize: '1.8rem', fontWeight: 600, color: '#5c4130', lineHeight: 1, marginBottom: '0.25rem' },
  statLbl: { fontSize: '0.7rem', color: '#9a8a7a', letterSpacing: '0.08em', textTransform: 'uppercase' },
  table:   { width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' },
  th:      { textAlign: 'left', padding: '0.6rem 0.75rem', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9a8a7a', borderBottom: '1px solid #e0d8cc', fontWeight: 500 },
  td:      { padding: '0.75rem', borderBottom: '0.5px solid #f0ebe3', verticalAlign: 'top' },
  badge:   (c) => ({ display: 'inline-block', padding: '0.2rem 0.55rem', borderRadius: '20px', fontSize: '0.7rem', background: c === 'green' ? '#eaf3de' : c === 'amber' ? '#faeeda' : '#f0ebe3', color: c === 'green' ? '#3b6d11' : c === 'amber' ? '#854f0b' : '#6a5a4a' }),
  btn:     { background: '#7a5c3c', color: '#fff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 500 },
  btnSm:   { background: 'none', color: '#7a5c3c', border: '1px solid #c8b49a', padding: '0.35rem 0.85rem', borderRadius: '5px', fontSize: '0.75rem', cursor: 'pointer' },
  btnDanger: { background: 'none', color: '#a32d2d', border: '1px solid #f0c0c0', padding: '0.35rem 0.85rem', borderRadius: '5px', fontSize: '0.75rem', cursor: 'pointer' },
  input:   { padding: '0.5rem 0.75rem', border: '0.5px solid #c8b49a', borderRadius: '6px', fontSize: '0.84rem', fontFamily: 'inherit', color: '#2a1f15', background: '#fff', width: '100%', boxSizing: 'border-box' },
  label:   { fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9a8a7a', display: 'block', marginBottom: '0.3rem', marginTop: '0.75rem' },
  row:     { display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' },
  actRow:  { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', border: '0.5px solid #e0d8cc', borderRadius: '6px', marginBottom: '0.5rem', background: '#fff' },
};

const NAV = [
  { id: 'overview', label: 'Übersicht', icon: '📊' },
  { id: 'rsvps',    label: 'Anmeldungen', icon: '👥' },
  { id: 'activities', label: 'Aktivitäten', icon: '🗓️' },
  { id: 'settings', label: 'Einstellungen', icon: '⚙️' },
];

const DAYS = ['Mittwoch, 03. Sept.', 'Donnerstag, 04. Sept.', 'Freitag, 05. Sept.', 'Samstag, 06. Sept.', 'Sonntag, 07. Sept.'];
const ICONS = ['💍','🥂','🌿','🍷','🚴','🍳','🧺','🌸','👋','🎵','🎨','🏊','🧘','🚶','🎭'];

export default function Admin() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authErr, setAuthErr] = useState('');
  const [page, setPage] = useState('overview');
  const [rsvps, setRsvps] = useState([]);
  const [activities, setActivities] = useState([]);
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [editAct, setEditAct] = useState(null);
  const [filter, setFilter] = useState('');
  const [settings, setSettings] = useState({ deadline: '01. Juli 2026', venue: 'Château de Veullerot', location: 'Liernais, Bourgogne, France', contactEmail: 'heiraten@leonie-und-moritz.de', dateRange: '03.–07. September 2026' });

  const fetchAll = useCallback(async (s) => {
    setLoading(true);
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch(`/api/rsvp?secret=${s}`).then(r => r.json()),
        fetch(`/api/activities?secret=${s}`).then(r => r.json()),
        fetch('/api/votes').then(r => r.json()),
      ]);
      if (r1.error) { setAuthErr('Falsches Passwort.'); setAuthed(false); setLoading(false); return; }
      setRsvps(r1.rsvps || []);
      setActivities(r2.activities || []);
      setVotes(r3.votes || {});
      setAuthed(true);
    } catch { setAuthErr('Verbindungsfehler.'); }
    setLoading(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthErr('');
    await fetchAll(secret);
  };

  const totalGuests = rsvps.reduce((s, r) => s + (parseInt(r.guests) || 1), 0);
  const activityCount = (id) => rsvps.filter(r => r.activities?.includes(id)).reduce((s, r) => s + (parseInt(r.guests) || 1), 0);

  const saveActivities = async (updated) => {
    setSaveMsg('');
    const res = await fetch('/api/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret, activities: updated }) });
    const data = await res.json();
    if (data.success) { setActivities(data.activities); setSaveMsg('Gespeichert ✓'); setTimeout(() => setSaveMsg(''), 2500); }
  };

  const updateActivity = (idx, field, value) => {
    const updated = activities.map((a, i) => i === idx ? { ...a, [field]: field === 'capacity' ? (value === '' ? null : parseInt(value)) : value } : a);
    setActivities(updated);
  };

  const addActivity = () => {
    const newAct = { id: `act_${Date.now()}`, day: DAYS[0], title: 'Neue Aktivität', time: '10:00 Uhr', icon: '🎵', desc: '', capacity: null, required: false };
    setActivities([...activities, newAct]);
    setEditAct(activities.length);
  };

  const removeActivity = (idx) => {
    if (!confirm('Aktivität wirklich löschen?')) return;
    const updated = activities.filter((_, i) => i !== idx);
    setActivities(updated);
    saveActivities(updated);
  };

  const filteredRsvps = rsvps.filter(r =>
    !filter || r.name?.toLowerCase().includes(filter.toLowerCase()) || r.email?.toLowerCase().includes(filter.toLowerCase())
  );

  if (!authed) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ background: '#fff', border: '0.5px solid #e0d8cc', borderRadius: '10px', padding: '2.5rem 2rem', width: '100%', maxWidth: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', color: '#5c4130', margin: '0 0 0.2rem', fontWeight: 400 }}>Leonie &amp; Moritz</p>
          <p style={{ fontSize: '0.72rem', color: '#9a8a7a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin-Bereich</p>
        </div>
        <form onSubmit={handleLogin}>
          <label style={S.label}>Passwort</label>
          <input style={{ ...S.input, marginBottom: '1rem' }} type="password" value={secret} onChange={e => setSecret(e.target.value)} placeholder="Admin-Passwort" autoFocus />
          {authErr && <p style={{ fontSize: '0.8rem', color: '#a32d2d', marginBottom: '0.75rem' }}>{authErr}</p>}
          <button style={{ ...S.btn, width: '100%', padding: '0.65rem' }} type="submit" disabled={loading}>{loading ? 'Lädt …' : 'Anmelden'}</button>
        </form>
        <p style={{ fontSize: '0.72rem', color: '#b0a090', textAlign: 'center', marginTop: '1rem' }}>Das Passwort setzt ihr in Vercel unter Settings → Environment Variables → ADMIN_SECRET</p>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* SIDEBAR */}
      <aside style={S.sidebar}>
        <div style={S.sideTop}>
          <p style={S.sideTitle}>Leonie &amp; Moritz</p>
          <p style={S.sideSub}>Admin · 03.09.2026</p>
        </div>
        <nav style={{ flex: 1, paddingTop: '0.5rem' }}>
          {NAV.map(n => (
            <div key={n.id} style={S.navItem(page === n.id)} onClick={() => setPage(n.id)}>
              <span style={{ fontSize: '0.95rem' }}>{n.icon}</span>
              <span>{n.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <a href="/" target="_blank" style={{ fontSize: '0.72rem', color: 'rgba(249,245,238,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>↗</span> Webseite ansehen
          </a>
        </div>
      </aside>

      {/* MAIN */}
      <main style={S.main}>

        {/* ─── OVERVIEW ─── */}
        {page === 'overview' && (
          <>
            <div style={S.header}>
              <h1 style={S.h1}>Übersicht</h1>
              <p style={S.sub}>Stand: {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
            <div style={S.statGrid}>
              {[
                [rsvps.length, 'Anmeldungen'],
                [totalGuests, 'Gäste gesamt'],
                [activities.filter(a => !a.required).length, 'Opt-in Aktivitäten'],
                [Object.values(votes).reduce((s, v) => s + v, 0), 'Herzchen vergeben'],
              ].map(([n, l], i) => (
                <div key={i} style={S.stat}><div style={S.statNum}>{n}</div><div style={S.statLbl}>{l}</div></div>
              ))}
            </div>

            <div style={S.card}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#5c4130' }}>Aktivitäten-Auslastung</h2>
              {activities.filter(a => !a.required).map(a => {
                const count = activityCount(a.id);
                const cap = a.capacity || 0;
                const pct = cap ? Math.min(100, Math.round(count / cap * 100)) : 0;
                const vc = votes[a.id] || 0;
                return (
                  <div key={a.id} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.82rem' }}>
                      <span style={{ fontWeight: 500 }}>{a.icon} {a.title}</span>
                      <span style={{ color: '#9a8a7a' }}>
                        {count}{cap ? ` / ${cap} Plätze` : ' Pers.'} · {vc} ♡
                      </span>
                    </div>
                    {cap > 0 && (
                      <div style={{ height: '6px', background: '#f0ebe3', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? '#b05040' : pct >= 60 ? '#c8931a' : '#7a5c3c', borderRadius: '3px', transition: 'width 0.4s' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={S.card}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#5c4130' }}>Neueste Anmeldungen</h2>
              {rsvps.slice(-5).reverse().map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '0.5px solid #f0ebe3', fontSize: '0.84rem' }}>
                  <span style={{ fontWeight: 500 }}>{r.name}</span>
                  <span style={{ color: '#9a8a7a' }}>{r.guests} Pers. · {new Date(r.createdAt).toLocaleDateString('de-DE')}</span>
                </div>
              ))}
              {rsvps.length === 0 && <p style={{ color: '#9a8a7a', fontSize: '0.84rem' }}>Noch keine Anmeldungen.</p>}
            </div>
          </>
        )}

        {/* ─── RSVPS ─── */}
        {page === 'rsvps' && (
          <>
            <div style={{ ...S.header, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={S.h1}>Anmeldungen</h1>
                <p style={S.sub}>{rsvps.length} Anmeldungen · {totalGuests} Gäste</p>
              </div>
              <input style={{ ...S.input, width: '220px' }} placeholder="Suchen …" value={filter} onChange={e => setFilter(e.target.value)} />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {['Name', 'E-Mail', 'Pers.', 'Aktivitäten', 'Nachricht', 'Angemeldet'].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRsvps.length === 0 && (
                    <tr><td colSpan={6} style={{ ...S.td, color: '#9a8a7a', textAlign: 'center', padding: '2rem' }}>Keine Einträge gefunden.</td></tr>
                  )}
                  {filteredRsvps.map((r, i) => (
                    <tr key={i}>
                      <td style={{ ...S.td, fontWeight: 500 }}>{r.name}</td>
                      <td style={{ ...S.td, color: '#6a5a4a' }}><a href={`mailto:${r.email}`} style={{ color: '#7a5c3c', textDecoration: 'none' }}>{r.email}</a></td>
                      <td style={{ ...S.td, textAlign: 'center' }}>{r.guests}</td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {(r.activities || []).length === 0
                            ? <span style={S.badge('gray')}>nur Hauptevents</span>
                            : (r.activities || []).map(id => {
                                const a = activities.find(x => x.id === id);
                                return <span key={id} style={S.badge('green')}>{a?.icon} {a?.title || id}</span>;
                              })}
                        </div>
                      </td>
                      <td style={{ ...S.td, color: '#6a5a4a', maxWidth: '160px', fontSize: '0.78rem' }}>{r.message || '–'}</td>
                      <td style={{ ...S.td, color: '#9a8a7a', whiteSpace: 'nowrap' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rsvps.length > 0 && (
              <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                <button style={S.btnSm} onClick={() => {
                  const csv = [
                    ['Name','E-Mail','Personen','Aktivitäten','Nachricht','Datum'],
                    ...rsvps.map(r => [r.name, r.email, r.guests, (r.activities||[]).join('; '), r.message, r.createdAt ? new Date(r.createdAt).toLocaleDateString('de-DE') : ''])
                  ].map(row => row.map(c => `"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
                  const a = document.createElement('a');
                  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
                  a.download = 'anmeldungen.csv';
                  a.click();
                }}>⬇ CSV exportieren</button>
              </div>
            )}
          </>
        )}

        {/* ─── ACTIVITIES ─── */}
        {page === 'activities' && (
          <>
            <div style={{ ...S.header, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={S.h1}>Aktivitäten verwalten</h1>
                <p style={S.sub}>Reihenfolge, Kapazitäten und Beschreibungen bearbeiten</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {saveMsg && <span style={{ fontSize: '0.8rem', color: '#3b6d11' }}>{saveMsg}</span>}
                <button style={S.btnSm} onClick={addActivity}>+ Neu</button>
                <button style={S.btn} onClick={() => saveActivities(activities)}>Speichern</button>
              </div>
            </div>

            {activities.map((a, idx) => (
              <div key={a.id} style={{ ...S.card, padding: '0' }}>
                <div style={S.actRow}>
                  <span style={{ fontSize: '1.1rem', minWidth: '1.5rem' }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{a.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9a8a7a' }}>{a.day} · {a.time} {a.capacity ? `· max. ${a.capacity} Pers.` : '· unbegrenzt'} {a.required && '· Pflicht'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={S.btnSm} onClick={() => setEditAct(editAct === idx ? null : idx)}>
                      {editAct === idx ? 'Schließen' : 'Bearbeiten'}
                    </button>
                    {!a.required && <button style={S.btnDanger} onClick={() => removeActivity(idx)}>Löschen</button>}
                  </div>
                </div>

                {editAct === idx && (
                  <div style={{ padding: '1rem 1.25rem 1.25rem', borderTop: '0.5px solid #e0d8cc', background: '#faf8f5' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={S.label}>Titel</label>
                        <input style={S.input} value={a.title} onChange={e => updateActivity(idx, 'title', e.target.value)} />
                      </div>
                      <div>
                        <label style={S.label}>Uhrzeit</label>
                        <input style={S.input} value={a.time} onChange={e => updateActivity(idx, 'time', e.target.value)} />
                      </div>
                      <div>
                        <label style={S.label}>Tag</label>
                        <select style={S.input} value={a.day} onChange={e => updateActivity(idx, 'day', e.target.value)}>
                          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={S.label}>Icon</label>
                        <select style={S.input} value={a.icon} onChange={e => updateActivity(idx, 'icon', e.target.value)}>
                          {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={S.label}>Max. Teilnehmer (leer = unbegrenzt)</label>
                        <input style={S.input} type="number" min="1" value={a.capacity ?? ''} onChange={e => updateActivity(idx, 'capacity', e.target.value)} placeholder="unbegrenzt" />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
                        <input type="checkbox" id={`req-${idx}`} checked={!!a.required} onChange={e => updateActivity(idx, 'required', e.target.checked)} />
                        <label htmlFor={`req-${idx}`} style={{ fontSize: '0.82rem', color: '#6a5a4a', cursor: 'pointer' }}>Pflichtveranstaltung (alle Gäste)</label>
                      </div>
                    </div>
                    <div>
                      <label style={S.label}>Beschreibung</label>
                      <textarea style={{ ...S.input, height: '72px', resize: 'vertical' }} value={a.desc} onChange={e => updateActivity(idx, 'desc', e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div style={{ textAlign: 'right', marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
              {saveMsg && <span style={{ fontSize: '0.8rem', color: '#3b6d11' }}>{saveMsg}</span>}
              <button style={S.btn} onClick={() => saveActivities(activities)}>Alle Änderungen speichern</button>
            </div>
          </>
        )}

        {/* ─── SETTINGS ─── */}
        {page === 'settings' && (
          <>
            <div style={S.header}>
              <h1 style={S.h1}>Einstellungen</h1>
              <p style={S.sub}>Allgemeine Informationen zur Hochzeit</p>
            </div>

            <div style={S.card}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem', color: '#5c4130' }}>Hochzeits-Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  ['Anmelde-Deadline', 'deadline', 'z. B. 01. Juli 2026'],
                  ['Zeitraum', 'dateRange', 'z. B. 03.–07. September 2026'],
                  ['Venue', 'venue', 'z. B. Château de Veullerot'],
                  ['Ort', 'location', 'z. B. Liernais, Bourgogne, France'],
                  ['Kontakt-E-Mail', 'contactEmail', 'eure@email.de'],
                ].map(([lbl, key, ph]) => (
                  <div key={key}>
                    <label style={S.label}>{lbl}</label>
                    <input style={S.input} value={settings[key]} onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))} placeholder={ph} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button style={S.btn} onClick={() => { setSaveMsg('Einstellungen gespeichert ✓'); setTimeout(() => setSaveMsg(''), 2500); }}>Speichern</button>
                {saveMsg && <span style={{ fontSize: '0.8rem', color: '#3b6d11' }}>{saveMsg}</span>}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#b0a090', marginTop: '0.75rem' }}>
                Hinweis: Diese Einstellungen werden aktuell nur lokal gespeichert. Um sie dauerhaft zu übernehmen, tragt die Werte direkt in <code>pages/index.js</code> ein oder verbindet eine Datenbank.
              </p>
            </div>

            <div style={S.card}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#5c4130' }}>Admin-Passwort</h2>
              <p style={{ fontSize: '0.84rem', color: '#6a5a4a', lineHeight: 1.7, marginBottom: '0.75rem' }}>
                Das Passwort wird in Vercel gesetzt und kann nicht von hier geändert werden. Geht zu:
              </p>
              <code style={{ display: 'block', background: '#f5f2ed', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.82rem', color: '#5c4130' }}>
                Vercel Dashboard → Euer Projekt → Settings → Environment Variables → ADMIN_SECRET
              </code>
            </div>

            <div style={S.card}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#5c4130' }}>Datenbank verbinden (empfohlen)</h2>
              <p style={{ fontSize: '0.84rem', color: '#6a5a4a', lineHeight: 1.7 }}>
                Aktuell werden Anmeldungen im Arbeitsspeicher gespeichert und gehen bei Server-Neustart verloren. Für dauerhaften Betrieb empfehlen wir <strong>Supabase</strong> (kostenlos). Die genaue Anleitung steht in der <code>README.md</code>.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
