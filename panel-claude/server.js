#!/usr/bin/env node
/*
 * Panel de Claude Code — servidor local sin dependencias.
 *
 * Lee los datos que Claude Code guarda en ~/.claude (sesiones, habilidades,
 * automatizaciones) y los sirve en una interfaz web pensada para que la use
 * cualquier persona del equipo, sin tocar la terminal.
 *
 * Solo escucha en 127.0.0.1: nada sale de este equipo.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const readline = require('readline');
const { spawn, execFile } = require('child_process');

const PUERTO_BASE = parseInt(process.env.PUERTO || process.env.PORT || '4747', 10);
const DIR_CLAUDE = process.env.CLAUDE_DIR || path.join(os.homedir(), '.claude');
const DIR_PUBLICO = path.join(__dirname, 'public');
const RUTA_BOTONES = path.join(__dirname, 'botones.json');
const RAIZ_REPO = path.resolve(__dirname, '..');
const ES_WINDOWS = process.platform === 'win32';
// Los archivos de sesión más grandes que esto se indexan de forma parcial.
const LIMITE_ANALISIS = 25 * 1024 * 1024;
const HERR_EDICION = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

function fechaLocal(ms) {
  const d = new Date(ms);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function compactar(texto, max) {
  const limpio = String(texto).replace(/\s+/g, ' ').trim();
  return limpio.length > max ? limpio.slice(0, max - 1) + '…' : limpio;
}

function textoDe(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.filter((b) => b && b.type === 'text' && b.text).map((b) => b.text).join('\n\n');
  }
  return '';
}

function tieneToolResult(content) {
  return Array.isArray(content) && content.some((b) => b && b.type === 'tool_result');
}

const RE_META = /^\s*(\[Request interrupted|<command-name|<local-command|<system|<task-notification|<github-webhook|Caveat:)/;

function esPromptReal(linea, texto) {
  if (linea.isMeta) return false;
  if (!texto || !texto.trim()) return false;
  if (tieneToolResult(linea.message && linea.message.content)) return false;
  return !RE_META.test(texto);
}

function describirHerramienta(nombre, input) {
  input = input || {};
  const base = (r) => (r ? path.basename(String(r)) : '');
  switch (nombre) {
    case 'Read': return 'Lee ' + (base(input.file_path) || 'un archivo');
    case 'Edit': case 'MultiEdit': case 'NotebookEdit': return 'Edita ' + (base(input.file_path) || 'un archivo');
    case 'Write': return 'Escribe ' + (base(input.file_path) || 'un archivo');
    case 'Bash': return input.description || (input.command ? 'Ejecuta: ' + compactar(String(input.command).split('\n')[0], 70) : 'Ejecuta un comando');
    case 'Grep': return 'Busca «' + compactar(input.pattern || '', 40) + '»';
    case 'Glob': return 'Busca archivos ' + compactar(input.pattern || '', 40);
    case 'WebFetch': try { return 'Consulta ' + new URL(input.url).hostname; } catch (e) { return 'Consulta una web'; }
    case 'WebSearch': return 'Busca en la web «' + compactar(input.query || '', 50) + '»';
    case 'Task': case 'Agent': return 'Lanza un agente' + (input.description ? ': ' + compactar(input.description, 60) : '');
    case 'Skill': return 'Usa la habilidad ' + (input.skill || input.command || '');
    case 'TodoWrite': case 'TaskCreate': case 'TaskUpdate': return 'Organiza la lista de tareas';
    case 'AskUserQuestion': return 'Hace una pregunta';
    case 'EnterPlanMode': case 'ExitPlanMode': return 'Trabaja en el plan';
    default:
      if (nombre && nombre.startsWith('mcp__')) {
        const partes = nombre.split('__');
        return 'Usa ' + (partes[2] ? partes[2].replace(/[-_]/g, ' ') : partes[1] || nombre) + (partes[2] ? ' (' + partes[1] + ')' : '');
      }
      return nombre || 'Usa una herramienta';
  }
}

function leerJsonSeguro(ruta, porDefecto) {
  try { return JSON.parse(fs.readFileSync(ruta, 'utf8')); } catch (e) { return porDefecto; }
}

/* ------------------------------------------------------------------ */
/* Índice de sesiones (con caché por mtime+tamaño)                     */
/* ------------------------------------------------------------------ */

const cacheSesiones = new Map(); // ruta → {mtimeMs, size, datos}

function decodificarCwd(nombreDir) {
  // Solo como último recurso: '-home-user-Proyectos' → '/home/user/Proyectos'
  if (nombreDir.startsWith('-')) return '/' + nombreDir.slice(1).replace(/-/g, '/');
  return nombreDir;
}

