# Comprehensive GST & Food Industry Compliance Specification (India)
## Version: 2026.1.0 (Latest Compliance)
## Business Context: Spices (Masala), Packaged Foods, and Edible Oils (e.g., Mustard Oil)

---

## 1. System Constants & String Validation Layout

Your coding agent must implement strict client-side and server-side RegEx validations for these primary identification fields.

### 1.1 GSTIN Validation (Supplier & Recipient)
* **Format:** `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`
* **Length:** Exactly 15 characters.
* **Component Breakdown:**
  * Digits 1-2: State Code (e.g., `09` for Uttar Pradesh, `07` for Delhi).
  * Digits 3-12: PAN of the entity.
  * Digit 13: Entity number string registration within a state.
  * Digit 14: Default character 'Z'.
  * Digit 15: Checksum digit.

### 1.2 FSSAI License Validation (Food Safety)
* **Format:** `^[0-9]{14}$`
* **Length:** Exactly 14 numeric digits.
* **Rule:** Mandatory field for any food manufacturing, wholesale, or distribution business. Must be displayed conspicuously in the invoice header near the GSTIN.

### 1.3 Invoice Serial Numbering
* **Format:** Mask allows uppercase alphabets (`A-Z`), numerals (`0-9`), hyphens (`-`), and forward slashes (`/`).
* **Length:** Maximum 16 characters.
* **Reset Lifecycle:** Must be sequentially unique and reset cleanly at the start of every Financial Year (April 1st).

---

## 2. Industry Tax Slabs & Product Masters (Food & Edible Oils)

Configure your product inventory master tables with these default mapping states under standard Indian GST rate structures.

| Product Category | HSN Code String | Default GST Rate | Cess % | Legal Class |
| :--- | :--- | :--- | :--- | :--- |
| **Branded Spices (Masala)** | `0910` (or 6/8 digit specific) | **5%** (2.5% CGST + 2.5% SGST) | 0% | Taxable Packaged |
| **Mustard Oil / Cooking Oils** | `1514` / `1515` / `1516` | **5%** (2.5% CGST + 2.5% SGST) | 0% | Taxable Packaged |
| **Loose/Unbranded Foodgrains**| `1006` / `1101` | **0%** (Exempt) | 0% | Exempt Commodity |

### 2.1 HSN Digit Precision Level
The system must automatically validate the minimum length of HSN strings based on the business's aggregated annual turnover:
* **Turnover < ₹5 Crores:** Minimum **4 digits** required for B2B.
* **Turnover ≥ ₹5 Crores:** Minimum **6 digits** required for all invoices.
* **Export Invoices:** Minimum **8 digits** strictly enforced.

---

## 3. Legal Metrology Dual-Unit Disclosures

Under the Legal Metrology Rules for Packaged Commodities, fluid edible products like mustard oil or blended vegetable oils must show clear, synchronized volumetric and mass entries.

### 3.1 Density Multiplier Algorithm
For all items flagged as `liquid_edible_oil` inside the inventory schema, the computation engine must execute a dual unit conversion before rendering lines.

```python
# System Core Logic for Line Calculation
density_factor = 0.9100  # Default specific gravity constant for Mustard Oil at standard room temperature
declared_volume_liters = line_item.quantity_liters

# Mass calculation to meet Legal Metrology framework guidelines
calculated_weight_kg = round(declared_volume_liters * density_factor, 3)
```

### 3.2 Standard Packaging Arrays
For retail B2C consumer packs, check transactions against the legal standard pack-size matrix to prevent compliance flags:
* Allowed Permutations: `[50ml, 100ml, 200ml, 500ml, 1L, 2L, 3L, 5L, 15L]` or equivalents in kilograms.

---

## 4. Normalized Database Schema Blueprint

