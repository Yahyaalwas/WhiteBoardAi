const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function uploadImage(file: File): Promise<{ session_id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function analyzeBoard(sessionId: string): Promise<{ analysis_id: string }> {
  const res = await fetch(`${API_URL}/api/analyze/${sessionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}

export async function getAnalysisResult(analysisId: string): Promise<import("./types").AnalysisResult> {
  const res = await fetch(`${API_URL}/api/results/${analysisId}`);
  if (!res.ok) throw new Error("Failed to get results");
  return res.json();
}

export async function exportResult(
  analysisId: string,
  format: string
): Promise<Blob> {
  const res = await fetch(`${API_URL}/api/export/${analysisId}?format=${format}`);
  if (!res.ok) throw new Error("Export failed");
  return res.blob();
}
