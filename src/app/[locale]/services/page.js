import Footer from '@/components/Footer/Footer'
import Navbar from '@/components/Navbar/Navbar'
import Services from '@/components/Pages/Services'

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const copy = locale === "tr"
    ? ["Yerel Yapay Zeka ve Özel Yazılım | MithraByte", "Yerel AI, özel asistanlar, iş otomasyonu ve e-ticaret altyapısı."]
    : locale === "ku"
      ? ["AI-ya Herêmî û Nermalava Taybet | MithraByte", "AI-ya xweser, alîkarên taybet, otomasyon û binesaziya e-ticaretê."]
      : ["Local AI & Custom Software | MithraByte", "Private AI assistants, business automation, custom integrations, and e-commerce infrastructure."];
  return { title: copy[0], description: copy[1], alternates: { canonical: `/${locale}/services` } };
}


function page() {
  return (
    <div className='pagewrapped' >
        <Navbar/>
        <Services/>
        <Footer/>

    </div>
  )
}

export default page
