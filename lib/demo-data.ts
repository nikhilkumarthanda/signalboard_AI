export const companyData = {
  company: { name: "Northstar Labs", plan: "Enterprise", syncedAt: "2 min ago" },
  kpis: { arr: 24.8, mrr: 2.31, nrr: 118.6, margin: 76.4, runway: 21.4, customers: 3842 },
  revenue: {
    months: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    mrr: [1.45, 1.52, 1.58, 1.67, 1.73, 1.82, 1.88, 1.96, 2.04, 2.13, 2.21, 2.31],
    newBusiness: [240, 265, 278, 301, 288, 326, 339, 352, 381, 405, 429, 468],
    expansion: [96, 108, 119, 124, 132, 141, 146, 157, 164, 171, 179, 184],
    contraction: [31, 36, 34, 39, 44, 42, 48, 51, 49, 57, 59, 64],
  },
  segments: [
    { name: "Enterprise", customers: 186, arr: 12.4, growth: 24.8, color: "#3567dd" },
    { name: "Mid-market", customers: 742, arr: 7.9, growth: 17.2, color: "#6d8fe5" },
    { name: "SMB", customers: 2914, arr: 4.5, growth: 8.6, color: "#b3c5ef" },
  ],
  customers: [
    { name: "Vertex Systems", plan: "Enterprise", arr: 420000, health: 94, usage: 88, renewal: "Sep 18", status: "Healthy" },
    { name: "Lumina Health", plan: "Enterprise", arr: 286000, health: 42, usage: 51, renewal: "Aug 04", status: "At risk" },
    { name: "Atlas Commerce", plan: "Business", arr: 184000, health: 87, usage: 91, renewal: "Oct 22", status: "Healthy" },
    { name: "Kite Financial", plan: "Business", arr: 142000, health: 78, usage: 96, renewal: "Nov 11", status: "Expansion" },
    { name: "Redwood AI", plan: "Enterprise", arr: 336000, health: 66, usage: 69, renewal: "Aug 29", status: "Monitor" },
    { name: "Northwind Media", plan: "Growth", arr: 96000, health: 91, usage: 84, renewal: "Dec 03", status: "Healthy" },
  ],
  features: [
    { name: "AI Copilot", adoption: 78, wau: 24680, change: 12.4 },
    { name: "Automations", adoption: 64, wau: 18920, change: 8.7 },
    { name: "Analytics", adoption: 57, wau: 15740, change: 4.1 },
    { name: "Integrations", adoption: 46, wau: 11380, change: 6.8 },
    { name: "Team Spaces", adoption: 39, wau: 9240, change: -1.7 },
  ],
  usage: { dau: 18420, wau: 28640, mau: 41280, stickiness: 64.3, sessions: 4.8 },
  forecast: [24.8, 25.3, 25.9, 26.6, 27.3, 28.1, 28.8, 29.6],
  scenarios: [
    { name: "Base plan", price: 0, churn: 3.4, hires: 6, arr: 26.1, margin: 75.7, runway: 18.9, saved: true },
    { name: "Efficiency", price: 5, churn: 2.9, hires: 2, arr: 28.0, margin: 77.1, runway: 21.4, saved: true },
    { name: "Growth push", price: 8, churn: 2.8, hires: 12, arr: 27.8, margin: 76.4, runway: 17.6, saved: true },
  ],
  alerts: [
    { id: 1, severity: "critical", type: "Retention", title: "Churn risk increased", detail: "14 accounts show declining product usage", impact: "$286K ARR at risk", owner: "Customer Success", time: "12 min ago", resolved: false },
    { id: 2, severity: "opportunity", type: "Revenue", title: "Expansion opportunity", detail: "8 teams are within 10% of plan limits", impact: "$142K potential ARR", owner: "Sales", time: "38 min ago", resolved: false },
    { id: 3, severity: "warning", type: "Infrastructure", title: "Cloud costs trending high", detail: "Compute spend is 12% above operating plan", impact: "$38K monthly impact", owner: "Engineering", time: "2 hr ago", resolved: false },
    { id: 4, severity: "warning", type: "Product", title: "Team Spaces adoption slowed", detail: "Weekly active usage declined in SMB", impact: "-1.7% WoW", owner: "Product", time: "5 hr ago", resolved: false },
    { id: 5, severity: "opportunity", type: "Retention", title: "Enterprise NRR milestone", detail: "Enterprise NRR crossed 125% this month", impact: "+$96K expansion", owner: "Customer Success", time: "Yesterday", resolved: true },
  ],
  sources: [
    { name: "Stripe", category: "Billing", status: "Connected", records: "3.8K customers", sync: "2 min ago", icon: "S" },
    { name: "Salesforce", category: "CRM", status: "Connected", records: "12.4K opportunities", sync: "6 min ago", icon: "SF" },
    { name: "Amplitude", category: "Product analytics", status: "Connected", records: "8.7M events", sync: "4 min ago", icon: "A" },
    { name: "Zendesk", category: "Customer support", status: "Connected", records: "24.6K tickets", sync: "18 min ago", icon: "Z" },
    { name: "Snowflake", category: "Warehouse", status: "Connected", records: "42 tables", sync: "12 min ago", icon: "❄" },
    { name: "QuickBooks", category: "Finance", status: "Needs attention", records: "Authentication expired", sync: "2 days ago", icon: "Q" },
  ],
};

export function calculateScenario(price: number, churn: number, hires: number) {
  const arr = 24.8 * (1 + price / 100) * (1 + (3.4 - churn) * 0.035);
  return {
    arr: Number(arr.toFixed(1)),
    margin: Number((76.4 + price * 0.18 - hires * 0.12).toFixed(1)),
    runway: Number(Math.max(21.4 - hires * 0.42 + price * 0.16, 0).toFixed(1)),
  };
}
