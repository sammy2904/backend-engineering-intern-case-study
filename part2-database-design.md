# Part 2: Database Design

## Tables Designed

### companies
- id (Primary Key)
- name

### warehouses
- id (Primary Key)
- company_id (Foreign Key)
- name
- location

### products
- id (Primary Key)
- name
- sku (Unique)
- price
- low_stock_threshold

### inventory
- id (Primary Key)
- product_id (Foreign Key)
- warehouse_id (Foreign Key)
- quantity

### suppliers
- id (Primary Key)
- name
- contact_email

### product_suppliers
- product_id
- supplier_id

## Design Decisions
- Separate inventory table allows products to exist in multiple warehouses
- Unique SKU ensures product identification across the platform
- Supplier mapping allows flexible vendor management

## Assumptions & Questions

Assumptions:
- Recent sales means last 30 days
- Each product has a low-stock threshold
- One main supplier is used for alerts

Questions:
1. Can a product have multiple suppliers?
2. How is recent sales activity defined exactly?
3. Should discontinued products be included in alerts?
