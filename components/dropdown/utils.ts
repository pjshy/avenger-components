export function contains (root: Element, target: Element) {
  let node: Element | null = target
  while (node) {
    if (!node) {
      return false
    }
    if (node === root) {
      return true
    }
    node = node.parentElement
  }
  return false
}

export function addEventListener<K extends keyof WindowEventMap> (
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
) {
  window.addEventListener(type, listener, options)
  return () => window.removeEventListener(type, listener, options)
}
