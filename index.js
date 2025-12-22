
const GAME_KEY = "neon_syndicate_save_v1";

const startBtn = document.getElementById("startbtn");
const resetButtons = document.querySelector(".reset-buttons");
const newGameBtn = document.getElementById("NewGameBtn");
const continueBtn = document.getElementById("ContinueBtn");
const editBtn = document.getElementById("editAvatar");

const nicknameInput = document.getElementById("name");
const districtSelect = document.getElementById("districtSelect");
const userAvatar = document.getElementById("userAvatar");
const avatarList = document.getElementById("avatarList");

const ClickSound = new Audio("assets/sounds/reset.wav");
ClickSound.volume = 0.5;

// 1) bestemmer hva vi skal vise basert på om det finnes en *gyldig* lagret spilltilstand
const raw = localStorage.getItem(GAME_KEY);

let hasSave = false;
let game = null;

if (raw && raw !== "null" && raw !== "") {
  game = JSON.parse(raw);

  // ✅ يعتبر حفظ صالح فقط إذا فيه kred رقم و districtId موجود
  if (game && typeof game.kred === "number" && game.districtId) {
    hasSave = true;
  }
}

if (hasSave) {
  startBtn.style.display = "none";
  resetButtons.style.display = "flex";

  nicknameInput.disabled = true;
  districtSelect.disabled = true;
  editBtn.disabled = true;
  editBtn.style.cursor = "not-allowed";

  // hent data fra localStorage
  const savedName = localStorage.getItem("playerName");
  const savedAvatar = localStorage.getItem("playerAvatar");

  if (savedName) nicknameInput.value = savedName;
  if (savedAvatar) userAvatar.src = savedAvatar;

  // Regionen er hentet fra GAME_KEY (regionen som sist ble spilt i)
  districtSelect.value = game.districtId;

} else {
  // Ingen lagret status, vis Start-knappen og skjul Continue/New Game
  startBtn.style.display = "block";
  resetButtons.style.display = "none";

  nicknameInput.disabled = false;
  districtSelect.disabled = false;
  editBtn.disabled = false;
  editBtn.style.cursor = "pointer";
}

// Vis/skjul avatarliste
editBtn.addEventListener("click", () => {
  if (editBtn.disabled) return;
  avatarList.classList.toggle("hidden");
});

// Velg et avatarbilde fra listen
avatarList.querySelectorAll("img").forEach(img => {
  img.addEventListener("click", () => {
    if (editBtn.disabled) return;
    userAvatar.src = img.src;
    avatarList.classList.add("hidden");
  });
});

// 2) Start Trading button
startBtn.addEventListener("click", () => {
  if (!nicknameInput.value.trim()) {
    alert("Enter a nickname to start.");
    return;
  }

  localStorage.setItem("playerName", nicknameInput.value.trim());
  localStorage.setItem("playerAvatar", userAvatar.src);
  localStorage.setItem("playerDistrict", districtSelect.value);

  ClickSound.currentTime = 0;
  ClickSound.play().catch(() => {});

  setTimeout(() => {
    window.location.href = "trading-page.html";
  }, 240);
});

// 3) Continue button
continueBtn.addEventListener("click", () => {
  ClickSound.currentTime = 0;
  ClickSound.play().catch(() => {});

  setTimeout(() => {
    window.location.href = "trading-page.html";
  }, 240);
});

// 4) New Game button
newGameBtn.addEventListener("click", () => {
  // ✅ امسح حفظ اللعبة فقط
  localStorage.removeItem(GAME_KEY);

  // ✅ رجّع الفورم قابل للتعديل
  nicknameInput.disabled = false;
  districtSelect.disabled = false;
  editBtn.disabled = false;
  editBtn.style.cursor = "pointer";

  // ✅أظهرStart و أخفي Continue/New Game
  startBtn.style.display = "block";
  resetButtons.style.display = "none";

  nicknameInput.value = "";
  districtSelect.value = "afterglow";
  userAvatar.src = "assets/animal avatar/wolf.png";

  ClickSound.currentTime = 0;
  ClickSound.play().catch(() => {});
});

