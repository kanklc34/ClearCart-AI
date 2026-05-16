# ClearCart AI — E-Ticaret Güven Denetim Motoru

> Bir ürün linkini yapıştır. Üç bağımsız yapay zeka ajanı tartışır, hakem karar verir.

---

## Nedir?

ClearCart AI, e-ticaret ürün sayfalarını analiz eden çok ajanlı bir denetim sistemidir. Kullanıcı bir ürün URL'si girer; sistem arka planda üç ajan çalıştırır:

- **Savunucu** — Ürünü satın almanın lehine tüm argümanları üretir
- **İtirazçı** — Dark pattern'ları, gizli maliyetleri ve riskleri tespit eder
- **Hakem** — İki tarafı dinleyip tarafsız nihai karar verir: AL / DOĞRULA / KAÇIN

Kararlar ikili (evet/hayır) değildir. Sistem her ürün için 0-100 arası güven skoru üretir ve kararın gerekçesini gösterir.

---

## Ne Çözüyor?

- **Yanıltıcı fiyatlandırma** — Yapay indirimler, üyeliğe özel gizli fiyatlar
- **Dark pattern tespiti** — Yapay aciliyet, yanıltıcı stok sinyalleri, sosyal kanıt manipülasyonu
- **Politika şeffaflığı** — Eksik iade/garanti bilgileri, gizli koşullar

---

## Mimari

```
URL → Orchestrator (doğrulama) → Scraper (veri çekme)
    → Savunucu + İtirazçı (paralel)
    → Hakem (nihai karar)
    → SSE stream ile frontend'e canlı aktarım
```

Tüm ajanlar Google Gemini API kullanır. Savunucu ve İtirazçı paralel çalışır (`asyncio.gather`), bu da analiz süresini yaklaşık %50 kısaltır.

---

## Teknik Yığın

**Backend**
- Python, FastAPI, Uvicorn
- Google Gemini (gemini-2.5-flash — model + API key fallback zinciri)
- Playwright (bot koruması aşan scraper)
- SSE (Server-Sent Events) ile gerçek zamanlı akış

**Frontend**
- React 19, TypeScript, Vite
- Tailwind CSS v4
- Framer Motion

---

## Kurulum

### Gereksinimler
- Python 3.11+
- Node.js 18+
- Google Gemini API key ([buradan al](https://aistudio.google.com))

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
playwright install chromium
```

`.env` dosyası oluştur:
```
GEMINI_API_KEY=your_key_here
GEMINI_API_KEY_2=your_second_key_here  # opsiyonel
```

```bash
python -m uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Kullanım

1. Backend ve frontend'i başlat
2. Tarayıcıda `http://localhost:5173` aç
3. Trendyol, Hepsiburada veya Amazon ürün linkini yapıştır
4. "Tara" butonuna tıkla
5. Ajanların canlı tartışmasını izle, hakem kararını gör

---

## Proje Yapısı

```
clearcart-ai/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── orchestrator.py
│   │   │   ├── advocate_agent.py
│   │   │   ├── devils_advocate_agent.py
│   │   │   └── judge_agent.py
│   │   ├── services/
│   │   │   ├── gemini_service.py
│   │   │   └── scraper_service.py
│   │   ├── api/
│   │   │   └── analysis.py
│   │   └── main.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.tsx
        └── components/
```

---

## Desteklenen Platformlar

- Trendyol
- Hepsiburada (şeffaflık ihlali olarak raporlanır)
- Amazon
- N11 ve diğer platformlar (genel scraper)

---

*ClearCart AI — BTK Akademi Hacksathon 2026*