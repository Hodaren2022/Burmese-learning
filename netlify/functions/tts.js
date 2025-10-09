const https = require('https');

// In-memory cache. Persists between warm function invocations.
const cache = new Map();

exports.handler = async (event, context) => {
  const textToSpeak = event.queryStringParameters.q;

  if (!textToSpeak) {
    return { statusCode: 400, body: 'Missing query parameter: q' };
  }

  // 1. Check cache first
  if (cache.has(textToSpeak)) {
    console.log(`[Cache HIT] Serving: ${textToSpeak}`);
    return cache.get(textToSpeak);
  }

  console.log(`[Cache MISS] Fetching from Google: ${textToSpeak}`);
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textToSpeak)}&tl=my&client=tw-ob`;

  return new Promise((resolve, reject) => {
    const proxyRequest = https.get(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      }
    }, (proxyResponse) => {
      
      if (proxyResponse.statusCode < 200 || proxyResponse.statusCode >= 300) {
        return reject({
          statusCode: proxyResponse.statusCode,
          body: "Failed to fetch audio from Google TTS service."
        });
      }

      const body = [];
      proxyResponse.on('data', (chunk) => {
        body.push(chunk);
      });

      proxyResponse.on('end', () => {
        const audioBuffer = Buffer.concat(body);
        const response = {
          statusCode: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            // Add aggressive browser caching
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
          body: audioBuffer.toString('base64'),
          isBase64Encoded: true,
        };

        // 2. Store in cache for future requests
        cache.set(textToSpeak, response);
        console.log(`[Cache SET] Stored: ${textToSpeak}`);

        resolve(response);
      });
    });

    proxyRequest.on('error', (err) => {
      console.error('TTS proxy request error:', err);
      reject({
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch from TTS service.' }),
      });
    });
  });
};