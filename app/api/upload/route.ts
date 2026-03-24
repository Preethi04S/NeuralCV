import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

async function extractFromPDF(buffer: Buffer): Promise<string> {
  const { extractText } = await import("unpdf");
  const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
  return text;
}

async function extractFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (!allowedTypes.includes(fileType) && !fileName.endsWith(".pdf") && !fileName.endsWith(".docx") && !fileName.endsWith(".doc") && !fileName.endsWith(".txt")) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let text = "";

    if (fileName.endsWith(".pdf") || fileType === "application/pdf") {
      text = await extractFromPDF(buffer);
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc") || fileType.includes("wordprocessingml")) {
      text = await extractFromDOCX(buffer);
    } else {
      text = buffer.toString("utf-8");
    }

    // Clean extracted text
    text = text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract readable text from file. Please try copy-pasting the text instead." },
        { status: 422 }
      );
    }

    if (text.length > 10000) {
      text = text.slice(0, 10000);
    }

    return NextResponse.json({ text, fileName: file.name, charCount: text.length });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process file. Please try copy-pasting the text instead." },
      { status: 500 }
    );
  }
}
