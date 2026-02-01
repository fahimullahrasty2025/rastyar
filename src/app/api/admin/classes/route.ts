import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET all classes for the school
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const role = (session.user as any).role;
        const userId = (session.user as any).id;

        let where: any = {};

        if (role === "ADMIN") {
            // Admin sees classes they created OR classes created by their teachers
            const teachers = await prisma.user.findMany({
                where: { createdById: userId, role: "TEACHER" },
                select: { id: true }
            });
            const teacherIds = teachers.map(t => t.id);
            where.createdById = { in: [userId, ...teacherIds] };
        } else if (role === "TEACHER") {
            // Teacher sees classes from their creator
            const teacher = await prisma.user.findUnique({
                where: { id: userId },
                select: { createdById: true }
            });

            if (teacher?.createdById) {
                // If created by someone (Admin or SuperAdmin), show those classes
                where.createdById = teacher.createdById;
            } else {
                // Self-registered teacher: show SuperAdmin classes
                const superAdmins = await prisma.user.findMany({
                    where: { role: "SUPERADMIN" },
                    select: { id: true }
                });
                where.createdById = { in: superAdmins.map(s => s.id) };
            }
        } else if (role === "SUPERADMIN") {
            // SuperAdmin sees everything
            where = {};
        } else {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const classes = await prisma.schoolClass.findMany({
            where,
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
            level,
            section,
            gender,
            teacherId,
            studentIds,
            subjectIds,
            academicYear // Added year
        } = data;

        if (!level || !section || !gender) {
            return NextResponse.json({ message: "Missing required fields (level, section, gender)" }, { status: 400 });
        }

        const creatorId = (session.user as any).id;
        const year = academicYear || "1403"; // Default if not provided

        // 1. Check for duplicates in the SAME year for the SAME school (creator)
        const existingClass = await prisma.schoolClass.findFirst({
            where: {
                level: level,
                section: section,
                gender: gender,
                academicYear: year,
                createdById: creatorId
            }
        });

        if (existingClass) {
            return NextResponse.json({
                message: `Class "${level} - ${section} (${gender})" already exists for year ${year}.`
            }, { status: 400 });
        }

        // 2. Create the SchoolClass
        const newClass = await prisma.schoolClass.create({
            data: {
                name: `${level} - ${section}`,
                level: level,
                section: section,
                gender: gender,
                academicYear: year,
                teacherId: teacherId || null,
                createdById: creatorId,
                subjects: {
                    connect: (subjectIds || []).map((id: string) => ({ id }))
                },
                students: {
                    connect: (studentIds || []).map((id: string) => ({ id }))
                }
                // Optional: Create initial enrollments for history
            }
        });

        // 3. Create historical enrollment records
        if (studentIds && studentIds.length > 0) {
            await Promise.all(studentIds.map((sId: string) =>
                prisma.enrollment.upsert({
                    where: { studentId_academicYear: { studentId: sId, academicYear: year } },
                    update: { classId: newClass.id },
                    create: { studentId: sId, classId: newClass.id, academicYear: year }
                })
            ));
        }

        return NextResponse.json({ message: "Class created successfully", class: newClass }, { status: 201 });
    } catch (error) {
        console.error("Class Creation Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
