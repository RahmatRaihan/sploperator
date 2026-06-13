import TopNav from "@/components/layout/TopNav";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import Footer from "@/components/layout/Footer";
import NextAuthProvider from "@/components/providers/NextAuthProvider";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthProvider>
      <TopNav mode="admin" />
      <div className="flex flex-1 w-full bg-slate-50/30">
        <SidebarAdmin />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </NextAuthProvider>
  );
}
