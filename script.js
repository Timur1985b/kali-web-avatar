import * as THREE from "https://esm.sh/three@0.160.0";
import { GLTFLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const MODEL_URL = "https://drive.google.com/uc?export=download&id=1uVoTvmGgTXifaQQCoWjAYujR_zaTpXwQ";

const avatarBox = document.getElementById("avatar3d");
const btn = document.getElementById("talkBtn");
const questionBox = document.getElementById("kali-question");
const answerBox = document.getElementById("kali-answer");

let scene, camera, renderer, avatar;

function init3D() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(35, avatarBox.clientWidth / avatarBox.clientHeight, 0.1, 100);
  camera.position.set(0, 1.4, 4);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(avatarBox.clientWidth, avatarBox.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  avatarBox.appendChild(renderer.domElement);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 2);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 2);
  dir.position.set(0, 2, 4);
  scene.add(dir);

  const loader = new GLTFLoader();

  loader.load(
    MODEL_URL,
    (gltf) => {
      avatar = gltf.scene;
      avatar.scale.set(1.5, 1.5, 1.5);
      avatar.position.set(0, -1.4, 0);
      scene.add(avatar);
      answerBox.innerText = "Jirka AI je připraven.";
    },
    undefined,
    (error) => {
      console.error("GLB ERROR:", error);
      answerBox.innerText = "3D avatar se nepodařilo načíst.";
    }
  );

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  if (avatar) {
    avatar.rotation.y = Math.sin(Date.now() * 0.001) * 0.08;
  }

  renderer.render(scene, camera);
}

init3D();

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  answerBox.innerText = "Tento prohlížeč nepodporuje hlasové ovládání.";
} else {
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
      answer = "Ceny najdete na www.studiokali.cz.";
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
}
