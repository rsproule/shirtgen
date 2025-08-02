import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname || ".", "./src"),
    },
  },
  server: {
    proxy: {
      '/api/printify': {
        target: 'https://api.printify.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/printify/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add auth header for Printify
            proxyReq.setHeader(
              "Authorization",
              `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjNhYzJmN2Q2MjE1ODQ2NzYyMTg2MTc2ODRlYjI1ODBhMDY0ODM1NjE1ZjFjMDk2YmRlZDVjZGFlODY4MTQxYzYwYTM0OTYxMDMxYWE5MjUwIiwiaWF0IjoxNzU0MTY5MjUyLjMxMTc1MSwibmJmIjoxNzU0MTY5MjUyLjMxMTc1NCwiZXhwIjoxNzg1NzA1MjUyLjI5NTg3Mywic3ViIjoiMjQxNTM5NTEiLCJzY29wZXMiOlsic2hvcHMucmVhZCIsInByb2R1Y3RzLnJlYWQiLCJwcm9kdWN0cy53cml0ZSIsInVwbG9hZHMucmVhZCIsInVwbG9hZHMud3JpdGUiXX0.bRZ2Wa1wdViYSpTE6ow5Yds6FYcAp-00gaJuw1fYbOzaEhG0JoSPlHNUcArEJn9gILuYdMV2ENq9I3_Ts1XFC08JMa5B2TQUn25LPjMZQ0vgFC40y75I2VdHRs0qGo9-KuaBwsQrkvY-OThl2xKcWWnZVrVTXiUQJjDGSHlyXwwoto1fiOhRoCyalcQG7Jf7oVmBT5lWG6GIzfLHygS3HKSMwLhxJ1r-DCqv3y4I5mttOxbH8JOlKnneeRXeT64NfEXAd3P4t8ExcJkaR6B5zqvLv2a_jaULY0Vn-ePtX5tfPcwsShb4923JsQKGslR4abU_5CGlRvAL2B2Qk-P0V_hama8WcyShq-dRLZFCXbHIiLRwSKfvEWkaUZAmiq-HMeDaZs83FEOVVNmVyXKKzksjcvAc3pPkzSfhPPILaErYjb4AGVBqdq9VjmWuVC5VJ9Tx12Doaqttp-TtjmUHiliRkxzOjBjSWDFvY-xUPgA-ak-D_JUhgmUTt-yyLEMgagJXgu_g17IsbQnA6jGviReZSI2PnuKXY8SlB-kADdCggHkYNO2cYitv2YSUS-DUO6Zno6lR7-5oQxhx2irbzeNuNyi8bImlCKyipoZDgurMSn9MkauIUyn5ueP_ZkFcad3-cAfzOEX0VzJ9vvJiYALcEfvfBxEgJWUuWAgmunU`,
            );
          });
        }
      }
    }
  }
});
