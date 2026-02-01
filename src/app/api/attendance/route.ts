
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const studentId = searchParams.get("studentId");
    const type = searchParams.get("type");

    if (!classId) {
        return NextResponse.json({ message: "Missing classId" }, { status: 400 });
    }

    const where: any = { classId };
    if (studentId) where.studentId = studentId;
    if (type) where.type = type;

    try {
        const attendance = await prisma.attendance.findMany({
            where: where
        });
        return NextResponse.json(attendance);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching attendance" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN" && (session.user as any).role !== "TEACHER")) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { classId, bulkAttendance } = body;

        if (!classId || !Array.isArray(bulkAttendance)) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }

        await prisma.$transaction(
            bulkAttendance.map((a: any) =>
                prisma.attendance.upsert({
                    where: {
                        studentId_classId_type: {
                            studentId: a.studentId,
                            classId: a.classId || classId,
                            type: a.type
                        }
                    },
                    update: {
                        days: parseInt(a.days) || 0,
                        present: parseInt(a.present) || 0,
                        absent: parseInt(a.absent) || 0,
                        sick: parseInt(a.sick) || 0,
                        leave: parseInt(a.leave) || 0,
                        remarks: a.remarks || null
                    },
                    create: {
                        studentId: a.studentId,
                        classId: a.classId || classId,
                        type: a.type,
                        days: parseInt(a.days) || 0,
                        present: parseInt(a.present) || 0,
                        absent: parseInt(a.absent) || 0,
                        sick: parseInt(a.sick) || 0,
                        leave: parseInt(a.leave) || 0,
                        remarks: a.remarks || null
                    }
                })
            )
        );

        return NextResponse.json({ message: "Attendance saved successfully" });
    } catch (error) {
        console.error("Error saving attendance:", error);
        return NextResponse.json({ message: "Error saving attendance" }, { status: 500 });
    }
}
