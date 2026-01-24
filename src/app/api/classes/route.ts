import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const classes = await prisma.schoolClass.findMany({
        include: {
            teacher: true,
            subjects: { include: { category: true } },
            students: true,
        },
        orderBy: { name: 'asc' }
    });
    return NextResponse.json(classes);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SUPERADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, level, section, gender, teacherId, subjectIds } = await req.json();
        const newClass = await prisma.schoolClass.create({
            data: {
                name,
                level,
                section,
                gender,
                teacherId: teacherId || null,
                subjects: {
                    connect: (subjectIds || []).map((id: string) => ({ id }))
                }
            },
            include: { teacher: true, subjects: true }
        });
        return NextResponse.json(newClass);
    } catch (error) {
        console.error("Create Class Error:", error);
        return NextResponse.json({ message: "Error creating class" }, { status: 500 });
    }
}
