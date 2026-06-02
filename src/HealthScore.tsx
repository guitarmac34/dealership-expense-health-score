import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2, TrendingDown } from "lucide-react";
import QUESTIONS from "./config/questions.json";
import {
  calculateResults,
  formatCurrency,
  formatPercent,
  buildCategoryBreakdown,
  getRooftopLabel,
  type Answer,
} from "./lib/scoring";
import ContactGate, { type ContactInfo } from "./ContactGate";

const COLORS = {
  navy: "#1A3158",
  navyLight: "#243d6a",
  copper: "#B07030",
  copperLight: "#c8944e",
  gold: "#D49B2D",
  green: "#27AE60",
  red: "#C0392B",
  yellow: "#F39C12",
  lightBg: "#F7F9FC",
  cardBg: "#FFFFFF",
  text: "#2C3E50",
  textLight: "#6B7C93",
  border: "#E2E8F0",
};

function getApiBase(): string {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "";
  }
  // Most reliable: the classic script currently executing IS our embed bundle,
  // so its origin is exactly where the backend lives. Valid during the IIFE's
  // synchronous execution even when loaded `async`.
  const current = document.currentScript as HTMLScriptElement | null;
  if (current?.src) {
    try {
      return new URL(current.src).origin;
    } catch {
      /* fall through */
    }
  }
  // Fallback: match our specific bundle filename — NOT a loose "embed"
  // substring, which falsely matches third-party scripts like HubSpot's
  // js.usemessages.com tracking embed and sends the POST to the wrong origin.
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    'script[src*="embed.iife.js"]'
  );
  for (const s of scripts) {
    if (s.src) {
      try {
        return new URL(s.src).origin;
      } catch {
        /* fall through */
      }
    }
  }
  // Durable fallback: the backend always lives at this fixed production
  // domain. If a WP cache/CDN plugin renames or proxies the script so neither
  // detection above resolves, we must NOT return "" — a relative POST would
  // hit the WordPress origin (no /api route, no CORS) and fail with 405/CORS.
  return "https://dealership-expense-health-score.vercel.app";
}
const API_BASE = getApiBase();

interface HealthScoreProps {
  ctaUrl?: string;
}

