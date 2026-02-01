
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");
    const type = searchParams.get("type");

    if (!classId) {
        return NextResponse.json({ message: "Missing classId" }, { status: 400 });
    }

    const where: any = { classId };
    if (subjectId) where.subjectId = subjectId;
    if (type) where.type = type;

    try {
        const grades = await prisma.grade.findMany({
            where: where
        });
        return NextResponse.json(grades);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching grades" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN" && (session.user as any).role !== "TEACHER")) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { classId, subjectId, type, grades, bulkGrades } = body;

        // Support for bulk grades (multiple subjects/types)
        if (bulkGrades && Array.isArray(bulkGrades)) {
            await prisma.$transaction(
                bulkGrades.map((g: any) =>
                    prisma.grade.upsert({
                        where: {
                            studentId_subjectId_classId_type: {
                                studentId: g.studentId,
                                subjectId: g.subjectId,
                                classId: g.classId || classId,
                                type: g.type
                            }
                        },
                        update: { score: parseFloat(g.score) },
                        create: {
                            studentId: g.studentId,
                            subjectId: g.subjectId,
                            classId: g.classId || classId,
                            type: g.type,
                            score: parseFloat(g.score)
                        }
                    })
                )
            );
            return NextResponse.json({ message: "Bulk grades saved successfully" });
        }

        // Legacy single subject/type support
        if (!classId || !subjectId || !type || !Array.isArray(grades)) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }

        await prisma.$transaction(
            grades.map((g: any) =>
                prisma.grade.upsert({
                    where: {
                        studentId_subjectId_classId_type: {
                            studentId: g.studentId,
                            subjectId,
                            classId,
                            type
                        }
                    },
                    update: { score: parseFloat(g.score) },
                    create: {
                        studentId: g.studentId,
                        subjectId,
                        classId,
                        type,
                        score: parseFloat(g.score)
                    }
                })
            )
        );

        return NextResponse.json({ message: "Grades saved successfully" });
    } catch (error) {
        console.error("Error saving grades:", error);
        return NextResponse.json({ message: "Error saving grades" }, { status: 500 });
    }
}
