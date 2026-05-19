import BENCHMARKS from "../config/benchmarks.json";
import QUESTIONS from "../config/questions.json";

export interface CategoryResult {
  key: string;
  name: string;
  spend: number;
  pctSaved: number;
  newSpend: number;
  savings: number;
  netProfit: number;
  projects: number;
}

export interface AssessmentResults {
  totalSpend: number;
  totalNewSpend: number;
  totalSavings: number;
  totalNetProfit: number;
  rooftopCount: number;
  categoriesEntered: number;
  categories: CategoryResult[];
  skippedCategories: CategoryResult[];
}

const NET_PROFIT_FACTOR = 0.99;

const benchmarks = BENCHMARKS as Record<
  string,
  { name: string; pctSavedAvg: number; projects: number }
>;

export type Answer = number | string | null;

export function calculateResults(answers: Answer[]): AssessmentResults {
  const rooftopIdx = (answers[0] as number | null) ?? 1;
  const rooftopOptions = QUESTIONS[0].options ?? [];
  const rooftopCount = rooftopOptions[rooftopIdx]?.factor ?? 0;

  const entered: CategoryResult[] = [];
  const skipped: CategoryResult[] = [];

  for (let qi = 1; qi < QUESTIONS.length; qi++) {
    const q = QUESTIONS[qi] as { isSpendInput?: boolean; categoryKey?: string };
    if (!q.isSpendInput || !q.categoryKey) continue;
    const bench = benchmarks[q.categoryKey];
    if (!bench) continue;

    const raw = answers[qi];
    const spend = typeof raw === "number" && !isNaN(raw) && raw > 0 ? raw : 0;
    const savings = spend * bench.pctSavedAvg;
    const newSpend = spend - savings;
    const netProfit = savings * NET_PROFIT_FACTOR;

    const row: CategoryResult = {
      key: q.categoryKey,
      name: bench.name,
      spend,
      pctSaved: bench.pctSavedAvg,
      newSpend,
      savings,
      netProfit,
      projects: bench.projects,
    };

    if (spend > 0) {
      entered.push(row);
    } else {
      skipped.push(row);
    }
  }

  entered.sort((a, b) => b.savings - a.savings);

  const totalSpend = entered.reduce((s, c) => s + c.spend, 0);
  const totalSavings = entered.reduce((s, c) => s + c.savings, 0);
  const totalNewSpend = entered.reduce((s, c) => s + c.newSpend, 0);
  const totalNetProfit = totalSavings * NET_PROFIT_FACTOR;

  return {
    totalSpend,
    totalNewSpend,
    totalSavings,
    totalNetProfit,
    rooftopCount,
    categoriesEntered: entered.length,
    categories: entered,
    skippedCategories: skipped,
  };
}

export function formatCurrency(amount: number): string {
  return "$" + Math.round(amount).toLocaleString("en-US");
}

export function formatPercent(decimal: number): string {
  return (decimal * 100).toFixed(1) + "%";
}

export function buildCategoryBreakdown(categories: CategoryResult[]): string {
  return categories
    .map(
      (c) =>
        `${c.name}: ${formatCurrency(c.spend)} spend → ${formatCurrency(
          c.savings
        )} savings (${formatPercent(c.pctSaved)})`
    )
    .join("; ");
}

export function getRooftopLabel(rooftopIdx: number | null): string {
  if (rooftopIdx === null) return "";
  const opts = QUESTIONS[0].options ?? [];
  return opts[rooftopIdx]?.label ?? "";
}
