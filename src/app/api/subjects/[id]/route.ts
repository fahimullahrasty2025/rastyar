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
        const { name, categoryId } = await req.json();
        const { id } = await params;
        const subject = await prisma.subject.update({
            where: { id },
            data: { name, categoryId }
        });
        return NextResponse.json(subject);
    } catch (error) {
        return NextResponse.json({ message: "Error updating subject" }, { status: 500 });
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
        await prisma.subject.delete({
            where: { id }
        });
        return NextResponse.json({ message: "Subject deleted" });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting subject" }, { status: 500 });
    }
}
