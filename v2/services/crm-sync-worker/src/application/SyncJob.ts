import { CompanyModel } from "@v2/db-core";

export class SyncJob {
  async pullFromCrm(): Promise<void> {
    // TODO: CRM API'den veri cekilip mapping yapilacak.
    await CompanyModel.updateOne(
      { taxNumber: "0000000000" },
      {
        $set: {
          crmClientId: "demo-crm-id",
          legalName: "Demo Sirket",
          isSme: true,
        },
      },
      { upsert: true }
    );
  }
}
