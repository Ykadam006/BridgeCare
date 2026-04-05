import { Metadata } from "next";
import ResultsClient from "./ResultsClient";

export const metadata: Metadata = { title: "Your check-in result" };

export default async function ResultsPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return <ResultsClient caseId={caseId} />;
}
