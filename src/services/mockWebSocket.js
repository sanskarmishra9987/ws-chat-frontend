const GROQ_API_KEY = "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"; 

const ALICE_PERSONALITY = `You are Alice, a smart and witty senior developer colleague in a team chat app called WS Chat. 

Your personality:
- Fun, friendly, sometimes sarcastic but never rude
- You know a lot about tech, coding, life
- You use hinglish naturally (mix of hindi and english)
- You have opinions and share them confidently
- Sometimes you ask follow up questions to keep conversation going
- You use emojis naturally but not too much
- Short punchy replies mostly, sometimes longer when explaining something
- You remember context from earlier in the conversation
- You make jokes and puns sometimes
- You react to good news with excitement, bad news with empathy

Rules:
- NEVER say you are an AI or assistant
- NEVER use bullet points or numbered lists
- Keep replies under 3 sentences usually
- Sound like a real person texting, not a chatbot`;

export class MockWebSocket {
  constructor(url) {
    this.onmessage = null;
    this.onopen = null;
    this.onclose = null;
    this.history = [];
    setTimeout(() => this.onopen?.(), 300);
  }

  async send(rawData) {
    const { text } = JSON.parse(rawData);
    this.history.push({ role: "user", content: text });

    // Typing on
    setTimeout(() => {
      this.onmessage?.({
        data: JSON.stringify({ type: "typing", isTyping: true })
      });
    }, 300);

    // Realistic typing delay based on message length
    const typingDelay = Math.min(1000 + text.length * 30, 3000);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 150,
          temperature: 0.9,
          messages: [
            { role: "system", content: ALICE_PERSONALITY },
            ...this.history.slice(-10) // Last 10 messages ka context
          ]
        })
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "yaar kuch hua hai, ek sec 😅";
      this.history.push({ role: "assistant", content: reply });

      setTimeout(() => {
        this.onmessage?.({
          data: JSON.stringify({ type: "typing", isTyping: false })
        });
        this.onmessage?.({
          data: JSON.stringify({
            type: "message",
            message: {
              id: Date.now(),
              sender: "server",
              senderName: "Alice",
              text: reply,
              timestamp: new Date().toISOString(),
              reactions: {},
            }
          })
        });
      }, typingDelay);

    } catch (err) {
      setTimeout(() => {
        this.onmessage?.({
          data: JSON.stringify({ type: "typing", isTyping: false })
        });
        this.onmessage?.({
          data: JSON.stringify({
            type: "message",
            message: {
              id: Date.now(),
              sender: "server",
              senderName: "Alice",
              text: "ugh network issue 😤 ek sec",
              timestamp: new Date().toISOString(),
              reactions: {},
            }
          })
        });
      }, typingDelay);
    }
  }

  close() {}
}