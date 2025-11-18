---
title: "CodeBlockコンポーネントで読みやすい技術記事を書く"
description: "コピー可能なコードと行番号で記事の可読性を上げるためのチートシートです。"
publishedAt: "2025-02-13"
topics:
  - Documentation
  - UI/UX
emoji: "💡"
author: "Tech Dev Team"
heroImage: "https://images.unsplash.com/photo-1484417894907-623942c8ee29"
---

コピーボタンと行番号が付いたコードブロックは、読者の手を止めません。新しい `CodeBlock` は ` ```ts ` のように言語を指定するだけで自動的にハイライトされます。

```tsx
<CodeBlock code={example} language="tsx">
  <CodeBlockCopyButton />
</CodeBlock>
```

## 記事内での使い分け

- アルゴリズムや設定ファイルなど長いコードは行番号を活かす
- シェルコマンドは `language="bash"` で背景が差し替わる
- 埋め込みリンクは ` ```link-card ` ブロックでカード状に表示

細かい工夫の積み重ねがコンテンツの信頼性につながります。
