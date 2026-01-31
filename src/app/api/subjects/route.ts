import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const subjects = await prisma.subject.findMany({
        include: { teacher: true },
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
        const body = await req.json();
        const { name } = body;

        if (!name || name.trim() === "") {
            return NextResponse.json({ message: "Subject name is required" }, { status: 400 });
        }

        const subject = await prisma.subject.create({
            data: { name }
        });
        return NextResponse.json(subject);
    } catch (error) {
        console.error("Error creating subject:", error);
        return NextResponse.json({ message: "Error creating subject" }, { status: 500 });
    }
}
