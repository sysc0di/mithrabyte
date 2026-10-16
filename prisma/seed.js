import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/auth/password.js";
import { pathToFileURL } from "node:url";

/**
 * Idempotent database seed:
 *   1. Creates the initial administrator from environment-provided credentials.
 *      Rerunning the seed NEVER resets an existing administrator's password.
 *   2. Seeds core read-only/system settings only when absent.
 *
 * Usage: npm run db:seed
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const GLOBAL_LOCALE = "*";

export async function seedAdmin() {
  const email = (process.env.ADMIN_INIT_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_INIT_PASSWORD || "";
  const name = (process.env.ADMIN_INIT_NAME || "").trim() || "Mithrabyte Admin";

  if (!email || !password || password.length < 12) {
    console.error(
      "[seed] ADMIN_INIT_EMAIL, ADMIN_INIT_NAME and ADMIN_INIT_PASSWORD (>= 12 chars) must be set in the environment."
    );
    process.exit(1);
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] Administrator "${email}" already exists. Leaving password unchanged.`);
    return existing;
  }

  const admin = await prisma.admin.create({
    data: {
      email,
      name,
      passwordHash: await hashPassword(password),
      role: "OWNER",
    },
  });
  console.log(`[seed] Created administrator "${email}" (Owner).`);
  return admin;
}

export async function seedSettings() {
  const settings = [
    {
      key: "system.locales",
      isProtected: true,
      description: "Locales enabled for localized content editing.",
      values: { [GLOBAL_LOCALE]: ["tr", "en"] },
    },
    {
      key: "site.name",
      isProtected: true,
      description: "Public site / brand name.",
      values: { [GLOBAL_LOCALE]: "Mithrabyte" },
    },
    {
      key: "site.contact",
      isProtected: false,
      description: "Public contact details (localized).",
      values: {
        tr: {
          address: "Yüksekova, Hakkâri, Türkiye",
          phone: "+90 505 804 4818",
          email: "contact@mithrabyte.com",
          hours: "Pzt-Cum 09:00 - 18:00",
        },
        en: {
          address: "Yüksekova, Hakkâri, Türkiye",
          phone: "+90 505 804 4818",
          email: "contact@mithrabyte.com",
          hours: "Mon-Fri 09:00 - 18:00",
        },
      },
    },
    {
      key: "social.links",
      isProtected: false,
      description: "Public social profile links.",
      values: {
        [GLOBAL_LOCALE]: {
          linkedin: "https://www.linkedin.com/company/mithrabyte",
          twitter: "https://twitter.com/mithrabyte",
        },
      },
    },
  ];

  for (const setting of settings) {
    const existing = await prisma.setting.findUnique({ where: { key: setting.key } });
    if (existing) continue;

    const created = await prisma.setting.create({
      data: {
        key: setting.key,
        isProtected: setting.isProtected,
        description: setting.description,
        values: {
          create: Object.entries(setting.values).map(([locale, value]) => ({
            locale,
            value,
          })),
        },
      },
    });
    console.log(`[seed] Created setting "${created.key}".`);
  }
}

// ---------------------------------------------------------------------------
// Catalog: categories, products, service packages
//
// Phase 1 content model. Three current offerings:
//   A) Local AI knowledge assistant (RAG, self-hosted, models are NOT trained)
//   B) Self-hosted e-commerce platform (upcoming — consultation only)
//   C) Custom web applications
//
// Obsolete offerings from the old static site (mobile apps, CLI/terminal
// tooling, social-media management panels, generic analytics/ML dashboards)
// are intentionally NOT seeded. All records are create-only so reruns never
// overwrite edits made in the admin panel.
// ---------------------------------------------------------------------------

const CATEGORIES = [
  {
    slug: "ai-systems",
    sortOrder: 1,
    locales: {
      tr: { title: "Yapay Zeka Sistemleri", description: "Kendi altyapınızda çalışan yapay zeka çözümleri." },
      en: { title: "AI Systems", description: "AI solutions that run on your own infrastructure." },
    },
  },
  {
    slug: "commerce",
    sortOrder: 2,
    locales: {
      tr: { title: "E-Ticaret", description: "Size ait, sunucunuzda barındırılan ticaret altyapıları." },
      en: { title: "Commerce", description: "Commerce platforms you own and host yourself." },
    },
  },
  {
    slug: "custom-software",
    sortOrder: 3,
    locales: {
      tr: { title: "Özel Yazılım", description: "İhtiyaca göre tasarlanan web uygulamaları." },
      en: { title: "Custom Software", description: "Web applications designed around your needs." },
    },
  },
];

const PRODUCTS = [
  {
    slug: "local-ai-knowledge",
    status: "AVAILABLE",
    categorySlug: "ai-systems",
    sortOrder: 1,
    locales: {
      tr: {
        title: "Yerel Yapay Zeka Bilgi Asistanı",
        tagline: "Kendi sunucunuzda çalışan, belgelerinize dayalı yanıt veren RAG tabanlı bilgi sistemi.",
        shortDescription:
          "Şirket içi belgelerinizi kendi altyapınızda indeksleyen, gizliliği koruyan yapay zeka asistanı.",
        description:
          "Kurumsal belgelerinizi, prosedürlerinizi ve iç bilgi tabanınızı güvenli biçimde indeksleyen; çalışanlarınıza kaynak göstererek yanıt veren yerel bir yapay zeka asistanı kuruyoruz. Tüm veri kendi sunucunuzda kalır ve üçüncü taraf bir bulut sağlayıcısına gönderilmez. Sistem Retrieval-Augmented Generation (RAG) mimarisi kullanır: yanıt, sizin belgelerinize dayandırılarak üretilir. Bu çözüm mevcut dil modellerini kullanır; model eğitimi (fine-tuning) içermez, bunun yerine içeriğinizin indekslenmesini sağlar. Kurulum Docker tabanlıdır ve kendi altyapınızda çalışır.",
        targetAudience:
          "İç bilgi tabanını hızlıca aramak isteyen kurumsal ekipler, destek ve operasyon birimleri.",
        ctaText: "Teklif Al",
        seoTitle: "Yerel Yapay Zeka Bilgi Asistanı (RAG) | Mithrabyte",
        seoDescription:
          "Kendi sunucunuzda çalışan, belgelerinize dayalı yanıt üreten RAG tabanlı kurumsal bilgi asistanı.",
        useCases: [
          { title: "İç bilgi tabanı asistanı", description: "Çalışanlarınız şirket içi dokümanlara doğal dille soru sorar, kaynağıyla birlikte yanıt alır." },
          { title: "Doküman arama ve özetleme", description: "Dağınık PDF ve metin arşivleri indekslenir, ilgili bölümler hızlıca bulunur ve özetlenir." },
          { title: "Destek ekibi yardımcısı", description: "Destek ekibi, doğru yanıtı müşteriye iletmek için güvenilir bir dahili kaynağa erişir." },
        ],
      },
      en: {
        title: "Local AI Knowledge Assistant",
        tagline: "A RAG-based knowledge system running on your own server, answering from your documents.",
        shortDescription:
          "An AI assistant that indexes your internal documents on your own infrastructure and keeps your data private.",
        description:
          "We deploy a local AI assistant that securely indexes your corporate documents, procedures and internal knowledge base, then answers employees with citations. All data stays on your own server and is never sent to a third-party cloud provider. The system uses a Retrieval-Augmented Generation (RAG) architecture: answers are grounded in your documents. This solution uses existing language models and does not train or fine-tune a model — instead it indexes your content. Deployment is Docker-based and runs on your own infrastructure.",
        targetAudience:
          "Internal teams, support and operations units that need fast access to a private knowledge base.",
        ctaText: "Get a quote",
        seoTitle: "Local AI Knowledge Assistant (RAG) | Mithrabyte",
        seoDescription:
          "A RAG-based corporate knowledge assistant that runs on your own server and answers from your documents.",
        useCases: [
          { title: "Internal knowledge assistant", description: "Employees ask questions in natural language and receive answers with the source they came from." },
          { title: "Document search & summarization", description: "Scattered PDF and text archives are indexed so relevant passages are found and summarized quickly." },
          { title: "Support team copilot", description: "Your support team reaches a trustworthy internal source to relay the right answer to customers." },
        ],
      },
    },
    features: {
      tr: [
        "Kendi sunucunuzda (self-hosted) Docker tabanlı kurulum",
        "Belgeleriniz RAG ile indekslenir; model eğitilmez",
        "Kaynak göstererek yanıt üretimi",
        "Rol bazlı erişim ve denetim kaydı",
        "Türkçe ve İngilizce içerik desteği",
        "Veriniz kurum dışına çıkmaz",
      ],
      en: [
        "Self-hosted, Docker-based deployment on your own server",
        "Your documents are indexed with RAG; no model is trained",
        "Answers generated with citations",
        "Role-based access and audit trail",
        "Turkish and English content support",
        "Your data never leaves your organization",
      ],
    },
  },
  {
    slug: "self-hosted-ecommerce",
    status: "UPCOMING",
    categorySlug: "commerce",
    sortOrder: 2,
    locales: {
      tr: {
        title: "Kendi Sunucunuzda E-Ticaret Platformu",
        tagline: "Sunucunuzda barındırılan, verisi tamamen size ait e-ticaret altyapısı — yakında.",
        shortDescription:
          "Bağımsız ve veri sahipliği sizde olan e-ticaret altyapısı. Şu anda danışma ve ön planlama aşamasında.",
        description:
          "Verinizin ve müşteri ilişkilerinizin tamamen size ait olduğu, kendi sunucunuzda barındırılan bir e-ticaret platformu üzerinde çalışıyoruz. Ürün ve sipariş yönetimi, ödeme akışları ve pazarlama araçları tek bir altyapıda toplanır. Bu ürün şu anda geliştirme aşamasında; lansman öncesinde erken erişim ve ön planlama görüşmesi yapıyoruz. Sunucu ve altyapı maliyetleri, proje bedelinden ayrıdır ve doğrudan size aittir. Fiyatlandırma, ihtiyaç analizinin ardından teklif ile belirlenir.",
        targetAudience:
          "Satış kanalını bağımsız bir altyapıya taşımak isteyen işletmeler ve D2C markalar.",
        ctaText: "Ön Görüşme Planla",
        seoTitle: "Kendi Sunucunuzda E-Ticaret Platformu (Yakında) | Mithrabyte",
        seoDescription:
          "Veri sahipliği sizde olan, sunucunuzda barındırılan e-ticaret altyapısı. Lansman öncesi danışma görüşmesi.",
        useCases: [
          { title: "D2C markalar", description: "Aracı platformlara bağımlı olmadan kendi müşterinizle doğrudan çalışmak isteyen markalar." },
          { title: "Özel ticaret akışları", description: "Standart hazır çözümlerin karşılamadığı sipariş ve fiyatlandırma senaryoları." },
          { title: "Veri sahipliği", description: "Müşteri ve satış verisinin tamamen işletmede kalmasını gerektiren durumlar." },
        ],
      },
      en: {
        title: "Self-Hosted E-commerce Platform",
        tagline: "An e-commerce platform hosted on your server, with data ownership fully yours — coming soon.",
        shortDescription:
          "An independent platform where you own the data. Currently in consultation and early planning.",
        description:
          "We are building an e-commerce platform that is hosted on your own server, where your data and customer relationships remain entirely yours. Product and order management, payment flows and marketing tools come together in one infrastructure. This product is in development; before launch we run early-access and planning conversations. Server and infrastructure costs are separate from the project fee and belong directly to you. Pricing is quoted after a needs assessment.",
        targetAudience:
          "Businesses and D2C brands that want to move their sales channel onto an independent infrastructure.",
        ctaText: "Book a call",
        seoTitle: "Self-Hosted E-commerce Platform (Coming Soon) | Mithrabyte",
        seoDescription:
          "A self-hosted e-commerce platform where you own the data. Pre-launch consultation available.",
        useCases: [
          { title: "D2C brands", description: "Brands that want a direct relationship with their customers instead of depending on marketplaces." },
          { title: "Custom commerce flows", description: "Order and pricing scenarios that off-the-shelf platforms cannot cover." },
          { title: "Data ownership", description: "Situations where customer and sales data must remain entirely inside the business." },
        ],
      },
    },
    features: {
      tr: [
        "Sunucunuzda barındırma (self-hosted)",
        "Ürün, sipariş ve ödeme akışları",
        "Veri sahipliği tamamen sizde",
        "Sunucu ve altyapı maliyetleri ayrıdır",
        "Lansman öncesi kontrollü erken erişim",
      ],
      en: [
        "Self-hosted on your own server",
        "Product, order and payment flows",
        "Data ownership stays entirely with you",
        "Server and infrastructure costs are separate",
        "Controlled early access before launch",
      ],
    },
  },
  {
    slug: "custom-web-applications",
    status: "AVAILABLE",
    categorySlug: "custom-software",
    sortOrder: 3,
    locales: {
      tr: {
        title: "Özel Web Uygulamaları",
        tagline: "İhtiyacınıza göre tasarlanan, ölçeklenebilir web uygulamaları.",
        shortDescription:
          "İş süreçlerinize uygun, güvenli ve sürdürülebilir özel web uygulamaları geliştiriyoruz.",
        description:
          "Hazır şablonlar yerine, iş sürecinize göre tasarlanmış web uygulamaları geliştiriyoruz. Keşif ve kapsam çalışmasıyla başlar, arayüz ve mimariyi birlikte kurgular, yinelemeli geliştirme ile teslim ederiz. Yönetim panelleri, API entegrasyonları, rol bazlı yetkilendirme ve otomatik testler standarttır. Odak noktamız web uygulamalarıdır; mobil uygulama, masaüstü veya komut satırı araçları bu kapsamda sunulmaz. Teslim sonrası bakım için ayrı bir abonelik planı sunulur.",
        targetAudience:
          "Süreçlerini dijitalleştirmek isteyen KOBİ'ler ve kurumsal ekipler.",
        ctaText: "Teklif Al",
        seoTitle: "Özel Web Uygulamaları | Mithrabyte",
        seoDescription:
          "İş sürecinize göre tasarlanan, ölçeklenebilir ve güvenli özel web uygulamaları geliştiriyoruz.",
        useCases: [
          { title: "Kurumsal paneller", description: "Operasyon, envanter ve raporlama süreçleri için rol bazlı yönetim panelleri." },
          { title: "API ve entegrasyon", description: "Mevcut sistemlerinizi birbirine bağlayan güvenli API ve entegrasyon katmanları." },
          { title: "Süreç otomasyonu", description: "Manuel ve tekrarlı işleri web tabanlı iş akışlarına dönüştüren uygulamalar." },
        ],
      },
      en: {
        title: "Custom Web Applications",
        tagline: "Scalable web applications designed around your needs.",
        shortDescription:
          "We build secure, maintainable web applications tailored to your business processes.",
        description:
          "Instead of off-the-shelf templates, we build web applications designed around your process. We start with discovery and scoping, design the interface and architecture together, and deliver iteratively. Admin panels, API integrations, role-based access and automated tests are standard. Our focus is web applications; mobile apps, desktop or command-line tools are not part of this offering. Post-delivery maintenance is available as a separate subscription plan.",
        targetAudience:
          "SMBs and internal teams that want to digitize their processes.",
        ctaText: "Get a quote",
        seoTitle: "Custom Web Applications | Mithrabyte",
        seoDescription:
          "We build scalable, secure web applications designed around your business process.",
        useCases: [
          { title: "Internal admin panels", description: "Role-based dashboards for operations, inventory and reporting workflows." },
          { title: "APIs and integrations", description: "Secure API and integration layers that connect your existing systems." },
          { title: "Process automation", description: "Applications that turn manual, repetitive work into web-based workflows." },
        ],
      },
    },
    features: {
      tr: [
        "Keşif, kapsam ve mimari çalışması",
        "Web uygulaması ve API geliştirme",
        "Rol bazlı yetkilendirme ve yönetim paneli",
        "Otomatik testler ve CI/CD",
        "Performans ve SEO optimizasyonu",
        "Teslim sonrası bakım aboneliği (ayrı plan)",
      ],
      en: [
        "Discovery, scoping and architecture",
        "Web application and API development",
        "Role-based access and admin panel",
        "Automated tests and CI/CD",
        "Performance and SEO optimization",
        "Post-delivery maintenance subscription (separate plan)",
      ],
    },
  },
];

const PACKAGES = [
  {
    slug: "rag-knowledge-base-setup",
    kind: "PACKAGE",
    status: "AVAILABLE",
    productSlug: "local-ai-knowledge",
    pricingModel: "QUOTE",
    billingPeriod: "ONE_TIME",
    currency: "TRY",
    sortOrder: 1,
    locales: {
      tr: {
        title: "Yerel Bilgi Asistanı Kurulumu",
        tagline: "Tek seferlik kurulum: veriniz kendi sunucunuzda indekslenir.",
        description:
          "Belgelerinizin toplanması, indekslenmesi ve yerel yapay zeka asistanının kendi sunucunuza kurulmasını kapsayan tek seferlik hizmet. Fiyat, belge hacmi ve entegrasyon ihtiyacına göre teklif ile belirlenir.",
        priceLabel: "Teklif bazlı",
        ctaText: "Teklif Al",
        seoTitle: "Yerel Bilgi Asistanı Kurulumu | Mithrabyte",
        seoDescription: "RAG tabanlı yerel bilgi asistanının tek seferlik kurulum hizmeti.",
        data: {
          useCases: [
            { title: "İlk kurulum", description: "Belgelerinizin ilk indekslenmesi ve asistanın sunucunuza kurulması." },
            { title: "Entegrasyon", description: "Asistanın mevcut iç araçlarınıza bağlanması." },
          ],
        },
      },
      en: {
        title: "Local Knowledge Assistant Setup",
        tagline: "One-time setup: your data is indexed on your own server.",
        description:
          "A one-time service covering collection and indexing of your documents and installation of the local AI assistant on your own server. Priced by quote based on document volume and integration needs.",
        priceLabel: "Quote-based",
        ctaText: "Get a quote",
        seoTitle: "Local Knowledge Assistant Setup | Mithrabyte",
        seoDescription: "One-time setup service for the RAG-based local knowledge assistant.",
        data: {
          useCases: [
            { title: "Initial setup", description: "First indexing of your documents and installation of the assistant on your server." },
            { title: "Integration", description: "Connecting the assistant to your existing internal tools." },
          ],
        },
      },
    },
    features: {
      tr: ["Belge toplama ve indeksleme", "Docker tabanlı yerel kurulum", "Kaynak gösterimli yanıt yapılandırması", "Temel entegrasyonlar"],
      en: ["Document collection and indexing", "Docker-based local installation", "Citation-based answer configuration", "Core integrations"],
    },
  },
  {
    slug: "rag-managed-service",
    kind: "MAINTENANCE",
    status: "AVAILABLE",
    productSlug: "local-ai-knowledge",
    pricingModel: "QUOTE",
    billingPeriod: "MONTHLY",
    currency: "TRY",
    sortOrder: 2,
    locales: {
      tr: {
        title: "Bilgi Asistanı Bakım Aboneliği",
        tagline: "Aylık bakım: indeks güncellemeleri, izleme ve destek.",
        description:
          "Kurulum sonrası aylık abonelik. Yeni belgelerin indekslenmesi, sistem izleme, güncelleme ve destek hizmetlerini kapsar. Bu bir aylık aboneliktir; tek seferlik kurulum bedelinden ayrıdır.",
        priceLabel: "Aylık teklif bazlı",
        ctaText: "Teklif Al",
        seoTitle: "Bilgi Asistanı Bakım Aboneliği | Mithrabyte",
        seoDescription: "RAG bilgi asistanı için aylık bakım, izleme ve destek aboneliği.",
        data: {
          useCases: [
            { title: "İçerik güncellemeleri", description: "Yeni belgelerin düzenli indekslenmesi." },
            { title: "İzleme ve destek", description: "Sistem sağlığı takibi ve sorun giderme desteği." },
          ],
        },
      },
      en: {
        title: "Knowledge Assistant Maintenance",
        tagline: "Monthly maintenance: index updates, monitoring and support.",
        description:
          "A monthly subscription after setup. Covers indexing of new documents, system monitoring, updates and support. This is a recurring monthly plan, separate from the one-time setup fee.",
        priceLabel: "Monthly, quote-based",
        ctaText: "Get a quote",
        seoTitle: "Knowledge Assistant Maintenance | Mithrabyte",
        seoDescription: "Monthly maintenance, monitoring and support subscription for the RAG knowledge assistant.",
        data: {
          useCases: [
            { title: "Content updates", description: "Regularly indexing new documents." },
            { title: "Monitoring & support", description: "System health monitoring and troubleshooting support." },
          ],
        },
      },
    },
    features: {
      tr: ["Yeni belge indeksleme", "Sistem izleme", "Güncelleme ve yama yönetimi", "Öncelikli destek"],
      en: ["New document indexing", "System monitoring", "Update and patch management", "Priority support"],
    },
  },
  {
    slug: "custom-web-app-build",
    kind: "PACKAGE",
    status: "AVAILABLE",
    productSlug: "custom-web-applications",
    pricingModel: "QUOTE",
    billingPeriod: "ONE_TIME",
    currency: "TRY",
    sortOrder: 3,
    locales: {
      tr: {
        title: "Özel Web Uygulaması Geliştirme",
        tagline: "Keşiften teslime kadar tek seferlik web uygulaması geliştirme.",
        description:
          "İş sürecinize özel web uygulamasının keşif, tasarım, geliştirme ve teslimini kapsayan tek seferlik hizmet. Kapsam ve entegrasyonlara göre teklif ile fiyatlandırılır.",
        priceLabel: "Teklif bazlı",
        ctaText: "Teklif Al",
        seoTitle: "Özel Web Uygulaması Geliştirme | Mithrabyte",
        seoDescription: "İş sürecinize özel, ölçeklenebilir web uygulaması geliştirme hizmeti.",
        data: {
          useCases: [
            { title: "Yeni uygulama", description: "Sıfırdan tasarlanan ve geliştirilen özel web uygulaması." },
            { title: "Mevcut sisteme ekleme", description: "Var olan uygulamaya yeni modüller ve entegrasyonlar eklenmesi." },
          ],
        },
      },
      en: {
        title: "Custom Web App Development",
        tagline: "One-time web application development from discovery to delivery.",
        description:
          "A one-time service covering discovery, design, development and delivery of a web application tailored to your process. Priced by quote based on scope and integrations.",
        priceLabel: "Quote-based",
        ctaText: "Get a quote",
        seoTitle: "Custom Web App Development | Mithrabyte",
        seoDescription: "Tailored, scalable web application development service.",
        data: {
          useCases: [
            { title: "New application", description: "A custom web application designed and built from scratch." },
            { title: "Extend an existing system", description: "Adding new modules and integrations to a running application." },
          ],
        },
      },
    },
    features: {
      tr: ["Keşif ve kapsam", "Arayüz ve mimari tasarımı", "Yinelemeli geliştirme", "Otomatik testler ve CI/CD", "Devreye alma ve devir"],
      en: ["Discovery and scoping", "Interface and architecture design", "Iterative development", "Automated tests and CI/CD", "Deployment and handover"],
    },
  },
  {
    slug: "custom-web-maintenance",
    kind: "MAINTENANCE",
    status: "AVAILABLE",
    productSlug: "custom-web-applications",
    pricingModel: "QUOTE",
    billingPeriod: "MONTHLY",
    currency: "TRY",
    sortOrder: 4,
    locales: {
      tr: {
        title: "Web Uygulaması Bakım Aboneliği",
        tagline: "Aylık bakım: izleme, güncelleme ve iyileştirme.",
        description:
          "Teslim sonrası aylık abonelik. İzleme, güvenlik ve bağımlılık güncellemeleri, küçük iyileştirmeler ve destek hizmetlerini kapsar. Tek seferlik geliştirme bedelinden ayrıdır.",
        priceLabel: "Aylık teklif bazlı",
        ctaText: "Teklif Al",
        seoTitle: "Web Uygulaması Bakım Aboneliği | Mithrabyte",
        seoDescription: "Web uygulamaları için aylık bakım, güncelleme ve destek aboneliği.",
        data: {
          useCases: [
            { title: "İzleme", description: "Uygulama ve altyapı sağlığının sürekli takibi." },
            { title: "Sürekli iyileştirme", description: "Küçük özellik ve performans iyileştirmeleri." },
          ],
        },
      },
      en: {
        title: "Web Application Maintenance",
        tagline: "Monthly maintenance: monitoring, updates and improvements.",
        description:
          "A monthly subscription after delivery. Covers monitoring, security and dependency updates, small improvements and support. Separate from the one-time development fee.",
        priceLabel: "Monthly, quote-based",
        ctaText: "Get a quote",
        seoTitle: "Web Application Maintenance | Mithrabyte",
        seoDescription: "Monthly maintenance, update and support subscription for web applications.",
        data: {
          useCases: [
            { title: "Monitoring", description: "Continuous health monitoring of the application and infrastructure." },
            { title: "Continuous improvement", description: "Small feature and performance improvements." },
          ],
        },
      },
    },
    features: {
      tr: ["İzleme ve uyarılar", "Güvenlik ve bağımlılık güncellemeleri", "Küçük iyileştirmeler", "Destek"],
      en: ["Monitoring and alerts", "Security and dependency updates", "Small improvements", "Support"],
    },
  },
  {
    slug: "ecommerce-platform-build",
    kind: "PACKAGE",
    status: "DRAFT",
    productSlug: "self-hosted-ecommerce",
    pricingModel: "QUOTE",
    billingPeriod: "ONE_TIME",
    currency: "TRY",
    sortOrder: 5,
    locales: {
      tr: {
        title: "E-Ticaret Platformu Kurulumu",
        tagline: "Sunucunuzda barındırılan e-ticaret platformu kurulumu (yakında).",
        description:
          "E-ticaret platformunun kurulumunu kapsayan tek seferlik hizmet. Ürün hâlâ geliştirme aşamasında olduğundan bu paket şu an yayınlanmamıştır; kapsam ve fiyat, lansman sonrası ihtiyaç analiziyle netleşir. Sunucu ve altyapı maliyetleri ayrıdır.",
        priceLabel: "Teklif bazlı (yakında)",
        ctaText: "Ön Görüşme Planla",
        seoTitle: "E-Ticaret Platformu Kurulumu (Yakında) | Mithrabyte",
        seoDescription: "Sunucunuzda barındırılan e-ticaret platformu kurulum hizmeti (yakında).",
        data: {
          useCases: [
            { title: "Platform kurulumu", description: "E-ticaret altyapısının kendi sunucunuza kurulması." },
            { title: "Ürün ve sipariş akışları", description: "Katalog, sipariş ve ödeme akışlarının yapılandırılması." },
          ],
        },
      },
      en: {
        title: "E-commerce Platform Setup",
        tagline: "Setup of the self-hosted e-commerce platform on your server (coming soon).",
        description:
          "A one-time service covering installation of the e-commerce platform. Because the product is still in development this package is unpublished; scope and price are defined after launch via a needs assessment. Server and infrastructure costs are separate.",
        priceLabel: "Quote-based (coming soon)",
        ctaText: "Book a call",
        seoTitle: "E-commerce Platform Setup (Coming Soon) | Mithrabyte",
        seoDescription: "Setup service for the self-hosted e-commerce platform (coming soon).",
        data: {
          useCases: [
            { title: "Platform setup", description: "Installing the e-commerce infrastructure on your own server." },
            { title: "Product and order flows", description: "Configuring catalog, order and payment flows." },
          ],
        },
      },
    },
    features: {
      tr: ["Sunucuda kurulum", "Katalog ve sipariş yapılandırması", "Ödeme akışı entegrasyonu", "Roller ve yetkilendirme"],
      en: ["Server installation", "Catalog and order configuration", "Payment flow integration", "Roles and permissions"],
    },
  },
  {
    slug: "ecommerce-managed-service",
    kind: "MAINTENANCE",
    status: "DRAFT",
    productSlug: "self-hosted-ecommerce",
    pricingModel: "QUOTE",
    billingPeriod: "MONTHLY",
    currency: "TRY",
    sortOrder: 6,
    locales: {
      tr: {
        title: "E-Ticaret Bakım Aboneliği",
        tagline: "E-ticaret platformu için aylık bakım (yakında).",
        description:
          "Platform için aylık bakım, izleme ve destek aboneliği. Ürün geliştirme aşamasında olduğundan şu an yayınlanmamıştır. Tek seferlik kurulum bedelinden ayrıdır.",
        priceLabel: "Aylık teklif bazlı (yakında)",
        ctaText: "Ön Görüşme Planla",
        seoTitle: "E-Ticaret Bakım Aboneliği (Yakında) | Mithrabyte",
        seoDescription: "E-ticaret platformu için aylık bakım ve destek aboneliği (yakında).",
        data: {
          useCases: [
            { title: "İzleme", description: "Platform ve ödeme akışlarının sürekli izlenmesi." },
            { title: "Destek", description: "Operasyonel destek ve sorun giderme." },
          ],
        },
      },
      en: {
        title: "E-commerce Maintenance",
        tagline: "Monthly maintenance for the e-commerce platform (coming soon).",
        description:
          "Monthly maintenance, monitoring and support subscription for the platform. Unpublished while the product is in development. Separate from the one-time setup fee.",
        priceLabel: "Monthly, quote-based (coming soon)",
        ctaText: "Book a call",
        seoTitle: "E-commerce Maintenance (Coming Soon) | Mithrabyte",
        seoDescription: "Monthly maintenance and support subscription for the e-commerce platform (coming soon).",
        data: {
          useCases: [
            { title: "Monitoring", description: "Continuous monitoring of the platform and payment flows." },
            { title: "Support", description: "Operational support and troubleshooting." },
          ],
        },
      },
    },
    features: {
      tr: ["İzleme ve uyarılar", "Güvenlik güncellemeleri", "Ödeme akışı desteği", "Destek"],
      en: ["Monitoring and alerts", "Security updates", "Payment flow support", "Support"],
    },
  },
];

/** Converts per-locale feature lists into Prisma nested-create payloads. */
function localizedFeatureCreates(features) {
  if (!features) return [];
  const byIndex = new Map();
  for (const [locale, list] of Object.entries(features)) {
    (list || []).forEach((text, index) => {
      if (!text) return;
      if (!byIndex.has(index)) byIndex.set(index, []);
      byIndex.get(index).push({ locale, text });
    });
  }
  return [...byIndex.entries()]
    .sort(([a], [b]) => a - b)
    .map(([index, items]) => ({ sortOrder: index, locales: { create: items } }));
}

