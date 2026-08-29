import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBilling } from '../context/BillingContext'
import { useCatalog } from '../context/CatalogContext'
import { apiUrl } from '../lib/api'
import '../styles/billing.css'

const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
const fssaiPattern = /^[0-9]{14}$/
const hsnPattern = /^\d{4,8}$/

const validateGstin = (value) => !value || gstinPattern.test(value.trim().toUpperCase())
const validateFssai = (value) => !value || fssaiPattern.test(String(value).trim())
const validateHsn = (value) => !value || hsnPattern.test(String(value).trim())

const emptyProductForm = {
  name: '',
  name_hi: '',
  category: 'Oils',
  price: '',
  stock: '0',
  hsnCode: '',
  gstRate: '5',
  manufacturer: 'Madhuban Traders',
  origin: 'India',
  description: '',
  description_hi: '',
  certifications: 'FSSAI',
  variants: '[]',
  image: '',
  images: '[]'
}

const defaultSettings = {
  supplierName: 'MADHUBAN TRADERS',
  supplierAddress: 'Sindhora, Varanasi, Uttar Pradesh 221208',
  supplierGstin: '09AAAAA0000A1Z5',
  supplierFssai: '10023051000123',
  supplierStateCode: '09',
  supplierStateName: 'Uttar Pradesh'
}

