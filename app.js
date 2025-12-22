
// --- Konfig ---
const GAME_KEY = "neon_syndicate_save_v1";

const districts = [
  { id: "afterglow", name: "Afterglow", rate: 1.00 },
  { id: "ironharbor", name: "Iron Harbor", rate: 1.15 },
  { id: "ghostmarket", name: "Ghost Market", rate: 0.90 },
];

const items = [
  { id: "neonchips", name: "Neon Chips", base: 55, vol: 0.35 },
  { id: "cybersilk", name: "Cyber Silk", base: 120, vol: 0.45 },
  { id: "datashard", name: "Data Shard", base: 200, vol: 0.55 },
];

// --- State ---
let state = {
  kred: 300,
  districtId: "afterglow",
  inventory: { neonchips: 0, cybersilk: 0, datashard: 0 },
  prices: {},
  oldprices:null,
};

// --- DOM ---
const kredEl = document.getElementById("kredValue");
const districtEl = document.getElementById("districtValue");
const invEl = document.getElementById("inventoryValue");
const marketEl = document.getElementById("market");
const logEl = document.getElementById("log");
const resetBtn = document.getElementById("resetBtn");

// Map
const mapEl = document.getElementById("travelMap");
const mapPlayer = document.getElementById("mapPlayer");

// HUD
const hudName = document.getElementById("hudName");
const hudAvatar = document.getElementById("hudAvatar");

// --- Utils ---
function getDistrict() {
  return districts.find(d => d.id === state.districtId);
}

function clampMinPrice(n) {
  return Math.max(5, Math.round(n));
}


function log(message, type = "good") {
  if (!logEl) return;

  const now = new Date();
  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  const p = document.createElement("p");
  p.className = type;

  p.innerHTML = `
    <span class="feed-text">${message}</span>
    <span class="time">${time}</span>
  `;

  logEl.prepend(p);
}


function money(n) {
  return `${n} kred`;
}

// --- Pricing ---
function randomizePrices() {
  state.oldPrices = null; // ✅ إزالة الخصم السابق
  const d = getDistrict();
  const newPrices = {};

  for (const it of items) {
    const swing = 1 + (Math.random() * 2 - 1) * it.vol;
    newPrices[it.id] = clampMinPrice(it.base * d.rate * swing);
  }

  state.prices = newPrices;
}

// --- Render ---
function renderStatus() {
  kredEl.textContent = `${state.kred}💰`;
  districtEl.textContent = getDistrict().name;
  invEl.textContent = items
    .map(it => `${it.name}: ${state.inventory[it.id]}`)
    .join(" • ");
}

function renderMarket() {
  marketEl.innerHTML = "";

  for (const it of items) {
    const row = document.createElement("div");
    row.className = "row";

    // 👇 1. Lag priceHTML 
    let priceHTML = `${state.prices[it.id]} 🪙`;

    if (state.oldPrices && state.oldPrices[it.id]) {
      priceHTML = `
        <span class="old-price">${state.oldPrices[it.id]} 🪙</span>
        <span class="new-price">${state.prices[it.id]} 🪙</span>
      `;
    }

    // 👇 2. Bruk priceHTML i HTML-en
    row.innerHTML = `
      <div>
        <div class="itemName">${it.name}</div>
        <div class="small">In stock: ${state.inventory[it.id]}</div>
      </div>
      <div class="price">${priceHTML}</div>
    `;

    const buyBtn = document.createElement("button");
    buyBtn.className = "btn";
    buyBtn.textContent = "Buy";
    buyBtn.onclick = () => buy(it.id);

    const sellBtn = document.createElement("button");
    sellBtn.className = "btn";
    sellBtn.textContent = "Sell";
    sellBtn.onclick = () => sell(it.id);

    row.append(buyBtn, sellBtn);
    marketEl.appendChild(row);
  }
}


// --- Map ---
function movePlayerOnMap() {
  const node = mapEl.querySelector(
    `.node[data-district="${state.districtId}"]`
  );
  if (!node) return;

  mapPlayer.src = hudAvatar.src;

  const x = getComputedStyle(node).getPropertyValue("--x");
  const y = getComputedStyle(node).getPropertyValue("--y");

  mapPlayer.style.left = `${x}%`;
  mapPlayer.style.top = `${y}%`;

  mapEl.querySelectorAll(".node").forEach(n =>
    n.classList.remove("current")
  );
  node.classList.add("current");
}