function analizarSesion(ruta, nombreDir) {
  let st;
  try { st = fs.statSync(ruta); } catch (e) { return null; }
  const clave = cacheSesiones.get(ruta);
  if (clave && clave.mtimeMs === st.mtimeMs && clave.size === st.size) return clave.datos;

  let contenido = '';
  let parcial = false;
  try {
    if (st.size <= LIMITE_ANALISIS) {
      contenido = fs.readFileSync(ruta, 'utf8');
    } else {
      // Archivo enorme: cabeza + cola, y descartamos la línea rota del corte.
      parcial = true;
      const fd = fs.openSync(ruta, 'r');
      const cab = Buffer.alloc(4 * 1024 * 1024);
      const cola = Buffer.alloc(512 * 1024);
      fs.readSync(fd, cab, 0, cab.length, 0);
      fs.readSync(fd, cola, 0, cola.length, st.size - cola.length);
      fs.closeSync(fd);
      const colaTxt = cola.toString('utf8');
      contenido = cab.toString('utf8').split('\n').slice(0, -1).join('\n') + '\n' + colaTxt.slice(colaTxt.indexOf('\n') + 1);
    }
  } catch (e) { return null; }

  const datos = {
    id: path.basename(ruta, '.jsonl'),
    archivo: ruta,
    cwd: null, proyecto: null, rama: null, version: null, modelo: null,
    inicio: null, fin: null,
    titulo: null, resumen: null,
    prompts: 0, respuestas: 0, herramientas: 0, comandos: 0, agentes: 0,
    porHerramienta: {},
    archivos: [],
    tokens: { entrada: 0, salida: 0 },
    marcas: [], marcasPrompts: [], dias: [],
    parcial,
  };

  const archivosSet = new Set();
  const idsRespuesta = new Set();
  const idsBloque = new Set();
  const usoPorMensaje = new Map();

  for (const cruda of contenido.split('\n')) {
    if (!cruda) continue;
    let l;
    try { l = JSON.parse(cruda); } catch (e) { continue; }
    if (l.type === 'summary' && l.summary) { datos.resumen = compactar(l.summary, 200); continue; }
    if (l.type !== 'user' && l.type !== 'assistant') continue;

    const ts = Date.parse(l.timestamp || '');
    if (ts) datos.marcas.push(ts);
    if (!datos.cwd && l.cwd) datos.cwd = l.cwd;
    if (!datos.rama && l.gitBranch) datos.rama = l.gitBranch;
    if (!datos.version && l.version) datos.version = l.version;
    if (l.isSidechain) continue; // trabajo de subagentes: cuenta para tiempo, no para mensajes

    const m = l.message;
    if (!m || typeof m !== 'object') continue;

    if (l.type === 'user') {
      const texto = textoDe(m.content);
      if (esPromptReal(l, texto)) {
        datos.prompts++;
        if (ts) datos.marcasPrompts.push(ts);
        if (!datos.titulo) datos.titulo = compactar(texto, 160);
      }
    } else {
      if (m.model && m.model !== '<synthetic>') datos.modelo = m.model;
      if (m.id && m.usage && !usoPorMensaje.has(m.id)) usoPorMensaje.set(m.id, m.usage);
      const bloques = Array.isArray(m.content) ? m.content : [];
      for (let i = 0; i < bloques.length; i++) {
        const b = bloques[i];
        if (!b) continue;
        if (b.type === 'text' && b.text && m.id) idsRespuesta.add(m.id);
        if (b.type === 'tool_use') {
          const bid = b.id || m.id + ':' + i;
          if (idsBloque.has(bid)) continue;
          idsBloque.add(bid);
          datos.herramientas++;
          datos.porHerramienta[b.name] = (datos.porHerramienta[b.name] || 0) + 1;
          if (b.name === 'Bash') datos.comandos++;
          if (b.name === 'Task' || b.name === 'Agent') datos.agentes++;
          if (HERR_EDICION.has(b.name) && b.input && b.input.file_path) archivosSet.add(String(b.input.file_path));
        }
      }
    }
  }

  datos.respuestas = idsRespuesta.size;
  for (const uso of usoPorMensaje.values()) {
    datos.tokens.entrada += (uso.input_tokens || 0) + (uso.cache_creation_input_tokens || 0) + (uso.cache_read_input_tokens || 0);
    datos.tokens.salida += uso.output_tokens || 0;
  }
  datos.archivos = [...archivosSet].slice(0, 100);
  datos.marcas.sort((a, b) => a - b);
  datos.marcasPrompts.sort((a, b) => a - b);
  if (datos.marcas.length) {
    datos.inicio = datos.marcas[0];
    datos.fin = datos.marcas[datos.marcas.length - 1];
    datos.dias = [...new Set(datos.marcas.map(fechaLocal))];
  }
  if (!datos.cwd) datos.cwd = decodificarCwd(nombreDir || '');
  datos.proyecto = path.basename(datos.cwd || '') || datos.cwd || 'desconocido';

  cacheSesiones.set(ruta, { mtimeMs: st.mtimeMs, size: st.size, datos });
  return datos;
}

