import Footer from '@/components/Footer/Footer'
import Navbar from '@/components/Navbar/Navbar'
import AboutUs from '@/components/Pages/AboutUs'
import React from 'react'
export const metadata = {
  title: "Hakkımızda | Mithrabyte",
  description: "Mithrabyte hakkında detaylı bilgileri burada bulabilirsiniz.",
};

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