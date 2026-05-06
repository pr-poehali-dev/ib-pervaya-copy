import Layout from "@/components/layout/Layout";
import Icon from "@/components/ui/icon";
import TenantsPanel from "@/components/superadmin/TenantsPanel";

export default function SupportTenants() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <Icon name="Building2" size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Тенанты</h1>
            <p className="text-muted-foreground text-sm">Просмотр организаций, подписок и сроков договоров</p>
          </div>
        </div>

        <TenantsPanel canCreate={false} canEdit={false} />
      </div>
    </Layout>
  );
}