function renderAll() {
  renderStatus();
  renderMarket();
  movePlayerOnMap();
}



// --- Trading ---

const paySound = new Audio("assets/sounds/buy.mp3");
const coinSound = new Audio("assets/sounds/sell.wav");
const errorSound = new Audio("assets/sounds/error.wav");


paySound.volume = 0.5;
coinSound.volume = 0.6;
errorSound.volume = 0.5;

function playSfx(aud) {
  aud.currentTime = 0;
  aud.play();
}

function buy(itemId) {
  const price = state.prices[itemId];

  if (state.kred < price) {
    playSfx(errorSound); 
    log(`Not enough kred to buy 1x ${prettyItem(itemId)} for ${price} 🪙.`, "bad");
    return;
  }

  state.kred -= price;
  state.inventory[itemId]++;

  playSfx(paySound); // ✅ صوت الشراء
  log(`Bought 1x ${prettyItem(itemId)} for ${price} 🪙.`, "good");

  saveGame();
  renderAll();
}


function sell(itemId) {
  if (state.inventory[itemId] <= 0) {
    playSfx(errorSound);
    log(`You don't have ${prettyItem(itemId)} in inventory.`, "bad");
    return;
  }

  const price = state.prices[itemId];
  state.inventory[itemId]--;
  state.kred += price;

  playSfx(coinSound);
  log(`Sold 1x ${prettyItem(itemId)} for ${price} 🪙.`, "good");

  saveGame();
  renderAll();
}


function prettyItem(itemId) {
  const item = items.find(it => it.id === itemId);
  return item ? item.name : itemId;
}


// --- Events ---
function runRandomEvent() {
  // 35% sjanse event ved reise
  if (Math.random() > 0.35) return;

  const roll = Math.random();

  // Fixer-rabatt: senk alle priser litt
  if (roll < 0.33) {
      state.oldPrices = { ...state.prices };
    for (const k in state.prices) {
      state.prices[k] = Math.max(5, Math.round(state.prices[k] * 0.85));
    }
    log("Fixer deal! Prices dropped by 15%.", "good");
     alert("💠 Fixer Deal!\nAll market prices are now 15% cheaper.");
  }

   // 🚓NCPD avgift: trekk kred 
  else if (roll < 0.66) {
    const fee = 20 + Math.floor(Math.random() * 40);
    state.kred = Math.max(0, state.kred - fee);
    log(`🚓Checkpoint fee paid: ${fee} 🪙`, "bad");
    alert(`🚨 NCPD Checkpoint!\nYou paid a fine of ${fee} 🪙.`);
  }

}


// --- Travel ---
const travelSound = new Audio("assets/sounds/travel2.wav");
travelSound.volume = 0.5;

function travelTo(districtId) {
  const from = getDistrict().name;

  state.districtId = districtId;
  const to = getDistrict().name;

  playSfx(travelSound);

  randomizePrices();
  log(`Traveled from ${from} → ${to}. New prices loaded.`, "good");

  runRandomEvent();

  saveGame();
  renderAll();
}


// --- Save ---
function saveGame() {
  localStorage.setItem(GAME_KEY, JSON.stringify(state));
}

function loadGame() {
  const raw = localStorage.getItem(GAME_KEY);
  if (!raw) return false;
  state = JSON.parse(raw);
  return true;
}


// --- Reset ---
const resetSound = new Audio("assets/sounds/reset.wav");
resetSound.volume = 0.5;
resetBtn.onclick = () => {
  saveGame();
  playSfx(resetSound);  // 🔁
  setTimeout(() => {
    window.location.href = "main.html";
  }, 240);
};


// --- Init ---
const loaded = loadGame();

hudName.textContent = localStorage.getItem("playerName");
hudAvatar.src = localStorage.getItem("playerAvatar");

if (!loaded) {
  const startDistrict = localStorage.getItem("playerDistrict");
  if (startDistrict) state.districtId = startDistrict;
  randomizePrices();
  saveGame();
    log("Welcome to Neon Syndicate! Your trading adventure begins now.", "good");
}
else {
  log("Game loaded. Welcome back to Neon Syndicate!", "good");
}

mapEl.querySelectorAll(".node").forEach(node => {
  node.addEventListener("click", () => {
    const id = node.dataset.district;
    if (id !== state.districtId) travelTo(id);
  });
});

renderAll();
