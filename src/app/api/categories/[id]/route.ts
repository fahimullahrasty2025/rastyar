import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SUPERADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name } = await req.json();
        const { id } = await params;
        const category = await prisma.category.update({
            where: { id },
            data: { name }
        });
        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ message: "Error updating category" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SUPERADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        await prisma.category.delete({
            where: { id }
        });
        return NextResponse.json({ message: "Category deleted" });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting category" }, { status: 500 });
    }
}
