import { useState } from "react";
import { User, Mail, Phone } from "lucide-react";

const ContactForm = ({
  onSubmit,
  subtitle = "Please enter your details to continue chatting with us.",
}) => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = { name: "", email: "", phone: "" };

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    setFormErrors(errors);

    if (!errors.name && !errors.email && !errors.phone) {
      onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });
    }
  };

  return (
    <form
      className="p-4 bg-white rounded-2xl border-t border-slate-100 flex flex-col gap-3 animate-in slide-in-from-bottom duration-700 ease-out"
      onSubmit={handleSubmit}
    >
      {/* <div className="text-sm font-medium text-slate-800">{title}</div> */}
      <p className="text-xs text-slate-500 mb-2">{subtitle}</p>

      <div className="space-y-3">
        {/* Name Field */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className={`
              w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all
              focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-100
              ${formErrors.name ? "border-red-500 focus:border-red-500" : ""}
            `}
          />
          {formErrors.name && (
            <span className="text-[10px] text-red-500 absolute -bottom-3 left-1">
              {formErrors.name}
            </span>
          )}
        </div>

        {/* Email Field */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className={`
              w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all
              focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-100
              ${formErrors.email ? "border-red-500 focus:border-red-500" : ""}
            `}
          />
          {formErrors.email && (
            <span className="text-[10px] text-red-500 absolute -bottom-3 left-1">
              {formErrors.email}
            </span>
          )}
        </div>

        {/* Phone Field */}
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            className={`
              w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all
              focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-100
              ${formErrors.phone ? "border-red-500 focus:border-red-500" : ""}
            `}
          />
          {formErrors.phone && (
            <span className="text-[10px] text-red-500 absolute -bottom-3 left-1">
              {formErrors.phone}
            </span>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="mt-2 w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Start Chatting
      </button>
    </form>
  );
};

export default ContactForm;
