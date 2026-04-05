import { createAdminHandler } from "@/../../packages/admin-kit/src/handler";
import { getAdminFirestore } from "@/lib/firebase-admin";

export const { GET, POST } = createAdminHandler({
  projectId: "goodzz",
  projectName: "GOODZZ",

  async getStats() {
    try {
      const db = await getAdminFirestore();
      const [usersSnap, productsSnap, ordersSnap] = await Promise.all([
        db.collection("users").count().get(),
        db.collection("products").count().get(),
        db.collection("orders").where("status", "==", "paid").count().get(),
      ]);
      return {
        totalUsers: usersSnap.data().count ?? 0,
        contentCount: productsSnap.data().count ?? 0,
        mau: ordersSnap.data().count ?? 0,
        recentSignups: 0,
      };
    } catch {
      return { totalUsers: 0, contentCount: 0, mau: 0, recentSignups: 0 };
    }
  },

  async getRecentActivity() {
    try {
      const db = await getAdminFirestore();
      const snap = await db
        .collection("orders")
        .orderBy("createdAt", "desc")
        .limit(5)
        .get();
      return snap.docs.map((d) => ({
        id: d.id,
        type: "content" as const,
        label: (d.data().productName as string) ?? "주문",
        timestamp:
          d.data().createdAt?.toDate?.()?.toISOString() ??
          new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  async getResource(resource, searchParams) {
    try {
      const db = await getAdminFirestore();
      if (resource === "products") {
        const status = searchParams.get("status");
        if (status) {
          const snap = await db
            .collection("products")
            .where("status", "==", status)
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();
          return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        }
        const snap = await db
          .collection("products")
          .orderBy("createdAt", "desc")
          .limit(50)
          .get();
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      }
      if (resource === "orders") {
        const status = searchParams.get("status");
        if (status) {
          const snap = await db
            .collection("orders")
            .where("status", "==", status)
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();
          return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        }
        const snap = await db
          .collection("orders")
          .orderBy("createdAt", "desc")
          .limit(50)
          .get();
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      }
      if (resource === "users") {
        const snap = await db
          .collection("users")
          .orderBy("createdAt", "desc")
          .limit(50)
          .get();
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      }
      return null;
    } catch {
      return null;
    }
  },
});
