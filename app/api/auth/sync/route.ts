import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const dbUser = await prisma.user.upsert({
        where: { clerkId: userId },
        update: {
            email: user.emailAddresses[0]?.emailAddress,
            name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
            avatar: user.imageUrl,
        },
        create: {
            clerkId: userId,
            email: user.emailAddresses[0]?.emailAddress || '',
            name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
            avatar: user.imageUrl,
        },
    })
    return NextResponse.json(dbUser)
}