import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

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

const BENCHMARKS: Record<string, { name: string; avgPerRoof: number; projects: number; clients: number }> = {
  creditCard: { name: "Credit Card Processing", avgPerRoof: 10283, projects: 129, clients: 76 },
  creditBureau: { name: "Credit Bureau", avgPerRoof: 4112, projects: 155, clients: 109 },
  shipping: { name: "Small Package Shipping", avgPerRoof: 4929, projects: 92, clients: 75 },
  vehicleHistory: { name: "Vehicle History Reports", avgPerRoof: 6655, projects: 63, clients: 48 },
  uniforms: { name: "Uniforms & Laundry", avgPerRoof: 4321, projects: 88, clients: 55 },
  autoParts: { name: "Auto Parts (Non-OE)", avgPerRoof: 4372, projects: 82, clients: 68 },
  shopSupplies: { name: "Shop Supplies", avgPerRoof: 3303, projects: 91, clients: 67 },
  officeSupplies: { name: "Office Supplies", avgPerRoof: 2734, projects: 89, clients: 71 },
  printedProducts: { name: "Printed Products", avgPerRoof: 2704, projects: 81, clients: 67 },
  treasury: { name: "Debt & Treasury Optimization", avgPerRoof: 120392, projects: 55, clients: 53 },
  apProcessing: { name: "Accounts Payable", avgPerRoof: 12610, projects: 16, clients: 14 },
  warranty: { name: "Warranty Recovery", avgPerRoof: 31694, projects: 10, clients: 7 },
  wotc: { name: "Work Opportunity Tax Credits", avgPerRoof: 4052, projects: 43, clients: 43 },
  propertyTax: { name: "Property Tax Reduction", avgPerRoof: 3389, projects: 27, clients: 26 },
  telecom: { name: "Telecom Services", avgPerRoof: 1516, projects: 31, clients: 31 },
  waste: { name: "Waste & Recycling", avgPerRoof: 1337, projects: 61, clients: 41 },
  janitorial: { name: "Janitorial Supplies", avgPerRoof: 1251, projects: 65, clients: 53 },
  mats: { name: "Mats & Carpets", avgPerRoof: 1318, projects: 71, clients: 57 },
};

interface QuestionOption {
  label: string;
  score: number;
  factor: number;
}

