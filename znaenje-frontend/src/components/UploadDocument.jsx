import { useState } from "react";

function UploadDocument({ onTextExtracted }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFile = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3001/api/extract-text", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error("Неуспешно читање документ");
      }

      onTextExtracted(data.text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4">
      <h4>Прикачи документ (PDF, DOCX, PPTX)</h4>

      <input
        type="file"
        className="form-control mb-3"
        accept=".pdf,.docx,.pptx"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {error && <div className="alert alert-danger">{error}</div>}

      <button
        className="btn btn-primary"
        onClick={uploadFile}
        disabled={!file || loading}
      >
        {loading ? "Обработка..." : "Извлечи текст"}
      </button>
    </div>
  );
}

export default UploadDocument;