# backend/main.py
"""
FastAPI backend para la Pokédex de Catto.
- Consume PokeAPI para obtener datos de Pokémon.
- Usa OpenAI para generar descripciones breves y debilidades.
- Carga .env desde la carpeta backend/ (asegúrate de poner OPENAI_API_KEY en backend/.env).
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from dotenv import load_dotenv
import os
from openai import OpenAI
from pathlib import Path

# -------------------------
# Configuración inicial
# -------------------------
BASE_DIR = Path(__file__).resolve().parent
dotenv_path = BASE_DIR / ".env"
load_dotenv(dotenv_path)

POKE_API = "https://pokeapi.co/api/v2"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="Pokédex Catto - Backend")

# CORS (permite peticiones del frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cliente de OpenAI (solo si hay API key)
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


def safe_get(url):
    """Hace requests con manejo de errores."""
    try:
        res = requests.get(url, timeout=8)
        res.raise_for_status()
        return res.json()
    except requests.RequestException:
        return None


# -------------------------
# Endpoint: lista inicial de pokemons
# GET /pokemons?limit=50
# -------------------------
@app.get("/pokemons")
def get_pokemons(limit: int = 50):
    """Devuelve lista básica de Pokémon (id, name, image, types)."""
    data = safe_get(f"{POKE_API}/pokemon?limit={limit}")
    if not data or "results" not in data:
        raise HTTPException(status_code=502, detail="Error al contactar PokeAPI")

    pokemons = []
    for item in data["results"]:
        poke = safe_get(item["url"])
        if not poke:
            continue
        pokemons.append({
            "id": poke["id"],
            "name": poke["name"].capitalize(),
            "image": poke["sprites"]["front_default"],
            "types": [t["type"]["name"] for t in poke["types"]]
        })
    return pokemons


# -------------------------
# Endpoint: detalle de un Pokémon
# GET /pokemon/{name}
# -------------------------
@app.get("/pokemon/{name}")
def get_pokemon(name: str):
    """Devuelve detalle (id, name, image, types, height m, weight kg, abilities)."""
    poke = safe_get(f"{POKE_API}/pokemon/{name.lower()}")
    if not poke:
        raise HTTPException(status_code=404, detail="Pokémon no encontrado")

    height_m = round(poke["height"] / 10, 1)
    weight_kg = round(poke["weight"] / 10, 1)

    return {
        "id": poke["id"],
        "name": poke["name"].capitalize(),
        "image": poke["sprites"]["front_default"],
        "types": [t["type"]["name"] for t in poke["types"]],
        "height": height_m,
        "weight": weight_kg,
        "abilities": [a["ability"]["name"] for a in poke["abilities"]],
    }


# -------------------------
# Endpoint: descripción con IA
# GET /descripcion/{name}
# -------------------------
@app.get("/descripcion/{name}")
def get_pokemon_description(name: str):
    """Genera descripción breve y debilidades usando OpenAI."""
    poke = safe_get(f"{POKE_API}/pokemon/{name.lower()}")
    if not poke:
        raise HTTPException(status_code=404, detail="Pokémon no encontrado")

    tipos = [t["type"]["name"] for t in poke["types"]]
    habilidades = [a["ability"]["name"] for a in poke["abilities"]]

    if not client:
        return {
            "name": name.capitalize(),
            "types": tipos,
            "abilities": habilidades,
            "descripcion": "OpenAI API Key no configurada.",
            "debilidades": None
        }

    prompt = (
        f"Describe al Pokémon {name.capitalize()} en máximo 3 frases. "
        f"Menciona sus rasgos y habilidades principales. "
        f"Finalmente, incluye sus debilidades según sus tipos: {', '.join(tipos)}. "
        "Sé conciso y amigable."
    )

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Eres un experto en Pokémon que escribe descripciones cortas y precisas."},
                {"role": "user", "content": prompt}
            ]
        )
        raw = completion.choices[0].message.content.strip()
        partes = raw.split("Debilidades:") if "Debilidades:" in raw else raw.split("Debilidades")
        descripcion = partes[0].strip()
        debilidades = partes[1].strip() if len(partes) > 1 else None

    except Exception as e:
        descripcion = f"No se pudo generar la descripción automáticamente. ({e})"
        debilidades = None

    return {
        "name": name.capitalize(),
        "types": tipos,
        "abilities": habilidades,
        "descripcion": descripcion,
        "debilidades": debilidades
    }
