import { DirectiveOptions } from 'vue';
function inserted(el, binding) {
  el.defaultOffsetTop = el.offsetTop;
}
function update(el: HTMLElement, binding) {
  const scrolled = binding.value.scrollY + binding.value.offset;

  if (binding.value.top <= scrolled && binding.value.bottom >= scrolled) {
    el.style.top = `${binding.value.offset}px`;
    el.style.position = 'fixed';
  }
  if (scrolled < binding.value.top) {
    el.style.top = '0';
    el.style.position = 'relative';
  }
  if (scrolled > binding.value.bottom) {
    el.style.position = 'relative';
    el.style.top = `${
      binding.value.bottom - (el as any).defaultOffsetTop - 58 - 11 - 3
    }px`;
  }
}

function unbind(el) {
  delete el.defaultOffsetTop;
}

export const VPushPin = {
  update,
  inserted,
  unbind,
} as DirectiveOptions;
