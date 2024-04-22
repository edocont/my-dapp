import OpenAI from "openai";

// Initialize the OpenAI client with your API key and configure it to allow browser-side usage,
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY, 
  dangerouslyAllowBrowser: true // Enable the use of the API client directly in the browser - CONFIRM THIS!!!
});

// Define an asynchronous function to analyze security vulnerabilities in a smart contract using the OpenAI API.
export async function analyzeSecurity(contractCode, transactionHash, transactionDetails) {
  try {
    // Call to the OpenAI API to create a new chat completion.
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant trained and highly skilled in smart contract security analysis. I need you to list potential security issues found in the provided smart contract code, formatted as follows: Start each issue with a number followed by a colon and the title of the issue, followed again by a colon. Describe the issue succinctly. End each issue description with a severity level in square brackets (e.g., '[3]'). The severity levels range from 0 (negligible) to 5 (critical). Do not include any headers, footers, or additional text. Each issue should be on a new line for easy parsing."
        },
        {
          role: "user",
          content: `Contract Code:\n${contractCode}\n
                    Transaction Hash: ${transactionHash}\n
                    Transaction Details:\n${transactionDetails}`
        },
        {
          role: "assistant", // Initial assistant message setting expectations of the task.
          content: "Analyzing the smart contract code and transaction details for security risks. I will provide a list of issues with their respective security threat levels."
        }
        // The assistant's detailed analysis will be generated based on the above messages.
      ],
      temperature: 0.7, // Sets the creativity level of the responses
      max_tokens: 2048, 
      top_p: 1, 
      frequency_penalty: 0,
      presence_penalty: 0, 
    });
    
    console.log("API Response:", JSON.stringify(response, null, 2));
    return response.choices[0].message.content;

  } catch (error) {
    // Log and rethrow the error if the API call fails.
    console.error('Error during analysis with OpenAI:', error);
    throw error;
  }
}


