/**
 *
 * Hook del formulario de contacto conectado a POST /api/contact → D1.
 *
 * Estados devueltos:
 *   form        — valores actuales del formulario
 *   status      — "idle" | "loading" | "success" | "error"
 *   errorMsg    — mensaje de error cuando status === "error"
 *   handleChange — onChange para los inputs
 *   handleSubmit — onSubmit/onClick del botón enviar
 *   reset        — vuelve al estado inicial (útil para cerrar un modal, etc.)
 */

import { useState, useCallback } from "react";

const INITIAL_FORM = { name: "", email: "", subject: "", message: "" };

const useContactForm = () => {
  const [form,     setForm]     = useState(INITIAL_FORM);
  const [status,   setStatus]   = useState("idle");   // "idle"|"loading"|"success"|"error"
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpia el error al empezar a escribir
    if (status === "error") setStatus("idle");
  }, [status]);

  const handleSubmit = useCallback(async () => {
    // Validación básica en el cliente antes de llamar a la API
    if (!form.name.trim())    { setStatus("error"); setErrorMsg("El nombre es obligatorio.");         return; }
    if (!form.email.trim())   { setStatus("error"); setErrorMsg("El correo es obligatorio.");         return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setStatus("error"); setErrorMsg("El correo no tiene un formato válido."); return;
    }
    if (!form.message.trim()) { setStatus("error"); setErrorMsg("El mensaje es obligatorio.");        return; }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:    form.name.trim(),
          email:   form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      const json = await res.json();

      if (!json.ok) {
        setStatus("error");
        setErrorMsg(json.error ?? "Ocurrió un error al enviar el mensaje.");
        return;
      }

      setStatus("success");
      setForm(INITIAL_FORM);

      // Vuelve al estado inicial después de 5 segundos
      setTimeout(() => setStatus("idle"), 5000);

    } catch {
      setStatus("error");
      setErrorMsg("Error de conexión. Revisa tu internet e inténtalo de nuevo.");
    }
  }, [form]);

  const reset = useCallback(() => {
    setForm(INITIAL_FORM);
    setStatus("idle");
    setErrorMsg("");
  }, []);

  return {
    form,
    status,
    errorMsg,
    handleChange,
    handleSubmit,
    reset,
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError:   status === "error",
  };
};

export default useContactForm;