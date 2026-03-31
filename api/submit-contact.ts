import type { VercelRequest, VercelResponse } from "@vercel/node";

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
    healthScore,
    estimatedSavings,
    rooftopCount,
    gradeLabel,
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !company) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const HUBSPOT_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN;

  if (!HUBSPOT_TOKEN) {
    console.error("HUBSPOT_PRIVATE_APP_TOKEN is not configured");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const hubspotResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUBSPOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            firstname: firstName,
            lastname: lastName,
            email: email,
            company: company,
            phone: phone || "",
            // Custom properties — must be created in HubSpot first
            health_score: String(healthScore ?? ""),
            estimated_annual_savings: String(estimatedSavings ?? ""),
            rooftop_count: String(rooftopCount ?? ""),
            health_score_grade: gradeLabel ?? "",
            lead_source: "Dealership Health Score Assessment",
          },
        }),
      }
    );

    // If contact already exists, try to update by email
    if (hubspotResponse.status === 409) {
      const searchResponse = await fetch(
        "https://api.hubapi.com/crm/v3/objects/contacts/search",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HUBSPOT_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filterGroups: [
              {
                filters: [
                  { propertyName: "email", operator: "EQ", value: email },
                ],
              },
            ],
          }),
        }
      );

      const searchData = await searchResponse.json();
      const contactId = searchData.results?.[0]?.id;

      if (contactId) {
        await fetch(
          `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${HUBSPOT_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              properties: {
                firstname: firstName,
                lastname: lastName,
                company: company,
                phone: phone || "",
                health_score: String(healthScore ?? ""),
                estimated_annual_savings: String(estimatedSavings ?? ""),
                rooftop_count: String(rooftopCount ?? ""),
                health_score_grade: gradeLabel ?? "",
                lead_source: "Dealership Health Score Assessment",
              },
            }),
          }
        );
      }
    } else if (!hubspotResponse.ok) {
      const errorData = await hubspotResponse.json();
      console.error("HubSpot API error:", errorData);
      // Still return success to the user — don't block their results
      // over a CRM issue. Log the error for debugging.
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("HubSpot submission error:", error);
    // Return success anyway — don't block the user experience
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ success: true });
  }
}
