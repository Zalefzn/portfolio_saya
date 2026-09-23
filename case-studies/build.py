"""Generates the static case study pages from the data below.

Run from the repo root:  python case-studies/build.py
Every text has an English and an Indonesian version; the page shows the one
matching the language saved by the portfolio.
"""
import html
import json
import os

SITE = "https://portfolio-rizal-liart.vercel.app"
OUT = os.path.dirname(os.path.abspath(__file__))

CASES = [
    {
        "slug": "fukumaru-travel",
        "title": ("Fukumaru Travel", "Fukumaru Travel"),
        "eyebrow": ("Freelance · Full-stack", "Freelance · Full-stack"),
        "lead": (
            "A booking platform for domestic and international tour packages where customers pay a down payment first and the rest in installments.",
            "Platform pemesanan paket wisata dalam dan luar negeri, di mana pelanggan cukup membayar DP lalu melunasi sisanya dengan cicilan.",
        ),
        "meta": [
            (("Role", "Peran"), ("Full-stack developer", "Full-stack developer")),
            (("Client", "Klien"), ("Fukumaru Travel", "Fukumaru Travel")),
            (("Type", "Jenis"), ("Freelance project", "Proyek freelance")),
            (("Status", "Status"), ("Live", "Live")),
        ],
        "live": "https://fukumarutravel.com/",
        "hero": ("fukumaru-travel.webp", ("Home page", "Halaman utama")),
        "overview": [
            (
                "Fukumaru Travel sells tour packages to destinations such as Bali, Labuan Bajo, Raja Ampat, Japan and Europe. The site had to do more than list trips: it needed to support online marketing of the packages and let customers book and pay over time.",
                "Fukumaru Travel menjual paket wisata ke destinasi seperti Bali, Labuan Bajo, Raja Ampat, Jepang, dan Eropa. Website-nya tidak cukup hanya menampilkan daftar perjalanan: harus mendukung pemasaran paket secara online dan memungkinkan pelanggan memesan serta membayar secara bertahap.",
            ),
        ],
        "built": [
            ("A tour package catalog with destination details, pricing and itinerary.", "Katalog paket wisata lengkap dengan detail destinasi, harga, dan itinerary."),
            ("Search and filters for packages by destination and budget.", "Fitur pencarian dan filter paket berdasarkan destinasi dan anggaran."),
            ("An online booking flow for prospective customers.", "Alur pemesanan paket wisata online untuk calon pelanggan."),
            ("Down payment first, the rest paid in installments.", "Sistem bayar DP dulu, sisanya dicicil bertahap."),
            ("A customer account area (sign up and log in) to follow bookings.", "Area akun pelanggan (daftar dan login) untuk memantau pemesanan."),
        ],
        "stack": ["Laravel", "Inertia.js", "React", "Vite"],
        "gallery": [("fukumaru-travel-login.webp", ("Customer log in", "Login pelanggan"))],
    },
    {
        "slug": "ardana-perkasa-enterprise",
        "title": ("Enterprise systems at PT Ardana Perkasa Group", "Sistem enterprise di PT Ardana Perkasa Group"),
        "eyebrow": ("Full-time · Full-stack", "Full-time · Full-stack"),
        "lead": (
            "A suite of internal systems for a business group: HR, finance, inventory, assurance and school reporting, built and maintained as one developer on the team.",
            "Rangkaian sistem internal untuk sebuah grup usaha: SDM, keuangan, inventaris, asuransi, dan raport sekolah, dibangun dan dipelihara sebagai developer di tim.",
        ),
        "meta": [
            (("Role", "Peran"), ("Full-stack developer", "Full-stack developer")),
            (("Company", "Perusahaan"), ("PT Ardana Perkasa Group", "PT Ardana Perkasa Group")),
            (("Period", "Periode"), ("Nov 2025 – present", "Nov 2025 – sekarang")),
            (("Systems", "Sistem"), ("6 enterprise systems", "6 sistem enterprise")),
        ],
        "live": None,
        "hero": ("hris-apg.webp", ("HRIS APG", "HRIS APG")),
        "overview": [
            (
                "PT Ardana Perkasa Group runs several business units that each need their own internal system. I develop and maintain six of them: Prada BC System, DWP Assurance, Caraka Broker, the Inventory System, HRIS and the Finance System.",
                "PT Ardana Perkasa Group memiliki beberapa unit usaha yang masing-masing membutuhkan sistem internal sendiri. Saya mengembangkan dan memelihara enam di antaranya: Prada BC System, DWP Assurance, Caraka Broker, Sistem Inventaris, HRIS, dan Finance System.",
            ),
            (
                "The work spans both ends of the stack and the space between: designing the data model and REST APIs that several modules share, building the interfaces, and taking features through QA and deployment.",
                "Pekerjaannya mencakup seluruh stack: merancang model data dan REST API yang dipakai bersama oleh beberapa modul, membangun antarmuka, hingga membawa fitur melewati QA dan deployment.",
            ),
        ],
        "built": [
            ("Frontends in React.js and Vue.js; backends in Laravel and Spring Boot.", "Frontend dengan React.js dan Vue.js; backend dengan Laravel dan Spring Boot."),
            ("REST APIs and database structures that serve modules across the company.", "REST API dan struktur database yang melayani modul di seluruh perusahaan."),
            ("Integration, scalability and performance across the platforms.", "Integrasi, skalabilitas, dan performa di seluruh platform."),
            ("Deployment and maintenance of live systems together with the product and QA teams.", "Deployment dan pemeliharaan sistem yang sudah berjalan bersama tim produk dan QA."),
        ],
        "stack": ["Laravel", "Inertia.js", "React", "Vue.js", "Spring Boot", "Tailwind"],
        "gallery": [
            ("dwp-bpr-bonding.webp", ("DWP Core", "DWP Core")),
            ("finance-bpr-bonding.webp", ("Finance System", "Finance System")),
            ("inventaris-apg.webp", ("Inventory System", "Sistem Inventaris")),
            ("raport-pradabc.webp", ("Prada BC report cards", "Raport Prada BC")),
        ],
    },
    {
        "slug": "hris-digivise",
        "title": ("HRIS Digivise", "HRIS Digivise"),
        "eyebrow": ("Full-time · Full-stack", "Full-time · Full-stack"),
        "lead": (
            "A human resource management system covering employees, attendance, payroll and reporting, with payroll calculated automatically from attendance.",
            "Sistem manajemen SDM yang mencakup data karyawan, absensi, penggajian, dan pelaporan, dengan gaji yang dihitung otomatis dari data absensi.",
        ),
        "meta": [
            (("Role", "Peran"), ("Full-stack developer", "Full-stack developer")),
            (("Company", "Perusahaan"), ("Digivise Indonesia", "Digivise Indonesia")),
            (("Period", "Periode"), ("Sep 2024 – Oct 2025", "Sep 2024 – Okt 2025")),
            (("Status", "Status"), ("Archived", "Arsip")),
        ],
        "live": None,
        "hero": ("hris-digivise-pdf.webp", ("HRIS Digivise", "HRIS Digivise")),
        "overview": [
            (
                "Digivise needed one place to manage its people: employee records, daily attendance, payroll and the reports that come out of them. Payroll in particular had to follow attendance without manual recalculation.",
                "Digivise membutuhkan satu tempat untuk mengelola karyawannya: data karyawan, absensi harian, penggajian, dan laporan yang dihasilkan dari semuanya. Terutama penggajian, yang harus mengikuti absensi tanpa perlu dihitung ulang secara manual.",
            ),
        ],
        "built": [
            ("Employee management, attendance, payroll and reporting features.", "Fitur manajemen karyawan, absensi, penggajian, dan pelaporan."),
            ("The database schema for employee, attendance and payroll data.", "Skema database untuk data karyawan, absensi, dan penggajian."),
            ("Automatic payroll calculation based on attendance data.", "Perhitungan gaji otomatis berdasarkan data absensi."),
            ("Thorough testing before each feature reached production.", "Pengujian menyeluruh sebelum setiap fitur dirilis ke production."),
        ],
        "stack": ["React", "Nest JS", "Laravel"],
        "gallery": [],
    },
    {
        "slug": "sikepang-mimika",
        "title": ("Sikepang Mimika", "Sikepang Mimika"),
        "eyebrow": ("Freelance · Frontend", "Freelance · Frontend"),
        "lead": (
            "A food security application for the Mimika Regency government, with a public landing page and a dashboard that turns the data into charts and tables.",
            "Aplikasi ketahanan pangan untuk Pemerintah Kabupaten Mimika, dengan landing page publik dan dashboard yang menyajikan data dalam bentuk grafik dan tabel.",
        ),
        "meta": [
            (("Role", "Peran"), ("Frontend developer", "Frontend developer")),
            (("Client", "Klien"), ("Dinas Mimika, Papua", "Dinas Mimika, Papua")),
            (("Type", "Jenis"), ("Government, freelance", "Pemerintahan, freelance")),
            (("Status", "Status"), ("Live", "Live")),
        ],
        "live": "https://sikepang.mimikakab.go.id/",
        "hero": ("sikepang-portal.webp", ("Public portal", "Portal publik")),
        "overview": [
            (
                "The regency government needed its food security data in a form officials could actually read. I built the frontend on top of the APIs provided by the backend team.",
                "Pemerintah kabupaten membutuhkan data ketahanan pangannya dalam bentuk yang mudah dibaca oleh para pejabat. Saya membangun frontend-nya di atas API yang disediakan tim backend.",
            ),
        ],
        "built": [
            ("The dashboard and the public portal, built with Vue.js.", "Dashboard dan portal publik yang dibangun dengan Vue.js."),
            ("Portal sections for articles, a food price panel, aid recipients, a gallery, agenda and surveys.",
             "Bagian portal untuk artikel, panel harga pangan, penerima bantuan, galeri, agenda, dan survei."),
            ("Integration with the APIs provided by the backend team.", "Integrasi dengan API yang disediakan tim backend."),
            ("A responsive, easy-to-use interface for a government agency.", "Antarmuka yang responsif dan mudah digunakan untuk instansi pemerintah."),
            ("Food security data visualised as charts and tables.", "Visualisasi data ketahanan pangan dalam bentuk grafik dan tabel."),
            ("Testing and bug fixing before release to users.", "Pengujian dan perbaikan bug sebelum dirilis ke pengguna."),
        ],
        "stack": ["Vue.js", "Vite", "REST API", "Laravel (backend team)"],
        "gallery": [("sikepang-mimika.webp", ("Dashboard sign-in", "Login dashboard"))],
    },
]

