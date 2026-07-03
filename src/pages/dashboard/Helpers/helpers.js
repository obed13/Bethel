export function fmtDate(str) {
  if (!str) return "—";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
}

export function calcAge(birthday) {
  if (!birthday) return null;
  const today = new Date();
  const birth = new Date(birthday);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function initials(name = "") {
  return name.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Ahora mismo";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `Hace ${d}d`;
  return new Date(dateStr).toLocaleDateString("es-ES", { day:"2-digit", month:"short" });
}

export function fmtEventDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-ES", {
    weekday: "short", day: "2-digit", month: "short",
  });
}

export function daysUntil(dateStr) {
  const diff = new Date(dateStr + "T00:00:00").getTime() - new Date().setHours(0,0,0,0);
  const d = Math.ceil(diff / 86400000);
  if (d === 0) return "Hoy";
  if (d === 1) return "Mañana";
  return `En ${d} días`;
}

