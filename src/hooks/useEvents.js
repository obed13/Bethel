/**
 * useEvents — hook de React para consumir /api/events
 *
 * Uso en CalendarioMSBN.jsx:
 *
 *   const { events, loading, error } = useEvents({ date: selected });
 *   const { events: all }            = useEvents({ month: "2026-05" });
 */

import { useState, useEffect } from "react";

const BASE = "/api/events";

export function useEvents(params = {}) {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const url = new URL(BASE, window.location.origin);
    Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));

    let cancelled = false;
    setLoading(true);

    fetch(url.toString())
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          if (json.ok) setEvents(json.data);
          else         setError(json.error ?? "Error desconocido");
        }
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(()  => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [JSON.stringify(params)]);

  return { events, loading, error };
}

// ─── Helpers de escritura ─────────────────────────────────────────────────────

export async function createEvent(data) {
  const r = await fetch(BASE, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });
  return r.json();
}

export async function updateEvent(id, data) {
  const r = await fetch(`${BASE}?id=${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });
  return r.json();
}

export async function deleteEvent(id) {
  const r = await fetch(`${BASE}?id=${id}`, { method: "DELETE" });
  return r.json();
}