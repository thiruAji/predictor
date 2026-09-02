import { useState, useEffect, useRef, useCallback } from "react";

const WORD_TO_DIGIT = {
  "1": "1", "one": "1", "won": "1",
  "2": "2", "two": "2", "to": "2", "too": "2",
  "3": "3", "three": "3", "tree": "3",
  "4": "4", "four": "4", "for": "4", "fore": "4",
  "5": "5", "five": "5",
  "6": "6", "six": "6", "sex": "6", "fix": "6"
};

export function parseSpokenDigits(text) {
  if (!text) return "";
  const cleanedText = String(text).toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokens = cleanedText.split(/\s+/).filter(Boolean);
  
  let digits = "";
  tokens.forEach(token => {
    // Check if token contains explicit digits
    const matchedDigits = token.match(/[1-6]/g);
    if (matchedDigits) {
      digits += matchedDigits.join("");
    } else if (WORD_TO_DIGIT[token]) {
      digits += WORD_TO_DIGIT[token];
    }
  });

  return digits;
}

export function chunkDigitsToTriplets(digitStr) {
  const clean = String(digitStr || "").replace(/[^1-6]/g, "");
  const triplets = [];
  let remainder = "";

  for (let i = 0; i < clean.length; i += 3) {
    const chunk = clean.slice(i, i + 3);
    if (chunk.length === 3) {
      triplets.push(chunk);
    } else {
      remainder = chunk;
    }
  }

  return { triplets, remainder };
}

export function useVoiceInput(onVoiceTriplets) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceError, setVoiceError] = useState(null);
  const recognitionRef = useRef(null);

  const isSupported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError(null);
    };

    recognition.onresult = (event) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript + " ";
      }

      setTranscript(currentTranscript);
      const parsedDigits = parseSpokenDigits(currentTranscript);

      if (parsedDigits.length >= 3) {
        const { triplets, remainder } = chunkDigitsToTriplets(parsedDigits);
        if (triplets.length > 0 && onVoiceTriplets) {
          onVoiceTriplets(triplets, remainder);
          setTranscript("");
        }
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        setVoiceError(event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [isSupported, onVoiceTriplets]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      alert("Voice input is not supported on this browser. Try Chrome or Safari.");
      return;
    }

    setTranscript("");
    setVoiceError(null);

    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.warn("Error starting recognition", e);
      try {
        recognitionRef.current?.stop();
        setTimeout(() => recognitionRef.current?.start(), 150);
      } catch (err) {
        setVoiceError("Could not start microphone.");
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore stop errors
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    transcript,
    voiceError,
    startListening,
    stopListening,
    toggleListening
  };
}
