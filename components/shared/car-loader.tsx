/**
 * CarLoader — full-viewport animated loader used as the default Suspense
 * fallback for every route group via `loading.tsx`. Adapted from the user's
 * reference: a parallax highway / city / flowers backdrop with a car bobbing
 * on the road and two spinning wheels. CSS animations only — no JS.
 */
export function CarLoader() {
  return (
    <div className="rnp-loader">
      <div className="rnp-loader__highway" />
      <div className="rnp-loader__city" />
      <div className="rnp-loader__flower" />

      <div className="rnp-loader__car">
        <img
          src="https://www.aartiinformatics.com/wp-content/uploads/2014/09/new-sports-car.png"
          alt=""
          aria-hidden="true"
        />
      </div>

      <div className="rnp-loader__wheel">
        <img
          src="https://pngimg.com/uploads/car_wheel/car_wheel_PNG23306.png"
          alt=""
          aria-hidden="true"
          className="rnp-loader__wheel-back"
        />
        <img
          src="https://pngimg.com/uploads/car_wheel/car_wheel_PNG23306.png"
          alt=""
          aria-hidden="true"
          className="rnp-loader__wheel-front"
        />
      </div>

      <span className="sr-only" role="status">Loading…</span>

      <style>{`
        .rnp-loader {
          position: fixed;
          inset: 0;
          height: 100vh;
          width: 100%;
          background-image: url(/animation-bg-image.png);
          background-size: cover;
          background-position: center;
          overflow: hidden;
          z-index: 60;
        }

        .rnp-loader__highway {
          height: 200px;
          width: 500%;
          background-image: url(https://us.123rf.com/450wm/andreykuzmin/andreykuzmin1605/andreykuzmin160500066/56495798-asphalt-highway-road-marks-top-view.jpg?ver=6);
          background-repeat: repeat-x;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1;
          animation: rnp-loader-highway 5s linear infinite;
        }
        @keyframes rnp-loader-highway {
          100% { transform: translateX(-3400px); }
        }

        .rnp-loader__city {
          height: 900px;
          width: 500%;
          background-image: url(https://i.pinimg.com/originals/03/42/f0/0342f0d771ed35ab0cf65fe58e5293ff.png);
          background-repeat: repeat-x;
          position: absolute;
          bottom: 200px;
          left: 0;
          right: 0;
          z-index: 1;
          animation: rnp-loader-city 20s linear infinite;
        }
        @keyframes rnp-loader-city {
          100% { transform: translateX(-1400px); }
        }

        .rnp-loader__flower {
          height: 301px;
          width: 500%;
          background-image: url(https://amberry.co.uk/wp/wp-content/uploads/2017/08/daisy-grass-am-1.png);
          background-repeat: repeat-x;
          position: absolute;
          bottom: 200px;
          left: 0;
          right: 0;
          z-index: 1;
          animation: rnp-loader-city 20s linear infinite;
        }

        .rnp-loader__car {
          width: 500px;
          left: 50%;
          bottom: 100px;
          transform: translateX(-50%);
          position: absolute;
          z-index: 2;
        }
        .rnp-loader__car img {
          width: 100%;
          animation: rnp-loader-car 1s linear infinite;
        }
        @keyframes rnp-loader-car {
          0%, 50%, 100% { transform: translateY(-1px); }
        }

        .rnp-loader__wheel {
          left: 50%;
          bottom: 179px;
          transform: translateX(-50%);
          position: absolute;
          z-index: 2;
        }
        .rnp-loader__wheel img {
          width: 72px;
          height: 72px;
          animation: rnp-loader-wheel 1s linear infinite;
        }
        .rnp-loader__wheel-back  { left: -165px; position: absolute; }
        .rnp-loader__wheel-front { left:   90px; position: absolute; }
        @keyframes rnp-loader-wheel {
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .rnp-loader__car   { width: 280px; bottom: 120px; }
          .rnp-loader__wheel { bottom: 160px; }
          .rnp-loader__wheel img { width: 44px; height: 44px; }
          .rnp-loader__wheel-back  { left: -95px; }
          .rnp-loader__wheel-front { left:  52px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .rnp-loader__highway,
          .rnp-loader__city,
          .rnp-loader__flower,
          .rnp-loader__car img,
          .rnp-loader__wheel img {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
