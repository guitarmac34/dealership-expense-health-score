import type { VercelRequest, VercelResponse } from "@vercel/node";

const HUBSPOT_PORTAL_ID = "6320087";
const HUBSPOT_FORM_ID = "4221d806-34a5-48f9-af1b-85cb218f8c2a";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    firstName,
    lastName,
    email,
    company,
    phone,
    rooftopCount,
    rooftopLabel,
    totalCurrentSpend,
    totalNewSpend,
    totalEstimatedSavings,
    bottomLineNetProfitImpact,
    categoryBreakdown,
  } = req.body;

  if (!firstName || !lastName || !email || !company) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  try {
    const fields = [
      { name: "firstname", value: firstName },
      { name: "lastname", value: lastName },
      { name: "email", value: email },
      { name: "company", value: company },
      { name: "phone", value: phone || "" },
      { name: "rooftop_count", value: String(rooftopCount ?? "") },
      { name: "rooftop_range", value: rooftopLabel ?? "" },
      { name: "total_current_spend", value: String(totalCurrentSpend ?? "") },
      { name: "total_new_spend", value: String(totalNewSpend ?? "") },
      {
        name: "estimated_annual_savings",
        value: String(totalEstimatedSavings ?? ""),
      },
      {
        name: "bottom_line_net_profit_impact",
        value: String(bottomLineNetProfitImpact ?? ""),
      },
      { name: "category_breakdown", value: categoryBreakdown ?? "" },
    ];

    const hubspotResponse = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields,
          context: {
            pageUri: req.headers.referer || "https://strategicsource.com/health-score",
            pageName: "Dealership Expense Savings Calculator",
          },
        }),
      }
    );

    if (!hubspotResponse.ok) {
      const errorData = await hubspotResponse.json();
      console.error("HubSpot Forms API error:", errorData);
      // Still return success — don't block the user's results over a CRM issue
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("HubSpot submission error:", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ success: true });
  }
}
