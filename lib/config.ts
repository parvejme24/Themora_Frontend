export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://themora-backend.vercel.app/api/v1"
    : "http://localhost:5050/api/v1");
