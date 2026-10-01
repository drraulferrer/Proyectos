"""Tests del conversor DATEX II → JSON con una muestra real del registro oficial.

Ejecutar: python3 -m unittest discover -s tesla-viajes/scripts -p 'test_*.py'
"""
import contextlib
import io
import json
import os
import tempfile
import unittest

import construir_datos as cd

MUESTRA = os.path.join(os.path.dirname(__file__), "..", "test", "fixtures", "electrolineras-muestra.xml")


class ConstruirDatos(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.datos, cls.resumen = cd.construir(MUESTRA, generado="2026-10-01T00:00:00Z")
        campos = cls.datos["campos"]
        cls.estaciones = [dict(zip(campos, fila)) for fila in cls.datos["estaciones"]]
        cls.ops = cls.datos["operadores"]

    def estacion(self, nombre):
        for e in self.estaciones:
            if e["nombre"] == nombre:
                return e
        self.fail(f"no está {nombre!r}")

    def marca(self, estacion):
        return self.ops[estacion["operador"]]["marca"]

    def test_lee_todos_los_sitios_y_descarta_los_inservibles(self):
        self.assertEqual(self.resumen["sitios_leidos"], 18)
        self.assertEqual(self.resumen["descartes"]["sin_coordenadas_validas"], 1)
        self.assertNotIn("Sin coordenadas", [e["nombre"] for e in self.estaciones])

    def test_fusiona_registros_del_mismo_operador_en_el_mismo_punto(self):
        porsche = self.estacion("Centro Porsche Baleares")
        self.assertEqual(porsche["id"], "2023002088+2023002089")
        self.assertEqual(porsche["puntos"], 2)
        self.assertEqual(porsche["conectores"], [["C2", "DC", "c", 350.0, 920, 348.0, 2]])

    def test_medios_de_pago_declarados(self):
        bits = self.datos["bits_pago"]
        zunder = self.estacion("Burgos - Calle de la Igualdad")
        self.assertEqual(zunder["pagos"], bits["apps"] | bits["rfid"] | bits["creditCard"])
        tesla = self.estacion("Torrent Southbound, Spain")
        self.assertEqual(tesla["pagos"], bits["apps"] | bits["nfc"])
        ionity = self.estacion("IONITY Pola de Lena")
        self.assertEqual(ionity["pagos"], bits["rfid"])

    def test_metodo_de_pago_desconocido_se_cuenta_y_no_rompe(self):
        raros = self.estacion("Casos raros & potencia en kW")
        bits = self.datos["bits_pago"]
        self.assertEqual(raros["pagos"], bits["debitCard"] | bits["pinpad"])
        self.assertEqual(self.resumen["pagos_desconocidos"], {"metodoDesconocido": 1})

    def test_conectores_agrupados_con_tension_e_intensidad(self):
        tesla = self.estacion("Torrent Southbound, Spain")
        self.assertIn(["C2", "DC", "c", 150.0, 464, 400.0, 2], tesla["conectores"])
        self.assertIn(["T2", "DC", "c", 150.0, 464, 400.0, 2], tesla["conectores"])
        self.assertEqual(self.marca(tesla), "Tesla Supercharger")

    def test_horarios(self):
        electra = self.estacion("ELECTRA ALTO MIÑO")
        self.assertEqual(electra["horario"], ["08:00-14:00"] * 5 + ["", ""])
        raros = self.estacion("Casos raros & potencia en kW")
        self.assertEqual(raros["horario"][0], "08:00-14:00,16:00-20:00")
        self.assertEqual(raros["horario"][4], "22:00-02:00")
        self.assertEqual(raros["horario"][5], "")  # «00:00 - 00:00» = cerrado
        self.assertEqual(self.estacion("IONITY Pola de Lena")["horario"], "24/7")

    def test_horario_24_7_contradictorio_manda_la_etiqueta(self):
        madrid = self.estacion("Madrid_1")
        self.assertEqual(madrid["horario"], ["", "", "14:00-16:00", "14:00-16:00", "14:00-16:00", "14:00-16:00", ""])
        self.assertEqual(self.resumen["correcciones"]["horario_24_7_contradictorio"], 1)

    def test_corrige_coordenadas_intercambiadas_y_potencia_en_kw(self):
        raros = self.estacion("Casos raros & potencia en kW")
        self.assertEqual((raros["lat"], raros["lon"]), (41.38, 2.12666))
        self.assertEqual(raros["conectores"][0][3], 120.0)
        self.assertEqual(self.resumen["correcciones"]["coordenadas_intercambiadas"], 1)

    def test_direccion_y_codigo_postal(self):
        porsche = self.estacion("Centro Porsche Baleares")
        self.assertEqual(porsche["direccion"], "Camí dels Reis 166")
        self.assertEqual(porsche["municipio"], "Palma")
        self.assertEqual(porsche["cp"], "07011")
        raros = self.estacion("Casos raros & potencia en kW")
        self.assertEqual((raros["direccion"], raros["municipio"]), ("Carrer de Prova 1", "Barcelona"))

    def test_marcas_y_razones_sociales(self):
        marcas = {o["id"]: o["marca"] for o in self.ops}
        self.assertEqual(marcas["ES*ZUN"], "Zunder")
        self.assertEqual(marcas["ES*915"], "Motor Box Mallorca")
        self.assertEqual(marcas["ES*ENE"], "Energea Consulting y Asesores")
        self.assertEqual(cd.limpiar_razon_social("IONITY GmbH Sucursal en España"), "IONITY")
        self.assertEqual(cd.limpiar_razon_social("CEPSA COMERCIAL PETRÓLEO,S.A.U."), "Cepsa Comercial Petróleo")

    def test_servicios_cercanos(self):
        bits = self.datos["bits_servicio"]
        cepsa = self.estacion("Cepsa I Dir.Francia - Mutilva")
        self.assertTrue(cepsa["servicios"] & bits["airport"] or cepsa["servicios"] & bits["petrolStation"])

    def test_resumen(self):
        self.assertEqual(self.resumen["estaciones"], 16)
        self.assertEqual(self.resumen["estaciones_ccs_150kw"], 6)


class LineaDeComandos(unittest.TestCase):
    def test_escribe_estaciones_y_meta(self):
        with tempfile.TemporaryDirectory() as tmp, contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(cd.main(["--entrada", MUESTRA, "--salida", tmp]), 0)
            with open(os.path.join(tmp, "estaciones.json"), encoding="utf-8") as f:
                datos = json.load(f)
            with open(os.path.join(tmp, "meta.json"), encoding="utf-8") as f:
                meta = json.load(f)
        self.assertEqual(len(datos["estaciones"]), 16)
        self.assertEqual(meta["fuente"]["publicado"], "2026-09-30T10:16:30.263+02:00")

    def test_falla_si_salen_demasiado_pocas_estaciones(self):
        with tempfile.TemporaryDirectory() as tmp, contextlib.redirect_stderr(io.StringIO()), \
                contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(cd.main(["--entrada", MUESTRA, "--salida", tmp, "--min-estaciones", "5000"]), 1)
            self.assertFalse(os.path.exists(os.path.join(tmp, "estaciones.json")))


if __name__ == "__main__":
    unittest.main()
