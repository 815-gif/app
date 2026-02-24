const STORAGE_KEY = "manhwas-leidos";

const form = document.querySelector("#manhwa-form");
const itemIdInput = document.querySelector("#item-id");
const titleInput = document.querySelector("#title");
const authorInput = document.querySelector("#author");
const artistInput = document.querySelector("#artist");
const typeInput = document.querySelector("#type");
const demographyInput = document.querySelector("#demography");
const genreInput = document.querySelector("#genre");
const statusInput = document.querySelector("#status");
const chaptersReadInput = document.querySelector("#chapters-read");
const chaptersTotalInput = document.querySelector("#chapters-total");
const coverUrlInput = document.querySelector("#cover-url");
const coverFileInput = document.querySelector("#cover-file");
const ratingInput = document.querySelector("#rating");
const noteInput = document.querySelector("#note");

const navButtons = document.querySelectorAll(".nav-item");
const views = {
  home: document.querySelector("#home-view"),
  biblioteca: document.querySelector("#biblioteca-view"),
  perfil: document.querySelector("#perfil-view"),
};

const list = document.querySelector("#manhwa-list");
const emptyState = document.querySelector("#empty-state");
const clearAllButton = document.querySelector("#clear-all");
const submitButton = document.querySelector("#submit-btn");
const cancelEditButton = document.querySelector("#cancel-edit");

const profileStats = document.querySelector("#profile-stats");
const profileExtra = document.querySelector("#profile-extra");

const detailsModal = document.querySelector("#details-modal");
const detailsTitle = document.querySelector("#details-title");
const detailsCover = document.querySelector("#details-cover");
const detailsInfo = document.querySelector("#details-info");
const detailsNote = document.querySelector("#details-note");
const closeDetailsButton = document.querySelector("#close-details");

