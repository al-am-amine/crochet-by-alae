/*
  Security reminder: record only authenticated admin product actions; never
  add visitor or storefront browsing telemetry in this management screen.
*/
import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import { useLanguage } from '../../i18n/LanguageContext'
import { supabase } from '../../lib/supabaseClient'
import { uploadImage } from '../../lib/storage'
import { logAdminAction } from '../../lib/adminAudit'

const EMPTY_PRODUCT = {
  name: '', description: '', category: '', price: '', show_price: false,
  colors: '', sizes: '', images: [], status: 'available',
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-label-sm text-label-sm text-on-surface-variant">{label}</label>
      {children}
    </div>
  )
}

const inputClass =
  'bg-surface border border-outline-variant rounded-lg p-3 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'

export default function ProductsAdmin() {
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState('')

  async function loadProducts() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadProducts() }, [])

  function startNew() { setFormError(''); setEditing({ ...EMPTY_PRODUCT }) }
  function startEdit(p) {
    setFormError('')
    setEditing({ ...p, colors: (p.colors || []).join(', '), sizes: (p.sizes || []).join(', ') })
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file, 'products')
      setEditing((prev) => ({ ...prev, images: [...(prev.images || []), url] }))
    } catch (err) {
      console.error(err)
      alert('فشل رفع الصورة — تأكدي من إنشاء bucket باسم product-images فـ Supabase.')
    } finally {
      setUploading(false)
    }
  }

  function removeImage(url) {
    setEditing((prev) => ({ ...prev, images: prev.images.filter((i) => i !== url) }))
  }

  async function handleSave() {
    const hasRequiredFields = editing.name.trim() && editing.description.trim() && editing.category.trim()
    const hasValidPrice = !editing.show_price || (editing.price !== '' && Number(editing.price) >= 0)
    if (!hasRequiredFields || !hasValidPrice) {
      setFormError(t('admin_product_required_error'))
      return
    }
    setFormError('')
    const payload = {
      name: editing.name,
      description: editing.description,
      category: editing.category,
      price: editing.price ? Number(editing.price) : null,
      show_price: editing.show_price,
      colors: editing.colors ? editing.colors.split(',').map((s) => s.trim()).filter(Boolean) : [],
      sizes: editing.sizes ? editing.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
      images: editing.images || [],
      status: editing.status,
    }
    const action = editing.id ? 'product_updated' : 'product_created'
    const mutation = editing.id
      ? await supabase.from('products').update(payload).eq('id', editing.id)
      : await supabase.from('products').insert(payload).select('id').single()
    if (mutation.error) {
      setFormError(t('generic_error'))
      return
    }
    await logAdminAction(action, {
      product_id: editing.id || mutation.data?.id || null,
      category: payload.category,
      has_images: payload.images.length > 0,
    })
    setEditing(null)
    loadProducts()
  }

  async function handleDelete(id) {
    if (!confirm('تأكيد الحذف؟')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) await logAdminAction('product_deleted', { product_id: id })
    loadProducts()
  }

  if (editing) {
    return (
      <div className="max-w-xl">
        <h1 className="font-headline-md text-headline-md text-on-surface dark:text-white mb-6">
          {editing.id ? t('admin_edit') : t('admin_add_product')}
        </h1>

        <div className="bg-surface-container-low dark:bg-[#242019] rounded-xl p-gutter shadow-[0_20px_20px_rgba(212,132,154,0.03)] border border-outline-variant/30 space-y-4">
          <Field label={t('admin_product_name')}>
            <input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputClass} />
          </Field>
          <Field label={t('admin_product_desc')}>
            <textarea required value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('admin_product_category')}>
              <input required value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={inputClass} />
            </Field>
            <Field label={t('admin_product_status')}>
              <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className={inputClass}>
                <option value="available">{t('status_available')}</option>
                <option value="out_of_stock">{t('status_out_of_stock')}</option>
                <option value="custom_only">{t('status_custom_only')}</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <Field label={t('admin_product_price')}>
              <input type="number" min="0" required={editing.show_price} value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className={inputClass} />
            </Field>
            <label className="flex items-center gap-2 font-label-sm text-label-sm mb-3">
              <input type="checkbox" checked={editing.show_price} onChange={(e) => setEditing({ ...editing, show_price: e.target.checked })} />
              {t('admin_show_price')}
            </label>
          </div>

          <Field label={t('admin_product_colors')}>
            <input value={editing.colors} onChange={(e) => setEditing({ ...editing, colors: e.target.value })} placeholder="وردي, بيج, أبيض" className={inputClass} />
          </Field>
          <Field label={t('admin_product_sizes')}>
            <input value={editing.sizes} onChange={(e) => setEditing({ ...editing, sizes: e.target.value })} placeholder="S, M, L" className={inputClass} />
          </Field>

          <Field label={t('admin_product_images')}>
            <div className="flex flex-wrap gap-3 mt-1">
              {(editing.images || []).map((img) => (
                <div key={img} className="relative">
                  <img src={img} alt="" className="w-20 h-20 rounded-md object-cover" />
                  <button onClick={() => removeImage(img)} className="absolute -top-2 -end-2 bg-error text-white rounded-full p-0.5">
                    <Icon name="close" size={14} />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 border-2 border-dashed border-outline-variant rounded-md flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <Icon name="add_photo_alternate" size={22} className="text-outline" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </Field>

          {formError && <p role="alert" className="font-body-md text-sm text-error">{formError}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="bg-primary text-on-primary rounded-lg px-6 py-2.5 font-label-sm text-label-sm hover:opacity-90 transition-opacity">
              {t('admin_save')}
            </button>
            <button onClick={() => setEditing(null)} className="border border-outline-variant rounded-lg px-6 py-2.5 font-label-sm text-label-sm">
              {t('admin_cancel')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center border-b border-outline-variant/50 pb-6">
        <h1 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('admin_products')}</h1>
        <button
          onClick={startNew}
          className="flex items-center gap-2 bg-primary text-on-primary rounded-lg px-4 py-2 font-label-sm text-label-sm hover:opacity-90 transition-opacity"
        >
          <Icon name="add" size={18} />
          {t('admin_add_product')}
        </button>
      </div>

      {loading ? (
        <p className="font-body-md text-sm text-on-surface-variant">{t('loading')}</p>
      ) : products.length === 0 ? (
        <p className="font-body-md text-sm text-on-surface-variant">{t('admin_no_products')}</p>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_20px_rgba(212,132,154,0.03)] border border-outline-variant/20 overflow-hidden">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4 border-b border-outline-variant/20 last:border-0 hover:bg-surface-container/40 transition-colors">
              <img src={p.images?.[0] || 'https://placehold.co/80x80/f5c6d0/79545d'} alt="" className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-label-sm text-label-sm text-on-surface dark:text-white">{p.name}</p>
                <p className="font-body-md text-xs text-on-surface-variant mt-1">
                  {p.category} · {p.show_price && p.price ? `${p.price} د.ج` : t('price_on_request')}
                </p>
              </div>
              <button onClick={() => startEdit(p)} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors">
                <Icon name="edit" size={18} />
              </button>
              <button onClick={() => handleDelete(p.id)} className="p-2 rounded-full hover:bg-surface-container-high text-outline hover:text-error transition-colors">
                <Icon name="delete" size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
