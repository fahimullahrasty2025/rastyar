import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET a single class detail
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const schoolClass = await prisma.schoolClass.findUnique({
            where: { id },
            include: {
                teacher: { select: { id: true, name: true, email: true } },
                students: { select: { id: true, name: true, studentId: true, fatherName: true, image: true } },
                subjects: { select: { id: true, name: true } }
            }
        });

        if (!schoolClass) {
            return NextResponse.json({ message: "Class not found" }, { status: 404 });
        }

        return NextResponse.json(schoolClass);
    } catch (error) {
        console.error("Fetch Class Detail Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// UPDATE a class
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const data = await req.json();
        const { section, gender, teacherId, studentIds } = data;

        const updatedClass = await prisma.schoolClass.update({
            where: { id },
            data: {
                section: section,
                gender: gender,
                teacherId: teacherId || null,
                // Update name based on section change
                name: `${data.level} - ${section}`,
                students: {
                    set: (studentIds || []).map((sId: string) => ({ id: sId }))
                }
            }
        });

        return NextResponse.json(updatedClass);
    } catch (error) {
        console.error("Update Class Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE a class
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await prisma.schoolClass.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Class deleted successfully" });
    } catch (error) {
        console.error("Delete Class Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