function listarSesiones() {
  const dirProyectos = path.join(DIR_CLAUDE, 'projects');
  const sesiones = [];
  let dirs = [];
  try { dirs = fs.readdirSync(dirProyectos, { withFileTypes: true }); } catch (e) { return sesiones; }
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    const dirSesion = path.join(dirProyectos, d.name);
    let archivos = [];
    try { archivos = fs.readdirSync(dirSesion); } catch (e) { continue; }
    for (const a of archivos) {
      if (!a.endsWith('.jsonl')) continue;
      const datos = analizarSesion(path.join(dirSesion, a), d.name);
      // Se ocultan los transcritos vacíos o de subagentes (sin conversación propia).
      if (datos && (datos.prompts > 0 || datos.respuestas > 0)) sesiones.push(datos);
    }
  }
  sesiones.sort((a, b) => (b.fin || 0) - (a.fin || 0));
  return sesiones;
}

function sesionParaApi(s) {
  return {
    id: s.id, titulo: s.titulo || s.resumen || 'Sesión sin título', resumen: s.resumen,
    proyecto: s.proyecto, cwd: s.cwd, rama: s.rama, modelo: s.modelo,
    inicio: s.inicio, fin: s.fin,
    prompts: s.prompts, respuestas: s.respuestas, herramientas: s.herramientas,
    comandos: s.comandos, agentes: s.agentes, archivos: s.archivos.length,
    tokens: s.tokens, parcial: s.parcial,
  };
}

/* ------------------------------------------------------------------ */
/* Informe diario                                                      */
/* ------------------------------------------------------------------ */

function totalesDia(fecha, sesiones) {
  const ini = new Date(+fecha.slice(0, 4), +fecha.slice(5, 7) - 1, +fecha.slice(8, 10)).getTime();
  const fin = ini + 86400000;
  const delDia = sesiones.filter((s) => s.marcas.some((t) => t >= ini && t < fin));
  return { ini, fin, delDia };
}

function resumenDia(fecha) {
  const sesiones = listarSesiones();
  const { ini, fin, delDia } = totalesDia(fecha, sesiones);

  const totales = {
    sesiones: delDia.length, proyectos: new Set(delDia.map((s) => s.cwd)).size,
    prompts: 0, respuestas: 0, herramientas: 0, comandos: 0, archivos: 0,
    tokensEntrada: 0, tokensSalida: 0, tiempoActivoSeg: 0,
  };
  const porHerramienta = {};
  const archivosSet = new Set();
  const porHora = new Array(24).fill(0);
  const marcasDia = [];

  for (const s of delDia) {
    totales.prompts += s.marcasPrompts.filter((t) => t >= ini && t < fin).length;
    totales.respuestas += s.respuestas;
    totales.herramientas += s.herramientas;
    totales.comandos += s.comandos;
    totales.tokensEntrada += s.tokens.entrada;
    totales.tokensSalida += s.tokens.salida;
    for (const [n, c] of Object.entries(s.porHerramienta)) porHerramienta[n] = (porHerramienta[n] || 0) + c;
    for (const a of s.archivos) archivosSet.add(a);
    for (const t of s.marcas) {
      if (t >= ini && t < fin) {
        porHora[new Date(t).getHours()]++;
        marcasDia.push(t);
      }
    }
  }
  totales.archivos = archivosSet.size;

  marcasDia.sort((a, b) => a - b);
  let activoMs = 0;
  for (let i = 1; i < marcasDia.length; i++) activoMs += Math.min(marcasDia[i] - marcasDia[i - 1], 5 * 60 * 1000);
  if (marcasDia.length && activoMs < 60000) activoMs = 60000;
  totales.tiempoActivoSeg = Math.round(activoMs / 1000);

  const topHerramientas = Object.entries(porHerramienta).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const dias = [...new Set(sesiones.flatMap((s) => s.dias))].sort();

  const ayerStr = fechaLocal(ini - 86400000);
  const ayerCalc = totalesDia(ayerStr, sesiones);
  const ayer = {
    sesiones: ayerCalc.delDia.length,
    prompts: ayerCalc.delDia.reduce((acc, s) => acc + s.marcasPrompts.filter((t) => t >= ayerCalc.ini && t < ayerCalc.fin).length, 0),
    herramientas: ayerCalc.delDia.reduce((acc, s) => acc + s.herramientas, 0),
  };

  return {
    fecha, totales, topHerramientas, porHora, dias, ayer,
    archivos: [...archivosSet].slice(0, 12),
    sesiones: delDia
      .slice()
      .sort((a, b) => (a.inicio || 0) - (b.inicio || 0))
      .map(sesionParaApi),
  };
}

/* ------------------------------------------------------------------ */
/* Detalle de una sesión (conversación)                                */
/* ------------------------------------------------------------------ */

