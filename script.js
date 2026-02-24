/* ================================
   INICIALIZACIÓN DE AFINIDADES
================================ */

const afinidades = {
    Verde_Geoventis: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Rojo_Ignivita: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Azul_Aqualis: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Violeta_Nousomir: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Negro_Obscurnis: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Ámbar_Radiaris: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Amarillo_Ampérion: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Blanco_Kenobaryx: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Rosa_Zoëris: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Gris_Marron_Anthonum: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 }
};

/* ================================
   LÓGICA DE SUMA DE PUNTOS
================================ */
function sumarAfinidades(tipos) {
    const valores = Object.values(tipos);
    const maxValor = Math.max(...valores);
    
    // Si todos los valores son iguales, el segundo valor se considera el mismo para evitar errores
    const valoresMenores = valores.filter(v => v < maxValor);
    const segundoValor = valoresMenores.length > 0 ? Math.max(...valoresMenores) : maxValor;

    for (let clave in tipos) {
        if (afinidades.hasOwnProperty(clave)) {
            const val = tipos[clave];
            afinidades[clave].total += val;
            if (val === maxValor) afinidades[clave].maxCount += 1;
            if (val === segundoValor && valoresMenores.length > 0) afinidades[clave].secondMaxCount += 1;
            if (val >= 1) afinidades[clave].highScoreCount += 1;
        }
    }
}

/* ================================
   CÁLCULO FINAL DE RESULTADOS
================================ */
function calcularResultadosFinal() {
    const arr = Object.entries(afinidades);

    // Función de prioridad para desempates
    function desempate(a, b) {
        if (b[1].total !== a[1].total) return b[1].total - a[1].total;
        if (b[1].maxCount !== a[1].maxCount) return b[1].maxCount - a[1].maxCount;
        if (b[1].secondMaxCount !== a[1].secondMaxCount) return b[1].secondMaxCount - a[1].secondMaxCount;
        if (b[1].highScoreCount !== a[1].highScoreCount) return b[1].highScoreCount - a[1].highScoreCount;
        return 0;
    }

    const ordenadas = [...arr].sort(desempate);

    // 1. DETERMINAR PRINCIPAL
    let principal = ordenadas[0];
    let candidatosEmpatePrincipal = ordenadas.filter(item => 
        item[1].total === principal[1].total && desempate(item, principal) === 0
    );
    
    if (candidatosEmpatePrincipal.length > 1) {
        principal = candidatosEmpatePrincipal[Math.floor(Math.random() * candidatosEmpatePrincipal.length)];
    }

    // 2. DETERMINAR SECUNDARIA
    let secundaria = null;
    // Solo buscamos secundaria si no es el mismo aura que la principal y la diferencia es <= 1
    let candidatosSecundaria = ordenadas.filter(item => {
        const esDiferente = item[0] !== principal[0];
        const diferenciaCorta = (principal[1].total - item[1].total) <= 1;
        return esDiferente && diferenciaCorta;
    });

    if (candidatosSecundaria.length > 0) {
        candidatosSecundaria.sort(desempate);
        const mejorSecundaria = candidatosSecundaria[0];
        
        // Manejo de empate en la secundaria
        let empatadosSec = candidatosSecundaria.filter(item => desempate(item, mejorSecundaria) === 0);
        secundaria = empatadosSec.length > 1 ? 
            empatadosSec[Math.floor(Math.random() * empatadosSec.length)] : 
            mejorSecundaria;
    }

    // 3. DETERMINAR LATENTES
    let latentesDespertables = [];
    let latentesBloqueadas = [];
    const aurasActivas = secundaria ? 2 : 1;

    ordenadas.forEach(item => {
        const nombre = item[0];
        const puntuacion = item[1].total;
        if (nombre !== principal[0] && (!secundaria || nombre !== secundaria[0])) {
            if (puntuacion >= 16.5) {
                if (aurasActivas < 2) latentesDespertables.push(nombre);
                else latentesBloqueadas.push(nombre);
            }
        }
    });

    return {
        principal: principal[0],
        secundaria: secundaria ? secundaria[0] : null,
        latentesDespertables,
        latentesBloqueadas,
        ranking: ordenadas
    };
}

/* ================================
   INTERACCIÓN CON EL DOM
================================ */
document.getElementById('btnFinalizar').addEventListener('click', () => {
    // Resetear puntuaciones para permitir repetir el test
    for (let clave in afinidades) {
        afinidades[clave] = { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 };
    }

    const form = document.getElementById('testForm');
    const preguntas = form.querySelectorAll('.pregunta');
    let respondidas = 0;

    preguntas.forEach(pregunta => {
        const seleccion = pregunta.querySelector('input[type="radio"]:checked');
        if (seleccion) {
            const puntos = JSON.parse(seleccion.getAttribute('data-puntos'));
            sumarAfinidades(puntos);
            respondidas++;
        }
    });

    if (respondidas < 15) {
        alert(`Has respondido ${respondidas} de 15 preguntas. Por favor, completa el test.`);
        return;
    }

    const res = calcularResultadosFinal();
    mostrarResultados(res);
});

function mostrarResultados(res) {
    const contenedor = document.getElementById('resultado');
    let html = `
        <div class="resultado-final">
            <h2>Tu Aura Principal: <span class="destaque">${res.principal}</span></h2>
            ${res.secundaria ? `<h3>Aura Secundaria: <span class="destaque-sec">${res.secundaria}</span></h3>` : '<p>No posees un aura secundaria definida.</p>'}
            
            ${res.latentesDespertables.length > 0 ? `<p><strong>Auras Latentes:</strong> ${res.latentesDespertables.join(', ')}</p>` : ''}
            
            <h4>Ranking de Afinidades:</h4>
            <ul>
                ${res.ranking.map(item => `<li>${item[0]}: ${item[1].total.toFixed(1)} pts</li>`).join('')}
            </ul>
        </div>
    `;
    contenedor.innerHTML = html;
    contenedor.scrollIntoView({ behavior: 'smooth' });
}