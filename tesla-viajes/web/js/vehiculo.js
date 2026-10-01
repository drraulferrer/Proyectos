// Parámetros del Tesla Model Y RWD con batería LFP de 60 kWh nominales y su
// curva de carga en corriente continua. Todos los valores se pueden ajustar
// desde «Ajustes»; estos son el punto de partida.

export const MODEL_Y_RWD_LFP = {
  nombre: 'Tesla Model Y RWD (LFP, 60 kWh)',
  bateriaNominalKwh: 60,
  // Energía utilizable entre el 0 % y el 100 % que muestra el coche. El resto
  // es reserva de protección de la batería.
  capacidadUtilKwh: 57.5,
  masaKg: 1930,
  cargaKg: 100, // conductor y equipaje
  cda: 0.60, // Cd 0,23 × área frontal ≈ 2,6 m²
  crr: 0.0085,
  eficienciaTraccion: 0.90, // batería → rueda
  eficienciaRegeneracion: 0.65, // rueda → batería al frenar o bajar
  auxiliaresKw: 0.30, // ordenadores, pantallas, bombas
  maxAcKw: 11, // cargador de a bordo trifásico 16 A
  maxAcMonofasicoKw: 7.4,
  tensionCargaV: 370, // tensión típica del paquete LFP durante la carga
};

// Potencia máxima que acepta la batería según el % de carga (kW). Aproximación a
// las curvas publicadas para el paquete CATL LFP: pico ~170 kW por debajo del
// 15 % y unos 30 minutos del 10 % al 80 % en un Supercharger V3.
export const CURVA_CARGA_DC = [
  [0, 110], [2, 150], [4, 170], [10, 165], [15, 152], [20, 140], [25, 128],
  [30, 117], [35, 107], [40, 98], [45, 90], [50, 83], [55, 76], [60, 69],
  [65, 61], [70, 53], [75, 46], [80, 39], [85, 32], [90, 24], [95, 15], [100, 6],
];

export function potenciaCurva(soc, curva = CURVA_CARGA_DC) {
  if (soc <= curva[0][0]) return curva[0][1];
  for (let k = 1; k < curva.length; k++) {
    const [s1, p1] = curva[k];
    if (soc <= s1) {
      const [s0, p0] = curva[k - 1];
      return p0 + ((p1 - p0) * (soc - s0)) / (s1 - s0);
    }
  }
  return curva[curva.length - 1][1];
}

// Potencia que llegará al coche en un punto de carga: la menor entre lo que
// declara el punto, lo que permite su intensidad máxima a la tensión del
// paquete LFP (~370 V) y lo que acepta la batería en ese momento.
export function potenciaEfectivaPunto({ kw, voltios = 0, amperios = 0, modo = 'DC' }, veh = MODEL_Y_RWD_LFP) {
  if (!kw || kw <= 0) return 0;
  if (modo === 'AC3') return Math.min(kw, veh.maxAcKw);
  if (modo === 'AC1') return Math.min(kw, veh.maxAcMonofasicoKw);
  let limite = kw;
  // Algunos operadores declaran 0 A o valores absurdos: solo se usa la
  // intensidad si es verosímil para un cargador rápido.
  if (amperios >= 60 && voltios >= 200) limite = Math.min(limite, (amperios * veh.tensionCargaV) / 1000);
  return limite;
}

// Minutos para cargar de socInicial a socFinal (%), integrando la curva en
// pasos de 0,5 % y limitando por la potencia del punto de carga.
export function minutosCarga(socInicial, socFinal, potenciaPuntoKw, { veh = MODEL_Y_RWD_LFP, esAc = false } = {}) {
  if (socFinal <= socInicial || potenciaPuntoKw <= 0) return 0;
  const kwhPorPaso = veh.capacidadUtilKwh * 0.005;
  let horas = 0;
  for (let s = socInicial; s < socFinal; s += 0.5) {
    const paso = Math.min(0.5, socFinal - s);
    const pBateria = esAc ? veh.maxAcKw : potenciaCurva(s + paso / 2);
    const p = Math.max(1, Math.min(pBateria, potenciaPuntoKw));
    horas += (kwhPorPaso * (paso / 0.5)) / p;
  }
  return horas * 60;
}

// % de carga alcanzable en `minutos` desde socInicial (inversa de minutosCarga).
export function socTrasMinutos(socInicial, minutos, potenciaPuntoKw, opciones = {}) {
  let s = socInicial;
  let restante = minutos;
  while (s < 100 && restante > 0) {
    const t = minutosCarga(s, Math.min(100, s + 0.5), potenciaPuntoKw, opciones);
    if (t > restante) return s + (0.5 * restante) / t;
    restante -= t;
    s += 0.5;
  }
  return Math.min(100, s);
}
