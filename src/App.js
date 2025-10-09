import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import vocab from './data/vocab.json';

function App() {
  const audioRef = useRef(null);
  const [selected, setSelected] = useState({ burmese: 'က', roman: 'ka' });
  const [page, setPage] = useState('alphabet');
  const [ttsPort, setTtsPort] = useState(null);
  const observer = useRef(null);

  // --- Start of Optimizations ---

  const preloadAudio = (textToSpeak) => {
    if (!textToSpeak) return;

    // Don't preload if a native browser voice is available, as it's fast enough.
    if (window.speechSynthesis && window.speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith('my'))) {
      return;
    }

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const url = isLocal && ttsPort
      ? `http://localhost:${ttsPort}/tts?q=${encodeURIComponent(textToSpeak)}`
      : `/.netlify/functions/tts?q=${encodeURIComponent(textToSpeak)}`;

    // Create a new Audio object to trigger the download.
    // We don't need to keep a reference. The browser handles caching based on the URL.
    new Audio(url);
  };

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, skipping viewport preloading.');
      return;
    }

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const textToPreload = entry.target.dataset.preloadText;
          if (textToPreload) {
            preloadAudio(textToPreload);
          }
          // Unobserve after preloading to save resources
          observer.current.unobserve(entry.target);
        }
      });
    }, { rootMargin: '200px' }); // Start preloading when an item is 200px away from the viewport

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [ttsPort]); // Rerun if ttsPort changes

  const observeElement = (element) => {
    if (element && observer.current) {
      observer.current.observe(element);
    }
  };

  // --- End of Optimizations ---

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocal) {
        import('./config.json')
          .then(configModule => {
            setTtsPort(configModule.default.TTS_PORT);
          })
          .catch(err => {
            console.warn("Could not load config.json for local TTS proxy.", err);
          });
      }
    }
  }, []);

  useEffect(() => {
    const unlockAudio = () => {
      if (window.audioUnlocked) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        if (audioContext.state === 'suspended') audioContext.resume();
      } catch (e) {}
      window.audioUnlocked = true;
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const consonants = [
    { burmese: 'က', roman: 'ka' }, { burmese: 'ခ', roman: 'kha' }, { burmese: 'ဂ', roman: 'ga' }, { burmese: 'ဃ', roman: 'gha' }, { burmese: 'င', roman: 'nga' },
    { burmese: 'စ', roman: 'ca' }, { burmese: 'ဆ', roman: 'cha' }, { burmese: 'ဇ', roman: 'za' }, { burmese: 'ဈ', roman: 'za2' }, { burmese: 'ဉ', roman: 'nya' },
    { burmese: 'ည', roman: 'nya2' }, { burmese: 'ဋ', roman: 'ta' }, { burmese: 'ဌ', roman: 'tha' }, { burmese: 'ဍ', roman: 'da' }, { burmese: 'ဎ', roman: 'dha' },
    { burmese: 'ဏ', roman: 'na' }, { burmese: 'တ', roman: 'ta2' }, { burmese: 'ထ', roman: 'tha2' }, { burmese: 'ဒ', roman: 'da2' }, { burmese: 'ဓ', roman: 'dha2' },
    { burmese: 'န', roman: 'na2' }, { burmese: 'ပ', roman: 'pa' }, { burmese: 'ဖ', roman: 'pha' }, { burmese: 'ဗ', roman: 'ba' }, { burmese: 'ဘ', roman: 'bha' },
    { burmese: 'မ', roman: 'ma' }, { burmese: 'ယ', roman: 'ya' }, { burmese: 'ရ', roman: 'ra' }, { burmese: 'လ', roman: 'la' }, { burmese: 'ဝ', roman: 'wa' },
    { burmese: 'သ', roman: 'tha3' }, { burmese: 'ဟ', roman: 'ha' }, { burmese: 'ဠ', roman: 'la2' }, { burmese: 'အ', roman: 'a' }
  ];

  const categorizedSentences = {
    '基本問候 (Basic Greetings)': [
      {
        burmese: 'မင်္ဂလာပါ',
        roman: 'mingalaabaa',
        translation: '你好 (Hello)',
        words: [
          { my: 'မင်္ဂလာ', roman: 'mingala', translation: '吉祥', audio_my: 'မင်္ဂလာ' },
          { my: 'ပါ', roman: 'paa', translation: '用於敬語', audio_my: 'ပါ' }
        ]
      },
      {
        burmese: 'နေကောင်းလား',
        roman: 'ne-kaung-laa',
        translation: '你好嗎？ (How are you?)',
        words: [
          { my: 'နေ', roman: 'ne', translation: '居住/處於', audio_my: 'နေ' },
          { my: 'ကောင်း', roman: 'kaung', translation: '好', audio_my: 'ကောင်း' },
          { my: 'လား', roman: 'laa', translation: '疑問詞', audio_my: 'လား' }
        ]
      },
    ],
  };

  const categoryMapping = {
    '購物': '購物/金錢',
    'Shopping': '購物/金錢',
    '問路': '問路/觀光',
    '方向與地點': '問路/觀光',
    '問候': '問候/禮貌與回應',
    '表達與回應 (Expressions & Responses)': '問候/禮貌與回應',
    '基本問候 (Basic Greetings)': '問候/禮貌與回應',
    '時間與日期': '時間/天氣/基礎詞',
    '天氣與自然': '時間/天氣/基礎詞',
    '疑問詞 (Question Words)': '疑問/基礎詞',
    '人稱代詞 (Pronouns)': '代詞/基礎詞',
    '指示代詞 (Demonstratives)': '代詞/基礎詞',
    '大小與數量': '數量/大小',
    '數字': '數量/大小',
    '語言交流 (Language Communication)': '語言交流',
    '求助與協助 (Help & Assistance)': '求助/協助',
    '擁有與需求 (Possession & Desire)': '擁有/需求',
    '情感表達 (Emotions & Feelings)': '情感表達',
    '自我介紹 (Self Introduction)': '自我介紹'
  };

  const mergedSentences = (() => {
    const result = {};
    const normalizeCategory = (origCat) => {
      if (!origCat) return origCat;
      if (categoryMapping[origCat]) return categoryMapping[origCat];
      const key = Object.keys(categoryMapping).find(k => origCat.includes(k));
      return key ? categoryMapping[key] : origCat;
    };

    Object.keys(categorizedSentences).forEach(origCat => {
      const nCat = normalizeCategory(origCat);
      if (!result[nCat]) result[nCat] = [];
      categorizedSentences[origCat].forEach(s => result[nCat].push(s));
    });

    Object.keys(vocab).forEach(origCat => {
      const entries = vocab[origCat] || [];
      const nCat = normalizeCategory(origCat);
      if (!result[nCat]) result[nCat] = [];
      entries.forEach(e => {
        result[nCat].push({ burmese: e.burmese, roman: e.roman, translation: e.chinese, words: [] });
      });
    });
    return result;
  })();

  const categories = Object.keys(mergedSentences || {});
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if ((selectedCategory === 'all' || !selectedCategory) && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  function speak(textToSpeak) {
    if (!textToSpeak) return;

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
        const myVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('my'));
        if (myVoice) {
          const utter = new SpeechSynthesisUtterance(textToSpeak);
          utter.lang = 'my';
          utter.voice = myVoice;
          utter.volume = 1;
          utter.rate = 1;
          window.speechSynthesis.speak(utter);
          return;
        }
      } catch (e) {
        console.warn('SpeechSynthesis failed, fallback to audio:', e);
      }
    }

    const isLocal = window && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const url = isLocal && ttsPort
      ? `http://localhost:${ttsPort}/tts?q=${encodeURIComponent(textToSpeak)}`
      : `/.netlify/functions/tts?q=${encodeURIComponent(textToSpeak)}`;

    try {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch((e) => console.warn('audioRef play failed', e));
      } else {
        new Audio(url).play().catch((err) => console.warn('New Audio() fallback play() rejected.', err));
      }
    } catch (e) {
      console.warn('Audio fallback creation failed.', e);
    }
  }

  function updateDisplay(burmese, roman) {
    setSelected({ burmese, roman });
  }

  function handleLetterClick(letter) {
    updateDisplay(letter.burmese, letter.roman);
    speak(letter.burmese);
  }

  function playFullSentence(sentence) {
    speak(sentence.burmese);
  }

  function renderAlphabetButtons() {
    return consonants.map((c, idx) => (
      <button
        key={idx}
        className="letter-button"
        onClick={() => handleLetterClick(c)}
        onMouseEnter={() => preloadAudio(c.burmese)} // Preload on hover
        aria-label={`播放 ${c.burmese}`}>
        <div className="font-myanmar">{c.burmese}</div>
      </button>
    ));
  }

  function renderSentenceCards() {
    const catsToRender = selectedCategory && selectedCategory !== 'all' ? [selectedCategory] : Object.keys(mergedSentences);
    return catsToRender.map((cat) => (
      <div key={cat} className="">
        <h3 style={{ margin: '10px 0 6px 0' }}>{cat}</h3>
        <div className="sentence-list">
          {mergedSentences[cat].map((s, i) => (
            <div 
              className="sentence-card" 
              key={i} 
              ref={observeElement} // Attach observer for viewport preloading
              data-preload-text={s.burmese} // Pass text to observer
            >
              <p className="font-myanmar" style={{ fontSize: '20px' }}>{s.burmese}</p>
              <p style={{ marginTop: 8, color: '#9fb1b8' }}>{s.roman}</p>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="sentence-meta">{s.translation}</div>
                <button 
                  className="play-sentence-btn" 
                  onClick={() => playFullSentence(s)} 
                  onMouseEnter={() => preloadAudio(s.burmese)} // Preload on hover
                  aria-label="播放句子">
                  播放句子
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  }
  
  return (
    <div className="app-root">
      <audio ref={audioRef} />
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-logo">緬甸文學習</h1>
          <div className="app-subtitle">緬甸語入門</div>
          <div className="app-nav">
            <button className={`nav-btn ${page === 'alphabet' ? 'active' : ''}`} onClick={() => setPage('alphabet')} aria-label="字母頁">字母表</button>
            <button className={`nav-btn ${page === 'sentences' ? 'active' : ''}`} onClick={() => setPage('sentences')} aria-label="句子頁">例句</button>
          </div>
        </header>

        <main className="app-main">
          <div className="display-area">
            <div className="display-char font-myanmar">{selected.burmese}</div>
            <div className="display-roman">{selected.roman}</div>
          </div>

          {page === 'alphabet' && (
            <div className="alphabet-grid">{renderAlphabetButtons()}</div>
          )}

          {page === 'sentences' && (
            <div style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <button
                  className={`nav-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  顯示全部
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`nav-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {renderSentenceCards()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;