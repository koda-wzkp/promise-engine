"use client";
import DemoVerticalPage from "@/components/dashboard/DemoVerticalPage";
import { SC_DASHBOARD } from "@/lib/data/supply-chain-demo";

export default function SupplyChainDemoPage() {
  return <DemoVerticalPage data={SC_DASHBOARD} bgColor="#faf9f6" />;
}
