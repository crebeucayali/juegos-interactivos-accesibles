document.addEventListener("DOMContentLoaded", () => {
  const elementos = {
    nombre: document.querySelector("#nombre-participante"),
    nivel: document.querySelector("#nivel-juego"),
    iniciar: document.querySelector("#iniciar-juego"),
    tablero: document.querySelector("#tablero"),
    mensaje: document.querySelector("#mensaje"),
    nivelActual: document.querySelector("#nivel-actual"),
    paresEncontrados: document.querySelector("#pares-encontrados"),
    intentos: document.querySelector("#intentos"),
    movimientos: document.querySelector("#movimientos"),
    anterior: document.querySelector("#nivel-anterior"),
    siguiente: document.querySelector("#siguiente-nivel"),
    reiniciar: document.querySelector("#reiniciar"),
    reconocimiento: document.querySelector("#reconocimiento"),
    nombreConstancia: document.querySelector("#nombre-constancia"),
    nivelConstancia: document.querySelector("#nivel-constancia"),
    fechaConstancia: document.querySelector("#fecha-constancia"),
    imprimir: document.querySelector("#imprimir-reconocimiento")
  };

  const paresBase = [
    { id: "familia", simbolo: "🏠", texto: "Familia" },
    { id: "escuela", simbolo: "🏫", texto: "Escuela" },
    { id: "libro", simbolo: "📚", texto: "Libro" },
    { id: "agua", simbolo: "💧", texto: "Agua" },
    { id: "jugar", simbolo: "🧩", texto: "Jugar" },
    { id: "comer", simbolo: "🍽️", texto: "Comer" },
    { id: "saludar", simbolo: "👋", texto: "Saludar" },
    { id: "emocion", simbolo: "😊", texto: "Emoción" },
    { id: "braille", simbolo: "⠃", texto: "Braille" }
  ];

  let estado = crearEstado();

  function crearEstado() {
    return {
      nivel: 1,
      tarjetas: [],
      seleccionadas: [],
      bloqueado: false,
      pares: 0,
      intentos: 0,
      movimientos: 0
    };
  }

  function paresPorNivel(nivel) {
    return Math.min(9, Math.max(2, Number(nivel) + 1));
  }

  function mezclar(lista) {
    return [...lista].sort(() => Math.random() - 0.5);
  }

  function crearTarjetas(nivel) {
    const cantidad = paresPorNivel(nivel);
    const seleccion = paresBase.slice(0, cantidad);
    const tarjetas = [];

    seleccion.forEach((par) => {
      tarjetas.push({ ...par, tarjetaId: `${par.id}-a`, estado: "oculta" });
      tarjetas.push({ ...par, tarjetaId: `${par.id}-b`, estado: "oculta" });
    });

    return mezclar(tarjetas);
  }

  function iniciarJuego(nivel = Number(elementos.nivel.value)) {
    estado = crearEstado();
    estado.nivel = Math.min(8, Math.max(1, Number(nivel)));
    estado.tarjetas = crearTarjetas(estado.nivel);

    elementos.nivel.value = String(estado.nivel);
    elementos.reconocimiento.hidden = true;
    actualizarIndicadores();
    renderizarTablero();
    mostrarMensaje(`Nivel ${estado.nivel} iniciado. Encuentra ${paresPorNivel(estado.nivel)} parejas.`, "neutral");
  }

  function renderizarTablero() {
    elementos.tablero.innerHTML = "";
    elementos.tablero.className = `tablero nivel-${estado.nivel}`;

    estado.tarjetas.forEach((tarjeta, indice) => {
      const boton = document.createElement("button");
      boton.className = "tarjeta-carta";
      boton.type = "button";
      boton.dataset.indice = String(indice);
      boton.dataset.estado = tarjeta.estado;
      boton.setAttribute("aria-label", ariaTarjeta(tarjeta));
      boton.disabled = tarjeta.estado === "encontrada" || estado.bloqueado;

      boton.innerHTML = `
        <span class="reverso" aria-hidden="true">JIA</span>
        <span class="frente">
          <span class="simbolo" aria-hidden="true">${tarjeta.simbolo}</span>
          <span class="texto">${tarjeta.texto}</span>
        </span>
      `;

      boton.addEventListener("click", () => seleccionarTarjeta(indice));
      elementos.tablero.appendChild(boton);
    });
  }

  function ariaTarjeta(tarjeta) {
    if (tarjeta.estado === "oculta") return "Tarjeta oculta. Seleccionar para descubrir.";
    if (tarjeta.estado === "encontrada") return `Pareja encontrada: ${tarjeta.texto}.`;
    return `Tarjeta descubierta: ${tarjeta.texto}.`;
  }

  function seleccionarTarjeta(indice) {
    const tarjeta = estado.tarjetas[indice];

    if (estado.bloqueado || tarjeta.estado !== "oculta") return;

    tarjeta.estado = "visible";
    estado.seleccionadas.push(indice);
    estado.movimientos += 1;
    actualizarIndicadores();
    renderizarTablero();

    if (estado.seleccionadas.length === 2) {
      verificarPareja();
    }
  }

  function verificarPareja() {
    const [primera, segunda] = estado.seleccionadas;
    const tarjetaUno = estado.tarjetas[primera];
    const tarjetaDos = estado.tarjetas[segunda];

    estado.intentos += 1;
    estado.bloqueado = true;
    actualizarIndicadores();

    if (tarjetaUno.id === tarjetaDos.id) {
      tarjetaUno.estado = "encontrada";
      tarjetaDos.estado = "encontrada";
      estado.pares += 1;
      estado.seleccionadas = [];
      estado.bloqueado = false;
      actualizarIndicadores();
      renderizarTablero();

      if (estado.pares === paresPorNivel(estado.nivel)) {
        mostrarMensaje("Nivel completado. Puedes pasar al siguiente nivel o imprimir el reconocimiento.", "correcto");
        prepararReconocimiento();
      } else {
        mostrarMensaje("Pareja encontrada. Continúa buscando las demás tarjetas.", "correcto");
      }

      return;
    }

    mostrarMensaje("No forman pareja. Observa nuevamente e intenta recordar la ubicación.", "incorrecto");

    window.setTimeout(() => {
      tarjetaUno.estado = "oculta";
      tarjetaDos.estado = "oculta";
      estado.seleccionadas = [];
      estado.bloqueado = false;
      renderizarTablero();
    }, 850);
  }

  function actualizarIndicadores() {
    elementos.nivelActual.textContent = String(estado.nivel);
    elementos.paresEncontrados.textContent = `${estado.pares}/${paresPorNivel(estado.nivel)}`;
    elementos.intentos.textContent = String(estado.intentos);
    elementos.movimientos.textContent = String(estado.movimientos);
  }

  function mostrarMensaje(texto, tipo) {
    elementos.mensaje.textContent = texto;
    elementos.mensaje.classList.remove("correcto", "incorrecto");

    if (tipo === "correcto") elementos.mensaje.classList.add("correcto");
    if (tipo === "incorrecto") elementos.mensaje.classList.add("incorrecto");
  }

  function prepararReconocimiento() {
    const nombre = elementos.nombre.value.trim() || "Participante";
    const fecha = new Date().toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    elementos.nombreConstancia.textContent = nombre;
    elementos.nivelConstancia.textContent = `nivel ${estado.nivel}`;
    elementos.fechaConstancia.textContent = fecha;
    elementos.reconocimiento.hidden = false;
  }

  elementos.iniciar.addEventListener("click", () => iniciarJuego());
  elementos.reiniciar.addEventListener("click", () => iniciarJuego(estado.nivel));
  elementos.anterior.addEventListener("click", () => iniciarJuego(Math.max(1, estado.nivel - 1)));
  elementos.siguiente.addEventListener("click", () => iniciarJuego(Math.min(8, estado.nivel + 1)));
  elementos.nivel.addEventListener("change", () => iniciarJuego(Number(elementos.nivel.value)));
  elementos.imprimir.addEventListener("click", () => window.print());

  iniciarJuego(1);
});
