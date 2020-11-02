import { readOne, readAll } from "../models/database";

export async function getTenant(id: string) {
  const tenant: any = await readOne(id);

  return new Promise((resolve) => {
    resolve(tenant ?? null);
  });
}

export async function getTenantTemplateConfig(id: string, template_id: string) {
  const tenants: any = await readAll();

  return new Promise((resolve) => {
    const _tenant = tenants.find((tenant: { template_id: string; id: string }) => {
      if (tenant.template_id && template_id !== "") {
        return tenant.id === id && tenant.template_id === template_id;
      } else {
        return tenant.id === id;
      }
    });

    resolve(_tenant ? _tenant.template.contact_form : null);
  });
}
