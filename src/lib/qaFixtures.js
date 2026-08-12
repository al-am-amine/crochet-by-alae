/*
  Style reminder: QA data must exercise the existing Crochet by Alae card geometry,
  palette, and motion without becoming production catalog content.
*/
export const qaProducts = [
  {
    id: 'qa-rose-basket',
    name: 'Rose Garden Basket',
    category: 'Baskets',
    price: 2400,
    show_price: true,
    status: 'available',
    images: ['https://placehold.co/900x900/f5c6d0/79545d?text=Rose+Basket'],
    colors: ['Rose', 'Cream'],
    sizes: ['Small', 'Medium'],
    description: 'A compact basket fixture for testing product details, options, and cart behavior.',
  },
  {
    id: 'qa-soft-scarf',
    name: 'Soft Blida Scarf',
    category: 'Accessories',
    price: 1800,
    show_price: true,
    status: 'available',
    images: ['https://placehold.co/900x900/e8d9c4/79545d?text=Soft+Scarf'],
    colors: ['Sand', 'Blida Blue'],
    sizes: ['One size'],
    description: 'A soft accessory fixture for exercising the product description and option controls.',
  },
  {
    id: 'qa-custom-cushion',
    name: 'Custom Rose Cushion',
    category: 'Home',
    price: null,
    show_price: false,
    status: 'custom_only',
    images: ['https://placehold.co/900x900/d9e5d6/79545d?text=Custom+Cushion'],
    colors: ['Rose', 'Sage'],
    sizes: ['40 × 40 cm'],
    description: 'A custom-order fixture with no public price, used only for local QA.',
  },
]
