import * as THREE from "https://esm.sh/three@0.160.0";
import { GLTFLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const MODEL_URL = "https://auas2uhkirnelrty.public.blob.vercel-storage.com/jirka_rigged.glb";

const avatarBox = document.getElementById("avatar3d");
const btn = document.getElementById("talkBtn");
const questionBox = document.getElementById("kali-question");
const answerBox = document.getElementById("kali-answer");

let scene, camera, renderer, avatar;
let mouthMesh = null;
let audioAnalyser = null;
let audioData = null;

function init3D() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(35, avatarBox.clientWidth / avatarBox.clientHeight, 0.1, 100);
  camera.position.set(0, 1.6, 6);

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

    avatar.scale.set(0.04, 0.04, 0.04);
    avatar.position.set(0, -0.50, 0);
    avatar.rotation.y = 0;

    scene.add(avatar);
    avatar.traverse((obj) => {

  if (obj.isMesh) {
    console.log("MESH:", obj.name);

    if (obj.morphTargetDictionary) {

      console.log(
        "MORPHS:",
        obj.name,
        obj.morphTargetDictionary
      );

      if (
        obj.morphTargetDictionary.jawOpen !== undefined ||
        obj.morphTargetDictionary.mouthOpen !== undefined
      ) {
        mouthMesh = obj;
        console.log("MOUTH FOUND:", obj.name);
      }
    }
  }

});

window.avatarTest = avatar;
console.log("AVATAR LOADED", avatar);

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

   answerBox.innerText = "Jirka AI přemýšlí...";

const res = await fetch("/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ message: text })
});

const data = await res.json();
const answer = data.answer || "Omlouvám se, nerozuměl jsem.";

    answerBox.innerText = "Jirka AI: " + answer;

    try {
  const ttsRes = await fetch("/api/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: answer })
  });

  const audioBlob = await ttsRes.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
      const mouthAnim = setInterval(() => {
  if (window.mouthMesh && window.mouthMesh.morphTargetInfluences) {
    window.mouthMesh.morphTargetInfluences[window.mouthIndex] =
      Math.random() * 0.8;
  }
}, 100);

audio.onended = () => {
  clearInterval(mouthAnim);

  if (window.mouthMesh && window.mouthMesh.morphTargetInfluences) {
    window.mouthMesh.morphTargetInfluences[window.mouthIndex] = 0;
  }
};

} catch (e) {
  console.error("TTS ERROR:", e);
}
  };
}
