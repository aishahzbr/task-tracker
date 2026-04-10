import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const STATUSES   = ['To Do', 'In Progress', 'Done', 'Blocked']
const PRIORITIES = ['High', 'Medium', 'Low']

const S = {
  'To Do':       { color: '#EF4444', light: '#FEE2E2', text: '#991B1B' },
  'In Progress': { color: '#F59E0B', light: '#FEF9C3', text: '#854D0E' },
  'Done':        { color: '#22C55E', light: '#DCFCE7', text: '#166534' },
  'Blocked':     { color: '#A855F7', light: '#F3E8FF', text: '#6B21A8' },
}
const P = {
  High:   { color: '#EF4444', light: '#FEE2E2', text: '#991B1B' },
  Medium: { color: '#F59E0B', light: '#FEF9C3', text: '#854D0E' },
  Low:    { color: '#22C55E', light: '#DCFCE7', text: '#166534' },
}

const fmt = iso => {
  if (!iso) return 'Set date'
  const [y, m, d] = iso.split('-')
  return `${parseInt(d)} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m)-1]} ${y}`
}
const avatarBg = n => ['#6366F1','#EC4899','#14B8A6','#F59E0B','#8B5CF6','#EF4444'][n.charCodeAt(0) % 6]
const useIsMobile = () => {
  const [mobile, setMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

/* ── Segmented toggle ─────────────────────────────────────────────────────── */
function SegToggle({ options, value, config, onChange }) {
  const idx = options.indexOf(value)
  const cfg = config[value]
  return (
    <div onClick={() => onChange(options[(idx + 1) % options.length])}
      style={{ display:'flex', alignItems:'center', height:30, borderRadius:99, background:'#F1F5F9', padding:3, gap:2, cursor:'pointer', userSelect:'none', boxShadow:'inset 0 1px 3px rgba(0,0,0,0.10)', overflow:'hidden', width:'100%' }}>
      {options.map((opt, i) => {
        const active = i === idx, c = config[opt]
        return (
          <div key={opt} style={{ height:24, borderRadius:99, background:active?c.color:'transparent', boxShadow:active?`0 1px 6px ${c.color}50`:'none', transition:'all 0.32s cubic-bezier(0.34,1.4,0.64,1)', display:'flex', alignItems:'center', justifyContent:'center', gap:active?5:0, flex:active?'1 1 auto':'0 0 18px', overflow:'hidden', padding:active?'0 10px':0 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:active?'rgba(255,255,255,0.85)':c.color, flexShrink:0 }} />
            <span style={{ fontSize:11, fontWeight:700, color:'#fff', whiteSpace:'nowrap', opacity:active?1:0, maxWidth:active?120:0, overflow:'hidden', transition:'opacity 0.22s, max-width 0.32s cubic-bezier(0.34,1.4,0.64,1)' }}>{opt}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── iOS switch ───────────────────────────────────────────────────────────── */
function IOSSwitch({ on, onChange }) {
  return (
    <div onClick={onChange} style={{ width:42, height:24, borderRadius:99, background:on?'#22C55E':'#CBD5E1', position:'relative', cursor:'pointer', flexShrink:0, transition:'background 0.22s', boxShadow:on?'0 0 0 3px #22C55E28':'none' }}>
      <div style={{ position:'absolute', top:2, left:on?20:2, width:20, height:20, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.2)', transition:'left 0.22s cubic-bezier(0.34,1.5,0.64,1)' }} />
    </div>
  )
}

/* ── Progress bar ─────────────────────────────────────────────────────────── */
function ProgBar({ value, onChange }) {
  const color = value===100?'#22C55E':value>=50?'#F59E0B':value>0?'#6366F1':'#E2E8F0'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
      <div style={{ flex:1, position:'relative', height:16, display:'flex', alignItems:'center' }}>
        <div style={{ width:'100%', height:5, borderRadius:99, background:'#E2E8F0', overflow:'hidden' }}>
          <div style={{ width:`${value}%`, height:'100%', background:color, borderRadius:99, transition:'width 0.2s, background 0.3s' }} />
        </div>
        <input type="range" min={0} max={100} step={10} value={value} onChange={e=>onChange(+e.target.value)}
          style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%', margin:0 }} />
      </div>
      <span style={{ fontSize:10, fontWeight:700, color:'#94A3B8', minWidth:26, textAlign:'right', fontFamily:'monospace' }}>{value}%</span>
    </div>
  )
}

/* ── Inline text edit ─────────────────────────────────────────────────────── */
function EditableText({ value, onChange, style = {} }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  const ref = useRef()
  useEffect(() => setVal(value), [value])
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])
  const commit = () => { setEditing(false); val.trim() ? onChange(val.trim()) : setVal(value) }
  if (editing) return (
    <input ref={ref} value={val} onChange={e=>setVal(e.target.value)} onBlur={commit}
      onKeyDown={e=>{ if(e.key==='Enter') commit(); if(e.key==='Escape'){setVal(value);setEditing(false)} }}
      style={{ fontSize:13, fontWeight:600, border:'none', borderBottom:'2px solid #6366F1', outline:'none', background:'transparent', width:'100%', padding:'1px 0', fontFamily:'inherit', ...style }} />
  )
  return (
    <span onClick={()=>setEditing(true)} title="Click to edit"
      style={{ cursor:'text', borderBottom:'1.5px dashed transparent', display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', transition:'border-color 0.15s', ...style }}
      onMouseEnter={e=>e.currentTarget.style.borderBottomColor='#CBD5E1'}
      onMouseLeave={e=>e.currentTarget.style.borderBottomColor='transparent'}
    >{value}</span>
  )
}

/* ── Date cell ────────────────────────────────────────────────────────────── */
function DateCell({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef()
  const isOverdue = value && new Date(value + 'T00:00:00') < new Date()
  useEffect(() => {
    if (!editing) return
    const el = inputRef.current
    if (!el) return
    el.focus()
    try { el.showPicker() } catch { el.click() }
  }, [editing])
  return (
    <div style={{ position:'relative', height:26, display:'flex', alignItems:'center' }}>
      <span onClick={()=>setEditing(true)} title="Click to pick date"
        style={{ fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', color:isOverdue?'#EF4444':value?'#4F46E5':'#94A3B8', borderBottom:'1.5px dashed #C7D2FE', display:editing?'none':'inline', userSelect:'none' }}
        onMouseEnter={e=>e.currentTarget.style.borderBottomColor='#6366F1'}
        onMouseLeave={e=>e.currentTarget.style.borderBottomColor='#C7D2FE'}
      >📅 {fmt(value)}</span>
      <input ref={inputRef} type="date" defaultValue={value||''}
        onChange={e=>{ onChange(e.target.value); setEditing(false) }}
        onBlur={()=>setEditing(false)}
        style={{ display:editing?'block':'none', fontSize:11, fontWeight:600, color:'#4F46E5', border:'none', borderBottom:'2px solid #6366F1', outline:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit', width:'100%', padding:'1px 0' }}
      />
    </div>
  )
}

/* ── Assignee cell ────────────────────────────────────────────────────────── */
function AssigneeCell({ value, assignees, onChange, onManage }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useEffect(() => {
    if (!open) return
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  return (
    <div ref={ref} style={{ position:'relative' }}>
      <div onClick={()=>setOpen(o=>!o)} style={{ display:'flex', alignItems:'center', gap:5, cursor:'pointer', borderRadius:6, padding:'2px 5px', transition:'background 0.15s' }}
        onMouseEnter={e=>e.currentTarget.style.background='#F1F5F9'}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
        <div style={{ width:24, height:24, borderRadius:'50%', background:avatarBg(value), display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#fff', flexShrink:0 }}>{value[0].toUpperCase()}</div>
        <span style={{ fontSize:11, color:'#64748B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:65 }}>{value}</span>
        <span style={{ fontSize:9, color:'#CBD5E1' }}>▾</span>
      </div>
      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, background:'#fff', borderRadius:10, boxShadow:'0 8px 28px rgba(0,0,0,0.14)', border:'1px solid #E2E8F0', zIndex:50, minWidth:160, overflow:'hidden' }}>
          {assignees.map(a => (
            <div key={a} onClick={()=>{ onChange(a); setOpen(false) }}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', cursor:'pointer', background:a===value?'#F0F4FF':'transparent', transition:'background 0.12s' }}
              onMouseEnter={e=>{ if(a!==value) e.currentTarget.style.background='#F8FAFC' }}
              onMouseLeave={e=>{ if(a!==value) e.currentTarget.style.background='transparent' }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background:avatarBg(a), display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:'#fff', flexShrink:0 }}>{a[0].toUpperCase()}</div>
              <span style={{ fontSize:12, fontWeight:a===value?700:500, color:a===value?'#4F46E5':'#1E293B', flex:1 }}>{a}</span>
              {a===value && <span style={{ fontSize:11, color:'#6366F1' }}>✓</span>}
            </div>
          ))}
          <div style={{ borderTop:'1px solid #F1F5F9' }}>
            <div onClick={()=>{ setOpen(false); onManage() }}
              style={{ padding:'8px 12px', fontSize:11, fontWeight:600, color:'#6366F1', cursor:'pointer' }}
              onMouseEnter={e=>e.currentTarget.style.background='#F0F4FF'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              ⚙️ Manage people…
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Mobile task card ─────────────────────────────────────────────────────── */
function TaskCard({ task, assignees, onUpd, onDel, onManage }) {
  const isDone = task.status === 'Done'
  const sc = S[task.status], pc = P[task.priority]
  return (
    <div style={{ background:isDone?'#F0FDF4':'#fff', borderRadius:14, padding:'14px 16px', boxShadow:'0 2px 12px rgba(0,0,0,0.07)', border:'1px solid #E2E8F0', display:'flex', flexDirection:'column', gap:10 }}>
      {/* Top row: name + delete */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
        <EditableText value={task.name} onChange={v=>onUpd({name:v})}
          style={{ fontSize:14, fontWeight:700, color:isDone?'#94A3B8':'#1E293B', textDecoration:isDone?'line-through':'none', flex:1 }} />
        <button onClick={onDel} style={{ width:24, height:24, borderRadius:'50%', border:'none', background:'#FEE2E2', color:'#EF4444', cursor:'pointer', fontSize:14, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>×</button>
      </div>

      {/* Status + Priority toggles */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <div>
          <p style={{ fontSize:9, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Status</p>
          <SegToggle options={STATUSES} value={task.status} config={S} onChange={s=>onUpd({status:s, pct:s==='Done'?100:s==='To Do'?0:task.pct})} />
        </div>
        <div>
          <p style={{ fontSize:9, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Priority</p>
          <SegToggle options={PRIORITIES} value={task.priority} config={P} onChange={p=>onUpd({priority:p})} />
        </div>
      </div>

      {/* Progress */}
      <div>
        <p style={{ fontSize:9, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Progress</p>
        <ProgBar value={task.pct} onChange={v=>onUpd({pct:v, status:v===100?'Done':v===0?'To Do':'In Progress'})} />
      </div>

      {/* Bottom: assignee + date + done switch */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <AssigneeCell value={task.who} assignees={assignees} onChange={w=>onUpd({who:w})} onManage={onManage} />
        <DateCell value={task.due} onChange={v=>onUpd({due:v})} />
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:10, color:'#94A3B8', fontWeight:600 }}>Done</span>
          <IOSSwitch on={isDone} onChange={()=>onUpd({status:isDone?'To Do':'Done', pct:isDone?0:100})} />
        </div>
      </div>
    </div>
  )
}

/* ── Manage assignees modal ───────────────────────────────────────────────── */
function ManageModal({ assignees, onSave, onClose }) {
  const [list, setList] = useState([...assignees])
  const [name, setName] = useState('')
  const ref = useRef()
  const add = () => { const n=name.trim(); if(n&&!list.includes(n)){setList(l=>[...l,n]);setName('');ref.current?.focus()} }
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:20, padding:'28px', width:'100%', maxWidth:380, boxShadow:'0 24px 64px rgba(0,0,0,0.28)' }}>
        <h2 style={{ fontSize:17, fontWeight:800, color:'#1E293B', marginBottom:6 }}>👥 Manage People</h2>
        <p style={{ fontSize:11, color:'#94A3B8', marginBottom:20 }}>Add or remove assignees</p>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16, maxHeight:200, overflowY:'auto' }}>
          {list.map(n => (
            <div key={n} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'#F8FAFC', borderRadius:10, border:'1px solid #E2E8F0' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:avatarBg(n), display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#fff', flexShrink:0 }}>{n[0].toUpperCase()}</div>
              <span style={{ flex:1, fontSize:13, fontWeight:600, color:'#1E293B' }}>{n}</span>
              {list.length > 1 && <button onClick={()=>setList(l=>l.filter(x=>x!==n))} style={{ width:22, height:22, borderRadius:'50%', border:'none', background:'#FEE2E2', color:'#EF4444', cursor:'pointer', fontSize:13, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>}
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          <input ref={ref} value={name} onChange={e=>setName(e.target.value)} placeholder="Add a name…"
            onKeyDown={e=>e.key==='Enter'&&add()}
            style={{ flex:1, padding:'8px 12px', borderRadius:9, border:'1.5px solid #E2E8F0', fontSize:13, color:'#1E293B', outline:'none', background:'#F8FAFC', fontFamily:'inherit' }} />
          <button onClick={add} style={{ padding:'8px 14px', borderRadius:9, border:'none', background:name.trim()&&!list.includes(name.trim())?'#4F46E5':'#E2E8F0', color:name.trim()&&!list.includes(name.trim())?'#fff':'#94A3B8', fontSize:13, fontWeight:700, cursor:'pointer' }}>Add</button>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'8px 18px', borderRadius:99, border:'1.5px solid #E2E8F0', background:'#fff', fontSize:13, fontWeight:600, color:'#64748B', cursor:'pointer' }}>Cancel</button>
          <button onClick={()=>{ onSave(list); onClose() }} style={{ padding:'8px 22px', borderRadius:99, border:'none', background:'#4F46E5', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>Save</button>
        </div>
      </div>
    </div>
  )
}

/* ── Add task modal ───────────────────────────────────────────────────────── */
const lbl = { display:'block', fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }
const inp = { width:'100%', padding:'9px 12px', borderRadius:9, border:'1.5px solid #E2E8F0', fontSize:13, color:'#1E293B', outline:'none', background:'#F8FAFC', fontFamily:'inherit' }

function AddModal({ onAdd, onClose, assignees }) {
  const [form, setForm] = useState({ name:'', who:'Aishah', priority:'Medium', status:'To Do', pct:0, due:'' })
  const f = k => v => setForm(x=>({...x,[k]:v}))
  const valid = form.name.trim().length > 0
  const submit = () => { if(valid){ onAdd(form); onClose() } }
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:20, padding:'28px', width:'100%', maxWidth:440, boxShadow:'0 24px 64px rgba(0,0,0,0.28)', maxHeight:'90vh', overflowY:'auto' }}>
        <h2 style={{ fontSize:17, fontWeight:800, color:'#1E293B', marginBottom:20 }}>➕ New Task</h2>
        <label style={lbl}>Task name *</label>
        <input value={form.name} onChange={e=>f('name')(e.target.value)} placeholder="What needs to be done?" autoFocus
          style={{...inp, marginBottom:12}} onKeyDown={e=>e.key==='Enter'&&submit()} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          <div><label style={lbl}>Assignee</label>
            <select value={form.who} onChange={e=>f('who')(e.target.value)} style={inp}>
              {assignees.map(a=><option key={a}>{a}</option>)}
            </select></div>
          <div><label style={lbl}>Due date</label>
            <input type="date" value={form.due} onChange={e=>f('due')(e.target.value)} style={inp} /></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:22 }}>
          <div><label style={lbl}>Priority</label>
            <select value={form.priority} onChange={e=>f('priority')(e.target.value)} style={inp}>
              {PRIORITIES.map(p=><option key={p}>{p}</option>)}
            </select></div>
          <div><label style={lbl}>Status</label>
            <select value={form.status} onChange={e=>f('status')(e.target.value)} style={inp}>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select></div>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'9px 18px', borderRadius:99, border:'1.5px solid #E2E8F0', background:'#fff', fontSize:13, fontWeight:600, color:'#64748B', cursor:'pointer' }}>Cancel</button>
          <button onClick={submit} disabled={!valid} style={{ padding:'9px 22px', borderRadius:99, border:'none', background:valid?'#4F46E5':'#CBD5E1', color:'#fff', fontSize:13, fontWeight:700, cursor:valid?'pointer':'not-allowed' }}>Add Task</button>
        </div>
      </div>
    </div>
  )
}

/* ── Main App ─────────────────────────────────────────────────────────────── */
export default function App() {
  const [tasks,     setTasks]     = useState([])
  const [assignees, setAssignees] = useState(['Aishah'])
  const [filter,    setFilter]    = useState('All')
  const [showAdd,   setShowAdd]   = useState(false)
  const [showMgr,   setShowMgr]   = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const isMobile = useIsMobile()

  // ── Load tasks from Supabase ──
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: true })
      if (!error && data) setTasks(data)
      setLoading(false)
    }
    load()

    // Realtime sync — any change on another device updates instantly
    const channel = supabase.channel('tasks-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  // ── CRUD helpers ──
  const addTask = async form => {
    setSaving(true)
    const { data, error } = await supabase.from('tasks').insert([{ name:form.name, who:form.who, priority:form.priority, status:form.status, pct:form.pct, due:form.due||null }]).select()
    if (!error && data) setTasks(t => [...t, data[0]])
    setSaving(false)
  }

  const updTask = async (id, patch) => {
    setTasks(t => t.map(x => x.id===id ? {...x,...patch} : x)) // optimistic
    await supabase.from('tasks').update(patch).eq('id', id)
  }

  const delTask = async id => {
    setTasks(t => t.filter(x => x.id!==id)) // optimistic
    await supabase.from('tasks').delete().eq('id', id)
  }

  const saveAssignees = newList => {
    setAssignees(newList)
    tasks.forEach(t => { if (!newList.includes(t.who)) updTask(t.id, { who: newList[0] }) })
  }

  const total   = tasks.length
  const counts  = Object.fromEntries(STATUSES.map(s => [s, tasks.filter(t => t.status===s).length]))
  const donePct = total > 0 ? Math.round(counts['Done'] / total * 100) : 0
  const shown   = filter==='All' ? tasks : tasks.filter(t => t.status===filter)

  const DESK_COL = '28px 1fr 115px 46px minmax(170px,1.2fr) minmax(120px,0.8fr) 120px 135px 28px'

  return (
    <div style={{ minHeight:'100vh', background:'#0F172A', fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", paddingBottom:48 }}>
      <style>{`
        *{box-sizing:border-box;margin:0}
        .row{transition:background 0.15s}
        .row:hover{background:#F0F4FF !important}
        .row:hover .del-btn{opacity:1 !important}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:#F1F5F9}
        ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:99px}
      `}</style>

      {/* ── Header ── */}
      <div style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: isMobile ? '20px 16px 18px' : '26px 28px 22px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            <div>
              <p style={{ fontSize:10, fontWeight:700, color:'#A5B4FC', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:4 }}>Project Dashboard</p>
              <h1 style={{ fontSize: isMobile?20:25, fontWeight:800, color:'#fff', letterSpacing:'-0.02em' }}>✅ Task Tracker</h1>
              {!isMobile && <p style={{ fontSize:11, color:'#C7D2FE', marginTop:4 }}>Click name or 📅 to edit · Slide toggles · Drag progress · Hover to delete</p>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {saving && <span style={{ fontSize:11, color:'#C7D2FE', fontWeight:600 }}>Saving…</span>}
              <div style={{ background:'rgba(255,255,255,0.12)', borderRadius:12, padding: isMobile?'10px 16px':'13px 20px', textAlign:'center', border:'1px solid rgba(255,255,255,0.18)' }}>
                <p style={{ fontSize: isMobile?22:28, fontWeight:800, color:'#fff', lineHeight:1 }}>{donePct}%</p>
                <p style={{ fontSize:9, color:'#A5B4FC', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', margin:'3px 0 6px' }}>Done</p>
                <div style={{ width:80, height:4, background:'rgba(255,255,255,0.2)', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ width:`${donePct}%`, height:'100%', background:'#4ADE80', borderRadius:99, transition:'width 0.5s' }} />
                </div>
              </div>
              <button onClick={()=>setShowAdd(true)}
                style={{ padding: isMobile?'9px 14px':'10px 18px', borderRadius:12, border:'none', cursor:'pointer', background:'rgba(255,255,255,0.95)', color:'#4F46E5', fontSize: isMobile?12:13, fontWeight:800, display:'flex', alignItems:'center', gap:5, boxShadow:'0 2px 12px rgba(0,0,0,0.2)', whiteSpace:'nowrap' }}>
                ➕ {isMobile ? 'Add' : 'Add Task'}
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display:'flex', gap: isMobile?6:8, marginTop:14, flexWrap:'wrap' }}>
            {[
              { l:'Total', v:total, c:'#818CF8', bg:'#EEF2FF', f:'All' },
              { l:'Done', v:counts['Done'], c:'#16A34A', bg:'#DCFCE7', f:'Done' },
              { l:'Progress', v:counts['In Progress'], c:'#D97706', bg:'#FEF9C3', f:'In Progress' },
              { l:'To Do', v:counts['To Do'], c:'#DC2626', bg:'#FEE2E2', f:'To Do' },
              { l:'Blocked', v:counts['Blocked'], c:'#7E22CE', bg:'#F3E8FF', f:'Blocked' },
            ].map(x => {
              const active = filter===x.f
              return (
                <div key={x.l} onClick={()=>setFilter(x.f)}
                  style={{ background:x.bg, borderRadius:10, padding: isMobile?'7px 10px':'8px 14px', flex:1, minWidth:isMobile?50:65, cursor:'pointer', border:`2px solid ${active?x.c:x.c+'22'}`, boxShadow:active?`0 4px 14px ${x.c}33`:'none', transform:active?'translateY(-2px)':'none', transition:'all 0.18s' }}>
                  <p style={{ fontSize: isMobile?16:20, fontWeight:800, color:x.c, fontFamily:'monospace', lineHeight:1 }}>{x.v}</p>
                  <p style={{ fontSize:9, color:'#6B7280', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginTop:2 }}>{x.l}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div style={{ background:'#1E293B', padding: isMobile?'8px 16px':'9px 28px', overflowX:'auto' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', gap:6, alignItems:'center', minWidth:'max-content' }}>
          <span style={{ fontSize:9, fontWeight:800, color:'#475569', textTransform:'uppercase', letterSpacing:'0.1em', marginRight:4 }}>Filter</span>
          {['All',...STATUSES].map(s => {
            const active=filter===s, cfg=S[s]
            return (
              <button key={s} onClick={()=>setFilter(s)} style={{ padding:'4px 12px', borderRadius:99, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, transition:'all 0.18s', background:active?(cfg?.light||'#EEF2FF'):'rgba(255,255,255,0.07)', color:active?(cfg?.text||'#4F46E5'):'#64748B', outline:active?`1.5px solid ${cfg?.color||'#6366F1'}44`:'none', whiteSpace:'nowrap' }}>
                {s} ({s==='All'?total:counts[s]})
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth:1200, margin:'20px auto 0', padding: isMobile?'0 12px':'0 20px' }}>

        {loading ? (
          <div style={{ textAlign:'center', padding:60, color:'#94A3B8' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
            <p style={{ fontSize:14, fontWeight:600 }}>Loading your tasks…</p>
          </div>
        ) : isMobile ? (
          /* ── Mobile: cards ── */
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {shown.length === 0 && (
              <div style={{ textAlign:'center', padding:40, color:'#94A3B8' }}>
                <p style={{ fontSize:15 }}>No tasks here.</p>
                <button onClick={()=>setShowAdd(true)} style={{ marginTop:12, padding:'8px 18px', borderRadius:99, border:'none', background:'#4F46E5', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Add one</button>
              </div>
            )}
            {shown.map(task => (
              <TaskCard key={task.id} task={task} assignees={assignees}
                onUpd={patch => updTask(task.id, patch)}
                onDel={() => delTask(task.id)}
                onManage={() => setShowMgr(true)}
              />
            ))}
            <div onClick={()=>setShowAdd(true)}
              style={{ padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer', color:'#6366F1', fontSize:13, fontWeight:700, borderRadius:14, border:'2px dashed #C7D2FE', background:'#fff', transition:'background 0.15s' }}>
              ➕ Add a task
            </div>
          </div>
        ) : (
          /* ── Desktop: table ── */
          <div style={{ background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 4px 28px rgba(0,0,0,0.14)' }}>
            <div style={{ display:'grid', gridTemplateColumns:DESK_COL, padding:'9px 16px', background:'#F8FAFC', borderBottom:'1.5px solid #E2E8F0', gap:10, alignItems:'center' }}>
              {['#','Task','Assignee','✓','Status','Priority','Progress','Due',''].map(h => (
                <span key={h} style={{ fontSize:9, fontWeight:800, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</span>
              ))}
            </div>

            {shown.length === 0 && (
              <div style={{ padding:'40px 20px', textAlign:'center', color:'#94A3B8' }}>
                <p style={{ fontSize:15 }}>No tasks here.</p>
                <button onClick={()=>setShowAdd(true)} style={{ marginTop:12, padding:'8px 18px', borderRadius:99, border:'none', background:'#4F46E5', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Add one</button>
              </div>
            )}

            {shown.map((task, i) => {
              const isDone = task.status === 'Done'
              return (
                <div key={task.id} className="row" style={{ display:'grid', gridTemplateColumns:DESK_COL, padding:'11px 16px', gap:10, background:isDone?'#F0FDF4':i%2===0?'#fff':'#FAFBFE', borderBottom:'1px solid #F1F5F9', alignItems:'center' }}>
                  <span style={{ fontSize:10, color:'#CBD5E1', fontWeight:700, fontFamily:'monospace' }}>{String(i+1).padStart(2,'0')}</span>
                  <EditableText value={task.name} onChange={v=>updTask(task.id,{name:v})}
                    style={{ fontSize:13, fontWeight:600, color:isDone?'#94A3B8':'#1E293B', textDecoration:isDone?'line-through':'none', transition:'all 0.3s' }} />
                  <AssigneeCell value={task.who} assignees={assignees} onChange={w=>updTask(task.id,{who:w})} onManage={()=>setShowMgr(true)} />
                  <IOSSwitch on={isDone} onChange={()=>updTask(task.id,{status:isDone?'To Do':'Done',pct:isDone?0:100})} />
                  <SegToggle options={STATUSES}   value={task.status}   config={S} onChange={s=>updTask(task.id,{status:s,pct:s==='Done'?100:s==='To Do'?0:task.pct})} />
                  <SegToggle options={PRIORITIES} value={task.priority} config={P} onChange={p=>updTask(task.id,{priority:p})} />
                  <ProgBar value={task.pct} onChange={v=>updTask(task.id,{pct:v,status:v===100?'Done':v===0?'To Do':'In Progress'})} />
                  <DateCell value={task.due} onChange={v=>updTask(task.id,{due:v})} />
                  <button className="del-btn" onClick={()=>delTask(task.id)} title="Delete"
                    style={{ opacity:0, width:22, height:22, borderRadius:'50%', border:'none', background:'#FEE2E2', color:'#EF4444', cursor:'pointer', fontSize:14, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', transition:'opacity 0.15s', flexShrink:0 }}>×</button>
                </div>
              )
            })}

            <div onClick={()=>setShowAdd(true)}
              style={{ padding:'11px 16px', display:'flex', alignItems:'center', gap:8, cursor:'pointer', color:'#94A3B8', fontSize:12, fontWeight:600, borderTop:'1px dashed #E2E8F0', transition:'background 0.15s, color 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#F8FAFC';e.currentTarget.style.color='#4F46E5'}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#94A3B8'}}>
              <span style={{ fontSize:16, fontWeight:800 }}>+</span> Add a task…
            </div>
          </div>
        )}
      </div>

      {showAdd && <AddModal onAdd={addTask} onClose={()=>setShowAdd(false)} assignees={assignees} />}
      {showMgr  && <ManageModal assignees={assignees} onSave={saveAssignees} onClose={()=>setShowMgr(false)} />}
    </div>
  )
}
