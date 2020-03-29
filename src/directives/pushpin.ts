import { DirectiveOptions } from 'vue';
function inserted(el) {
  el.defaultOffsetTop = el.offsetTop;
}
function update(el: HTMLElement, binding) {
  const scrolled = binding.value.scrollY + binding.value.offset;

  if (binding.value.top <= scrolled && binding.value.bottom >= scrolled) {
    el.style.top = `${binding.value.offset}px`;
    el.style.position = 'fixed';
    console.log('fixed');
  } else if (scrolled < binding.value.top) {
    el.style.top = '0';
    el.style.position = 'relative';
    console.log('top');
    console.log(binding.value.top);
    console.log(el);
  } else if (scrolled > binding.value.bottom) {
    el.style.position = 'relative';
    el.style.top = `${binding.value.bottom - (el as any).defaultOffsetTop}px`;
    console.log('bottom');
    console.log(binding.value.bottom);
  }
}

function unbind(el) {
  delete el.defaultOffsetTop;
}

export const VPushPin = {
  update,
  inserted,
  unbind
} as DirectiveOptions;