interface Question {
  id: number;
  text: string;
  context: string;
  categories: string[];
  options: QuestionOption[];
  isRooftop?: boolean;
  isCompliance?: boolean;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "How many rooftops does your group operate?",
    context: "This helps us scale the benchmark data to your size.",
    categories: [],
    isRooftop: true,
    options: [
      { label: "1 to 3 locations", score: 0, factor: 2 },
      { label: "4 to 10 locations", score: 0, factor: 7 },
      { label: "11 to 25 locations", score: 0, factor: 18 },
      { label: "26+ locations", score: 0, factor: 35 },
    ],
  },
  {
    id: 2,
    text: "When did you last competitively bid your credit card processing?",
    context: "Credit card processing is the #1 category by savings, averaging $82,000+ per project in Year 1 across 129 projects.",
    categories: ["creditCard"],
    options: [
      { label: "Within the past 12 months", score: 10, factor: 0 },
      { label: "1 to 2 years ago", score: 6, factor: 0.4 },
      { label: "3+ years ago", score: 2, factor: 0.8 },
      { label: "We've never bid it", score: 0, factor: 1.0 },
    ],
  },
  {
    id: 3,
    text: "Do you know what you're paying per credit pull across all your stores?",
    context: "Credit bureau costs affect 109 of the 226 dealership groups we've benchmarked. Most groups don't realize how much these vary by location.",
    categories: ["creditBureau"],
    options: [
      { label: "Yes, and we've negotiated it recently", score: 10, factor: 0 },
      { label: "I know the cost but haven't renegotiated", score: 5, factor: 0.5 },
      { label: "It varies store to store", score: 2, factor: 0.8 },
      { label: "I'm not sure what we pay", score: 0, factor: 1.0 },
    ],
  },
  {
    id: 4,
    text: "Have you reviewed your FedEx/UPS shipping agreements in the past 3 years?",
    context: "Shipping costs are one of the most commonly overlooked expense categories. We've completed 92 shipping projects saving an average of $39,000+ per year.",
    categories: ["shipping"],
    options: [
      { label: "Yes, within the last year", score: 10, factor: 0 },
      { label: "It's been 1 to 3 years", score: 4, factor: 0.6 },
      { label: "More than 3 years", score: 1, factor: 0.9 },
      { label: "Never reviewed them", score: 0, factor: 1.0 },
    ],
  },
  {
    id: 5,
    text: "Do you know your exact cost per vehicle for vehicle history reports (Carfax, AutoCheck)?",
    context: "Vehicle history is one of the highest per-project savings categories. 48 dealership groups have saved an average of $53,000+ in Year 1.",
    categories: ["vehicleHistory"],
    options: [
      { label: "Yes, and we've optimized it", score: 10, factor: 0 },
      { label: "I know the cost but haven't negotiated", score: 5, factor: 0.5 },
      { label: "I'm not sure of our exact cost", score: 1, factor: 0.85 },
      { label: "We just pay whatever the bill says", score: 0, factor: 1.0 },
    ],
  },
  {
    id: 6,
    text: "Have you audited your uniform/laundry contracts and non-OE parts costs in the past 2 years?",
    context: "Uniform contracts and aftermarket parts are two of the most frequent areas where vendors raise prices without notice. Combined, they account for 170 projects in our dataset.",
    categories: ["uniforms", "autoParts"],
    options: [
      { label: "Both reviewed in the past 2 years", score: 10, factor: 0 },
      { label: "Reviewed one but not the other", score: 5, factor: 0.5 },
      { label: "Neither reviewed recently", score: 1, factor: 0.85 },
      { label: "We've never reviewed either", score: 0, factor: 1.0 },
    ],
  },
  {
    id: 7,
    text: "How recently have you reviewed your office supplies, printed products, and shop supplies contracts?",
    context: "These three categories represent 261 completed projects. They're often viewed as small-dollar items, but they add up quickly across multiple rooftops.",
    categories: ["officeSupplies", "printedProducts", "shopSupplies"],
    options: [
      { label: "Reviewed within the past year", score: 10, factor: 0 },
      { label: "1 to 2 years ago", score: 5, factor: 0.5 },
      { label: "3+ years ago or never", score: 1, factor: 0.85 },
      { label: "We don't track these by category", score: 0, factor: 1.0 },
    ],
  },
  {
    id: 8,
    text: "Have you explored treasury optimization or floorplan/debt restructuring?",
    context: "Debt and treasury optimization is the single highest-savings category we review, with average Year 1 savings of $963,000+ per project. But it applies more to larger groups.",
    categories: ["treasury"],
    options: [
      { label: "Yes, optimized in the past 2 years", score: 10, factor: 0 },
      { label: "We've looked at it but didn't act", score: 5, factor: 0.4 },
      { label: "No, we haven't explored this", score: 1, factor: 0.7 },
      { label: "I didn't know this was an option", score: 0, factor: 0.85 },
    ],
  },
  {
    id: 9,
    text: "Do you conduct regular compliance audits to verify vendor invoices match contracted rates?",
    context: "In the past 6 months alone, we recovered $170,000+ in billing errors and overcharges for our clients through compliance audits. This is money you've already been charged incorrectly.",
    categories: [],
    isCompliance: true,
    options: [
      { label: "Yes, we audit quarterly", score: 10, factor: 0 },
      { label: "Occasionally, when something looks off", score: 4, factor: 0 },
      { label: "Rarely or never", score: 1, factor: 0 },
      { label: "We don't have a process for this", score: 0, factor: 0 },
    ],
  },
  {
    id: 10,
    text: "Of these 10 common expense categories, how many have you actively negotiated in the past 12 months?",
    context: "Credit cards, credit bureau, shipping, vehicle history, uniforms, auto parts, shop supplies, office supplies, printed products, and telecom. The average dealership group we work with finds savings in 15+ categories.",
    categories: ["wotc", "propertyTax", "telecom", "waste", "janitorial", "mats"],
    options: [
      { label: "8 to 10 categories", score: 10, factor: 0 },
      { label: "5 to 7 categories", score: 6, factor: 0.3 },
      { label: "2 to 4 categories", score: 3, factor: 0.6 },
      { label: "0 to 1 categories", score: 0, factor: 0.9 },
    ],
  },
];

