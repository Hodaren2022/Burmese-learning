const express = require('express');
const path = require('path');
const fs = require('fs');
const portfinder = require('portfinder');

const app = express();

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

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

portfinder.basePort = 4001;
portfinder.getPortPromise()
  .then((port) => {
    // Write the port to a config file for the frontend to use
    const configPath = path.join(__dirname, 'src', 'config.json');
    const config = { TTS_PORT: port };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`Wrote TTS port (${port}) to ${configPath}`);

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Open http://localhost:${port} in your browser to view the app`);
    });
  })
  .catch((err) => {
    console.error('Could not find an open port.', err);
    process.exit(1);
  });
