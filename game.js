// ======= ROSTER =======
// Hier kannst du deine große Liste einsetzen.
// Wichtig: keine Duplikate nötig, Pool macht das.
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
  "Haku","Zabuza Momochi","Hashirama Senju","Tobirama Senju","Black Zetsu","White Zetsu","chouza akamichi","Shikaku nara","Oma Chino","choujuru", "ginkaku", "kinkaku", "mei temuri","sakumo hatake","mifune", "
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
let pool = [];
let turn = "A"; // A starts
let teamA = {};
let teamB = {};

function resetMatch(){
  pool = [...roster];
  turn = "A";
  teamA = { currentDraw: null, rerollUsed: false, slots: emptySlotsObj() };
  teamB = { currentDraw: null, rerollUsed: false, slots: emptySlotsObj() };
  renderAll();
  updatePrompt();
}

function drawFromPool(){
  if (pool.length === 0) return null;
  const i = Math.floor(Math.random() * pool.length);
  const c = pool[i];
  pool.splice(i, 1);
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
  if (t.currentDraw) return; // already drawn

  const c = drawFromPool();
  if (!c) return alert("Pool leer.");
  t.currentDraw = c;
  renderAll();
}

function reroll(which){
  if (turn !== which) return alert(`Du bist nicht dran. Turn ist Team ${turn}.`);
  const t = getTeam(which);
  if (!t.currentDraw) return;
  if (t.rerollUsed) return alert("Reroll schon benutzt (1x pro Team).");

  // Reroll = ban current draw (stays removed)
  t.rerollUsed = true;
  t.currentDraw = null;

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

  // TURN WECHSEL AUTOMATISCH NACH ASSIGN
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
- Beziehe Team-Synergien, Rollen (Leader, Tank, Healer) und bekannte Lore-Feats mit ein.

Gib aus:
- Gewinner (Team A oder Team B)
- Warum (3-6 Gründe)
- Wie klar (Confidence 0-1)

${formatTeam("A", teamA)}

${formatTeam("B", teamB)}
`;
}

function updatePrompt(){
  const ok = allFilled(teamA) && allFilled(teamB);
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
  // Falls IDs fehlen (wenn HTML geändert), bricht sonst alles ab => wir prüfen kurz
  const must = ["turnLabel","poolLeft","drawBtnA","rerollBtnA","drawBtnB","rerollBtnB","slotsA","slotsB","copyPromptBtn","promptBox","drawA","drawB","rerollA","rerollB"];
  for (const id of must){
    if (!document.getElementById(id)){
      console.error("Missing element id:", id);
      return;
    }
  }

  document.getElementById("turnLabel").innerText = `Team ${turn}`;
  document.getElementById("poolLeft").innerText = String(pool.length);

  const aActive = turn === "A";
  const bActive = turn === "B";

  document.getElementById("drawBtnA").disabled = !aActive || !!teamA.currentDraw || pool.length === 0;
  document.getElementById("rerollBtnA").disabled = !aActive || !teamA.currentDraw || teamA.rerollUsed;

  document.getElementById("drawBtnB").disabled = !bActive || !!teamB.currentDraw || pool.length === 0;
  document.getElementById("rerollBtnB").disabled = !bActive || !teamB.currentDraw || teamB.rerollUsed;

  renderTeam("A");
  renderTeam("B");
}

// ======= EVENTS (nach DOM load) =======
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("drawBtnA").addEventListener("click", () => draw("A"));
  document.getElementById("rerollBtnA").addEventListener("click", () => reroll("A"));

  document.getElementById("drawBtnB").addEventListener("click", () => draw("B"));
  document.getElementById("rerollBtnB").addEventListener("click", () => reroll("B"));

  document.getElementById("resetBtn").addEventListener("click", resetMatch);

  document.getElementById("copyPromptBtn").addEventListener("click", () => {
    const box = document.getElementById("promptBox");
    box.select();
    document.execCommand("copy");
    alert("Prompt kopiert! In ChatGPT einfügen ✅");
  });

  resetMatch();
});
