
export default function mixin (base_class, ...extensions) {

  let exteded_class = apply_extensions(base_class, extensions)

  return exteded_class
}

export function apply_extensions (base_class, extensions) {
  let extended_class

  for (let extension of extensions) {
    extended_class = apply_extension(base_class, extension)
    base_class = extended_class
  }

  return extended_class
}

export function apply_extension (base_class, extension) {

  if (!extension._applicants) {
    extension._extended_classes = new WeakMap()
  }

  if (!base_class._applied_extensions) {
    base_class._applied_extensions = new Set()
  }

  if (base_class._applied_extensions.has(extension)) {
    return base_class
  }

  let extended_class = extension._extended_classes.get(base_class)
  if (extended_class) {
    return extended_class
  }

  extended_class = extension(base_class)
  extended_class._applied_extensions = new Set(base_class._applied_extensions)
  extended_class._applied_extensions.add(extension)

  extension._extended_classes.set(base_class, extended_class)

  return extended_class
}