function formatCurrency(amount: number): string {
  return "$" + Math.round(amount).toLocaleString("en-US");
}

function ScoreRing({ score, size = 180 }: { score: number; size?: number }) {
  const [animated, setAnimated] = useState(false);
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? COLORS.green : score >= 40 ? COLORS.yellow : COLORS.red;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={COLORS.border} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? offset : circumference}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl sm:text-[48px] font-extrabold" style={{ color }}>{score}</span>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.textLight }}>out of 100</span>
      </div>
    </div>
  );
}

interface CategoryResult {
  key: string;
  name: string;
  savings: number;
  status: "good" | "review" | "risk";
  clients: number;
}

function calculateResults(answers: (number | null)[]) {
  const rooftopIdx = answers[0] ?? 1;
  const rooftopCount = QUESTIONS[0].options[rooftopIdx].factor;

  let rawScore = 0;
  const categories: CategoryResult[] = [];

  for (let qi = 1; qi < QUESTIONS.length; qi++) {
    const q = QUESTIONS[qi];
    const ansIdx = answers[qi];
    if (ansIdx === null) continue;
    const opt = q.options[ansIdx];
    rawScore += opt.score;

    if (q.isCompliance) continue;

    for (const catKey of q.categories) {
      const bench = BENCHMARKS[catKey];
      if (!bench) continue;
      const savings = bench.avgPerRoof * rooftopCount * opt.factor;
      if (savings > 0) {
        const status: "good" | "review" | "risk" =
          opt.factor === 0 ? "good" : opt.factor < 0.5 ? "review" : "risk";
        categories.push({ key: catKey, name: bench.name, savings, status, clients: bench.clients });
      }
    }
  }

  let subtotal = categories.reduce((s, c) => s + c.savings, 0);

  const complianceIdx = answers[8];
  if (complianceIdx !== null && (complianceIdx === 2 || complianceIdx === 3)) {
    const complianceSavings = subtotal * 0.05;
    categories.push({
      key: "compliance",
      name: "Vendor Compliance Recovery",
      savings: complianceSavings,
      status: complianceIdx === 2 ? "review" : "risk",
      clients: 226,
    });
    subtotal += complianceSavings;
  }

  categories.sort((a, b) => b.savings - a.savings);
  const finalScore = Math.round((rawScore / 90) * 100);

  return { score: Math.min(finalScore, 100), totalSavings: subtotal, categories, rooftopCount };
}

function getGradeLabel(score: number): string {
  if (score >= 80) return "Strong Expense Management";
  if (score >= 60) return "Room for Improvement";
  if (score >= 35) return "Significant Savings Opportunity";
  return "Critical Attention Needed";
}

function getGradeSummary(score: number): string {
  if (score >= 80) return "Your dealership group is managing expenses better than most. There may still be opportunities in categories you haven't reviewed recently, but overall your practices are strong.";
  if (score >= 60) return "You're doing some things well, but there are clear gaps in your expense management. Several categories haven't been reviewed recently, and vendor pricing may have crept up without your knowledge.";
  if (score >= 35) return "Your assessment reveals multiple expense categories where you're likely overpaying significantly. Without competitive bidding and regular reviews, vendors have little incentive to offer you their best pricing.";
  return "Your dealership group has significant exposure across most major expense categories. Without intervention, you're likely leaving hundreds of thousands of dollars on the table every year.";
}

