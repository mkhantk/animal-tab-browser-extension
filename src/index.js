// import { API_ACCESS_KEY } from "../dist/config";

// console.log(API_ACCESS_KEY);
const newcomer = document.querySelector("#new");
const result = document.querySelector("#result");
const reset = document.querySelector(".reset");
const dog = document.querySelector(".dog");
const cat = document.querySelector(".cat");

//newcomer
function setupNewComer(animal) {
  localStorage.setItem("animal", animal);

  // newcomer.classList.add("hidden");
  newcomer.style.display = "none";
  // result.classList.remove("hidden");
  result.style.display = "block";
}

function handleClick(e) {
  e.preventDefault();
  setupNewComer(e.currentTarget.id);
  // console.log(e.currentTarget.id);

  let category = e.currentTarget.id;
  console.log(`this is the category i choose ${category}`);

  chrome.runtime.sendMessage(
    { type: "preloadImages", category },
    (response) => {
      console.log(response);
      if (response.success) {
        console.log(response.message);
      } else {
        console.log(response.message);
      }
    }
  );
}

function init() {
  //check the previous values
  let storedAnimalChoice = localStorage.getItem("animal");

  if (storedAnimalChoice === null) {
    newcomer.style.display = "block";
    // newcomer.classList.remove("hidden");
    result.style.display = "none";

    // result.classList.add("hidden");
  } else {
    // showPrevResult(storedClock, storedisTwelve, storedAnimalChoice);
    newcomer.style.display = "none";
    // newcomer.classList.add("hidden");
    result.style.display = "block";
    // result.classList.remove("hidden");
  }
}

reset.addEventListener("click", (e) => {
  localStorage.removeItem("animal");
  chrome.runtime.sendMessage({ type: "reset" }, (response) => {
    if (response.success) {
      console.log(response.message);
    }
  });
  init();
});

dog.addEventListener("click", (e) => handleClick(e));
cat.addEventListener("click", (e) => handleClick(e));

init();
