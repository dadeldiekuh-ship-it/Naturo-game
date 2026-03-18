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
  "Haku","Zabuza Momochi","Hashirama Senju","Tobirama Senju","Black Zetsu","White Zetsu","chouza akamichi","Shikaku nara","Oma Chino","choujuru", "ginkaku", "kinkaku", "mei temuri","sakumo hatake","mifune",
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

  document.getElementById("pokemonDrawBtnA").addEventListener("click", () => {
    drawThreePokemon("A");
  });

  document.getElementById("pokemonDrawBtnB").addEventListener("click", () => {
    drawThreePokemon("B");
  });

  document.getElementById("pokemonResetBtn").addEventListener("click", () => {
    resetPokemonMatch();
  });

  document.getElementById("pokemonCopyPromptBtn").addEventListener("click", () => {
    const box = document.getElementById("pokemonPromptBox");
    box.select();
    document.execCommand("copy");
    alert("Pokémon-Prompt kopiert! In ChatGPT einfügen ✅");
  });
  resetMatch();
  resetPokemonMatch();
});
function showTab(tabId, buttonElement) {
  document.querySelectorAll(".tab-content").forEach(tab => {
    tab.classList.remove("active");
  });
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  document.getElementById(tabId).classList.add("active");
  buttonElement.classList.add("active");
}
const pokemonRoster = [
  "Bisasam","Bisaknosp","Bisaflor",
  "Glumanda","Glutexo","Glurak",
  "Schiggy","Schillok","Turtok",
  "Raupy","Safcon","Smettbo",
  "Hornliu","Kokuna","Bibor",
  "Taubsi","Tauboga","Tauboss",
  "Rattfratz","Rattikarl",
  "Habitak","Ibitak",
  "Rettan","Arbok",
  "Pikachu","Raichu",
  "Sandan","Sandamer",
  "Nidoran♀","Nidorina","Nidoqueen",
  "Nidoran♂","Nidorino","Nidoking",
  "Piepi","Pixi",
  "Vulpix","Vulnona",
  "Pummeluff","Knuddeluff",
  "Zubat","Golbat",
  "Myrapla","Duflor","Giflor",
  "Paras","Parasek",
  "Bluzuk","Omot",
  "Digda","Digdri",
  "Mauzi","Snobilikat",
  "Enton","Entoron",
  "Menki","Rasaff",
  "Fukano","Arkani",
  "Quapsel","Quaputzi","Quappo",
  "Abra","Kadabra","Simsala",
  "Machollo","Maschock","Machomei",
  "Knofensa","Ultrigaria","Sarzenia",
  "Tentacha","Tentoxa",
  "Kleinstein","Georok","Geowaz",
  "Ponita","Gallopa",
  "Flegmon","Lahmus",
  "Magnetilo","Magneton",
  "Porenta",
  "Dodu","Dodri",
  "Jurob","Jugong",
  "Sleima","Sleimok",
  "Muschas","Austos",
  "Nebulak","Alpollo","Gengar",
  "Onix",
  "Traumato","Hypno",
  "Krabby","Kingler",
  "Voltobal","Lektrobal",
  "Owei","Kokowei",
  "Tragosso","Knogga",
  "Kicklee","Nockchan",
  "Schlurp",
  "Smogon","Smogmog",
  "Rihorn","Rizeros",
  "Chaneira",
  "Tangela",
  "Kangama",
  "Seeper","Seemon",
  "Goldini","Golking",
  "Sterndu","Starmie",
  "Pantimos",
  "Sichlor",
  "Rossana",
  "Elektek",
  "Magmar",
  "Pinsir",
  "Tauros",
  "Karpador","Garados",
  "Lapras",
  "Ditto",
  "Evoli","Aquana","Blitza","Flamara",
  "Porygon",
  "Amonitas","Amoroso",
  "Kabuto","Kabutops",
  "Aerodactyl",
  "Relaxo",
  "Arktos","Zapdos","Lavados",
  "Dratini","Dragonir","Dragoran",
  "Mewtu","Mew"
];

let pokemonPool = [];
let pokemonTurn = "A";
let pokemonTeamA = [];
let pokemonTeamB = [];
let pokemonChoices = [];
let pokemonOrderA = [];
let pokemonOrderB = [];

