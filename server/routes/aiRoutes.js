import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Replace with your actual key

router.post('/explain', async (req, res) => {
  const { code } = req.body;
  const prompt = `Explain the following code:\n${code}`;
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  res.json({ explanation: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No explanation found.' });
});

router.post('/hint', async (req, res) => {
  const { problem } = req.body;
  const prompt = `Give a helpful hint for this coding problem:\n${problem}`;
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  // console.log('Gemini API response:', JSON.stringify(data, null, 2));
  res.json({ hint: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No hint found.' });
});

router.post('/generate-metadata', async (req, res) => {
  const { description } = req.body;
  
  if (!description || description.trim() === '') {
    return res.status(400).json({ error: 'Description is required' });
  }

  const prompt = `
Given the following coding problem description, generate:
- Input Format (in 1-2 sentences, markdown)
- Output Format (in 1-2 sentences, markdown)
- Constraints (as a markdown bullet list, use math notation if needed)
- A sample example in JSON with keys: input, output, explanation. The input and output should be short, and the explanation should be 1-2 sentences.
- Test cases: Generate 50 test cases in JSON array format with keys: input, expectedOutput, description. Make them diverse and edge cases.

Description:
${description}

Respond ONLY in minified JSON (no markdown, no code block, no explanation, no extra text), with keys: inputFormat, outputFormat, constraints, example, testCases.
`;

  try {
    console.log('Sending request to Gemini API...');
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return res.status(500).json({ error: 'AI service error', details: errorText });
    }

    const data = await response.json();
    console.log('Gemini API response status:', response.status);
    console.log('Gemini API response structure:', Object.keys(data));

    // Try to extract JSON from the response
    let metadata = {};
    try {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('AI raw response length:', text.length);
      console.log('AI raw response (first 500 chars):', text.substring(0, 500));
      
      // Try to extract the first {...} block
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        console.log('Found JSON match, length:', match[0].length);
        metadata = JSON.parse(match[0]);
        console.log('Parsed metadata keys:', Object.keys(metadata));
      } else {
        console.log('No JSON pattern found in response');
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError.message);
      console.log('Full AI response for debugging:', text);
      
      // Fallback: create basic structure
      metadata = { 
        inputFormat: 'Input format could not be generated', 
        outputFormat: 'Output format could not be generated', 
        constraints: 'Constraints could not be generated', 
        example: { input: '', output: '', explanation: '' }, 
        testCases: [] 
      };
    }

    console.log('Final metadata being sent:', JSON.stringify(metadata, null, 2));
    res.json(metadata);
  } catch (error) {
    console.error('Error in generate-metadata:', error);
    res.status(500).json({ 
      error: 'Failed to generate metadata', 
      details: error.message,
      fallback: {
        inputFormat: 'Input format could not be generated',
        outputFormat: 'Output format could not be generated', 
        constraints: 'Constraints could not be generated',
        example: { input: '', output: '', explanation: '' },
        testCases: []
      }
    });
  }
});

export default router; 