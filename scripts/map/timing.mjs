// Mốc thời gian trong file cảnh bản đồ: số giây (tính từ đầu cảnh) hoặc chuỗi tham chiếu transcript.json.
//   "@3"              đầu cụm i=3
//   "@3.end"          cuối cụm 3
//   "@3:Long Thành"   lúc bắt đầu nói cụm chữ "Long Thành" trong cụm 3 (ước lượng theo tỷ lệ ký tự, như phụ đề)
//   "@3:Long Thành+0.2", "@3.end-0.3", "@3+1.5"   cộng/trừ giây
// Mốc tuyệt đối (theo video) được quy về giây trong cảnh: trừ đi `start` của cảnh (start cũng viết được dạng "@…").
import fs from "node:fs";

const RE = /^@(\d+)(?:(\.end)|:([^+\-]+?))?\s*([+-]\s*\d+(?:\.\d+)?)?$/;

export function loadTranscript(file) {
  if (!file) return null;
  const T = JSON.parse(fs.readFileSync(file, "utf8"));
  return new Map(T.chunks.map((c) => [c.i, c]));
}

const norm = (s) => s.normalize("NFC").toLowerCase();
/** Mốc tuyệt đối (giây trong video) của một tham chiếu "@…". */
export function absTime(ref, chunks) {
  const m = RE.exec(String(ref).trim());
  if (!m) throw new Error(`Mốc thời gian không hợp lệ: "${ref}" (vd. 2.5, "@3", "@3.end", "@3:Long Thành+0.2")`);
  if (!chunks) throw new Error(`Mốc "${ref}" cần khai báo "transcript" trong file cảnh`);
  const c = chunks.get(Number(m[1]));
  if (!c) throw new Error(`transcript.json không có cụm i=${m[1]} (mốc "${ref}")`);
  let t = c.start;
  if (m[2]) t = c.end;
  else if (m[3]) {
    const text = c.text.normalize("NFC"), k = norm(text).indexOf(norm(m[3].trim()));
    if (k < 0) throw new Error(`Cụm ${c.i} ("${c.text}") không có chữ "${m[3].trim()}"`);
    t = c.start + ((c.end - c.start) * k) / Math.max(1, text.length);
  }
  if (m[4]) t += Number(m[4].replace(/\s/g, ""));
  return t;
}

/** Hàm quy đổi mốc của một cảnh: số → giữ nguyên; "@…" → giây trong cảnh. transcriptFile: đường dẫn tuyệt đối. */
export function makeTimer(transcriptFile, start = 0) {
  const chunks = loadTranscript(transcriptFile);
  const t0 = typeof start === "number" ? start : absTime(start, chunks);
  const at = (v, dflt) => {
    if (v === undefined || v === null) return dflt;
    if (typeof v === "number") return v;
    return +(absTime(v, chunks) - t0).toFixed(3);
  };
  at.start = t0;
  return at;
}
