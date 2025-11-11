export default function NotFound() {
    return (
        <html>
            <head>
                <title>Sayfa Bulunamadı</title>
                <style>{`
          body {
            margin: 0;
            background: #0e0e0e;
            color: #fff;
              font-family: "Turret Road", sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            flex-direction: column;
          }
          h1 {
            font-size: 4rem;
            margin: 0;
          }
          p {
            margin-top: 1rem;
            font-size: 1.25rem;
            opacity: 0.6;
          }
          a {
           position:relative;
            margin-top: 2rem;
            padding: 0.75rem 1.5rem;
            background: ;
            color: #cdd2e7ff;
            text-decoration: none;
            border-radius: 8px;
            transition: background 0.3s;
          }
          
  a::after{
            content:"";
            position:absolute;
            background-color:#cdd2e7ff;
            width:20px;
            height:2px;
            bottom:0;
            left:50%;
            transition: ease-in-out 1s;
            
            }

          a:hover::after {
            left:0;
            width:100%;
          }
        `}</style>
            </head>
            <body>
                <h1>404</h1>
                <p>Aradığın sayfa bulunamadı.</p>
                <a href="/en">Ana Sayfa</a>
            </body>
        </html>
    );
}
