// ---------- Typewriter Effect ----------
const roles = [
  "Aspiring Software Engineer",
  "Frontend Developer",
  "Future AI Specialist",
  "Problem Solver"
];

let index = 0;
let charIndex = 0;
const speed = 80;
const typewriterEl = document.getElementById("typewriter");

function typeEffect() {
  if (charIndex < roles[index].length) {
    typewriterEl.textContent += roles[index].charAt(charIndex);
    charIndex++;
    setTimeout(typeEffect, speed);
  } else {
    setTimeout(eraseEffect, 1000);
  }
}

function eraseEffect() {
  if (charIndex > 0) {
    typewriterEl.textContent = roles[index].substring(0, charIndex - 1);
    charIndex--;
    setTimeout(eraseEffect, 40);
  } else {
    index = (index + 1) % roles.length;
    setTimeout(typeEffect, 200);
  }
}

typeEffect();

// ---------- Scroll ----------
function scrollToProjects() {
  document.getElementById("projects").scrollIntoView({behavior: "smooth"});
}