```sql
-- 1. SUPPLIER MASTER (Your Business Entity Profile)
CREATE TABLE supplier_profile (
    supplier_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    gstin VARCHAR(15) NOT NULL CHECK (gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
    fssai_license_no VARCHAR(14) NOT NULL CHECK (fssai_license_no ~ '^[0-9]{14}$'),
    registered_address TEXT NOT NULL,
    state_name VARCHAR(100) NOT NULL,
    state_code VARCHAR(2) NOT NULL -- e.g., '09' for UP
);

-- 2. INVOICE HEADER METADATA
CREATE TABLE invoice_header (
    invoice_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(16) NOT NULL UNIQUE,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    supplier_id UUID REFERENCES supplier_profile(supplier_id),
    recipient_name VARCHAR(255) NOT NULL,
    recipient_gstin VARCHAR(15), -- Nullable for B2C retail transactions
    billing_address TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    place_of_supply_state_code VARCHAR(2) NOT NULL, -- Two-digit state code
    is_b2b BOOLEAN DEFAULT true,
    is_reverse_charge_applicable BOOLEAN DEFAULT false,
    irn_hash VARCHAR(64), -- Required if turnover > 5 Crore (E-Invoicing)
    qr_code_payload TEXT  -- Required if turnover > 5 Crore
);

-- 3. INVOICE LINE ITEMS TABLE
CREATE TABLE invoice_line_items (
    line_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoice_header(invoice_id) ON DELETE CASCADE,
    product_description TEXT NOT NULL,
    hsn_code VARCHAR(8) NOT NULL,
    base_rate_per_unit DECIMAL(12, 4) NOT NULL,
    discount_amount DECIMAL(12, 4) DEFAULT 0.0000,
    
    -- Volumetric Unit Tracking (Legal Metrology)
    quantity_ordered DECIMAL(12, 4) NOT NULL, 
    unit_of_measurement VARCHAR(10) NOT NULL, -- 'Ltrs', 'Pcs', 'Kgs'
    equivalent_weight_kg DECIMAL(12, 4),      -- Automatically populated for oils
    
    taxable_value DECIMAL(12, 4) NOT NULL,    -- Math: (Rate * Qty) - Discount
    gst_percentage_rate DECIMAL(5, 2) NOT NULL, -- e.g., 5.00
    
    -- Bifurcated Computed Tax Columns
    cgst_amount DECIMAL(12, 4) DEFAULT 0.0000,
    sgst_amount DECIMAL(12, 4) DEFAULT 0.0000,
    igst_amount DECIMAL(12, 4) DEFAULT 0.0000
);
```

---

## 5. Core Computation Engine & Tax Split Router

The tax engine must parse the invoice parameters on every modification state to dynamically apply Indian tax splits based on geographic supply chains.

```
                  [ START LINE ITEM TRANSACTION ]
                                 │
                 Is Recipient State Code equal to
                    Supplier State Code?
                     /               \
                   YES                NO
                   /                    \
       ┌─────────────────────┐        ┌─────────────────────┐
       │   INTRA-STATE TRANSACTION │        │   INTER-STATE TRANSACTION │
       ├─────────────────────┤        ├─────────────────────┤
       │ Split Tax Rate by 2 │        │ Route 100% Tax Rate │
       │ CGST = Rate / 2     │        │ IGST = Full Rate    │
       │ SGST = Rate / 2     │        │ CGST = 0            │
       │ IGST = 0            │        │ SGST = 0            │
       └─────────────────────┘        └─────────────────────┘
```

### 5.1 Arithmetic Steps & Rounding Guardrails
1. **Line Taxable Amount:** For each line row, calculate `Taxable Value = (Rate * Quantity) - Discount`.
2. **Precision Level:** Compute intermediary values using 4 decimal places (`DECIMAL(12,4)`). Round final sums to 2 decimal places using `ROUND_HALF_UP` (Half-up banking rounding rules).
3. **B2C Cash Control Limit:** If `is_b2b == false` and the aggregated invoice gross value crosses **₹50,000**, throw an validation intercept requiring the customer's legal name, delivery location address, and target state index.

---

## 6. Output & Layout Requirements
* **Total in Words:** Must print invoice values in Indian Rupees utilizing the traditional numbering format (e.g., *Rupees One Lakh, Twenty Thousand, Four Hundred and Fifty Only*).
* **Legal Declaration Block:** Append a fixed compliance footer:
  > *"Certified that the food products and edible oils listed in this tax invoice match configurations outlined under current FSSAI guidelines and the Legal Metrology Act. We declare that details shown on this invoice are true and correct."*