T = {
    "back": ("← Back to portfolio", "← Kembali ke portofolio"),
    "overview": ("Overview", "Gambaran umum"),
    "built": ("What I built", "Yang saya kerjakan"),
    "stack": ("Tech stack", "Teknologi"),
    "screens": ("More screens", "Tampilan lainnya"),
    "visit": ("Visit the live site ↗", "Kunjungi situsnya ↗"),
    "cta_title": ("Have a similar project?", "Punya proyek serupa?"),
    "cta_text": ("Tell me about it. I usually reply within a few hours.", "Ceritakan kebutuhan Anda. Biasanya saya membalas dalam beberapa jam."),
    "cta_btn": ("Start a chat", "Mulai chat"),
    "others": ("Other case studies", "Studi kasus lainnya"),
    "archived": (
        "This system is no longer publicly reachable; the screenshots show it while it was live.",
        "Sistem ini sudah tidak bisa diakses publik; screenshot menunjukkan tampilannya saat masih aktif.",
    ),
}


def t(pair, tag="span", attrs=""):
    en, idn = pair
    return f'<{tag}{attrs} data-i18n-id="{html.escape(idn, quote=True)}">{html.escape(en)}</{tag}>'


def page(case):
    img = lambda name: f"../../assets/images/portfolio/{name}"
    others = [c for c in CASES if c is not case]
    url = f"{SITE}/case-studies/{case['slug']}/"
    title_en = case["title"][0]
    desc_en = case["lead"][0]
    archived = any(v[0] == "Archived" for _, v in case["meta"])

    ld = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": title_en,
        "description": desc_en,
        "url": url,
        "image": f"{SITE}/assets/images/portfolio/{case['hero'][0]}",
        "author": {"@type": "Person", "name": "Rizal Fauzan", "url": SITE + "/"},
        "keywords": ", ".join(case["stack"]),
    }

    meta = "\n".join(
        f"          <div><dt>{t(k)}</dt><dd>{t(v)}</dd></div>" for k, v in case["meta"]
    )
    overview = "\n".join(f"        {t(p, 'p')}" for p in case["overview"])
    built = "\n".join(f"          {t(b, 'li')}" for b in case["built"])
    stack = "".join(f"<span>{html.escape(s)}</span>" for s in case["stack"])
    gallery = ""
    if case["gallery"]:
        figs = "\n".join(
            f'''          <figure class="shot">
            <img src="{img(f)}" alt="{html.escape(cap[0])}" loading="lazy" width="1568" height="688" />
            <figcaption>{t(cap)}</figcaption>
          </figure>''' for f, cap in case["gallery"]
        )
        gallery = f'''
      <section>
        <h2>{t(T["screens"])}</h2>
        <div class="gallery">
{figs}
        </div>
      </section>
'''
    live = f'\n        <p><a href="{case["live"]}" target="_blank" rel="noopener">{t(T["visit"])}</a></p>' if case["live"] else ""
    note = f'\n        <p class="note">{t(T["archived"])}</p>' if archived else ""
    other_links = "\n".join(
        f'        <a href="../{o["slug"]}/">{t(o["title"])}</a>' for o in others
    )

    return f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{html.escape(title_en)} · Case study · Rizal Fauzan</title>
    <meta name="description" content="{html.escape(desc_en, quote=True)}" />
    <link rel="canonical" href="{url}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="{html.escape(title_en, quote=True)} · Case study" />
    <meta property="og:description" content="{html.escape(desc_en, quote=True)}" />
    <meta property="og:image" content="{SITE}/assets/images/portfolio/{case['hero'][0]}" />
    <meta property="og:url" content="{url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="../../assets/images/fav-icon.jpeg" type="image/jpeg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../case-study.css" />
    <script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
  </head>
  <body>
    <!-- generated by case-studies/build.py; edit the data there, not here -->
    <header class="topbar">
      <div class="wrap">
        <a class="back" href="../../#portfolio">{t(T["back"])}</a>
        <button type="button" class="lang-btn" data-lang-toggle aria-label="Switch language">EN</button>
      </div>
    </header>

    <main class="wrap">
      <header class="hero">
        {t(case["eyebrow"], "span", ' class="eyebrow"')}
        {t(case["title"], "h1")}
        {t(case["lead"], "p", ' class="lead"')}

        <dl class="meta">
{meta}
        </dl>

        <figure class="shot">
          <img src="{img(case['hero'][0])}" alt="{html.escape(case['hero'][1][0])}" width="1568" height="688" />
          <figcaption>{t(case["hero"][1])}</figcaption>
        </figure>
      </header>

      <section class="content">
        <h2>{t(T["overview"])}</h2>
{overview}{live}{note}
      </section>

      <section>
        <h2>{t(T["built"])}</h2>
        <ul class="list">
{built}
        </ul>
      </section>

      <section>
        <h2>{t(T["stack"])}</h2>
        <div class="chips">{stack}</div>
      </section>
{gallery}
      <aside class="cta">
        <div>
          {t(T["cta_title"], "h2")}
          {t(T["cta_text"], "p")}
        </div>
        <a href="../../#contact">{t(T["cta_btn"])}</a>
      </aside>

      <h2>{t(T["others"])}</h2>
      <nav class="others">
{other_links}
      </nav>
    </main>

    <script src="../case-study.js"></script>
  </body>
</html>
'''


for case in CASES:
    folder = os.path.join(OUT, case["slug"])
    os.makedirs(folder, exist_ok=True)
    with open(os.path.join(folder, "index.html"), "w", encoding="utf-8", newline="\n") as f:
        f.write(page(case))
    print("wrote", case["slug"])
