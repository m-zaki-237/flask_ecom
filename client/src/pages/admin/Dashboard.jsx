import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    payments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, products, orders, payments] = await Promise.all([
          api.get("/users"),
          api.get("/product"),
          api.get("/orders"),
          api.get("/payments"),
        ]);

        setStats({
          users: users.data.length,
          products: products.data.products.length,
          orders: orders.data.orders.length,
          payments: payments.data.length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users, bg: "bg-blue-500" },
    { label: "Total Products", value: stats.products, bg: "bg-green-500" },
    { label: "Total Orders", value: stats.orders, bg: "bg-yellow-500" },
    { label: "Total Payments", value: stats.payments, bg: "bg-purple-500" },
  ];

  if (loading)
    return (
      <AdminLayout>
        <p className="text-gray-500">Loading...</p>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} text-white rounded-lg p-6`}
          >
            <p className="text-sm opacity-80">{card.label}</p>
            <p className="text-4xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