function detalleSesion(id) {
  const sesiones = listarSesiones();
  const s = sesiones.find((x) => x.id === id);
  if (!s) return null;

  let contenido;
  try {
    const st = fs.statSync(s.archivo);
    if (st.size > LIMITE_ANALISIS) {
      const fd = fs.openSync(s.archivo, 'r');
      const buf = Buffer.alloc(LIMITE_ANALISIS);
      fs.readSync(fd, buf, 0, buf.length, st.size - buf.length);
      fs.closeSync(fd);
      const txt = buf.toString('utf8');
      contenido = txt.slice(txt.indexOf('\n') + 1);
    } else {
      contenido = fs.readFileSync(s.archivo, 'utf8');
    }
  } catch (e) { return null; }

  const conversacion = [];
  let ultimo = null; // agrupa las líneas assistant que comparten message.id
  let agentes = 0;

  for (const cruda of contenido.split('\n')) {
    if (!cruda) continue;
    let l;
    try { l = JSON.parse(cruda); } catch (e) { continue; }
    if (l.type !== 'user' && l.type !== 'assistant') continue;
    if (l.isSidechain) { agentes++; continue; }
    const m = l.message;
    if (!m || typeof m !== 'object') continue;
    const ts = Date.parse(l.timestamp || '') || null;

    if (l.type === 'user') {
      const texto = textoDe(m.content);
      if (!esPromptReal(l, texto)) continue;
      conversacion.push({ rol: 'tu', hora: ts, texto: compactar2(texto, 30000) });
      ultimo = null;
    } else {
      const id2 = m.id || 'sin-id';
      if (!ultimo || ultimo.id !== id2) {
        ultimo = { id: id2, item: { rol: 'claude', hora: ts, texto: '', herramientas: [] } };
        conversacion.push(ultimo.item);
      }
      const bloques = Array.isArray(m.content) ? m.content : [];
      for (const b of bloques) {
        if (!b) continue;
        if (b.type === 'text' && b.text) {
          ultimo.item.texto += (ultimo.item.texto ? '\n\n' : '') + b.text;
          if (ultimo.item.texto.length > 30000) ultimo.item.texto = ultimo.item.texto.slice(0, 30000) + '\n\n_(mensaje recortado)_';
        }
        if (b.type === 'tool_use') ultimo.item.herramientas.push({ nombre: b.name, detalle: describirHerramienta(b.name, b.input) });
      }
    }
  }

  // Se descartan los turnos de Claude que quedaron vacíos (solo razonamiento interno).
  const util = conversacion.filter((c) => c.rol === 'tu' || c.texto || c.herramientas.length);
  let omitidos = 0;
  let final = util;
  if (util.length > 400) {
    omitidos = util.length - 400;
    final = util.slice(0, 100).concat([{ rol: 'corte', omitidos }], util.slice(-300));
  }
  return { info: Object.assign(sesionParaApi(s), { version: s.version, listaArchivos: s.archivos.slice(0, 30) }), conversacion: final, agentes, omitidos };
}

function compactar2(texto, max) {
  const t = String(texto).trim();
  return t.length > max ? t.slice(0, max) + '\n\n_(mensaje recortado)_' : t;
}

/* ------------------------------------------------------------------ */
/* Catálogo: habilidades, automatizaciones y botones del equipo        */
/* ------------------------------------------------------------------ */

