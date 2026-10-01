// Utilidades geográficas sin dependencias: distancias, rumbos, polilíneas y
// proyección de puntos sobre una ruta.

const RADIO_TIERRA_M = 6371008.8;
const RAD = Math.PI / 180;

export function distanciaM(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * RAD;
  const dLon = (lon2 - lon1) * RAD;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * RADIO_TIERRA_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

// Rumbo inicial en grados (0 = norte, 90 = este).
export function rumbo(lat1, lon1, lat2, lon2) {
  const y = Math.sin((lon2 - lon1) * RAD) * Math.cos(lat2 * RAD);
  const x = Math.cos(lat1 * RAD) * Math.sin(lat2 * RAD) -
    Math.sin(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.cos((lon2 - lon1) * RAD);
  return (Math.atan2(y, x) / RAD + 360) % 360;
}

// Decodifica una polilínea codificada (Google/OSRM). OSRM usa precisión 6 con
// geometries=polyline6.
export function decodificarPolilinea(cadena, precision = 6) {
  const factor = 10 ** precision;
  const puntos = [];
  let i = 0, lat = 0, lon = 0;
  while (i < cadena.length) {
    for (const eje of [0, 1]) {
      let resultado = 0, desplazamiento = 0, byte;
      do {
        byte = cadena.charCodeAt(i++) - 63;
        resultado |= (byte & 0x1f) << desplazamiento;
        desplazamiento += 5;
      } while (byte >= 0x20);
      const delta = resultado & 1 ? ~(resultado >> 1) : resultado >> 1;
      if (eje === 0) lat += delta; else lon += delta;
    }
    puntos.push([lat / factor, lon / factor]);
  }
  return puntos;
}

// Distancia acumulada (m) en cada vértice de una lista [[lat, lon], …].
export function acumulada(puntos) {
  const d = new Float64Array(puntos.length);
  for (let k = 1; k < puntos.length; k++) {
    d[k] = d[k - 1] + distanciaM(puntos[k - 1][0], puntos[k - 1][1], puntos[k][0], puntos[k][1]);
  }
  return d;
}

// Índice del último elemento de un array ordenado que es <= x (búsqueda binaria).
export function indiceAnterior(ordenado, x) {
  let lo = 0, hi = ordenado.length - 1;
  if (x <= ordenado[0]) return 0;
  if (x >= ordenado[hi]) return hi;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (ordenado[mid] <= x) lo = mid; else hi = mid;
  }
  return lo;
}

// Punto a la distancia d (m) a lo largo de la polilínea.
export function puntoEnDistancia(puntos, acum, d) {
  const k = indiceAnterior(acum, d);
  if (k >= puntos.length - 1) return puntos[puntos.length - 1];
  const tramo = acum[k + 1] - acum[k];
  const t = tramo > 0 ? (d - acum[k]) / tramo : 0;
  return [
    puntos[k][0] + (puntos[k + 1][0] - puntos[k][0]) * t,
    puntos[k][1] + (puntos[k + 1][1] - puntos[k][1]) * t,
  ];
}

// Muestras equiespaciadas cada `paso` metros, incluidos el inicio y el final.
export function remuestrear(puntos, acum, paso) {
  const total = acum[acum.length - 1];
  const n = Math.max(1, Math.ceil(total / paso));
  const muestras = [];
  for (let k = 0; k <= n; k++) {
    const d = Math.min(total, k * paso);
    const [lat, lon] = puntoEnDistancia(puntos, acum, d);
    muestras.push({ d, lat, lon });
  }
  return muestras;
}

// Índice espacial de rejilla sobre los vértices de la ruta para localizar en
// milisegundos qué estaciones quedan cerca.
export class IndiceRuta {
  constructor(puntos, acum, { celdaGrados = 0.02, pasoM = 200 } = {}) {
    this.celda = celdaGrados;
    this.vertices = [];
    let ultimo = -Infinity;
    for (let k = 0; k < puntos.length; k++) {
      if (acum[k] - ultimo >= pasoM || k === puntos.length - 1) {
        this.vertices.push({ lat: puntos[k][0], lon: puntos[k][1], d: acum[k] });
        ultimo = acum[k];
      }
    }
    this.rejilla = new Map();
    this.vertices.forEach((v, i) => {
      const clave = this.clave(v.lat, v.lon);
      if (!this.rejilla.has(clave)) this.rejilla.set(clave, []);
      this.rejilla.get(clave).push(i);
    });
  }

  clave(lat, lon) {
    return `${Math.floor(lat / this.celda)}:${Math.floor(lon / this.celda)}`;
  }

  // Vértice de ruta más cercano a (lat, lon) dentro de radioM, o null.
  masCercano(lat, lon, radioM) {
    const celdasLat = Math.ceil(radioM / 111000 / this.celda);
    const celdasLon = Math.ceil(radioM / (111000 * Math.max(0.2, Math.cos(lat * RAD))) / this.celda);
    const ci = Math.floor(lat / this.celda), cj = Math.floor(lon / this.celda);
    let mejor = null;
    for (let i = ci - celdasLat; i <= ci + celdasLat; i++) {
      for (let j = cj - celdasLon; j <= cj + celdasLon; j++) {
        const lista = this.rejilla.get(`${i}:${j}`);
        if (!lista) continue;
        for (const idx of lista) {
          const v = this.vertices[idx];
          const dist = distanciaM(lat, lon, v.lat, v.lon);
          if (dist <= radioM && (!mejor || dist < mejor.distancia)) mejor = { distancia: dist, d: v.d, indice: idx };
        }
      }
    }
    return mejor;
  }
}
