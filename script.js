let manhwas = JSON.parse(localStorage.getItem("manhwas")) || [];

const lista = document.getElementById("listaManhwas");
const modal = document.getElementById("modal");

document.getElementById("abrirModal").onclick = () => {
  modal.style.display = "flex";
};

document.getElementById("cerrarModal").onclick = () => {
  modal.style.display = "none";
};

document.getElementById("guardar").onclick = () => {
guardarEnNube(nuevo);
cargarDesdeNube();

  const nuevo = {
    id: Date.now(),
    titulo: document.getElementById("titulo").value,
    generos: document.getElementById("generos").value,
    rating: document.getElementById("rating").value,
    imagen: document.getElementById("imagen").value,
    estado: document.getElementById("estado").value,
    notas: document.getElementById("notas").value
  };

  manhwas.push(nuevo);
  localStorage.setItem("manhwas", JSON.stringify(manhwas));

  modal.style.display = "none";
  render();
};

function render() {
  lista.innerHTML = "";

  const filtro = document.getElementById("filtroEstado").value;
  const busqueda = document.getElementById("buscador").value.toLowerCase();

  let filtrados = manhwas.filter(m =>
    (filtro === "todos" || m.estado === filtro) &&
    m.titulo.toLowerCase().includes(busqueda)
  );

  filtrados.forEach(m => {
    lista.innerHTML += `
      <div class="card">
        <img src="${m.imagen}" alt="${m.titulo}">
        <div class="card-content">
          <h3>${m.titulo}</h3>
          <p><strong>Estado:</strong> ${m.estado}</p>
          <p><strong>Rating:</strong> ${"⭐".repeat(m.rating)}</p>
          <p><strong>Géneros:</strong> ${m.generos}</p>
          <p>${m.notas}</p>
          <span class="favorite ${m.fav ? "active" : ""}" onclick="toggleFav(${m.id})">❤</span>
        </div>
      </div>
    `;
  });
<div class="card" onclick="abrirDetalle(${m.id})">
  actualizarStats();
}

function toggleFav(id) {
  manhwas = manhwas.map(m =>
    m.id === id ? { ...m, fav: !m.fav } : m
  );
  localStorage.setItem("manhwas", JSON.stringify(manhwas));
  render();
}

function actualizarStats() {
  document.getElementById("total").textContent = manhwas.length;
  document.getElementById("leidos").textContent =
    manhwas.filter(m => m.estado === "Completado").length;
}

document.getElementById("buscador").addEventListener("input", render);  
function crearGrafica() {
  const ctx = document.getElementById("graficaEstados");

  const leidos = manhwas.filter(m => m.estado === "Completado").length;
  const leyendo = manhwas.filter(m => m.estado === "Leyendo").length;
  const pausado = manhwas.filter(m => m.estado === "Pausado").length;

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completado", "Leyendo", "Pausado"],
      datasets: [{
        data: [leidos, leyendo, pausado],
        backgroundColor: ["#c084fc", "#f9a8d4", "#818cf8"]
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: "white" } }
      }
    }
  });
}

crearGrafica();
tsParticles.load("tsparticles", {
  particles: {
    number: { value: 40 },
    color: { value: "#c084fc" },
    size: { value: 3 },
    move: { enable: true, speed: 1 }
  }
});
function verificar() {
  const pass = document.getElementById("password").value;
  const clave = "nancy123"; // cámbiala

  if (pass === clave) {
    document.getElementById("login").style.display = "none";
  } else {
    alert("Contraseña incorrecta 💔");
  }
}
function abrirDetalle(id) {
  const m = manhwas.find(x => x.id === id);

  document.getElementById("contenidoDetalle").innerHTML = `
    <img src="${m.imagen}" style="width:100%;border-radius:15px;">
    <h2>${m.titulo}</h2>
    <p><strong>Estado:</strong> ${m.estado}</p>
    <p><strong>Rating:</strong> ${"⭐".repeat(m.rating)}</p>
    <p><strong>Géneros:</strong> ${m.generos}</p>
    <p>${m.notas}</p>
    <button onclick="cerrarDetalle()">Cerrar</button>
  `;
<div>
  <h3>💬 Diario</h3>
  <textarea id="nuevoComentario" placeholder="Escribe tu pensamiento..."></textarea>
  <button onclick="agregarComentario(${m.id})">Guardar</button>
  <div id="listaComentarios">
    ${(m.comentarios || []).map(c => `<p>🪄 ${c}</p>`).join("")}
  </div>
</div>
  document.getElementById("detalle").style.display = "flex";
}

function cerrarDetalle() {
  document.getElementById("detalle").style.display = "none";
}

window.onload = () => {
  document.getElementById("sonido").play();
};
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth(app);
const correoPremium = "tucorreo@gmail.com"; // pon tu correo real
window.registro = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await createUserWithEmailAndPassword(auth, email, password);
};

window.login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await signInWithEmailAndPassword(auth, email, password);
};

onAuthStateChanged(auth, (user) => {
  if (user) {
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("login").style.display = "none";

    if (user.email === correoPremium) {
      activarPremium();
    }
  }
});
    document.getElementById("login").style.display = "none";
  }
});
function agregarComentario(id) {
  const texto = document.getElementById("nuevoComentario").value;

  manhwas = manhwas.map(m => {
    if (m.id === id) {
      return {
        ...m,
        comentarios: [...(m.comentarios || []), texto]
      };
    }
    return m;
  });

  localStorage.setItem("manhwas", JSON.stringify(manhwas));
  render();
  abrirDetalle(id);
}
function activarPremium() {
  document.body.classList.add("premium");
  alert("👑 Modo Premium Activado, Nancy 💜");
}
window.guardarEnNube = async () => {
  const user = auth.currentUser;
  if (!user) return;

  await setDoc(doc(db, "usuarios", user.uid), {
    manhwas: manhwas
  });
};
function toggleMusica() {
  const musica = document.getElementById("musicaFondo");

  if (musica.paused) {
    musica.play();
  } else {
    musica.pause();
  }
}
document.getElementById("filtroEstado").onchange = render;

render();