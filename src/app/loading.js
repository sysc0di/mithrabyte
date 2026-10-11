export default function Loading() {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <style>
        body {
          margin: 0;
          background: #000000;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          overflow: hidden;
          font-family: sans-serif;
        }
        .loader {
          display: flex;
          gap: 8px;
        }
        .loader div {
          width: 12px;
          height: 48px;
          background: #D3D5FD;
          animation: bounce 2s infinite ease-in-out;
        }
        .loader div:nth-child(2) {
          animation-delay: 0.3s;
        }
        .loader div:nth-child(3) {
          animation-delay: 0.6s;
        }
        @keyframes bounce {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.2); }
        }
      </style>
      <div class="loader">
        <div></div><div></div><div></div>
      </div>
    `}} />
  );
}
