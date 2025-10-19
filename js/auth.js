// js/auth.js
const API_URL = "http://127.0.0.1:8000";

// Registro
document.addEventListener("DOMContentLoaded", () => {
  const regBtn = document.getElementById("reg_btn");
  if (regBtn) {
    regBtn.addEventListener("click", async () => {
      const nombre = document.getElementById("reg_nombre").value;
      const correo = document.getElementById("reg_correo").value;
      const contrasena = document.getElementById("reg_pass").value;
      const res = await fetch(`${API_URL}/registro`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ nombre, correo, contrasena })
      });
      const j = await res.json();
      if (res.ok) {
        alert("Registrado. Ahora inicia sesión.");
      } else {
        alert("Error: " + (j.detail || JSON.stringify(j)));
      }
    });
  }

  const logBtn = document.getElementById("log_btn");
  if (logBtn) {
    logBtn.addEventListener("click", async () => {
      const correo = document.getElementById("log_correo").value;
      const contrasena = document.getElementById("log_pass").value;
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ correo, contrasena })
      });
      if (res.ok) {
        const j = await res.json();
        // Guardar usuario en localStorage (nombre + correo)
        localStorage.setItem("user", JSON.stringify({ nombre: j.nombre, correo: j.correo }));
        alert("Inicio de sesión correcto");
        window.location.href = "perfil.html";
      } else {
        const j = await res.json();
        alert("Error: " + (j.detail || JSON.stringify(j)));
      }
    });
  }

  // Si estamos en perfil.html, cargar perfil
  const perfilContainer = document.getElementById("perfilContainer");
  if (perfilContainer) {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      perfilContainer.innerHTML = `<p>No estás logueado. <a href="login.html">Inicia sesión</a></p>`;
      return;
    }
    fetch(`${API_URL}/perfil/${encodeURIComponent(user.correo)}`)
      .then(r => r.json())
      .then(data => {
        perfilContainer.innerHTML = `
          <h2>Perfil de ${data.nombre}</h2>
          <p><strong>Correo:</strong> ${data.correo}</p>
          <p><strong>Pokémon favorito:</strong> ${data.pokemon_favorito || 'No tiene'}</p>
          <button id="logoutBtn">Cerrar sesión</button>
        `;
        document.getElementById("logoutBtn").addEventListener("click", () => {
          localStorage.removeItem("user");
          window.location.href = "index.html";
        });
      })
      .catch(e => {
        perfilContainer.innerHTML = `<p>Error al cargar perfil: ${e}</p>`;
      });
  }
});
