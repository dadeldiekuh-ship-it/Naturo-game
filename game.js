// ==== NARUTO ROSTER (gekürzt – du kannst die große Liste einsetzen) ====
const roster = [
  "Naruto Uzumaki","Sasuke Uchiha","Sakura Haruno","Kakashi Hatake",
  "Itachi Uchiha","Madara Uchiha","Obito Uchiha","Jiraiya",
  "Tsunade","Might Guy","Shikamaru Nara","Gaara","Pain","Konan"
];

// Spielzustand
let pool = [...roster];
let currentChar = null;
let rerollUsed = false;
let ready = false;

const slots = {
  supporter1: null,
  supporter2: null,
  tag1: null,
  tag2: null,
  leader: null,
  viceLeader: null,
  tank: null,
  healer: null
};

const slotNames = {
  supporter1: "Supporter 1",
  supporter2: "Supporter 2",
  tag1: "Tag Team 1",
  tag2: "Tag Team 2",
  leader: "Leader",
  viceLeader: "Vice Leader",
  tank: "Tank",
  healer: "Healer"
};

function renderSlots() {
  const el = document.getElementById("slots");
  el.innerHTML = "";
  for (const key in slots) {
    const div = document.createElement("div");
    div.className = "slot";
    div.innerHTML = `<b>${slotNames[key]}</b><br>${slots[key] || "— leer —"}`;
    div.onclick = () => assignChar(key);
    el.appendChild(div);
  }
}

function drawChar() {
  if (currentChar || pool.length === 0) return;
  const i = Math.floor(Math.random() * pool.length);
  currentChar = pool.splice(i, 1)[0];
  document.getElementById("currentChar").innerText = currentChar;
}

function reroll() {
  if (!currentChar || rerollUsed) return;
  rerollUsed = true;
  drawChar();
}

function assignChar(slot) {
  if (!currentChar || slots[slot]) return;
  slots[slot] = currentChar;
  currentChar = null;
  document.getElementById("currentChar").innerText = "—";
  renderSlots();
}

function readyUp() {
  ready = true;
  alert("Ready! Wenn dein Kumpel auch fertig ist → Start Fight.");
}

function copyFightPrompt() {
  const team = Object.entries(slots)
    .map(([k,v]) => `${slotNames[k]}: ${v || "—"}`)
    .join("\n");

  const prompt = `
Entscheide diesen Naruto Fight.

Regeln:
- Naruto Canon only
- Boruto ❌
- Prime Forms ✅
- Edo Tensei ❌

TEAM A:
${team}

Gib aus:
- Gewinner
- Warum
- Wie klar (Confidence)
`;

  const box = document.getElementById("promptBox");
  box.value = prompt.trim();
  box.select();
  document.execCommand("copy");
  alert("Prompt kopiert! In ChatGPT einfügen 👊");
}

renderSlots();
