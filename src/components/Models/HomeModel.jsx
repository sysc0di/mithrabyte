import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

// Tam Merkez: Hakkari koordinatları
const HAKKARI = [37.5666, 44.2833];

// Dünyanın tüm kıtalarını kapsayan devasa global ağ
const CITIES = {
  // Türkiye İçi Stratejik Noktalar
  istanbul: [41.0082, 28.9784],
  ankara: [39.9334, 32.8597],
  izmir: [38.4237, 27.1428],
  van: [38.5012, 43.3730],

  // Kuzey & Güney Amerika (Batı)
  newyork: [40.7128, -74.0060],
  silikon_vadisi: [37.7749, -122.4194], // San Francisco
  sao_paulo: [-23.5505, -46.6333],      // Brezilya Ticaret Merkezi
  toronto: [43.6532, -79.3832],

  // Avrupa & İskandinavya
  paris: [48.8566, 2.3522],
  munih: [48.1351, 11.5820],
  london: [51.5074, -0.1278],
  finlandiya: [60.1699, 24.9384],       // Helsinki
  amsterdam: [52.3676, 4.9041],

  // Asya & Pasifik (Doğu)
  pekin: [39.9042, 116.4074],
  tokyo: [35.6895, 139.6917],
  singapur: [1.3521, 103.8198],         // Güneydoğu Asya Finans Merkezi
  mumbai: [19.0760, 72.8777],

  // Körfez Bölgesi
  dubai: [25.2048, 55.2708],

  // Avustralya & Afrika (Güney)
  sidney: [-33.8688, 151.2093],
  cape_town: [-33.9249, 18.4241],       // Güney Afrika
};

export default function Model() {
  const canvasRef = useRef();
  const containerRef = useRef();
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSize({
          width: rect.width * 2,
          height: rect.height * 2,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (size.width === 0 || size.height === 0) return;

    let phi = -2.4; 
    let animationFrameId;

    // Noktalar (Hakkari + Tüm Global Şehirler)
    const markers = [
      { location: HAKKARI, size: 0.065, id: 'hakkari' }, // Merkez üssü hafif büyük
      ...Object.keys(CITIES).map((key) => ({
        location: CITIES[key],
        size: 0.03, // Şehir sayısı arttığı için noktaları hafif küçülttük, estetik dursun
        id: key,
      })),
    ];

    // Devasa Global Yay Bağlantıları
    const arcs = Object.keys(CITIES).map((key) => ({
      from: HAKKARI,
      to: CITIES[key],
    }));

    // İstediğin özel siber-mavi/gri tonu: rgba(206, 215, 247, 0.5) -> [R, G, B]
    const customColor = [0.807, 0.843, 0.968];

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: size.width,
      height: size.height,
      phi: phi,
      theta: 0.28, // Kavislerin derinliğini kaybetmemek için bakış açısı optimize edildi
      dark: 1,
      diffuse: 1.2,
      mapSamples: 18000, // Şehir detayları için harita örneklemesini hafif artırdık
      mapBrightness: 10,
      baseColor: [0.11, 0.13, 0.17], 
      glowColor: [0.07, 0.09, 0.13],  
      opacity: 1,
      
      markers: markers,
      markerColor: customColor,
      
      arcs: arcs,
      arcColor: customColor,
      arcWidth: 0.4, // Çizgiler üst üste binerken çorba olmasın diye kalınlığı 0.4'e çektik (Çok zarif durur)
      arcHeight: 0.4, // Çizgilerin atmosferde yükselme miktarını artırdık, katmanlı global hissi güçlendi
    });

    const animate = () => {
      phi += 0.0012; // Dönüş hızı (Ağ yoğun olduğu için dünyayı izlemek daha keyifli olsun diye hafif yavaşlattık)
      globe.update({ phi: phi });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      globe.destroy();
      cancelAnimationFrame(animationFrameId);
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        maxWidth: "600px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}