import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                image: true,
                jobTitle: true,
                experience: true,
                joinedDate: true,
                createdAt: true,
            }
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Fetch Profile Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const data = await req.json();

        const {
            name,
            email,
            password,
            phone,
            image,
            jobTitle,
            experience
        } = data;

        const updateData: any = {
            name,
            email,
            phone,
            image,
            jobTitle,
            experience
        };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                image: true,
                jobTitle: true,
                experience: true,
                createdAt: true,
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Update Profile Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
