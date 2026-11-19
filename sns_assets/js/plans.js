(() => {
  const section = document.querySelector('.studio-plans');
  const tablist = section?.querySelector('[data-plan-tabs]');
  if (!section || !tablist) return;
  const tabs = [...tablist.querySelectorAll('[data-plan-tab]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  if (tabs.length !== 2 || panels.some(panel => !panel)) return;

  function selectTab(index, focus = false) {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    if (focus) tabs[index].focus();
    // Existing section animations need the updated document height after a switch.
    requestAnimationFrame(() => window.ScrollTrigger?.refresh());
  }

  tabs.forEach((tab, index) => {
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener('click', () => selectTab(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectTab(next, true);
    });
  });
  selectTab(0);
  section.classList.add('plans-ready');
  tablist.hidden = false;
})();
