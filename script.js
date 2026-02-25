/* ================================
   INICIALIZACIÓN DE AFINIDADES
================================ */
const afinidades = {
    Verde_Geoventis: { total: 0, color: '#4CAF50' },
    Rojo_Ignivita: { total: 0, color: '#F44336' },
    Azul_Aqualis: { total: 0, color: '#2196F3' },
    Violeta_Nousomir: { total: 0, color: '#9C27B0' },
    Negro_Obscurnis: { total: 0, color: '#cbcbcb77' },
    Ámbar_Radiaris: { total: 0, color: '#FFA007' },
    Amarillo_Ampérion: { total: 0, color: '#FFEB3B' },
    Blanco_Kenobaryx: { total: 0, color: '#FFFFFF' },
    Rosa_Zoëris: { total: 0, color: '#E91E63' },
    Gris_Marrón_Anthonum: { total: 0, color: '#795548' }
};

// Estos son los totales de puntos sumados directamente de tu HTML
// Sirven para equilibrar el peso de cada aura automáticamente.
const pesosHTML = {
    // Bajamos el divisor de las que pierden siempre
    Rojo_Ignivita: 27.0, 
    Rosa_Zoëris: 28.0, 
    Amarillo_Ampérion: 24.0,
    Verde_Geoventis: 27.3,
    
    // El resto se mantienen en un rango medio
    Violeta_Nousomir: 46.9,
    Ámbar_Radiaris: 41.1,
    Gris_Marrón_Anthonum: 40.6,
    Negro_Obscurnis: 31.6,
    Blanco_Kenobaryx: 41.0, 
    Azul_Aqualis: 43.0,

};

// Factor de escala para el ranking visual (Ajusta este número si los % salen muy bajos)
const MULTIPLICADOR_RESULTADO = 148; 

function normalizarNombre(id) {
    return id.replace(/_/g, ' ');
}

/* ==========================================
   GESTIÓN DE PROGRESO, SONIDOS Y ESTADOS
========================================== */
document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const clickSound = document.getElementById('snd-click');
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(() => {});
        }

        const respondidasArr = new Set();
        document.querySelectorAll('input[type="radio"]:checked').forEach(r => respondidasArr.add(r.name));
        const progreso = (respondidasArr.size / 15) * 100;
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) progressBar.style.width = progreso + '%';
        
        radio.closest('.pregunta').classList.add('respondida');
    });
});

/* ================================
   SUMA DE PUNTOS
================================ */
function sumarAfinidades(puntosEntrada) {
    for (let claveCorta in puntosEntrada) {
        const valorPuntos = puntosEntrada[claveCorta];
        const claveCortaNorm = claveCorta.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        for (let claveCompleta in afinidades) {
            const claveCompletaNorm = claveCompleta.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (claveCompletaNorm.includes(claveCortaNorm)) {
                afinidades[claveCompleta].total += valorPuntos;
            }
        }
    }
}

/* ================================
   CÁLCULO DE RESULTADOS (OPTIMIZADO)
=============================== */
function calcularResultadosFinal() {
    const afinidadesCalculadas = Object.keys(afinidades).map(key => {
        let puntosObtenidos = afinidades[key].total;
        const pesoDivisor = pesosHTML[key];
        
        // --- NUEVA LÓGICA DE IGUALACIÓN POR LO BAJO ---
        // Si el aura tiene pocos puntos (especialistas), le damos un empujón 
        // para que su derrota no sea tan abismal
        // Si tiene más de 5 puntos, el bono desaparece para no dopar al ganador.
        let bonoResiliencia = 0;
        if (puntosObtenidos < 8.0) {
            bonoResiliencia = (5.0 - puntosObtenidos) * 0.4; 
        }

        // Aplicamos la fórmula con el bono dinámico
        let porcentajeFinal = ((puntosObtenidos + bonoResiliencia) / pesoDivisor) * MULTIPLICADOR_RESULTADO;
        
        if (porcentajeFinal > 100) porcentajeFinal = 100;

        return {
            nombre: key,
            total: puntosObtenidos,
            porcentaje: porcentajeFinal,
            color: afinidades[key].color
        };
    });

    // Ordenamos por el porcentaje calculado
    const ordenadas = afinidadesCalculadas.sort((a, b) => b.porcentaje - a.porcentaje);
    
    const principal = ordenadas[0];
    const segundaCandidata = ordenadas[1];
    
    let secundaria = null;
    const diferencia = principal.porcentaje - segundaCandidata.porcentaje;
    
    // Si la diferencia es menor al 6%, se considera aura dual
    if (diferencia <= 6) {
        secundaria = segundaCandidata;
    }

    // Latentes: Superan el 65% y no son principal/secundaria
    const latentes = ordenadas.filter(a => 
        a.nombre !== principal.nombre && 
        (!secundaria || a.nombre !== secundaria.nombre) && 
        a.porcentaje > 65
    );

    return { principal, secundaria, ranking: ordenadas, latentes };
}

