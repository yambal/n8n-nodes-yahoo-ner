# n8n-nodes-yahoo-ner

Yahoo! Japan 固有表現抽出（NER: Named Entity Recognition）API を使用した n8n カスタムノード。

日本語テキストから人名・地名・組織名などの固有表現を自動抽出します。

## 機能

- 日本語テキストから8種類の固有表現を抽出
  - ORGANIZATION（組織名）
  - PERSON（人名）
  - LOCATION（地名）
  - ARTIFACT（固有物名）
  - DATE（日付表現）
  - TIME（時間表現）
  - MONEY（金額表現）
  - PERCENT（割合表現）
- エンティティタイプでフィルタリング可能
- 出力形式を選択可能（完全版、テキストのみ、タイプ別グループ）

## 前提条件

Yahoo! Japan Developer Network でアプリケーションを登録し、Client ID を取得してください。

https://developer.yahoo.co.jp/start/

## インストール

### n8n Community Nodes

1. n8n の Settings → Community Nodes を開く
2. `n8n-nodes-yahoo-ner` を検索してインストール

### 手動インストール

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-yahoo-ner
```

## 設定

### Credentials

1. n8n で Credentials → New Credential を作成
2. 「Yahoo! Japan API」を選択
3. Client ID（アプリケーションID）を入力

### ノードパラメータ

| パラメータ | 説明 |
|-----------|------|
| Text | 固有表現を抽出するテキスト（最大4KB） |
| Output Format | 出力形式（Full / Text Only / Grouped by Type） |
| Filter by Entity Types | 抽出するエンティティタイプを選択（空の場合は全タイプ） |

## 出力例

### Full Format

```json
{
  "entities": [
    { "text": "田中太郎", "type": "PERSON", "offset": 0, "length": 4 },
    { "text": "東京", "type": "LOCATION", "offset": 6, "length": 2 },
    { "text": "株式会社ABC", "type": "ORGANIZATION", "offset": 10, "length": 7 }
  ],
  "originalText": "田中太郎さんは東京の株式会社ABCに勤務しています。",
  "count": 3
}
```

### Text Only Format

```json
{
  "entities": ["田中太郎", "東京", "株式会社ABC"],
  "originalText": "...",
  "count": 3
}
```

### Grouped by Type Format

```json
{
  "entities": {
    "PERSON": ["田中太郎"],
    "LOCATION": ["東京"],
    "ORGANIZATION": ["株式会社ABC"]
  },
  "originalText": "...",
  "count": 3
}
```

## エンティティタイプ

| タイプ | 説明 | 例 |
|--------|------|-----|
| ORGANIZATION | 組織名 | 株式会社ABC、東京大学 |
| PERSON | 人名 | 田中太郎、山田花子 |
| LOCATION | 地名 | 東京、渋谷区、富士山 |
| ARTIFACT | 固有物名 | iPhone、Windows |
| DATE | 日付表現 | 2024年1月1日、来週 |
| TIME | 時間表現 | 午後3時、15:00 |
| MONEY | 金額表現 | 1000円、100ドル |
| PERCENT | 割合表現 | 50%、3割 |

## API 制限

- リクエストサイズ: 最大 4KB

## ライセンス

MIT
