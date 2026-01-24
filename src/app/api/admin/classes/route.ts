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
            categoryId, // This represents the Grade Level from SuperAdmin
            section,
            gender,
            teacherId,
            studentIds
        } = data;

        // 1. Get Category (Grade Level) to info
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: { subjects: true }
        });

        if (!category) {
            return NextResponse.json({ message: "Invalid Class Level Selected" }, { status: 400 });
        }

        // 1b. Check for duplicates (same grade, section, and gender)
        const existingClass = await prisma.schoolClass.findFirst({
            where: {
                level: category.name,
                section: section,
                gender: gender
            }
        });

        if (existingClass) {
            return NextResponse.json({
                message: `Class "${category.name} - ${section} (${gender})" already exists.`
            }, { status: 400 });
        }

        // 2. Create the SchoolClass
        const newClass = await prisma.schoolClass.create({
            data: {
                name: `${category.name} - ${section}`,
                level: category.name,
                section: section,
                gender: gender,
                teacherId: teacherId || null,
                // Link subjects from the category
                subjects: {
                    connect: category.subjects.map(s => ({ id: s.id }))
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
