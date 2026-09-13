/** Static option lists for the course editor (safe to import from client components). */
export const durationOptions = [
  { weeks: 4, label: "4 Weeks (1 Month)" },
  { weeks: 6, label: "6 Weeks (1.5 Months)" },
  { weeks: 8, label: "8 Weeks (2 Months)" },
  { weeks: 10, label: "10 Weeks (2.5 Months)" },
  { weeks: 12, label: "12 Weeks (3 Months)" },
  { weeks: 16, label: "16 Weeks (4 Months)" },
] as const;

export const trainingModes = ["Offline Lab", "Hybrid (Online + Offline)", "Online Live"] as const;
