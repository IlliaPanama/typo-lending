const box = document.querySelector('box');
const btn =  document.querySelector('button');

const faqs = document.querySelectorAll(".faq");
faqs.forEach((faq) => {
  faq.classList.remove("active");
});

// Обработчик события клика на кнопку .faq-toggle
const toggles = document.querySelectorAll(".faq-toggle");
toggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    toggle.parentNode.classList.toggle("active");
  });
});