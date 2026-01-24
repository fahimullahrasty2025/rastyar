import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const categories = await prisma.category.findMany({
        include: { subjects: true },
        orderBy: { name: 'asc' }
    });
    return NextResponse.json(categories);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SUPERADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name } = await req.json();
        const category = await prisma.category.create({
            data: { name }
        });
        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ message: "Error creating category" }, { status: 500 });
    }
}
