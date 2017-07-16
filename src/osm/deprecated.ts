export const dataDeprecated = [
  {
    old: { amenity: 'firepit' },
    replace: {
      leisure: 'firepit'
    }
  },
  {
    old: { barrier: 'wire_fence' },
    replace: {
      barrier: 'fence',
      fence_type: 'chain'
    }
  },
  {
    old: { barrier: 'wood_fence' },
    replace: {
      barrier: 'fence',
      fence_type: 'wood'
    }
  },
  {
    old: { highway: 'ford' },
    replace: {
      ford: 'yes'
    }
  },
  {
    old: { highway: 'stile' },
    replace: {
      barrier: 'stile'
    }
  },
  {
    old: { highway: 'incline' },
    replace: {
      highway: 'road',
      incline: 'up'
    }
  },
  {
    old: { highway: 'incline_steep' },
    replace: {
      highway: 'road',
      incline: 'up'
    }
  },
  {
    old: { highway: 'unsurfaced' },
    replace: {
      highway: 'road',
      incline: 'unpaved'
    }
  },
  {
    old: { landuse: 'wood' },
    replace: {
      landuse: 'forest',
      natural: 'wood'
    }
  },
  {
    old: { natural: 'marsh' },
    replace: {
      natural: 'wetland',
      wetland: 'marsh'
    }
  },
  {
    old: { power_source: '*' },
    replace: {
      'generator:source': '$1'
    }
  },
  {
    old: { power_rating: '*' },
    replace: {
      'generator:output': '$1'
    }
  },
  {
    old: { shop: 'organic' },
    replace: {
      shop: 'supermarket',
      organic: 'only'
    }
  }
];
