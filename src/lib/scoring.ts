import BENCHMARKS from "../config/benchmarks.json";
import QUESTIONS from "../config/questions.json";

export interface CategoryResult {
  key: string;
  name: string;
  savings: number;
  status: "good" | "review" | "risk";
  clients: number;
}

export interface AssessmentResults {
  score: number;
  totalSavings: number;
  categories: CategoryResult[];
  rooftopCount: number;
}

const benchmarks = BENCHMARKS as Record<
  string,
  { name: string; avgPerRoof: number; projects: number; clients: number }
>;

export function calculateResults(answers: (number | null)[]): AssessmentResults {
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
      const bench = benchmarks[catKey];
      if (!bench) continue;
      const savings = bench.avgPerRoof * rooftopCount * opt.factor;
      if (savings > 0) {
        const status: "good" | "review" | "risk" =
          opt.factor === 0 ? "good" : opt.factor < 0.5 ? "review" : "risk";
        categories.push({
          key: catKey,
          name: bench.name,
          savings,
          status,
          clients: bench.clients,
        });
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

  return {
    score: Math.min(finalScore, 100),
    totalSavings: subtotal,
    categories,
    rooftopCount,
  };
}

export function getGradeLabel(score: number): string {
  if (score >= 80) return "Strong Expense Management";
  if (score >= 60) return "Room for Improvement";
  if (score >= 35) return "Significant Savings Opportunity";
  return "Critical Attention Needed";
}

export function getGradeSummary(score: number): string {
  if (score >= 80)
    return "Your dealership group is managing expenses better than most. There may still be opportunities in categories you haven't reviewed recently, but overall your practices are strong.";
  if (score >= 60)
    return "You're doing some things well, but there are clear gaps in your expense management. Several categories haven't been reviewed recently, and vendor pricing may have crept up without your knowledge.";
  if (score >= 35)
    return "Your assessment reveals multiple expense categories where you're likely overpaying significantly. Without competitive bidding and regular reviews, vendors have little incentive to offer you their best pricing.";
  return "Your dealership group has significant exposure across most major expense categories. Without intervention, you're likely leaving hundreds of thousands of dollars on the table every year.";
}

export function formatCurrency(amount: number): string {
  return "$" + Math.round(amount).toLocaleString("en-US");
}
