if (!('webkitSpeechRecognition' in window)) {
  alert('Web Speech API is not supported in this browser. Please use Chrome or Edge.');
} else {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  const synth = window.speechSynthesis;
  let aiVoice;
  let conversationHistory = []; 
    if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = () => {
      const voices = synth.getVoices();
      aiVoice = voices.find(voice => voice.name.includes('Google UK English Female') || voice.name.includes('Female'));
    };
  }

  const apiKey = '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'; 
  const apiUrl = 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill';

  async function chatWithBlenderBot(userInput) {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: userInput })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Hugging Face');
    }

    const data = await response.json();
    return data[0].generated_text;
  }

  async function handleUserInput(userInput) {
    conversationHistory.push(`User: ${userInput}`);

    const aiResponse = await chatWithBlenderBot(userInput);
    console.log(`AI Response: ${aiResponse}`);
    return aiResponse;
  }

  recognition.onresult = async (event) => {
    const spokenText = event.results[0][0].transcript.toLowerCase();
    document.getElementById("userSpeech").textContent = `You: "${spokenText}"`;

    const response = await handleUserInput(spokenText);

    document.getElementById("aiResponse").textContent = `AI: "${response}"`;

    const utterance = new SpeechSynthesisUtterance(response);
    utterance.pitch = spokenText.includes('joke') ? 1.5 : spokenText.includes('sad') ? 0.9 : 1.2;
    utterance.rate = 1.2;
    utterance.voice = aiVoice || synth.getVoices()[0];
    synth.speak(utterance);
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
    alert("Speech recognition error: " + event.error);
  };

  recognition.onstart = () => {
    console.log("Speech recognition started...");
    document.getElementById("start-btn").textContent = "Listening...";
  };

  recognition.onend = () => {
    console.log("Speech recognition ended.");
    document.getElementById("start-btn").textContent = "Start";
  };

  document.getElementById("start-btn").addEventListener("click", () => {
    recognition.start();
    console.log("Speech recognition started...");
  });
}
