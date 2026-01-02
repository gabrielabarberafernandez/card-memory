# 🎴 Card Memory - Juego de Memoria

Un pequeño **juego de memoria** hecho con **TypeScript**, **HTML** y **CSS**, desarrollado como práctica de **Frontend**.

El objetivo del juego es encontrar todas las **parejas de cartas iguales** en el menor número de intentos y tiempo posible ⏱️.

---
## 🎮 Live Demo

🔗 [Ver demo del juego](https://gabrielabarberafernandez.github.io/card-memory/)

---

## 🧠 Características

- 🔹 Desarrollado en **TypeScript**
- 🔹 Estructura modular (`src/` → `dist/`)
- 🔹 Compilación automática con `tsc`
- 🔹 Tablero dinámico según el nivel de dificultad
- 🔹 Contador de intentos y temporizador en tiempo real
- 🔹 Animación de volteo de cartas con **CSS**
- 🔹 Opción de **reiniciar** y **cambiar de nivel**

---

## 🧩 Estructura del proyecto

```bash
card-memory/
│
├── src/
│   └── index.ts          # Lógica principal en TypeScript
│
├── dist/
│   └── index.js          # Código compilado (JS generado por TypeScript)
│
├── public/
│   ├── index.html        # Interfaz principal del juego
│   └── styles/
│       └── style.css     # Estilos del tablero y cartas
│
├── package.json
├── tsconfig.json
└── README.m