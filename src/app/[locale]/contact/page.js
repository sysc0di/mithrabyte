import React from 'react'
import Navbar from '@/components/Navbar/Navbar'
import Footer from '@/components/Footer/Footer'
import Contact from  '@/components/Pages/Contact'

export const metadata = {
  title: "İletişim | Mithrabyte",
  description: "Mithrabyte ile iletişime geçmek için iletişim bilgileri ve form.",
};

function page() {
  return (
    <div className='pagewrapped'>
    <Navbar/>
    <Contact/>
    <Footer/>
    </div>
  )
}

export default page