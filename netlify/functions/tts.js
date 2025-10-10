const https = require('https');

// In-memory cache. Persists between warm function invocations.
const cache = new Map();

exports.handler = async (event, context) => {
  console.log('TTS function called with event:', JSON.stringify(event, null, 2));
  
  // Log the full URL that was requested
  const fullPath = event.path || 'unknown';
  const httpMethod = event.httpMethod || 'unknown';
  console.log(`Request: ${httpMethod} ${fullPath}`);

  const textToSpeak = event.queryStringParameters?.q;

  if (!textToSpeak) {
    const errorResponse = { 
      statusCode: 400, 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Missing query parameter: q' }) 
    };
    console.log('Returning error response:', errorResponse);
    return errorResponse;
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    const optionsResponse = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
    console.log('Returning OPTIONS response:', optionsResponse);
    return optionsResponse;
  }

  // 1. Check cache first
  if (cache.has(textToSpeak)) {
    console.log(`[Cache HIT] Serving: ${textToSpeak}`);
    const cachedResponse = cache.get(textToSpeak);
    const responseWithCors = {
      ...cachedResponse,
      headers: {
        ...cachedResponse.headers,
        'Access-Control-Allow-Origin': '*'
      }
    };
    console.log('Returning cached response with CORS headers');
    return responseWithCors;
  }

  console.log(`[Cache MISS] Fetching from Google: ${textToSpeak}`);
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textToSpeak)}&tl=my&client=tw-ob`;
  console.log('Google TTS URL:', ttsUrl);

  return new Promise((resolve, reject) => {
    const proxyRequest = https.get(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      }
    }, (proxyResponse) => {
      
      console.log(`Google TTS response status: ${proxyResponse.statusCode}`);
      console.log(`Google TTS response headers:`, proxyResponse.headers);
      
      if (proxyResponse.statusCode < 200 || proxyResponse.statusCode >= 300) {
        const errorResponse = {
          statusCode: proxyResponse.statusCode,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            error: "Failed to fetch audio from Google TTS service.",
            statusCode: proxyResponse.statusCode
          })
        };
        console.error("Google TTS error response:", errorResponse);
        return reject(errorResponse);
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
            'Access-Control-Allow-Origin': '*',
            // Add aggressive browser caching
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
          body: audioBuffer.toString('base64'),
          isBase64Encoded: true,
        };

        // 2. Store in cache for future requests
        cache.set(textToSpeak, response);
        console.log(`[Cache SET] Stored: ${textToSpeak}`);

        console.log('Returning successful response');
        resolve(response);
      });
    });

    proxyRequest.on('error', (err) => {
      console.error('TTS proxy request error:', err);
      const errorResponse = {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Failed to fetch from TTS service.', details: err.message }),
      };
      reject(errorResponse);
    });
  }).catch(error => {
    console.error('Promise rejection in TTS function:', error);
    return error; // Return the error object directly
  });
};