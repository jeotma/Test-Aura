/* ================================
   INICIALIZACIÓN DE AFINIDADES
================================ */
const afinidades = {
    Verde_Geoventis: { total: 0, color: '#4CAF50', maxTeorico: 16.5 },
    Rojo_Ignivita: { total: 0, color: '#F44336', maxTeorico: 15.7 },
    Azul_Aqualis: { total: 0, color: '#2196F3', maxTeorico: 17.5 },
    Violeta_Nousomir: { total: 0, color: '#9C27B0', maxTeorico: 16.8 },
    Negro_Obscurnis: { total: 0, color: '#cbcbcb77', maxTeorico: 16.2 }, 
    Ámbar_Radiaris: { total: 0, color: '#FFA007', maxTeorico: 14.8 },
    Amarillo_Ampérion: { total: 0, color: '#FFEB3B', maxTeorico: 13.5 },
    Blanco_Kenobaryx: { total: 0, color: '#FFFFFF', maxTeorico: 17.2 },
    Rosa_Zoëris: { total: 0, color: '#E91E63', maxTeorion: 15.1 },
    Gris_Marron_Anthonum: { total: 0, color: '#795548', maxTeorico: 15.3 }
};

const TECHO_ESCALA = 25; 

function normalizarNombre(id) {
    return id.replace(/_/g, ' ');
}

/* ==========================================
   GESTIÓN DE PROGRESO, SONIDOS Y ESTADOS
========================================== */
document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
        // 1. Reproducir sonido de click
        const clickSound = document.getElementById('snd-click');
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(() => {}); // Evita errores si el navegador bloquea
        }

        // 2. Actualizar barra de progreso global
        const respondidasArr = new Set();
        document.querySelectorAll('input[type="radio"]:checked').forEach(r => respondidasArr.add(r.name));
        const progreso = (respondidasArr.size / 15) * 100;
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) progressBar.style.width = progreso + '%';
        
        // 3. Marcar la pregunta visualmente
        radio.closest('.pregunta').classList.add('respondida');
    });
});

/* ================================
   SUMA Y EQUILIBRADO
================================ */
function sumarAfinidades(puntosEntrada) {
    for (let claveCorta in puntosEntrada) {
        const valorPuntos = puntosEntrada[claveCorta];
        // Buscamos la coincidencia en el objeto afinidades (ej: "Geoventis" en "Verde_Geoventis")
        for (let claveCompleta in afinidades) {
            if (claveCompleta.includes(claveCorta)) {
                const factorRescale = 20 / afinidades[claveCompleta].maxTeorico;
                afinidades[claveCompleta].total += (valorPuntos * factorRescale);
            }
        }
    }
}

/* ================================
   CÁLCULO DE RESULTADOS
=============================== */
function calcularResultadosFinal() {
    const ordenadas = Object.entries(afinidades).sort((a, b) => b[1].total - a[1].total);
    const principal = ordenadas[0];
    const segundaCandidata = ordenadas[1];
    
    let secundaria = null;
    const diferencia = principal[1].total - segundaCandidata[1].total;
    
    // Margen de 1.5 para permitir dualidad
    if (diferencia <= 1.5) {
        secundaria = segundaCandidata;
    }

    // Latentes: Superan el 67.1% y no son principal/secundaria
    const latentes = ordenadas.filter(a => 
        a[0] !== principal[0] && 
        (!secundaria || a[0] !== secundaria[0]) && 
        (a[1].total / TECHO_ESCALA) > 0.671
    );

    return { principal, secundaria, ranking: ordenadas, latentes };
}

