import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { qrData } = await req.json();

        // Parse QR code data
        let studentInfo;
        try {
            studentInfo = JSON.parse(qrData);
        } catch {
            return NextResponse.json({
                success: false,
                message: "Invalid QR code format"
            }, { status: 400 });
        }

        // Fetch student from database
        const student = await prisma.user.findUnique({
            where: { id: studentInfo.id },
            include: {
                currentClass: {
                    include: {
                        teacher: true
                    }
                }
            }
        });

        if (!student || student.role !== "STUDENT") {
            return NextResponse.json({
                success: false,
                message: "Student not found"
            }, { status: 404 });
        }

        const currentUser = session.user as any;

        // Role-based access control
        if (currentUser.role === "SUPERADMIN") {
            // SuperAdmin can see all students
            return NextResponse.json({
                success: true,
                student,
                message: "Student found"
            });
        }
        else if (currentUser.role === "ADMIN") {
            // Admin can only see students they created
            if (student.createdById === currentUser.id) {
                return NextResponse.json({
                    success: true,
                    student,
                    message: "Student found in your school"
                });
            } else {
                return NextResponse.json({
                    success: false,
                    message: "Student not found in your school"
                }, { status: 403 });
            }
        }
        else if (currentUser.role === "TEACHER") {
            // Teacher can only see students in their class
            if (student.currentClass?.teacherId === currentUser.id) {
                return NextResponse.json({
                    success: true,
                    student,
                    message: "Student found in your class"
                });
            } else {
                return NextResponse.json({
                    success: false,
                    message: "Student not found in your class"
                }, { status: 403 });
            }
        }

        return NextResponse.json({
            success: false,
            message: "Access denied"
        }, { status: 403 });

    } catch (error) {
        console.error("QR Scan Error:", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}
