import { NextResponse } from "next/server";

type LeadBody = {
  nombre?: string;
  whatsapp?: string;
  presupuesto?: string;
  zona?: string;
  etapa?: string;
};

export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { error: "Missing SUPABASE_URL or SUPABASE_KEY" },
      { status: 500 }
    );
  }

  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const row = {
    nombre: body.nombre ?? null,
    whatsapp: body.whatsapp ?? null,
    presupuesto: body.presupuesto ?? null,
    zona: body.zona ?? null,
    etapa: body.etapa ?? "nuevo",
  };

  const restUrl = `${url.replace(/\/$/, "")}/rest/v1/leads`;

  const res = await fetch(restUrl, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json(
      { error: "Supabase insert failed", detail: errText },
      { status: res.status }
    );
  }

  return NextResponse.json({ ok: true });
}