function localizedCreates(locales) {
  return Object.entries(locales || {}).map(([locale, content]) => ({ locale, ...content }));
}

export async function seedCatalog() {
  const categoryIds = {};
  for (const category of CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { slug: category.slug } });
    if (existing) {
      categoryIds[category.slug] = existing.id;
      continue;
    }
    const created = await prisma.category.create({
      data: {
        slug: category.slug,
        sortOrder: category.sortOrder,
        isActive: true,
        locales: { create: localizedCreates(category.locales) },
      },
    });
    categoryIds[category.slug] = created.id;
    console.log(`[seed] Created category "${category.slug}".`);
  }

  const productIds = {};
  for (const product of PRODUCTS) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (existing) {
      productIds[product.slug] = existing.id;
      continue;
    }
    const created = await prisma.product.create({
      data: {
        slug: product.slug,
        status: product.status,
        categoryId: categoryIds[product.categorySlug] ?? null,
        sortOrder: product.sortOrder,
        locales: { create: localizedCreates(product.locales) },
        features: { create: localizedFeatureCreates(product.features) },
      },
    });
    productIds[product.slug] = created.id;
    console.log(`[seed] Created product "${product.slug}".`);
  }

  for (const pkg of PACKAGES) {
    const existing = await prisma.servicePackage.findUnique({ where: { slug: pkg.slug } });
    if (existing) continue;
    await prisma.servicePackage.create({
      data: {
        slug: pkg.slug,
        kind: pkg.kind,
        status: pkg.status,
        productId: productIds[pkg.productSlug] ?? null,
        pricingModel: pkg.pricingModel,
        billingPeriod: pkg.billingPeriod,
        priceAmount: pkg.priceAmount ?? null,
        currency: pkg.currency ?? null,
        sortOrder: pkg.sortOrder,
        locales: { create: localizedCreates(pkg.locales) },
        features: { create: localizedFeatureCreates(pkg.features) },
      },
    });
    console.log(`[seed] Created package "${pkg.slug}".`);
  }

  return { categories: CATEGORIES.length, products: PRODUCTS.length, packages: PACKAGES.length };
}

