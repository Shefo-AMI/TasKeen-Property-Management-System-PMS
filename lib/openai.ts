export async function askCopilot(input: string) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-5-nano',
      input,
      store: true,
    }),
  });

  const result = await response.json();
  return result;
}