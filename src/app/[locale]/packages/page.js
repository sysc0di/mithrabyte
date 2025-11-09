import Footer from '@/components/Footer/Footer'
import Navbar from '@/components/Navbar/Navbar'
import Packages from '@/components/Pages/Packages'
import React from 'react'

export const metadata = {
  title: "Paketler | Mithrabyte",
  description: "Paketlerimiz hakkında detaylı bilgileri burdan bulabilirsiniz",
}; 

function page() {
  return (
    <div className='pagewrapped' >
        <Navbar/>
        <Packages/>
        <Footer/>

    </div>
  )
}

export default page
