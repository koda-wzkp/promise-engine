"use client";
import DemoVerticalPage from "@/components/dashboard/DemoVerticalPage";
import { AI_DASHBOARD } from "@/lib/data/ai-demo";

export default function AIDemoPage() {
  return <DemoVerticalPage data={AI_DASHBOARD} bgColor="#f5f0eb" />;
}
