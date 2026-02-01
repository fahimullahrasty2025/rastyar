import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    let where: any = {};

    if (role === "ADMIN") {
        // Admin sees subjects they created OR subjects created by their teachers
        const teachers = await prisma.user.findMany({
            where: { createdById: userId, role: "TEACHER" },
            select: { id: true }
        });
        const teacherIds = teachers.map(t => t.id);
        where.createdById = { in: [userId, ...teacherIds] };
    } else if (role === "TEACHER") {
        const teacher = await prisma.user.findUnique({
            where: { id: userId },
            select: { createdById: true }
        });
        if (teacher?.createdById) {
            where.createdById = teacher.createdById;
        } else {
            const superAdmins = await prisma.user.findMany({
                where: { role: "SUPERADMIN" },
                select: { id: true }
            });
            where.createdById = { in: superAdmins.map(s => s.id) };
        }
    }

    const subjects = await prisma.subject.findMany({
        where,
        include: { teacher: true },
        orderBy: { name: 'asc' }
    });
    return NextResponse.json(subjects);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "SUPERADMIN" && (session.user as any).role !== "ADMIN")) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name } = body;

        if (!name || name.trim() === "") {
            return NextResponse.json({ message: "Subject name is required" }, { status: 400 });
        }

        const subject = await prisma.subject.create({
            data: {
                name,
                createdById: (session.user as any).id
            }
        });
        return NextResponse.json(subject);
    } catch (error) {
        console.error("Error creating subject:", error);
        return NextResponse.json({ message: "Error creating subject" }, { status: 500 });
    }
}
