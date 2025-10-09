import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import vocab from './data/vocab.json';

let config = { TTS_PORT: 3001 }; // Default config

if (process.env.NODE_ENV === 'development') {
  try {
    config = require('./config.json');
  } catch (e) {
    console.warn('Could not load config.json during development, using default port 3001.');
  }
}

function App() {
  const audioRef = useRef(null);
  const [selected, setSelected] = useState({ burmese: 'က', roman: 'ka' });
  const [page, setPage] = useState('alphabet');

  useEffect(() => {
    const unlockAudio = () => {
      // A flag to ensure this runs only once.
      if (window.audioUnlocked) {
        return;
      }

      // --- Method 1: Web Audio API (more robust) ---
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        const buffer = audioContext.createBuffer(1, 1, 22050);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
        console.log('Audio unlocked via Web Audio API.');
      } catch (e) {
        console.warn('Web Audio API for unlocking failed, trying <audio> element.', e);
        
        // --- Method 2: Silent Audio Element (fallback) ---
        try {
            const silentAudio = new Audio('data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaXRyYXRlIHN1cHBsaWVkIGJ5IGh0dHBzOi8vb25saW5lLWF1ZGlvLWNvbnZlcnRlci5jb20vAAA');
            silentAudio.volume = 0;
            silentAudio.play().catch(() => {});
            console.log('Audio unlocked via silent <audio> element.');
        } catch(audioErr) {
            console.warn('Silent <audio> element for unlocking also failed.', audioErr);
        }
      }

      window.audioUnlocked = true;

      // Remove the listeners after the first interaction
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
  }, []); // Empty dependency array ensures this runs only once on mount.

  const consonants = [
    { burmese: 'က', roman: 'ka' },
    { burmese: 'ခ', roman: 'kha' },
    { burmese: 'ဂ', roman: 'ga' },
    { burmese: 'ဃ', roman: 'gha' },
    { burmese: 'င', roman: 'nga' },
    { burmese: 'စ', roman: 'ca' },
    { burmese: 'ဆ', roman: 'cha' },
    { burmese: 'ဇ', roman: 'za' },
    { burmese: 'ဈ', roman: 'za2' },
    { burmese: 'ဉ', roman: 'nya' },
    { burmese: 'ည', roman: 'nya2' },
    { burmese: 'ဋ', roman: 'ta' },
    { burmese: 'ဌ', roman: 'tha' },
    { burmese: 'ဍ', roman: 'da' },
    { burmese: 'ဎ', roman: 'dha' },
    { burmese: 'ဏ', roman: 'na' },
    { burmese: 'တ', roman: 'ta2' },
    { burmese: 'ထ', roman: 'tha2' },
    { burmese: 'ဒ', roman: 'da2' },
    { burmese: 'ဓ', roman: 'dha2' },
    { burmese: 'န', roman: 'na2' },
    { burmese: 'ပ', roman: 'pa' },
    { burmese: 'ဖ', roman: 'pha' },
    { burmese: 'ဗ', roman: 'ba' },
    { burmese: 'ဘ', roman: 'bha' },
    { burmese: 'မ', roman: 'ma' },
    { burmese: 'ယ', roman: 'ya' },
    { burmese: 'ရ', roman: 'ra' },
    { burmese: 'လ', roman: 'la' },
    { burmese: 'ဝ', roman: 'wa' },
    { burmese: 'သ', roman: 'tha3' },
    { burmese: 'ဟ', roman: 'ha' },
    { burmese: 'ဠ', roman: 'la2' },
    { burmese: 'အ', roman: 'a' }
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
        burmese: 'မင်္ဂလာနံနက်ခင်းပါ။',
        roman: 'mingala nannek khin ba',
        translation: '早上好 (Good morning)',
        words: [
          { my: 'မင်္ဂလာ', roman: 'mingala', translation: '吉祥', audio_my: 'မင်္ဂလာ' },
          { my: 'နံနက်', roman: 'nannek', translation: '早上', audio_my: 'နံနက်' },
          { my: 'ခင်း', roman: 'khin', translation: '時段', audio_my: 'ခင်း' },
          { my: 'ပါ', roman: 'ba', translation: '敬語', audio_my: 'ပါ' }
        ]
      },
      {
        burmese: 'မင်္ဂလာညနေခင်းပါ။',
        roman: 'mingala nyanei khin ba',
        translation: '晚上好 (Good evening)',
        words: [
          { my: 'မင်္ဂလာ', roman: 'mingala', translation: '吉祥', audio_my: 'မင်္ဂလာ' },
          { my: 'ညနေ', roman: 'nyanei', translation: '晚上', audio_my: 'ညနေ' },
          { my: 'ခင်း', roman: 'khin', translation: '時段', audio_my: 'ခင်း' },
          { my: 'ပါ', roman: 'ba', translation: '敬語', audio_my: 'ပါ' }
        ]
      },
      {
        burmese: 'ကောင်းသောညပါ။',
        roman: 'kaung thaw nya ba',
        translation: '晚安 (Good night)',
        words: [
          { my: 'ကောင်း', roman: 'kaung', translation: '好', audio_my: 'ကောင်း' },
          { my: 'သောည', roman: 'thaw nya', translation: '夜晚', audio_my: 'သောည' },
          { my: 'ပါ', roman: 'ba', translation: '敬語', audio_my: 'ပါ' }
        ]
      },
      {
        burmese: 'သွားတော့မယ်။',
        roman: 'thwa daw mel',
        translation: '再見 (Goodbye)',
        words: [
          { my: 'သွား', roman: 'thwa', translation: '去', audio_my: 'သွား' },
          { my: 'တော့', roman: 'daw', translation: '就', audio_my: 'တော့' },
          { my: 'မယ်', roman: 'mel', translation: '將要', audio_my: 'မယ်' }
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
      {
        burmese: 'ကျွန်တော်/ကျွန်မ နာမည်က ... ပါ',
        roman: 'kyun-naw/kyun-ma na-me ka ... ba',
        translation: '我的名字是... (My name is...)',
        words: [
          { my: 'ကျွန်တော်', roman: 'kyun-naw', translation: '我 (男性)', audio_my: 'ကျွန်တော်' },
          { my: 'ကျွန်မ', roman: 'kyun-ma', translation: '我 (女性)', audio_my: 'ကျွန်မ' },
          { my: 'နာမည်', roman: 'na-me', translation: '名字', audio_my: 'နာမည်' },
          { my: 'က', roman: 'ka', translation: '助詞', audio_my: 'က' },
          { my: '... ပါ', roman: '... ba', translation: '是', audio_my: 'ပါ' }
        ]
      }
    ],
    '表達與回應 (Expressions & Responses)': [
      {
        burmese: 'ဟုတ်ကဲ့။',
        roman: 'hohke',
        translation: '是 (Yes)',
        words: [
          { my: 'ဟုတ်', roman: 'hoh', translation: '是', audio_my: 'ဟုတ်' },
          { my: 'ကဲ့', roman: 'ke', translation: '語氣詞', audio_my: 'ကဲ့' }
        ]
      },
      {
        burmese: 'မဟုတ်ဘူး။',
        roman: 'ma hoh bu',
        translation: '不是 (No)',
        words: [
          { my: 'မ', roman: 'ma', translation: '否定', audio_my: 'မ' },
          { my: 'ဟုတ်', roman: 'hoh', translation: '是', audio_my: 'ဟုတ်' },
          { my: 'ဘူး', roman: 'bu', translation: '否定語氣詞', audio_my: 'ဘူး' }
        ]
      },
      {
        burmese: 'ကျေးဇူးတင်ပါတယ်။',
        roman: 'kyay zu tin ba de',
        translation: '謝謝 (Thank you)',
        words: [
          { my: 'ကျေးဇူး', roman: 'kyay zu', translation: '感謝', audio_my: 'ကျေးဇူး' },
          { my: 'တင်', roman: 'tin', translation: '表示致謝', audio_my: 'တင်' },
          { my: 'ပါတယ်', roman: 'ba de', translation: '敬語', audio_my: 'ပါတယ်' }
        ]
      },
      {
        burmese: 'ရှင်ပြုစမ်းပါ။',
        roman: 'shing pyu zan ba',
        translation: "不客氣 (You're welcome)",
        words: [
          { my: 'ရှင်', roman: 'shing', translation: '您', audio_my: 'ရှင်' },
          { my: 'ပြု', roman: 'pyu', translation: '做', audio_my: 'ပြု' },
          { my: 'စမ်း', roman: 'zan', translation: '試試', audio_my: 'စမ်း' },
          { my: 'ပါ', roman: 'ba', translation: '敬語', audio_my: 'ပါ' }
        ]
      },
      {
        burmese: 'ဆောရပါ။',
        roman: 'sawra ba',
        translation: '對不起 (Sorry)',
        words: [
          { my: 'ဆော', roman: 'saw', translation: '抱歉', audio_my: 'ဆော' },
          { my: 'ရပါ', roman: 'ra ba', translation: '敬語', audio_my: 'ရပါ' }
        ]
      },
      {
        burmese: 'မဟုတ်ဘူး။',
        roman: 'ma hoh bu',
        translation: "沒關係 (It's okay)",
        words: [
          { my: 'မ', roman: 'ma', translation: '否定', audio_my: 'မ' },
          { my: 'ဟုတ်', roman: 'hoh', translation: '是', audio_my: 'ဟုတ်' },
          { my: 'ဘူး', roman: 'bu', translation: '否定語氣詞', audio_my: 'ဘူး' }
        ]
      },
      {
        burmese: 'ကျေးဇူးပြုပြီး။',
        roman: 'kyay zu pyu pyi',
        translation: '請 (Please)',
        words: [
          { my: 'ကျေးဇူး', roman: 'kyay zu', translation: '感謝', audio_my: 'ကျေးဇူး' },
          { my: 'ပြု', roman: 'pyu', translation: '做', audio_my: 'ပြု' },
          { my: 'ပြီး', roman: 'pyi', translation: '完成', audio_my: 'ပြီး' }
        ]
      },
      {
        burmese: 'ဟုတ်ကဲ့။',
        roman: 'hohke',
        translation: '是的 (Yes)',
        words: [
          { my: 'ဟုတ်', roman: 'hoh', translation: '是', audio_my: 'ဟုတ်' },
          { my: 'ကဲ့', roman: 'ke', translation: '語氣詞', audio_my: 'ကဲ့' }
        ]
      },
      {
        burmese: 'မဟုတ်ဘူး။',
        roman: 'ma hoh bu',
        translation: '不是的 (No)',
        words: [
          { my: 'မ', roman: 'ma', translation: '否定', audio_my: 'မ' },
          { my: 'ဟုတ်', roman: 'hoh', translation: '是', audio_my: 'ဟုတ်' },
          { my: 'ဘူး', roman: 'bu', translation: '否定語氣詞', audio_my: 'ဘူး' }
        ]
      },
      {
        burmese: 'ရပါတယ်။',
        roman: 'ya ba de',
        translation: '可以 (Okay/Can do)',
        words: [
          { my: 'ရ', roman: 'ya', translation: '可以', audio_my: 'ရ' },
          { my: 'ပါတယ်', roman: 'ba de', translation: '敬語', audio_my: 'ပါတယ်' }
        ]
      },
      {
        burmese: 'မရဘူး။',
        roman: 'ma ya bu',
        translation: '不可以 (Cannot)',
        words: [
          { my: 'မ', roman: 'ma', translation: '否定', audio_my: 'မ' },
          { my: 'ရ', roman: 'ya', translation: '可以', audio_my: 'ရ' },
          { my: 'ဘူး', roman: 'bu', translation: '否定語氣詞', audio_my: 'ဘူး' }
        ]
      }
    ],
    '人稱代詞 (Pronouns)': [
      { burmese: 'ငါ', roman: 'nga', translation: '我 (I)', words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }] },
      { burmese: 'သင်', roman: 'thang', translation: '你 (You)', words: [{ my: 'သင်', roman: 'thang', translation: '你', audio_my: 'သင်' }] },
      { burmese: 'သူ', roman: 'thu', translation: '他/她 (He/She)', words: [{ my: 'သူ', roman: 'thu', translation: '他/她', audio_my: 'သူ' }] },
      { burmese: 'ငါတို့', roman: 'nga do', translation: '我們 (We)', words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'တို့', roman: 'do', translation: '們', audio_my: 'တို့' }] },
      { burmese: 'သင်တို့', roman: 'thang do', translation: '你們 (You all)', words: [{ my: 'သင်', roman: 'thang', translation: '你', audio_my: 'သင်' }, { my: 'တို့', roman: 'do', translation: '們', audio_my: 'တို့' }] },
      { burmese: 'သူတို့', roman: 'thu do', translation: 'พวกเขา/她們 (They)', words: [{ my: 'သူ', roman: 'thu', translation: '他/她', audio_my: 'သူ' }, { my: 'တို့', roman: 'do', translation: '們', audio_my: 'တို့' }] }
    ],
    '指示代詞 (Demonstratives)': [
      { burmese: 'ဒါ', roman: 'da', translation: '這個 (This)', words: [{ my: 'ဒါ', roman: 'da', translation: '這個', audio_my: 'ဒါ' }] },
      { burmese: 'ဟိုက', roman: 'ho ka', translation: '那個 (That)', words: [{ my: 'ဟို', roman: 'ho', translation: '那', audio_my: 'ဟို' }, { my: 'က', roman: 'ka', translation: '助詞', audio_my: 'က' }] },
      { burmese: 'ဘယ်ဟာလဲ?', roman: 'be ha le?', translation: '哪個？ (Which?)', words: [{ my: 'ဘယ်', roman: 'be', translation: '哪', audio_my: 'ဘယ်' }, { my: 'ဟာ', roman: 'ha', translation: '東西', audio_my: 'ဟာ' }, { my: 'လဲ', roman: 'le', translation: '疑問詞', audio_my: 'လဲ' }] },
      { burmese: 'ဒီမှာ', roman: 'di hma', translation: '這裡 (Here)', words: [{ my: 'ဒီ', roman: 'di', translation: '這', audio_my: 'ဒီ' }, { my: 'မှာ', roman: 'hma', translation: '地方', audio_my: 'မှာ' }] },
      { burmese: 'ဟိုမှာ', roman: 'ho hma', translation: '那裡 (There)', words: [{ my: 'ဟို', roman: 'ho', translation: '那', audio_my: 'ဟို' }, { my: 'မှာ', roman: 'hma', translation: '地方', audio_my: 'မှာ' }] }
    ],
    '情感表達 (Emotions & Feelings)': [
      { burmese: 'ငါကြိုက်တယ်', roman: 'nga kyite de', translation: '我喜歡 (I like)', words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'ကြိုက်', roman: 'kyite', translation: '喜歡', audio_my: 'ကြိုက်' }, { my: 'တယ်', roman: 'de', translation: '助詞', audio_my: 'တယ်' }] },
      { burmese: 'ငါမကြိုက်ဘူး', roman: 'nga ma kyite bu', translation: '我不喜歡 (I am not)', words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'မ', roman: 'ma', translation: '否定', audio_my: 'မ' }, { my: 'ကြိုက်', roman: 'kyite', translation: '喜歡', audio_my: 'ကြိုက်' }, { my: 'ဘူး', roman: 'bu', translation: '否定語氣詞', audio_my: 'ဘူး' }] },
      { burmese: 'ငါမင်းကိုချစ်တယ်', roman: 'nga min ko chite de', translation: '我愛你 (I love you)', words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'မင်း', roman: 'min', translation: '你', audio_my: 'မင်း' }, { my: 'ကို', roman: 'ko', translation: '受格助詞', audio_my: 'ကို' }, { my: 'ချစ်', roman: 'chite', translation: '愛', audio_my: 'ချစ်' }, { my: 'တယ်', roman: 'de', translation: '助詞', audio_my: 'တယ်' }] },
      { burmese: 'ငါမင်းကိုလွမ်းတယ်', roman: 'nga min ko lon de', translation: '我想念你 (I miss you)', words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'မင်း', roman: 'min', translation: '你', audio_my: 'မင်း' }, { my: 'ကို', roman: 'ko', translation: '受格助詞', audio_my: 'ကို' }, { my: 'လွမ်း', roman: 'lon', translation: '想念', audio_my: 'လွမ်း' }, { my: 'တယ်', roman: 'de', translation: '助詞', audio_my: 'တယ်' }] },
      { burmese: 'ငါနေကောင်းတယ်', roman: 'nga nei kaung de', translation: '我很好 (I am fine)', words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'နေ', roman: 'nei', translation: '狀態', audio_my: 'နေ' }, { my: 'ကောင်း', roman: 'kaung', translation: '好', audio_my: 'ကောင်း' }, { my: 'တယ်', roman: 'de', translation: '助詞', audio_my: 'တယ်' }] },
      { burmese: 'ငါမနေကောင်းဘူး', roman: 'nga ma nei kaung bu', translation: "我不好 (I'm not fine)", words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'မ', roman: 'ma', translation: '否定', audio_my: 'မ' }, { my: 'နေ', roman: 'nei', translation: '狀態', audio_my: 'နေ' }, { my: 'ကောင်း', roman: 'kaung', translation: '好', audio_my: 'ကောင်း' }, { my: 'ဘူး', roman: 'bu', translation: '否定語氣詞', audio_my: 'ဘူး' }] }
    ],
    '購物 (Shopping)': [
      { burmese: 'ဒါဘယ်လောက်လဲ', roman: 'daa-belaut-lae', translation: '這個多少錢？ (How much is this?)', words: [{ my: 'ဒါ', roman: 'daa', translation: '這個', audio_my: 'ဒါ' }, { my: 'ဘယ်လောက်', roman: 'belaut', translation: '多少', audio_my: 'ဘယ်လောက်' }, { my: 'လဲ', roman: 'lae', translation: '疑問詞', audio_my: 'လဲ' }] },
      { burmese: 'စျေးလျှော့ပေးပါ', roman: 'zye-shaut-pe-ba', translation: '請打折 (Please give a discount)', words: [{ my: 'စျေး', roman: 'zye', translation: '價格', audio_my: 'စျေး' }, { my: 'လျှော့', roman: 'shaut', translation: '減少/打折', audio_my: 'လျှော့' }, { my: 'ပေး', roman: 'pe', translation: '給予', audio_my: 'ပေး' }, { my: 'ပါ', roman: 'ba', translation: '禮貌用詞', audio_my: 'ပါ' }] },
      { burmese: 'စျေးဝယ်ထွက်တာ', roman: 'zye-we-thwet-daa', translation: '我去購物', words: [{ my: 'စျေးဝယ်', roman: 'zye-we', translation: '購物', audio_my: 'စျေးဝယ်' }, { my: 'ထွက်', roman: 'thwet', translation: '出去', audio_my: 'ထွက်' }, { my: 'တာ', roman: 'da', translation: '助詞', audio_my: 'တာ' }] },
      { burmese: 'ဒီဟာကို ယူမယ်', roman: 'di-haa go yu-me', translation: '我要這個', words: [{ my: 'ဒီဟာ', roman: 'di-haa', translation: '這個東西', audio_my: 'ဒီဟာ' }, { my: 'ကို', roman: 'go', translation: '受格助詞', audio_my: 'ကို' }, { my: 'ယူ', roman: 'yu', translation: '拿/要', audio_my: 'ယူ' }, { my: 'မယ်', roman: 'me', translation: '未來式/意願', audio_my: 'မယ်' }] },
      { burmese: 'ဈေးကြီးတယ်', roman: 'zei kyi de', translation: '太貴了 (Too expensive)', words: [{ my: 'ဈေး', roman: 'zei', translation: '價格', audio_my: 'ဈေး' }, { my: 'ကြီး', roman: 'kyi', translation: '大', audio_my: 'ကြီး' }, { my: 'တယ်', roman: 'de', translation: '助詞', audio_my: 'တယ်' }] },
      { burmese: 'ဈေးလျှော့ပါ', roman: 'zei shoh ba', translation: '便宜點 (Cheaper, please)', words: [{ my: 'ဈေး', roman: 'zei', translation: '價格', audio_my: 'ဈေး' }, { my: 'လျှော့', roman: 'shoh', translation: '減少', audio_my: 'လျှော့' }, { my: 'ပါ', roman: 'ba', translation: '敬語', audio_my: 'ပါ' }] }
    ],
    '語言交流 (Language Communication)': [
      { burmese: 'နာမည်ဘယ်လိုခေါ်လဲ?', roman: 'na me be lo khol le?', translation: "你叫什麼名字？ (What's your name?)", words: [{ my: 'နာမည်', roman: 'na me', translation: '名字', audio_my: 'နာမည်' }, { my: 'ဘယ်လို', roman: 'be lo', translation: '如何', audio_my: 'ဘယ်လို' }, { my: 'ခေါ်', roman: 'khol', translation: '叫', audio_my: 'ခေါ်' }, { my: 'လဲ', roman: 'le', translation: '疑問詞', audio_my: 'လဲ' }] },
      { burmese: 'ငါ့နာမည်က ... ပါ', roman: 'nga na me ga ... pa', translation: "我叫... (My name is...)", words: [{ my: 'ငါ့', roman: 'nga', translation: '我的', audio_my: 'ငါ့' }, { my: 'နာမည်', roman: 'na me', translation: '名字', audio_my: 'နာမည်' }, { my: 'က', roman: 'ga', translation: '助詞', audio_my: 'က' }, { my: '...', roman: '...', translation: '名稱', audio_my: '...' }, { my: 'ပါ', roman: 'pa', translation: '敬語', audio_my: 'ပါ' }] },
      { burmese: 'သင်အင်္ဂလိပ်ပြောနိုင်လား?', roman: 'thang angaleit pyo nai la?', translation: "你會說英語嗎？ (Do you speak English?)", words: [{ my: 'သင်', roman: 'thang', translation: '你', audio_my: 'သင်' }, { my: 'အင်္ဂလိပ်', roman: 'angaleit', translation: '英語', audio_my: 'အင်္ဂလိပ်' }, { my: 'ပြော', roman: 'pyo', translation: '說', audio_my: 'ပြော' }, { my: 'နိုင်', roman: 'nai', translation: '能', audio_my: 'နိုင်' }, { my: 'လား', roman: 'la', translation: '疑問詞', audio_my: 'လား' }] },
      { burmese: 'ငါနည်းနည်းပြောတတ်တယ်', roman: 'nga ne ne pyo tat de', translation: "我會說一點點 (I speak a little)", words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'နည်းနည်း', roman: 'ne ne', translation: '一點點', audio_my: 'နည်းနည်း' }, { my: 'ပြော', roman: 'pyo', translation: '說', audio_my: 'ပြော' }, { my: 'တတ်', roman: 'tat', translation: '會', audio_my: 'တတ်' }, { my: 'တယ်', roman: 'de', translation: '助詞', audio_my: 'တယ်' }] },
      { burmese: 'ကျွန်တော်သုံးနိုင်သလား?', roman: 'kywan tau son nai thalaa?', translation: '我可以嗎？ (May I?)', words: [{ my: 'ကျွန်တော်', roman: 'kywan tau', translation: '我', audio_my: 'ကျွန်တော်' }, { my: 'သုံး', roman: 'son', translation: '使用', audio_my: 'သုံး' }, { my: 'နိုင်', roman: 'nai', translation: '能', audio_my: 'နိုင်' }, { my: 'သလား', roman: 'thalaa', translation: '疑問詞', audio_my: 'သလား' }] },
      { burmese: 'ကျေးဇူးတင်ပါတယ်...', roman: 'chay zu tin ba de...', translation: '請給我... (Please give me...)', words: [{ my: 'ကျေးဇူးတင်', roman: 'chay zu tin', translation: '感謝', audio_my: 'ကျေးဇူးတင်' }, { my: 'ပါတယ်', roman: 'ba de', translation: '敬語', audio_my: 'ပါတယ်' }, { my: '...', roman: '...', translation: '物品', audio_my: '...' }] },
      { burmese: 'ဒါဘယ်လိုလဲ?', roman: 'da be lo le?', translation: '這是什麼？ (What is this?)', words: [{ my: 'ဒါ', roman: 'da', translation: '這', audio_my: 'ဒါ' }, { my: 'ဘယ်လို', roman: 'be lo', translation: '怎樣', audio_my: 'ဘယ်လို' }, { my: 'လဲ', roman: 'le', translation: '疑問詞', audio_my: 'လဲ' }] },
      { burmese: 'ငါမအင်္ဂလိပ်ပြောနိုင်ဘူး', roman: 'nga ma angaleit pyo nai bu', translation: "我不會說 (I can't speak)", words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'မ', roman: 'ma', translation: '否定', audio_my: 'မ' }, { my: 'အင်္ဂလိပ်', roman: 'angaleit', translation: '英語', audio_my: 'အင်္ဂလိပ်' }, { my: 'ပြော', roman: 'pyo', translation: '說', audio_my: 'ပြော' }, { my: 'နိုင်', roman: 'nai', translation: '能', audio_my: 'နိုင်' }, { my: 'ဘူး', roman: 'bu', translation: '否定語氣詞', audio_my: 'ဘူး' }] }
    ],
    '求助與協助 (Help & Assistance)': [
      { burmese: 'ငါ့ကိုကူညီပါ', roman: 'nga ko ku nyi ba', translation: '請幫助我 (Please help me)', words: [{ my: 'ငါ့ကို', roman: 'nga ko', translation: '我', audio_my: 'ငါ့ကို' }, { my: 'ကူညီ', roman: 'ku nyi', translation: '幫助', audio_my: 'ကူညီ' }, { my: 'ပါ', roman: 'ba', translation: '敬語', audio_my: 'ပါ' }] },
      { burmese: 'ငါ့ကို ... လိုတယ်', roman: 'nga ko ... lo de', translation: '我需要... (I need...)', words: [{ my: 'ငါ့ကို', roman: 'nga ko', translation: '我', audio_my: 'ငါ့ကို' }, { my: '...', roman: '...', translation: '物品', audio_my: '...' }, { my: 'လို', roman: 'lo', translation: '需要', audio_my: 'လို' }, { my: 'တယ်', roman: 'de', translation: '助詞', audio_my: 'တယ်' }] },
      { burmese: 'ငါလိုအပ်သောက်ကိုလိုအပ်သည်', roman: 'nga loat payauk kyo loat pay ne', translation: '我需要幫助 (I need help)', words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'လိုအပ်', roman: 'loat payauk', translation: '需要', audio_my: 'လိုအပ်' }, { my: 'သောက်', roman: 'payauk', translation: '幫助', audio_my: 'သောက်' }, { my: 'ကို', roman: 'kyo', translation: '受格助詞', audio_my: 'ကို' }, { my: 'လိုအပ်', roman: 'loat pay', translation: '需要', audio_my: 'လိုအပ်' }, { my: 'သည်', roman: 'ne', translation: '助詞', audio_my: 'သည်' }] },
      { burmese: 'ငါကိုယ်တာရှာနော်...', roman: 'nga kyo tar sha naoo...', translation: "我在找... (I'm looking for...)", words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'ကိုယ်တာ', roman: 'kyo tar', translation: '自己', audio_my: 'ကိုယ်တာ' }, { my: 'ရှာ', roman: 'sha', translation: '找', audio_my: 'ရှာ' }, { my: 'နော်', roman: 'naoo', translation: '正在', audio_my: 'နော်' }, { my: '...', roman: '...', translation: '物品', audio_my: '...' }] },
      { burmese: 'ဟယ်လိုငါအကူအညီနိုင်သလား?', roman: 'he lo nga a kyu anai nai thalaa?', translation: '你能幫助我嗎？ (Can you help me?)', words: [{ my: 'ဟယ်လို', roman: 'he lo', translation: '喂', audio_my: 'ဟယ်လို' }, { my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'အကူအညီ', roman: 'a kyu anai', translation: '幫助', audio_my: 'အကူအညီ' }, { my: 'နိုင်', roman: 'nai', translation: '能', audio_my: 'နိုင်' }, { my: 'သလား', roman: 'thalaa', translation: '疑問詞', audio_my: 'သလား' }] },
      { burmese: 'အပြည့်အနောက်မှာညို့ရပါ', roman: 'a pyi ana mha nu ra ba', translation: '請給我一杯水 (Please give me a glass of water)', words: [{ my: 'အပြည့်', roman: 'a pyi', translation: '滿', audio_my: 'အပြည့်' }, { my: 'အနောက်', roman: 'ana', translation: '西', audio_my: 'အနာက္' }, { my: 'မှာ', roman: 'mha', translation: '在', audio_my: 'မှာ' }, { my: 'ညို့', roman: 'nu', translation: '水', audio_my: 'ညို့' }, { my: 'ရပါ', roman: 'ra ba', translation: '給', audio_my: 'ရပါ' }] }
    ],
    '方向與地點 (Directions and Places)': [
      { burmese: 'အိမ်ဘယ်မှာလဲ', roman: 'einbehmaale', translation: '家在哪裡？ (Where is home?)', words: [{ my: 'အိမ်', roman: 'ein', translation: '家', audio_my: 'အိမ်' }, { my: 'ဘယ်', roman: 'be', translation: '哪裡', audio_my: 'ဘယ်' }, { my: 'မှာ', roman: 'hmaa', translation: '在', audio_my: 'မှာ' }, { my: 'လဲ', roman: 'le', translation: '疑問詞', audio_my: 'လဲ' }] },
      { burmese: 'ဘယ်လိုသွားရမလဲ', roman: 'be-lo-thwa-ya-ma-le', translation: '要怎麼去？ (How to get there?)', words: [{ my: 'ဘယ်လို', roman: 'be-lo', translation: '如何', audio_my: 'ဘယ်လို' }, { my: 'သွား', roman: 'thwa', translation: '去', audio_my: 'သွား' }, { my: 'ရ', roman: 'ya', translation: '動詞後綴，表示必須或可以', audio_my: 'ရ' }, { my: 'မလဲ', roman: 'ma-le', translation: '疑問詞', audio_my: 'မလဲ' }] },
      { burmese: 'ဒီမှာရပ်ပါ', roman: 'di-hmaa-yat-ba', translation: '請在這裡停', words: [{ my: 'ဒီမှာ', roman: 'di-hmaa', translation: '這裡', audio_my: 'ဒီမှာ' }, { my: 'ရပ်', roman: 'yat', translation: '停', audio_my: 'ရပ်' }, { my: 'ပါ', roman: 'ba', translation: '禮貌用詞', audio_my: 'ပါ' }] },
      { burmese: 'ဘယ်ဘက်ကွေ့ပါ', roman: 'be-bet-kwe-ba', translation: '請左轉', words: [{ my: 'ဘယ်ဘက်', roman: 'be-bet', translation: '左邊', audio_my: 'ဘယ်ဘက်' }, { my: 'ကွေ့', roman: 'kwe', translation: '轉彎', audio_my: 'ကွေ့' }, { my: 'ပါ', roman: 'ba', translation: '禮貌用詞', audio_my: 'ပါ' }] },
      { burmese: 'ညာဘက်ကွေ့ပါ', roman: 'nya-bet-kwe-ba', translation: '請右轉', words: [{ my: 'ညာဘက်', roman: 'nya-bet', translation: '右邊', audio_my: 'ညာဘက်' }, { my: 'ကွေ့', roman: 'kwe', translation: '轉彎', audio_my: 'ကွေ့' }, { my: 'ပါ', roman: 'ba', translation: '禮貌用詞', audio_my: 'ပါ' }] }
    ],
    '疑問詞 (Question Words)': [
      { burmese: 'ဘယ်လို?', roman: 'be lo?', translation: '什麼？ (What?)', words: [{ my: 'ဘယ်လို', roman: 'be lo', translation: '怎樣', audio_my: 'ဘယ်လို' }] },
      { burmese: 'ဘယ်လိုလို?', roman: 'be lo lo?', translation: '為什麼？ (Why?)', words: [{ my: 'ဘယ်လို', roman: 'be lo', translation: '怎樣', audio_my: 'ဘယ်လို' }, { my: 'လို', roman: 'lo', translation: '像', audio_my: 'လို' }] },
      { burmese: 'ဘယ်လိုလို?', roman: 'be lo lo?', translation: '如何？ (How?)', words: [{ my: 'ဘယ်လို', roman: 'be lo', translation: '怎樣', audio_my: 'ဘယ်လို' }, { my: 'လို', roman: 'lo', translation: '像', audio_my: 'လို' }] },
      { burmese: 'ဘယ်လို?', roman: 'be lo?', translation: '誰？ (Who?)', words: [{ my: 'ဘယ်လို', roman: 'be lo', translation: '怎樣', audio_my: 'ဘယ်လို' }] },
      { burmese: 'ဘယ်လို?', roman: 'be lo?', translation: '哪裡？ (Where?)', words: [{ my: 'ဘယ်လို', roman: 'be lo', translation: '怎樣', audio_my: 'ဘယ်လို' }] },
      { burmese: 'ဘယ်လိုခွဲခြားလဲ?', roman: 'be lo hkwai khe la?', translation: '什麼時候？ (When?)', words: [{ my: 'ဘယ်လို', roman: 'be lo', translation: '怎樣', audio_my: 'ဘယ်လို' }, { my: 'ခွဲ', roman: 'hkwai', translation: '分開', audio_my: 'ခွဲ' }, { my: 'ခြား', roman: 'khe', translation: '區別', audio_my: 'ခြား' }, { my: 'လဲ', roman: 'la', translation: '疑問詞', audio_my: 'လဲ' }] },
      { burmese: 'ငါမသိတယ်', roman: 'nga ma sit de', translation: "我不知道 (I'm not sure)", words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'မ', roman: 'ma', translation: '否定', audio_my: 'မ' }, { my: 'သိ', roman: 'sit', translation: '知道', audio_my: 'သိ' }, { my: 'တယ်', roman: 'de', translation: '助詞', audio_my: 'တယ်' }] },
      { burmese: 'ဒါဘယ်လိုလဲ?', roman: 'da be lo le?', translation: '這是什麼？ (What is this?)', words: [{ my: 'ဒါ', roman: 'da', translation: '這', audio_my: 'ဒါ' }, { my: 'ဘယ်လို', roman: 'be lo', translation: '怎樣', audio_my: 'ဘယ်လို' }, { my: 'လဲ', roman: 'le', translation: '疑問詞', audio_my: 'လဲ' }] },
      { burmese: 'ဟိုဘယ်လိုလဲ?', roman: 'ho be lo le?', translation: '那是什麼？ (What is that?)', words: [{ my: 'ဟို', roman: 'ho', translation: '那', audio_my: 'ဟို' }, { my: 'ဘယ်လို', roman: 'be lo', translation: '怎樣', audio_my: 'ဘယ်လို' }, { my: 'လဲ', roman: 'le', translation: '疑問詞', audio_my: 'လဲ' }] },
      { burmese: 'ဘယ်လောက်?', roman: 'be laut?', translation: '多少？ (How much?)', words: [{ my: 'ဘယ်လောက်', roman: 'be laut', translation: '多少', audio_my: 'ဘယ်လောက်' }] },
      { burmese: 'ဘယ်လောက်ခွဲအချိန်?', roman: 'be laut kwa akhin?', translation: '多少時間？ (How long?)', words: [{ my: 'ဘယ်လောက်', roman: 'be laut', translation: '多少', audio_my: 'ဘယ်လောက်' }, { my: 'ခွဲ', roman: 'kwa', translation: '分開', audio_my: 'ခွဲ' }, { my: 'အချိန်', roman: 'akhin', translation: '時間', audio_my: 'အချိန်' }] }
    ],
    '擁有與需求 (Possession & Desire)': [
      { burmese: 'ငါမလိုပါ', roman: 'nga ma lo ba', translation: '我不要 (I don\'t want)', words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'မ', roman: 'ma', translation: '否定', audio_my: 'မ' }, { my: 'လို', roman: 'lo', translation: '想要', audio_my: 'လို' }, { my: 'ပါ', roman: 'ba', translation: '敬語', audio_my: 'ပါ' }] },
      { burmese: 'ငါရိုက်လိုတယ်', roman: 'nga yote lo de', translation: '我想要 (I want)', words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'ရိုက်', roman: 'yote', translation: '打', audio_my: 'ရိုက်' }, { my: 'လို', roman: 'lo', translation: '想要', audio_my: 'လို' }, { my: 'တယ်', roman: 'de', translation: '助詞', audio_my: 'တယ်' }] },
      { burmese: 'ရှိသောက်ပါတယ်', roman: 're thauk ba de', translation: '有 (Have)', words: [{ my: 'ရှိ', roman: 're', translation: '有', audio_my: 'ရှိ' }, { my: 'သောက်', roman: 'thauk', translation: '喝', audio_my: 'သောက်' }, { my: 'ပါတယ်', roman: 'ba de', translation: '敬語', audio_my: 'ပါတယ်' }] },
      { burmese: 'မရှိဘူး', roman: 'ma re bu', translation: '沒有 (Don\'t have)', words: [{ my: 'မ', roman: 'ma', translation: '否定', audio_my: 'မ' }, { my: 'ရှိ', roman: 're', translation: '有', audio_my: 'ရှိ' }, { my: 'ဘူး', roman: 'bu', translation: '否定語氣詞', audio_my: 'ဘူး' }] }
    ],
    '時間與日期 (Time & Date)': [
      { burmese: 'အခုနေ့', roman: 'akhu ne', translation: '現在 (Now)', words: [{ my: 'အခု', roman: 'akhu', translation: '現在', audio_my: 'အခု' }, { my: 'နေ့', roman: 'ne', translation: '日', audio_my: 'နေ့' }] },
      { burmese: 'ယနေ့တွေ', roman: 'yan ne twe', translation: '今天 (Today)', words: [{ my: 'ယနေ့', roman: 'yan ne', translation: '今天', audio_my: 'ယနေ့' }, { my: 'တွေ', roman: 'twe', translation: '們', audio_my: 'တွေ' }] },
      { burmese: 'မနက်တော့', roman: 'man kaw tau', translation: '明天 (Tomorrow)', words: [{ my: 'မနက်', roman: 'man kaw', translation: '早晨', audio_my: 'မနက်' }, { my: 'တော့', roman: 'tau', translation: '就', audio_my: 'တော့' }] },
      { burmese: 'မနေ့က', roman: 'man ne ka', translation: '昨天 (Yesterday)', words: [{ my: 'မနေ့', roman: 'man ne', translation: '昨天', audio_my: 'မနေ့' }, { my: 'က', roman: 'ka', translation: '助詞', audio_my: 'က' }] }
    ],
    '大小與數量 (Size & Quantity)': [
      { burmese: 'ကြီး', roman: 'kyi', translation: '大 (Big)', words: [{ my: 'ကြီး', roman: 'kyi', translation: '大', audio_my: 'ကြီး' }] },
      { burmese: 'သောင်း', roman: 'saung', translation: '小 (Small)', words: [{ my: 'သောင်း', roman: 'saung', translation: '小', audio_my: 'သောင်း' }] },
      { burmese: 'ပိုမိုး', roman: 'pu me', translation: '更多 (More)', words: [{ my: 'ပို', roman: 'pu', translation: '更多', audio_my: 'ပို' }, { my: 'မိုး', roman: 'me', translation: '雨', audio_my: 'မိုး' }] },
      { burmese: 'တောင်းပါစေ', roman: 'tauung pa se', translation: '少一點 (Less)', words: [{ my: 'တောင်း', roman: 'tauung', translation: '山', audio_my: 'တောင်း' }, { my: 'ပါစေ', roman: 'pa se', translation: '請', audio_my: 'ပါစေ' }] }
    ],
    '天氣與自然 (Weather & Nature)': [
      { burmese: 'ယနေ့နေ့မွေးလား?', roman: 'yan ne ne mo le?', translation: '今天天氣怎麼樣？ (How is the weather today?)', words: [{ my: 'ယနေ့', roman: 'yan ne', translation: '今天', audio_my: 'ယနေ့' }, { my: 'နေ့', roman: 'ne', translation: '日', audio_my: 'နေ့' }, { my: 'မွေး', roman: 'mo', translation: '生', audio_my: 'မွေး' }, { my: 'လား', roman: 'le', translation: '疑問詞', audio_my: 'လား' }] },
      { burmese: 'နေ့လည်းရေးသွားတယ်', roman: 'ne ne lway re thwa de', translation: '天氣很好 (The weather is nice)', words: [{ my: 'နေ့', roman: 'ne', translation: '日', audio_my: 'နေ့' }, { my: 'လည်း', roman: 'lway', translation: '也', audio_my: 'လည်း' }, { my: 'ရေး', roman: 're', translation: '寫', audio_my: 'ရေး' }, { my: 'သွား', roman: 'thwa', translation: '去', audio_my: 'သွား' }, { my: 'တယ်', roman: 'de', translation: '助詞', audio_my: 'တယ်' }] },
      { burmese: 'နေ့လည်းမရေးဘူး', roman: 'ne ne lway ma re bu', translation: '天氣不好 (The weather is bad)', words: [{ my: 'နေ့', roman: 'ne', translation: '日', audio_my: 'နေ့' }, { my: 'လည်း', roman: 'lway', translation: '也', audio_my: 'လည်း' }, { my: 'မ', roman: 'ma', translation: '否定', audio_my: 'မ' }, { my: 'ရေး', roman: 're', translation: '寫', audio_my: 'ရေး' }, { my: 'ဘူး', roman: 'bu', translation: '否定語氣詞', audio_my: 'ဘူး' }] },
      { burmese: 'အနားမှားတယ်', roman: 'ana hma tau de', translation: "下雨了 (It's raining)", words: [{ my: 'အနား', roman: 'ana', translation: '耳邊', audio_my: 'အနား' }, { my: 'မှား', roman: 'hma', translation: '錯誤', audio_my: 'မှား' }, { my: 'တယ်', roman: 'tau de', translation: '助詞', audio_my: 'တယ်' }] },
      { burmese: 'ငါနှုတ်သားတယ်', roman: 'nga hnute thar de', translation: "我很冷 (I'm cold)", words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'နှုတ်', roman: 'hnute', translation: '嘴', audio_my: 'နှုတ်' }, { my: 'သား', roman: 'thar', translation: '兒子', audio_my: 'သား' }, { my: 'တယ်', roman: 'de', translation: '助詞', audio_my: 'တယ်' }] },
      { burmese: 'နွားတယ်နဲ့ရောင်းပါတယ်', roman: 'na ta ne re aung ba de', translation: '太陽很強 (The sun is strong)', words: [{ my: 'နွား', roman: 'na', translation: '牛', audio_my: 'နွား' }, { my: 'တယ်', roman: 'ta', translation: '助詞', audio_my: 'တယ်' }, { my: 'နဲ့', roman: 'ne', translation: '和', audio_my: 'နဲ့' }, { my: 'ရောင်း', roman: 're aung', translation: '賣', audio_my: 'ရောင်း' }, { my: 'ပါတယ်', roman: 'ba de', translation: '敬語', audio_my: 'ပါတယ်' }] },
      { burmese: 'ယနေ့အနည်းငယ်လဲ?', roman: 'yan anein nyi le?', translation: "今天幾度？ (What's the temperature today?)", words: [{ my: 'ယနေ့', roman: 'yan', translation: '今天', audio_my: 'ယနေ့' }, { my: 'အနည်းငယ်', roman: 'anein nyi', translation: '一點點', audio_my: 'အနည်းငယ်' }, { my: 'လဲ', roman: 'le', translation: '疑問詞', audio_my: 'လဲ' }] },
      { burmese: 'သင်ကောင်းတယ်', roman: 'sing kawng tau de', translation: "風很大 (It's very windy)", words: [{ my: 'သင်', roman: 'sing', translation: '你', audio_my: 'သင်' }, { my: 'ကောင်း', roman: 'kawng', translation: '好', audio_my: 'ကောင်း' }, { my: 'တယ်', roman: 'tau de', translation: '助詞', audio_my: 'တယ်' }] },
      { burmese: 'နောက်တော့', roman: 'na kaw tau', translation: '晴天 (Sunny)', words: [{ my: 'နောက်', roman: 'na', translation: '後', audio_my: 'နောက်' }, { my: 'တော့', roman: 'kaw tau', translation: '就', audio_my: 'တော့' }] },
      { burmese: 'နင်းတားတယ်', roman: 'ning ta de', translation: '陰天 (Cloudy)', words: [{ my: 'နင်း', roman: 'ning', translation: '床', audio_my: 'နင်း' }, { my: 'တား', roman: 'ta', translation: '阻止', audio_my: 'တား' }, { my: 'တယ်', roman: 'de', translation: '助詞', audio_my: 'တယ်' }] },
      { burmese: 'လ', roman: 'la', translation: '月亮 (Moon)', words: [{ my: 'လ', roman: 'la', translation: '月亮', audio_my: 'လ' }] },
      { burmese: 'ကြယ်', roman: 'kyi', translation: '星星 (Star)', words: [{ my: 'ကြယ်', roman: 'kyi', translation: '星星', audio_my: 'ကြယ်' }] }
    ],
    '自我介紹 (Self Introduction)': [
      { burmese: 'ငါအမည်ကို...', roman: 'nga amin kyo...', translation: "我的名字是... (My name is...)", words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'အမည်', roman: 'amin', translation: '名字', audio_my: 'အမည်' }, { my: 'ကို', roman: 'kyo', translation: '受格助詞', audio_my: 'ကို' }, { my: '...', roman: '...', translation: '名稱', audio_my: '...' }] },
      { burmese: 'ငါကနော်တို့မှာ...', roman: 'nga kanao twe ma...', translation: "我來自... (I'm from...)", words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'ကနော်', roman: 'kanao', translation: '從', audio_my: 'ကနော်' }, { my: 'တို့', roman: 'twe', translation: '們', audio_my: 'တို့' }, { my: 'မှာ', roman: 'ma', translation: '在', audio_my: 'မှာ' }, { my: '...', roman: '...', translation: '地點', audio_my: '...' }] },
      { burmese: 'ငါအိတ်ထဲကိုအားလုံးကို...', roman: 'nga ait te kyo a ma lo kyo...', translation: '我喜歡... (I like...)', words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'အိတ်ထဲ', roman: 'ait te', translation: '箱子裡', audio_my: 'အိတ်ထဲ' }, { my: 'ကို', roman: 'kyo', translation: '受格助詞', audio_my: 'ကို' }, { my: 'အားလုံး', roman: 'a ma lo', translation: '全部', audio_my: 'အားလုံး' }, { my: 'ကို', roman: 'kyo', translation: '受格助詞', audio_my: 'ကို' }, { my: '...', roman: '...', translation: '事物', audio_my: '...' }] },
      { burmese: 'ငါမအိတ်ထဲကိုအားလုံးမှာ...', roman: 'nga ma ait te kyo a ma lo hma...', translation: "我不喜歡... (I don't like...)", words: [{ my: 'ငါ', roman: 'nga', translation: '我', audio_my: 'ငါ' }, { my: 'မ', roman: 'ma', translation: '否定', audio_my: 'မ' }, { my: 'အိတ်ထဲ', roman: 'ait te', translation: '箱子裡', audio_my: 'အိတ်ထဲ' }, { my: 'ကို', roman: 'kyo', translation: '受格助詞', audio_my: 'ကို' }, { my: 'အားလုံး', roman: 'a ma lo', translation: '全部', audio_my: 'အားလုံး' }, { my: 'မှာ', roman: 'hma', translation: '在', audio_my: 'မှာ' }, { my: '...', roman: '...', translation: '事物', audio_my: '...' }] }
    ],
    '其他常用語 (Other Common Phrases)': [
      { burmese: 'ဒီကိစ္စကို ဘယ်လိုဖြေရှင်းမလဲ', roman: 'di keik-sa go be lo hpyi-shin ma le', translation: '這件事要怎麼解決？ (How to solve this problem?)', words: [{ my: 'ဒီ', roman: 'di', translation: '這個', audio_my: 'ဒီ' }, { my: 'ကိစ္စ', roman: 'keik-sa', translation: '事情', audio_my: 'ကိစ္စ' }, { my: 'ကို', roman: 'go', translation: '受格助詞', audio_my: 'ကို' }, { my: 'ဘယ်လို', roman: 'be lo', translation: '如何', audio_my: 'ဘယ်လို' }, { my: 'ဖြေရှင်း', roman: 'hpyi-shin', translation: '解決', audio_my: 'ဖြေရှင်း' }, { my: 'မလဲ', roman: 'ma le', translation: '疑問詞', audio_my: 'မလဲ' }] },
      { burmese: 'ကောင်းပါတယ်', roman: 'kaung-ba-de', translation: '很好 (Very good)', words: [{ my: 'ကောင်း', roman: 'kaung', translation: '好', audio_my: 'ကောင်း' }, { my: 'ပါတယ်', roman: 'ba-de', translation: '禮貌用詞', audio_my: 'ပါတယ်' }] },
      { burmese: 'ကျွန်တော်/ကျွန်မ ဗမာစကား မျပောတတ္ဘူး', roman: 'kyun-naw/kyun-ma ba-ma-za-gaa ma-pyau-tat-bu', translation: '我不會說緬甸語', words: [{ my: 'ကျွန်တော်', roman: 'kyun-naw', translation: '我 (男性)', audio_my: 'ကျွန်တော်' }, { my: 'ကျွန်မ', roman: 'kyun-ma', translation: '我 (女性)', audio_my: 'ကျွန်မ' }, { my: 'ဗမာစကား', roman: 'ba-ma-za-gaa', translation: '緬甸語', audio_my: 'ဗမာစကား' }, { my: 'မပြောတတ်', roman: 'ma-pyau-tat', translation: '不會說', audio_my: 'မပြောတတ်' }, { my: 'ဘူး', roman: 'bu', translation: '否定詞', audio_my: 'ဘူး' }] },
      { burmese: 'အကူအညီပါတယ်', roman: 'a kyu ane ba de', translation: '請幫忙 (Please help)', words: [{ my: 'အကူအညီ', roman: 'a kyu ane', translation: '幫助', audio_my: 'အကူအညီ' }, { my: 'ပါတယ်', roman: 'ba de', translation: '敬語', audio_my: 'ပါတယ်' }] },
      { burmese: 'ကျေးဇူးတင်ပါတယ်', roman: 'chay zu tin ba de', translation: '謝謝 (Thank you)', words: [{ my: 'ကျေးဇူးတင်', roman: 'chay zu tin', translation: '感謝', audio_my: 'ကျေးဇူးတင်' }, { my: 'ပါတယ်', roman: 'ba de', translation: '敬語', audio_my: 'ပါတယ်' }] },
      { burmese: 'မလိုလား', roman: 'ma lo la', translation: "不客氣 (You're welcome)", words: [{ my: 'မ', roman: 'ma', translation: '否定', audio_my: 'မ' }, { my: 'လို', roman: 'lo', translation: '需要', audio_my: 'လို' }, { my: 'လား', roman: 'la', translation: '疑問詞', audio_my: 'လား' }] },
      { burmese: 'အားလုံးနဲ့ရှာပါတယ်', roman: 'a ma lo la sha ba de', translation: '對不起 (Sorry)', words: [{ my: 'အားလုံး', roman: 'a ma lo la', translation: '全部', audio_my: 'အားလုံး' }, { my: 'နဲ့', roman: 'sha', translation: '和', audio_my: 'နဲ့' }, { my: 'ရှာ', roman: 'ba', translation: '找', audio_my: 'ရှာ' }, { my: 'ပါတယ်', roman: 'de', translation: '敬語', audio_my: 'ပါတယ်' }] },
      { burmese: 'အားလုံးမဟုတ်တယ်', roman: 'a ma lo moat de', translation: "沒關係 (It's okay)", words: [{ my: 'အားလုံး', roman: 'a ma lo', translation: '全部', audio_my: 'အားလုံး' }, { my: 'မဟုတ်', roman: 'moat', translation: '不是', audio_my: 'မဟုတ်' }, { my: 'တယ်', roman: 'de', translation: '助詞', audio_my: 'တယ်' }] },
      { burmese: 'ဟယ်လို', roman: 'he lo', translation: '你好 (Hello)', words: [{ my: 'ဟယ်လို', roman: 'he lo', translation: '喂', audio_my: 'ဟယ်လို' }] },
      { burmese: 'ဘယ်လိုလဲ', roman: 'be lo le', translation: '再見 (Goodbye)', words: [{ my: 'ဘယ်လို', roman: 'be lo', translation: '怎樣', audio_my: 'ဘယ်လို' }, { my: 'လဲ', roman: 'le', translation: '疑問詞', audio_my: 'လဲ' }] }
    ]
  };

  // ...existing code...

  // 類別合併 mapping：把相似或重複的原始分類標籤轉成更精簡的一組分類
  const categoryMapping = {
    // 範例對照，可再擴充。鍵為原本 vocab 或 categorizedSentences 的分類名稱片段或完整名稱，值為合併後的新分類名稱
    '購物': '購物/金錢',
    'Shopping': '購物/金錢',
    '購物 (Shopping)': '購物/金錢',
    '購物/金錢': '購物/金錢',
    '問路': '問路/觀光',
    '觀光/問路': '問路/觀光',
    '方向與地點': '問路/觀光',
    '問候': '問候/禮貌與回應',
    '問候/禮貌': '問候/禮貌與回應',
    '表達與回應 (Expressions & Responses)': '問候/禮貌與回應',
    '表達與回應': '問候/禮貌與回應',
    '時間與日期': '時間/天氣/基礎詞',
    '天氣與自然': '時間/天氣/基礎詞',
    '疑問詞': '疑問/基礎詞',
    '疑問詞 (Question Words)': '疑問/基礎詞',
    '人稱代詞 (Pronouns)': '代詞/基礎詞',
    '指示代詞 (Demonstratives)': '代詞/基礎詞',
    '大小與數量': '數量/大小',
    '數字': '數量/大小',
    '其他常用語': '其他常用語',
    '基本問候 (Basic Greetings)': '問候/禮貌與回應',
    '語言交流 (Language Communication)': '語言交流',
    '求助與協助 (Help & Assistance)': '求助/協助',
    '擁有與需求 (Possession & Desire)': '擁有/需求',
    '情感表達 (Emotions & Feelings)': '情感表達',
    '自我介紹 (Self Introduction)': '自我介紹'
  };

  // 生成 mergedSentences，shape 與 categorizedSentences 相容；會把原始分類透過 mapping 正規化
  const mergedSentences = (() => {
    const result = {};

    const normalizeCategory = (origCat) => {
      if (!origCat) return origCat;
      // 先嘗試完全匹配
      if (categoryMapping[origCat]) return categoryMapping[origCat];
      // 若沒有完全匹配，嘗試以部分關鍵字來匹配
      const key = Object.keys(categoryMapping).find(k => origCat.includes(k));
      if (key) return categoryMapping[key];
      // default: 使用原始名稱
      return origCat;
    };

    // 從 categorizedSentences 加入（並 normalize 分類）
    Object.keys(categorizedSentences).forEach(origCat => {
      const nCat = normalizeCategory(origCat);
      if (!result[nCat]) result[nCat] = [];
      // push 所有原有句子
      categorizedSentences[origCat].forEach(s => result[nCat].push(s));
    });

    // 再把 vocab 的條目轉成 sentence-like 並加入
    Object.keys(vocab).forEach(origCat => {
      const entries = vocab[origCat] || [];
      const nCat = normalizeCategory(origCat);
      if (!result[nCat]) result[nCat] = [];
      entries.forEach(e => {
        result[nCat].push({
          burmese: e.burmese,
          roman: e.roman,
          translation: e.chinese,
          words: []
        });
      });
    });

    return result;
  })();

  // 分類列表與目前選擇的分類（預設選第一個分類以避免一次顯示太多）
  const categories = Object.keys(mergedSentences || {});
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if ((selectedCategory === 'all' || !selectedCategory) && categories.length > 0) {
      // 預設選第一個分類
      setSelectedCategory(categories[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

  function renderCategoryNav() {
    if (!categories || categories.length === 0) return null;
    return (
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
    );
  }

  function speak(textToSpeak) {
    if (!textToSpeak) return;

    // 優先使用瀏覽器內建的 SpeechSynthesis（較穩定且不依賴網路 TTS）
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        // 取消任何尚未播放完的 utterances，避免重疊
        window.speechSynthesis.cancel();
        const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
        // 嘗試尋找明確支援緬甸語 (lang startsWith 'my') 的 voice
        const myVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('my'));
        if (myVoice) {
          const utter = new SpeechSynthesisUtterance(textToSpeak);
          utter.lang = 'my';
          try { utter.voice = myVoice; } catch(e) {}
          utter.volume = 1;
          utter.rate = 1;
          console.log('speak(): using SpeechSynthesis with Burmese voice=', myVoice.name);
          window.speechSynthesis.speak(utter);
          return;
        } else {
          console.log('speak(): no Burmese voice found, voices=', voices.map(v=>v.lang+"/"+v.name));
          // 若沒有明確的緬甸語音，改用 audio fallback（Google TTS）
        }
      } catch (e) {
        console.warn('SpeechSynthesis failed, fallback to audio:', e);
      }
    }

    // 回退：使用 Google TTS via new Audio
    // 如果在本機開發環境，指向我們的 proxy endpoint，避免瀏覽器直接向 Google TTS 發生格式或 CORS 問題
    // 在 Netlify 上也使用 proxy endpoint
    const isLocal = window && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const isNetlify = window && window.location && (window.location.hostname.includes('netlify') || window.location.hostname.includes('-burmese'));
    const useProxy = isLocal || isNetlify;
    
    // 調試信息
    console.log('Environment detection:', {
      hostname: window?.location?.hostname,
      isLocal,
      isNetlify,
      useProxy
    });
    
    // 生成多個可能的 URLs 來嘗試
    const urlsToTry = [
      useProxy
        ? isLocal 
          ? `http://localhost:${config.TTS_PORT}/tts?q=${encodeURIComponent(textToSpeak)}`
          : `/tts?q=${encodeURIComponent(textToSpeak)}`  // Netlify function path
        : null,
      useProxy
        ? `/.netlify/functions/tts?q=${encodeURIComponent(textToSpeak)}`  // Netlify function full path
        : null,
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textToSpeak)}&tl=my&client=tw-ob`  // Direct Google TTS
    ].filter(url => url !== null); // 過濾掉 null 值

    console.log('TTS URLs to try:', urlsToTry);

    // 嘗試播放音訊的函數
    const tryPlayUrl = (url) => {
      return new Promise((resolve, reject) => {
        const audio = audioRef.current || new Audio();
        audio.src = url;
        audio.oncanplaythrough = () => resolve({ audio, url });
        audio.onerror = (e) => reject({ error: e, url });
        const playPromise = audio.play();
        if (playPromise) {
          playPromise.catch(e => reject({ error: e, url }));
        }
      });
    };

    // 依次嘗試所有 URLs
    const tryAllUrls = async (urls) => {
      for (const url of urls) {
        try {
          console.log('Trying TTS URL:', url);
          const result = await tryPlayUrl(url);
          console.log('Successfully played audio with URL:', result.url);
          return result;
        } catch (error) {
          console.warn('Failed to play with URL:', url, error);
        }
      }
      throw new Error('All TTS URLs failed');
    };

    // 執行播放嘗試
    tryAllUrls(urlsToTry).catch((error) => {
      console.error('All TTS URLs failed to play audio:', error);
    });
  }

  // 測試使用 WebAudio 產生簡短的測試音，用來確認頁面音訊輸出是否正常
  function playTestTone() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880; // A5
      g.gain.value = 0.05; // 小音量避免突兀
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        try { ctx.close(); } catch (e) {}
      }, 300);
      console.log('playTestTone: played WebAudio beep');
    } catch (e) {
      console.warn('playTestTone failed', e);
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
            <div className="sentence-card" key={i}>
              <p className="font-myanmar" style={{ fontSize: '20px' }}>{s.burmese}</p>
              <p style={{ marginTop: 8, color: '#9fb1b8' }}>{s.roman}</p>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="sentence-meta">{s.translation}</div>
                <button className="play-sentence-btn" onClick={() => playFullSentence(s)} aria-label="播放句子">
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
            <button className="nav-btn" onClick={() => playTestTone()} aria-label="播放測試音">播放測試音</button>
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
              {renderCategoryNav()}
              {renderSentenceCards()}
            </div>
          )}

          {/* vocab page removed per request */}
        </main>
      </div>
    </div>
  );
}

export default App;
