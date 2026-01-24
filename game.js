// ======= ROSTER =======
// Du kannst hier deine große Naruto-Liste einfügen.
// Wichtig: Nur Naruto/Shippuden, Boruto nein, Edo nein (Regel im Prompt).
const roster = [
  "Naruto Uzumaki","Sasuke Uchiha","Sakura Haruno","Kakashi Hatake",
  "Might Guy","Rock Lee","Neji Hyuga","Tenten","Hinata Hyuga",
  "Kiba Inuzuka","Shino Aburame","Shikamaru Nara","Ino Yamanaka","Choji Akimichi",
  "Asuma Sarutobi","Kurenai Yuhi","Iruka Umino","Jiraiya","Tsunade","Orochimaru",
  "Hiruzen Sarutobi","Minato Namikaze","Kushina Uzumaki","Danzo Shimura","Yamato","Sai",
  "Itachi Uchiha","Madara Uchiha","Obito Uchiha","Shisui Uchiha",
  "Pain (Nagato)","Konan","Kisame Hoshigaki","Deidara","Sasori","Hidan","Kakuzu","Zetsu",
  "Gaara","Kankuro","Temari","A (Fourth Raikage)","Killer Bee","Darui",
  "Onoki","Mei Terumi","Kabuto Yakushi","Suigetsu Hozuki","Karin","Jugo","Kimimaro",
  "Haku","Zabuza Momochi","Hashirama Senju","Tobirama Senju","Black Zetsu","White Zetsu"
];

// ======= SETTINGS =======
const SLOTS = [
  ["supporter1","Supporter 1"],
  ["supporter2","Supporter 2"],
  ["tag1","Tag Team 1"],
  ["tag2","Tag Team 2"],
  ["leader","Leader"],
  ["viceLeader","Vice Leader"],
  ["tank","Tank"],
  ["healer","Healer"]
];

function emptySlotsObj(){
  return Object.fromEntries(SLOTS.map(([k]) => [k, null]));
}

// ======= STATE =======
let pool, turn, teamA, teamB;

function resetMatch(){
  pool = [...roster];           // globaler Pool
  turn = "A";                   // A startet
  teamA = { currentDraw: null, rerollUsed: false, ready: false, slots: emptySlotsObj() };
  teamB = { currentDraw: null, rerollUsed: false, ready: false, slots: emptySlotsObj() };
  renderAll();
  updatePrompt();
}

function drawFromPool(){
  if (pool.length === 0) return null;
  const i = Math.floor(Math.random() * pool.length);
  const c = pool[i];
  pool.splice(i, 1); // remove => no duplicates
  return c;
}

function getTeam(which){ return which === "A" ? teamA : teamB; }

function allFilled(team){
  return Object.values(team.slots).every(v => v);
}

// ======= ACTIONS =======
function draw(which){
  if (turn !== which) return alert(`Du bist nicht dran. Turn ist Team ${turn}.`);
  const t = getTeam(which);
  if (t.currentDraw) return;
  if (t.ready) t.ready = false;

  const c = drawFromPool();
  if (!c) return alert("Pool leer.");
  t.currentDraw = c;
  renderAll();
}

function reroll(which){
  if (turn !== which) return alert(`Du bist nicht dran. Turn ist Team ${turn}.`);
  const t = getTeam(which);
  if (!t.currentDraw) return;
  if (t.rerollUsed) return alert("Reroll schon benutzt (1x pro Match).");

  // Reroll = BAN: currentDraw bleibt weg und kommt nicht zurück in den Pool
  t.rerollUsed = true;
  t.currentDraw = null;          // wichtig!
  const c = drawFromPool();
  if (!c) return alert("Pool leer.");
  t.currentDraw = c;

  renderAll();
}

function assign(which, slotKey){
  if (turn !== which) return alert(`Du bist nicht dran. Turn ist Team ${turn}.`);
  const t = getTeam(which);
  if (!t.currentDraw) return;
  if (t.slots[slotKey]) return;

  t.slots[slotKey] = t.currentDraw;
  t.currentDraw = null;
  t.ready = false;
  renderAll();
}

