import { useState, useRef } from "react"
import { API_BASE } from "../utils/api"
import "./MultiUploadZone.css"

const EXT_COLORS = {
  PDF:  { bg: "rgba(239,68,68,0.15)",   border: "rgba(239,68,68,0.35)",   text: "#fca5a5" },
  DOCX: { bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.35)",  text: "#93c5fd" },
  PPTX: { bg: "rgba(234,179,8,0.15)",   border: "rgba(234,179,8,0.35)",   text: "#fde68a" },
  TXT:  { bg: "rgba(34,197,94,0.15)",   border: "rgba(34,197,94,0.35)",   text: "#86efac" },
  PNG:  { bg: "rgba(168,85,247,0.15)",  border: "rgba(168,85,247,0.35)",  text: "#d8b4fe" },
  JPG:  { bg: "rgba(168,85,247,0.15)",  border: "rgba(168,85,247,0.35)",  text: "#d8b4fe" },
  JPEG: { bg: "rgba(168,85,247,0.15)",  border: "rgba(168,85,247,0.35)",  text: "#d8b4fe" },
  WEBP: { bg: "rgba(168,85,247,0.15)",  border: "rgba(168,85,247,0.35)",  text: "#d8b4fe" },
}

const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp", "bmp", "tiff"]

function ExtBadge({ name }) {
  const ext = name.split(".").pop().toUpperCase()
  const style = EXT_COLORS[ext] || { bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.2)", text: "#e2e8f0" }
  const isImage = IMAGE_EXTS.includes(ext.toLowerCase())
  return (
    <span
      className="ext-badge"
      style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}
      title={isImage ? "Image — Google Vision OCR" : undefined}
    >
      {isImage ? "🔍 " : ""}{ext}
    </span>
  )
}

function FileRow({ file, status }) {
  const sizeKB = (file.size / 1024).toFixed(1)
  const isImage = IMAGE_EXTS.includes(file.name.split(".").pop().toLowerCase())

  const statusIcon = {
    pending:    <span className="fstatus pending">–</span>,
    extracting: <span className="fstatus extracting"><span className="mini-spin" /></span>,
    done:       <span className="fstatus done">✓</span>,
    error:      <span className="fstatus error">✕</span>,
  }[status?.state || "pending"]

  return (
    <div className={`file-row ${status?.state || "pending"}`}>
      <ExtBadge name={file.name} />
      <div className="file-row-info">
        <span className="file-row-name">{file.name}</span>
        <span className="file-row-meta">
          {sizeKB} KB
          {isImage && !status && <span className="ocr-hint"> · Vision OCR</span>}
          {status?.chars && <> · {status.chars.toLocaleString()} chars</>}
          {status?.error && <span className="file-row-error"> · {status.error}</span>}
        </span>
      </div>
      {statusIcon}
    </div>
  )
}

function MultiUploadZone({ onExtracted }) {
  const [files, setFiles] = useState([])
  const [statuses, setStatuses] = useState({})
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef()

  const ALLOWED = ["pdf", "docx", "pptx", "txt", ...IMAGE_EXTS]

  const addFiles = (incoming) => {
    const valid = Array.from(incoming).filter(f => {
      const ext = f.name.split(".").pop().toLowerCase()
      return ALLOWED.includes(ext)
    })
    if (!valid.length) return
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      return [...prev, ...valid.filter(f => !existing.has(f.name))]
    })
  }

  const removeFile = (name) => {
    setFiles(prev => prev.filter(f => f.name !== name))
    setStatuses(prev => { const s = { ...prev }; delete s[name]; return s })
  }

  const setStatus = (name, state, extra = {}) =>
    setStatuses(prev => ({ ...prev, [name]: { state, ...extra } }))

  const handleUpload = async () => {
    if (!files.length || uploading) return
    setUploading(true)
    files.forEach(f => setStatus(f.name, "extracting"))

    const formData = new FormData()
    files.forEach(f => formData.append("files", f))

    try {
      const res = await fetch(`${API_BASE}/api/extract-text-multi`, {
        method: "POST",
        body: formData
      })
      const data = await res.json()

      if (!data.success) {
        files.forEach(f => setStatus(f.name, "error", { error: "Неуспешно" }))
        return
      }

      data.files.forEach(f => {
        if (f.success) setStatus(f.name, "done", { chars: f.chars })
        else            setStatus(f.name, "error", { error: f.error })
      })

      onExtracted(data.combinedText, data.files, data.successCount)

    } catch {
      files.forEach(f => setStatus(f.name, "error", { error: "Грешка при поврзување" }))
    } finally {
      setUploading(false)
    }
  }

  const hasImages = files.some(f => IMAGE_EXTS.includes(f.name.split(".").pop().toLowerCase()))
  const allDone   = files.length > 0 && files.every(f => statuses[f.name]?.state === "done")
  const hasFiles  = files.length > 0

  return (
    <div className="multi-upload">

      <div
        className={`multi-drop-zone ${dragging ? "drag-over" : ""} ${hasFiles ? "compact" : ""}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
        onClick={() => !hasFiles && inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.pptx,.txt,.png,.jpg,.jpeg,.webp,.bmp,.tiff"
          style={{ display: "none" }}
          onChange={e => addFiles(e.target.files)}
        />

        {hasFiles ? (
          <div className="multi-drop-compact">
            <span className="multi-drop-icon-sm">📂</span>
            <span className="multi-drop-add" onClick={e => { e.stopPropagation(); inputRef.current.click() }}>
              + Додади уште фајлови
            </span>
          </div>
        ) : (
          <div className="multi-drop-hint">
            <div className="multi-drop-icon">📂</div>
            <p className="multi-drop-text">
              Повлечи <strong>повеќе фајлови</strong> или{" "}
              <span className="drop-link" onClick={() => inputRef.current.click()}>избери</span>
            </p>
            <p className="multi-drop-formats">PDF · DOCX · PPTX · TXT · PNG · JPG · до 10 фајлови</p>
            <p className="multi-drop-ocr-hint">🔍 Сликите се обработуваат со Google Vision OCR</p>
          </div>
        )}
      </div>

      {hasFiles && hasImages && (
        <div className="vision-notice">
          🔍 <strong>Google Vision OCR</strong> — сликите ќе бидат автоматски читани и претворени во текст
        </div>
      )}

      {hasFiles && (
        <div className="file-list">
          {files.map(f => (
            <div key={f.name} className="file-list-row">
              <FileRow file={f} status={statuses[f.name]} />
              {!uploading && statuses[f.name]?.state !== "done" && (
                <button className="remove-btn" onClick={() => removeFile(f.name)} title="Отстрани">✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {allDone && (
        <div className="multi-success-bar">
          ✅ Извлечен текст од {files.filter(f => statuses[f.name]?.state === "done").length} фајлови — спремно за генерирање квиз
        </div>
      )}

      {hasFiles && !allDone && (
        <button className="btn-primary btn-full" onClick={handleUpload} disabled={uploading}>
          {uploading
            ? <span className="btn-loader"><span className="spinner" />Се обработува…</span>
            : `Извлечи текст од ${files.length} ${files.length === 1 ? "фајл" : "фајлови"} →`}
        </button>
      )}

      {allDone && (
        <button className="btn-ghost-sm" onClick={() => { setFiles([]); setStatuses({}) }}>
          ↺ Рестартирај
        </button>
      )}

    </div>
  )
}

export default MultiUploadZone