function loadManhwas() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveManhwas(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function switchTab(tab) {
  Object.entries(views).forEach(([name, node]) => {
    node.hidden = name !== tab;
  });

  navButtons.forEach((button) => {
    const active = button.dataset.tab === tab;
    button.classList.toggle("active", active);
    if (active) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function resetForm() {
  form.reset();
  itemIdInput.value = "";
  statusInput.value = "Leyendo";
  submitButton.textContent = "Guardar";
  cancelEditButton.hidden = true;
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

function getCover(item) {
  return item.coverData || item.coverUrl || "https://placehold.co/80x110/f8cfe0/1e7f86?text=Sin+portada";
}

function getStarString(value) {
  const rating = Number(value) || 0;
  const rounded = Math.round(rating * 2) / 2;
  const full = Math.floor(rounded);
  const half = rounded % 1 !== 0 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + "⯪".repeat(half) + "☆".repeat(empty);
}

function buildRatingNode(value) {
  const rating = Number(value);
  const wrap = document.createElement("div");
  wrap.className = "rating-row";

  const number = document.createElement("span");
  number.className = "rating-number";
  number.textContent = Number.isFinite(rating) && rating >= 0 ? rating.toFixed(1) : "Sin valoración";

  const stars = document.createElement("span");
  stars.className = "rating-stars";
  stars.textContent = Number.isFinite(rating) && rating >= 0 ? getStarString(rating) : "☆☆☆☆☆";

  wrap.append(number, stars);
  return wrap;
}

function buildInfoRows(item) {
  return [
    ["Autor", item.author],
    ["Artista", item.artist],
    ["Tipo", item.type],
    ["Demografía", item.demography],
    ["Género", item.genre],
    ["Estado", item.status],
    ["Capítulos", item.chaptersRead || item.chaptersTotal ? `${item.chaptersRead || 0} / ${item.chaptersTotal || "?"}` : ""],
    ["Valoración", Number(item.rating) >= 0 ? `${Number(item.rating).toFixed(1)} · ${getStarString(item.rating)}` : ""],
  ].filter(([, value]) => value);
}

function calculateProfileStats(items) {
  const totalManhwas = items.length;
  const totalRead = items.reduce((sum, item) => sum + (Number(item.chaptersRead) || 0), 0);
  const rated = items.map((item) => Number(item.rating)).filter((v) => Number.isFinite(v));
  const avgRating = rated.length ? (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1) : "-";

  const statusCount = items.reduce((acc, item) => {
    const key = item.status || "Sin estado";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topStatus = Object.entries(statusCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  const genreCount = items
    .flatMap((item) => (item.genre || "").split(",").map((part) => part.trim()).filter(Boolean))
    .reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre]) => genre)
    .join(", ") || "Sin géneros aún";

  const latest = items[0]?.title || "-";

  return { totalManhwas, totalRead, avgRating, topStatus, topGenres, latest };
}

function renderProfile() {
  const items = loadManhwas();
  const stats = calculateProfileStats(items);

  profileStats.innerHTML = "";
  [
    ["Manhwas guardados", stats.totalManhwas],
    ["Capítulos leídos", stats.totalRead],
    ["Promedio de valoración", stats.avgRating],
    ["Estado más frecuente", stats.topStatus],
  ].forEach(([label, value]) => {
    const card = document.createElement("article");
    card.className = "stat-card";
    card.innerHTML = `<h3>${value}</h3><p>${label}</p>`;
    profileStats.appendChild(card);
  });

  profileExtra.innerHTML = `
    <p><strong>Géneros más leídos:</strong> ${stats.topGenres}</p>
    <p><strong>Último manhwa agregado:</strong> ${stats.latest}</p>
  `;
}

function render() {
  const items = loadManhwas();
  list.innerHTML = "";

  if (!items.length) {
    emptyState.hidden = false;
    renderProfile();
    return;
  }

  emptyState.hidden = true;

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "item";

    const top = document.createElement("div");
    top.className = "item-top";

    const cover = document.createElement("img");
    cover.className = "item-cover";
    cover.alt = `Portada de ${item.title}`;
    cover.src = getCover(item);

    const content = document.createElement("div");
    const title = document.createElement("div");
    title.className = "item-title";
    title.textContent = item.title;

    const meta = document.createElement("div");
    meta.className = "item-meta";
    meta.textContent = `${item.status || "Leyendo"} · ${item.type || "Sin tipo"} · ${item.demography || "Sin demografía"}`;

    const chapters = document.createElement("div");
    chapters.className = "item-meta";
    chapters.textContent = item.chaptersRead || item.chaptersTotal
      ? `Capítulos: ${item.chaptersRead || 0}/${item.chaptersTotal || "?"}`
      : "Capítulos: -";

    const ratingNode = buildRatingNode(item.rating);

    content.append(title, meta, chapters, ratingNode);
    top.append(cover, content);

    const actions = document.createElement("div");
    actions.className = "item-actions";

    const detailsButton = document.createElement("button");
    detailsButton.type = "button";
    detailsButton.textContent = "Ver detalles";
    detailsButton.addEventListener("click", () => openDetails(item.id));

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "secondary";
    editButton.textContent = "Editar";
    editButton.addEventListener("click", () => {
      startEdit(item.id);
      switchTab("home");
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "danger";
    removeButton.textContent = "Eliminar";
    removeButton.addEventListener("click", () => removeItem(item.id));

    actions.append(detailsButton, editButton, removeButton);
    li.append(top, actions);
    list.appendChild(li);
  });

  renderProfile();
}

function removeItem(id) {
  const items = loadManhwas().filter((item) => item.id !== id);
  saveManhwas(items);
  render();
}

function startEdit(id) {
  const item = loadManhwas().find((value) => value.id === id);
  if (!item) {
    return;
  }

  itemIdInput.value = item.id;
  titleInput.value = item.title || "";
  authorInput.value = item.author || "";
  artistInput.value = item.artist || "";
  typeInput.value = item.type || "";
  demographyInput.value = item.demography || "";
  genreInput.value = item.genre || "";
  statusInput.value = item.status || "Leyendo";
  chaptersReadInput.value = item.chaptersRead || "";
  chaptersTotalInput.value = item.chaptersTotal || "";
  coverUrlInput.value = item.coverUrl || "";
  ratingInput.value = item.rating || "";
  noteInput.value = item.note || "";

  submitButton.textContent = "Actualizar";
  cancelEditButton.hidden = false;
  titleInput.focus();
}

function openDetails(id) {
  const item = loadManhwas().find((value) => value.id === id);
  if (!item) {
    return;
  }

  detailsTitle.textContent = item.title;
  detailsCover.src = getCover(item);
  detailsCover.hidden = false;

  const rows = buildInfoRows(item);
  detailsInfo.innerHTML = "";
  rows.forEach(([label, value]) => {
    const row = document.createElement("p");
    row.className = "item-meta";
    row.textContent = `${label}: ${value}`;
    detailsInfo.appendChild(row);
  });

  const detailRating = buildRatingNode(item.rating);
  detailsInfo.appendChild(detailRating);

  detailsNote.textContent = item.note || "Sin nota personal.";
  detailsModal.showModal();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const itemId = itemIdInput.value;
  const file = coverFileInput.files[0];

  let coverData = "";
  if (file) {
    coverData = await fileToDataURL(file);
  }

  const chaptersRead = chaptersReadInput.value.trim();
  const chaptersTotal = chaptersTotalInput.value.trim();

  if (chaptersRead && chaptersTotal && Number(chaptersRead) > Number(chaptersTotal)) {
    alert("Los capítulos leídos no pueden ser mayores al total de capítulos.");
    return;
  }

  const previousItem = itemId ? loadManhwas().find((item) => item.id === itemId) : null;

  const ratingRaw = ratingInput.value.trim();
  const rating = ratingRaw === "" ? "" : Number(ratingRaw);

  if (ratingRaw !== "" && (!Number.isFinite(rating) || rating < 0 || rating > 5)) {
    alert("La valoración debe estar entre 0 y 5.");
    return;
  }

  const newItem = {
    id: itemId || crypto.randomUUID(),
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    artist: artistInput.value.trim(),
    type: typeInput.value.trim(),
    demography: demographyInput.value.trim(),
    genre: genreInput.value.trim(),
    status: statusInput.value,
    chaptersRead,
    chaptersTotal,
    coverUrl: coverUrlInput.value.trim(),
    coverData: coverData || previousItem?.coverData || "",
    rating: ratingRaw === "" ? "" : rating.toFixed(1),
    note: noteInput.value.trim(),
  };

  if (!newItem.title) {
    return;
  }

  const items = loadManhwas();
  const updated = itemId
    ? items.map((item) => (item.id === itemId ? newItem : item))
    : [newItem, ...items];

  saveManhwas(updated);
  resetForm();
  switchTab("biblioteca");
  render();
});

cancelEditButton.addEventListener("click", () => {
  resetForm();
});

clearAllButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  resetForm();
  render();
});

closeDetailsButton.addEventListener("click", () => {
  detailsModal.close();
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchTab(button.dataset.tab);
  });
});

switchTab("home");
render();
