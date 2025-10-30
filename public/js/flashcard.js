      // Add chevron rotation animation for flashcard dropdowns
      document.addEventListener('DOMContentLoaded', function() {
        const flashcardHeaders = document.querySelectorAll('.flashcard-question');
        flashcardHeaders.forEach(header => {
          header.addEventListener('click', function() {
            const chevron = this.querySelector('.fa-chevron-down');
            const targetId = this.getAttribute('data-bs-target');
            const target = document.querySelector(targetId);

            // Toggle chevron rotation
            setTimeout(() => {
              if (target.classList.contains('show')) {
                chevron.style.transform = 'rotate(180deg)';
              } else {
                chevron.style.transform = 'rotate(0deg)';
              }
            }, 100);
          });
        });

        // Also handle the main flashcards collapse
        const mainFlashcardHeader = document.querySelector('[data-bs-target="#flashcardsCollapse"]');
        if (mainFlashcardHeader) {
          mainFlashcardHeader.addEventListener('click', function() {
            const chevron = this.querySelector('.fa-chevron-down');
            setTimeout(() => {
              const target = document.querySelector('#flashcardsCollapse');
              if (target.classList.contains('show')) {
                chevron.style.transform = 'rotate(180deg)';
              } else {
                chevron.style.transform = 'rotate(0deg)';
              }
            }, 100);
          });
        }
      });