/* ================================
   INTERFAZ VISUAL
================================ */
function mostrarResultados(res) {
    const contenedor = document.getElementById('resultado');
    const finalSound = document.getElementById('snd-final');
    if (finalSound) finalSound.play().catch(() => {});

    if (!res.secundaria) {
        contenedor.classList.add('resultado-unico');
    } else {
        contenedor.classList.remove('resultado-unico');
    }

    const estiloLatente = res.secundaria 
    ? 'filter: saturate(0.6) brightness(0.9); opacity: 0.8;' 
    : 'text-shadow: 0 0 5px rgba(255,255,255,0.2);';

    let html = `
        <div style="text-align: center; margin-bottom: 40px; border: 2px solid ${res.principal.color}; padding: 25px; border-radius: 20px; background: rgba(0,0,0,0.3); box-shadow: 0 0 25px ${res.principal.color}44;">
            <p style="letter-spacing: 4px; font-size: 0.75rem; opacity: 0.8; margin-bottom: 10px;">AURA PREDOMINANTE</p>
            <h2 style="font-size: 2.8rem; color: ${res.principal.color}; text-shadow: 0 0 20px ${res.principal.color}88; margin: 0; font-weight: 800;">
                ${normalizarNombre(res.principal.nombre).toUpperCase()}
            </h2>
            
            ${res.secundaria ? `
                <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <p style="letter-spacing: 3px; font-size: 0.7rem; opacity: 0.7; margin-bottom: 8px;">AURA SECUNDARIA</p>
                    <h3 style="color: ${res.secundaria.color}; font-size: 1.8rem; margin: 0; text-shadow: 0 0 10px ${res.secundaria.color}55;">
                        ${normalizarNombre(res.secundaria.nombre)}
                    </h3>
                </div>
            ` : '<p style="margin-top: 25px; font-style: italic; color: #00E5FF; opacity: 0.9;">Aura de sintonía única.</p>'}

            ${res.latentes.length > 0 ? `
                <div style="margin-top: 30px; padding-top: 15px; border-top: 1px dotted rgba(255,255,255,0.1);">
                    <p style="font-size: 0.75rem; color: #6dff44; letter-spacing: 1px; margin-bottom: 5px;">AURAS LATENTES DETECTADAS</p>
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        ${res.latentes.map(a => `
                            <span style="color: ${a.color}; font-weight: bold; font-size: 0.95rem; ${estiloLatente}">
                                ${normalizarNombre(a.nombre)}
                            </span>
                        `).join(' <span style="color:rgba(255,255,255,0.1)">|</span> ')}
                    </div>
                </div>
            ` : ''}
        </div>

        <div class="ranking-container">
            <h4 style="margin-bottom: 25px; text-align: center; color: #00E5FF; font-size: 0.9rem; letter-spacing: 2px;">ESPECTRO DE AFINIDAD COMPLETO</h4>
    `;

    res.ranking.forEach(item => {
        const porcentaje = item.porcentaje.toFixed(1);
        const esPerfecto = item.porcentaje >= 99.9;

        html += `
            <div style="margin-bottom: 18px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 6px;">
                    <span style="font-weight: bold; opacity: 0.9; display: flex; align-items: center;">
                        ${normalizarNombre(item.nombre).toUpperCase()}
                        ${esPerfecto ? `<span class="badge-perfect" style="margin-left: 8px; font-size: 0.55rem; background: ${item.color}; color: #000; padding: 2px 5px; border-radius: 3px; font-weight: 900;">SINTONÍA ABSOLUTA</span>` : ''}
                    </span>
                    <span style="color: ${item.color}; font-family: 'Courier New', monospace; font-weight: bold;">${porcentaje}%</span>
                </div>
                <div style="background: rgba(255,255,255,0.05); border-radius: 20px; height: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); position: relative;">
                    <div class="ranking-bar-inner" style="width: ${porcentaje}%; background: ${item.color}; height: 100%; transition: width 1.5s ease-out; box-shadow: 0 0 10px ${item.color}44;"></div>
                </div>
            </div>
        `;
    });

    html += `
        <div style="text-align: center; margin-top: 40px;">
            <button type="button" id="btnReiniciar" style="background: transparent; border: 2px solid #F45B69; color: #F45B69; padding: 10px 25px; box-shadow: none; font-size: 0.8rem; cursor: pointer;">
                REINICIAR TEST
            </button>
        </div>
    </div>`;

    contenedor.innerHTML = html;
    contenedor.scrollIntoView({ behavior: 'smooth' });

    document.getElementById('btnReiniciar').addEventListener('click', () => {
        window.location.reload();
    });
}

/* ================================
   MANEJADOR DE EVENTO PRINCIPAL
================================ */
document.getElementById('btnFinalizar').addEventListener('click', () => {
    // Resetear puntuaciones antes de recalcular
    Object.keys(afinidades).forEach(key => afinidades[key].total = 0);

    const preguntas = document.querySelectorAll('.pregunta');
    let respondidas = 0;

    preguntas.forEach(pregunta => {
        const seleccion = pregunta.querySelector('input[type="radio"]:checked');
        if (seleccion) {
            try {
                const puntos = JSON.parse(seleccion.getAttribute('data-puntos'));
                sumarAfinidades(puntos);
                respondidas++;
            } catch (e) { console.error("Error en data-puntos:", e); }
        }
    });

    if (respondidas < 15) {
        alert("El test está incompleto. Responde las 15 preguntas para sintonizar tu aura.");
        return;
    }

    const resultados = calcularResultadosFinal();
    
    // --- LÓGICA DE FILTRADO PARA FIREBASE ---
    const inputNombre = document.getElementById('nombreUsuario');
    const nombreParaHistorial = inputNombre ? inputNombre.value.trim() : "Anónimo";
    
    // Condicional: Si el nombre NO es "Test" (ignora mayúsculas/minúsculas), se guarda
    if (nombreParaHistorial.toLowerCase() !== "test") {
        if (typeof window.guardarResultado === 'function') {
            window.guardarResultado(
                nombreParaHistorial, 
                resultados.principal.nombre, 
                resultados.principal.porcentaje.toFixed(1)
            );
        }
    } else {
        console.log("Modo de prueba detectado: No se enviarán datos a la base de datos.");
    }

    mostrarResultados(resultados);
});