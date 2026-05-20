import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { ModuleModel, SupportProgramModel } from "../models/index.js";

const modules = [
  { key: "SGK", name: "SGK Teşvikleri" },
  { key: "KOSGEB", name: "KOSGEB Destekleri" },
  { key: "TUBITAK", name: "TÜBİTAK Destekleri" },
  { key: "YATIRIM", name: "Yatırım Teşvikleri" },
  { key: "TICARET", name: "Ticaret Bakanlığı Destekleri" },
];

const samplePrograms = [
  { moduleKey: "KOSGEB", code: "KOSGEB_GIRISIMCI", name: "KOSGEB Girişimci Destek Programı", legalBasis: "KOSGEB Uygulama Esasları" },
  { moduleKey: "TUBITAK", code: "TUBITAK_1507", name: "TÜBİTAK 1507", legalBasis: "TEYDEB Program Esasları" },
  { moduleKey: "YATIRIM", code: "YATIRIM_GENEL", name: "Genel Yatırım Teşvikleri", legalBasis: "2025/9903" },
  { moduleKey: "TICARET", code: "TIC_5973_PAZAR", name: "Pazara Giriş Belgesi", legalBasis: "5973" },
];

async function seed(): Promise<void> {
  await connectDatabase();

  for (const moduleItem of modules) {
    await ModuleModel.updateOne({ key: moduleItem.key }, { $set: moduleItem }, { upsert: true });
  }

  for (const program of samplePrograms) {
    await SupportProgramModel.updateOne(
      { moduleKey: program.moduleKey, code: program.code },
      { $set: program },
      { upsert: true },
    );
  }

  console.log("Seed completed");
  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error(error);
  await disconnectDatabase();
  process.exit(1);
});
