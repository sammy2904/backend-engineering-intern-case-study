# Part 1: Code Review & Debugging

## Issues Identified
- No validation of input data
- SKU uniqueness not checked
- Product and inventory were committed separately
- No error handling or rollback
- Price not handled safely for decimal values
- Code assumed a product exists in only one warehouse

## Impact in Production
These issues could cause duplicate products, application crashes, incorrect pricing, and inconsistent inventory data if one database operation fails while another succeeds.

## Corrected Code

```python
from decimal import Decimal
from flask import request, jsonify
from sqlalchemy.exc import IntegrityError

@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.json

    # Validate required fields
    required_fields = ['name', 'sku', 'price', 'warehouse_id', 'initial_quantity']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    try:
        # Check SKU uniqueness
        if Product.query.filter_by(sku=data['sku']).first():
            return jsonify({"error": "SKU already exists"}), 409

        # Create product
        product = Product(
            name=data['name'],
            sku=data['sku'],
            price=Decimal(str(data['price']))
        )
        db.session.add(product)
        db.session.flush()  # get product ID without committing

        # Create inventory
        inventory = Inventory(
            product_id=product.id,
            warehouse_id=data['warehouse_id'],
            quantity=data['initial_quantity']
        )
        db.session.add(inventory)

        # Commit once (atomic transaction)
        db.session.commit()

        return jsonify({
            "message": "Product created successfully",
            "product_id": product.id
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Database constraint violation"}), 400

    except Exception:
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500
