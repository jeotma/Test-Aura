/* ================================
   INICIALIZACIÓN DE AFINIDADES
================================ */

const afinidades = {
    Geoventis: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Ignivita: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Aqualis: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Nousomir: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Obscurnis: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Radiaris: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Ampérion: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Kenobaryx: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Zoëris: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 },
    Anthonum: { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 }
};

/* ================================
   SUMAR PUNTOS
================================ */
function sumarAfinidades(tipos) {
    const valores = Object.values(tipos);
    const maxValor = Math.max(...valores);
    const segundoValor = valores.filter(v => v < maxValor).sort((a,b)=>b-a)[0] || 0;

    for (let clave in tipos) {
        if (afinidades.hasOwnProperty(clave)) {
            const val = tipos[clave];
            afinidades[clave].total += val;
            if (val === maxValor) afinidades[clave].maxCount += 1;
            if (val === segundoValor) afinidades[clave].secondMaxCount += 1;
            if (val >= 1) afinidades[clave].highScoreCount += 1;
        }
    }
}

/* ================================
   FUNCION FINAL PARA RESULTADO
================================ */
function calcularResultadosFinal() {

    const arr = Object.entries(afinidades);

    function desempate(a, b) {
        if (b[1].total !== a[1].total) return b[1].total - a[1].total;
        if (b[1].maxCount !== a[1].maxCount) return b[1].maxCount - a[1].maxCount;
        if (b[1].secondMaxCount !== a[1].secondMaxCount) return b[1].secondMaxCount - a[1].secondMaxCount;
        if (b[1].highScoreCount !== a[1].highScoreCount) return b[1].highScoreCount - a[1].highScoreCount;
        return 0;
    }

    const ordenadas = arr.sort(desempate);

    // -----------------------------
    // PRIMARIA
    // -----------------------------
    let principal = ordenadas[0];
    let candidatosEmpate = ordenadas.filter(item => item[1].total === principal[1].total);
    if (candidatosEmpate.length > 1) {
        candidatosEmpate.sort(desempate);
        const maxValor = candidatosEmpate[0][1];
        const ultimosEmpatados = candidatosEmpate.filter(item =>
            item[1].total === maxValor.total &&
            item[1].maxCount === maxValor.maxCount &&
            item[1].secondMaxCount === maxValor.secondMaxCount &&
            item[1].highScoreCount === maxValor.highScoreCount
        );
        principal = ultimosEmpatados.length > 1 ?
            ultimosEmpatados[Math.floor(Math.random() * ultimosEmpatados.length)] :
            ultimosEmpatados[0];
    }

    // -----------------------------
    // SECUNDARIA
    // -----------------------------
    let secundaria = null;
    const diferencia = principal[1].total - ordenadas[1][1].total;

    if (diferencia <= 1) {
        let candidatosSec = ordenadas.filter(item =>
            item[0] !== principal[0] &&
            (principal[1].total - item[1].total) <= 1
        );

        if (candidatosSec.length > 1) {
            candidatosSec.sort(desempate);
            const maxValorSec = candidatosSec[0][1];
            const ultimosEmpatadosSec = candidatosSec.filter(item =>
                item[1].total === maxValorSec.total &&
                item[1].maxCount === maxValorSec.maxCount &&
                item[1].secondMaxCount === maxValorSec.secondMaxCount &&
                item[1].highScoreCount === maxValorSec.highScoreCount
            );
            secundaria = ultimosEmpatadosSec.length > 1 ?
                ultimosEmpatadosSec[Math.floor(Math.random() * ultimosEmpatadosSec.length)] :
                ultimosEmpatadosSec[0];
        } else if (candidatosSec.length === 1) {
            secundaria = candidatosSec[0];
        }
    }

    // -----------------------------
    // LATENTES
    // -----------------------------
    let latentesDespertables = [];
    let latentesBloqueadas = [];
    const aurasActivas = [principal, secundaria].filter(Boolean).length;

    for (let i = 0; i < ordenadas.length; i++) {
        const nombre = ordenadas[i][0];
        const puntuacion = ordenadas[i][1].total;
        const esPrincipal = nombre === principal[0];
        const esSecundaria = secundaria && nombre === secundaria[0];

        if (!esPrincipal && !esSecundaria && puntuacion >= 18.5) {
            if (aurasActivas < 2) {
                latentesDespertables.push(nombre);
            } else {
                latentesBloqueadas.push(nombre);
            }
        }
    }

    return {
        principal: principal[0],
        puntuacionPrincipal: principal[1].total,
        secundaria: secundaria ? secundaria[0] : null,
        puntuacionSecundaria: secundaria ? secundaria[1].total : null,
        latentesDespertables: latentesDespertables,
        latentesBloqueadas: latentesBloqueadas,
        rankingCompleto: ordenadas.map(x => ({ nombre: x[0], total: x[1].total }))
    };
}

/* ================================
   FUNCIONES AUXILIARES
================================ */
function obtenerPorcentajes() {
    const total = Object.values(afinidades).reduce((acc, val) => acc + val.total, 0);
    let porcentajes = {};
    for (let clave in afinidades) {
        porcentajes[clave] = ((afinidades[clave].total / total) * 100).toFixed(2);
    }
    return porcentajes;
}

function resetearAfinidades() {
    for (let clave in afinidades) {
        afinidades[clave] = { total: 0, maxCount: 0, secondMaxCount: 0, highScoreCount: 0 };
    }
}