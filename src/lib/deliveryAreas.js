// Design note: Keep delivery choices calm, explicit, and readable in the warm editorial storefront style.
// Values intentionally remain text-compatible with the existing `commune` database column.
export const DELIVERY_AREAS = [
  {
    wilaya: 'ولاية البليدة',
    wilayaEn: 'Blida Province',
    communes: [
      ['البليدة', 'Blida'], ['الأربعاء', 'El Affroun'], ['بوفاريك', 'Boufarik'], ['موزاية', 'Mouzaia'],
      ['بوعينان', 'Bougara'], ['العفرون', 'El Affroun'], ['مفتاح', 'Meftah'], ['وادي العلايق', 'Oued El Alleug'],
      ['الصومعة', 'Soumaa'], ['حمام ملوان', 'Hammam Melouane'], ['أولاد يعيش', 'Ouled Yaich'], ['بني مراد', 'Beni Mered'],
      ['بني تامو', 'Beni Tamou'], ['بلدية أخرى داخل الولاية', 'Other commune in the province'],
    ],
  },
  {
    wilaya: 'ولاية الجزائر العاصمة',
    wilayaEn: 'Algiers Province',
    communes: [
      ['الجزائر الوسطى', 'Algiers Centre'], ['باب الوادي', 'Bab El Oued'], ['القصبة', 'Casbah'], ['الأبيار', 'El Biar'],
      ['بوزريعة', 'Bouzareah'], ['المرادية', 'El Mouradia'], ['حسين داي', 'Hussein Dey'], ['القبة', 'Kouba'],
      ['الحراش', 'El Harrach'], ['باب الزوار', 'Bab Ezzouar'], ['الدار البيضاء', 'Dar El Beida'], ['برج الكيفان', 'Bordj El Kiffan'],
      ['برج البحري', 'Bordj El Bahri'], ['المحمدية', 'Mohammadia'], ['الرويبة', 'Rouiba'], ['الرغاية', 'Reghaia'],
      ['بلدية أخرى داخل الولاية', 'Other commune in the province'],
    ],
  },
]

export const DELIVERY_OPTIONS = DELIVERY_AREAS.flatMap(({ wilaya, communes }) =>
  communes.map(([commune, communeEn]) => ({
    value: `${wilaya} — ${commune}`,
    labelAr: `${wilaya} — ${commune}`,
    labelEn: `${wilaya.replace('ولاية ', '')} — ${communeEn}`,
  })),
)
