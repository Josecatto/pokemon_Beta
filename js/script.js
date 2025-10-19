// js/script.js
// Carga catálogo Kanto desde backend y maneja búsqueda, navegación y caché local

const API_URL = "http://127.0.0.1:8000"; // Cambia si tu backend corre en otra URL
const container = document.getElementById("pokemonContainer");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");

let allPokemons = [];

/**
 * 🔄 Carga los Pokémon de Kanto desde el backend o desde el caché local.
 * Si ya se guardaron en localStorage, los muestra directamente sin recargar del servidor.
 */
async function loadKanto() {
  // Mostrar mensaje de carga
  container.innerHTML = "<p>Cargando Pokémon de Kanto...</p>";

  // Intentar obtener datos desde localStorage primero
  const cached = localStorage.getItem("kantoPokemons");
  if (cached) {
    try {
      allPokemons = JSON.parse(cached);
      console.log("✅ Pokémon cargados desde caché local.");
      displayPokemons(allPokemons);
      return; // salir sin llamar al backend
    } catch (e) {
      console.warn("⚠️ Error leyendo caché local, se cargará desde el backend.", e);
    }
  }

  // Si no hay caché, obtener desde el backend
  try {
    const res = await fetch(`${API_URL}/pokemons/kanto`);
    if (!res.ok) throw new Error("Error al obtener datos del servidor.");
    const data = await res.json();
    allPokemons = data;

    // Guardar en caché local
    localStorage.setItem("kantoPokemons", JSON.stringify(data));

    console.log("📦 Pokémon cargados y almacenados en caché local.");
    displayPokemons(data);
  } catch (e) {
    console.error("❌ Error cargando Pokémon:", e);
    container.innerHTML = `<p>Error cargando Pokémon: ${e.message}</p>`;
  }
}

/**
 * 🧩 Muestra los Pokémon en el contenedor como tarjetas (cards)
 * @param {Array} list Lista de Pokémon a mostrar
 */
function displayPokemons(list) {
  container.innerHTML = "";
  if (!list || list.length === 0) {
    container.innerHTML = "<p>No se encontraron Pokémon.</p>";
    return;
  }

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "pokemon-card";

    const img = p.image || "https://via.placeholder.com/120";

    card.innerHTML = `
      <img src="${img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${(p.types || []).join(", ")}</p>
    `;

    // Al hacer clic, ir a la página de detalles
    card.addEventListener("click", () => {
      window.location.href = `detalles.html?id=${encodeURIComponent(p.id)}`;
    });

    container.appendChild(card);
  });
}

/**
 * 🔍 Búsqueda por nombre de Pokémon
 */
searchBtn.addEventListener("click", () => {
  const term = (searchInput.value || "").trim().toLowerCase();
  if (!term) return;
  const filtered = allPokemons.filter(p => p.name.toLowerCase().includes(term));
  displayPokemons(filtered);
});

/**
 * 🔁 Reinicia la búsqueda
 */
resetBtn.addEventListener("click", () => {
  searchInput.value = "";
  displayPokemons(allPokemons);
});

// 🚀 Inicializar
loadKanto();
