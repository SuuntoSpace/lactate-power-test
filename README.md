# SuuntoPlus™ Dual Threshold App

**Dual Threshold** es una aplicación deportiva para relojes Suunto diseñada para estimar de forma guiada, fiable y sencilla tus umbrales de lactato: **LT1 (Umbral Aeróbico)** y **LT2 (Umbral Anaeróbico)**, junto con el ritmo y la potencia correspondientes.

La aplicación analiza el **desacoplamiento aeróbico (ritmo vs. pulso)** comparando la primera mitad y la segunda mitad de cada fase estable del test para estimar las deflexiones de los umbrales LT1 y LT2, utilizando tus zonas de frecuencia cardíaca configuradas en el reloj (basadas en tu `MaxHR`).

---

## ⏱️ Estructura del Test

El protocolo consta de 6 bloques guiados estructurados para elevar la intensidad progresivamente:

1. **Warm Up (Calentamiento):** 10 minutos por debajo de la Zona 2 para estabilizar el pulso y calibrar la señal inicial.
2. **Fase 1 (Línea base):** Z1 → Z2 baja. Objetivo: Establecer la base fisiológica por debajo del LT1.
3. **Fase 2 (Detección LT1):** Z2 → Z3 baja. Objetivo: Cruzar el umbral aeróbico y detectar el desacoplamiento de ritmo/pulso.
4. **Fase 3 (Detección LT2):** Z3 → Z4. Objetivo: Entrar en la zona de inestabilidad y registrar el umbral anaeróbico y potencia.
5. **Fase 4 (Validación):** Z4 alta → Z5. Objetivo: Confirmar el LT2 bajo máximo estrés metabólico.
6. **Cool Down (Enfriamiento):** 5 minutos suaves por debajo de la Zona 2.

> [!TIP]
> **Modificación rápida de duración:** Si quieres realizar un test rápido para probar el reloj o prefieres etapas más cortas, puedes pulsar el **botón INFERIOR (DOWN)** durante la fase de *Warm Up* para alternar la duración de las fases entre **1 minuto, 5 minutos o 10 minutos**.

---

## 🎮 Controles e Interfaz en el Reloj

### Durante el Test (Pantalla Principal)
* **Parte Superior:** Muestra la fase actual en la que te encuentras (*Warm Up, Stable, Tapering, etc.*).
* **Rango Central:** Frecuencia cardíaca recomendada (objetivo) para esa etapa.
* **Centro de pantalla:** Muestra tu Ritmo actual (izquierda) y tus Pulsaciones en tiempo real (derecha).
* **Parte Inferior:** Cuenta atrás con el tiempo restante para finalizar la fase actual y el indicador de etapa (*PRE, 1/4, 2/4, 3/4, 4/4, POST*).

### Pantalla de Resultados Finales
Al completar los 5 minutos de Cool Down, la pantalla cambiará automáticamente a un panel de resultados premium:
* Muestra de forma limpia e independiente las tarjetas de **LT1 (Aeróbico)** y **LT2 (Anaeróbico)** con su respectivo pulso (bpm) y ritmo (/km).
* Muestra la **Potencia (W)** calculada de tu umbral LT2.
* La pantalla de resultados es fija al final del test para evitar salidas accidentales.

---

## 🔧 Configuración y Modo Diagnóstico (Debug)

La aplicación incluye un modo diagnóstico/debug oculto que permite visualizar variables en directo y verificar el funcionamiento técnico del algoritmo de cálculo durante el desarrollo.

### Activar el Modo Diagnóstico
Por motivos de experiencia de usuario limpia y rendimiento, el modo debug está **desactivado por defecto** y todos los botones del reloj (salvo el botón INFERIOR en el Warm Up) conservan su **función nativa de Suunto** (como el botón CENTRAL para guardar/pausar o el botón SUPERIOR para cambiar de pantalla nativa).

Si deseas activar el modo diagnóstico para hacer pruebas:
1. Abre el archivo [main.js](file:///Users/oscar.munoz/Desktop/Clientes/OMF/Suunto/Repos/Dual-Threshold/main.js).
2. Cambia el valor de la variable `DEBUG_MODE` al principio del archivo a `1`:
   ```javascript
   var DEBUG_MODE = 1;
   ```
3. Compila la aplicación ejecutando en la terminal:
   ```bash
   node build.js
   ```

El script `build.js` se encarga automáticamente de:
- **Si `DEBUG_MODE = 0` (por defecto):** Elimina cualquier intercepción del botón SUPERIOR (`up`) en las plantillas de entrenamiento y resultados, garantizando que puedas usar las funciones nativas del reloj en todo momento.
- **Si `DEBUG_MODE = 1`:** Inyecta la intercepción del botón SUPERIOR (`up`) en las plantillas para permitirte alternar a la pantalla de diagnóstico técnico y controlar el test.

### Funciones del Modo Diagnóstico (Cuando está activo)
* Durante el test, pulsa el **botón SUPERIOR (UP)** o realiza un deslizamiento hacia arriba para ingresar a la pantalla de diagnóstico técnico.
* Podrás visualizar el estado actual interno del test y el tiempo restante exacto de la fase actual.
* Volverá automáticamente a la pantalla principal de entrenamiento tras 30 segundos de inactividad, o pulsando el **botón SUPERIOR (UP)** o **CENTRAL (NEXT)**.

---

## 📱 Sincronización Móvil
Al guardar la actividad física, todos tus datos fisiológicos de umbrales calculados se guardarán permanentemente en el resumen de la actividad dentro de la aplicación móvil de Suunto, detallando ritmos, potencias y pulsaciones para que puedas monitorizar tu evolución de rendimiento a largo plazo.

---

## 🛠️ Notas de Integración

* **Lectura Dinámica de FC Máxima (`MaxHR`):**
  * La aplicación solicita en tiempo real al sistema operativo del reloj el dato `/Settings/User/MaxHR` del perfil del usuario.
  * Cuenta con un mecanismo de resguardo (fallback a `190 bpm`) en caso de que el simulador o el dispositivo no envíen el dato en el arranque inicial.
