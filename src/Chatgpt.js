const OPENAI_API_KEY = 'your_openai_api_key_here';

async function analyzeWithChatGPT(codeOrDetails) {
  const prompt = `Analyze this code for potential security risks: ${codeOrDetails}`;

  try {
    const response = await fetch('https://api.openai.com/v4/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'text-davinci-002', // Choose the appropriate model
        prompt: prompt,
        temperature: 0.7,
        max_tokens: 150,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }),
    });

    const data = await response.json();
    return data.choices[0].text.trim(); // Processing and returning the response
  } catch (error) {
    console.error('Failed to analyze with ChatGPT:', error);
    return 'Analysis failed. Please try again.';
  }
}
