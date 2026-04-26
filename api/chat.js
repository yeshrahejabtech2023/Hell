export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  try {
    // Convert messages to Gemini format
    // Gemini expects 'user' and 'model' roles.
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents,
          system_instruction: {
            parts: [{ text: "You are a highly efficient assistant. Be extremely concise, brief, and direct. Do not waste tokens on pleasantries or long explanations unless specifically asked." }]
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Failed to fetch from Gemini API' 
      });
    }

    const aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
    
    return res.status(200).json({ content: aiContent });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
