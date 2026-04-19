import { Request, Response } from "express";

// export const serverRunningTemplate = (req:Request, res: Response) => {
//   res.status(200).send(`
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//       <title>Server Running</title>
//       <style>
//         body {
//           margin: 0;
//           height: 100vh;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           background: #0f172a;
//           color: #e5e7eb;
//           font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
//         }
//         .box {
//           text-align: center;
//         }
//         h1 {
//           font-size: 2.2rem;
//           margin-bottom: 8px;
//           color: #22c55e;
//         }
//         p {
//           opacity: 0.8;
//           font-size: 1rem;
//         }
//         .dot {
//           animation: blink 1.5s infinite;
//         }
//         @keyframes blink {
//           0% { opacity: 0.2; }
//           50% { opacity: 1; }
//           100% { opacity: 0.2; }
//         }
//       </style>
//     </head>
//     <body>
//       <div class="box">
//         <h1>🚀 Server is Running<span class="dot">...</span></h1>
//         <p>Backend is live and ready to accept requests</p>
//       </div>
//     </body>
//     </html>
//   `);
// };



export const serverRunningTemplate = (req: Request, res: Response) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Hesteka Backend</title>

      <style>
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #0f172a, #020617);
          color: #e2e8f0;
        }

        .card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 40px 50px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          animation: fadeIn 0.8s ease;
        }

        h1 {
          font-size: 2rem;
          margin-bottom: 10px;
          color: #22c55e;
        }

        p {
          font-size: 1rem;
          opacity: 0.8;
          margin-bottom: 20px;
        }

        .status {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .pulse {
          display: inline-block;
          width: 8px;
          height: 8px;
          margin-right: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        footer {
          margin-top: 15px;
          font-size: 0.75rem;
          opacity: 0.5;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
    </head>

    <body>
      <div class="card">
        <h1>🚀 Hesteka Backend</h1>
        <p>Backend is live and ready to respond</p>

        <div class="status">
          <span class="pulse"></span>Running
        </div>

        <footer>
          © ${new Date().getFullYear()} Hesteka API
        </footer>
      </div>
    </body>
    </html>
  `);
};