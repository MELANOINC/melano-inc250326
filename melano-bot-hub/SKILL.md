---
name: melano-bot-hub
description: >-
  Runs the MELANO INC bot pipeline from lead intake through sale, delivery, and deploy.
  Activates when Bruno (or the user) mentions a new client, lead, prospect, empresa, rubro, or phrases
  like "tengo un lead", "nuevo cliente", "quiero venderle a", "me contactó",
  "arma propuesta para", "nuevo proyecto bot", "quiero cerrar con", or when starting a
  sales or delivery cycle for Alenya AI, voice agents, Private AI/RAG, or any MELANO bot
  product. Also activates for a landing, demo, or bot configuration for a specific client.
  Apply immediately when that context appears; do not wait for an explicit "use the skill" request.
---

# MELANO BOT HUB

Pipeline end-to-end: **Lead → Venta → Delivery → Deploy**. Cuatro fases, outputs concretos, sin fricción. Stakeholder interno típico: Bruno.

---

## FASE 1 — INTAKE DEL LEAD (2 min)

Cuando aparece un nuevo cliente/lead, extraer:

| Campo | Pregunta implícita |
|-------|-------------------|
| `rubro` | ¿Qué industria? (inmobiliaria, e-commerce, salud, etc.) |
| `problema_core` | ¿Qué dolor tiene hoy? (no responde leads, pierde ventas, etc.) |
| `canal` | ¿Dónde opera? (WhatsApp, Instagram, web, físico) |
| `volumen` | ¿Cuántos mensajes/clientes por día? |
| `producto_fit` | Alenya AI / Voice Agent / Private RAG / Custom |

Si Bruno ya dio estos datos en el mensaje, **no preguntar** — avanzar directo a Fase 2.

---

## FASE 2 — OUTPUTS DE VENTA

Generar en paralelo según lo que pida Bruno:

### 2A — Landing Page

- Si en el workspace o en skills existe un builder tipo `web-artifacts-builder`, leer su `SKILL.md` y seguirlo.
- Si no existe: usar template **Hero (dolor) → Solución bot → Demo CTA → Precio/paquete → WhatsApp CTA**.
- Stack preferido: Next.js + Tailwind, listo para Vercel.
- Variables: `{rubro}`, `{nombre_empresa}`, `{bot_nombre}`, `{precio}`.
- Bloques de copy por rubro: [references/landing-sections.md](references/landing-sections.md).

### 2B — PDF Propuesta Comercial

- Si existe skill `doc-coauthoring` u equivalente, seguir su `SKILL.md`.
- Estructura: Diagnóstico → Solución → Casos de uso → ROI estimado → Precio → CTA.
- Tono: directo, ejecutivo, orientado a resultado.
- Incluir: tier de pricing recomendado, timeline de implementación (7 días).

### 2C — Demo embebible (si aplica)

- Widget de chat que simule la conversación del bot para el rubro del cliente.
- Personalizar con nombre del negocio y casos de uso reales.

---

## FASE 3 — CONFIGURACIÓN DEL BOT

### Stack base

- **WhatsApp Cloud API** → entrada
- **n8n** → orquestación
- **Supabase** → leads y conversaciones
- **Next.js** → portal Melania (dashboard cliente)

### Flow n8n estándar (12 pasos)

1. Webhook entrada WhatsApp  
2. Parsear mensaje + metadata  
3. Lookup lead en Supabase (`alenya_leads`)  
4. Branch: lead nuevo vs. existente  
5. Si nuevo → crear registro + notificar vendedor  
6. Cargar contexto del lead (historial, etapa)  
7. Construir prompt con contexto + instrucciones del bot  
8. Call LLM (Claude Sonnet via Anthropic API)  
9. Parsear respuesta + detectar intent  
10. Branch por intent: info / calificar / cerrar / escalar humano  
11. Responder por WhatsApp  
12. Actualizar estado en Supabase + trigger notificación si escala  

Detalle exportable: [references/n8n-flow-template.md](references/n8n-flow-template.md).

### Variables del bot (personalizar por cliente)

```
BOT_NOMBRE="{nombre_bot}"
RUBRO="{rubro}"
EMPRESA="{nombre_empresa}"
PRODUCTO_DESCRIPCION="{descripcion_producto}"
CTA_FINAL="{accion_deseada}"
PRECIO_DESDE="{precio_base}"
HORARIO_ATENCION="{horario}"
ESCALADA_NUMERO="{whatsapp_humano}"
```

### Script de conversación (español rioplatense, 5 etapas)

1. **Saludo + calificación** → ¿qué necesitás?  
2. **Diagnóstico** → preguntas clave del rubro  
3. **Propuesta** → solución + precio  
4. **Objeción** → manejo y reencuadre  
5. **Cierre** → CTA + datos de contacto  

---

## FASE 4 — DELIVERY & DEPLOY

### Checklist de entrega al cliente

- [ ] Landing deployada en Vercel (`{cliente}.melano.com.ar` o subdominio)
- [ ] Bot configurado en n8n (workflow activo)
- [ ] Tablas Supabase creadas (`alenya_leads`, `alenya_conversaciones`, `alenya_config`) — DDL: [references/supabase-schema.md](references/supabase-schema.md)
- [ ] WhatsApp número conectado y testeado
- [ ] Portal Melania con acceso al cliente
- [ ] PDF propuesta / contrato firmado
- [ ] SOP de onboarding enviado al cliente

### Timeline estándar

| Día | Acción |
|-----|--------|
| 0 | Cierre + pago |
| 1 | Setup Supabase + n8n base |
| 2-3 | Personalización bot + landing |
| 4 | Testing interno |
| 5 | Demo con cliente |
| 6 | Ajustes |
| 7 | Go live |

---

## PRICING TIERS (referencia rápida)

| Tier | Setup | MRR | Incluye |
|------|-------|-----|---------|
| Starter | $300 | $99 | Alenya base + 1.000 msgs/mes |
| Pro | $600 | $199 | Alenya Pro + 5.000 msgs + portal |
| Enterprise | $1.200+ | $399+ | Custom + voz + RAG + soporte |

---

## REGLAS DE ORO

1. Si Bruno menciona un lead → activar Fase 1 automáticamente.  
2. No preguntar lo que ya está en contexto.  
3. Output mínimo: landing + config bot. PDF si pide propuesta formal.  
4. Todo en español rioplatense en copy y guiones.  
5. Incluir precio y timeline en cualquier output de venta.
