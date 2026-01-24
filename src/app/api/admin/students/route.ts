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

        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const students = await prisma.user.findMany({
            where: {
                role: "STUDENT"
            },
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
                id: "desc"
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

        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN")) {
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
