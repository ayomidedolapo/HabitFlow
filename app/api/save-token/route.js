import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const { token } = await req.json();

  await prisma.user.update({
    where: { email: session.user.email },
    data: { pushToken: token },
  });

  return Response.json({ success: true });
}