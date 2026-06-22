import { useState, useEffect, useCallback } from 'react';

const S = {
  page:      { fontFamily: "'Inter', system-ui, sans-serif", background: '#f5f2ed', minHeight: '100vh', color: '#2a1f15' },
  sidebar:   { width: '220px', background: '#2a1f15', minHeight: '100vh', position: 'fixed', top: 0, left: 0, display: 'flex', flexDirection: 'column' },
  sideTop:   { padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  sideTitle: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.1rem', color: '#f9f5ee', fontWeight: 400, margin: '0 0 0.15rem' },
  sideSub:   { fontSize: '0.65rem', color: 'rgba(249,245,238,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' },
  navItem:   (a) => ({ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1.25rem', cursor: 'pointer', background: a ? 'rgba(200,180,154,0.15)' : 'none', borderLeft: a ? '2px solid #c8b49a' : '2px solid transparent', color: a ? '#f9f5ee' : 'rgba(249,245,238,0.5)', fontSize: '0.82rem', transition: 'all 0.15s', userSelect: 'none' }),
  main:      { marginLeft: '220px', padding: '2rem 2.5rem', maxWidth: '960px' },
  h1:        { fontSize: '1.4rem', fontWeight: 600, color: '#2a1f15', margin: '0 0 0.25rem' },
  h2:        { fontSize: '1rem', fontWeight: 600, color: '#5c4130', margin: '0 0 1rem' },
  sub:       { fontSize: '0.82rem', color: '#9a8a7a' },
  card:      { background: '#fff', border: '0.5px solid #e0d8cc', borderRadius: '8px', padding: '1.25rem 1.5rem', marginBottom: '1rem' },
  statGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' },
  stat:      { background: '#fff', border: '0.5px solid #e0d8cc', borderRadius: '8px', padding: '1rem 1.25rem' },
  statNum:   { fontSize: '1.8rem', fontWeight: 600, color: '#5c4130', lineHeight: 1, marginBottom: '0.25rem' },
  statLbl:   { fontSize: '0.7rem', color: '#9a8a7a', letterSpacing: '0.08em', textTransform: 'uppercase' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' },
  th:        { textAlign: 'left', padding: '0.6rem 0.75rem', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9a8a7a', borderBottom: '1px solid #e0d8cc', fontWeight: 500 },
  td:        { padding: '0.65rem 0.75rem', borderBottom: '0.5px solid #f0ebe3', verticalAlign: 'top' },
  badge:     (c) => ({ display: 'inline-block', padding: '0.2rem 0.55rem', borderRadius: '20px', fontSize: '0.7rem', background: c === 'green' ? '#eaf3de' : c === 'amber' ? '#faeeda' : '#f0ebe3', color: c === 'green' ? '#3b6d11' : c === 'amber' ? '#854f0b' : '#6a5a4a', marginRight: '0.2rem', marginBottom: '0.2rem' }),
  btn:       { background: '#7a5c3c', color: '#fff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 500 },
  btnSm:     { background: 'none', color: '#7a5c3c', border: '1px solid #c8b49a', padding: '0.3rem 0.75rem', borderRadius: '5px', fontSize: '0.74rem', cursor: 'pointer' },
  btnDanger: { background: 'none', color: '#a32d2d', border: '1px solid #f0c0c0', padding: '0.3rem 0.75rem', borderRadius: '5px', fontSize: '0.74rem', cursor: 'pointer' },
  input:     { padding: '0.5rem 0.75rem', border: '0.5px solid #c8b49a', borderRadius: '6px', fontSize: '0.84rem', fontFamily: 'inherit', color: '#2a1f15', background: '#fff', width: '100%', boxSizing: 'border-box' },
  label:     { fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9a8a7a', display: 'block', marginBottom: '0.3rem', marginTop: '0.75rem' },
  actRow:    { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderBottom: '0.5px solid #f0ebe3' },
};

const NAV = [
  { id: 'overview',   label: 'Übersicht',    icon: '📊' },
  { id: 'rsvps',      label: 'Anmeldungen',  icon: '👥' },
  { id: 'byactivity', label: 'Je Aktivität', icon: '📋' },
  { id: 'activities', label: 'Aktivitäten',  icon: '🗓️' },
  { id: 'info',       label: 'Info-Texte',   icon: '📝' },
  { id: 'settings',   label: 'Einstellungen',icon: '⚙️' },
];

const DAYS = ['Sonntag, 30. Aug.','Montag, 31. Aug.','Dienstag, 01. Sept.','Mittwoch, 02. Sept.','Donnerstag, 03. Sept.','Freitag, 04. Sept.','Samstag, 05. Sept.','Sonntag, 06. Sept.'];
const ICONS = ['💍','🥂','🌿','🍷','🚴','🍳','🧺','🌸','👋','🎵','🎨','🏊','🧘','🚶','🎭','🔥','🏰','🥾'];

const INFO_FIELDS = [
  { key: 'info_travel',        label: 'Anreise' },
  { key: 'info_accommodation', label: 'Unterkunft' },
  { key: 'info_dresscode',     label: 'Dresscode' },
  { key: 'info_practical',     label: 'Praktisches' },
  { key: 'info_contact',       label: 'Kontakt' },
  { key: 'info_wishlist',      label: 'Wunschliste' },
];

const SETTING_FIELDS = [
  { key: 'dateRange',    label: 'Zeitraum',         ph: '31.08.–06.09.2026' },
  { key: 'deadline',     label: 'Anmelde-Deadline', ph: '01. Juli 2026' },
  { key: 'venue',        label: 'Venue',            ph: 'Château de Veullerot' },
  { key: 'location',     label: 'Ort',              ph: 'Liernais, Bourgogne, France' },
  { key: 'contactEmail', label: 'Kontakt-E-Mail',   ph: 'eure@email.de' },
];

export default function Admin() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authErr, setAuthErr] = useState('');
  const [page, setPage] = useState('overview');
  const [rsvps, setRsvps] = useState([]);
  const [activities, setActivities] = useState([]);
  const [votes, setVotes] = useState({});
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [editAct, setEditAct] = useState(null);
  const [editRsvp, setEditRsvp] = useState(null);
  const [editRsvpData, setEditRsvpData] = useState({});
  const [filter, setFilter] = useState('');

  const showMsg = (msg) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(''), 2500); };

  const fetchAll = useCallback(async (s) => {
    setLoading(true);
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        fetch(`/api/rsvp?secret=${s}`).then(r => r.json()),
        fetch('/api/activities').then(r => r.json()),
        fetch('/api/votes').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
      ]);
      if (r1.error) { setAuthErr('Falsches Passwort.'); setAuthed(false); setLoading(false); return; }
      setRsvps(r1.rsvps || []);
      setActivities(r2.activities || []);
      setVotes(r3.votes || {});
      if (r4.settings) setSettings(r4.settings);
      setAuthed(true);
    } catch { setAuthErr('Verbindungsfehler.'); }
    setLoading(false);
  }, []);

  const handleLogin = async (e) => { e.preventDefault(); setAuthErr(''); await fetchAll(secret); };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch(`/api/rsvp?secret=${secret}`).then(r => r.json()),
        fetch('/api/activities').then(r => r.json()),
        fetch('/api/votes').then(r => r.json()),
      ]);
      setRsvps(r1.rsvps || []);
      setActivities(r2.activities || []);
      setVotes(r3.votes || {});
      showMsg('Aktualisiert ✓');
    } catch { showMsg('Fehler beim Laden.'); }
    setLoading(false);
  };

  const totalGuests = rsvps.reduce((s, r) => s + (parseInt(r.guests) || 1), 0);
  const activityCount = (id) => rsvps.filter(r => r.activities?.includes(id)).reduce((s, r) => s + (parseInt(r.guests) || 1), 0);
  const activityRsvps = (id) => rsvps.filter(r => r.activities?.includes(id));

  const saveActivities = async (updated) => {
    try {
      const res = await fetch('/api/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret, activities: updated }) });
      const data = await res.json();
      if (data.success) { setActivities(data.activities); showMsg('Gespeichert ✓'); }
      else showMsg('Fehler: ' + (data.error || 'Unbekannt'));
    } catch { showMsg('Verbindungsfehler.'); }
  };

  const saveSettings = async (updated) => {
    try {
      const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret, settings: updated }) });
      const data = await res.json();
      if (data.success) { setSettings(updated); showMsg('Gespeichert ✓'); }
      else showMsg('Fehler: ' + (data.error || 'Unbekannt'));
    } catch { showMsg('Verbindungsfehler.'); }
  };

  const updateActivity = (idx, field, value) =>
    setActivities(activities.map((a, i) => i === idx ? { ...a, [field]: field === 'capacity' ? (value === '' ? null : parseInt(value)) : value } : a));

  const addActivity = async () => {
    const newAct = { id: `act_${Date.now()}`, day: DAYS[0], title: 'Neue Aktivität', time: '10:00 Uhr', icon: '🎵', desc: '', capacity: null, required: false };
    const updated = [...activities, newAct];
    setActivities(updated);
    setEditAct(updated.length - 1);
    await saveActivities(updated);
  };

  const removeActivity = async (idx) => {
    if (!confirm('Aktivität wirklich löschen?')) return;
    try { await fetch('/api/activities', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret, id: activities[idx].id }) }); } catch {}
    setActivities(activities.filter((_, i) => i !== idx));
    showMsg('Gelöscht ✓');
  };

  const startEditRsvp = (r) => { setEditRsvp(r.id); setEditRsvpData({ name: r.name, email: r.email, guests: String(r.guests), message: r.message || '', activities: r.activities || [] }); };

  const saveRsvp = async (id) => {
    try {
      const res = await fetch('/api/rsvp', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret, id, ...editRsvpData, guests: parseInt(editRsvpData.guests) }) });
      const data = await res.json();
      if (data.success) { setRsvps(rsvps.map(r => r.id === id ? { ...r, ...editRsvpData, guests: parseInt(editRsvpData.guests) } : r)); setEditRsvp(null); showMsg('Gespeichert ✓'); }
      else showMsg('Fehler: ' + (data.error || 'Unbekannt'));
    } catch { showMsg('Verbindungsfehler.'); }
  };

  const deleteRsvp = async (id, name) => {
    if (!confirm(`Anmeldung von ${name} wirklich löschen?`)) return;
    try {
      const res = await fetch('/api/rsvp', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret, id }) });
      const data = await res.json();
      if (data.success) { setRsvps(rsvps.filter(r => r.id !== id)); showMsg('Gelöscht ✓'); }
      else showMsg('Fehler: ' + (data.error || 'Unbekannt'));
    } catch { showMsg('Verbindungsfehler.'); }
  };

  const filteredRsvps = rsvps.filter(r => !filter || r.name?.toLowerCase().includes(filter.toLowerCase()) || r.email?.toLowerCase().includes(filter.toLowerCase()));
  const msgColor = saveMsg.includes('Fehler') || saveMsg.includes('fehler') ? '#a32d2d' : '#3b6d11';

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
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <aside style={S.sidebar}>
        <div style={S.sideTop}>
          <p style={S.sideTitle}>Leonie &amp; Moritz</p>
          <p style={S.sideSub}>Admin · 03.09.2026</p>
        </div>
        <nav style={{ flex: 1, paddingTop: '0.5rem' }}>
          {NAV.map(n => (
            <div key={n.id} style={S.navItem(page === n.id)} onClick={() => { setPage(n.id); setSaveMsg(''); }}>
              <span style={{ fontSize: '0.95rem' }}>{n.icon}</span><span>{n.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button onClick={refreshData} disabled={loading} style={{ background: 'rgba(200,180,154,0.15)', border: '1px solid rgba(200,180,154,0.3)', color: loading ? 'rgba(249,245,238,0.3)' : 'rgba(249,245,238,0.7)', borderRadius: '5px', padding: '0.45rem 0.75rem', fontSize: '0.72rem', cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%', justifyContent: 'center' }}>
            <span style={{ display: 'inline-block', animation: loading ? 'spin 1s linear infinite' : 'none' }}>↻</span>
            {loading ? 'Lädt …' : 'Aktualisieren'}
          </button>
          <a href="/" target="_blank" style={{ fontSize: '0.72rem', color: 'rgba(249,245,238,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
            <span>↗</span> Webseite ansehen
          </a>
        </div>
      </aside>

      <main style={S.main}>

        {page === 'overview' && (
          <>
            <div style={{ marginBottom: '2rem' }}><h1 style={S.h1}>Übersicht</h1><p style={S.sub}>Stand: {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}</p></div>
            <div style={S.statGrid}>
              {[[rsvps.length,'Anmeldungen'],[totalGuests,'Gäste gesamt'],[activities.filter(a=>!a.required).length,'Opt-in Aktivitäten'],[Object.values(votes).reduce((s,v)=>s+v,0),'Herzchen']].map(([n,l],i) => (
                <div key={i} style={S.stat}><div style={S.statNum}>{n}</div><div style={S.statLbl}>{l}</div></div>
              ))}
            </div>
            <div style={S.card}>
              <h2 style={S.h2}>Aktivitäten-Auslastung</h2>
              {activities.filter(a => !a.required).map(a => {
                const count = activityCount(a.id); const cap = a.capacity || 0; const pct = cap ? Math.min(100, Math.round(count/cap*100)) : 0;
                return (
                  <div key={a.id} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.82rem' }}>
                      <span style={{ fontWeight: 500 }}>{a.icon} {a.title}</span>
                      <span style={{ color: '#9a8a7a' }}>{count}{cap ? ` / ${cap}` : ' Pers.'} · {votes[a.id]||0} ♡</span>
                    </div>
                    {cap > 0 && <div style={{ height: '6px', background: '#f0ebe3', borderRadius: '3px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: pct>=90?'#b05040':pct>=60?'#c8931a':'#7a5c3c', borderRadius: '3px' }}/></div>}
                  </div>
                );
              })}
            </div>
            <div style={S.card}>
              <h2 style={S.h2}>Neueste Anmeldungen</h2>
              {rsvps.slice(-5).reverse().map((r,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'0.5px solid #f0ebe3', fontSize:'0.84rem' }}>
                  <span style={{ fontWeight:500 }}>{r.name}</span>
                  <span style={{ color:'#9a8a7a' }}>{r.guests} Pers. · {r.createdAt ? new Date(r.createdAt).toLocaleDateString('de-DE') : '–'}</span>
                </div>
              ))}
              {rsvps.length === 0 && <p style={{ color:'#9a8a7a', fontSize:'0.84rem' }}>Noch keine Anmeldungen.</p>}
            </div>
          </>
        )}

        {page === 'rsvps' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem', marginBottom:'1.5rem' }}>
              <div><h1 style={S.h1}>Anmeldungen</h1><p style={S.sub}>{rsvps.length} Anmeldungen · {totalGuests} Gäste</p></div>
              <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
                {saveMsg && <span style={{ fontSize:'0.8rem', color: msgColor }}>{saveMsg}</span>}
                <input style={{ ...S.input, width:'200px' }} placeholder="Suchen …" value={filter} onChange={e => setFilter(e.target.value)} />
              </div>
            </div>
            {filteredRsvps.length === 0 && <p style={{ color:'#9a8a7a', fontSize:'0.84rem' }}>Keine Einträge gefunden.</p>}
            {filteredRsvps.map((r) => (
              <div key={r.id} style={{ ...S.card, padding:0, marginBottom:'0.75rem' }}>
                <div style={S.actRow}>
                  <div style={{ flex:1 }}>
                    <span style={{ fontWeight:600, fontSize:'0.9rem' }}>{r.name}</span>
                    <span style={{ fontSize:'0.78rem', color:'#9a8a7a', marginLeft:'0.75rem' }}>{r.guests} Pers.</span>
                    <span style={{ fontSize:'0.78rem', color:'#7a5c3c', marginLeft:'0.5rem' }}>{r.email}</span>
                  </div>
                  <div style={{ display:'flex', gap:'0.5rem' }}>
                    <button style={S.btnSm} onClick={() => editRsvp === r.id ? setEditRsvp(null) : startEditRsvp(r)}>{editRsvp === r.id ? 'Schließen' : 'Bearbeiten'}</button>
                    <button style={S.btnDanger} onClick={() => deleteRsvp(r.id, r.name)}>Löschen</button>
                  </div>
                </div>
                {editRsvp !== r.id && (
                  <div style={{ padding:'0.6rem 1rem 0.8rem', background:'#faf8f5' }}>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.25rem', marginBottom: r.message ? '0.4rem' : 0 }}>
                      {(r.activities||[]).length === 0 ? <span style={S.badge('gray')}>nur Hauptevents</span>
                        : (r.activities||[]).map(id => { const a = activities.find(x=>x.id===id); return <span key={id} style={S.badge('green')}>{a?.icon} {a?.title||id}</span>; })}
                    </div>
                    {r.message && <p style={{ fontSize:'0.78rem', color:'#6a5a4a', margin:0, fontStyle:'italic' }}>"{r.message}"</p>}
                  </div>
                )}
                {editRsvp === r.id && (
                  <div style={{ padding:'1rem 1.25rem 1.25rem', borderTop:'0.5px solid #e0d8cc', background:'#faf8f5' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                      <div><label style={S.label}>Name</label><input style={S.input} value={editRsvpData.name} onChange={e=>setEditRsvpData(d=>({...d,name:e.target.value}))}/></div>
                      <div><label style={S.label}>E-Mail</label><input style={S.input} value={editRsvpData.email} onChange={e=>setEditRsvpData(d=>({...d,email:e.target.value}))}/></div>
                      <div><label style={S.label}>Personen</label>
                        <select style={S.input} value={editRsvpData.guests} onChange={e=>setEditRsvpData(d=>({...d,guests:e.target.value}))}>
                          {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div><label style={S.label}>Nachricht</label><input style={S.input} value={editRsvpData.message} onChange={e=>setEditRsvpData(d=>({...d,message:e.target.value}))}/></div>
                    </div>
                    <div style={{ marginTop:'0.75rem' }}>
                      <label style={S.label}>Aktivitäten</label>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginTop:'0.4rem' }}>
                        {activities.filter(a=>!a.required).map(a => {
                          const sel = editRsvpData.activities?.includes(a.id);
                          return <button key={a.id} onClick={()=>setEditRsvpData(d=>({...d,activities:sel?d.activities.filter(x=>x!==a.id):[...(d.activities||[]),a.id]}))}
                            style={{ ...S.btnSm, background:sel?'#7a5c3c':'none', color:sel?'#fff':'#7a5c3c', border:sel?'none':'1px solid #c8b49a' }}>{a.icon} {a.title}</button>;
                        })}
                      </div>
                    </div>
                    <div style={{ marginTop:'1rem', display:'flex', gap:'0.5rem' }}>
                      <button style={S.btn} onClick={()=>saveRsvp(r.id)}>Speichern</button>
                      <button style={S.btnSm} onClick={()=>setEditRsvp(null)}>Abbrechen</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {rsvps.length > 0 && (
              <div style={{ marginTop:'0.5rem', textAlign:'right' }}>
                <button style={S.btnSm} onClick={()=>{
                  const csv=[['Name','E-Mail','Personen','Aktivitäten','Nachricht','Datum'],...rsvps.map(r=>[r.name,r.email,r.guests,(r.activities||[]).join('; '),r.message,r.createdAt?new Date(r.createdAt).toLocaleDateString('de-DE'):''])]
                    .map(row=>row.map(c=>`"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
                  const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='anmeldungen.csv';a.click();
                }}>⬇ CSV exportieren</button>
              </div>
            )}
          </>
        )}

        {page === 'byactivity' && (
          <>
            <div style={{ marginBottom:'1.5rem' }}><h1 style={S.h1}>Anmeldungen je Aktivität</h1><p style={S.sub}>Wer ist angemeldet, wie viele Personen, welche Anmerkungen</p></div>
            {activities.map(act => {
              const registered = activityRsvps(act.id); const total = activityCount(act.id);
              return (
                <div key={act.id} style={{ ...S.card, marginBottom:'1rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: registered.length > 0 ? '0.75rem' : 0 }}>
                    <div>
                      <span style={{ fontSize:'1.05rem', marginRight:'0.5rem' }}>{act.icon}</span>
                      <span style={{ fontWeight:600, fontSize:'0.95rem' }}>{act.title}</span>
                      <span style={{ fontSize:'0.75rem', color:'#9a8a7a', marginLeft:'0.6rem' }}>{act.day} · {act.time}</span>
                      {act.required && <span style={{ ...S.badge('amber'), marginLeft:'0.5rem' }}>Pflicht</span>}
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <span style={{ fontWeight:600, fontSize:'1.1rem', color:'#5c4130' }}>{total}</span>
                      <span style={{ fontSize:'0.75rem', color:'#9a8a7a' }}>{act.capacity ? ` / ${act.capacity}` : ''} Pers.</span>
                    </div>
                  </div>
                  {registered.length > 0 ? (
                    <table style={{ ...S.table, marginTop:'0.25rem' }}>
                      <thead><tr>{['Name','Pers.','E-Mail','Anmerkung'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {registered.map((r,i)=>(
                          <tr key={i}>
                            <td style={{ ...S.td, fontWeight:500 }}>{r.name}</td>
                            <td style={S.td}>{r.guests}</td>
                            <td style={{ ...S.td, color:'#7a5c3c', fontSize:'0.78rem' }}>{r.email}</td>
                            <td style={{ ...S.td, color:'#6a5a4a', fontSize:'0.78rem', fontStyle:r.message?'italic':'normal' }}>{r.message||'–'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p style={{ fontSize:'0.82rem', color:'#b0a090', margin:0 }}>Noch keine Anmeldungen.</p>}
                </div>
              );
            })}
          </>
        )}

        {page === 'activities' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
              <div><h1 style={S.h1}>Aktivitäten</h1><p style={S.sub}>Reihenfolge, Kapazitäten und Beschreibungen</p></div>
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                {saveMsg && <span style={{ fontSize:'0.8rem', color: msgColor }}>{saveMsg}</span>}
                <button style={S.btnSm} onClick={addActivity}>+ Neu</button>
                <button style={S.btn} onClick={()=>saveActivities(activities)}>Speichern</button>
              </div>
            </div>
            {activities.map((a,idx)=>(
              <div key={a.id} style={{ ...S.card, padding:0 }}>
                <div style={S.actRow}>
                  <span style={{ fontSize:'1.1rem', minWidth:'1.5rem' }}>{a.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{a.title}</div>
                    <div style={{ fontSize:'0.75rem', color:'#9a8a7a' }}>{a.day} · {a.time} · {a.capacity?`max. ${a.capacity} Pers.`:'unbegrenzt'}{a.required?' · Pflicht':''}</div>
                  </div>
                  <div style={{ display:'flex', gap:'0.5rem' }}>
                    <button style={S.btnSm} onClick={()=>setEditAct(editAct===idx?null:idx)}>{editAct===idx?'Schließen':'Bearbeiten'}</button>
                    {!a.required && <button style={S.btnDanger} onClick={()=>removeActivity(idx)}>Löschen</button>}
                  </div>
                </div>
                {editAct === idx && (
                  <div style={{ padding:'1rem 1.25rem 1.25rem', borderTop:'0.5px solid #e0d8cc', background:'#faf8f5' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                      <div><label style={S.label}>Titel</label><input style={S.input} value={a.title} onChange={e=>updateActivity(idx,'title',e.target.value)}/></div>
                      <div><label style={S.label}>Uhrzeit</label><input style={S.input} value={a.time} onChange={e=>updateActivity(idx,'time',e.target.value)}/></div>
                      <div><label style={S.label}>Tag</label><select style={S.input} value={a.day} onChange={e=>updateActivity(idx,'day',e.target.value)}>{DAYS.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
                      <div><label style={S.label}>Icon</label><select style={S.input} value={a.icon} onChange={e=>updateActivity(idx,'icon',e.target.value)}>{ICONS.map(ic=><option key={ic} value={ic}>{ic}</option>)}</select></div>
                      <div><label style={S.label}>Max. Teilnehmer (leer = unbegrenzt)</label><input style={S.input} type="number" min="1" value={a.capacity??''} onChange={e=>updateActivity(idx,'capacity',e.target.value)} placeholder="unbegrenzt"/></div>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', paddingTop:'1.5rem' }}>
                        <input type="checkbox" id={`req-${idx}`} checked={!!a.required} onChange={e=>updateActivity(idx,'required',e.target.checked)}/>
                        <label htmlFor={`req-${idx}`} style={{ fontSize:'0.82rem', color:'#6a5a4a', cursor:'pointer' }}>Pflichtveranstaltung</label>
                      </div>
                    </div>
                    <div><label style={S.label}>Beschreibung</label><textarea style={{ ...S.input, height:'72px', resize:'vertical' }} value={a.desc} onChange={e=>updateActivity(idx,'desc',e.target.value)}/></div>
                    <div style={{ marginTop:'0.75rem' }}><button style={S.btn} onClick={()=>saveActivities(activities)}>Speichern</button></div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {page === 'info' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
              <div><h1 style={S.h1}>Info-Texte</h1><p style={S.sub}>Texte für die Info-Seite der Webseite</p></div>
              <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
                {saveMsg && <span style={{ fontSize:'0.8rem', color: msgColor }}>{saveMsg}</span>}
                <button style={S.btn} onClick={()=>saveSettings(settings)}>Alle speichern</button>
              </div>
            </div>
            {INFO_FIELDS.map(({key, label})=>(
              <div key={key} style={S.card}>
                <label style={{ ...S.label, marginTop:0 }}>{label}</label>
                <textarea style={{ ...S.input, height:'90px', resize:'vertical', marginTop:'0.3rem' }}
                  value={settings[key]||''} onChange={e=>setSettings(s=>({...s,[key]:e.target.value}))}/>
              </div>
            ))}
          </>
        )}

        {page === 'settings' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
              <div><h1 style={S.h1}>Einstellungen</h1><p style={S.sub}>Stammdaten der Hochzeit</p></div>
              <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
                {saveMsg && <span style={{ fontSize:'0.8rem', color: msgColor }}>{saveMsg}</span>}
                <button style={S.btn} onClick={()=>saveSettings(settings)}>Speichern</button>
              </div>
            </div>
            <div style={S.card}>
              <h2 style={S.h2}>Hochzeits-Details</h2>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                {SETTING_FIELDS.map(({key,label,ph})=>(
                  <div key={key}>
                    <label style={{ ...S.label, marginTop:0 }}>{label}</label>
                    <input style={S.input} value={settings[key]||''} onChange={e=>setSettings(s=>({...s,[key]:e.target.value}))} placeholder={ph}/>
                  </div>
                ))}
              </div>
            </div>
            <div style={S.card}>
              <h2 style={S.h2}>Admin-Passwort</h2>
              <p style={{ fontSize:'0.84rem', color:'#6a5a4a', lineHeight:1.7, marginBottom:'0.75rem' }}>Das Passwort wird in Vercel gesetzt:</p>
              <code style={{ display:'block', background:'#f5f2ed', padding:'0.75rem 1rem', borderRadius:'6px', fontSize:'0.82rem', color:'#5c4130' }}>
                Vercel → Settings → Environment Variables → ADMIN_SECRET
              </code>
            </div>
            <div style={S.card}>
              <h2 style={S.h2}>Datenbank</h2>
              <p style={{ fontSize:'0.84rem', color:'#3b6d11' }}>✓ Supabase ist verbunden. Alle Daten werden dauerhaft gespeichert.</p>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
