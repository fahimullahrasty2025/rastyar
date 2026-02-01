
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        let settings = await prisma.schoolSettings.findFirst();
        if (!settings) {
            // Create default settings if not exists
            settings = await prisma.schoolSettings.create({
                data: {
                    schoolName: "لیسه عالی خصوصی نیکان",
                    headerTitle1: "وزارت معارف",
                    headerTitle2: "ریاست معارف ولایت کابل",
                    headerTitle3: "آمریت معارف حوزه دوازدهم تعلیمی",
                }
            });
        }
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching settings" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN")) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const settings = await prisma.schoolSettings.findFirst();

        if (settings) {
            const updated = await prisma.schoolSettings.update({
                where: { id: settings.id },
                data: body
            });
            return NextResponse.json(updated);
        } else {
            const created = await prisma.schoolSettings.create({
                data: body
            });
            return NextResponse.json(created);
        }
    } catch (error) {
        console.error("Error saving settings:", error);
        return NextResponse.json({ message: "Error saving settings" }, { status: 500 });
    }
}
