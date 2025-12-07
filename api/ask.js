export default async function handler(req, res) {
  // --- THE GUEST LIST (Allowed URLs) ---
  const allowedOrigins = [
    "https://ls-2-science-revision.vercel.app",               // Your Vercel App
    "https://educadug.github.io",                             // Old GitHub (Optional)
    "https://mrguevaracga.github.io"                          // <--- NEW! Your new GitHub
  ];

  const origin = req.headers.origin || "";

  // If the visitor is on the Guest List, let them in!
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  // --- STANDARD SETUP BELOW (Do not change) ---
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "Missing message" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Backend Config Error" });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] }),
    });

    const data = await geminiResponse.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    return res.status(200).json({ reply: text });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
