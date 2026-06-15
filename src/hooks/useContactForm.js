import { useState } from "react";

const INITIAL_FORM = { name: "", email: "", subject: "", message: "" };

const useContactForm = () => {
  const [form, setForm] = useState(INITIAL_FORM);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    // TODO: integrate with backend / email service
    console.log("Form submitted:", form);
    setForm(INITIAL_FORM);
  };

  return { form, handleChange, handleSubmit };
};

export default useContactForm;