export default function HealthScore({
  ctaUrl = "https://strategicsource.com/contact",
}: HealthScoreProps) {
  const [screen, setScreen] = useState<
    "intro" | "questions" | "contact" | "results"
  >("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(
    Array(QUESTIONS.length).fill(null)
  );
  const [spendInput, setSpendInput] = useState<string>("");
  const [direction, setDirection] = useState(1);
  const [showSkipped, setShowSkipped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const question = QUESTIONS[currentQ] as {
    text: string;
    context: string;
    isRooftop?: boolean;
    isSpendInput?: boolean;
    categoryKey?: string;
    options?: { label: string; factor: number }[];
  };

  const selectRooftop = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
  };

  const commitSpend = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = value;
    setAnswers(newAnswers);
    return newAnswers;
  };

  const handleSpendChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    setSpendInput(cleaned);
  };

  const goNext = () => {
    if (question.isSpendInput) {
      const numeric = spendInput === "" ? 0 : Number(spendInput);
      commitSpend(isNaN(numeric) ? 0 : numeric);
    }
    setSpendInput("");
    if (currentQ < QUESTIONS.length - 1) {
      setDirection(1);
      setCurrentQ(currentQ + 1);
      // Restore prior spend if present
      const nextRaw = answers[currentQ + 1];
      if (typeof nextRaw === "number" && nextRaw > 0) {
        setSpendInput(String(nextRaw));
      } else {
        setSpendInput("");
      }
    } else {
      scrollToTop();
      setScreen("contact");
    }
  };

  const skipQuestion = () => {
    commitSpend(0);
    setSpendInput("");
    if (currentQ < QUESTIONS.length - 1) {
      setDirection(1);
      setCurrentQ(currentQ + 1);
    } else {
      scrollToTop();
      setScreen("contact");
    }
  };

  const goBack = () => {
    if (currentQ > 0) {
      // Save the in-progress spend input before going back
      if (question.isSpendInput && spendInput !== "") {
        commitSpend(Number(spendInput) || 0);
      }
      setDirection(-1);
      const prev = currentQ - 1;
      setCurrentQ(prev);
      const prevAns = answers[prev];
      if (
        (QUESTIONS[prev] as { isSpendInput?: boolean }).isSpendInput &&
        typeof prevAns === "number" &&
        prevAns > 0
      ) {
        setSpendInput(String(prevAns));
      } else {
        setSpendInput("");
      }
    }
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const startAssessment = () => {
    setScreen("questions");
    scrollToTop();
  };

  const handleContactSubmit = async (contact: ContactInfo) => {
    const results = calculateResults(answers);
    const rooftopIdx = (answers[0] as number | null) ?? null;

    const payload = {
      ...contact,
      rooftopCount: results.rooftopCount,
      rooftopLabel: getRooftopLabel(rooftopIdx),
      totalCurrentSpend: Math.round(results.totalSpend),
      totalNewSpend: Math.round(results.totalNewSpend),
      totalEstimatedSavings: Math.round(results.totalSavings),
      bottomLineNetProfitImpact: Math.round(results.totalNetProfit),
      categoryBreakdown: buildCategoryBreakdown(results.categories),
    };

    const response = await fetch(`${API_BASE}/api/submit-contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to submit contact");
    }

    scrollToTop();
    setScreen("results");
  };

  const results = screen === "results" ? calculateResults(answers) : null;

  const canAdvance = (() => {
    if (question.isRooftop) return answers[currentQ] !== null;
    if (question.isSpendInput) {
      // Allow advance if input has a value OR user has previously skipped (answer is 0)
      if (spendInput !== "" && !isNaN(Number(spendInput))) return true;
      return answers[currentQ] === 0;
    }
    return false;
  })();

  return (
    <div
      ref={containerRef}
      className="ss-min-h-screen"
      style={{
        backgroundColor: COLORS.lightBg,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {screen === "questions" && (
        <div
          className="ss-sticky ss-top-0 ss-z-30 ss-bg-white ss-border-b ss-px-4 ss-py-3"
          style={{ borderColor: COLORS.border }}
        >
          <div className="ss-max-w-2xl ss-mx-auto">
            <div
              className="ss-flex ss-justify-between ss-text-sm ss-font-semibold ss-mb-2"
              style={{ color: COLORS.text }}
            >
              <span>
                Question {currentQ + 1} of {QUESTIONS.length}
              </span>
              <span>
                {Math.round(((currentQ + 1) / QUESTIONS.length) * 100)}%
              </span>
            </div>
            <div
              className="ss-w-full ss-h-2.5 ss-rounded-full ss-overflow-hidden"
              style={{ backgroundColor: COLORS.border }}
            >
              <div
                className="ss-h-full ss-rounded-full ss-transition-all ss-duration-500 ss-ease-out"
                style={{
                  width: `${((currentQ + 1) / QUESTIONS.length) * 100}%`,
                  background: `linear-gradient(to right, ${COLORS.copper}, ${COLORS.gold})`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="ss-max-w-3xl ss-mx-auto ss-px-4 ss-py-8 sm:ss-py-12">
        <div className="ss-text-center ss-mb-8">
          <h1
            className="ss-text-lg sm:ss-text-xl ss-font-bold ss-tracking-tight"
            style={{ color: COLORS.navy }}
          >
            Dealership Expense Savings Calculator
          </h1>
          <p
            className="ss-text-sm ss-mt-1"
            style={{ color: COLORS.textLight }}
          >
            Backed by sourcing data from 226 dealership groups
          </p>
        </div>

        {screen === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="ss-text-center"
          >
            <span
              className="ss-inline-block ss-text-xs ss-font-bold ss-uppercase ss-tracking-widest ss-px-4 ss-py-1.5 ss-rounded-full ss-mb-8"
              style={{
                backgroundColor: `${COLORS.copper}15`,
                color: COLORS.copper,
                border: `1px solid ${COLORS.copper}30`,
              }}
            >
              Free Assessment
            </span>
            <h2
              className="ss-text-3xl sm:ss-text-4xl ss-font-extrabold ss-mb-4"
              style={{ color: COLORS.navy }}
            >
              See How Much Your Dealership Group Could Save Across 10 Common Expense Categories
            </h2>
            <p
              className="ss-text-base sm:ss-text-lg ss-mb-10 ss-max-w-xl ss-mx-auto"
              style={{ color: COLORS.textLight }}
            >
              Enter your approximate annual spend in 10 categories. We'll show you your projected new annual spend, total savings, and the bottom-line net profit impact — using real average savings from 2,184 completed sourcing projects.
            </p>

            <div className="ss-grid ss-grid-cols-1 sm:ss-grid-cols-3 ss-gap-4 ss-mb-10">
              {[
                { value: "226", label: "Dealership Groups Benchmarked" },
                { value: "10", label: "High-Savings Expense Categories" },
                { value: "2,184", label: "Sourcing Projects Completed" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="ss-bg-white ss-rounded-2xl ss-p-5 ss-border ss-text-center"
                  style={{ borderColor: COLORS.border }}
                >
                  <div
                    className="ss-text-3xl ss-font-extrabold"
                    style={{ color: COLORS.navy }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="ss-text-sm ss-mt-1"
                    style={{ color: COLORS.textLight }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={startAssessment}
              className="ss-inline-flex ss-items-center ss-gap-2 ss-text-white ss-font-bold ss-text-lg ss-px-8 ss-py-4 ss-rounded-xl ss-transition-all hover:ss--translate-y-0.5 ss-shadow-lg ss-cursor-pointer"
              style={{ backgroundColor: COLORS.copper }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = COLORS.copperLight)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = COLORS.copper)
              }
            >
              Start Your Assessment <ArrowRight className="ss-w-5 ss-h-5" />
            </button>
          </motion.div>
        )}

        {screen === "questions" && (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQ}
              custom={direction}
              initial={{ opacity: 0, y: direction > 0 ? 30 : -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction > 0 ? -30 : 30 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="ss-bg-white ss-rounded-2xl ss-p-6 sm:ss-p-10 ss-border ss-shadow-sm"
                style={{ borderColor: COLORS.border }}
              >
                <div
                  className="ss-text-xs ss-font-bold ss-uppercase ss-tracking-widest ss-mb-3"
                  style={{ color: COLORS.copper }}
                >
                  Question {currentQ + 1}
                </div>
                <h3
                  className="ss-text-xl sm:ss-text-[22px] ss-font-bold ss-mb-3 ss-leading-snug"
                  style={{ color: COLORS.navy }}
                >
                  {question.text}
                </h3>
                <p
                  className="ss-text-sm ss-mb-6 ss-leading-relaxed"
                  style={{ color: COLORS.textLight }}
                >
                  {question.context}
                </p>

                {question.isRooftop && question.options && (
                  <div className="ss-space-y-3">
                    {question.options.map((opt, oi) => {
                      const selected = answers[currentQ] === oi;
                      return (
                        <button
                          key={oi}
                          onClick={() => selectRooftop(oi)}
                          className="ss-w-full ss-flex ss-items-center ss-gap-4 ss-p-4 ss-rounded-xl ss-border-2 ss-text-left ss-transition-all ss-cursor-pointer"
                          style={{
                            borderColor: selected
                              ? COLORS.copper
                              : COLORS.border,
                            backgroundColor: selected
                              ? `${COLORS.copper}08`
                              : "white",
                          }}
                        >
                          <div
                            className="ss-w-5 ss-h-5 ss-rounded-full ss-border-2 ss-flex ss-items-center ss-justify-center ss-shrink-0 ss-transition-all"
                            style={{
                              borderColor: selected ? COLORS.copper : "#cbd5e1",
                            }}
                          >
                            {selected && (
                              <div
                                className="ss-w-2.5 ss-h-2.5 ss-rounded-full"
                                style={{ backgroundColor: COLORS.copper }}
                              />
                            )}
                          </div>
                          <span
                            className="ss-font-medium ss-text-sm sm:ss-text-base"
                            style={{ color: COLORS.text }}
                          >
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {question.isSpendInput && (
                  <div>
                    <label
                      className="ss-block ss-text-xs ss-font-semibold ss-uppercase ss-tracking-wider ss-mb-2"
                      style={{ color: COLORS.textLight }}
                    >
                      Approximate annual spend (USD)
                    </label>
                    <div
                      className="ss-relative ss-flex ss-items-center ss-rounded-xl ss-border-2 ss-transition-all"
                      style={{
                        borderColor:
                          spendInput !== "" ? COLORS.copper : COLORS.border,
                        backgroundColor:
                          spendInput !== "" ? `${COLORS.copper}05` : "white",
                      }}
                    >
                      <span
                        className="ss-pl-5 ss-pr-2 ss-text-2xl ss-font-bold"
                        style={{ color: COLORS.navy }}
                      >
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoFocus
                        value={
                          spendInput === ""
                            ? ""
                            : Number(spendInput).toLocaleString("en-US")
                        }
                        placeholder="0"
                        onChange={(e) => handleSpendChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && canAdvance) goNext();
                        }}
                        className="ss-flex-1 ss-text-2xl ss-font-bold ss-py-4 ss-pr-5 ss-bg-transparent ss-outline-none"
                        style={{ color: COLORS.text }}
                      />
                    </div>
                    <button
                      onClick={skipQuestion}
                      className="ss-mt-3 ss-text-sm ss-font-medium ss-underline ss-cursor-pointer"
                      style={{ color: COLORS.textLight }}
                    >
                      I don't know / we don't use this category
                    </button>
                  </div>
                )}

                <div className="ss-flex ss-justify-between ss-mt-8">
                  {currentQ > 0 ? (
                    <button
                      onClick={goBack}
                      className="ss-inline-flex ss-items-center ss-gap-2 ss-font-semibold ss-text-sm ss-px-5 ss-py-2.5 ss-rounded-lg ss-transition-colors ss-cursor-pointer"
                      style={{ color: COLORS.textLight }}
                    >
                      <ArrowLeft className="ss-w-4 ss-h-4" /> Back
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    onClick={goNext}
                    disabled={!canAdvance}
                    className="ss-inline-flex ss-items-center ss-gap-2 ss-text-white ss-font-bold ss-px-6 ss-py-2.5 ss-rounded-lg ss-transition-all ss-cursor-pointer disabled:ss-opacity-40 disabled:ss-cursor-not-allowed"
                    style={{ backgroundColor: COLORS.copper }}
                    onMouseEnter={(e) => {
                      if (canAdvance)
                        e.currentTarget.style.backgroundColor =
                          COLORS.copperLight;
                    }}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = COLORS.copper)
                    }
                  >
                    {currentQ === QUESTIONS.length - 1
                      ? "See My Results"
                      : "Next"}{" "}
                    <ArrowRight className="ss-w-4 ss-h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {screen === "contact" && (
          <ContactGate onSubmit={handleContactSubmit} />
        )}

        {screen === "results" && results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="ss-space-y-6"
          >
            <div
              className="ss-rounded-2xl ss-p-8 sm:ss-p-10 ss-text-center ss-text-white"
              style={{
                background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight})`,
              }}
            >
              <div className="ss-text-xs ss-font-bold ss-uppercase ss-tracking-widest ss-mb-3 ss-opacity-70">
                Estimated Annual Savings
              </div>
              <div className="ss-text-5xl sm:ss-text-[64px] ss-font-extrabold ss-mb-2 ss-leading-none">
                {formatCurrency(results.totalSavings)}
              </div>
              <div className="ss-text-sm ss-opacity-80 ss-mt-3">
                Across {results.categoriesEntered} of 10 categories where you reported annual spend
              </div>
            </div>

            <div
              className="ss-bg-white ss-rounded-2xl ss-p-8 ss-border-2 ss-text-center"
              style={{ borderColor: COLORS.copper }}
            >
              <TrendingDown
                className="ss-w-8 ss-h-8 ss-mx-auto ss-mb-2"
                style={{ color: COLORS.copper }}
              />
              <div
                className="ss-text-xs ss-font-bold ss-uppercase ss-tracking-widest ss-mb-2"
                style={{ color: COLORS.copper }}
              >
                Bottom-Line Net Profit Impact
              </div>
              <div
                className="ss-text-4xl sm:ss-text-5xl ss-font-extrabold ss-mb-3"
                style={{ color: COLORS.navy }}
              >
                {formatCurrency(results.totalNetProfit)}
              </div>
              <p
                className="ss-text-sm ss-max-w-lg ss-mx-auto"
                style={{ color: COLORS.textLight }}
              >
                Because expense reductions flow nearly dollar-for-dollar to net profit, <strong>99% of your savings</strong> drop straight to your bottom line.
              </p>
            </div>

            <div className="ss-grid ss-grid-cols-2 ss-gap-4">
              <div
                className="ss-bg-white ss-rounded-2xl ss-p-5 ss-border ss-text-center"
                style={{ borderColor: COLORS.border }}
              >
                <div
                  className="ss-text-xs ss-font-semibold ss-uppercase ss-tracking-wider ss-mb-2"
                  style={{ color: COLORS.textLight }}
                >
                  Current Annual Spend
                </div>
                <div
                  className="ss-text-2xl sm:ss-text-3xl ss-font-extrabold"
                  style={{ color: COLORS.text }}
                >
                  {formatCurrency(results.totalSpend)}
                </div>
              </div>
              <div
                className="ss-bg-white ss-rounded-2xl ss-p-5 ss-border ss-text-center"
                style={{ borderColor: COLORS.border }}
              >
                <div
                  className="ss-text-xs ss-font-semibold ss-uppercase ss-tracking-wider ss-mb-2"
                  style={{ color: COLORS.textLight }}
                >
                  Projected New Spend
                </div>
                <div
                  className="ss-text-2xl sm:ss-text-3xl ss-font-extrabold"
                  style={{ color: COLORS.green }}
                >
                  {formatCurrency(results.totalNewSpend)}
                </div>
              </div>
            </div>

            <div
              className="ss-bg-white ss-rounded-2xl ss-border ss-overflow-hidden"
              style={{ borderColor: COLORS.border }}
            >
              <div
                className="ss-px-6 ss-py-4 ss-border-b"
                style={{ borderColor: COLORS.border }}
              >
                <h4 className="ss-font-bold" style={{ color: COLORS.navy }}>
                  Savings Breakdown by Category
                </h4>
              </div>

              {/* Desktop table */}
              <div className="ss-hidden sm:ss-block ss-overflow-x-auto">
                <table className="ss-w-full ss-text-sm">
                  <thead>
                    <tr style={{ backgroundColor: COLORS.lightBg }}>
                      <th
                        className="ss-text-left ss-px-4 ss-py-3 ss-font-semibold"
                        style={{ color: COLORS.textLight }}
                      >
                        Category
                      </th>
                      <th
                        className="ss-text-right ss-px-4 ss-py-3 ss-font-semibold"
                        style={{ color: COLORS.textLight }}
                      >
                        Current Spend
                      </th>
                      <th
                        className="ss-text-right ss-px-4 ss-py-3 ss-font-semibold"
                        style={{ color: COLORS.textLight }}
                      >
                        New Spend
                      </th>
                      <th
                        className="ss-text-right ss-px-4 ss-py-3 ss-font-semibold"
                        style={{ color: COLORS.textLight }}
                      >
                        Savings
                      </th>
                      <th
                        className="ss-text-right ss-px-4 ss-py-3 ss-font-semibold"
                        style={{ color: COLORS.textLight }}
                      >
                        Avg %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.categories.map((cat) => (
                      <tr
                        key={cat.key}
                        className="ss-border-t"
                        style={{ borderColor: COLORS.border }}
                      >
                        <td
                          className="ss-px-4 ss-py-3 ss-font-medium"
                          style={{ color: COLORS.text }}
                        >
                          {cat.name}
                        </td>
                        <td
                          className="ss-text-right ss-px-4 ss-py-3"
                          style={{ color: COLORS.text }}
                        >
                          {formatCurrency(cat.spend)}
                        </td>
                        <td
                          className="ss-text-right ss-px-4 ss-py-3"
                          style={{ color: COLORS.text }}
                        >
                          {formatCurrency(cat.newSpend)}
                        </td>
                        <td
                          className="ss-text-right ss-px-4 ss-py-3 ss-font-bold"
                          style={{ color: COLORS.green }}
                        >
                          {formatCurrency(cat.savings)}
                        </td>
                        <td
                          className="ss-text-right ss-px-4 ss-py-3"
                          style={{ color: COLORS.textLight }}
                        >
                          {formatPercent(cat.pctSaved)}
                        </td>
                      </tr>
                    ))}
                    <tr
                      className="ss-border-t-2"
                      style={{
                        borderColor: COLORS.navy,
                        backgroundColor: COLORS.lightBg,
                      }}
                    >
                      <td
                        className="ss-px-4 ss-py-3 ss-font-bold"
                        style={{ color: COLORS.navy }}
                      >
                        Total
                      </td>
                      <td
                        className="ss-text-right ss-px-4 ss-py-3 ss-font-bold"
                        style={{ color: COLORS.navy }}
                      >
                        {formatCurrency(results.totalSpend)}
                      </td>
                      <td
                        className="ss-text-right ss-px-4 ss-py-3 ss-font-bold"
                        style={{ color: COLORS.navy }}
                      >
                        {formatCurrency(results.totalNewSpend)}
                      </td>
                      <td
                        className="ss-text-right ss-px-4 ss-py-3 ss-font-bold"
                        style={{ color: COLORS.green }}
                      >
                        {formatCurrency(results.totalSavings)}
                      </td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="ss-block sm:ss-hidden">
                {results.categories.map((cat) => (
                  <div
                    key={cat.key}
                    className="ss-px-5 ss-py-4 ss-border-t"
                    style={{ borderColor: COLORS.border }}
                  >
                    <div className="ss-flex ss-justify-between ss-items-start ss-mb-2">
                      <div
                        className="ss-font-semibold"
                        style={{ color: COLORS.text }}
                      >
                        {cat.name}
                      </div>
                      <div
                        className="ss-text-xs ss-font-bold ss-px-2 ss-py-0.5 ss-rounded-full"
                        style={{
                          backgroundColor: `${COLORS.copper}15`,
                          color: COLORS.copper,
                        }}
                      >
                        {formatPercent(cat.pctSaved)}
                      </div>
                    </div>
                    <div
                      className="ss-grid ss-grid-cols-3 ss-gap-2 ss-text-xs"
                      style={{ color: COLORS.textLight }}
                    >
                      <div>
                        <div className="ss-mb-0.5">Current</div>
                        <div
                          className="ss-text-sm ss-font-bold"
                          style={{ color: COLORS.text }}
                        >
                          {formatCurrency(cat.spend)}
                        </div>
                      </div>
                      <div>
                        <div className="ss-mb-0.5">New</div>
                        <div
                          className="ss-text-sm ss-font-bold"
                          style={{ color: COLORS.text }}
                        >
                          {formatCurrency(cat.newSpend)}
                        </div>
                      </div>
                      <div>
                        <div className="ss-mb-0.5">Savings</div>
                        <div
                          className="ss-text-sm ss-font-bold"
                          style={{ color: COLORS.green }}
                        >
                          {formatCurrency(cat.savings)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  className="ss-px-5 ss-py-4 ss-border-t-2"
                  style={{
                    borderColor: COLORS.navy,
                    backgroundColor: COLORS.lightBg,
                  }}
                >
                  <div className="ss-flex ss-justify-between ss-items-center">
                    <span
                      className="ss-font-bold"
                      style={{ color: COLORS.navy }}
                    >
                      Total Savings
                    </span>
                    <span
                      className="ss-text-lg ss-font-extrabold"
                      style={{ color: COLORS.green }}
                    >
                      {formatCurrency(results.totalSavings)}
                    </span>
                  </div>
                </div>
              </div>

              {results.skippedCategories.length > 0 && (
                <div
                  className="ss-border-t ss-px-6 ss-py-4"
                  style={{ borderColor: COLORS.border }}
                >
                  <button
                    onClick={() => setShowSkipped(!showSkipped)}
                    className="ss-text-sm ss-font-semibold ss-cursor-pointer"
                    style={{ color: COLORS.textLight }}
                  >
                    {showSkipped ? "Hide" : "Show"} {results.skippedCategories.length} skipped {results.skippedCategories.length === 1 ? "category" : "categories"}
                  </button>
                  {showSkipped && (
                    <ul
                      className="ss-mt-3 ss-space-y-1 ss-text-sm"
                      style={{ color: COLORS.textLight }}
                    >
                      {results.skippedCategories.map((cat) => (
                        <li key={cat.key} className="ss-flex ss-justify-between">
                          <span>{cat.name}</span>
                          <span>
                            avg {formatPercent(cat.pctSaved)} savings
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div
              className="ss-bg-white ss-rounded-2xl ss-p-8 sm:ss-p-10 ss-border-2 ss-text-center"
              style={{ borderColor: COLORS.copper }}
            >
              <CheckCircle2
                className="ss-w-10 ss-h-10 ss-mx-auto ss-mb-4"
                style={{ color: COLORS.copper }}
              />
              <h4
                className="ss-text-xl sm:ss-text-2xl ss-font-extrabold ss-mb-3"
                style={{ color: COLORS.navy }}
              >
                Want to See the Real Numbers for Your Group?
              </h4>
              <p
                className="ss-text-sm sm:ss-text-base ss-mb-6 ss-max-w-lg ss-mx-auto"
                style={{ color: COLORS.textLight }}
              >
                Your estimate is based on averages from 226 dealership groups. A Spend Map gives you the exact numbers for your stores — no obligation, no disruption to operations.
              </p>
              <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
                <button
                  className="ss-inline-flex ss-items-center ss-gap-2 ss-text-white ss-font-bold ss-text-lg ss-px-8 ss-py-4 ss-rounded-xl ss-transition-all hover:ss--translate-y-0.5 ss-shadow-lg ss-cursor-pointer"
                  style={{ backgroundColor: COLORS.navy }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = COLORS.navyLight)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = COLORS.navy)
                  }
                >
                  Schedule a Free Review <ArrowRight className="ss-w-5 ss-h-5" />
                </button>
              </a>
            </div>

            <p
              className="ss-text-xs ss-text-center ss-px-4 ss-pb-4"
              style={{ color: COLORS.textLight }}
            >
              Savings estimates use average percentage-saved data from 2,184 sourcing projects across 226 dealership groups. Actual results vary by group size, geography, and current vendor relationships. StrategicSource has reviewed $3B+ in dealership spend across 150+ expense categories.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
