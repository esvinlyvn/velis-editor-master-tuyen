// Danh sách preset người dùng đã duyệt (repo nào có lib/presets-duyet.json thì dùng — như bds-editor; không có thì null,
// mọi nơi gọi giữ nguyên hành vi cũ). Một chỗ đọc cho lib/plan.mjs, pick-text, scripts/map.
//   bds / me4real / chung: { dung: [id], khong: [id] } · bien_the_khong: { preset: { vai: [...] } }
import fs from "node:fs";
const F = new URL("../lib/presets-duyet.json", import.meta.url);
export const DUYET = fs.existsSync(F) ? JSON.parse(fs.readFileSync(F, "utf8")) : null;
/** preset bị duyệt "không dùng"? bo: "bds" | "me4real" | "chung" */
export const khong = (bo, id) => !!DUYET?.[bo]?.khong.includes(id);
