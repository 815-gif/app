const STORAGE_KEY = "manhwas-leidos";
const SETTINGS_KEY = "manhwas-preferencias";

const TRACKS = {
  none: "",
  lofi: "https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73467.mp3",
  rain: "https://cdn.pixabay.com/audio/2022/03/10/audio_c6ccf7d1f2.mp3",
};

const DEFAULT_SETTINGS = {
  mode: "dark",
  viewMode: "list",
  musicTrack: "none",
  musicVolume: 0.25,
  customTheme: null,
  goals: { readMonth: 5, finishPending: 2 },
};

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
const emotionInput = document.querySelector("#emotion");
const tropeReencarnacionInput = document.querySelector("#trope-reencarnacion");
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
const viewModeSelect = document.querySelector("#view-mode-select");

const profileStats = document.querySelector("#profile-stats");
const profileExtra = document.querySelector("#profile-extra");
const exportDataButton = document.querySelector("#export-data");
const importDataButton = document.querySelector("#import-data");
const importFileInput = document.querySelector("#import-file");

const themeModeSelect = document.querySelector("#theme-mode");
const profileViewModeSelect = document.querySelector("#profile-view-mode");
const musicTrackSelect = document.querySelector("#music-track");
const musicVolumeInput = document.querySelector("#music-volume");
const musicToggleButton = document.querySelector("#music-toggle");
const ambientAudio = document.querySelector("#ambient-audio");

const themePrimaryInput = document.querySelector("#theme-primary");
const themeSecondaryInput = document.querySelector("#theme-secondary");
const themeBgInput = document.querySelector("#theme-bg");
const themeCardInput = document.querySelector("#theme-card");
const applyThemeButton = document.querySelector("#apply-theme");
const resetThemeButton = document.querySelector("#reset-theme");
const goalReadMonthInput = document.querySelector("#goal-read-month");
const goalFinishPendingInput = document.querySelector("#goal-finish-pending");
const saveGoalsButton = document.querySelector("#save-goals");
const goalProgress = document.querySelector("#goal-progress");
const profileTimeline = document.querySelector("#profile-timeline");

const profileStats = document.querySelector("#profile-stats");
const profileExtra = document.querySelector("#profile-extra");

const detailsModal = document.querySelector("#details-modal");
const detailsTitle = document.querySelector("#details-title");
const detailsCover = document.querySelector("#details-cover");
const detailsInfo = document.querySelector("#details-info");
const detailsNote = document.querySelector("#details-note");
const closeDetailsButton = document.querySelector("#close-details");

let settings = loadSettings();

function loadManhwas() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveManhwas(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
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
  return item.coverData || item.coverUrl || "https://placehold.co/80x110/2d2342/e5d3ff?text=Sin+portada";
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
    ["Estado emocional", item.emotion || ""],
    ["Tropes", Array.isArray(item.tropes) && item.tropes.length ? item.tropes.join(", ") : ""],
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

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const readThisMonth = items.filter((item) => {
    if (!item.createdAt) return false;
    const d = new Date(item.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;
  const finishedPending = items.filter((item) => item.status === "Finalizado").length;

  const readGoal = Number(settings.goals?.readMonth || 0);
  const finishGoal = Number(settings.goals?.finishPending || 0);

  goalProgress.innerHTML = `
    <p><strong>Meta mensual:</strong> leer ${readGoal} manhwas este mes → <b>${readThisMonth}/${readGoal || 0}</b></p>
    <p><strong>Historias pendientes finalizadas:</strong> meta ${finishGoal} → <b>${finishedPending}/${finishGoal || 0}</b></p>
  `;

  const timelineItems = items
    .map((item) => ({ title: item.title, emotion: item.emotion || "Sin vibe", createdAt: item.createdAt || null }))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8);

  profileTimeline.innerHTML = timelineItems.length
    ? timelineItems
        .map((entry) => `<p>• <strong>${entry.title}</strong> — ${entry.emotion} <span class="timeline-date">${entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "Fecha desconocida"}</span></p>`)
        .join("")
    : "<p>Aún no hay eventos en tu evolución lectora.</p>";
}

function sanitizeImportedItems(items) {
  if (!Array.isArray(items)) {
    return null;
  }

  return items
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const title = String(item.title || "").trim();
      if (!title) {
        return null;
      }

      return {
        id: item.id ? String(item.id) : crypto.randomUUID(),
        title,
        author: String(item.author || ""),
        artist: String(item.artist || ""),
        type: String(item.type || ""),
        demography: String(item.demography || ""),
        genre: String(item.genre || ""),
        status: String(item.status || "Leyendo"),
        chaptersRead: String(item.chaptersRead || ""),
        chaptersTotal: String(item.chaptersTotal || ""),
        coverUrl: String(item.coverUrl || ""),
        coverData: String(item.coverData || ""),
        rating:
          item.rating === "" || item.rating == null || !Number.isFinite(Number(item.rating))
            ? ""
            : Number(item.rating).toFixed(1),
        emotion: String(item.emotion || ""),
        tropes: Array.isArray(item.tropes) ? item.tropes.map((t) => String(t)) : [],
        createdAt: item.createdAt ? String(item.createdAt) : new Date().toISOString(),
        note: String(item.note || ""),
      };
    })
    .filter(Boolean);
}

