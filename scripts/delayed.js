// add delayed functionality here
document.addEventListener("DOMContentLoaded", () => {
    
    const backToTopButton = document.createElement("button");
    backToTopButton.id = "backToTop";
    backToTopButton.textContent = "↑";
  
    
    document.body.appendChild(backToTopButton);
  
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY; 
      const windowHeight = window.innerHeight; 
      const documentHeight = document.documentElement.scrollHeight; 
  
      // button will appear when user hit x amount of scroll
      if (scrollY > 300 && documentHeight > windowHeight + 300) {
        backToTopButton.classList.add("show");
      } else {
        backToTopButton.classList.remove("show");
      }
    });
  
    //for smooth scroll
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
      });
    });
  });
  