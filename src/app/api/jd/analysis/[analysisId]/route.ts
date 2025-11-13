import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const isFinalized = searchParams.get("finalized");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: any = {
      userId: userId,
    };

    if (isFinalized !== null) {
      where.isFinalized = isFinalized === "true";
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        {
          intakeData: {
            path: ["brand", "name"],
            string_contains: search,
          },
        },
      ];
    }

    const [analyses, total] = await Promise.all([
      prisma.savedAnalysis.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          isFinalized: true,
          finalizedAt: true,
          createdAt: true,
          updatedAt: true,
          analysis: true,
          _count: {
            select: {
              refinements: true,
            },
          },
        },
      }),
      prisma.savedAnalysis.count({ where }),
    ]);

    const formattedAnalyses = analyses.map((analysis) => ({
      id: analysis.id,
      title: analysis.title,
      isFinalized: analysis.isFinalized,
      finalizedAt: analysis.finalizedAt,
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt,
      refinementCount: analysis._count.refinements,
      preview: {
        recommended_role:
          (analysis.analysis as any)?.preview?.recommended_role || "Unknown",
        service_mapping:
          (analysis.analysis as any)?.preview?.service_mapping || "Unknown",
        weekly_hours: (analysis.analysis as any)?.preview?.weekly_hours || 0,
        primary_outcome:
          (analysis.analysis as any)?.preview?.primary_outcome || "",
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        analyses: formattedAnalyses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + analyses.length < total,
        },
      },
    });
  } catch (error) {
    console.error("List analyses error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load analyses",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    // CHANGE: Use await params instead of parsing URL
    const { analysisId } = await params;

    if (!analysisId) {
      return NextResponse.json(
        { success: false, error: "Analysis ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.savedAnalysis.findUnique({
      where: { id: analysisId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    await prisma.savedAnalysis.delete({
      where: { id: analysisId },
    });

    return NextResponse.json({
      success: true,
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    console.error("Delete analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete analysis",
      },
      { status: 500 }
    );
  }
}
