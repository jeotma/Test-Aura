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

const pesosHTML = {
    Rojo_Ignivita: 27.0, 
    Rosa_Zoëris: 28.0, 
    Amarillo_Ampérion: 24.0,
    Verde_Geoventis: 27.3,
    Violeta_Nousomir: 46.9,
    Ámbar_Radiaris: 41.1,
    Gris_Marrón_Anthonum: 40.6,
    Negro_Obscurnis: 31.6,
    Blanco_Kenobaryx: 41.0, 
    Azul_Aqualis: 43.0,
};

const MULTIPLICADOR_RESULTADO = 148; 

function normalizarNombre(id) {
    return id.replace(/_/g, ' ');
}

/* ==========================================
   GESTIÓN DE PROGRESO Y SONIDOS
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
   LÓGICA DE SUMA
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
   CÁLCULO DE RESULTADOS
=============================== */
function calcularResultadosFinal() {
    const afinidadesCalculadas = Object.keys(afinidades).map(key => {
        let puntosObtenidos = afinidades[key].total;
        const pesoDivisor = pesosHTML[key];
        
        let bonoResiliencia = 0;
        if (puntosObtenidos < 8.0) {
            bonoResiliencia = (5.0 - puntosObtenidos) * 0.4; 
        }

        let porcentajeFinal = ((puntosObtenidos + bonoResiliencia) / pesoDivisor) * MULTIPLICADOR_RESULTADO;
        if (porcentajeFinal > 100) porcentajeFinal = 100;

        return {
            nombre: key,
            total: puntosObtenidos,
            porcentaje: porcentajeFinal,
            color: afinidades[key].color
        };
    });

    const ordenadas = afinidadesCalculadas.sort((a, b) => b.porcentaje - a.porcentaje);
    
    const principal = ordenadas[0];
    const segundaCandidata = ordenadas[1];
    
    let secundaria = null;
    const diferencia = principal.porcentaje - segundaCandidata.porcentaje;
    
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
   FINALIZAR Y GUARDAR HISTORIAL
================================ */
document.getElementById('btnFinalizar').addEventListener('click', () => {
    // Resetear puntos antes de volver a contar
    for (let key in afinidades) { afinidades[key].total = 0; }

    const preguntas = document.querySelectorAll('.pregunta');
    let respondidas = 0;
    const respuestasDetalladas = {};

    preguntas.forEach((pregunta, index) => {
        const seleccion = pregunta.querySelector('input[type="radio"]:checked');
        if (seleccion) {
            try {
                const puntos = JSON.parse(seleccion.getAttribute('data-puntos'));
                sumarAfinidades(puntos);
                
                // Guardar la respuesta literal del usuario
                respuestasDetalladas[`pregunta_${index + 1}`] = seleccion.parentElement.innerText.trim();
                
                respondidas++;
            } catch (e) { console.error("Error en data-puntos:", e); }
        }
    });

    if (respondidas < 15) {
        alert("Responde las 15 preguntas.");
        return;
    }

    const resultados = calcularResultadosFinal();
    
    // --- LÓGICA DE HISTORIAL COMPLEJO ---
    const inputNombre = document.getElementById('nombreUsuario');
    const nombreParaHistorial = inputNombre ? inputNombre.value.trim() : "Anónimo";

    if (nombreParaHistorial.toLowerCase() !== "test") {
        
        // Si hay secundaria, las latentes están BLOQUEADAS
        // Si NO hay secundaria, las latentes son DESPERTABLES
        const haySecundaria = resultados.secundaria !== null;
        const nombresLatentes = resultados.latentes.map(l => l.nombre);

        const datosHistorial = {
            usuario: nombreParaHistorial,
            aura_principal: resultados.principal.nombre,
            aura_secundaria: haySecundaria ? resultados.secundaria.nombre : "Ninguna",
            latentes_despertables: !haySecundaria ? nombresLatentes : [],
            latentes_bloqueadas: haySecundaria ? nombresLatentes : [],
            respuestas_completas: respuestasDetalladas,
            es_dual: haySecundaria
        };

        if (typeof window.guardarResultado === 'function') {
            window.guardarResultado(datosHistorial);
        }
    }

    mostrarResultados(resultados);
});

/* ================================
   INTERFAZ VISUAL
================================ */
/* ================================
   INTERFAZ VISUAL AJUSTADA
================================ */
function mostrarResultados(res) {
    const contenedor = document.getElementById('resultado');
    const finalSound = document.getElementById('snd-final');
    if (finalSound) finalSound.play().catch(() => {});

    // Configuración de visualización única o dual
    if (!res.secundaria) {
        contenedor.classList.add('resultado-unico');
    } else {
        contenedor.classList.remove('resultado-unico');
    }

    // --- LÓGICA DE MATIZ VISUAL ---
    // Si hay secundaria: Matiz apagado (Bloqueadas)
    // Si no hay secundaria: Color habitual (Despertables/Emergentes)
    const estiloLatente = res.secundaria 
        ? 'filter: saturate(0.2) brightness(0.6); opacity: 0.6;' 
        : 'filter: saturate(1) brightness(1.1); text-shadow: 0 0 8px rgba(255,255,255,0.2);';

    // Determinar etiqueta para las latentes (Tu texto manual)
    const etiquetaEstado = res.secundaria 
        ? "AURAS LATENTES DETECTADAS. Sin embargo, el cuerpo humano solo es capaz de soportar 2 auras. Esencias bloqueadas:" 
        : "AURAS LATENTES DETECTADAS. Esencias emergentes:";

    let html = `
        <div style="text-align: center; margin-bottom: 40px; border: 2px solid ${res.principal.color}; padding: 25px; border-radius: 20px; background: rgba(0,0,0,0.3); box-shadow: 0 0 25px ${res.principal.color}44;">
            <p style="letter-spacing: 4px; font-size: 0.75rem; opacity: 0.8; margin-bottom: 10px;">AURA PREDOMINANTE</p>
            <h2 style="font-size: 2.8rem; color: ${res.principal.color}; text-shadow: 0 0 20px ${res.principal.color}88; margin: 0; font-weight: 800;">
                ${normalizarNombre(res.principal.nombre).toUpperCase()}
            </h2>
            
            ${res.secundaria ? `
                <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <p style="letter-spacing: 3px; font-size: 0.7rem; opacity: 0.7; margin-bottom: 8px;">AURA SECUNDARIA DESPERTADA</p>
                    <h3 style="color: ${res.secundaria.color}; font-size: 1.8rem; margin: 0; text-shadow: 0 0 10px ${res.secundaria.color}55;">
                        ${normalizarNombre(res.secundaria.nombre)}
                    </h3>
                </div>
            ` : '<p style="margin-top: 25px; font-style: italic; color: #00E5FF; opacity: 0.9;">Aura de sintonía única detectada.</p>'}

            ${res.latentes.length > 0 ? `
                <div style="margin-top: 30px; padding-top: 15px; border-top: 1px dotted rgba(255,255,255,0.1);">
                    <p style="font-size: 0.65rem; color: ${res.secundaria ? '#ff4444' : '#6dff44'}; letter-spacing: 1px; margin-bottom: 8px;">${etiquetaEstado}</p>
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        ${res.latentes.map(a => `
                            <span style="color: ${a.color}; font-weight: bold; font-size: 0.95rem; ${estiloLatente} transition: all 0.5s ease;">
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

    // Generación del ranking de barras
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
            <button type="button" id="btnReiniciar" style="background: transparent; border: 2px solid #F45B69; color: #F45B69; padding: 10px 25px; box-shadow: none; font-size: 0.8rem; cursor: pointer; transition: all 0.3s;">
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