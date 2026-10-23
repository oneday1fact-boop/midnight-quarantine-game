# 午夜禁區：食人醫生

手機優先的恐怖文字選擇遊戲原型，可部署到 GitHub Pages。

## 檔案
- `index.html`：遊戲介面及樣式
- `game.js`：故事分支、物品、生命、警戒、電量及本地存檔
- `manifest.webmanifest`：漸進式網頁應用基本設定
- `icon.svg`：簡單圖示

## 在 GitHub Pages 發佈
1. 登入 GitHub，建立一個新的 **Public** repository，例如 `midnight-quarantine`。
2. 將本資料夾內的四個檔案上傳到 repository 根目錄（不要只上傳 ZIP）。
3. 打開 repository 的 **Settings → Pages**。
4. 在 **Build and deployment** 選擇 **Deploy from a branch**。
5. Branch 選 `main`，資料夾選 `/(root)`，按 **Save**。
6. 等待 GitHub Pages 完成部署，再開啟 Pages 顯示的網址。

## 本地測試
直接用瀏覽器開啟 `index.html` 即可測試主要遊戲功能。若要測試 PWA/manifest，建議使用 HTTPS 託管網址。

## 目前原型的限制
- 怪物追逐以故事狀態與警戒值模擬，尚未有真正即時尋路或 AI API。
- 音效按鈕只記錄設定，尚未加入音樂或音效素材。
- 目前使用 CSS 場景插畫，不依賴外部圖片網址。
- 存檔使用瀏覽器 localStorage；不同裝置/瀏覽器之間不會自動同步。

## 日後包裝成 Android App
可用 Capacitor 包裝網頁前端。一般需要 Node.js、Android Studio 及 Android SDK，並在可使用相關工具的電腦或雲端建置環境執行。建議先完成網頁版測試，再開始 Android 建置。


V4 新增：短暫紅色閃光、監視器掃描線雜訊、醫生照片突現效果，以及高解析度圖片資產。


## V5（分階段第一階段）
- 加入醫生距離／警戒追蹤：噪音和高警戒令醫生更接近，重複使用藏身處可能被搜查。
- 加入突發紅光、監視器雜訊及醫生照片閃現時的音效。
- 加入以 Web Audio 即時合成的低頻心跳、電流雜訊及驚嚇音；不依賴外部音效檔或網絡。
- 保留多重結局，並改善結局提示文字。
- 圖片資產保留高品質 JPEG，支援 GitHub Pages 靜態部署。
