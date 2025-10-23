import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { name, email, message } = await request.json();

  console.log("📩 Nova mensagem recebida:", { name, email, message });

  // Aqui podes adicionar integração com email, ex:
  // await sendEmail(name, email, message);

  return NextResponse.json({ success: true });
}
