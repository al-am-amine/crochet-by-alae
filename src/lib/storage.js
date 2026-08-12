import { supabase } from './supabaseClient'

// Uploads a file to the public "product-images" bucket (create it once in
// the Supabase dashboard — see README) and returns its public URL.
// `folder` groups files (e.g. "products", "logo", "custom-requests").
export async function uploadImage(file, folder = 'products') {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from('product-images').upload(path, file)
  if (error) throw error

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}
