import * as THREE from "https://esm.sh/three@0.160.0";
import { GLTFLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const MODEL_URL = "https://auas2uhkirnelrty.public.blob.vercel-storage.com/jirka_rigged.glb";

const avatarBox = document.getElementById("avatar3d");
const btn = document.getElementById("talkBtn");
const questionBox = document.getElementById("kali-question");
const answerBox = document.getElementById("kali-answer");

let scene, camera, renderer, avatar;
let mouthMesh = null;
let mouthIndex = null;

function init3D() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    35,
    avatarBox.clientWidth / avatarBox.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.6, 6);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(avatarBox.clientWidth, avatarBox.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  avatarBox.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 2));

  const dir = new THREE.DirectionalLight(0xffffff, 2);
  dir.position.set(0, 2, 4);
  scene.add(dir);

  const loader = new GLTFLoader();

  loader.load(
    MODEL_URL,
    (gltf) => {
      avatar = gltf.scene;

      avatar.scale.set(0.04, 0.04, 0.04);
      avatar.position.set(0, -0.5, 0);
      avatar.rotation.y = 0;

      scene.add(avatar);

      avatar.traverse((obj) => {
        if (obj.isMesh && obj.morphTargetDictionary) {
          console.log("MORPHS:", obj.name, obj.morphTargetDictionary);

          if (obj.morphTargetDictionary.jawOpen !== undefined) {
            mouthMesh = obj;
            mouthIndex = obj.morphTargetDictionary.jawOpen;

            window.mouthMesh = mouthMesh;
            window.mouthIndex = mouthIndex;

            console.log("MOUTH FOUND:", obj.name, mouthIndex);
          }
        }
      });

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

function startMouthAnimation(audio) {
  if (!mouthMesh || mouthIndex === null) return;

  let t = 0;

const mouthAnim = setInterval(() => {

  t += 0.25;

  const value =
    0.5 +
    Math.abs(Math.sin(t)) * 0.18;

  mouthMesh.morphTargetInfluences[mouthIndex] = value;

}, 60);

  audio.onended = () => {
    clearInterval(mouthAnim);
    mouthMesh.morphTargetInfluences[mouthIndex] = 0;
  };
}

init3D();

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  answerBox.innerText = "Tento prohlížeč nepodporuje hlasové ovládání.";
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = "cs-CZ";
  recognition.interimResults = false;

  btn.onclick = async () => {

  try {
    const unlock = new Audio();
    unlock.src =
      "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAA";
    await unlock.play().catch(() => {});
  } catch (e) {}

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
      console.log("TTS SIZE:", audioBlob.size);
      alert("TTS SIZE: " + audioBlob.size);
      const audioUrl = URL.createObjectURL(audioBlob);
     const audio = new Audio(audioUrl);

audio.playsInline = true;
audio.autoplay = true;

startMouthAnimation(audio);

await audio.play().catch(err => {
  console.error("AUDIO PLAY ERROR:", err);
});

    } catch (e) {
      console.error("TTS ERROR:", e);
    }
  };
}
