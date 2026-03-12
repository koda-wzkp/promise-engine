"use client";
import DemoVerticalPage from "@/components/dashboard/DemoVerticalPage";
import { WOD_DASHBOARD } from "@/lib/data/war-on-drugs-demo";

export default function WarOnDrugsDemoPage() {
  return <DemoVerticalPage data={WOD_DASHBOARD} bgColor="#f8f5f0" />;
}
