import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Find students who are NOT in any class
        const students = await prisma.user.findMany({
            where: {
                role: "STUDENT",
                classId: null // No class assigned
            },
            select: {
                id: true,
                name: true,
                studentId: true,
                fatherName: true
            },
            orderBy: {
                name: "asc"
            }
        });

        return NextResponse.json(students);
    } catch (error) {
        console.error("Fetch Available Students Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
