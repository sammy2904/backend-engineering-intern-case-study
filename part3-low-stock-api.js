// Low Stock Alert API using Node.js and Express

app.get('/api/companies/:company_id/alerts/low-stock', async (req, res) => {
  const { company_id } = req.params;

  try {
    const inventories = await Inventory.findAll({
      include: [
        {
          model: Warehouse,
          where: { company_id }
        },
        {
          model: Product,
          include: [Supplier]
        }
      ]
    });

    const alerts = [];

    inventories.forEach(inv => {
      const product = inv.Product;

      if (inv.quantity < product.low_stock_threshold) {
        const supplier = product.Suppliers?.[0] || null;

        alerts.push({
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          warehouse_id: inv.Warehouse.id,
          warehouse_name: inv.Warehouse.name,
          current_stock: inv.quantity,
          threshold: product.low_stock_threshold,
          days_until_stockout: 10,
          supplier: supplier
            ? {
                id: supplier.id,
                name: supplier.name,
                contact_email: supplier.contact_email
              }
            : null
        });
      }
    });

    res.json({
      alerts,
      total_alerts: alerts.length
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
