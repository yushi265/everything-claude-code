# Pythonセキュリティ

> このファイルは [common/security.md](../common/security.md) をPython固有のコンテンツで拡張します。

## 秘密情報管理

```python
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ["OPENAI_API_KEY"]  # 欠落している場合はKeyErrorを発生
```

## セキュリティスキャン

- 静的セキュリティ分析には **bandit** を使用：
  ```bash
  bandit -r src/
  ```

## リファレンス

スキルを参照：Django固有のセキュリティガイドライン（該当する場合）については `django-security` を参照してください。
