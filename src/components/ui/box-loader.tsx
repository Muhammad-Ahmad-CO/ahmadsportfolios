import type React from "react";

const Loader: React.FC = () => {
  const boxes = [
    { anim: "box1 1.2s ease-in-out infinite", x: 0, y: 0 },
    { anim: "box2 1.2s ease-in-out infinite", x: 0, y: 0 },
    { anim: "box3 1.2s ease-in-out infinite", x: 0, y: 0 },
    { anim: "box4 1.2s ease-in-out infinite", x: 0, y: 0 },
  ];

  return (
    <div className="box-loader-root">
      <div className="box-loader-grid">
        {boxes.map((b, i) => (
          <span
            key={i}
            className="box-loader-cell"
            style={{ animation: b.anim }}
          />
        ))}
      </div>
      <style>{`
        .box-loader-root {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .box-loader-grid {
          position: relative;
          width: 96px;
          height: 96px;
        }
        .box-loader-cell {
          position: absolute;
          top: 0;
          left: 0;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: linear-gradient(160deg, #D7E2EA 0%, #646973 100%);
          box-shadow: 0 6px 20px rgba(215,226,234,0.18);
        }
        .box-loader-cell:nth-child(1) { animation-name: box1 !important; }
        .box-loader-cell:nth-child(2) { animation-name: box2 !important; }
        .box-loader-cell:nth-child(3) { animation-name: box3 !important; }
        .box-loader-cell:nth-child(4) { animation-name: box4 !important; }
      `}</style>
    </div>
  );
};

export default Loader;