export default function ManagerSettings() {
  const navigate = useNavigate()
  const { worker, token, logout } = useBilling()
  const { refreshProducts } = useCatalog()

  const [products, setProducts] = useState([])
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [editingProductId, setEditingProductId] = useState(null)
  const [productMessage, setProductMessage] = useState('')
  const [settings, setSettings] = useState(defaultSettings)
  const [settingsMessage, setSettingsMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!worker) {
      navigate('/billing-login')
      return
    }

    loadProducts()
    loadSettings()
  }, [worker])

  const authHeaders = {
    Authorization: `Bearer ${token}`
  }

  const loadProducts = async () => {
    try {
      const response = await fetch(apiUrl('/products'), {
        headers: authHeaders
      })

      if (!response.ok) throw new Error('Unable to load products')
      const data = await response.json()
      setProducts(Array.isArray(data?.products) ? data.products : [])
    } catch (error) {
      console.error('Product load failed:', error)
      setProductMessage('Unable to load products right now.')
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch(apiUrl('/billing-settings'), {
        headers: authHeaders
      })

      if (!response.ok) throw new Error('Unable to load billing settings')
      const data = await response.json()
      setSettings(data?.settings || defaultSettings)
    } catch (error) {
      console.error('Billing settings load failed:', error)
      setSettingsMessage('Unable to load GST settings right now.')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/billing-login')
  }

  const handleProductInput = (field, value) => {
    setProductForm((current) => ({ ...current, [field]: value }))
  }

  const resetProductForm = () => {
    setProductForm(emptyProductForm)
    setEditingProductId(null)
  }

  const handleProductSubmit = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setProductMessage('')

      if (!validateHsn(productForm.hsnCode)) {
        throw new Error('HSN code must be 4 to 8 digits only.')
      }

      let parsedVariants = []
      try {
        parsedVariants = productForm.variants ? JSON.parse(productForm.variants) : []
      } catch (error) {
        throw new Error('Variants must be valid JSON like [{"id":"v1","label":"500 ml","price":150}]')
      }

      const payload = {
        name: productForm.name,
        name_hi: productForm.name_hi,
        category: productForm.category,
        price: Number(productForm.price || 0),
        stock: Number(productForm.stock || 0),
        hsnCode: productForm.hsnCode || '1514',
        gstRate: Number(productForm.gstRate || 5),
        manufacturer: productForm.manufacturer,
        origin: productForm.origin,
        description: productForm.description,
        description_hi: productForm.description_hi,
        certifications: productForm.certifications
          ? productForm.certifications.split(',').map((item) => item.trim()).filter(Boolean)
          : ['FSSAI'],
        variants: Array.isArray(parsedVariants) ? parsedVariants : [],
        images: productForm.images ? (() => { try { const v = JSON.parse(productForm.images); return Array.isArray(v) ? v : []; } catch { return []; } })() : [],
        image: productForm.image || ''
      }

      const response = await fetch(apiUrl(editingProductId ? `/products/${editingProductId}` : '/products'), {
        method: editingProductId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Product save failed')
      }

      setProductMessage(editingProductId ? 'Product updated successfully.' : 'Product added successfully.')
      resetProductForm()
      await loadProducts()
      await refreshProducts()
    } catch (error) {
      setProductMessage(error.message || 'Unable to save product.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditProduct = (product) => {
    setEditingProductId(product.id)
    setProductForm({
      name: product.name || '',
      name_hi: product.name_hi || '',
      category: product.category || 'Oils',
      price: product.price ?? '',
      stock: product.stock ?? '0',
      hsnCode: product.hsnCode || '',
      gstRate: product.gstRate ?? '5',
      manufacturer: product.manufacturer || 'Madhuban Traders',
      origin: product.origin || 'India',
      description: product.description || '',
      description_hi: product.description_hi || '',
      certifications: Array.isArray(product.certifications) ? product.certifications.join(', ') : 'FSSAI',
      variants: JSON.stringify(Array.isArray(product.variants) ? product.variants : [], null, 2),
      image: product.image || '',
      images: JSON.stringify(Array.isArray(product.images) ? product.images : [], null, 2)
    })
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) return

    try {
      const response = await fetch(apiUrl(`/products/${productId}`), {
        method: 'DELETE',
        headers: authHeaders
      })

      if (!response.ok) throw new Error('Delete failed')
      setProductMessage('Product deleted successfully.')
      await loadProducts()
      await refreshProducts()
    } catch (error) {
      setProductMessage(error.message || 'Unable to delete product.')
    }
  }

  const handleSettingsSave = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setSettingsMessage('')

      if (!validateGstin(settings.supplierGstin)) {
        throw new Error('GSTIN must follow the 15-character GSTIN format.')
      }
      if (!validateFssai(settings.supplierFssai)) {
        throw new Error('FSSAI number must be exactly 14 digits.')
      }

      const response = await fetch(apiUrl('/billing-settings'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) throw new Error('GST settings update failed')
      const data = await response.json()
      setSettings(data?.settings || settings)
      setSettingsMessage('GST and supplier information updated successfully.')
    } catch (error) {
      setSettingsMessage(error.message || 'Unable to update GST settings.')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsChange = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="billing-dashboard">
      <div className="billing-header">
        <div className="header-content">
          <h1>⚙️ Manager Settings</h1>
          <div className="worker-info">
            <button className="btn btn-secondary" onClick={() => navigate('/manager-dashboard')}>← Back to Dashboard</button>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="manager-container">
        <div className="filter-section">
          <div className="filter-card">
            <h3>🛒 Product Management</h3>
            <form onSubmit={handleProductSubmit} className="filter-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
              <div className="filter-input">
                <label>Name</label>
                <input value={productForm.name} onChange={(e) => handleProductInput('name', e.target.value)} required />
              </div>
              <div className="filter-input">
                <label>Hindi Name</label>
                <input value={productForm.name_hi} onChange={(e) => handleProductInput('name_hi', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>Image URL</label>
                <input value={productForm.image} onChange={(e) => handleProductInput('image', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>Category</label>
                <input value={productForm.category} onChange={(e) => handleProductInput('category', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>Price</label>
                <input type="number" min="0" step="0.01" value={productForm.price} onChange={(e) => handleProductInput('price', e.target.value)} required />
              </div>
              <div className="filter-input">
                <label>Stock</label>
                <input type="number" min="0" value={productForm.stock} onChange={(e) => handleProductInput('stock', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>HSN Code</label>
                <input value={productForm.hsnCode} onChange={(e) => handleProductInput('hsnCode', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>GST %</label>
                <input type="number" min="0" step="0.01" value={productForm.gstRate} onChange={(e) => handleProductInput('gstRate', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>Manufacturer</label>
                <input value={productForm.manufacturer} onChange={(e) => handleProductInput('manufacturer', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>Origin</label>
                <input value={productForm.origin} onChange={(e) => handleProductInput('origin', e.target.value)} />
              </div>
              <div className="filter-input" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <input value={productForm.description} onChange={(e) => handleProductInput('description', e.target.value)} />
              </div>
              <div className="filter-input" style={{ gridColumn: '1 / -1' }}>
                <label>Hindi Description</label>
                <input value={productForm.description_hi} onChange={(e) => handleProductInput('description_hi', e.target.value)} />
              </div>
              <div className="filter-input" style={{ gridColumn: '1 / -1' }}>
                <label>Certifications</label>
                <input value={productForm.certifications} onChange={(e) => handleProductInput('certifications', e.target.value)} />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {editingProductId ? 'Update Product' : 'Add Product'}
              </button>
              {editingProductId && (
                <button type="button" className="btn btn-secondary" onClick={resetProductForm}>
                  Cancel
                </button>
              )}
            </form>
            {productMessage && <p style={{ marginTop: '12px', color: '#0b6b3b', fontWeight: 600 }}>{productMessage}</p>}
          </div>
        </div>

        <div className="filter-section" style={{ marginTop: '24px' }}>
          <div className="filter-card">
            <h3>📋 Product List</h3>
            <div className="bills-list">
              <table className="bills-table-compact">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>GST</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(products || []).map((product) => (
                    <tr key={product.id} className="bill-row">
                      <td><strong>{product.name}</strong></td>
                      <td>{product.category || 'General'}</td>
                      <td>₹{Number(product.price || 0).toFixed(2)}</td>
                      <td>{product.stock ?? 0}</td>
                      <td>{product.gstRate ?? 5}%</td>
                      <td>
                        <button className="btn-action" onClick={() => handleEditProduct(product)} title="Edit product">✏️</button>
                        <button className="btn-action" onClick={() => handleDeleteProduct(product.id)} title="Delete product">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="filter-section" style={{ marginTop: '24px' }}>
          <div className="filter-card">
            <h3>🏷️ GST & Supplier Settings</h3>
            <form onSubmit={handleSettingsSave} className="filter-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div className="filter-input">
                <label>Supplier Name</label>
                <input value={settings.supplierName || ''} onChange={(e) => handleSettingsChange('supplierName', e.target.value)} />
              </div>
              <div className="filter-input" style={{ gridColumn: '1 / -1' }}>
                <label>Supplier Address</label>
                <input value={settings.supplierAddress || ''} onChange={(e) => handleSettingsChange('supplierAddress', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>GSTIN</label>
                <input value={settings.supplierGstin || ''} onChange={(e) => handleSettingsChange('supplierGstin', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>FSSAI</label>
                <input value={settings.supplierFssai || ''} onChange={(e) => handleSettingsChange('supplierFssai', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>State Code</label>
                <input value={settings.supplierStateCode || ''} onChange={(e) => handleSettingsChange('supplierStateCode', e.target.value)} />
              </div>
              <div className="filter-input">
                <label>State Name</label>
                <input value={settings.supplierStateName || ''} onChange={(e) => handleSettingsChange('supplierStateName', e.target.value)} />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                Save GST Settings
              </button>
            </form>
            {settingsMessage && <p style={{ marginTop: '12px', color: '#0b6b3b', fontWeight: 600 }}>{settingsMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