function leerFrontmatter(texto) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(texto);
  const datos = {};
  if (!m) return datos;
  let clave = null;
  for (const linea of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(linea);
    if (kv) {
      clave = kv[1].toLowerCase();
      let v = kv[2].trim();
      if (/^[>|][-+]?$/.test(v)) v = '';
      datos[clave] = v.replace(/^["']|["']$/g, '');
    } else if (clave && /^\s+\S/.test(linea)) {
      datos[clave] = (datos[clave] ? datos[clave] + ' ' : '') + linea.trim();
    }
  }
  return datos;
}

function idCatalogo(tipo, ruta) {
  return crypto.createHash('sha1').update(tipo + '|' + ruta).digest('hex').slice(0, 12);
}

function leerSkillsDe(dirSkills, origen, proyecto) {
  const items = [];
  let entradas = [];
  try { entradas = fs.readdirSync(dirSkills, { withFileTypes: true }); } catch (e) { return items; }
  for (const e of entradas) {
    if (!e.isDirectory()) continue;
    const rutaMd = path.join(dirSkills, e.name, 'SKILL.md');
    if (!fs.existsSync(rutaMd)) continue;
    let fm = {};
    try { fm = leerFrontmatter(fs.readFileSync(rutaMd, 'utf8')); } catch (err) { /* sin metadatos */ }
    items.push({
      id: idCatalogo('habilidad', rutaMd),
      tipo: 'habilidad',
      nombre: fm.name || e.name,
      descripcion: compactar(fm.description || 'Habilidad instalada en ' + (origen === 'personal' ? 'tu cuenta' : 'este proyecto') + '.', 260),
      invocacion: '/' + e.name,
      origen, proyecto: proyecto || null,
    });
  }
  return items;
}

function leerComandosDe(dirComandos, origen, proyecto) {
  const items = [];
  function pasear(dir, prefijo, nivel) {
    if (nivel > 3) return;
    let entradas = [];
    try { entradas = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const e of entradas) {
      const ruta = path.join(dir, e.name);
      if (e.isDirectory()) { pasear(ruta, prefijo ? prefijo + ':' + e.name : e.name, nivel + 1); continue; }
      if (!e.name.endsWith('.md')) continue;
      const nombre = (prefijo ? prefijo + ':' : '') + e.name.replace(/\.md$/, '');
      let fm = {};
      try { fm = leerFrontmatter(fs.readFileSync(ruta, 'utf8')); } catch (err) { /* sin metadatos */ }
      items.push({
        id: idCatalogo('automatizacion', ruta),
        tipo: 'automatizacion',
        nombre,
        descripcion: compactar(fm.description || 'Automatización guardada como /' + nombre + '.', 260),
        invocacion: '/' + nombre,
        argumentos: fm['argument-hint'] || '',
        origen, proyecto: proyecto || null,
      });
    }
  }
  pasear(dirComandos, '', 0);
  return items;
}

function proyectosConocidos() {
  const vistos = new Map();
  for (const s of listarSesiones()) {
    if (s.cwd && !vistos.has(s.cwd)) {
      let existe = false;
      try { existe = fs.statSync(s.cwd).isDirectory(); } catch (e) { /* ya no existe */ }
      vistos.set(s.cwd, { ruta: s.cwd, nombre: path.basename(s.cwd) || s.cwd, existe, sesiones: 0 });
    }
    if (vistos.has(s.cwd)) vistos.get(s.cwd).sesiones++;
  }
  if (!vistos.has(RAIZ_REPO)) vistos.set(RAIZ_REPO, { ruta: RAIZ_REPO, nombre: path.basename(RAIZ_REPO), existe: true, sesiones: 0 });
  const inicio = os.homedir();
  if (!vistos.has(inicio)) vistos.set(inicio, { ruta: inicio, nombre: 'Carpeta personal', existe: true, sesiones: 0 });
  return [...vistos.values()].filter((p) => p.existe).sort((a, b) => b.sesiones - a.sesiones);
}

function catalogo() {
  const items = [];
  for (const b of leerBotones()) items.push(b);
  items.push(...leerComandosDe(path.join(DIR_CLAUDE, 'commands'), 'personal', null));
  items.push(...leerSkillsDe(path.join(DIR_CLAUDE, 'skills'), 'personal', null));
  for (const p of proyectosConocidos()) {
    if (p.ruta === os.homedir()) continue;
    items.push(...leerComandosDe(path.join(p.ruta, '.claude', 'commands'), 'proyecto', p.ruta));
    items.push(...leerSkillsDe(path.join(p.ruta, '.claude', 'skills'), 'proyecto', p.ruta));
  }
  return items;
}

function leerBotones() {
  const crudos = leerJsonSeguro(RUTA_BOTONES, []);
  if (!Array.isArray(crudos)) return [];
  return crudos
    .filter((b) => b && b.nombre && b.prompt)
    .map((b, i) => ({
      id: idCatalogo('boton', i + '|' + b.nombre),
      tipo: 'boton',
      nombre: String(b.nombre),
      emoji: b.emoji || '🚀',
      descripcion: compactar(String(b.descripcion || b.prompt), 260),
      prompt: String(b.prompt),
      automatico: !!b.automatico,
      origen: 'equipo',
      proyecto: b.proyecto || null,
    }));
}

/* ------------------------------------------------------------------ */
/* Ejecuciones: lanzar `claude -p` y retransmitir su progreso          */
/* ------------------------------------------------------------------ */

const ejecuciones = new Map();
let estadoCliCache = null;

function comprobarCli(forzar) {
  return new Promise((resolver) => {
    if (!forzar && estadoCliCache && Date.now() - estadoCliCache.momento < 5 * 60 * 1000) return resolver(estadoCliCache);
    execFile('claude', ['--version'], { shell: ES_WINDOWS, timeout: 15000 }, (err, stdout) => {
      estadoCliCache = {
        momento: Date.now(),
        disponible: !err,
        version: err ? null : String(stdout).trim().split('\n')[0],
      };
      resolver(estadoCliCache);
    });
  });
}

function entornoHijo() {
  const env = Object.assign({}, process.env);
  // Si el panel se arrancó desde una sesión de Claude, el hijo no debe heredarla.
  delete env.CLAUDECODE;
  delete env.CLAUDE_CODE_SESSION_ID;
  delete env.CLAUDE_CODE_ENTRYPOINT;
  return env;
}

function emitir(ej, evento) {
  evento.hora = Date.now();
  ej.eventos.push(evento);
  if (ej.eventos.length > 2000) ej.eventos.splice(0, ej.eventos.length - 2000);
  const carga = 'data: ' + JSON.stringify(evento) + '\n\n';
  for (const cliente of ej.clientes) {
    try { cliente.write(carga); } catch (e) { /* cliente desconectado */ }
  }
}

function nuevaEjecucion({ titulo, prompt, cwd, automatico }) {
  const id = crypto.randomUUID();
  const ej = {
    id, titulo, cwd, prompt,
    estado: 'ejecutando', inicio: Date.now(),
    eventos: [], clientes: new Set(), proc: null,
  };
  ejecuciones.set(id, ej);
  // Se conservan solo las últimas 30 ejecuciones terminadas.
  const terminadas = [...ejecuciones.values()].filter((e) => e.estado !== 'ejecutando');
  while (terminadas.length > 30) ejecuciones.delete(terminadas.shift().id);

  const args = ['-p', '--output-format', 'stream-json', '--verbose'];
  if (automatico) args.push('--dangerously-skip-permissions');

  let proc;
  try {
    proc = spawn('claude', args, { cwd, env: entornoHijo(), shell: ES_WINDOWS, stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (e) {
    ej.estado = 'error';
    emitir(ej, { t: 'error', texto: 'No se pudo arrancar Claude: ' + e.message });
    return ej;
  }
  ej.proc = proc;
  proc.stdin.write(prompt);
  proc.stdin.end();

  const temporizador = setTimeout(() => {
    if (ej.estado === 'ejecutando') {
      emitir(ej, { t: 'aviso', texto: 'La ejecución superó los 30 minutos y se detuvo automáticamente.' });
      try { proc.kill(); } catch (e) { /* ya terminó */ }
    }
  }, 30 * 60 * 1000);

  emitir(ej, { t: 'lanzado', texto: 'Claude se está poniendo en marcha…', carpeta: cwd });

  const bloquesVistos = new Set();
  let huboFin = false;
  let colaErrores = '';

  const rl = readline.createInterface({ input: proc.stdout });
  rl.on('line', (linea) => {
    if (!linea.trim()) return;
    let ev;
    try { ev = JSON.parse(linea); } catch (e) { return; }

    if (ev.type === 'system' && ev.subtype === 'init') {
      emitir(ej, { t: 'inicio', modelo: ev.model || '', carpeta: ev.cwd || cwd });
      return;
    }
    if (ev.type === 'assistant' && ev.message) {
      const idMsg = ev.message.id || 'm';
      const bloques = Array.isArray(ev.message.content) ? ev.message.content : [];
      for (const b of bloques) {
        if (!b) continue;
        if (b.type === 'text' && b.text) {
          const firma = idMsg + ':t:' + crypto.createHash('md5').update(b.text).digest('hex').slice(0, 10);
          if (bloquesVistos.has(firma)) continue;
          bloquesVistos.add(firma);
          emitir(ej, { t: 'texto', texto: b.text.length > 50000 ? b.text.slice(0, 50000) + '…' : b.text });
        } else if (b.type === 'tool_use') {
          const firma = b.id || idMsg + ':u:' + bloquesVistos.size;
          if (bloquesVistos.has(firma)) continue;
          bloquesVistos.add(firma);
          emitir(ej, { t: 'herramienta', nombre: b.name, detalle: describirHerramienta(b.name, b.input) });
        }
      }
      return;
    }
    if (ev.type === 'user' && ev.message && Array.isArray(ev.message.content)) {
      for (const b of ev.message.content) {
        if (b && b.type === 'tool_result' && b.is_error) {
          emitir(ej, { t: 'aviso', texto: 'Un paso falló: ' + compactar(textoDe(b.content) || String(b.content || ''), 220) });
        }
      }
      return;
    }
    if (ev.type === 'result') {
      huboFin = true;
      ej.estado = ev.is_error ? 'error' : 'ok';
      emitir(ej, {
        t: 'fin',
        ok: !ev.is_error,
        duracionMs: ev.duration_ms || Date.now() - ej.inicio,
        turnos: ev.num_turns || null,
        costo: typeof ev.total_cost_usd === 'number' ? ev.total_cost_usd : null,
        resumen: ev.is_error ? compactar(String(ev.result || ev.subtype || 'terminó con errores'), 400) : null,
      });
    }
  });

  proc.stderr.on('data', (d) => { colaErrores = (colaErrores + d.toString()).slice(-2000); });
  proc.on('error', (e) => {
    clearTimeout(temporizador);
    ej.estado = 'error';
    const texto = e.code === 'ENOENT'
      ? 'No encuentro el programa «claude» en este equipo. Instala Claude Code e inicia sesión para poder usar los botones.'
      : 'No se pudo arrancar Claude: ' + e.message;
    emitir(ej, { t: 'error', texto });
    emitir(ej, { t: 'fin', ok: false, duracionMs: Date.now() - ej.inicio, turnos: null, costo: null, resumen: null });
  });
  proc.on('close', (codigo) => {
    clearTimeout(temporizador);
    if (huboFin) return;
    if (ej.estado === 'detenido') {
      emitir(ej, { t: 'fin', ok: false, detenido: true, duracionMs: Date.now() - ej.inicio, turnos: null, costo: null, resumen: 'Detenido a petición tuya.' });
      return;
    }
    ej.estado = 'error';
    emitir(ej, { t: 'error', texto: colaErrores.trim() ? compactar(colaErrores, 400) : 'Claude terminó sin dar respuesta (código ' + codigo + ').' });
    emitir(ej, { t: 'fin', ok: false, duracionMs: Date.now() - ej.inicio, turnos: null, costo: null, resumen: null });
  });

  return ej;
}

function promptInforme(fecha, resumen) {
  const partes = [];
  partes.push('Fecha: ' + fecha);
  const t = resumen.totales;
  partes.push('Totales: ' + t.sesiones + ' sesiones en ' + t.proyectos + ' proyectos, ' + t.prompts + ' peticiones del usuario, ' + t.herramientas + ' acciones de herramientas, ' + t.archivos + ' archivos modificados, tiempo activo aproximado ' + Math.round(t.tiempoActivoSeg / 60) + ' min.');
  if (resumen.topHerramientas.length) partes.push('Herramientas más usadas: ' + resumen.topHerramientas.map(([n, c]) => n + ' (' + c + ')').join(', ') + '.');
  if (resumen.archivos.length) partes.push('Archivos tocados: ' + resumen.archivos.map((a) => path.basename(a)).join(', ') + '.');
  resumen.sesiones.slice(0, 12).forEach((s, i) => {
    partes.push((i + 1) + '. [' + s.proyecto + (s.rama ? ' · ' + s.rama : '') + '] «' + (s.titulo || 'sin título') + '» — ' + s.prompts + ' peticiones, ' + s.herramientas + ' acciones' + (s.resumen ? '. Nota: ' + s.resumen : '') + '.');
  });
  return 'Eres el asistente de un equipo de desarrollo. Con los datos de actividad de Claude Code que hay más abajo, redacta en español un informe diario breve para compartir con el equipo: un párrafo de resumen general y una lista con lo más relevante por sesión o proyecto, y cierra con los siguientes pasos evidentes si los hay. Máximo 220 palabras, tono profesional y cercano. No inventes nada que no esté en los datos y no uses ninguna herramienta: responde solo con el informe.\n\nDATOS:\n' + partes.join('\n');
}

/* ------------------------------------------------------------------ */
/* Servidor HTTP                                                       */
/* ------------------------------------------------------------------ */

const TIPOS_MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };
const ESTATICOS = { '/': 'index.html', '/index.html': 'index.html', '/app.js': 'app.js', '/style.css': 'style.css' };

function responderJson(res, codigo, datos) {
  const cuerpo = JSON.stringify(datos);
  res.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(cuerpo);
}

function leerCuerpo(req) {
  return new Promise((resolver, rechazar) => {
    let datos = '';
    req.on('data', (c) => {
      datos += c;
      if (datos.length > 1e6) { rechazar(new Error('petición demasiado grande')); req.destroy(); }
    });
    req.on('end', () => {
      try { resolver(datos ? JSON.parse(datos) : {}); } catch (e) { rechazar(new Error('JSON inválido')); }
    });
    req.on('error', rechazar);
  });
}

async function manejar(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const ruta = url.pathname;

  // Archivos estáticos
  if (req.method === 'GET' && ESTATICOS[ruta]) {
    const archivo = path.join(DIR_PUBLICO, ESTATICOS[ruta]);
    try {
      const contenido = fs.readFileSync(archivo);
      res.writeHead(200, { 'Content-Type': TIPOS_MIME[path.extname(archivo)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(contenido);
    } catch (e) {
      res.writeHead(404); res.end('No encontrado');
    }
    return;
  }

  if (req.method === 'GET' && ruta === '/api/estado') {
    const cli = await comprobarCli(url.searchParams.has('refrescar'));
    return responderJson(res, 200, {
      dirClaude: DIR_CLAUDE,
      hayDatos: fs.existsSync(path.join(DIR_CLAUDE, 'projects')),
      cli: { disponible: cli.disponible, version: cli.version },
      proyectos: proyectosConocidos(),
      raizPanel: RAIZ_REPO,
    });
  }

  if (req.method === 'GET' && ruta === '/api/resumen') {
    const fecha = /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get('fecha') || '') ? url.searchParams.get('fecha') : fechaLocal(Date.now());
    return responderJson(res, 200, resumenDia(fecha));
  }

  if (req.method === 'GET' && ruta === '/api/sesiones') {
    return responderJson(res, 200, { sesiones: listarSesiones().map(sesionParaApi) });
  }

  const mSesion = req.method === 'GET' && ruta.match(/^\/api\/sesiones\/([A-Za-z0-9-]+)$/);
  if (mSesion) {
    const detalle = detalleSesion(mSesion[1]);
    if (!detalle) return responderJson(res, 404, { error: 'Sesión no encontrada' });
    return responderJson(res, 200, detalle);
  }

  if (req.method === 'GET' && ruta === '/api/catalogo') {
    return responderJson(res, 200, { items: catalogo() });
  }

  if (req.method === 'POST' && ruta === '/api/ejecutar') {
    const cuerpo = await leerCuerpo(req);
    const cli = await comprobarCli(false);
    if (!cli.disponible) return responderJson(res, 409, { error: 'cli', mensaje: 'No encuentro el programa «claude» en este equipo.' });

    const proyectos = proyectosConocidos();
    const proyecto = proyectos.find((p) => p.ruta === cuerpo.proyecto) ? cuerpo.proyecto : (proyectos[0] ? proyectos[0].ruta : os.homedir());
    const args = String(cuerpo.args || '').trim();
    let titulo, prompt, automatico = !!cuerpo.automatico;

    if (cuerpo.id === 'libre') {
      if (!args) return responderJson(res, 400, { error: 'vacio', mensaje: 'Escribe qué quieres pedirle a Claude.' });
      titulo = 'Pedido libre';
      prompt = args;
    } else if (cuerpo.id === 'informe') {
      const fecha = /^\d{4}-\d{2}-\d{2}$/.test(cuerpo.fecha || '') ? cuerpo.fecha : fechaLocal(Date.now());
      const resumen = resumenDia(fecha);
      if (!resumen.totales.sesiones) return responderJson(res, 400, { error: 'sin-datos', mensaje: 'Ese día no hay actividad que resumir.' });
      titulo = 'Informe del ' + fecha;
      prompt = promptInforme(fecha, resumen);
      automatico = false;
    } else {
      const item = catalogo().find((it) => it.id === cuerpo.id);
      if (!item) return responderJson(res, 404, { error: 'no-existe', mensaje: 'Ese botón ya no existe. Recarga la página.' });
      titulo = item.nombre;
      if (item.tipo === 'boton') {
        prompt = item.prompt + (args ? '\n\nInstrucciones adicionales del usuario: ' + args : '');
        automatico = cuerpo.automatico === undefined ? item.automatico : automatico;
      } else {
        prompt = item.invocacion + (args ? ' ' + args : '');
      }
    }

    const ej = nuevaEjecucion({ titulo, prompt, cwd: proyecto, automatico });
    return responderJson(res, 200, { ejecucion: { id: ej.id, titulo: ej.titulo, carpeta: ej.cwd } });
  }

  if (req.method === 'GET' && ruta === '/api/ejecuciones') {
    return responderJson(res, 200, {
      ejecuciones: [...ejecuciones.values()].map((e) => ({ id: e.id, titulo: e.titulo, estado: e.estado, inicio: e.inicio })),
    });
  }

  const mStream = req.method === 'GET' && ruta.match(/^\/api\/ejecuciones\/([A-Za-z0-9-]+)\/stream$/);
  if (mStream) {
    const ej = ejecuciones.get(mStream[1]);
    if (!ej) return responderJson(res, 404, { error: 'No existe esa ejecución' });
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('retry: 3000\n\n');
    for (const evento of ej.eventos) res.write('data: ' + JSON.stringify(evento) + '\n\n');
    ej.clientes.add(res);
    const latido = setInterval(() => { try { res.write(': latido\n\n'); } catch (e) { /* nada */ } }, 20000);
    req.on('close', () => { clearInterval(latido); ej.clientes.delete(res); });
    return;
  }

  const mParar = req.method === 'POST' && ruta.match(/^\/api\/ejecuciones\/([A-Za-z0-9-]+)\/parar$/);
  if (mParar) {
    const ej = ejecuciones.get(mParar[1]);
    if (!ej) return responderJson(res, 404, { error: 'No existe esa ejecución' });
    if (ej.estado === 'ejecutando' && ej.proc) {
      ej.estado = 'detenido';
      try { ej.proc.kill(); } catch (e) { /* ya terminó */ }
    }
    return responderJson(res, 200, { ok: true });
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end('{"error":"Ruta no encontrada"}');
}

/* ------------------------------------------------------------------ */
/* Arranque                                                            */
/* ------------------------------------------------------------------ */

function abrirNavegador(direccion) {
  if (process.env.NO_ABRIR === '1') return;
  let orden, args;
  if (process.platform === 'darwin') { orden = 'open'; args = [direccion]; }
  else if (ES_WINDOWS) { orden = 'cmd'; args = ['/c', 'start', '', direccion]; }
  else { orden = 'xdg-open'; args = [direccion]; }
  try {
    const p = spawn(orden, args, { detached: true, stdio: 'ignore' });
    p.on('error', () => { /* sin navegador disponible: no pasa nada */ });
    p.unref();
  } catch (e) { /* nada */ }
}

function escuchar(puerto, intentosRestantes) {
  const servidor = http.createServer((req, res) => {
    manejar(req, res).catch((e) => {
      try { responderJson(res, 500, { error: 'interno', mensaje: e.message }); } catch (e2) { /* respuesta ya enviada */ }
    });
  });
  servidor.on('error', (e) => {
    if (e.code === 'EADDRINUSE' && intentosRestantes > 0) {
      console.log('El puerto ' + puerto + ' está ocupado; pruebo con el ' + (puerto + 1) + '…');
      escuchar(puerto + 1, intentosRestantes - 1);
    } else {
      console.error('No se pudo arrancar el panel: ' + e.message);
      process.exit(1);
    }
  });
  servidor.listen(puerto, '127.0.0.1', () => {
    const direccion = 'http://localhost:' + puerto;
    console.log('');
    console.log('  ✅ Panel de Claude Code en marcha');
    console.log('  👉 Abre ' + direccion + ' en tu navegador (se abrirá solo si es posible).');
    console.log('  ℹ️  Datos leídos de ' + DIR_CLAUDE);
    console.log('  🛑 Para cerrarlo, cierra esta ventana o pulsa Ctrl+C.');
    console.log('');
    abrirNavegador(direccion);
  });
}

comprobarCli(true).then((cli) => {
  if (!cli.disponible) {
    console.log('⚠️  No encuentro el programa «claude»: el panel funcionará en modo solo lectura.');
  }
  escuchar(PUERTO_BASE, 10);
});
