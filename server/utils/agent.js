const OpenAI = require('openai');

class Agent {
  constructor(config = {}) {
    this.name = config.name || 'Agent';
    this.instructions = config.instructions || '';
    this.model = config.model || 'gpt-4o-mini';
    this.tools = config.tools || [];
    this.openai = config.openai || new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async run(input, { stream = false } = {}) {
    const toolDefs = this.tools.map((t) => ({ type: 'function', function: t.function }));
    const toolHandlers = {};
    for (const t of this.tools) {
      toolHandlers[t.function.name] = t.handler;
    }
    const messages = [
      { role: 'system', content: this.instructions },
      { role: 'user', content: input },
    ];
    while (true) {
      const resp = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        tools: toolDefs,
      });
      const msg = resp.choices?.[0]?.message;
      if (!msg) break;
      if (msg.tool_calls && msg.tool_calls.length) {
        messages.push(msg);
        for (const call of msg.tool_calls) {
          const name = call.function?.name;
          const handler = toolHandlers[name];
          let args = {};
          try {
            args = JSON.parse(call.function?.arguments || '{}');
          } catch {}
          let result = '';
          if (handler) result = await handler(args);
          messages.push({ role: 'tool', content: result, tool_call_id: call.id });
        }
      } else {
        const finalText = msg.content || '';
        async function* gen() {
          yield { content: finalText, output_text: finalText };
        }
        return gen();
      }
    }
    async function* empty() {}
    return empty();
  }
}

module.exports = Agent;
