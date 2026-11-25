# Taskflow

Görevlerini, notlarını ve çalışma zamanını tek bir yerde yöneten, kurulum gerektirmeyen bir verimlilik uygulaması.

![Taskflow ikonu](icons/icon.svg)

## Özellikler

- **Görevler** — öncelik (yüksek / orta / düşük), kategori, bitiş tarihi, tekrar eden görevler (her gün, hafta içi, haftalık, aylık), alt görevler, arama, akıllı ya da sürükle-bırak sıralama
- **Notlar** — Markdown düzenleyici ve önizleme, `#etiket` desteği, sabitleme, arşiv, çöp kutusu, hazır şablonlar; not içindeki `- [ ]` maddelerini tek tıkla göreve aktarma
- **Takvim** — ay ve hafta görünümü, görevleri sürükleyip başka güne taşıma
- **Odak modu** — Pomodoro sayacı (25/5, 50/10, 15/3 dk), göreve bağlı odak seansları
- **Verimlilik paneli** — son 7 / 30 günün tamamlanan görevleri, odak süresi, çalışma serisi ısı haritası, kategori dağılımı
- **Yedekleme** — tüm verileri `.json` olarak indirme ve geri yükleme
- **Kurulabilir (PWA)** — telefona veya bilgisayara uygulama olarak yüklenebilir, internet olmadan da çalışır

Tüm veriler tarayıcının `localStorage` alanında, yalnızca senin cihazında saklanır; hiçbir sunucuya gönderilmez.

## Çalıştırma

Derleme adımı yok — saf HTML, CSS ve JavaScript.

En kolay yol: `index.html` dosyasını tarayıcıda aç.

Çevrimdışı çalışma ve "Uygulamayı yükle" özelliği için dosyaların bir web sunucusundan açılması gerekir:

```bash
python3 -m http.server 8000
```

Ardından tarayıcıda `http://localhost:8000` adresine git.

## Dosya yapısı

| Dosya | Görevi |
|---|---|
| `index.html` | Sayfa iskeleti |
| `style.css` | Tüm stiller (açık/koyu tema, mobil düzen) |
| `app.js` | Görevler, istatistik kartları, ortak yardımcılar |
| `notes.js` | Not defteri ve Markdown düzenleyici |
| `views.js` | Takvim, odak modu ve verimlilik paneli |
| `sw.js` | Çevrimdışı önbellek (service worker) |
| `manifest.webmanifest` | Uygulama olarak yükleme bilgileri |

## Klavye kısayolları

| Kısayol | İşlev |
|---|---|
| `Alt + N` | Yeni not |
| `Ctrl + K` | Notlarda ara |
| `Ctrl + B` / `Ctrl + I` | Kalın / italik |
| `Boşluk` | Odak modunda başlat / duraklat |
| `Esc` | Açık pencereyi kapat |
