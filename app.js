const BASE_URL = "https://valorisation.humanum-p8.fr/api/items";

// Si besoin :
const KEY_IDENTITY = "YOUR_IDENTITY";
const KEY_CREDENTIAL = "YOUR_CREDENTIAL";

let items = [];
let currentItem = null;
let currentIndex = 0;

let evaluations = JSON.parse(localStorage.getItem("evaluations") || "[]");

const loadBtn = document.getElementById("loadBtn");
const itemList = document.getElementById("itemList");
const propertiesDiv = document.getElementById("properties");
const titleEl = document.getElementById("title");
const progress = document.getElementById("progress");

const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");

const saveBtn = document.getElementById("saveBtn");
const exportBtn = document.getElementById("exportBtn");
const backBtn = document.getElementById("backBtn");

loadBtn.onclick = async () => {
  try {

    // let url = `${BASE_URL}?item_set_id=30437`;
    let url = `https://cors-anywhere.herokuapp.com/${BASE_URL}?item_set_id=30437`;

    // décommente si API protégée
    // url += `&key_identity=${KEY_IDENTITY}&key_credential=${KEY_CREDENTIAL}`;

    const res = await fetch(url);
    items = await res.json();

    displayItems();
    step2.classList.remove("hidden");

  } catch (e) {
    alert("Erreur API (probablement CORS)");
    console.error(e);
  }
};

function displayItems() {
  itemList.innerHTML = "";

  items.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerText = item["o:title"] || "Sans titre";
    div.onclick = () => selectItem(index);
    itemList.appendChild(div);
  });
}

function selectItem(index) {
  currentIndex = index;
  currentItem = items[index];

  titleEl.innerText = currentItem["o:title"];
  renderProperties();

  progress.innerText = `Item ${index + 1} / ${items.length}`;
  step3.classList.remove("hidden");
}

function renderProperties() {
  propertiesDiv.innerHTML = "";

  Object.entries(currentItem).forEach(([key, values]) => {
    if (!key.includes(":") || !Array.isArray(values)) return;

    values.forEach(v => {
      if (!v["@value"]) return;

      const wrap = document.createElement("div");
      wrap.className = "property";

      const label = document.createElement("label");
      label.innerText = `${key} : ${v["@value"]}`;

      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = 0;
      slider.max = 100;
      slider.value = 50;

      wrap.appendChild(label);
      wrap.appendChild(slider);
      propertiesDiv.appendChild(wrap);
    });
  });
}

saveBtn.onclick = () => {
  const props = propertiesDiv.querySelectorAll(".property");

  const itemEvaluation = {
    item_id: currentItem["o:id"],
    title: currentItem["o:title"],
    annotations: []
  };

  props.forEach(p => {
    const label = p.querySelector("label").innerText;
    const score = p.querySelector("input").value;

    itemEvaluation.annotations.push({
      property: label,
      score: score
    });
  });

  evaluations.push(itemEvaluation);
  localStorage.setItem("evaluations", JSON.stringify(evaluations));

  alert("Enregistré !");
};

backBtn.onclick = () => {
  step3.classList.add("hidden");
};

exportBtn.onclick = () => {
  const blob = new Blob([JSON.stringify(evaluations, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "annotations.json";
  a.click();
};