import Footer from '@/components/Footer/Footer'
import Navbar from '@/components/Navbar/Navbar'
import AboutUs from '@/components/Pages/AboutUs'
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const copy = locale === "tr" ? ["MithraByte Hakkında | Gizlilik Odaklı AI", "Veri kontrolünü işletmede tutan yerel yapay zeka ve özel yazılım ekibi."]
    : locale === "ku" ? ["Derbarê MithraByte | AI-ya Taybet", "Tîma AI-ya herêmî û nermalava taybet ku kontrola daneyan li cem karsaziyê dihêle."]
    : ["About MithraByte | Privacy-First AI", "A team building local AI and custom software around business control of data."];
  return { title: copy[0], description: copy[1], alternates: { canonical: `/${locale}/aboutus` } };
}

function page() {
  return (
    <div className="pagewrapped" >
    <Navbar/>
    <AboutUs/>
     <Footer/>
    </div>
  )
}

export default page
