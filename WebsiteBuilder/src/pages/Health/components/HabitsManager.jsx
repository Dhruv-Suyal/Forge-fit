import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import api from '../../../utils/axios';

// ── Habit Item ────────────────────────────────────────────────────────────────
function HabitItem({ habit, onRemove, color, icon }) {
  const [deleting, setDeleting] = useState(false);
  const ref = useRef(null);

  const handleRemove = () => {
    setDeleting(true);
    gsap.to(ref.current, {
      opacity: 0, scaleY: 0, maxHeight: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0,
      duration: 0.35, ease: 'power2.in',
      onComplete: () => onRemove(habit),
    });
  };

  return (
    <div
      ref={ref}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: 12, marginBottom: 8,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        transition: 'border-color 0.2s, background 0.2s',
        transformOrigin: 'top', overflow: 'hidden',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
    >
      {/* Color dot */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0,
      }} />
      <span style={{ flex: 1, fontFamily: 'var(--font-main)', fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>
        {habit}
      </span>
      <button
        className="hl-btn-danger"
        onClick={handleRemove}
        disabled={deleting}
        style={{ flexShrink: 0 }}
      >
        Remove
      </button>
    </div>
  );
}

// ── List Editor (build / quit) ────────────────────────────────────────────────
function ListEditor({ title, items, field, onUpdated, color, icon, emptyMsg }) {
  const [newItem, setNewItem] = useState('');
  const [adding,  setAdding]  = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: field === 'habitsToBuild' ? 0.4 : 0.6 }
    );
  }, [field]);

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    setAdding(true);
    try {
      await api.post('/health/habits', { field, action: 'add', habit: newItem.trim() });
      setNewItem('');
      onUpdated && onUpdated();
    } catch (err) {
      console.error('[habits/add]', err?.response?.data || err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (h) => {
    try {
      await api.post('/health/habits', { field, action: 'remove', habit: h });
      onUpdated && onUpdated();
    } catch (err) {
      console.error('[habits/remove]', err?.response?.data || err.message);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleAdd(); };

  return (
    <div ref={cardRef} className={`hl-glass ${field === 'habitsToBuild' ? 'hl-glass-emerald' : 'hl-glass-rose'}`}
      style={{ padding: 24, opacity: 0 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `linear-gradient(135deg, ${color}30, ${color}10)`,
          border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>{icon}</div>
        <div>
          <div className="hl-section-label" style={{ marginBottom: 0, color: color + 'aa' }}>HABITS TRACKER</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-main)' }}>{title}</div>
        </div>
        {/* Count badge */}
        <div style={{
          marginLeft: 'auto', minWidth: 28, height: 28, borderRadius: 8,
          background: `${color}15`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: color,
        }}>
          {items.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="hl-progress-bar" style={{ marginBottom: 18 }}>
        <div className="hl-progress-fill" style={{
          '--fill-width': `${Math.min(items.length * 20, 100)}%`,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
        }} />
      </div>

      {/* Items list */}
      <div style={{ minHeight: 60 }}>
        {items.length === 0
          ? <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-main)', fontSize: 13 }}>
              {emptyMsg}
            </div>
          : items.map((h, i) => (
              <HabitItem key={`${h}-${i}`} habit={h} onRemove={handleRemove} color={color} icon={icon} />
            ))
        }
      </div>

      {/* Add input */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          className="hl-input"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Add a habit…`}
          style={{ flex: 1 }}
        />
        <button
          className="hl-btn-primary"
          onClick={handleAdd}
          disabled={adding || !newItem.trim()}
          style={{ padding: '10px 18px', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {adding ? '…' : '+ Add'}
        </button>
      </div>
    </div>
  );
}

// ── Main HabitsManager ────────────────────────────────────────────────────────
export default function HabitsManager({ habitsToBuild = [], habitsToQuit = [], onUpdated }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
      <ListEditor
        title="Habits to Build"
        items={habitsToBuild}
        field="habitsToBuild"
        onUpdated={onUpdated}
        color="#10b981"
        icon="🌱"
        emptyMsg="No habits yet — start building!"
      />
      <ListEditor
        title="Habits to Quit"
        items={habitsToQuit}
        field="habitsToQuit"
        onUpdated={onUpdated}
        color="#f43f5e"
        icon="🚫"
        emptyMsg="Nothing to quit — you're clean!"
      />
    </div>
  );
}
