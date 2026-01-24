import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET a single student
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const student = await prisma.user.findUnique({
            where: { id: id },
            include: { currentClass: true }
        });

        if (!student || student.role !== "STUDENT") {
            console.warn(`Student not found or role mismatch. ID: ${id}, Role: ${student?.role}`);
            return NextResponse.json({ message: "Student not found" }, { status: 404 });
        }

        return NextResponse.json(student);
    } catch (error) {
        console.error("Fetch Student Detail Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// UPDATE a student
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const data = await req.json();

        const updatedStudent = await prisma.user.update({
            where: { id: id },
            data: {
                ...data,
                role: "STUDENT"
            }
        });

        return NextResponse.json(updatedStudent);
    } catch (error) {
        console.error("Update Student Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE a student
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await prisma.user.delete({
            where: { id: id }
        });

        return NextResponse.json({ message: "Student deleted successfully" });
    } catch (error) {
        console.error("Delete Student Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
