"use client";
import DemoVerticalPage from "@/components/dashboard/DemoVerticalPage";
import { INFRA_DASHBOARD } from "@/lib/data/infra-demo";

export default function InfraDemoPage() {
  return <DemoVerticalPage data={INFRA_DASHBOARD} bgColor="#faf9f6" />;
}
