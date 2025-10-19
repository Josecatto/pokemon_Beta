// js/detalle.js
const API_URL = "http://127.0.0.1:8000";
const container = document.getElementById("detalleContainer");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Obtener info del usuario logueado (localStorage simple)
function getLoggedUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
}

async function loadDetails() {
  if (!id) {
    container.innerHTML = "<p>No se indicó un Pokémon.</p>";
    return;
  }
  container.innerHTML = `<p>Cargando detalle...</p>`;

  try {
    // 1) pedir al backend por id (puede devolver desde BD)
    const res = await fetch(`${API_URL}/pokemon/${encodeURIComponent(id)}`);
    if (!res.ok) {
      container.innerHTML = `<p>Pokémon no encontrado (error ${res.status}).</p>`;
      return;
    }
    const p = await res.json();

    // 2) Mostrar info básica
    const types = Array.isArray(p.types) ? p.types.join(", ") : p.types;
    container.innerHTML = `
      <div class="card">
        <img src="${p.image || 'https://via.placeholder.com/200'}" alt="${p.name}">
        <h2>${p.name}</h2>
        <p><strong>Tipos:</strong> ${types}</p>
        <p><strong>Altura:</strong> ${p.height ? p.height + " m" : "—"}</p>
        <p><strong>Peso:</strong> ${p.weight ? p.weight + " kg" : "—"}</p>
        <p><strong>Habilidades:</strong> ${p.abilities || "—"}</p>
        <div id="iaArea"><em>Generando descripción (IA)...</em></div>
        <div id="favArea"></div>
      </div>
    `;

    // 3) Botón favorito si hay usuario logueado
    const user = getLoggedUser();
    const favArea = document.getElementById("favArea");
    if (user && user.correo) {
      favArea.innerHTML = `<button id="favBtn">Marcar como favorito</button>`;
      document.getElementById("favBtn").addEventListener("click", async () => {
        const body = { correo: user.correo, pokemon: p.name };
        const r = await fetch(`${API_URL}/favorito`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const j = await r.json();
        alert(j.mensaje || "Favorito guardado");
      });
    } else {
      favArea.innerHTML = `<p><a href="login.html">Inicia sesión</a> para guardar favoritos</p>`;
    }

    // 4) Solicitar descripción a IA
    try {
      const r2 = await fetch(`${API_URL}/descripcion/${encodeURIComponent(p.name)}`);
      if (r2.ok) {
        const j2 = await r2.json();
        document.getElementById("iaArea").innerHTML = `<p>${j2.descripcion}</p>${j2.debilidades ? `<p><strong>Debilidades:</strong> ${j2.debilidades}</p>` : ''}`;
      } else {
        document.getElementById("iaArea").innerHTML = `<p>No se pudo generar la descripción (IA).</p>`;
      }
    } catch (e) {
      document.getElementById("iaArea").innerHTML = `<p>Error IA: ${e}</p>`;
    }

  } catch (err) {
    container.innerHTML = `<p>Error: ${err}</p>`;
  }
}

loadDetails();
