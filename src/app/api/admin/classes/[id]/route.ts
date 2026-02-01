import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET a single class detail
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN" && (session.user as any).role !== "TEACHER")) {
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
        const { section, gender, teacherId, studentIds, subjectIds, academicYear, level } = data;

        const updatedClass = await prisma.schoolClass.update({
            where: { id },
            data: {
                section: section,
                gender: gender,
                teacherId: teacherId || null,
                academicYear: academicYear || "1403",
                name: `${level || 'Class'} - ${section}`,
                students: {
                    set: (studentIds || []).map((sId: string) => ({ id: sId }))
                },
                subjects: {
                    set: (subjectIds || []).map((sId: string) => ({ id: sId }))
                }
            }
        });

        // 3. Sync historical enrollment records
        if (studentIds && studentIds.length > 0 && academicYear) {
            await Promise.all(studentIds.map((sId: string) =>
                prisma.enrollment.upsert({
                    where: { studentId_academicYear: { studentId: sId, academicYear: academicYear } },
                    update: { classId: updatedClass.id },
                    create: { studentId: sId, classId: updatedClass.id, academicYear: academicYear }
                })
            ));
        }

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
