import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET all classes for the school
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const classes = await prisma.schoolClass.findMany({
            include: {
                teacher: {
                    select: { name: true }
                },
                _count: {
                    select: { students: true }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(classes);
    } catch (error) {
        console.error("Fetch Classes Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// REGISTER a new class
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const {
            level, // Changed from categoryId to level
            section,
            gender,
            teacherId,
            studentIds,
            subjectIds // Added to allow selecting subjects
        } = data;

        if (!level || !section || !gender) {
            return NextResponse.json({ message: "Missing required fields (level, section, gender)" }, { status: 400 });
        }

        // 1. Check for duplicates (same level, section, and gender)
        const existingClass = await prisma.schoolClass.findFirst({
            where: {
                level: level,
                section: section,
                gender: gender
            }
        });

        if (existingClass) {
            return NextResponse.json({
                message: `Class "${level} - ${section} (${gender})" already exists.`
            }, { status: 400 });
        }

        // 2. Create the SchoolClass
        const newClass = await prisma.schoolClass.create({
            data: {
                name: `${level} - ${section}`,
                level: level,
                section: section,
                gender: gender,
                teacherId: teacherId || null,
                // Link subjects if provided
                subjects: {
                    connect: (subjectIds || []).map((id: string) => ({ id }))
                },
                // Link selected students
                students: {
                    connect: (studentIds || []).map((id: string) => ({ id }))
                }
            }
        });

        return NextResponse.json({ message: "Class created successfully", class: newClass }, { status: 201 });
    } catch (error) {
        console.error("Class Creation Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
