import Link from "next/link";

export default function SelfHelpLink({ className }: { className?: string }) {
  return (
    <Link href="/self-help-hub" className={className || "self-help-link"} aria-label="Open Self-Help Hub">
      <span role="img" aria-hidden>🧭</span>
      <span style={{ marginLeft: 8 }}>Self-Help Hub</span>
    </Link>
  );
}
