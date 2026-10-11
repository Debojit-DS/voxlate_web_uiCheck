import DemoPageClient from "./DemoPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Try the demo — Voxlate",
  description: "Record a short clip and hear it translated. A recorded-clip demo of Voxlate's translation work.",
};

export default function DemoPage() {
  return <DemoPageClient />;
}
