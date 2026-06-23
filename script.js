const btn = document.getElementById("talkBtn");
const questionBox = document.getElementById("kali-question");
const answerBox = document.getElementById("kali-answer");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = "cs-CZ";
recognition.interimResults = false;

btn.onclick = () => {
  recognition.start();
  questionBox.innerText = "🎤 Poslouchám...";
  answerBox.innerText = "";
};

recognition.onresult = async (event) => {
  const text = event.results[0][0].transcript;
  questionBox.innerText = "Klient: " + text;

  let answer = "Přesnou informaci prosím ověřte na www.studiokali.cz.";

  const q = text.toLowerCase();

  if (q.includes("cena") || q.includes("kolik")) {
    answer = "Ceny najdete na www.studiokali.cz, objednat se můžete také přes náš web.";
  }

  if (q.includes("adresa") || q.includes("kde")) {
    answer = "Studio Kali najdete na adrese Bělehradská 994/68, Praha 2.";
  }

  if (q.includes("objednat") || q.includes("rezervace")) {
    answer = "Objednat se můžete přímo na www.studiokali.cz.";
  }

  if (q.includes("melír") || q.includes("balayage") || q.includes("barvení")) {
    answer = "Ve Studiu Kali se specializujeme na barvení, melír, balayage a blond služby.";
  }

  answerBox.innerText = "Jirka AI: " + answer;

  const voice = new SpeechSynthesisUtterance(answer);
  voice.lang = "cs-CZ";
  voice.rate = 0.95;
  speechSynthesis.speak(voice);
};
