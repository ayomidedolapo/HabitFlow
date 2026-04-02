export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  })

  return NextResponse.json({ success: true })
}