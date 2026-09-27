const getAIReply = async (messages) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  if (!apiKey) {
    console.error("GEMINI_API_KEY environment variable is missing.");
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini API HTTP Error (status ${response.status}):`, errorText);
    throw new Error(`Gemini API call failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    console.error("Gemini API returned no content in response data:", JSON.stringify(data));
    throw new Error("Gemini API returned no content.");
  }

  return content.trim();
};

module.exports = { getAIReply };
