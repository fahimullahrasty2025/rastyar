import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        const path = join(process.cwd(), "public", "uploads", filename);

        await writeFile(path, buffer);
        console.log(`File uploaded to: ${path}`);

        return NextResponse.json({
            message: "File uploaded successfully",
            url: `/uploads/${filename}`
        }, { status: 201 });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
