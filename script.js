/* ================================
   INICIALIZACIÓN DE AFINIDADES
================================ */
const afinidades = {
    Verde_Geoventis: { total: 0, color: '#4CAF50', maxTeorico: 16.5 },
    Rojo_Ignivita: { total: 0, color: '#F44336', maxTeorico: 18.2 },
    Azul_Aqualis: { total: 0, color: '#2196F3', maxTeorico: 17.5 },
    Violeta_Nousomir: { total: 0, color: '#9C27B0', maxTeorico: 16.4 },
    Negro_Obscurnis: { total: 0, color: '#333333', maxTeorico: 17.2 },
    Ámbar_Radiaris: { total: 0, color: '#FFA007', maxTeorico: 14.8 },
    Amarillo_Ampérion: { total: 0, color: '#FFEB3B', maxTeorico: 11.5 },
    Blanco_Kenobaryx: { total: 0, color: '#FFFFFF', maxTeorico: 18.5 },
    Rosa_Zoëris: { total: 0, color: '#E91E63', maxTeorico: 15.9 },
    Gris_Marron_Anthonum: { total: 0, color: '#795548', maxTeorico: 14.5 }
};

// Configuración de escala
const TECHO_ESCALA = 25; 

function normalizarNombre(id) {
    return id.replace(/_/g, ' ');
}

/* ================================
   SUMA Y EQUILIBRADO
================================ */
function sumarAfinidades(puntosEntrada) {
    for (let nombreAura in puntosEntrada) {
        const valorPuntos = puntosEntrada[nombreAura];
        for (let claveCompleta in afinidades) {
            if (claveCompleta.includes(nombreAura)) {
                // Compensación basada en el máximo teórico particular
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
    
    // Margen de 2.0 para ser secundaria (Exigente para permitir latentes)
    const diferencia = principal[1].total - segundaCandidata[1].total;
    if (diferencia <= 1.5) {
        secundaria = segundaCandidata;
    }

    // Latentes: Superan el 65% y no son principal/secundaria
    const latentes = ordenadas.filter(a => 
        a[0] !== principal[0] && 
        (!secundaria || a[0] !== secundaria[0]) && 
        (a[1].total / TECHO_ESCALA) >= 0.65
    );

    return { principal, secundaria, ranking: ordenadas, latentes };
}

/* ================================
   INTERFAZ VISUAL
================================ */
function mostrarResultados(res) {
    const contenedor = document.getElementById('resultado');

    let html = `
        <div style="text-align: center; margin-bottom: 40px; border: 2px solid ${res.principal[1].color}; padding: 25px; border-radius: 20px; background: rgba(0,0,0,0.3); box-shadow: 0 0 20px ${res.principal[1].color}33;">
            <p style="letter-spacing: 4px; font-size: 0.75rem; opacity: 0.8; margin-bottom: 10px;">AURA PREDOMINANTE</p>
            <h2 style="font-size: 2.8rem; color: ${res.principal[1].color}; text-shadow: 0 0 20px ${res.principal[1].color}88; margin: 0;">
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
                    ${res.secundaria ? `
                        <p style="font-size: 0.7rem; color: #6dff44; letter-spacing: 1px; margin-bottom: 10px;">AURAS LATENTES DETECTADAS</p>
                        <p style="font-size: 0.8rem; color: #f21b1b; margin-bottom: 10px;">Sin embargo, el cuerpo humano solo soporta un máximo de dos auras. <br> <strong>Esencias bloqueadas:</strong></p>
                    ` : `
                        <p style="font-size: 0.75rem; color: #6dff44; letter-spacing: 1px; margin-bottom: 5px;">AURAS LATENTES DETECTADAS</p>
                        <p style="font-size: 0.8rem; color: #eee; margin-bottom: 10px;">Esencias despertables:</p>
                    `}
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        ${res.latentes.map(a => `<span style="color: ${a[1].color}; font-weight: bold; font-size: 0.95rem;">${normalizarNombre(a[0])}</span>`).join(' <span style="color:rgba(255,255,255,0.2)">|</span> ')}
                    </div>
                </div>
            ` : ''}
        </div>

        <div class="ranking-container" style="background: rgba(0,0,0,0.4); padding: 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1);">
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
                        ${esPerfecto ? `<span class="badge-perfect" style="margin-left: 8px; font-size: 0.55rem; background: ${item[1].color}; color: #000000; padding: 1px 4px; border-radius: 3px; font-weight: black;">Aura de sintonía absoluta</span>` : ''}
                    </span>
                    <span style="color: ${item[1].color}; font-family: monospace; ${esPerfecto ? 'text-shadow: 0 0 8px ' + item[1].color : ''}">
                        ${porcentaje}%
                    </span>
                </div>
                <div style="background: rgba(255,255,255,0.05); border-radius: 20px; height: 7px; overflow: hidden; border: 1px solid ${esPerfecto ? item[1].color : 'rgba(255,255,255,0.05)'};">
                    <div style="width: ${porcentaje}%; background: ${item[1].color}; height: 100%; transition: width 1.5s cubic-bezier(0.22, 1, 0.36, 1); box-shadow: ${esPerfecto ? '0 0 15px ' + item[1].color : '0 0 8px ' + item[1].color + '66'};"></div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    contenedor.innerHTML = html;
    contenedor.scrollIntoView({ behavior: 'smooth' });
}

/* ================================
   MANEJADOR DE EVENTO
================================ */
document.getElementById('btnFinalizar').addEventListener('click', () => {
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
            } catch (e) {
                console.error("Error en data-puntos:", e);
            }
        }
    });

    if (respondidas < 15) {
        alert("El test está incompleto. Responde las 15 preguntas.");
        return;
    }

    const resultados = calcularResultadosFinal();
    mostrarResultados(resultados);
});