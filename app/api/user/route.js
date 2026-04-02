export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, createdAt: true },
  })

  return NextResponse.json(user)
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, email } = await req.json()

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
  }

  // Check if email is taken by another user
  const existing = await prisma.user.findFirst({
    where: { email, NOT: { id: session.user.id } },
  })
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, email },
    select: { id: true, name: true, email: true, createdAt: true },
  })

  return NextResponse.json(user)
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.user.delete({ where: { id: session.user.id } })
  return NextResponse.json({ success: true })
}