import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-(--container-content) px-gutter py-section">
      <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-fg-muted">주소가 바뀌었거나 비공개로 전환된 페이지일 수 있습니다.</p>
      <Link href="/" className="mt-6 inline-block text-accent-text underline underline-offset-4">
        홈으로 이동
      </Link>
    </main>
  );
}
