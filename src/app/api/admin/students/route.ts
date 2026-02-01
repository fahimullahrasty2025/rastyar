import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { generateQRCode } from "@/lib/qrcode";

// GET all students
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN" && (session.user as any).role !== "TEACHER")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const role = (session.user as any).role;
        const userId = (session.user as any).id;

        let where: any = { role: "STUDENT" };

        if (role === "ADMIN") {
            // Admin sees students they created OR students created by their teachers
            const teachers = await prisma.user.findMany({
                where: { createdById: userId, role: "TEACHER" },
                select: { id: true }
            });
            const teacherIds = teachers.map(t => t.id);
            where.createdById = { in: [userId, ...teacherIds] };
        } else if (role === "TEACHER") {
            // Teacher sees students from their creator
            const teacher = await prisma.user.findUnique({
                where: { id: userId },
                select: { createdById: true }
            });

            if (teacher?.createdById) {
                // If created by an Admin, show Admin's students (and other students the teacher might have created)
                // Actually, for consistency, show students created by the Admin + students created by the Admin's other teachers?
                // The request says "list of students from that manager"
                where.createdById = teacher.createdById;
            } else {
                // Self-registered teacher: show SuperAdmin students
                const superAdmins = await prisma.user.findMany({
                    where: { role: "SUPERADMIN" },
                    select: { id: true }
                });
                where.createdById = { in: superAdmins.map(s => s.id) };
            }
        } else if (role === "SUPERADMIN") {
            // SuperAdmin sees all students
            where = { role: "STUDENT" };
        } else {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const students = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                studentId: true,
                fatherName: true,
                grandfatherName: true,
                classId: true,
                image: true,
                currentClass: {
                    select: {
                        name: true,
                        level: true
                    }
                },
                createdAt: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(students);
    } catch (error) {
        console.error("Fetch Students Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// REGISTER a new student
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN" && (session.user as any).role !== "TEACHER")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const {
            name,
            email,
            password,
            fatherName,
            grandfatherName,
            studentId,
            surname,
            tazkiraNo,
            nameEn,
            fatherNameEn,
            grandfatherNameEn,
            surnameEn,
            permanentAddress,
            currentAddress,
            paternalUncle,
            maternalUncle,
            paternalCousin,
            maternalCousin,
            image,
            classId
        } = data;

        // Basic validation
        if (!name || !studentId) {
            return NextResponse.json({ message: "Name and Student ID are required" }, { status: 400 });
        }

        // Check if studentId already exists
        const existingStudent = await prisma.user.findUnique({
            where: { studentId },
        });

        if (existingStudent) {
            return NextResponse.json({ message: "Student ID already exists" }, { status: 400 });
        }

        // Hash password if provided, otherwise use a default (studentId)
        const hashedPassword = await bcrypt.hash(password || studentId, 10);

        const student = await prisma.user.create({
            data: {
                name,
                email: email || `${studentId}@maktabyar.com`, // Fallback email
                password: hashedPassword,
                role: "STUDENT",
                fatherName,
                grandfatherName,
                studentId,
                surname,
                tazkiraNo,
                nameEn,
                fatherNameEn,
                grandfatherNameEn,
                surnameEn,
                permanentAddress,
                currentAddress,
                paternalUncle,
                maternalUncle,
                paternalCousin,
                maternalCousin,
                image,
                classId,
                createdById: (session.user as any).id,
            },
        });

        // Generate QR Code for the student
        const qrCode = await generateQRCode({
            id: student.id,
            name: student.name,
            email: student.email,
            role: student.role,
            studentId: student.studentId,
            createdAt: student.createdAt
        });

        // Update student with QR code
        const updatedStudent = await prisma.user.update({
            where: { id: student.id },
            data: { qrCode }
        });

        return NextResponse.json({ message: "Student registered successfully", student: updatedStudent }, { status: 201 });
    } catch (error) {
        console.error("Student Registration Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
