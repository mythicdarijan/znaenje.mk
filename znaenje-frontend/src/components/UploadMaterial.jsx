import { useState } from "react"

function UploadMaterial({ onExtracted }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    if (!file) return alert("Избери фајл")

    const formData = new FormData()
    formData.append("file", file)

    setLoading(true)

    const res = await fetch("http://localhost:3001/api/extract-text", {
      method: "POST",
      body: formData
    })

    const data = await res.json()
    setLoading(false)

    if (!data.success) {
      alert("Неуспешно читање документ")
      return
    }

    onExtracted(data.text)
  }

  return (
    <div className="card p-3 mb-4">
      <h5>1. Прикачи материјал</h5>

      <input
        type="file"
        className="form-control mb-2"
        onChange={e => setFile(e.target.files[0])}
      />

      <button
        className="btn btn-primary"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Се обработува..." : "Извлечи текст"}
      </button>
    </div>
  )
}

export default UploadMaterial