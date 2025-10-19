// perfil.js
const API_URL = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", async () => {
  const perfilContainer = document.getElementById("perfilContainer");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // 🧩 Si no hay usuario logueado
  if (!user) {
    perfilContainer.innerHTML = `
      <div class="perfil-error">
        <p>No estás logueado. <a href="login.html">Inicia sesión</a></p>
      </div>
    `;
    return;
  }

  try {
    // 🧠 Petición al backend para obtener el perfil
    const res = await fetch(`${API_URL}/perfil/${encodeURIComponent(user.correo)}`);
    if (!res.ok) throw new Error("Error al obtener el perfil");

    const data = await res.json();

    // 🧩 Mostrar datos del usuario
    perfilContainer.innerHTML = `
      <div class="perfil-card">
        <h2><i class="fa-solid fa-user"></i> Usuario: ${data.nombre || user.nombre}</h2>
        <p><strong>Correo:</strong> ${data.correo}</p>

        <div class="pokemon-fav">
          <h3>Pokémon favorito:</h3>
          ${
            data.pokemon_favorito
              ? `
                <div class="poke-info">
                  <img src="${data.pokemon_favorito.imagen}" 
                       alt="${data.pokemon_favorito.nombre}" 
                       class="poke-fav-img">
                  <p>${data.pokemon_favorito.nombre}</p>
                </div>`
              : `
                <p>No has seleccionado un Pokémon favorito aún.</p>
                <button id="goCatalogBtn" class="btn-catalogo">Ir al catálogo</button>
              `
          }
        </div>

        <button id="logoutBtn" class="btn-logout">Cerrar sesión</button>
      </div>
    `;

    // 🔹 Eventos
    const goCatalogBtn = document.getElementById("goCatalogBtn");
    if (goCatalogBtn) {
      goCatalogBtn.addEventListener("click", () => {
        window.location.href = "catalogo.html";
      });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "login.html";
    });

  } catch (e) {
    perfilContainer.innerHTML = `<p>Error al cargar perfil: ${e.message}</p>`;
  }
});
