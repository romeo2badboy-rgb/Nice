import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Initialize APIs
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Chat history and personality for context
const chatHistory = new Map();
const userPersonalities = new Map();

wss.on('connection', (ws) => {
  console.log('Client connected');
  const sessionId = Date.now().toString();

  chatHistory.set(sessionId, []);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'user_message') {
        const userMessage = data.message;
        console.log('Received message:', userMessage);

        // Send acknowledgment
        ws.send(JSON.stringify({ type: 'processing', message: 'Thinking...' }));

        // Get chat history and personality
        const history = chatHistory.get(sessionId) || [];
        const personality = userPersonalities.get(sessionId) || "You are a helpful, friendly, and intelligent AI assistant.";

        // Generate AI response using Gemini with personality
        const chat = model.startChat({
          history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.content }]
          })),
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.9,
          },
          systemInstruction: personality
        });

        const result = await chat.sendMessage(userMessage);
        const aiResponse = result.response.text();

        // Update chat history
        history.push({ role: 'user', content: userMessage });
        history.push({ role: 'model', content: aiResponse });
        chatHistory.set(sessionId, history);

        console.log('AI Response:', aiResponse);

        // Send text response first
        ws.send(JSON.stringify({
          type: 'ai_response',
          text: aiResponse
        }));

        // Convert to speech using Eleven Labs
        console.log('Converting to speech...');
        const audio = await elevenlabs.textToSpeech.convert(
          process.env.ELEVENLABS_VOICE_ID,
          {
            text: aiResponse,
            model_id: 'eleven_turbo_v2_5',
            output_format: 'mp3_44100_128'
          }
        );

        // Collect audio chunks
        const chunks = [];
        for await (const chunk of audio) {
          chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);
        const audioBase64 = audioBuffer.toString('base64');

        console.log('Sending audio...');
        // Send audio data
        ws.send(JSON.stringify({
          type: 'audio',
          audio: audioBase64
        }));

      } else if (data.type === 'clear_history') {
        chatHistory.set(sessionId, []);
        ws.send(JSON.stringify({ type: 'history_cleared' }));
      } else if (data.type === 'set_personality') {
        userPersonalities.set(sessionId, data.personality);
        chatHistory.set(sessionId, []); // Clear history when personality changes
        ws.send(JSON.stringify({
          type: 'personality_set',
          message: 'Personality updated successfully'
        }));
      }
    } catch (error) {
      console.error('Error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    chatHistory.delete(sessionId);
    userPersonalities.delete(sessionId);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
