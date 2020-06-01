
let id = 0

function generate_id () {
  return id++
}

export function map (mapping) {

  let mapping_applications = mapping.__applications
  if (!mapping_applications) {
    mapping_applications = new WeakMap()
    mapping.__applications = mapping_applications
  }

  return function (base) {
    let base_mappings = base.__mappings
    if (!base_mappings) {
      base_mappings = new Set()
      base.__mappings = base_mappings
    }

    if (base_mappings.has(mapping)) {
      return base
    }

    let extended = mapping_applications.get(base)
    if (!extended) {
      extended = mapping(base)
      mapping_applications.set(base, extended)

      let extended_mappings = new Set(base_mappings)
      extended_mappings.add(mapping)
      extended.__mappings = new Set(base_mappings)
    }

    return extended
  }

}

export default function mixin (base, ...mappings) {
  let current_base

  for (let mapping of mappings) {
    current_base = map(mapping)(base)
    base = current_base
  }

  return base
}