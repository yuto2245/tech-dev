import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-bold text-slate-900">ページが見つかりません</h1>
      <p className="text-sm text-slate-600">
        お探しのTechDevコンテンツは削除されたか、URLが変更されている可能性があります。
      </p>
      <Link href="/" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500">
        トップページに戻る
      </Link>
    </div>
  );
}
