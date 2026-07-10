document.addEventListener("DOMContentLoaded", () => {
  const elementos = {
    nombre: document.querySelector("#nombre-participante"),
    nivel: document.querySelector("#nivel-juego"),
    iniciar: document.querySelector("#iniciar-juego"),
    escenario: document.querySelector("#escenario"),
    opciones: document.querySelector("#opciones"),
    mensaje: document.querySelector("#mensaje"),
    nivelActual: document.querySelector("#nivel-actual"),
    estrellas: document.querySelector("#estrellas"),
    ronda: document.querySelector("#ronda"),
    siguienteRonda: document.querySelector("#siguiente-ronda"),
    anterior: document.querySelector("#nivel-anterior"),
    siguienteNivel: document.querySelector("#siguiente-nivel"),
    reiniciar: document.querySelector("#reiniciar"),
    reconocimiento: document.querySelector("#reconocimiento"),
    nombreConstancia: document.querySelector("#nombre-constancia"),
    nivelConstancia: document.querySelector("#nivel-constancia"),
    fechaConstancia: document.querySelector("#fecha-constancia"),
    imprimir: document.querySelector("#imprimir-reconocimiento")
  };

  const totalNiveles = 6;
  const rondasPorNivel = 5;
  const estrellasObjetivo = 3;

  let estado = crearEstado();

  function crearEstado() {
    return {
      nivel: 1,
      ronda: 1,
      estrellas: 0,
      respuesta: 1,
      respondido: false
    };
  }

  function maximoPorNivel(nivel) {
    const limites = [3, 5, 7, 9, 10, 12];
    return limites[nivel - 1] || 12;
  }

  function cantidadPorNivel(nivel) {
    const maximo = maximoPorNivel(nivel);
    return numeroAleatorio(1, maximo);
  }

  function numeroAleatorio(minimo, maximo) {
    return Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
  }

  function iniciarJuego(nivel = Number(elementos.nivel.value)) {
    estado = crearEstado();
    estado.nivel = Math.min(totalNiveles, Math.max(1, Number(nivel)));
    elementos.nivel.value = String(estado.nivel);
    elementos.reconocimiento.hidden = true;
    cargarRonda();
  }

  function cargarRonda() {
    estado.respondido = false;
    estado.respuesta = cantidadPorNivel(estado.nivel);
    actualizarIndicadores();
    renderizarObjetos();
    renderizarOpciones();
    mostrarMensaje("Cuenta los objetos y elige una respuesta.", "neutral");
  }

  function renderizarObjetos() {
    elementos.escenario.innerHTML = "";
    elementos.escenario.setAttribute("aria-label", `Recuadro con ${estado.respuesta} objetos para contar.`);

    const posiciones = generarPosiciones(estado.respuesta);
    posiciones.forEach((posicion, indice) => {
      const objeto = document.createElement("span");
      objeto.className = "objeto";
      objeto.style.left = `${posicion.x}%`;
      objeto.style.top = `${posicion.y}%`;
      objeto.setAttribute("aria-hidden", "true");
      objeto.style.transform = `scale(${posicion.escala})`;
      elementos.escenario.appendChild(objeto);
    });
  }

  function generarPosiciones(cantidad) {
    const posicionesBase = [
      { x: 22, y: 28 }, { x: 52, y: 25 }, { x: 72, y: 42 },
      { x: 34, y: 52 }, { x: 58, y: 58 }, { x: 18, y: 70 },
      { x: 78, y: 70 }, { x: 44, y: 76 }, { x: 68, y: 18 },
      { x: 12, y: 44 }, { x: 84, y: 28 }, { x: 28, y: 14 }
    ];

    return mezclar(posicionesBase).slice(0, cantidad).map((posicion, indice) => ({
      ...posicion,
      escala: indice % 3 === 0 ? 1 : indice % 3 === 1 ? .92 : 1.08
    }));
  }

  function renderizarOpciones() {
    elementos.opciones.innerHTML = "";
    const opciones = generarOpciones(estado.respuesta, maximoPorNivel(estado.nivel));

    opciones.forEach((opcion) => {
      const boton = document.createElement("button");
      boton.className = "opcion-numero";
      boton.type = "button";
      boton.textContent = opcion;
      boton.setAttribute("aria-label", `Responder ${opcion}`);
      boton.addEventListener("click", () => responder(opcion, boton));
      elementos.opciones.appendChild(boton);
    });
  }

  function generarOpciones(respuesta, maximo) {
    const opciones = new Set([respuesta]);
    let desplazamiento = 1;

    while (opciones.size < 5) {
      const menor = respuesta - desplazamiento;
      const mayor = respuesta + desplazamiento;

      if (menor >= 1) opciones.add(menor);
      if (opciones.size < 5 && mayor <= maximo) opciones.add(mayor);

      if (opciones.size < 5) opciones.add(numeroAleatorio(1, maximo));
      desplazamiento += 1;
    }

    return mezclar([...opciones]).slice(0, 5);
  }

  function mezclar(lista) {
    return [...lista].sort(() => Math.random() - 0.5);
  }

  function responder(opcion, botonSeleccionado) {
    if (estado.respondido) return;

    estado.respondido = true;
    const botones = elementos.opciones.querySelectorAll("button");
    botones.forEach((boton) => {
      boton.disabled = true;
      if (Number(boton.textContent) === estado.respuesta) {
        boton.classList.add("correcta");
      }
    });

    if (opcion === estado.respuesta) {
      estado.estrellas = Math.min(estrellasObjetivo, estado.estrellas + 1);
      mostrarMensaje("Respuesta correcta. Avanza a la siguiente ronda.", "correcto");
    } else {
      botonSeleccionado.classList.add("incorrecta");
      mostrarMensaje(`Respuesta por revisar. La cantidad correcta era ${estado.respuesta}.`, "incorrecto");
    }

    actualizarIndicadores();

    if (estado.estrellas >= estrellasObjetivo) {
      mostrarMensaje("Completaste las estrellas del nivel. Puedes pasar al siguiente nivel o imprimir el reconocimiento.", "correcto");
      prepararReconocimiento();
    }
  }

  function siguienteRonda() {
    if (estado.ronda < rondasPorNivel) {
      estado.ronda += 1;
      cargarRonda();
      return;
    }

    if (estado.estrellas >= estrellasObjetivo && estado.nivel < totalNiveles) {
      iniciarJuego(estado.nivel + 1);
      return;
    }

    if (estado.estrellas < estrellasObjetivo) {
      mostrarMensaje("Intenta reforzar el nivel hasta alcanzar tres estrellas.", "incorrecto");
      return;
    }

    mostrarMensaje("Juego completado. Puedes imprimir el reconocimiento.", "correcto");
    prepararReconocimiento();
  }

  function cambiarNivel(valor) {
    iniciarJuego(Math.min(totalNiveles, Math.max(1, estado.nivel + valor)));
  }

  function actualizarIndicadores() {
    elementos.nivelActual.textContent = `${estado.nivel}/${totalNiveles}`;
    elementos.estrellas.textContent = `${estado.estrellas}/${estrellasObjetivo}`;
    elementos.ronda.textContent = `${estado.ronda}/${rondasPorNivel}`;
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
  elementos.siguienteRonda.addEventListener("click", siguienteRonda);
  elementos.anterior.addEventListener("click", () => cambiarNivel(-1));
  elementos.siguienteNivel.addEventListener("click", () => cambiarNivel(1));
  elementos.reiniciar.addEventListener("click", () => iniciarJuego(estado.nivel));
  elementos.nivel.addEventListener("change", () => iniciarJuego(Number(elementos.nivel.value)));
  elementos.imprimir.addEventListener("click", () => window.print());

  iniciarJuego(1);
});
