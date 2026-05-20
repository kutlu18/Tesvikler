db = db.getSiblingDB("tesvikler_v2");

if (!db.getCollectionNames().includes("companies")) {
  db.createCollection("companies");
}

if (!db.getCollectionNames().includes("opportunities")) {
  db.createCollection("opportunities");
}

print("tesvikler_v2 init complete");
