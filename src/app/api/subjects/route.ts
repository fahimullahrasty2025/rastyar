import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const subjects = await prisma.subject.findMany({
        include: { category: true, teacher: true },
        orderBy: { name: 'asc' }
    });
    return NextResponse.json(subjects);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SUPERADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, categoryId } = await req.json();
        const subject = await prisma.subject.create({
            data: { name, categoryId }
        });
        return NextResponse.json(subject);
    } catch (error) {
        return NextResponse.json({ message: "Error creating subject" }, { status: 500 });
    }
}