function resetPokemonMatch() {
  pokemonPool = [...pokemonRoster];
  pokemonTurn = "A";
  pokemonTeamA = [];
  pokemonTeamB = [];
  pokemonChoices = [];
  pokemonOrderA = [];
  pokemonOrderB = [];
  renderPokemonAll();
  updatePokemonPrompt();
}

function getPokemonTeam(which) {
  return which === "A" ? pokemonTeamA : pokemonTeamB;
}

function drawSinglePokemonFromPool() {
  if (pokemonPool.length === 0) return null;

  const index = Math.floor(Math.random() * pokemonPool.length);
  const pokemon = pokemonPool[index];
  pokemonPool.splice(index, 1);
  return pokemon;
}

function drawThreePokemon(which) {
  if (pokemonTurn !== which) {
    alert(`Du bist nicht dran. Turn ist Team ${pokemonTurn}.`);
    return;
  }

  const team = getPokemonTeam(which);

  if (team.length >= 6) {
    alert(`Team ${which} hat bereits 6 Pokémon.`);
    return;
  }

  if (pokemonChoices.length > 0) {
    alert("Es liegt noch eine Auswahl offen. Wähle erst 1 von den 3 Pokémon.");
    return;
  }

  if (pokemonPool.length < 3) {
    alert("Nicht mehr genug Pokémon im Pool.");
    return;
  }

  pokemonChoices = [
    drawSinglePokemonFromPool(),
    drawSinglePokemonFromPool(),
    drawSinglePokemonFromPool()
  ];

  renderPokemonAll();
}

function pickPokemon(which, chosenPokemon) {
  if (pokemonTurn !== which) {
    alert(`Du bist nicht dran. Turn ist Team ${pokemonTurn}.`);
    return;
  }

  if (!pokemonChoices.includes(chosenPokemon)) return;

  const team = getPokemonTeam(which);

  if (team.length >= 6) {
    alert(`Team ${which} hat bereits 6 Pokémon.`);
    return;
  }

  team.push(chosenPokemon);
  pokemonChoices = [];

  if (which === "A" && pokemonTeamA.length === 6 && pokemonOrderA.length === 0) {
    pokemonOrderA = [...pokemonTeamA];
  }

  if (which === "B" && pokemonTeamB.length === 6 && pokemonOrderB.length === 0) {
    pokemonOrderB = [...pokemonTeamB];
  }

  pokemonTurn = pokemonTurn === "A" ? "B" : "A";

  renderPokemonAll();
  updatePokemonPrompt();
}

function renderPokemonTeam(which) {
  const team = getPokemonTeam(which);
  const slotsEl = document.getElementById(which === "A" ? "pokemonSlotsA" : "pokemonSlotsB");
  if (!slotsEl) return;

  slotsEl.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    const slot = document.createElement("div");
    slot.className = "pokemon-slot";
    slot.innerHTML = `
      <b>Slot ${i + 1}</b>
      <div class="val">${team[i] || "— leer —"}</div>
    `;
    slotsEl.appendChild(slot);
  }
}