function ready(which){
  if (turn !== which) return alert(`Du bist nicht dran. Turn ist Team ${turn}.`);
  const t = getTeam(which);
  if (t.currentDraw) return alert("Erst Assignen, dann Ready.");
  t.ready = true;

  // Turn wechseln
  turn = (turn === "A") ? "B" : "A";
  renderAll();
  updatePrompt();
}

// ======= PROMPT =======
function makePrompt(){
  const formatTeam = (label, t) => {
    const lines = SLOTS.map(([key,name]) => `${name}: ${t.slots[key] || "—"}`).join("\n");
    return `TEAM ${label}:\n${lines}`;
  };

  return `Entscheide diesen Naruto Fight.

Regeln:
- Naruto Canon only
- Boruto ❌
- Prime Forms ✅
- Edo Tensei ❌
- Beide Teams sind "alive" Versionen (kein Edo)

Gib aus:
- Gewinner (Team A oder Team B)
- Warum (3-6 Gründe)
- Wie klar (Confidence 0-1)

${formatTeam("A", teamA)}

${formatTeam("B", teamB)}
`;
}

function updatePrompt(){
  const ok = allFilled(teamA) && allFilled(teamB) && teamA.ready && teamB.ready;
  const btn = document.getElementById("copyPromptBtn");
  btn.disabled = !ok;

  const box = document.getElementById("promptBox");
  box.value = ok ? makePrompt() : "";
}

// ======= UI RENDER =======
function renderTeam(which){
  const t = getTeam(which);
  const slotsEl = document.getElementById(which === "A" ? "slotsA" : "slotsB");
  slotsEl.innerHTML = "";

  for (const [key,label] of SLOTS){
    const b = document.createElement("button");
    b.className = "slot";
    b.disabled = !!t.slots[key] || !t.currentDraw || turn !== which;
    b.innerHTML = `<b>${label}</b><div class="val">${t.slots[key] || "— leer —"}</div>`;
    b.onclick = () => assign(which, key);
    slotsEl.appendChild(b);
  }

  document.getElementById(which === "A" ? "drawA" : "drawB").innerText = t.currentDraw || "—";
  document.getElementById(which === "A" ? "rerollA" : "rerollB").innerText = t.rerollUsed ? "❌" : "✅";
}

function renderAll(){
  document.getElementById("turnLabel").innerText = `Team ${turn}`;
  document.getElementById("poolLeft").innerText = String(pool.length);

  // Buttons enable/disable
  const aActive = turn === "A";
  const bActive = turn === "B";

  document.getElementById("drawBtnA").disabled = !aActive || !!teamA.currentDraw || teamA.ready || pool.length === 0;
  document.getElementById("rerollBtnA").disabled = !aActive || !teamA.currentDraw || teamA.rerollUsed;
  document.getElementById("readyBtnA").disabled = !aActive || !!teamA.currentDraw;

  document.getElementById("drawBtnB").disabled = !bActive || !!teamB.currentDraw || teamB.ready || pool.length === 0;
  document.getElementById("rerollBtnB").disabled = !bActive || !teamB.currentDraw || teamB.rerollUsed;
  document.getElementById("readyBtnB").disabled = !bActive || !!teamB.currentDraw;

  renderTeam("A");
  renderTeam("B");
}

// ======= EVENTS =======
document.getElementById("drawBtnA").addEventListener("click", () => draw("A"));
document.getElementById("rerollBtnA").addEventListener("click", () => reroll("A"));
document.getElementById("readyBtnA").addEventListener("click", () => ready("A"));

document.getElementById("drawBtnB").addEventListener("click", () => draw("B"));
document.getElementById("rerollBtnB").addEventListener("click", () => reroll("B"));
document.getElementById("readyBtnB").addEventListener("click", () => ready("B"));

document.getElementById("resetBtn").addEventListener("click", resetMatch);

document.getElementById("copyPromptBtn").addEventListener("click", () => {
  const box = document.getElementById("promptBox");
  box.select();
  document.execCommand("copy");
  alert("Prompt kopiert! In ChatGPT einfügen ✅");
});

// Start
resetMatch();
