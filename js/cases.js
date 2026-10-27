(() => {
  const toggle = document.getElementById('lang-toggle');
  function apply(language) {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.body.dataset.lang = language;
    document.querySelectorAll('[data-zh][data-en]').forEach(node => node.textContent = node.dataset[language]);
    toggle.textContent = language === 'zh' ? 'EN' : '中文';
    localStorage.setItem('portfolio-language', language);
  }
  toggle.addEventListener('click', () => apply(document.body.dataset.lang === 'zh' ? 'en' : 'zh'));
  apply(localStorage.getItem('portfolio-language') === 'en' ? 'en' : 'zh');
})();
