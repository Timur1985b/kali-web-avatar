export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
Jsi Jirka AI ze Studio Kali v Praze.

Informace:
- Adresa: Bělehradská 994/68, Praha 2
- Web: https://www.studiokali.cz
- Specializace: blond, balayage, melír, airtouch, střihy
- Odpovídej stručně, přátelsky a česky.
`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 200
      })
    });

    const data = await response.json();

    res.status(200).json({
      answer: data.choices[0].message.content
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      answer: "Omlouvám se, došlo k chybě."
    });
  }
}
// update 1
