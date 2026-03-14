import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import {
  AnnotatedPromise,
  BillMeta,
  BillTrainingData,
  TrainingManifest,
} from "@/lib/types/annotation";

interface SaveRequest {
  billSlug: string;
  billMeta: BillMeta;
  promise: AnnotatedPromise;
  action: "accept" | "reject" | "skip";
}

export async function POST(req: NextRequest) {
  try {
    const { billSlug, billMeta, promise, action } =
      (await req.json()) as SaveRequest;

    if (!billSlug || !promise || !action) {
      return Response.json(
        { error: "billSlug, promise, and action required" },
        { status: 400 }
      );
    }

    const trainingDir = path.join(process.cwd(), "data", "training");
    fs.mkdirSync(trainingDir, { recursive: true });

    const billFile = path.join(trainingDir, `${billSlug}.json`);
    const manifestFile = path.join(trainingDir, "manifest.json");

    // Read existing bill data or initialize
    let billData: BillTrainingData;
    if (fs.existsSync(billFile)) {
      billData = JSON.parse(fs.readFileSync(billFile, "utf-8"));
    } else {
      billData = {
        bill: billMeta,
        stats: {
          totalCandidates: 0,
          accepted: 0,
          edited: 0,
          rejected: 0,
          skipped: 0,
        },
        promises: [],
      };
    }

    // Upsert by original candidate ID
    const idx = billData.promises.findIndex(
      (p) =>
        p._annotation.originalExtraction.id ===
        promise._annotation.originalExtraction.id
    );
    if (idx >= 0) {
      billData.promises[idx] = promise;
    } else {
      billData.promises.push(promise);
    }

    // Recompute stats
    billData.stats = {
      totalCandidates: billData.promises.length,
      accepted: billData.promises.filter(
        (p) => p._annotation.annotationStatus === "accepted"
      ).length,
      edited: billData.promises.filter((p) => p._annotation.wasEdited).length,
      rejected: billData.promises.filter(
        (p) => p._annotation.annotationStatus === "rejected"
      ).length,
      skipped: billData.promises.filter(
        (p) => p._annotation.annotationStatus === "skipped"
      ).length,
    };

    fs.writeFileSync(billFile, JSON.stringify(billData, null, 2));

    // Update manifest
    let manifest: TrainingManifest;
    if (fs.existsSync(manifestFile)) {
      manifest = JSON.parse(fs.readFileSync(manifestFile, "utf-8"));
    } else {
      manifest = { lastUpdated: "", totalVerifiedPromises: 0, bills: [] };
    }

    const billEntry = manifest.bills.find((b) => b.slug === billSlug);
    const acceptedCount = billData.stats.accepted;

    if (billEntry) {
      billEntry.promiseCount = acceptedCount;
      billEntry.status =
        billData.stats.skipped > 0 ? "in-progress" : "complete";
      billEntry.lastAnnotatedAt = new Date().toISOString();
    } else {
      manifest.bills.push({
        slug: billSlug,
        name: billMeta.name,
        jurisdiction: billMeta.jurisdiction,
        status: "in-progress",
        promiseCount: acceptedCount,
        source: "annotated",
        lastAnnotatedAt: new Date().toISOString(),
      });
    }

    manifest.totalVerifiedPromises = manifest.bills.reduce(
      (sum, b) => sum + (b.promiseCount || 0),
      0
    );
    manifest.lastUpdated = new Date().toISOString();

    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));

    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
