# Plantilla workflow n8n — WhatsApp + Supabase + LLM

Este documento describe nodos y conexiones para replicar el flujo de 12 pasos del skill. Exportá desde n8n como JSON cuando el workflow esté armado en la UI.

## Nodos sugeridos (orden lógico)


| #   | Nodo              | Rol                                                                               |
| --- | ----------------- | --------------------------------------------------------------------------------- |
| 1   | Webhook (POST)    | Entrada WhatsApp Cloud API (verify + messages)                                    |
| 2   | Function / Set    | Normalizar payload: `from`, `text`, `message_id`, `timestamp`                     |
| 3   | Supabase          | `get` o `select` en `alenya_leads` por `wa_id`                                    |
| 4   | IF                | `lead` existe                                                                     |
| 5a  | Supabase `insert` | Crear lead nuevo + (opcional) HTTP a notificación vendedor                        |
| 5b  | —                 | Continuar con lead existente                                                      |
| 6   | Supabase          | Últimos N mensajes de `alenya_conversaciones` para `lead_id`                      |
| 7   | Function          | Armar prompt: system + variables BOT_* + historial                                |
| 8   | HTTP Request      | Anthropic Messages API (Claude Sonnet)                                            |
| 9   | Function          | Parsear texto + regex/JSON liviano para `intent`                                  |
| 10  | Switch            | Ramas: `info`, `calificar`, `cerrar`, `escalar`                                   |
| 11  | HTTP Request      | WhatsApp Cloud API `messages` (responder)                                         |
| 12  | Supabase          | `insert` mensajes user+assistant; `update` lead `etapa`; si escala → notificación |


## Variables de entorno n8n (ejemplo)

- `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- `ANTHROPIC_API_KEY`

## Notas

- El webhook de Meta debe apuntar a la URL pública del nodo Webhook (o reverse proxy).
- Para verificación GET de Meta, agregar nodo IF que responda `hub.challenge` cuando corresponda.
- Guardar `message_id` procesados en cache o tabla para idempotencia si hace falta.