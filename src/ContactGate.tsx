import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";

const COLORS = {
  navy: "#1A3158",
  navyLight: "#243d6a",
  copper: "#B07030",
  copperLight: "#c8944e",
  text: "#2C3E50",
  textLight: "#6B7C93",
  border: "#E2E8F0",
};

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
}

interface ContactGateProps {
  onSubmit: (contact: ContactInfo) => Promise<void>;
}

export default function ContactGate({ onSubmit }: ContactGateProps) {
  const [form, setForm] = useState<ContactInfo>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.company.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const inputStyle = {
    borderColor: COLORS.border,
    color: COLORS.text,
    outline: "none",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ss-text-center"
    >
      <div
        className="ss-bg-white ss-rounded-2xl ss-p-6 sm:ss-p-10 ss-border ss-shadow-sm"
        style={{ borderColor: COLORS.border }}
      >
        <div
          className="ss-inline-flex ss-items-center ss-gap-2 ss-text-xs ss-font-bold ss-uppercase ss-tracking-widest ss-px-4 ss-py-1.5 ss-rounded-full ss-mb-6"
          style={{
            backgroundColor: `${COLORS.copper}15`,
            color: COLORS.copper,
            border: `1px solid ${COLORS.copper}30`,
          }}
        >
          <ShieldCheck className="ss-w-3.5 ss-h-3.5" />
          Almost There
        </div>

        <h3
          className="ss-text-xl sm:ss-text-2xl ss-font-extrabold ss-mb-2"
          style={{ color: COLORS.navy }}
        >
          See Your Personalized Results
        </h3>
        <p
          className="ss-text-sm sm:ss-text-base ss-mb-8 ss-max-w-md ss-mx-auto"
          style={{ color: COLORS.textLight }}
        >
          Enter your information below to unlock your Expense Health Score and
          estimated annual savings breakdown.
        </p>

        <form
          onSubmit={handleSubmit}
          className="ss-space-y-4 ss-max-w-md ss-mx-auto ss-text-left"
        >
          <div className="ss-grid ss-grid-cols-1 sm:ss-grid-cols-2 ss-gap-4">
            <div>
              <label
                className="ss-block ss-text-xs ss-font-semibold ss-mb-1.5 ss-uppercase ss-tracking-wide"
                style={{ color: COLORS.text }}
              >
                First Name <span style={{ color: "#C0392B" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                className="ss-w-full ss-px-4 ss-py-3 ss-rounded-xl ss-border-2 ss-text-sm focus:ss-border-[#B07030] ss-transition-colors"
                style={inputStyle}
                placeholder="John"
              />
            </div>
            <div>
              <label
                className="ss-block ss-text-xs ss-font-semibold ss-mb-1.5 ss-uppercase ss-tracking-wide"
                style={{ color: COLORS.text }}
              >
                Last Name <span style={{ color: "#C0392B" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="ss-w-full ss-px-4 ss-py-3 ss-rounded-xl ss-border-2 ss-text-sm focus:ss-border-[#B07030] ss-transition-colors"
                style={inputStyle}
                placeholder="Smith"
              />
            </div>
          </div>

          <div>
            <label
              className="ss-block ss-text-xs ss-font-semibold ss-mb-1.5 ss-uppercase ss-tracking-wide"
              style={{ color: COLORS.text }}
            >
              Work Email <span style={{ color: "#C0392B" }}>*</span>
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="ss-w-full ss-px-4 ss-py-3 ss-rounded-xl ss-border-2 ss-text-sm focus:ss-border-[#B07030] ss-transition-colors"
              style={inputStyle}
              placeholder="john@dealershipgroup.com"
            />
          </div>

          <div>
            <label
              className="ss-block ss-text-xs ss-font-semibold ss-mb-1.5 ss-uppercase ss-tracking-wide"
              style={{ color: COLORS.text }}
            >
              Dealership Group Name{" "}
              <span style={{ color: "#C0392B" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="ss-w-full ss-px-4 ss-py-3 ss-rounded-xl ss-border-2 ss-text-sm focus:ss-border-[#B07030] ss-transition-colors"
              style={inputStyle}
              placeholder="ABC Auto Group"
            />
          </div>

          <div>
            <label
              className="ss-block ss-text-xs ss-font-semibold ss-mb-1.5 ss-uppercase ss-tracking-wide"
              style={{ color: COLORS.text }}
            >
              Phone{" "}
              <span className="ss-font-normal ss-normal-case ss-tracking-normal" style={{ color: COLORS.textLight }}>
                (optional)
              </span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="ss-w-full ss-px-4 ss-py-3 ss-rounded-xl ss-border-2 ss-text-sm focus:ss-border-[#B07030] ss-transition-colors"
              style={inputStyle}
              placeholder="(555) 123-4567"
            />
          </div>

          {error && (
            <p className="ss-text-sm ss-text-center" style={{ color: "#C0392B" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid || submitting}
            className="ss-w-full ss-inline-flex ss-items-center ss-justify-center ss-gap-2 ss-text-white ss-font-bold ss-text-lg ss-px-8 ss-py-4 ss-rounded-xl ss-transition-all hover:ss--translate-y-0.5 ss-shadow-lg ss-cursor-pointer disabled:ss-opacity-40 disabled:ss-cursor-not-allowed"
            style={{ backgroundColor: COLORS.copper }}
            onMouseEnter={(e) => {
              if (isValid && !submitting)
                e.currentTarget.style.backgroundColor = COLORS.copperLight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.copper;
            }}
          >
            {submitting ? (
              <>
                <Loader2 className="ss-w-5 ss-h-5 ss-animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                See My Results <ArrowRight className="ss-w-5 ss-h-5" />
              </>
            )}
          </button>
        </form>

        <p
          className="ss-text-xs ss-mt-6 ss-max-w-sm ss-mx-auto"
          style={{ color: COLORS.textLight }}
        >
          Your information is used only to deliver your results and will not be
          shared with third parties.
        </p>
      </div>
    </motion.div>
  );
}
