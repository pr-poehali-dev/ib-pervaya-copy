import Layout from "@/components/layout/Layout";
import AdminCatalogPanel from "@/components/admin/catalog/AdminCatalogPanel";
import Icon from "@/components/ui/icon";

export default function Catalog() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <Icon name="BookOpen" size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Каталог курсов</h1>
            <p className="text-muted-foreground text-sm">Курсы платформы и собственные курсы тенанта</p>
          </div>
        </div>
        <AdminCatalogPanel />
      </div>
    </Layout>
  );
}
