import { useState, useEffect } from "react";
import { User, Mail, Phone, Hash, FileText } from "lucide-react";

const FIELD_ICONS = {
  name: User,
  email: Mail,
  phone: Phone,
  phone_number: Phone,
};

const FIELD_LABELS = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  phone_number: "Phone Number",
};

const ContactForm = ({
  data_fields = ["name", "email", "phone"],
  onSubmit, // Should handle the API call or state update
  subtitle = "Please enter your details to continue chatting with us.",
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Initialize form data with empty strings for all expected fields
    const initialData = {};
    const initialErrors = {};
    data_fields.forEach((field) => {
      initialData[field] = "";
      initialErrors[field] = "";
    });
    setFormData(initialData);
    setFormErrors(initialErrors);
  }, [data_fields]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {};
    let hasErrors = false;

    data_fields.forEach((field) => {
      const value = formData[field]?.trim();
      if (!value) {
        errors[field] = `${FIELD_LABELS[field] || field} is required`;
        hasErrors = true;
      } else if (field === "email" && !validateEmail(value)) {
        errors[field] = "Please enter a valid email";
        hasErrors = true;
      }
    });

    setFormErrors(errors);

    if (!hasErrors) {
      onSubmit(formData);
    }
  };

  const getIcon = (field) => {
    const Icon = FIELD_ICONS[field.toLowerCase()] || FileText;
    return (
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    );
  };

  const getInputType = (field) => {
    if (field.toLowerCase() === "email") return "email";
    if (field.toLowerCase().includes("phone")) return "tel";
    return "text";
  };

  return (
    <form
      className="p-4 bg-white rounded-2xl border-t border-slate-100 flex flex-col gap-3 animate-in slide-in-from-bottom duration-700 ease-out"
      onSubmit={handleSubmit}
    >
      <p className="text-xs text-slate-500 mb-2">{subtitle}</p>

      <div className="space-y-4">
        {data_fields.map((field) => (
          <div key={field} className="relative">
            {getIcon(field)}
            <input
              type={getInputType(field)}
              placeholder={
                FIELD_LABELS[field] ||
                field.charAt(0).toUpperCase() + field.slice(1)
              }
              value={formData[field] || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, [field]: e.target.value }))
              }
              disabled={isSubmitting}
              className={`
                w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all
                focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-100
                ${formErrors[field] ? "border-red-500 focus:border-red-500" : ""}
                disabled:opacity-50
              `}
            />
            {formErrors[field] && (
              <span className="text-[10px] text-red-500 absolute -bottom-4 left-1">
                {formErrors[field]}
              </span>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          mt-4 w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-medium transition-all
          ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"}
        `}
      >
        {isSubmitting ? "Submitting..." : "Start Chatting"}
      </button>
    </form>
  );
};

export default ContactForm;
