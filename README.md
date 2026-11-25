# Taskflow

Görevlerini, notlarını ve çalışma zamanını tek bir yerde yöneten, kurulum gerektirmeyen bir verimlilik uygulaması.

![Taskflow ikonu](icons/icon.svg)

## Özellikler

- **Görevler** — öncelik (yüksek / orta / düşük), kategori, bitiş tarihi ve saati, tekrar eden görevler (her gün, hafta içi, haftalık, aylık), alt görevler, arama, akıllı ya da sürükle-bırak sıralama
- **Hızlı ekleme** — `yarın 14:00 rapor gönder !yüksek #iş` yazınca tarih, saat, öncelik ve kategori kendiliğinden doldurulur (aşağıdaki tabloya bak)
- **Bugün görünümü** — yalnızca bugünün ve geciken görevlerin listesi; önce gecikenler, sonra saate göre sıralı
- **Hatırlatıcılar** — saati olan görevler için zamanında, 5/15/30 dk, 1 saat ya da 1 gün önce bildirim; bildirimden 10 dakika erteleme
- **Kategoriler** — kendi kategorilerini ekle, yeniden adlandır, rengini seç, sil; kenar çubuğundan kategoriye göre filtrele
- **Geri al** — silme, tamamlama, düzenleme, sıralama ve kategori değişikliklerini `Ctrl + Z` ya da bildirimdeki “Geri al” ile geri al
- **Açık / koyu tema** — cihaz ayarını izler ya da elle seçilir
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
| `style.css` | Tüm stiller (açık / koyu tema, mobil düzen) |
| `app.js` | Görevler, istatistik kartları, ortak yardımcılar |
| `notes.js` | Not defteri ve Markdown düzenleyici |
| `views.js` | Takvim, odak modu ve verimlilik paneli |
| `sw.js` | Çevrimdışı önbellek (service worker) |
| `manifest.webmanifest` | Uygulama olarak yükleme bilgileri |

## Hızlı ekleme sözdizimi

Görev kutusuna yazdıklarından şunlar algılanır ve başlıktan çıkarılır. Algılananlar kutunun altında önizlenir.

| Yazdığın | Anlamı |
|---|---|
| `!yüksek` `!orta` `!düşük` (ya da `!y` `!o` `!d`, `!1` `!2` `!3`) | Öncelik |
| `#iş`, `#Sağlık` | Kategori — yoksa yeni kategori oluşturulur |
| `bugün`, `yarın`, `öbür gün`, `haftaya`, `3 gün sonra` | Tarih |
| `pazartesi` … `pazar`, `cuma günü` | O haftanın ilgili günü |
| `3 aralık`, `12.12`, `05.01.2027` | Belirli tarih |
| `14:00`, `9:30'da`, `saat 7`, `bu akşam` | Saat (tarih yoksa bugün) |
| `her gün`, `hafta içi`, `her hafta`, `her ay`, `her pazartesi` | Tekrar |

## Hatırlatıcılar hakkında

Hatırlatmalar tarayıcının bildirim izniyle gösterilir; ilk hatırlatmayı kurduğunda izin istenir. Uygulamanın bir sunucusu olmadığı için bildirimler yalnızca **Taskflow bir sekmede ya da yüklü uygulama olarak açıkken** (arka planda da olabilir) çalışır. Uygulama tamamen kapalıyken kaçırılan hatırlatma, açıldığında (6 saat içindeyse) gösterilir.

## Klavye kısayolları

| Kısayol | İşlev |
|---|---|
| `Ctrl + Z` | Son işlemi geri al (görevler ve kategoriler) |
| `Alt + N` | Yeni not |
| `Ctrl + K` | Notlarda ara |
| `Ctrl + B` / `Ctrl + I` | Kalın / italik |
| `Boşluk` | Odak modunda başlat / duraklat |
| `Esc` | Açık pencereyi kapat |
