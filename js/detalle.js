// js/detalle.js
document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://127.0.0.1:8000"; // tu backend FastAPI
  const container = document.getElementById("detalleContainer");
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");

  if (!name) {
    container.innerHTML = "<p>No se especificó ningún Pokémon.</p>";
    return;
  }

  async function load() {
    container.innerHTML = `<p>🔍 Cargando detalles de ${name}...</p>`;
    try {
      // 1) Datos básicos (desde tu backend o directamente PokeAPI)
      const res = await fetch(`${API_URL}/pokemon/${encodeURIComponent(name)}`);
      if (!res.ok) {
        // si tu backend devuelve 404 con JSON {error:...} puede no ser res.ok, manejamos ambos casos
        const tx = await res.text();
        console.warn("Respuesta /pokemon/ no OK:", res.status, tx);
        container.innerHTML = `<p>Pokémon no encontrado o error en backend (${res.status}).</p>`;
        return;
      }
      const data = await res.json();

      // 2) Descripción + debilidades desde tu endpoint IA
      // Ajusta la ruta según tu backend: aquí asumimos /descripcion/{name}
      let ia = { descripcion: "No disponible", debilidades: null };
      try {
        const r2 = await fetch(`${API_URL}/descripcion/${encodeURIComponent(name)}`);
        if (r2.ok) {
          ia = await r2.json();
        } else {
          console.warn("IA returned not ok", r2.status);
        }
      } catch (e) {
        console.warn("Error al llamar IA:", e);
      }

      // 3) Mostrarlo (safeguards)
      const img = data.image || "https://via.placeholder.com/200x200?text=No+Image";
      const types = (data.types || []).join(", ");
      const abilities = (data.abilities || []).join(", ");
      const height = (data.height !== undefined) ? `${(data.height).toString()} m` : "—";
      const weight = (data.weight !== undefined) ? `${(data.weight).toString()} kg` : "—";

      container.innerHTML = `
        <div class="detalle-container">
          <img src="${img}" alt="${data.name}">
          <h2>${capitalize(data.name)}</h2>
          <p><strong>Tipos:</strong> ${types || "—"}</p>
          <p><strong>Altura:</strong> ${height}</p>
          <p><strong>Peso:</strong> ${weight}</p>
          <p><strong>Habilidades:</strong> ${abilities || "—"}</p>
          <hr>
          <p><strong>Descripción (IA):</strong> ${ia.descripcion || "—"}</p>
          <p><strong>Debilidades (IA):</strong> ${ia.debilidades || "—"}</p>
        </div>
      `;
    } catch (err) {
      console.error("Error cargando detalles:", err);
      container.innerHTML = "<p>Error al cargar detalles del Pokémon.</p>";
    }
  }

  function capitalize(s) { return s ? s.charAt(0).toUpperCase()+s.slice(1) : s; }
  load();
});
