/** Static local assets — required statically so Metro bundles them for web + native. */
export const IMG = {
  productionHero: [
    require('../assets/images/production-hero-1.webp'),
    require('../assets/images/production-hero-2.webp'),
    require('../assets/images/production-hero-3.webp'),
  ],
  inventoryHero: [
    require('../assets/images/inventory-hero-1.webp'),
    require('../assets/images/inventory-hero-2.webp'),
    require('../assets/images/inventory-hero-3.webp'),
  ],
  qualityHero: [
    require('../assets/images/quality-hero-1.webp'),
    require('../assets/images/quality-hero-2.webp'),
    require('../assets/images/quality-hero-3.webp'),
  ],
  productSoya: require('../assets/images/product-soya.webp'),
  productRice: require('../assets/images/product-rice.webp'),
  productMaize: require('../assets/images/product-maize.webp'),
  soya: require('../assets/images/raw-soya.webp'),
  rice: require('../assets/images/raw-rice.webp'),
  maize: require('../assets/images/raw-maize.webp'),
  grain: require('../assets/images/raw-grain.webp'),
  bags: require('../assets/images/packaging-bags.webp'),
  labels: require('../assets/images/packaging-labels.webp'),
  lab: require('../assets/images/lab-detail.webp'),
  factory: require('../assets/images/factory-detail.webp'),
  field: require('../assets/images/farm-field.webp'),
  back: require('../assets/images/back.webp'),
} as const;
