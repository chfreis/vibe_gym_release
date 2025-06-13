// Toast notification system for temporary messages.
// Call showToast('Your message') anywhere.

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  
  setTimeout(function() {
    toast.classList.add('show');

    setTimeout(function() {
      toast.classList.remove('show');

      setTimeout(function() {
        toast.classList.add('hidden');
      }, 300);

    }, 3000);

  }, 100);
}

// ex. html usage   <div id="toast" class="toast hidden"></div>
