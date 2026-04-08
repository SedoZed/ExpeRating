let items = [];
let currentIndex = 0;
let evaluations = [];

const apiUrlInput = document.getElementById('apiUrl');
const propertyInput = document.getElementById('propertyInput');

const loadBtn = document.getElementById('loadBtn');
const nextBtn = document.getElementById('nextBtn');
const exportBtn = document.getElementById('exportBtn');

const itemSection = document.getElementById('itemSection');
const evaluationSection = document.getElementById('evaluationSection');

const titleEl = document.getElementById('title');
const propertyEl = document.getElementById('property');
const slider = document.getElementById('slider');
const scoreEl = document.getElementById('score');

slider.addEventListener('input', () => {
  scoreEl.innerText = slider.value;
});

loadBtn.addEventListener('click', async () => {
  const url = apiUrlInput.value;
  const res = await fetch(url);
  items = await res.json();
  currentIndex = 0;
  evaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
  showItem();
});

function getProperty(item, prop) {
  if (!item[prop]) return 'Non disponible';
  return item[prop][0]['@value'] || JSON.stringify(item[prop]);
}

function showItem() {
  if (currentIndex >= items.length) {
    alert('Terminé !');
    return;
  }

  const item = items[currentIndex];
  const prop = propertyInput.value;

  titleEl.innerText = item['o:title'] || 'Sans titre';
  propertyEl.innerText = getProperty(item, prop);

  itemSection.classList.remove('hidden');
  evaluationSection.classList.remove('hidden');

  slider.value = 50;
  scoreEl.innerText = 50;
}

nextBtn.addEventListener('click', () => {
  const item = items[currentIndex];

  evaluations.push({
    id: item['o:id'],
    title: item['o:title'],
    property: propertyInput.value,
    score: slider.value
  });

  localStorage.setItem('evaluations', JSON.stringify(evaluations));

  currentIndex++;
  showItem();
});

exportBtn.addEventListener('click', () => {
  let csv = 'id,title,property,score\n';
  evaluations.forEach(e => {
    csv += `${e.id},"${e.title}",${e.property},${e.score}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'evaluations.csv';
  a.click();
});