/* ================================
   INTERFAZ VISUAL
================================ */
function mostrarResultados(res) {
    const contenedor = document.getElementById('resultado');

    // Sonido final
    const finalSound = document.getElementById('snd-final');
    if (finalSound) finalSound.play().catch(() => {});

    // Brillo especial para sintonía única
    if (!res.secundaria) {
        contenedor.classList.add('resultado-unico');
    } else {
        contenedor.classList.remove('resultado-unico');
    }

    const estiloLatente = res.secundaria 
    ? 'filter: saturate(0.6) brightness(0.9); opacity: 0.8;' 
    : 'text-shadow: 0 0 5px rgba(255,255,255,0.2);';

    let html = `
        <div style="text-align: center; margin-bottom: 40px; border: 2px solid ${res.principal[1].color}; padding: 25px; border-radius: 20px; background: rgba(0,0,0,0.3); box-shadow: 0 0 25px ${res.principal[1].color}44;">
            <p style="letter-spacing: 4px; font-size: 0.75rem; opacity: 0.8; margin-bottom: 10px;">AURA PREDOMINANTE</p>
            <h2 style="font-size: 2.8rem; color: ${res.principal[1].color}; text-shadow: 0 0 20px ${res.principal[1].color}88; margin: 0; font-weight: 800;">
                ${normalizarNombre(res.principal[0]).toUpperCase()}
            </h2>
            
            ${res.secundaria ? `
                <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <p style="letter-spacing: 3px; font-size: 0.7rem; opacity: 0.7; margin-bottom: 8px;">AURA SECUNDARIA</p>
                    <h3 style="color: ${res.secundaria[1].color}; font-size: 1.8rem; margin: 0; text-shadow: 0 0 10px ${res.secundaria[1].color}55;">
                        ${normalizarNombre(res.secundaria[0])}
                    </h3>
                </div>
            ` : '<p style="margin-top: 25px; font-style: italic; color: #00E5FF; opacity: 0.9;">Aura de sintonía única.</p>'}

            ${res.latentes.length > 0 ? `
                <div style="margin-top: 30px; padding-top: 15px; border-top: 1px dotted rgba(255,255,255,0.1);">
                    <p style="font-size: 0.75rem; color: #6dff44; letter-spacing: 1px; margin-bottom: 5px;">AURAS LATENTES DETECTADAS</p>
                    ${res.secundaria ? `<p style="font-size: 0.8rem; color: #f21b1b; margin-bottom: 12px; font-weight: bold;">Sin embargo, el cuerpo humano solo es capaz de soportar dos tipos de aura. Esencias bloqueadas:</p>` : `<p style="font-size: 0.8rem; color: #eee; margin-bottom: 12px;">Esencias emergentes:</p>`}
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        ${res.latentes.map(a => `
                            <span style="color: ${a[1].color}; font-weight: bold; font-size: 0.95rem; ${estiloLatente}">
                                ${normalizarNombre(a[0])}
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
        let porcentaje = ((item[1].total / TECHO_ESCALA) * 100).toFixed(1);
        if (porcentaje > 100) porcentaje = 100;
        
        const esPerfecto = porcentaje >= 100;

        html += `
            <div style="margin-bottom: 18px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 6px;">
                    <span style="font-weight: bold; opacity: 0.9; display: flex; align-items: center;">
                        ${normalizarNombre(item[0]).toUpperCase()}
                        ${esPerfecto ? `<span class="badge-perfect" style="margin-left: 8px; font-size: 0.55rem; background: ${item[1].color}; color: #000; padding: 2px 5px; border-radius: 3px; font-weight: 900;">SINTONÍA ABSOLUTA</span>` : ''}
                    </span>
                    <span style="color: ${item[1].color}; font-family: 'Courier New', monospace; font-weight: bold;">${porcentaje}%</span>
                </div>
                <div style="background: rgba(255,255,255,0.05); border-radius: 20px; height: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); position: relative;">
                    <div class="ranking-bar-inner" style="width: ${porcentaje}%; background: ${item[1].color}; height: 100%; transition: width 1.5s ease-out; box-shadow: 0 0 10px ${item[1].color}44;"></div>
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
    // Resetear puntuaciones
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
        alert("El espectro está incompleto. Responde las 15 preguntas para sintonizar tu aura.");
        return;
    }

    const resultados = calcularResultadosFinal();
    mostrarResultados(resultados);
});