function exportData() {
  const items = loadManhwas();
  const payload = {
    app: "mis-manhwas-leidos",
    version: 2,
    exportedAt: new Date().toISOString(),
    items,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `manhwas-leidos-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importData(file) {
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const sourceItems = Array.isArray(parsed) ? parsed : parsed.items;
    const sanitized = sanitizeImportedItems(sourceItems);

    if (!sanitized || !sanitized.length) {
      alert("El archivo no contiene manhwas válidos para importar.");
      return;
    }

    saveManhwas(sanitized);
    resetForm();
    render();
    switchTab("biblioteca");
    alert(`Importación completada: ${sanitized.length} manhwas.`);
  } catch {
    alert("No se pudo importar el archivo. Verifica que sea JSON válido.");
  } finally {
    importFileInput.value = "";
  }
}

function applyCustomTheme(theme) {
  if (!theme) {
    document.documentElement.style.removeProperty("--primary");
    document.documentElement.style.removeProperty("--secondary");
    document.documentElement.style.removeProperty("--bg");
    document.documentElement.style.removeProperty("--card");
    return;
  }

  document.documentElement.style.setProperty("--primary", theme.primary);
  document.documentElement.style.setProperty("--secondary", theme.secondary);
  document.documentElement.style.setProperty("--bg", theme.bg);
  document.documentElement.style.setProperty("--card", theme.card);
}

function applyThemeMode(mode) {
  document.body.classList.toggle("light-mode", mode === "light");
}

function applyViewMode(mode) {
  list.classList.remove("mode-list", "mode-webtoon-carousel", "mode-netflix");
  const map = {
    list: "mode-list",
    "webtoon-carousel": "mode-webtoon-carousel",
    netflix: "mode-netflix",
  };
  list.classList.add(map[mode] || "mode-list");
}

function syncSettingsUI() {
  themeModeSelect.value = settings.mode;
  viewModeSelect.value = settings.viewMode;
  profileViewModeSelect.value = settings.viewMode;
  musicTrackSelect.value = settings.musicTrack;
  musicVolumeInput.value = settings.musicVolume;

  const theme = settings.customTheme || {
    primary: "#d38bff",
    secondary: "#82e2d8",
    bg: "#140f1f",
    card: "#241a35",
  };

  themePrimaryInput.value = theme.primary;
  themeSecondaryInput.value = theme.secondary;
  themeBgInput.value = theme.bg;
  themeCardInput.value = theme.card;
  goalReadMonthInput.value = settings.goals?.readMonth ?? 5;
  goalFinishPendingInput.value = settings.goals?.finishPending ?? 2;
}

function configureMusic(track, volume) {
  ambientAudio.volume = Number(volume);
  if (!TRACKS[track]) {
    ambientAudio.pause();
    ambientAudio.removeAttribute("src");
    ambientAudio.load();
    musicToggleButton.textContent = "Reproducir";
    return;
  }

  if (ambientAudio.src !== TRACKS[track]) {
    ambientAudio.src = TRACKS[track];
  }
}

async function toggleMusic() {
  if (!TRACKS[settings.musicTrack]) {
    alert("Selecciona una pista para reproducir música ambiental.");
    return;
  }

  if (ambientAudio.paused) {
    try {
      await ambientAudio.play();
      musicToggleButton.textContent = "Pausar";
    } catch {
      alert("El navegador bloqueó la reproducción automática. Intenta nuevamente.");
    }
  } else {
    ambientAudio.pause();
    musicToggleButton.textContent = "Reproducir";
  }
}

function applyAllSettings() {
  applyThemeMode(settings.mode);
  applyViewMode(settings.viewMode);
  applyCustomTheme(settings.customTheme);
  configureMusic(settings.musicTrack, settings.musicVolume);
  syncSettingsUI();
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
    if (item.emotion) {
      const emotion = document.createElement("div");
      emotion.className = "emotion-chip";
      emotion.textContent = item.emotion;
      content.append(title, meta, chapters, ratingNode, emotion);
    } else {
      content.append(title, meta, chapters, ratingNode);
    }

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
  emotionInput.value = item.emotion || "";
  tropeReencarnacionInput.checked = Array.isArray(item.tropes) ? item.tropes.includes("Reencarnación") : false;
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

  const ratingRaw = ratingInput.value.trim();
  const rating = ratingRaw === "" ? "" : Number(ratingRaw);
  const previousItem = itemId ? loadManhwas().find((item) => item.id === itemId) : null;

  const ratingRaw = ratingInput.value.trim();
  const rating = ratingRaw === "" ? "" : Number(ratingRaw);

  if (ratingRaw !== "" && (!Number.isFinite(rating) || rating < 0 || rating > 5)) {
    alert("La valoración debe estar entre 0 y 5.");
    return;
  }

  const previousItem = itemId ? loadManhwas().find((item) => item.id === itemId) : null;

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
    emotion: emotionInput.value,
    tropes: tropeReencarnacionInput.checked ? ["Reencarnación"] : [],
    createdAt: previousItem?.createdAt || new Date().toISOString(),
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

cancelEditButton.addEventListener("click", resetForm);
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

viewModeSelect.addEventListener("change", () => {
  settings.viewMode = viewModeSelect.value;
  saveSettings();
  applyViewMode(settings.viewMode);
  profileViewModeSelect.value = settings.viewMode;
});

profileViewModeSelect.addEventListener("change", () => {
  settings.viewMode = profileViewModeSelect.value;
  saveSettings();
  applyViewMode(settings.viewMode);
  viewModeSelect.value = settings.viewMode;
});

themeModeSelect.addEventListener("change", () => {
  settings.mode = themeModeSelect.value;
  saveSettings();
  applyThemeMode(settings.mode);
});

musicTrackSelect.addEventListener("change", () => {
  settings.musicTrack = musicTrackSelect.value;
  saveSettings();
  configureMusic(settings.musicTrack, settings.musicVolume);
});

musicVolumeInput.addEventListener("input", () => {
  settings.musicVolume = Number(musicVolumeInput.value);
  ambientAudio.volume = settings.musicVolume;
  saveSettings();
});

musicToggleButton.addEventListener("click", toggleMusic);

applyThemeButton.addEventListener("click", () => {
  settings.customTheme = {
    primary: themePrimaryInput.value,
    secondary: themeSecondaryInput.value,
    bg: themeBgInput.value,
    card: themeCardInput.value,
  };
  saveSettings();
  applyCustomTheme(settings.customTheme);
});

resetThemeButton.addEventListener("click", () => {
  settings.customTheme = null;
  saveSettings();
  applyCustomTheme(null);
  syncSettingsUI();
});

saveGoalsButton.addEventListener("click", () => {
  settings.goals = {
    readMonth: Number(goalReadMonthInput.value || 0),
    finishPending: Number(goalFinishPendingInput.value || 0),
  };
  saveSettings();
  renderProfile();
});

exportDataButton.addEventListener("click", exportData);

importDataButton.addEventListener("click", () => {
  importFileInput.click();
});

importFileInput.addEventListener("change", async () => {
  await importData(importFileInput.files[0]);
});

switchTab("home");
applyAllSettings();
switchTab("home");
render();
