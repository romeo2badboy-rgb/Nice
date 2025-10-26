# TTS Voice Call App

A real-time AI voice call application powered by Gemini AI and Eleven Labs text-to-speech.

## Features

- **Real-time Voice Responses**: Instant TTS using Eleven Labs Turbo v2.5
- **AI Conversation**: Powered by Gemini 2.0 Flash for ultra-fast responses
- **Custom AI Personality**: Set your own AI personality (funny, professional, etc.)
- **WebSocket Communication**: Zero-latency real-time messaging
- **Glassmorphism Design**: Modern black & white glass theme
- **Powerful Animations**: Smooth, eye-catching transitions and effects
- **Audio Visualization**: Live wave animation during voice playback
- **Conversation Context**: AI remembers your conversation history
- **Toast Notifications**: Clean feedback messages
- **Auto-Reconnect**: Automatic reconnection with exponential backoff
- **Fully Responsive**: Works perfectly on desktop and mobile

## Tech Stack

- **Backend**: Node.js, Express, WebSocket
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI**: Google Gemini 2.0 Flash
- **TTS**: Eleven Labs API
- **Deployment**: Render

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
ELEVENLABS_API_KEY=your_api_key
ELEVENLABS_VOICE_ID=your_voice_id
GEMINI_API_KEY=your_gemini_key
PORT=3000
```

3. Run the server:
```bash
npm start
```

4. Open your browser to `http://localhost:3000`

### Deploy to Render

1. Push this repository to GitHub

2. Create a new Web Service on Render:
   - Connect your GitHub repository
   - Use the `render.yaml` configuration (automatic)
   - Or manually set:
     - Build Command: `npm install`
     - Start Command: `npm start`

3. Add environment variables in Render dashboard:
   - `ELEVENLABS_API_KEY`
   - `ELEVENLABS_VOICE_ID`
   - `GEMINI_API_KEY`

4. Deploy!

## How It Works

1. **User Input**: Type a message in the chat interface
2. **WebSocket**: Message is sent instantly via WebSocket
3. **AI Processing**: Gemini 2.0 Flash generates contextual response
4. **Text Display**: Response appears in chat immediately
5. **TTS Conversion**: Eleven Labs Turbo converts text to speech
6. **Audio Streaming**: Audio streams back and plays instantly
7. **Context Memory**: Conversation history maintained for better responses
8. **Custom Personality**: AI follows your custom personality settings

## Custom Personality

Click the settings icon (⚙️) in the header to set a custom AI personality:

**Examples:**
- "You are a funny comedian who loves making jokes"
- "You are a professional business consultant"
- "You are a friendly teacher who explains things simply"
- "You are a wise philosopher who gives deep insights"

## UI Features

### Glassmorphism Theme
- **Black & White**: Classic, elegant color scheme
- **Glass Effect**: Frosted glass morphism with blur
- **Dynamic Background**: Animated gradient background
- **Smooth Animations**: Powerful CSS animations throughout

### Interactions
- **Send Button**: Hover to see rotation effect
- **Message Bubbles**: Slide-up animation on arrival
- **Audio Visualizer**: Animated wave bars during playback
- **Toast Messages**: Elegant notification toasts

## API Keys Setup

### Eleven Labs
- Sign up at https://elevenlabs.io
- Get your API key from Settings
- Choose a voice ID from the Voice Library

### Google Gemini
- Visit https://makersuite.google.com/app/apikey
- Create a new API key
- Enable the Gemini API

## Performance Optimizations

- **Streaming Audio**: Minimal latency audio playback
- **WebSocket Protocol**: Real-time bidirectional communication
- **Optimized AI**: Gemini 2.0 Flash (fastest model)
- **Turbo TTS**: Eleven Labs Turbo v2.5 (fastest voice)
- **Audio Preloading**: Instant playback with preload
- **Auto Reconnect**: Exponential backoff strategy
- **Request Animation Frame**: Smooth scroll animations
- **Optimized Base64**: Fast audio decoding

## Important: ElevenLabs API Key Issue

**Error**: "Unusual activity detected" on free tier

**Solutions:**
1. **Upgrade to Paid Plan**: Remove the free tier restriction
2. **New API Key**: Create a new ElevenLabs account with a different IP
3. **Disable VPN/Proxy**: Free tier doesn't work with VPNs

The app will still work but TTS will fail. Text responses from Gemini AI work perfectly.

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## License

MIT
