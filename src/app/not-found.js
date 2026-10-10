export const metadata = {
  title: "Sayfa Bulunamadı",
};

export default function NotFound() {
  return (
    <div className="nf-wrap">
      <style>{`
        body {
          background: #06091A;
        }
        .nf-wrap {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          font-family: "Onest", system-ui, sans-serif;
          box-sizing: border-box;
          text-align: center;
          padding: 1.5rem;
        }
        .nf-wrap h1 {
          font-size: 4rem;
          margin: 0;
        }
        .nf-wrap p {
          margin-top: 1rem;
          font-size: 1.25rem;
          opacity: 0.6;
        }
        .nf-wrap a {
          position: relative;
          margin-top: 2rem;
          padding: 0.75rem 1.5rem;
          color: #927FBF;
          text-decoration: none;
          border-radius: 8px;
          transition: background 0.3s;
        }
        .nf-wrap a::after {
          content: "";
          position: absolute;
          background-color: #927FBF;
          width: 20px;
          height: 2px;
          bottom: 0;
          left: 50%;
          transition: ease-in-out 1s;
        }
        .nf-wrap a:hover::after {
          left: 0;
          width: 100%;
        }
      `}</style>
      <h1>404</h1>
      <p>Aradığın sayfa bulunamadı.</p>
      <a href="/en">Ana Sayfa</a>
    </div>
  );
}