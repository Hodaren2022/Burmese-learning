const https = require('https');
const url = require('url');

exports.handler = async (event, context) => {
  const textToSpeak = event.queryStringParameters.q;

  if (!textToSpeak) {
    return {
      statusCode: 400,
      body: 'Missing query parameter: q',
    };
  }

  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textToSpeak)}&tl=my&client=tw-ob`;

  return new Promise((resolve, reject) => {
    const proxyRequest = https.get(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      }
    }, (proxyResponse) => {
      
      // Check for non-200 responses from Google
      if (proxyResponse.statusCode < 200 || proxyResponse.statusCode >= 300) {
        return reject({
          statusCode: proxyResponse.statusCode,
          body: "Failed to fetch audio from Google TTS service."
        });
      }

      let body = [];
      proxyResponse.on('data', (chunk) => {
        body.push(chunk);
      });

      proxyResponse.on('end', () => {
        const audioBuffer = Buffer.concat(body);
        resolve({
          statusCode: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
          },
          body: audioBuffer.toString('base64'),
          isBase64Encoded: true,
        });
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
