import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const [studentCount, teacherCount, classCount, financialData] = await Promise.all([
            prisma.user.count({ where: { role: "STUDENT" } }),
            prisma.user.count({ where: { role: "TEACHER" } }),
            prisma.schoolClass.count(),
            prisma.user.aggregate({
                _sum: {
                    receivedAmount: true
                }
            })
        ]);

        return NextResponse.json({
            students: studentCount,
            teachers: teacherCount,
            classes: classCount,
            totalRevenue: financialData._sum?.receivedAmount || 0
        });
    } catch (error) {
        console.error("Fetch stats error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