function renderPokemonChoices() {
  const choicesEl = document.getElementById("pokemonChoices");
  if (!choicesEl) return;

  choicesEl.innerHTML = "";

  if (pokemonChoices.length === 0) {
    choicesEl.innerHTML = `<p class="hint">Noch keine Auswahl gezogen.</p>`;
    return;
  }

  pokemonChoices.forEach(pokemon => {
    const card = document.createElement("div");
    card.className = "pokemon-choice-card";
    card.innerHTML = `
      <h3>${pokemon}</h3>
      <button>Für Team ${pokemonTurn} wählen</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      pickPokemon(pokemonTurn, pokemon);
    });

    choicesEl.appendChild(card);
  });
}

function movePokemonInOrder(which, index, direction) {
  const order = which === "A" ? pokemonOrderA : pokemonOrderB;
  const newIndex = index + direction;

  if (newIndex < 0 || newIndex >= order.length) return;

  const temp = order[index];
  order[index] = order[newIndex];
  order[newIndex] = temp;

  renderPokemonAll();
  updatePokemonPrompt();
}

function renderPokemonOrder(which) {
  const orderEl = document.getElementById(which === "A" ? "pokemonOrderA" : "pokemonOrderB");
  if (!orderEl) return;

  const team = getPokemonTeam(which);
  const order = which === "A" ? pokemonOrderA : pokemonOrderB;

  orderEl.innerHTML = "";

  if (team.length < 6) {
    orderEl.innerHTML = `<p class="hint">Wird verfügbar, wenn Team ${which} 6 Pokémon hat.</p>`;
    return;
  }

  if (order.length === 0) {
    orderEl.innerHTML = `<p class="hint">Noch keine Reihenfolge gesetzt.</p>`;
    return;
  }

  order.forEach((pokemon, index) => {
    const item = document.createElement("div");
    item.className = "pokemon-order-item";

    item.innerHTML = `
      <div class="pokemon-order-left">
        <span class="pokemon-order-pos">${index + 1}.</span>
        <span>${pokemon}</span>
      </div>
      <div class="pokemon-order-buttons">
        <button ${index === 0 ? "disabled" : ""}>↑</button>
        <button ${index === order.length - 1 ? "disabled" : ""}>↓</button>
      </div>
    `;

    const buttons = item.querySelectorAll("button");

    buttons[0].addEventListener("click", () => {
      movePokemonInOrder(which, index, -1);
    });

    buttons[1].addEventListener("click", () => {
      movePokemonInOrder(which, index, 1);
    });

    orderEl.appendChild(item);
  });
}

function pokemonTeamsReady() {
  return (
    pokemonTeamA.length === 6 &&
    pokemonTeamB.length === 6 &&
    pokemonOrderA.length === 6 &&
    pokemonOrderB.length === 6
  );
}

function makePokemonPrompt() {
  const formatOrder = (label, order) => {
    const lines = order.map((pokemon, index) => `${index + 1}. ${pokemon}`).join("\n");
    return `TEAM ${label}:\n${lines}`;
  };

  return `Entscheide diesen Pokémon Kampf zwischen zwei Teams.

Regeln:
- Nur die ersten 151 Pokémon aus Generation 1
- Keine Mega-Entwicklungen
- Keine späteren Generationen
- Nur normale Formen
- Bewerte Gesamtstärke, Typen, Vielseitigkeit und die gewählte Kampfreihenfolge
- Gehe von einem direkten Kampf der Teams in dieser Reihenfolge aus

Gib aus:
- Gewinner (Team A oder Team B)
- Warum (3-6 Gründe)
- Wie klar (Confidence 0-1)

${formatOrder("A", pokemonOrderA)}

${formatOrder("B", pokemonOrderB)}
`;
}

function updatePokemonPrompt() {
  const btn = document.getElementById("pokemonCopyPromptBtn");
  const box = document.getElementById("pokemonPromptBox");

  if (!btn || !box) return;

  const ready = pokemonTeamsReady();
  btn.disabled = !ready;
  box.value = ready ? makePokemonPrompt() : "";
}

function renderPokemonAll() {
  const must = [
    "pokemonTurnLabel",
    "pokemonPoolLeft",
    "pokemonDrawBtnA",
    "pokemonDrawBtnB",
    "pokemonSlotsA",
    "pokemonSlotsB",
    "pokemonChoices",
    "pokemonCopyPromptBtn",
    "pokemonPromptBox",
    "pokemonOrderA",
    "pokemonOrderB"
  ];

  for (const id of must) {
    if (!document.getElementById(id)) {
      console.error("Missing Pokémon element id:", id);
      return;
    }
  }

  document.getElementById("pokemonTurnLabel").innerText = `Team ${pokemonTurn}`;
  document.getElementById("pokemonPoolLeft").innerText = String(pokemonPool.length);

  const aCanDraw = pokemonTurn === "A" && pokemonTeamA.length < 6 && pokemonChoices.length === 0;
  const bCanDraw = pokemonTurn === "B" && pokemonTeamB.length < 6 && pokemonChoices.length === 0;

  document.getElementById("pokemonDrawBtnA").disabled = !aCanDraw;
  document.getElementById("pokemonDrawBtnB").disabled = !bCanDraw;

  renderPokemonTeam("A");
  renderPokemonTeam("B");
  renderPokemonChoices();
  renderPokemonOrder("A");
  renderPokemonOrder("B");
  updatePokemonPrompt();
}
