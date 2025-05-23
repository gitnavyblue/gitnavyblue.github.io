export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Falta el mensaje' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Cambio aquí
        messages: [
          {
            role: 'system',
            content: 'Eres un analista neutral. Evalúa el contenido recibido como si fuera un mensaje interestelar con posibles implicancias políticas, éticas y tecnológicas.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.4,
      }),
    });

    const json = await openaiRes.json();

    // Verificación robusta
    if (!json.choices || json.choices.length === 0 || !json.choices[0].message?.content) {
      return res.status(500).json({
        error: 'La API no devolvió una respuesta válida.',
        detalle: json,
      });
    }

    const respuesta = json.choices[0].message.content;
    res.status(200).json({ evaluacion: respuesta });

  } catch (error) {
    res.status(500).json({ error: 'Error al contactar a la API de OpenAI', detalle: error.message });
  }
}