export default function HealthScore() {
  const [screen, setScreen] = useState<"intro" | "questions" | "results">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
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
      window.scrollTo({ top: 0, behavior: "smooth" });
      setScreen("results");
    }
  };

  const goBack = () => {
    if (currentQ > 0) {
      setDirection(-1);
      setCurrentQ(currentQ - 1);
    }
  };

  const startAssessment = () => {
    setScreen("questions");
    window.scrollTo({ top: 0 });
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
      <span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: c.bg, color: c.color }}>
        {c.label}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="min-h-screen" style={{ backgroundColor: COLORS.lightBg, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ backgroundColor: COLORS.navy }} className="py-5 px-4 text-center text-white">
        <Link href="/" className="inline-block mb-1">
          <img src="/images/logo.jpg" alt="StrategicSource" className="h-6 mx-auto brightness-0 invert opacity-90 mb-2" />
        </Link>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">Dealership Expense Health Score</h1>
        <p className="text-sm opacity-70 mt-1">A 2-minute assessment backed by data from 226 dealership groups</p>
      </div>

      {screen === "questions" && (
        <div className="sticky top-0 z-30 bg-white border-b px-4 py-3" style={{ borderColor: COLORS.border }}>
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between text-sm font-semibold mb-2" style={{ color: COLORS.text }}>
              <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
              <span>{Math.round(((currentQ + 1) / QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.border }}>
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${((currentQ + 1) / QUESTIONS.length) * 100}%`,
                  background: `linear-gradient(to right, ${COLORS.copper}, ${COLORS.gold})`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {screen === "intro" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8"
              style={{ backgroundColor: `${COLORS.copper}15`, color: COLORS.copper, border: `1px solid ${COLORS.copper}30` }}
              data-testid="badge-free-assessment"
            >
              Free Assessment
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: COLORS.navy }} data-testid="text-health-score-headline">
              How Much Are You Overspending Across Your Dealership Group?
            </h2>
            <p className="text-base sm:text-lg mb-10 max-w-xl mx-auto" style={{ color: COLORS.textLight }}>
              Most dealership groups overspend by 25% in categories they've never reviewed. Answer 10 questions to get your personalized Expense Health Score and estimated annual savings.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {[
                { value: "226", label: "Dealership Groups Benchmarked" },
                { value: "188", label: "Expense Categories Analyzed" },
                { value: "2,184", label: "Sourcing Projects Completed" },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border text-center" style={{ borderColor: COLORS.border }} data-testid={`stat-intro-${i}`}>
                  <div className="text-3xl font-extrabold" style={{ color: COLORS.navy }}>{stat.value}</div>
                  <div className="text-sm mt-1" style={{ color: COLORS.textLight }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <button
              onClick={startAssessment}
              className="inline-flex items-center gap-2 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg cursor-pointer"
              style={{ backgroundColor: COLORS.copper }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = COLORS.copperLight)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = COLORS.copper)}
              data-testid="button-start-assessment"
            >
              Start Your Assessment <ArrowRight className="w-5 h-5" />
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
              <div className="bg-white rounded-2xl p-6 sm:p-10 border shadow-sm" style={{ borderColor: COLORS.border }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: COLORS.copper }}>
                  Question {currentQ + 1}
                </div>
                <h3 className="text-xl sm:text-[22px] font-bold mb-3 leading-snug" style={{ color: COLORS.navy }} data-testid={`text-question-${currentQ + 1}`}>
                  {QUESTIONS[currentQ].text}
                </h3>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: COLORS.textLight }}>
                  {QUESTIONS[currentQ].context}
                </p>

                <div className="space-y-3">
                  {QUESTIONS[currentQ].options.map((opt, oi) => {
                    const selected = answers[currentQ] === oi;
                    return (
                      <button
                        key={oi}
                        onClick={() => selectOption(oi)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer"
                        style={{
                          borderColor: selected ? COLORS.copper : COLORS.border,
                          backgroundColor: selected ? `${COLORS.copper}08` : "white",
                        }}
                        data-testid={`option-q${currentQ + 1}-${oi}`}
                      >
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                          style={{ borderColor: selected ? COLORS.copper : "#cbd5e1" }}
                        >
                          {selected && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.copper }} />}
                        </div>
                        <span className="font-medium text-sm sm:text-base" style={{ color: COLORS.text }}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-8">
                  {currentQ > 0 ? (
                    <button
                      onClick={goBack}
                      className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                      style={{ color: COLORS.textLight }}
                      data-testid="button-back"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    onClick={goNext}
                    disabled={answers[currentQ] === null}
                    className="inline-flex items-center gap-2 text-white font-bold px-6 py-2.5 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: answers[currentQ] !== null ? COLORS.copper : COLORS.copper }}
                    onMouseEnter={e => { if (answers[currentQ] !== null) e.currentTarget.style.backgroundColor = COLORS.copperLight; }}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = COLORS.copper)}
                    data-testid="button-next"
                  >
                    {currentQ === QUESTIONS.length - 1 ? "See My Results" : "Next"} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {screen === "results" && results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <div className="bg-white rounded-2xl p-8 sm:p-10 border text-center" style={{ borderColor: COLORS.border }}>
              <div className="mb-4 flex justify-center">
                <ScoreRing score={results.score} size={typeof window !== "undefined" && window.innerWidth < 640 ? 140 : 180} />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-2" style={{ color: results.score >= 70 ? COLORS.green : results.score >= 40 ? COLORS.yellow : COLORS.red }} data-testid="text-grade-label">
                {getGradeLabel(results.score)}
              </h3>
              <p className="text-sm sm:text-base max-w-lg mx-auto" style={{ color: COLORS.textLight }}>
                {getGradeSummary(results.score)}
              </p>
            </div>

            <div className="rounded-2xl p-8 sm:p-10 text-center text-white" style={{ background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight})` }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-3 opacity-70">
                Estimated Annual Savings Opportunity
              </div>
              <div className="text-4xl sm:text-[52px] font-extrabold mb-2" data-testid="text-total-savings">
                {formatCurrency(results.totalSavings)}
              </div>
              <div className="text-sm opacity-70">
                Based on {results.rooftopCount} rooftops and your current review status
              </div>
            </div>

            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: COLORS.border }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: COLORS.border }}>
                <h4 className="font-bold" style={{ color: COLORS.navy }}>Savings Breakdown by Category</h4>
              </div>
              <div className="divide-y" style={{ borderColor: COLORS.border }}>
                {results.categories.map((cat, i) => (
                  <div key={cat.key} className="px-6 py-4 flex items-center justify-between gap-4" data-testid={`row-category-${i}`}>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm sm:text-base truncate" style={{ color: COLORS.text }}>{cat.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: COLORS.textLight }}>Benchmarked across {cat.clients} dealership groups</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-sm sm:text-base" style={{ color: COLORS.green }}>{formatCurrency(cat.savings)}</span>
                      {statusBadge(cat.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 sm:p-10 border-2 text-center" style={{ borderColor: COLORS.copper }}>
              <CheckCircle2 className="w-10 h-10 mx-auto mb-4" style={{ color: COLORS.copper }} />
              <h4 className="text-xl sm:text-2xl font-extrabold mb-3" style={{ color: COLORS.navy }} data-testid="text-cta-heading">
                Want to See the Real Numbers?
              </h4>
              <p className="text-sm sm:text-base mb-6 max-w-lg mx-auto" style={{ color: COLORS.textLight }}>
                Your Expense Health Score is based on benchmarks from 226 dealership groups. A Spend Map gives you the exact numbers for your stores, with no obligation and no disruption to your operations.
              </p>
              <Link href="/contact">
                <button
                  className="inline-flex items-center gap-2 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg cursor-pointer"
                  style={{ backgroundColor: COLORS.navy }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = COLORS.navyLight)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = COLORS.navy)}
                  data-testid="button-schedule-review"
                >
                  Schedule a Free Review <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>

            <p className="text-xs text-center px-4 pb-4" style={{ color: COLORS.textLight }}>
              Savings estimates are based on aggregated benchmark data from 2,184 sourcing projects across 226 dealership groups. Actual results vary by group size, geography, and current vendor relationships. StrategicSource has reviewed $3B+ in dealership spend across 150+ expense categories.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}