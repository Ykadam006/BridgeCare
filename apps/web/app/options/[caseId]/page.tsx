import { Metadata } from "next";
import CareOptionsClient from "../CareOptionsClient";

export const metadata: Metadata = { title: "Care options" };

export default async function OptionsPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return <CareOptionsClient caseId={caseId} />;
}
