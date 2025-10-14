// js/script.js
document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://127.0.0.1:8000"; // backend
  const container = document.getElementById("pokemonContainer");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  const PLACEHOLDER = "https://via.placeholder.com/120x120?text=No+Image";

  // Cargar 151 (Kanto)
  async function loadKanto() {
    container.innerHTML = "<p>Cargando Pokémon de Kanto...</p>";
    try {
      const listRes = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
      const listJson = await listRes.json();
      const promises = listJson.results.map(r => fetch(r.url).then(rr => rr.json()));
      const all = await Promise.all(promises);
      display(all);
    } catch (err) {
      console.error("Error cargando Kanto:", err);
      container.innerHTML = `<p>Error al cargar Pokémon: ${err.message}</p>`;
    }
  }

  function display(pokemons) {
    container.innerHTML = "";
    pokemons.forEach(p => {
      const img = p.sprites?.front_default || PLACEHOLDER;
      const name = p.name;
      const card = document.createElement("div");
      card.className = "pokemon-card";
      card.innerHTML = `
        <img src="${img}" alt="${name}">
        <h3>${capitalize(name)}</h3>
        <p>ID: ${p.id}</p>
      `;
      // IMPORTANTE: redirigimos por NOMBRE (param name)
      card.addEventListener("click", () => {
        window.location.href = `detalle.html?name=${encodeURIComponent(name)}`;
      });
      container.appendChild(card);
    });
  }

  searchBtn.addEventListener("click", async () => {
    const term = (searchInput.value || "").trim().toLowerCase();
    if (!term) return;
    container.innerHTML = `<p>Buscando ${term}...</p>`;
    try {
      // Buscar directamente en PokeAPI (rápido)
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(term)}`);
      if (!res.ok) {
        container.innerHTML = "<p>Pokémon no encontrado.</p>";
        return;
      }
      const p = await res.json();
      display([p]);
    } catch (err) {
      console.error("Error búsqueda:", err);
      container.innerHTML = `<p>Error en la búsqueda: ${err.message}</p>`;
    }
  });

  function capitalize(s) {
    return s ? s.charAt(0).toUpperCase()+s.slice(1) : s;
  }

  // iniciar
  loadKanto();
});
