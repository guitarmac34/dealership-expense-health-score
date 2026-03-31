import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import QUESTIONS from "./config/questions.json";
import {
  calculateResults,
  getGradeLabel,
  getGradeSummary,
  formatCurrency,
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

// Detect API base from the embed script's origin
function getApiBase(): string {
  // In dev mode, API is on the same origin
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "";
  }
  // Find our script tag by looking for the embed script
  const scripts = document.querySelectorAll('script[src*="embed"]');
  for (const s of scripts) {
    const src = (s as HTMLScriptElement).src;
    if (src.includes("embed")) {
      return new URL(src).origin;
    }
  }
  return "";
}
const API_BASE = getApiBase();

function ScoreRing({ score, size = 180 }: { score: number; size?: number }) {
  const [animated, setAnimated] = useState(false);
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70 ? COLORS.green : score >= 40 ? COLORS.yellow : COLORS.red;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="ss-relative ss-inline-flex ss-items-center ss-justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="ss--rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? offset : circumference}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
      </svg>
      <div className="ss-absolute ss-inset-0 ss-flex ss-flex-col ss-items-center ss-justify-center">
        <span
          className="ss-text-5xl sm:ss-text-[48px] ss-font-extrabold"
          style={{ color }}
        >
          {score}
        </span>
        <span
          className="ss-text-xs ss-font-semibold ss-uppercase ss-tracking-wider"
          style={{ color: COLORS.textLight }}
        >
          out of 100
        </span>
      </div>
    </div>
  );
}

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
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(QUESTIONS.length).fill(null)
  );
  const [direction, setDirection] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectOption = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
  };

  const goNext = () => {
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
      setDirection(-1);
      setCurrentQ(currentQ - 1);
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

    const payload = {
      ...contact,
      healthScore: results.score,
      estimatedSavings: Math.round(results.totalSavings),
      rooftopCount: results.rooftopCount,
      gradeLabel: getGradeLabel(results.score),
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

  const statusBadge = (status: "good" | "review" | "risk") => {
    const config = {
      good: { label: "On Track", bg: "#e8f5e9", color: COLORS.green },
      review: { label: "Needs Review", bg: "#fff8e1", color: COLORS.yellow },
      risk: { label: "At Risk", bg: "#fdecea", color: COLORS.red },
    };
    const c = config[status];
    return (
      <span
        className="ss-text-xs ss-font-bold ss-px-2.5 ss-py-1 ss-rounded-full ss-whitespace-nowrap"
        style={{ backgroundColor: c.bg, color: c.color }}
      >
        {c.label}
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      className="ss-min-h-screen"
      style={{
        backgroundColor: COLORS.lightBg,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{ backgroundColor: COLORS.navy }}
        className="ss-py-5 ss-px-4 ss-text-center ss-text-white"
      >
        <a
          href="https://strategicsource.com"
          className="ss-inline-block ss-mb-1"
        >
          <img
            src="https://strategicsource.com/wp-content/uploads/2023/01/logo.jpg"
            alt="StrategicSource"
            className="ss-h-6 ss-mx-auto ss-brightness-0 ss-invert ss-opacity-90 ss-mb-2"
          />
        </a>
        <h1 className="ss-text-lg sm:ss-text-xl ss-font-bold ss-tracking-tight">
          Dealership Expense Health Score
        </h1>
        <p className="ss-text-sm ss-opacity-70 ss-mt-1">
          A 2-minute assessment backed by data from 226 dealership groups
        </p>
      </div>

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

      <div className="ss-max-w-2xl ss-mx-auto ss-px-4 ss-py-8 sm:ss-py-12">
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
              How Much Are You Overspending Across Your Dealership Group?
            </h2>
            <p
              className="ss-text-base sm:ss-text-lg ss-mb-10 ss-max-w-xl ss-mx-auto"
              style={{ color: COLORS.textLight }}
            >
              Most dealership groups overspend by 25% in categories they've
              never reviewed. Answer 10 questions to get your personalized
              Expense Health Score and estimated annual savings.
            </p>

            <div className="ss-grid ss-grid-cols-1 sm:ss-grid-cols-3 ss-gap-4 ss-mb-10">
              {[
                { value: "226", label: "Dealership Groups Benchmarked" },
                { value: "188", label: "Expense Categories Analyzed" },
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
                  {QUESTIONS[currentQ].text}
                </h3>
                <p
                  className="ss-text-sm ss-mb-6 ss-leading-relaxed"
                  style={{ color: COLORS.textLight }}
                >
                  {QUESTIONS[currentQ].context}
                </p>

                <div className="ss-space-y-3">
                  {QUESTIONS[currentQ].options.map((opt, oi) => {
                    const selected = answers[currentQ] === oi;
                    return (
                      <button
                        key={oi}
                        onClick={() => selectOption(oi)}
                        className="ss-w-full ss-flex ss-items-center ss-gap-4 ss-p-4 ss-rounded-xl ss-border-2 ss-text-left ss-transition-all ss-cursor-pointer"
                        style={{
                          borderColor: selected ? COLORS.copper : COLORS.border,
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
                    disabled={answers[currentQ] === null}
                    className="ss-inline-flex ss-items-center ss-gap-2 ss-text-white ss-font-bold ss-px-6 ss-py-2.5 ss-rounded-lg ss-transition-all ss-cursor-pointer disabled:ss-opacity-40 disabled:ss-cursor-not-allowed"
                    style={{ backgroundColor: COLORS.copper }}
                    onMouseEnter={(e) => {
                      if (answers[currentQ] !== null)
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
              className="ss-bg-white ss-rounded-2xl ss-p-8 sm:ss-p-10 ss-border ss-text-center"
              style={{ borderColor: COLORS.border }}
            >
              <div className="ss-mb-4 ss-flex ss-justify-center">
                <ScoreRing
                  score={results.score}
                  size={
                    typeof window !== "undefined" && window.innerWidth < 640
                      ? 140
                      : 180
                  }
                />
              </div>
              <h3
                className="ss-text-xl sm:ss-text-2xl ss-font-extrabold ss-mb-2"
                style={{
                  color:
                    results.score >= 70
                      ? COLORS.green
                      : results.score >= 40
                        ? COLORS.yellow
                        : COLORS.red,
                }}
              >
                {getGradeLabel(results.score)}
              </h3>
              <p
                className="ss-text-sm sm:ss-text-base ss-max-w-lg ss-mx-auto"
                style={{ color: COLORS.textLight }}
              >
                {getGradeSummary(results.score)}
              </p>
            </div>

            <div
              className="ss-rounded-2xl ss-p-8 sm:ss-p-10 ss-text-center ss-text-white"
              style={{
                background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight})`,
              }}
            >
              <div className="ss-text-xs ss-font-bold ss-uppercase ss-tracking-widest ss-mb-3 ss-opacity-70">
                Estimated Annual Savings Opportunity
              </div>
              <div className="ss-text-4xl sm:ss-text-[52px] ss-font-extrabold ss-mb-2">
                {formatCurrency(results.totalSavings)}
              </div>
              <div className="ss-text-sm ss-opacity-70">
                Based on {results.rooftopCount} rooftops and your current review
                status
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
                <h4
                  className="ss-font-bold"
                  style={{ color: COLORS.navy }}
                >
                  Savings Breakdown by Category
                </h4>
              </div>
              <div
                className="ss-divide-y"
                style={{ borderColor: COLORS.border }}
              >
                {results.categories.map((cat) => (
                  <div
                    key={cat.key}
                    className="ss-px-6 ss-py-4 ss-flex ss-items-center ss-justify-between ss-gap-4"
                  >
                    <div className="ss-min-w-0">
                      <div
                        className="ss-font-semibold ss-text-sm sm:ss-text-base ss-truncate"
                        style={{ color: COLORS.text }}
                      >
                        {cat.name}
                      </div>
                      <div
                        className="ss-text-xs ss-mt-0.5"
                        style={{ color: COLORS.textLight }}
                      >
                        Benchmarked across {cat.clients} dealership groups
                      </div>
                    </div>
                    <div className="ss-flex ss-items-center ss-gap-3 ss-shrink-0">
                      <span
                        className="ss-font-bold ss-text-sm sm:ss-text-base"
                        style={{ color: COLORS.green }}
                      >
                        {formatCurrency(cat.savings)}
                      </span>
                      {statusBadge(cat.status)}
                    </div>
                  </div>
                ))}
              </div>
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
                Want to See the Real Numbers?
              </h4>
              <p
                className="ss-text-sm sm:ss-text-base ss-mb-6 ss-max-w-lg ss-mx-auto"
                style={{ color: COLORS.textLight }}
              >
                Your Expense Health Score is based on benchmarks from 226
                dealership groups. A Spend Map gives you the exact numbers for
                your stores, with no obligation and no disruption to your
                operations.
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
              Savings estimates are based on aggregated benchmark data from 2,184
              sourcing projects across 226 dealership groups. Actual results vary
              by group size, geography, and current vendor relationships.
              StrategicSource has reviewed $3B+ in dealership spend across 150+
              expense categories.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
