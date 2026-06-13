import TopNav from "@/components/layout/TopNav";
import SidebarOperator from "@/components/layout/SidebarOperator";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav mode="operator" />
      <div className="flex flex-1 w-full relative">
        <SidebarOperator />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
