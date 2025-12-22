
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



// 1)bestemmer hva vi skal vise basert på om det finnes en lagret spilltilstand 
const hasSave = !!localStorage.getItem(GAME_KEY);

if (hasSave) {
  startBtn.style.display = "none";
  resetButtons.style.display = "flex";
  nicknameInput.disabled = true;
  districtSelect.disabled = true;
  editBtn.disabled = true;
  editBtn.style.cursor = "not-allowed";
  // // hent data fra localStorage
  const savedName = localStorage.getItem("playerName");
  const savedAvatar = localStorage.getItem("playerAvatar");

  //Regionen er hentet fra GAME_KEY (regionen som sist ble spilt i)
  const game = JSON.parse(localStorage.getItem(GAME_KEY));

  if (savedName) nicknameInput.value = savedName;
  if (savedAvatar) userAvatar.src = savedAvatar;

  if (game&&game.districtId) districtSelect.value = game.districtId;
} else {
// Ingen lagret status, vis "Start trading"-knappen og skjul edit-btns
  resetButtons.style.display = "none";
  nicknameInput.disabled = false;
  districtSelect.disabled = false;
  editBtn.disabled = false;
}



// Vis/skjul avatarliste
editBtn.addEventListener("click", (e) => {
  avatarList.classList.toggle("hidden");
});

//Velg et avatarbilde fra listen
avatarList.querySelectorAll("img").forEach(img => {
  img.addEventListener("click", (e) => {
    userAvatar.src = img.src;    // تغيير صورة المستخدم
    avatarList.classList.add("hidden");  // إخفاء اللائحة
  });
});

// 2) Start Trading button
const ClickSound = new Audio("assets/sounds/reset.wav");
ClickSound.volume = 0.5;

startBtn.addEventListener("click", () => {

  if (!nicknameInput.value.trim()) {
    alert("Enter a nickname to start.");
    return;
  }

  localStorage.setItem("playerName", nicknameInput.value.trim());
  localStorage.setItem("playerAvatar", userAvatar.src);
  localStorage.setItem("playerDistrict", districtSelect.value);

  ClickSound.currentTime = 0;
  ClickSound.play();

  setTimeout(() => {
    window.location.href = "trading-page.html";
  }, 240);
});

// 3) Continue button
continueBtn.addEventListener("click", () => {

  ClickSound.currentTime = 0;
  ClickSound.play();

  setTimeout(() => {
    window.location.href = "trading-page.html";
  }, 240);

});

// 4) New Game button
newGameBtn.addEventListener("click", () => {

  localStorage.removeItem(GAME_KEY);
  nicknameInput.disabled = false;
  districtSelect.disabled = false;
  startBtn.style.display = "block";
  resetButtons.style.display = "none";
  editBtn.disabled = false;
  editBtn.style.cursor = "pointer";
  nicknameInput.value = "";
  districtSelect.value = "afterglow";
  userAvatar.src = "assets/animal avatar/wolf.png";

  ClickSound.currentTime = 0;
  ClickSound.play();
});

