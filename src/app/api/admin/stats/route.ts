import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SUPERADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const [
            totalStudents,
            totalTeachers,
            totalAdmins,
            totalClasses,
            totalSubjects,
            totalAmount
        ] = await Promise.all([
            prisma.user.count({ where: { role: "STUDENT" } }),
            prisma.user.count({ where: { role: "TEACHER" } }),
            prisma.user.count({ where: { role: "ADMIN" } }),
            prisma.schoolClass.count(),
            prisma.subject.count(),
            prisma.user.aggregate({
                _sum: {
                    receivedAmount: true
                }
            })
        ]);

        return NextResponse.json({
            students: totalStudents,
            teachers: totalTeachers,
            admins: totalAdmins,
            classes: totalClasses,
            subjects: totalSubjects,
            totalAmount: totalAmount._sum.receivedAmount || 0
        });
    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ message: "Error fetching stats" }, { status: 500 });
    }
}
