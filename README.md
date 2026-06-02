# SuuntoPlus™ Dual Threshold App

**Dual Threshold** es una aplicación deportiva avanzada para relojes Suunto diseñada para estimar de forma guiada, fiable y sencilla tus umbrales de lactato: **LT1 (Umbral Aeróbico)** y **LT2 (Umbral Anaeróbico)**, junto con el ritmo y la potencia correspondientes.

La aplicación funciona de forma inteligente a través de dos vías según los sensores que lleves puestos, garantizando siempre la mayor precisión posible.

---

## 🚀 Las Dos Vías de Funcionamiento

La aplicación detecta automáticamente si dispones de medición de variabilidad cardíaca (HRV) en tiempo real para seleccionar el método de cálculo óptimo:

### 1. Vía ZoneSense (Con Cinturón de Pecho) — *Modo Avanzado*
* **Requisito:** Banda de frecuencia cardíaca compatible con HRV (como Suunto Smart Sensor).
* **Cómo funciona:** La app se suscribe al flujo HRV y monitoriza en tiempo real el parámetro de estado físico **DFA $a_1$** (ZoneSense).
* **Detección Fisiológica:**
  * **LT1 (Aeróbico):** Se calcula en el momento exacto en el que el valor DFA $a_1$ desciende por debajo de **0.75**.
  * **LT2 (Anaeróbico):** Se calcula en el momento exacto en el que el valor DFA $a_1$ desciende por debajo de **0.50**.
* **Indicador en pantalla:** Verás el texto verde `• ZONESENSE •` activo durante el test.

### 2. Vía Zonas de FC (Sin Cinturón) — *Modo Estándar*
* **Requisito:** Sensor de pulso óptico integrado en el reloj (o banda sin soporte HRV).
* **Cómo funciona:** Utiliza tus zonas de frecuencia cardíaca personales configuradas en el reloj (basadas en tu `MaxHR`).
* **Cálculo Matemático:** Analiza el **desacoplamiento aeróbico (ritmo vs. pulso)** comparando la primera mitad y la segunda mitad de cada fase estable del test para estimar las deflexiones de los umbrales LT1 y LT2.
* **Indicador en pantalla:** Verás el texto amarillo `• ZONAS FC •` activo durante el test.

---

## ⏱️ Estructura del Test

El protocolo consta de 6 bloques guiados estructurados para elevar la intensidad progresivamente:

1. **Warm Up (Calentamiento):** 10 minutos por debajo de la Zona 2 para estabilizar el pulso y calibrar la señal inicial.
2. **Fase 1 (Línea base):** Z1 → Z2 baja. Objetivo: Establecer la base fisiológica por debajo del LT1.
3. **Fase 2 (Detección LT1):** Z2 → Z3 baja. Objetivo: Cruzar el umbral aeróbico y detectar el desacoplamiento de ritmo/pulso o cruce de DFA $a_1$.
4. **Fase 3 (Detección LT2):** Z3 → Z4. Objetivo: Entrar en la zona de inestabilidad y registrar el umbral anaeróbico y potencia.
5. **Fase 4 (Validación):** Z4 alta → Z5. Objetivo: Confirmar el LT2 bajo máximo estrés metabólico.
6. **Cool Down (Enfriamiento):** 5 minutos suaves por debajo de la Zona 2.

> [Tip]
> **Modificación rápida de duración:** Si quieres realizar un test rápido para probar el reloj o prefieres etapas más cortas, puedes pulsar el **botón INFERIOR (DOWN)** durante la fase de *Warm Up* para alternar la duración de las fases entre **1 minuto, 5 minutos o 10 minutos**.

---

## 🎮 Controles e Interfaz en el Reloj

