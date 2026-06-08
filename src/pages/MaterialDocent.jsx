import React, { useState, useEffect } from 'react'
import { useAuth } from '../App.jsx'
import { Upload, Download, FileText, X, BookOpen, Eye } from 'lucide-react'

const CATEGORIES = ['protocols', 'guies', 'formacio', 'general']

const s = {
  card: { background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-lg)', overflow:'hidden' },
  inp: { padding:'var(--space-2) var(--space-3)', background:'var(--color-surface-offset)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', color:'var(--color-text)', fontSize:'var(--text-sm)', width:'100%' },
  btn: (accent) => ({ display:'inline-flex', alignItems:'center', gap:'6px', padding:'var(--space-2) var(--space-4)', background: accent ? 'var(--color-accent)' : 'var(--color-surface-offset)', color: accent ? 'white' : 'var(--color-text-muted)', border: accent ? 'none' : '1px solid var(--color-border)', borderRadius:'var(--radius-md)', fontSize:'var(--text-sm)', fontWeight:600, cursor:'pointer' }),
}

function formatMida(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function iconaMime(mime) {
  if (!mime) return <FileText size={20}/>
  if (mime.includes('pdf')) return <span style={{fontSize:'1.25rem'}}>📕</span>
  if (mime.includes('image')) return <span style={{fontSize:'1.25rem'}}>🖼️</span>
  if (mime.includes('word') || mime.includes('docx')) return <span style={{fontSize:'1.25rem'}}>📝</span>
  if (mime.includes('sheet') || mime.includes('xlsx')) return <span style={{fontSize:'1.25rem'}}>📊</span>
  if (mime.includes('presentation') || mime.includes('pptx')) return <span style={{fontSize:'1.25rem'}}>📽️</span>
  return <FileText size={20}/>
}

function canPreview(item) {
  const mime = item?.mimetype || ''
  return mime.includes('pdf') || mime.includes('image')
}

export default function MaterialDocent() {
  const { user } = useAuth()
  const token = sessionStorage.getItem('calp_token')
  const [material, setMaterial] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoria, setCategoria] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [previewItem, setPreviewItem] = useState(null)
  const [previewError, setPreviewError] = useState(false)
  const [form, setForm] = useState({ titol: '', descripcio: '', categoria: 'general', file: null })

  useEffect(() => { load() }, [categoria])

  async function load() {
    setLoading(true)
    const url = categoria ? `/api/material?categoria=${categoria}` : '/api/material'
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setMaterial(data.material || [])
    setLoading(false)
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!form.file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', form.file)
    fd.append('titol', form.titol || form.file.name)
    fd.append('descripcio', form.descripcio)
    fd.append('categoria', form.categoria)
    const res = await fetch('/api/material', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    })
    setUploading(false)
    if (res.ok) {
      setShowModal(false)
      setForm({ titol: '', descripcio: '', categoria: 'general', file: null })
      load()
    } else {
      const data = await res.json()
      alert('Error: ' + data.error)
    }
  }

  function openPreview(item) {
    setPreviewError(false)
    setPreviewItem(item)
  }

  function closePreview() {
    setPreviewItem(null)
    setPreviewError(false)
  }

  return (
    <div style={{ padding:'var(--space-6) var(--space-8)', maxWidth:'900px' }}>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'var(--space-6)', flexWrap:'wrap', gap:'var(--space-3)' }}>
        <div>
          <h1 style={{ fontSize:'var(--text-xl)', fontWeight:700, display:'flex', alignItems:'center', gap:'var(--space-2)' }}>
            <BookOpen size={22} color="var(--color-primary)"/> Material Docent
          </h1>
          <p style={{ fontSize:'var(--text-sm)', color:'var(--color-text-faint)', marginTop:'4px' }}>Documents, protocols i guies clíniques</p>
        </div>
        {user?.role === 'admin' && (
          <button style={s.btn(true)} onClick={() => setShowModal(true)}>
            <Upload size={15}/> Pujar material
          </button>
        )}
      </div>

      <div style={{ display:'flex', gap:'var(--space-2)', marginBottom:'var(--space-5)', flexWrap:'wrap' }}>
        {['', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            style={{
              padding:'var(--space-1) var(--space-4)',
              borderRadius:'var(--radius-full)',
              fontSize:'var(--text-xs)',
              fontWeight:500,
              cursor:'pointer',
              background: categoria === cat ? 'var(--color-accent)' : 'var(--color-surface-offset)',
              color: categoria === cat ? 'white' : 'var(--color-text-muted)',
              border: categoria === cat ? 'none' : '1px solid var(--color-border)',
              transition:'all 180ms ease'
            }}
          >
            {cat === '' ? 'Tot' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-2)' }}>
          {[1,2,3].map(i => (
            <div
              key={i}
              style={{
                height:'72px',
                borderRadius:'var(--radius-lg)',
                backgroundImage:'linear-gradient(90deg,var(--color-surface-offset) 25%,var(--color-surface-dynamic) 50%,var(--color-surface-offset) 75%)',
                backgroundSize:'200% 100%',
                animation:'shimmer 1.5s ease-in-out infinite'
              }}
            />
          ))}
        </div>
      ) : material.length === 0 ? (
        <div style={{ textAlign:'center', padding:'var(--space-16) var(--space-8)', color:'var(--color-text-faint)' }}>
          <BookOpen size={40} style={{ margin:'0 auto var(--space-4)', opacity:0.3 }}/>
          <p style={{ fontSize:'var(--text-base)', color:'var(--color-text-muted)', marginBottom:'var(--space-2)' }}>Cap material disponible</p>
          <p style={{ fontSize:'var(--text-sm)' }}>{categoria ? 'No hi ha documents en aquesta categoria.' : "Encara no s'ha pujat cap document."}</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-2)' }}>
          {material.map(item => (
            <div
              key={item.id}
              style={{ ...s.card, display:'flex', alignItems:'center', gap:'var(--space-4)', padding:'var(--space-4) var(--space-5)', transition:'box-shadow 180ms ease' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
            >
              <div style={{ color:'var(--color-text-muted)', flexShrink:0 }}>
                {iconaMime(item.mimetype)}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'var(--text-sm)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {item.titol}
                </div>

                {item.descripcio && (
                  <div style={{ fontSize:'var(--text-xs)', color:'var(--color-text-muted)', marginTop:'2px' }}>
                    {item.descripcio}
                  </div>
                )}

                <div style={{ display:'flex', gap:'var(--space-3)', alignItems:'center', marginTop:'var(--space-1)', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'var(--text-xs)', padding:'1px 8px', borderRadius:'var(--radius-full)', background:'oklch(from var(--color-primary) l c h / 0.12)', color:'var(--color-primary)', fontWeight:500 }}>
                    {item.categoria}
                  </span>
                  {item.mida_bytes && <span style={{ fontSize:'var(--text-xs)', color:'var(--color-text-faint)' }}>{formatMida(item.mida_bytes)}</span>}
                  <span style={{ fontSize:'var(--text-xs)', color:'var(--color-text-faint)' }}>↓ {item.downloads || 0} descàrregues</span>
                </div>
              </div>

              <div style={{ display:'flex', gap:'var(--space-2)', flexShrink:0, flexWrap:'wrap', justifyContent:'flex-end' }}>
                {canPreview(item) && (
                  <button type="button" onClick={() => openPreview(item)} style={s.btn(false)}>
                    <Eye size={14}/> Veure
                  </button>
                )}

                <a
                  href={`/api/material/${item.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...s.btn(false), textDecoration:'none', flexShrink:0 }}
                >
                  <Download size={14}/> Descarregar
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position:'fixed', inset:0, zIndex:500, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div onClick={() => setShowModal(false)} style={{ position:'absolute', inset:0, background:'oklch(0 0 0 / 0.7)', backdropFilter:'blur(4px)' }}/>
          <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:'480px', margin:'var(--space-4)', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', overflow:'hidden', boxShadow:'var(--shadow-lg)' }}>
            <div style={{ padding:'var(--space-5) var(--space-6)', borderBottom:'1px solid var(--color-divider)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <h2 style={{ fontSize:'var(--text-lg)', fontWeight:700 }}>Pujar material docent</h2>
              <button onClick={() => setShowModal(false)} style={{ color:'var(--color-text-faint)', padding:'var(--space-1)' }}>
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleUpload} style={{ padding:'var(--space-6)', display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
              <div>
                <label style={{ display:'block', fontSize:'var(--text-xs)', color:'var(--color-text-faint)', marginBottom:'var(--space-1)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  Títol
                </label>
                <input
                  style={s.inp}
                  type="text"
                  value={form.titol}
                  onChange={e => setForm({...form, titol: e.target.value})}
                  placeholder="Nom del document"
                />
              </div>

              <div>
                <label style={{ display:'block', fontSize:'var(--text-xs)', color:'var(--color-text-faint)', marginBottom:'var(--space-1)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  Descripció
                </label>
                <textarea
                  style={{ ...s.inp, resize:'vertical' }}
                  rows="2"
                  value={form.descripcio}
                  onChange={e => setForm({...form, descripcio: e.target.value})}
                  placeholder="Breu descripció (opcional)"
                />
              </div>

              <div>
                <label style={{ display:'block', fontSize:'var(--text-xs)', color:'var(--color-text-faint)', marginBottom:'var(--space-1)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  Categoria
                </label>
                <select style={s.inp} value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display:'block', fontSize:'var(--text-xs)', color:'var(--color-text-faint)', marginBottom:'var(--space-1)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  Arxiu *
                </label>

                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault()
                    setDragOver(false)
                    const f = e.dataTransfer.files[0]
                    if (f) setForm({...form, file:f, titol: form.titol || f.name.replace(/\.[^.]+$/,'')})
                  }}
                  style={{
                    border:`2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius:'var(--radius-md)',
                    padding:'var(--space-6)',
                    textAlign:'center',
                    background: dragOver ? 'oklch(from var(--color-primary) l c h / 0.05)' : 'var(--color-surface-offset)',
                    transition:'all 180ms ease',
                    cursor:'pointer'
                  }}
                  onClick={() => document.getElementById('file-input-modal').click()}
                >
                  <input
                    id="file-input-modal"
                    type="file"
                    required
                    accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.pptx"
                    hidden
                    onChange={e => {
                      const f = e.target.files[0]
                      if (f) setForm({...form, file:f, titol: form.titol || f.name.replace(/\.[^.]+$/,'')})
                    }}
                  />

                  {form.file ? (
                    <div>
                      <div style={{ fontSize:'2rem', marginBottom:'var(--space-2)' }}>📄</div>
                      <div style={{ fontSize:'var(--text-sm)', fontWeight:600, color:'var(--color-text)' }}>{form.file.name}</div>
                      <div style={{ fontSize:'var(--text-xs)', color:'var(--color-text-faint)', marginTop:'4px' }}>{formatMida(form.file.size)}</div>
                    </div>
                  ) : (
                    <div>
                      <Upload size={24} style={{ margin:'0 auto var(--space-2)', color:'var(--color-text-faint)' }}/>
                      <div style={{ fontSize:'var(--text-sm)', color:'var(--color-text-muted)' }}>Arrossega un arxiu o fes clic</div>
                      <div style={{ fontSize:'var(--text-xs)', color:'var(--color-text-faint)', marginTop:'4px' }}>PDF, Word, Excel, PowerPoint, Imatges</div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display:'flex', gap:'var(--space-3)', justifyContent:'flex-end', paddingTop:'var(--space-2)' }}>
                <button type="button" style={s.btn(false)} onClick={() => setShowModal(false)}>
                  Cancel·lar
                </button>
                <button type="submit" style={{ ...s.btn(true), opacity: uploading ? 0.6 : 1 }} disabled={uploading}>
                  {uploading ? (
                    <>
                      <span style={{ width:14, height:14, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }}/>
                      Pujant...
                    </>
                  ) : (
                    <>
                      <Upload size={14}/> Pujar arxiu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewItem && (
        <div style={{ position:'fixed', inset:0, zIndex:600, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div
            onClick={closePreview}
            style={{ position:'absolute', inset:0, background:'oklch(0 0 0 / 0.78)', backdropFilter:'blur(4px)' }}
          />

          <div style={{
            position:'relative',
            zIndex:1,
            width:'min(1100px, calc(100vw - 24px))',
            height:'min(90vh, 900px)',
            background:'var(--color-surface)',
            border:'1px solid var(--color-border)',
            borderRadius:'var(--radius-xl)',
            overflow:'hidden',
            boxShadow:'var(--shadow-lg)',
            display:'flex',
            flexDirection:'column'
          }}>
            <div style={{
              padding:'var(--space-4) var(--space-5)',
              borderBottom:'1px solid var(--color-divider)',
              display:'flex',
              alignItems:'center',
              justifyContent:'space-between',
              gap:'var(--space-3)',
              flexWrap:'wrap'
            }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:'var(--text-sm)', fontWeight:700 }}>{previewItem.titol}</div>
                <div style={{ fontSize:'var(--text-xs)', color:'var(--color-text-faint)' }}>
                  {previewItem.mimetype || 'Document'}
                </div>
              </div>

              <div style={{ display:'flex', gap:'var(--space-2)', flexWrap:'wrap' }}>
                <a
                  href={`/api/material/${previewItem.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...s.btn(false), textDecoration:'none' }}
                >
                  <Download size={14}/> Descarregar
                </a>

                <button onClick={closePreview} style={s.btn(false)}>
                  <X size={14}/> Tancar
                </button>
              </div>
            </div>

            <div style={{ flex:1, background:'var(--color-surface-offset)', overflow:'auto' }}>
              {previewItem.mimetype?.includes('image') ? (
                <div style={{ padding:'var(--space-4)', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {!previewError ? (
                    <img
                      src={`/api/material/${previewItem.id}/view`}
                      alt={previewItem.titol}
                      style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', borderRadius:'var(--radius-lg)' }}
                      onError={() => setPreviewError(true)}
                    />
                  ) : (
                    <div style={{ textAlign:'center', color:'var(--color-text-muted)', padding:'var(--space-8)' }}>
                      No s'ha pogut visualitzar aquesta imatge.
                    </div>
                  )}
                </div>
              ) : previewItem.mimetype?.includes('pdf') ? (
                !previewError ? (
                  <iframe
                    src={`/api/material/${previewItem.id}/view`}
                    title={previewItem.titol}
                    style={{ width:'100%', height:'100%', border:'none' }}
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <div style={{ textAlign:'center', color:'var(--color-text-muted)', padding:'var(--space-8)' }}>
                    No s'ha pogut visualitzar aquest PDF.
                  </div>
                )
              ) : (
                <div style={{ textAlign:'center', color:'var(--color-text-muted)', padding:'var(--space-8)' }}>
                  Aquest format encara no es pot visualitzar dins l'app. Pots descarregar-lo.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0% { background-position:-200% 0 } 100% { background-position:200% 0 } }
        @keyframes spin { to { transform:rotate(360deg) } }
      `}</style>
    </div>
  )
}
