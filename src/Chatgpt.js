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
          content: "You are a helpful assistant trained and highly skilled and knowledgbale in smart contract security. Analyze the given smart contract code and transaction details for potential security issues, vulnerabilities, or risks. List them in paragraph separated topics, with at the end of each paragraph a box [] with a number from 0 to 5 inside indicating the level of security threat of that specific vulnerability, where 0 is 'Very negligible, almost for sure not a security threat' and 5 is 'Extremely severe security threat, should not at all execute the contract. Make sure that the output is in plain text and that each topic is separated by a paragraph.'"
        },
        {
          role: "user",
          content: `Contract Code:\n${contractCode}\n
                    Transaction Hash: ${transactionHash}\n
                    Transaction Details:\n${transactionDetails}`
        },
        {
          role: "assistant", // Initial assistant message setting expectations of the task.
          content: "I will analyze the smart contract code and transaction details for security risks."
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


