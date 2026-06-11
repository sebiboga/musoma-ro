import "jsr:@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req) => {
  const { type, table, record } = await req.json()

  if (type !== "INSERT") {
    return new Response(JSON.stringify({ message: "ignored" }), { headers: { "Content-Type": "application/json" } })
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), { status: 500, headers: { "Content-Type": "application/json" } })
  }

  let subject, html

  if (table === "orders") {
    subject = `Comand\u0103 nou\u0103 - ${record.nume_companie}`
    html = `
      <h2>Comand\u0103 Nou\u0103</h2>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;">
        <tr><td><strong>Nume</strong></td><td>${record.nume_companie}</td></tr>
        <tr><td><strong>Email</strong></td><td>${record.email}</td></tr>
        <tr><td><strong>Telefon</strong></td><td>${record.telefon}</td></tr>
        <tr><td><strong>Material</strong></td><td>${record.tip_material}</td></tr>
        <tr><td><strong>Cantitate</strong></td><td>${record.cantitate} tone</td></tr>
        <tr><td><strong>Adres\u0103 livrare</strong></td><td>${record.adresa_livrare}</td></tr>
        <tr><td><strong>Observa\u021Bii</strong></td><td>${record.observatii || "-"}</td></tr>
      </table>`
  } else if (table === "contact_messages") {
    subject = `Mesaj nou - ${record.nume}`
    html = `
      <h2>Mesaj Nou</h2>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;">
        <tr><td><strong>Nume</strong></td><td>${record.nume}</td></tr>
        <tr><td><strong>Email</strong></td><td>${record.email}</td></tr>
        <tr><td><strong>Telefon</strong></td><td>${record.telefon || "-"}</td></tr>
        <tr><td><strong>Subiect</strong></td><td>${record.subiect}</td></tr>
        <tr><td><strong>Mesaj</strong></td><td>${record.mesaj}</td></tr>
      </table>`
  } else {
    return new Response(JSON.stringify({ message: "ignored" }), { headers: { "Content-Type": "application/json" } })
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "contact@musoma.ro",
      to: "mihaela_cj2006@yahoo.com",
      subject,
      html,
    }),
  })

  const result = await res.json()
  return new Response(JSON.stringify({ sent: res.ok, result }), { headers: { "Content-Type": "application/json" } })
})