### Durante el Test (Pantalla Principal)
* **Parte Superior:** Muestra la fase actual en la que te encuentras (*Warm Up, Stable, Tapering, etc.*).
* **Píldora Central:** Indica en tiempo real si estás testando vía `• ZONAS FC •` o `• ZONESENSE •`.
* **Rango Central:** Frecuencia cardíaca recomendada (objetivo) para esa etapa.
* **Centro de pantalla:** Muestra tu Ritmo actual (izquierda) y tus Pulsaciones en tiempo real (derecha).
* **Parte Inferior:** Cuenta atrás con el tiempo restante para finalizar la fase actual y el indicador de etapa (*PRE, 1/4, 2/4, 3/4, 4/4, POST*).

### Panel de Diagnóstico Oculto (Debug)
* Pulsa el **botón SUPERIOR (UP)** o desliza hacia arriba para entrar a la pantalla de diagnóstico.
* Esta pantalla te permite ver de forma nítida datos técnicos como el estado del test, tiempo restante, el modo activo, el valor de **DFA $a_1$** en directo, y los valores calculados de LT1 y LT2.
* **Control de Modos:** Desliza hacia **ARRIBA** (flick up) dentro de la pantalla de diagnóstico para alternar manualmente en caliente entre el modo **STANDARD** (Zonás de FC) y **ADVANCED** (ZoneSense).
* **Retorno a Pantalla Principal:** Presiona el **botón SUPERIOR (UP)**, el **botón CENTRAL (NEXT)** o desliza hacia **ABAJO** para volver de inmediato a la pantalla principal. El botón de **abajo (DOWN)** queda liberado para las funciones físicas nativas de tu reloj.
* *Nota:* Volverá automáticamente a la pantalla principal tras 30 segundos de inactividad si no interactúas.

### Pantalla de Resultados Finales
Al completar los 5 minutos de Cool Down, la pantalla cambiará automáticamente a un panel de resultados premium:
* Muestra de forma limpia e independiente las tarjetas de **LT1 (Aeróbico)** y **LT2 (Anaeróbico)** con su respectivo pulso (bpm) y ritmo (/km).
* Muestra la **Potencia (W)** calculada de tu umbral LT2.
* Para regresar a la pantalla de entrenamiento desde el resumen final, presiona el **botón SUPERIOR (UP)**, el **botón CENTRAL (NEXT)**, o realiza un deslizamiento (flick).

---

## 📱 Sincronización Móvil
Al guardar la actividad física, todos tus datos fisiológicos de umbrales calculados se guardarán permanentemente en el resumen de la actividad dentro de la aplicación móvil de Suunto, detallando el modo del test, ritmos, potencias y pulsaciones para que puedas monitorizar tu evolución de rendimiento a largo plazo.

---

## 🛠️ Notas de Integración y Desarrollo Futuro

La arquitectura de la aplicación está totalmente preparada para futuras actualizaciones nativas del firmware de Suunto:

1. **Lectura Dinámica de FC Máxima (`MaxHR`):**
   * La aplicación **no utiliza un pulso máximo estático**. Solicita en tiempo real al sistema operativo del reloj el dato `/Settings/User/MaxHR` del perfil del usuario.
   * Cuenta con un mecanismo de resguardo (fallback a `190 bpm`) en caso de que el simulador o el dispositivo no envíen el dato en el arranque inicial para prevenir bloqueos de pantalla.

2. **Futura Conexión Nativa de ZoneSense:**
   * Actualmente, la detección de la banda de pecho se realiza mediante la presencia de `/Activity/TrainingLab/HeartRate` (HRV).
   * La señal **DFA $a_1$** se simula mediante una función de transferencia matemática adaptativa en base al pulso relativo.
   * **Actualización en el futuro:** En cuanto el SDK de Suunto exponga el canal nativo en tiempo real de ZoneSense (por ejemplo `/Activity/TrainingLab/ZoneSense` o similar), bastará con mapear dicha suscripción en el `manifest.json` and asignarla a la variable `dfa_current` en `main.js`, reemplazando el estimador matemático por la señal nativa.
