import { useState, useEffect } from 'react';

const DEFAULTS = {
  dateRange: '31.08.–06.09.2026',
  deadline: '01. Juli 2026',
  contactEmail: 'heiraten@leonie-und-moritz.de',
  venue: 'Château de Veullerot',
  location: 'Liernais, Bourgogne, France',
};

const S = {
  page:     { fontFamily: "'Cormorant Garamond', Georgia, serif", background: '#F9F5EE', minHeight: '100vh', color: '#3a3228' },
  nav:      { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', borderBottom: '0.5px solid #d4c4b0', padding: '1.25rem 1rem 0', background: '#F9F5EE', position: 'sticky', top: 0, zIndex: 20 },
  navBtn:   (a) => ({ background: 'none', border: 'none', borderBottom: a ? '2px solid #9a7b5c' : '2px solid transparent', color: a ? '#5c4130' : '#9a8a7a', padding: '0.5rem 1.1rem 0.65rem', cursor: 'pointer', fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'inherit', marginBottom: '-0.5px' }),
  hero:     { textAlign: 'center', padding: 'clamp(1.5rem,4vw,2.5rem) 1.5rem 1rem' },
  script:   { fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(2.2rem,7vw,4rem)', color: '#5c4130', lineHeight: 1.1, margin: '0.25rem 0 0.5rem', fontWeight: 400 },
  eyebrow:  { fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a8a7a', margin: 0 },
  divider:  { width: '50px', height: '1px', background: '#c8b49a', margin: '1.25rem auto' },
  section:  { maxWidth: '640px', margin: '0 auto', padding: '0 1.25rem 4rem' },
  card:     { background: 'rgba(255,255,255,0.55)', border: '0.5px solid #d4c4b0', borderRadius: '3px', padding: '1.25rem 1.5rem', marginBottom: '1rem' },
  h2:       { fontFamily: 'inherit', fontSize: '1.6rem', fontWeight: 400, color: '#5c4130', letterSpacing: '0.06em', margin: '0 0 0.5rem' },
  h3:       { fontFamily: 'inherit', fontSize: '1rem', fontWeight: 500, color: '#7a5c3c', letterSpacing: '0.06em', margin: '0 0 0.9rem', borderBottom: '0.5px solid #d4c4b0', paddingBottom: '0.5rem' },
  btn:      { background: '#7a5c3c', color: '#f9f5ee', border: 'none', padding: '0.7rem 2.25rem', fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '2px' },
  btnGhost: { background: 'none', color: '#7a5c3c', border: '1px solid #c8b49a', padding: '0.6rem 2rem', fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '2px' },
  input:    { width: '100%', padding: '0.6rem 0.85rem', border: '0.5px solid #c8b49a', borderRadius: '2px', background: 'rgba(255,255,255,0.7)', color: '#3a3228', fontFamily: 'inherit', fontSize: '0.95rem', boxSizing: 'border-box', marginBottom: '0.75rem' },
  label:    { fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a8a7a', display: 'block', marginBottom: '0.3rem' },
  dayLabel: { fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a8a7a', margin: '1.25rem 0 0.6rem', paddingBottom: '0.35rem', borderBottom: '0.5px solid #d4c4b0' },
  actCard:  (sel, full) => ({ background: sel ? 'rgba(154,123,92,0.07)' : 'rgba(255,255,255,0.45)', border: sel ? '1px solid #9a7b5c' : '0.5px solid #d4c4b0', borderRadius: '3px', padding: '0.85rem 1.1rem', cursor: full ? 'not-allowed' : 'pointer', opacity: full ? 0.5 : 1, marginBottom: '0.6rem', transition: 'all 0.15s' }),
};

export default function Home() {
  const [page, setPage] = useState('home');
  const [activities, setActivities] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [votes, setVotes] = useState({});
  const [settings, setSettings] = useState(DEFAULTS);
  const [form, setForm] = useState({ name: '', email: '', guests: '1', message: '', activities: [] });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [votedFor, setVotedFor] = useState({});
  const [loadingActs, setLoadingActs] = useState(true);

  useEffect(() => {
    fetch('/api/activities').then(r => r.json()).then(d => { setActivities(d.activities || []); setLoadingActs(false); }).catch(() => setLoadingActs(false));
    fetch('/api/votes').then(r => r.json()).then(d => setVotes(d.votes || {})).catch(() => {});
    fetch('/api/rsvp').then(r => r.json()).then(d => setRsvps(d.rsvps || [])).catch(() => {});
    fetch('/api/settings').then(r => r.json()).then(d => { if (d.settings) setSettings(s => ({ ...s, ...d.settings })); }).catch(() => {});
  }, []);

  const groupedActivities = activities.reduce((acc, a) => {
    if (!acc[a.day]) acc[a.day] = [];
    acc[a.day].push(a);
    return acc;
  }, {});

  const totalRegistered = (id) => {
    const list = Array.isArray(rsvps) ? rsvps : Object.values(rsvps);
    return list.filter(r => r.activities?.includes(id)).reduce((s, r) => s + (parseInt(r.guests) || 1), 0);
  };

  const handleActivityToggle = (id) =>
    setForm(f => ({ ...f, activities: f.activities.includes(id) ? f.activities.filter(a => a !== id) : [...f.activities, id] }));

  const handleVote = async (actId) => {
    if (votedFor[actId]) return;
    setVotedFor(v => ({ ...v, [actId]: true }));
    try {
      const res = await fetch('/api/votes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activityId: actId }) });
      const data = await res.json();
      setVotes(data.votes || {});
    } catch {}
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) { setSaveStatus('Bitte Name und E-Mail angeben.'); return; }
    setSubmitting(true); setSaveStatus('');
    try {
      const res = await fetch('/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) {
        setRsvps(r => [...(Array.isArray(r) ? r : []), { guests: parseInt(form.guests), activities: form.activities }]);
        setSubmitted(true);
      } else { setSaveStatus(data.error || 'Etwas ist schiefgelaufen.'); }
    } catch { setSaveStatus('Verbindungsfehler.'); }
    setSubmitting(false);
  };

  const CoupleImg = () => (
    <img src="/couple.png" alt="Leonie & Moritz" style={{ height: '54px', width: 'auto', opacity: 0.92, display: 'block' }} />
  );

  return (
    <div style={S.page}>
      {/* HEADER with couple image */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem 0', maxWidth: '900px', margin: '0 auto' }}>
        <CoupleImg />
        <div style={{ textAlign: 'right' }}>
          <p style={{ ...S.eyebrow, fontSize: '0.6rem' }}>{settings.dateRange}</p>
          <p style={{ ...S.eyebrow, fontSize: '0.6rem', marginTop: '0.15rem' }}>{settings.venue}</p>
        </div>
      </div>

      <nav style={S.nav}>
        {[['home','Willkommen'],['info','Infos'],['activities','Programm'],['rsvp','Anmeldung']].map(([p,l]) => (
          <button key={p} style={S.navBtn(page===p)} onClick={() => setPage(p)}>{l}</button>
        ))}
      </nav>

      {/* ─── HOME ─── */}
      {page === 'home' && (
        <div>
          <div style={S.hero}>
            <p style={S.eyebrow}>Wir heiraten</p>
            <h1 style={S.script}>Leonie &amp; Moritz</h1>
            <div style={S.divider} />
            <p style={{ ...S.eyebrow, marginBottom: '0.3rem' }}>{settings.dateRange}</p>
            <p style={{ fontStyle: 'italic', color: '#9a8a7a', fontSize: '0.9rem', margin: 0 }}>{settings.venue} · {settings.location}</p>
          </div>
          <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 1.25rem 1rem' }}>
            {/* Château watercolor image */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <img
                src="/chateau.png"
                alt="Château de Veullerot"
                style={{ width: '100%', maxWidth: '480px', height: 'auto', display: 'block', margin: '0 auto' }}
              />
              <p style={{ fontSize: '0.72rem', color: '#b0a090', marginTop: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{settings.venue} · {settings.location}</p>
            </div>

            <div style={{ ...S.card, textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{ fontStyle: 'italic', lineHeight: 1.85, fontSize: '1rem', color: '#5c4130', margin: 0 }}>
                Wir freuen uns von Herzen, eine ganze Woche mit euch feiern zu dürfen — im Herzen des Burgunds, umgeben von Weinbergen und dem Zauber eines alten Château.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {[['📅', settings.dateRange,''],['📍','Liernais','Bourgogne, France'],['🏰', settings.venue,''],['✉️','Anmeldung bis', settings.deadline]].map(([ico,l1,l2],i) => (
                <div key={i} style={{ ...S.card, textAlign: 'center', padding: '1rem', margin: 0 }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>{ico}</div>
                  <p style={{ fontWeight: 500, fontSize: '0.85rem', color: '#5c4130', margin: '0 0 0.1rem' }}>{l1}</p>
                  {l2 && <p style={{ fontSize: '0.75rem', color: '#9a8a7a', margin: 0 }}>{l2}</p>}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button style={S.btn} onClick={() => setPage('rsvp')}>Jetzt anmelden</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── INFO ─── */}
      {page === 'info' && (
        <div style={S.section}>
          <div style={{ textAlign: 'center', padding: '2rem 0 1.5rem' }}>
            <h2 style={S.h2}>Alle Infos</h2>
            <div style={S.divider} />
          </div>
          {[
            { title: 'Anreise & Unterkunft', items: [
              ['🚆','Zug','TGV von Paris Gare de Lyon nach Dijon (1h35), dann Mietwagen oder Shuttle (~50 Min.) nach Liernais.'],
              ['✈️','Flug','Nächste Flughäfen: Lyon (LYS) oder Paris CDG. Wir organisieren Shuttles ab Dijon Bahnhof.'],
              ['🏠','Unterkunft','Das Château bietet Zimmer für ~60 Gäste. Bitte bei der Anmeldung angeben, ob ihr vor Ort schlafen möchtet.'],
            ]},
            { title: 'Dresscode', items: [
              ['👗','Trauung & Dinner','Festlich – Abendkleid oder festlicher Anzug.'],
              ['🌿','Tagsüber','Smart Casual – bequem und sommerlich, aber gepflegt.'],
              ['👟','Outdoor-Events','Sportliche Kleidung und festes Schuhwerk empfohlen.'],
            ]},
            { title: 'Praktisches', items: [
              ['🌡️','Wetter','Anfang September in Burgund: 22–28 °C tagsüber, kühle Abende. Leichte Jacke empfohlen.'],
              ['💰','Kosten','Alle Mahlzeiten und organisierten Aktivitäten sind für euch als Gäste kostenfrei.'],
              ['🎁','Wunschliste','Auf Reisen statt Geschenke – unsere Erlebnis-Wunschliste auf Anfrage.'],
            ]},
            { title: 'Kontakt', items: [
              ['📧','E-Mail', settings.contactEmail],
              ['📱','WhatsApp','Link zur Gästegruppe folgt mit der Bestätigungs-E-Mail.'],
              ['❓','Fragen','Wir freuen uns über jede Nachricht!'],
            ]},
          ].map((sec, si) => (
            <div key={si} style={{ ...S.card, marginBottom: '1rem' }}>
              <h3 style={S.h3}>{sec.title}</h3>
              {sec.items.map(([ico,lbl,txt], i) => (
                <div key={i} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.55rem', alignItems: 'flex-start' }}>
                  <span style={{ minWidth: '1.4rem', fontSize: '0.9rem', paddingTop: '0.05rem' }}>{ico}</span>
                  <div><span style={{ fontWeight: 500, fontSize: '0.83rem', color: '#5c4130' }}>{lbl}:</span>{' '}<span style={{ fontSize: '0.88rem', color: '#6a5a4a', lineHeight: 1.6 }}>{txt}</span></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ─── ACTIVITIES ─── */}
      {page === 'activities' && (
        <div style={S.section}>
          <div style={{ textAlign: 'center', padding: '2rem 0 1.5rem' }}>
            <h2 style={S.h2}>Wochenprogramm</h2>
            <div style={S.divider} />
            <p style={{ fontStyle: 'italic', color: '#9a8a7a', fontSize: '0.88rem', margin: '0 0 0.25rem' }}>{settings.dateRange} · {settings.venue}</p>
            <p style={{ fontSize: '0.75rem', color: '#b0a090' }}>Zeigt eure Begeisterung mit einem ♡</p>
          </div>
          {loadingActs ? (
            <p style={{ textAlign: 'center', color: '#9a8a7a', fontStyle: 'italic' }}>Lädt …</p>
          ) : (
            Object.entries(groupedActivities).map(([day, acts]) => (
              <div key={day}>
                <p style={S.dayLabel}>{day}</p>
                {acts.map(act => {
                  const reg = totalRegistered(act.id);
                  const full = act.capacity && reg >= act.capacity;
                  const vc = votes[act.id] || 0;
                  const voted = votedFor[act.id];
                  return (
                    <div key={act.id} style={{ ...S.card, marginBottom: '0.65rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1.05rem' }}>{act.icon}</span>
                          <span style={{ fontWeight: 500, fontSize: '0.95rem', color: '#5c4130' }}>{act.title}</span>
                          <span style={{ fontSize: '0.72rem', color: '#9a8a7a', marginLeft: 'auto' }}>{act.time}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#6a5a4a', margin: '0 0 0.5rem', lineHeight: 1.65 }}>{act.desc}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          {act.capacity && <span style={{ fontSize: '0.68rem', color: full ? '#b05040' : '#9a7b5c', letterSpacing: '0.06em' }}>{full ? 'Ausgebucht' : `${reg} / ${act.capacity} Plätze`}</span>}
                          <button onClick={() => handleVote(act.id)} style={{ background: 'none', border: 'none', cursor: voted ? 'default' : 'pointer', fontSize: '0.82rem', color: voted ? '#9a7b5c' : '#c8a888', padding: 0, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            {voted ? '♥' : '♡'}{vc > 0 && <span style={{ fontSize: '0.75rem' }}>{vc}</span>}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── RSVP ─── */}
      {page === 'rsvp' && (
        <div style={S.section}>
          <div style={{ textAlign: 'center', padding: '2rem 0 1.5rem' }}>
            <h2 style={S.h2}>Anmeldung</h2>
            <div style={S.divider} />
            <p style={{ fontStyle: 'italic', color: '#9a8a7a', fontSize: '0.88rem', margin: 0 }}>Bitte bis zum {settings.deadline} anmelden</p>
          </div>

          {submitted ? (
            <div style={{ ...S.card, textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🌸</div>
              <h3 style={{ fontFamily: 'inherit', fontSize: '1.35rem', color: '#5c4130', fontWeight: 400, margin: '0 0 0.75rem', borderBottom: 'none', paddingBottom: 0 }}>
                Herzlichen Dank, {form.name.split(' ')[0]}!
              </h3>
              <p style={{ color: '#6a5a4a', lineHeight: 1.8, margin: '0 0 1rem', fontSize: '0.95rem' }}>
                Eure Anmeldung ist bei uns eingegangen. Wir freuen uns riesig, dass ihr dabei seid!
              </p>
              {form.activities.length > 0 && (
                <p style={{ fontSize: '0.78rem', color: '#9a8a7a', marginBottom: '1.5rem' }}>
                  Gewählte Aktivitäten: {form.activities.map(id => activities.find(a => a.id === id)?.title).filter(Boolean).join(', ')}
                </p>
              )}
              <button style={S.btnGhost} onClick={() => { setSubmitted(false); setSaveStatus(''); setForm({ name: '', email: '', guests: '1', message: '', activities: [] }); }}>
                Neue Anmeldung
              </button>
            </div>
          ) : (
            <div style={S.card}>
              <label style={S.label}>Euer Name(n) *</label>
              <input style={S.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="z. B. Anna & Peter Müller" />
              <label style={S.label}>E-Mail-Adresse *</label>
              <input style={S.input} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="eure@email.de" />
              <label style={S.label}>Anzahl Personen</label>
              <select style={S.input} value={form.guests} onChange={e => setForm(f => ({ ...f, guests: e.target.value }))}>
                {[1,2,3,4].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'Personen'}</option>)}
              </select>

              <div style={{ width: '50px', height: '1px', background: '#c8b49a', margin: '1rem 0' }} />
              <p style={{ ...S.label, marginBottom: '0.5rem' }}>Aktivitäten (Auswahl)</p>
              <p style={{ fontSize: '0.78rem', color: '#9a8a7a', marginBottom: '0.85rem' }}>Trauung &amp; Festdinner sind für alle Gäste inklusive. Wählt weitere Programmpunkte:</p>

              {loadingActs ? (
                <p style={{ color: '#9a8a7a', fontSize: '0.84rem', fontStyle: 'italic' }}>Lädt …</p>
              ) : (
                Object.entries(groupedActivities).map(([day, acts]) => (
                  <div key={day}>
                    <p style={{ ...S.dayLabel, marginTop: '1rem' }}>{day}</p>
                    {acts.filter(a => !a.required).map(act => {
                      const reg = totalRegistered(act.id);
                      const full = act.capacity && reg >= act.capacity && !form.activities.includes(act.id);
                      const sel = form.activities.includes(act.id);
                      return (
                        <div key={act.id} style={S.actCard(sel, full)} onClick={() => !full && handleActivityToggle(act.id)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{ width: '18px', height: '18px', borderRadius: '2px', border: sel ? 'none' : '1px solid #c8b49a', background: sel ? '#7a5c3c' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px', color: '#f9f5ee' }}>{sel && '✓'}</div>
                            <span style={{ fontSize: '0.95rem' }}>{act.icon}</span>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontWeight: 500, fontSize: '0.85rem', color: '#5c4130' }}>{act.title}</span>
                              <span style={{ fontSize: '0.72rem', color: '#9a8a7a', marginLeft: '0.4rem' }}>{act.time}</span>
                              {act.capacity && <span style={{ fontSize: '0.68rem', color: full ? '#b05040' : '#9a7b5c', marginLeft: '0.4rem' }}>({full ? 'ausgebucht' : `${reg}/${act.capacity}`})</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}

              <div style={{ width: '50px', height: '1px', background: '#c8b49a', margin: '1rem 0' }} />
              <label style={S.label}>Nachricht / Besondere Wünsche</label>
              <textarea style={{ ...S.input, height: '88px', resize: 'vertical' }} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Allergien, Zimmerwunsch, Anmerkungen …" />

              {saveStatus && <p style={{ fontSize: '0.8rem', color: '#b05040', marginBottom: '0.5rem' }}>{saveStatus}</p>}
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <button style={{ ...S.btn, opacity: submitting ? 0.6 : 1 }} onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Wird gesendet …' : 'Anmeldung absenden'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ borderTop: '0.5px solid #d4c4b0', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '900px', margin: '0 auto', flexWrap: 'wrap', gap: '1rem' }}>
        <img src="/couple.png" alt="Leonie & Moritz" style={{ height: '48px', width: 'auto', opacity: 0.85 }} />
        <p style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a8a7a', margin: 0, textAlign: 'center', flex: 1 }}>
          Leonie &amp; Moritz · {settings.dateRange} · {settings.venue}
        </p>
        <img src="/couple.png" alt="" aria-hidden="true" style={{ height: '48px', width: 'auto', opacity: 0.85, transform: 'scaleX(-1)' }} />
      </footer>
    </div>
  );
}
