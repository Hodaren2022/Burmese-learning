const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4001;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// TTS proxy endpoint - forwards requests to Google Translate TTS and returns audio
app.get('/tts', (req, res) => {
  const q = req.query.q || '';
  if (!q) return res.status(400).send('missing q');
  const https = require('https');
  const ttsUrl = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=my&client=tw-ob&q=' + encodeURIComponent(q);

  // set CORS so frontend on different port can fetch
  res.setHeader('Access-Control-Allow-Origin', '*');

  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': 'https://translate.google.com'
    }
  };

  https.get(ttsUrl, options, (proxyRes) => {
    // Forward status and headers (but ensure content-type is audio/mpeg)
    const contentType = proxyRes.headers['content-type'] || 'audio/mpeg';
    res.statusCode = proxyRes.statusCode || 200;
    res.setHeader('Content-Type', contentType);
    proxyRes.pipe(res);
  }).on('error', (err) => {
    console.error('TTS proxy error', err);
    res.status(502).send('tts proxy error');
  });
});

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to view the app`);
});