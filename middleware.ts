import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin/login",
  },
});

export const config = {
  // Hanya memproteksi halaman admin, halaman operator tetap public tanpa login
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/data/:path*",
    "/admin/settings/:path*",
  ],
};