const LEGAL_PAGES = [
  ["privacy-policy", {
    tr: ["Gizlilik Politikası", "MithraByte web sitesi ve hizmetleri için kişisel veri işleme politikası.", "MithraByte, bu metinde belirtilen kapsamda MithraByte sıfatıyla veri sorumlusudur.\n\nWeb sitemizin güncel hali üzerinden toplanan veriler şunlardır: iletişim formunda sağlanan ad, e-posta adresi, şirket bilgisi (isteğe bağlı), konu (isteğe bağlı) ve mesaj içeriği; teknik ihtiyaçlar nedeniyle oluşturulan sınırlı günlük kayıtları ve çerez tercihleriniz. Bu veriler, talebinize yanıt vermek, olası bir hizmet ilişkisini yürütmek, sitemizin güvenliğini sağlamak ve teknik sorunları gidermek amacıyla işlenir.\n\nMithraByte hizmetleri kapsamında sunulan yerel AI ve RAG sistemleri, e-ticaret altyapıları ve özel web uygulamaları proje bazlı olarak yürütülmektedir. Müşteri projelerinde kişisel verilerin işlenmesine ilişkin hükümler çoğunlukla müşteri ile imzalanan sözleşmeler ile düzenlenir; bu gizlilik politikası yalnızca mithrabyte.com web sitesi ile sınırlı işlemeleri kapsar.\n\nKişisel verileriniz, hukuki yükümlülüklerin yerine getirilmesi, sözleşmenin ifası veya meşru menfaatlerimiz çerçevesinde işlenebilir. Şu anda web sitemiz kapsamında üçüncü taraf analiz hizmeti kullanılmamaktadır. E-posta bildirimleri için kullanılan hizmet sağlayıcıları proje bazında [TEDARİKÇİ LİSTESİ - BELİRLENMESİ GEREKİYOR] olarak güncellenecektir. Verileriniz, yurt dışına aktarılmayacak şekilde yönetilmektedir; yurt dışına aktarım öngörülmesi halinde ilgili mevzuat çerçevesinde gerekli önlemler alınacaktır.\n\nKişisel verileriniz, işleme amacının gerektirdiği süre ve ilgili yasal saklama yükümlülükleri dikkate alınarak [SAKLAMA SÜRELERİ - BELİRLENMESİ GEREKİYOR] kadar saklanacaktır. KVKK uyarınca; verilerinize erişim, düzeltilmesini isteme, silinmesini veya yok edilmesini isteme, işlenmesini kısıtlama, aktarımına itiraz etme ve ilgili kanunlarda öngörülen diğer haklara sahipsiniz. Başvurularınızı contact@mithrabyte.com üzerinden iletebilirsiniz.\n\nGüvenlik açısından makul teknik ve idari tedbirler uygulanmaktadır. Bu politika ihtiyaç halinde güncellenebilir; güncel versiyonu sitemizde yayınlanacaktır."],
    en: ["Privacy Policy", "MithraByte website and services personal data processing policy.", "MithraByte acts as the data controller for the processing described herein (MithraByte).\n\nData collected through the current website: name, email address, company (optional), subject (optional), message content provided via the contact form; limited server logs created for technical purposes; and cookie preferences. This data is processed to respond to your inquiry, manage a potential service relationship, maintain website security, and resolve technical issues.\n\nMithraByte's services (local AI/RAG systems, e-commerce infrastructure, custom web applications) are delivered on a project basis. For client projects, personal data processing is typically governed by a separate written agreement; this policy applies only to personal data processed via mithrabyte.com.\n\nProcessing may be based on legal obligations, performance of pre-contractual measures/contract, legitimate interests, or consent where required. No third-party analytics services are currently enabled on the website. Email notification providers, if used, will be listed at [Third-party providers - to be verified]. Data is not currently transferred outside Turkey; any future international transfers will comply with applicable Turkish data protection law.\n\nPersonal data is retained for as long as necessary to fulfill the processing purpose and to comply with statutory retention obligations ([Retention periods - to be verified]). Under KVKK, you have rights of access, rectification, erasure, restriction of processing, objection, data portability (where applicable), and other rights set out in the law. Submit requests to contact@mithrabyte.com. Reasonable technical and organizational measures are implemented to safeguard personal data.\n\nThis policy may be updated; the current version will be published on this website."],
    ku: ["Privacy Policy", "MithraByte website and services personal data processing policy.", "MithraByte acts as the data controller for the processing described herein (MithraByte).\n\nData collected through the current website: name, email address, company (optional), subject (optional), message content provided via the contact form; limited server logs created for technical purposes; and cookie preferences. This data is processed to respond to your inquiry, manage a potential service relationship, maintain website security, and resolve technical issues.\n\nMithraByte's services (local AI/RAG systems, e-commerce infrastructure, custom web applications) are delivered on a project basis. For client projects, personal data processing is typically governed by a separate written agreement; this policy applies only to personal data processed via mithrabyte.com.\n\nProcessing may be based on legal obligations, performance of pre-contractual measures/contract, legitimate interests, or consent where required. No third-party analytics services are currently enabled on the website. Email notification providers, if used, will be listed at [Third-party providers - to be verified]. Data is not currently transferred outside Turkey; any future international transfers will comply with applicable Turkish data protection law.\n\nPersonal data is retained for as long as necessary to fulfill the processing purpose and to comply with statutory retention obligations ([Retention periods - to be verified]). Under KVKK, you have rights of access, rectification, erasure, restriction of processing, objection, data portability (where applicable), and other rights set out in the law. Submit requests to contact@mithrabyte.com. Reasonable technical and organizational measures are implemented to safeguard personal data.\n\nThis policy may be updated; the current version will be published on this website."]
  }],
  ["kvkk-information-notice", {
    tr: ["KVKK Aydınlatma Metni", "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamındaki bilgilendirme.", "Veri sorumlusu: MithraByte (iletişim: contact@mithrabyte.com).\n\nİşlenen veriler: iletişim formu aracılığıyla iletilen ad, e-posta, şirket (isteğe bağlı), konu (isteğe bağlı), mesaj; teknik günlük kayıtları; çerez tercihleri.\n\nİşleme amaçları: talebinize yanıt vermek, olası hizmet ilişkisini yürütmek, güvenlik ve teknik sorunların giderilmesi, yasal yükümlülüklerin yerine getirilmesi.\n\nİşleme dayanakları: ilgili mevzuat hükümleri, sözleşmenin ifası hazırlığı, meşru menfaatler ve gerektiğinde açık rıza.\n\nAktarım yapılacak alıcılar: yalnızca hizmetin yürütülmesi için zorunlu teknik tedarikçiler ve kanunen yetkili makamlar. [TEDARİKÇİ LİSTESİ - BELİRLENMESİ GEREKİYOR].\n\nToplama yöntemi ve hukuki sebebi her işlem faaliyeti için somut olarak belirlenecek, yurt dışına aktarım söz konusu ise KVKK'nın ilgili hükümlerine uygun hareket edilecektir.\n\nKVKK m.11 kapsamındaki haklarınız için contact@mithrabyte.com üzerinden başvurabilirsiniz. Başvurularınız en geç 30 gün içinde yanıtlanacaktır."],
    en: ["KVKK Information Notice", "Information notice under Law No. 6698 on Personal Data Protection.", "Controller: MithraByte (contact: contact@mithrabyte.com).\n\nProcessed data: name, email, company (optional), subject (optional), message via contact form; technical logs; cookie preferences.\n\nPurposes: responding to inquiries, managing potential service relationships, security, technical support, legal compliance.\n\nLegal bases: applicable legal provisions, performance/pre-contractual measures, legitimate interests, consent where required.\n\nRecipients: only necessary technical service providers and competent authorities as required by law ([Provider list - to be verified]).\n\nCollection method and specific legal basis will be determined per processing activity. No international transfers are planned at present; if introduced, KVKK requirements will be observed.\n\nYou may exercise KVKK Article 11 rights by submitting a request to contact@mithrabyte.com. Requests will be responded to within 30 days."],
    ku: ["KVKK Information Notice", "Information notice under Law No. 6698 on Personal Data Protection.", "Controller: MithraByte (contact: contact@mithrabyte.com).\n\nProcessed data: name, email, company (optional), subject (optional), message via contact form; technical logs; cookie preferences.\n\nPurposes: responding to inquiries, managing potential service relationships, security, technical support, legal compliance.\n\nLegal bases: applicable legal provisions, performance/pre-contractual measures, legitimate interests, consent where required.\n\nRecipients: only necessary technical service providers and competent authorities as required by law ([Provider list - to be verified]).\n\nCollection method and specific legal basis will be determined per processing activity. No international transfers are planned at present; if introduced, KVKK requirements will be observed.\n\nYou may exercise KVKK Article 11 rights by submitting a request to contact@mithrabyte.com. Requests will be responded to within 30 days."]
  }],
  ["cookie-policy", {
    tr: ["Çerez Politikası", "Çerezlerin kullanımı hakkında açıklama.", "MithraByte, web sitesinin doğru çalışmasını sağlamak ve gizlilik odaklı bir deneyim sunmak amacıyla çerezleri kullanmaktadır. Şu anda sitemizde yalnızca zorunlu (strictly necessary) çerezler aktif durumdadır; herhangi bir analitik, pazarlama veya takip amaçlı çerez kullanılmamaktadır.\n\nZorunlu çerezler, güvenlik, oturum yönetimi ve temel işlevlerin çalışması için gereklidir ve bu çerezler için onay gerekmez. Gelecekte isteğe bağlı çerezlerin devreye girmesi halinde bu sayfa güncellenecek, kategori bazlı tercih mekanizması ve onay süreci açık bir şekilde sunulacaktır.\n\nÇerez tercihlerinizi tarayıcınızın ayarlarından yönetebilirsiniz. Ancak bazı ayarların değiştirilmesi site işlevselliğini etkileyebilir. Çerezler hakkında detaylı bilgi için Gizlilik Politikamızı inceleyebilirsiniz.\n\nÇerez tercihlerinizi istediğiniz zaman footer > Çerez Ayarları üzerinden değiştirebilir veya iptal edebilirsiniz."],
    en: ["Cookie Policy", "Explanation of cookie usage on this website.", "MithraByte uses cookies to ensure the website functions correctly and to provide a privacy-focused experience. Currently only strictly necessary cookies are enabled; no analytics, marketing, or tracking cookies are used.\n\nStrictly necessary cookies are essential for security, session management, and core functionality and do not require consent. If optional cookies are introduced in the future, this policy will be updated to include granular categories, descriptions, and consent controls.\n\nYou can manage cookie preferences through your browser settings. Changing certain settings may affect website functionality. See our Privacy Policy for more details.\n\nYou can change or withdraw consent for optional cookies at any time via footer > Cookie Settings."],
    ku: ["Cookie Policy", "Explanation of cookie usage on this website.", "MithraByte uses cookies to ensure the website functions correctly and to provide a privacy-focused experience. Currently only strictly necessary cookies are enabled; no analytics, marketing, or tracking cookies are used.\n\nStrictly necessary cookies are essential for security, session management, and core functionality and do not require consent. If optional cookies are introduced in the future, this policy will be updated to include granular categories, descriptions, and consent controls.\n\nYou can manage cookie preferences through your browser settings. Changing certain settings may affect website functionality. See our Privacy Policy for more details.\n\nYou can change or withdraw consent for optional cookies at any time via footer > Cookie Settings."]
  }],
  ["terms-of-use", {
    tr: ["Kullanım Koşulları", "MithraByte web sitesinin kullanımına ilişkin koşullar.", "Bu site yalnızca bilgi edinme ve MithraByte ile iletişim kurma amacıyla sunulmaktadır. MithraByte tarafından sağlanan yerel AI ve RAG sistemleri, e-ticaret altyapıları ve özel web uygulamaları ayrı yazılı sözleşmeler kapsamında gerçekleştirilir.\n\nSiteyi kullanarak bu koşulları kabul etmiş sayılırsınız. Siteyi hukuka aykırı, hizmeti kesintiye uğratacak, fikri hakları ihlal edecek şekilde kullanmamalısınız.\n\nSitedeki içerikler bilgi amaçlıdır ve önceden bildirim yapılmaksızın değiştirilebilir. MithraByte, sitede sunulan bilgilerin doğruluğu, eksiksizliği, güncelliği veya belirli bir sonuca ulaştıracağına dair açık veya zımni garanti vermez.\n\nTüm fikri mülkiyet hakları MithraByte veya ilgili hak sahiplerine aittir; yazılı izin olmaksızın çoğaltılamaz, dağıtılamaz veya kullanılamaz. Açık kaynak bileşenler kendi lisanslarına tabidir.\n\nİlgili hukuki uyuşmazlıklarda [UYGULANACAK HUKUK / YETKİLİ MAHKEME - HUKUKİ İNCELEME GEREKİYOR] geçerlidir."],
    en: ["Terms of Use", "Terms and conditions for using the MithraByte website.", "This site is provided for informational purposes and to contact MithraByte. Local AI/RAG systems, e-commerce infrastructure, and custom web applications are provided only under separate written agreements.\n\nBy using this site, you agree to these terms. Do not use the site unlawfully, disrupt it, or infringe intellectual property rights.\n\nContent may change without notice. MithraByte makes no warranties, express or implied, regarding accuracy, completeness, currency, or fitness for a particular purpose.\n\nAll intellectual property rights belong to MithraByte or their respective owners; reproduction, distribution, or derivative use is prohibited without written permission. Open source components remain subject to their own licenses.\n\nApplicable law and jurisdiction: [Governing law and venue - requires legal review]."],
    ku: ["Terms of Use", "Terms and conditions for using the MithraByte website.", "This site is provided for informational purposes and to contact MithraByte. Local AI/RAG systems, e-commerce infrastructure, and custom web applications are provided only under separate written agreements.\n\nBy using this site, you agree to these terms. Do not use the site unlawfully, disrupt it, or infringe intellectual property rights.\n\nContent may change without notice. MithraByte makes no warranties, express or implied, regarding accuracy, completeness, currency, or fitness for a particular purpose.\n\nAll intellectual property rights belong to MithraByte or their respective owners; reproduction, distribution, or derivative use is prohibited without written permission. Open source components remain subject to their own licenses.\n\nApplicable law and jurisdiction: [Governing law and venue - requires legal review]."]
  }],
  ["intellectual-property", {
    tr: ["Fikri Mülkiyet Bildirimi", "Marka, içerik ve fikri haklara ilişkin açıklama.", "MithraByte adı, logosu, site içeriği, görseller ve yazılım unsurları ilgili hak sahiplerine aittir. Bu unsurların yazılı izin olmaksızın kopyalanması, dağıtılması veya türetilmesi yasaktır.\n\nMüşteri projelerinde geliştirilen kaynak kodu, modeller, veritabanları ve teslim edilecek eserlerin fikri mülkiyet hakları, proje sözleşmesi ile açıkça düzenlenir. Açık kaynak kütüphaneler kendi lisans koşullarına tabidir. İhlal iddiaları için contact@mithrabyte.com üzerinden iletişime geçilmelidir."],
    en: ["Intellectual Property Notice", "Notice regarding trademarks, content, and intellectual property.", "The MithraByte name, logo, website content, graphics, and software elements are owned by their respective rights holders. No copying, distribution, or derivative use without written permission.\n\nFor client projects, intellectual property rights in source code, models, databases, and deliverables are governed by the relevant project agreement. Open source libraries are subject to their own licenses. Claims of infringement should be directed to contact@mithrabyte.com."],
    ku: ["Intellectual Property Notice", "Notice regarding trademarks, content, and intellectual property.", "The MithraByte name, logo, website content, graphics, and software elements are owned by their respective rights holders. No copying, distribution, or derivative use without written permission.\n\nFor client projects, intellectual property rights in source code, models, databases, and deliverables are governed by the relevant project agreement. Open source libraries are subject to their own licenses. Claims of infringement should be directed to contact@mithrabyte.com."]
  }]
];
export async function seedLegalPages() {
  for (const [slug, locales] of LEGAL_PAGES) {
    const key = `legal.${slug}`;
    const existing = await prisma.page.findUnique({ where: { key } });
    const localeEntries = Object.entries(locales).map(([locale, [title, subtitle, body]]) => ({ locale, title, subtitle, body, seoTitle: `${title} | MithraByte`, seoDescription: subtitle }));
    if (existing) {
      await prisma.page.update({ where: { id: existing.id }, data: { isSystem: true, isActive: true } });
      for (const entry of localeEntries) {
        await prisma.pageLocale.upsert({
          where: { pageId_locale: { pageId: existing.id, locale: entry.locale } },
          update: { title: entry.title, subtitle: entry.subtitle, body: entry.body, seoTitle: entry.seoTitle, seoDescription: entry.seoDescription },
          create: { pageId: existing.id, locale: entry.locale, title: entry.title, subtitle: entry.subtitle, body: entry.body, seoTitle: entry.seoTitle, seoDescription: entry.seoDescription }
        });
      }
      console.log(`[seed] Updated legal page "${key}".`);
    } else {
      await prisma.page.create({ data: { key, isSystem: true, isActive: true, locales: { create: localeEntries } } });
      console.log(`[seed] Created legal page "${key}".`);
    }
  }
}

export async function runSeed() {
  const admin = await seedAdmin();
  await seedSettings();
  const catalog = await seedCatalog();
  await seedLegalPages();
  return { admin, catalog };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runSeed()
    .catch((err) => {
      console.error("[seed] Failed:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
