// Confirm Modal Component: Handles showing, hiding, and callbacks for confirmation dialogs
const ConfirmModal = (function () {
    const confModal = document.getElementById('confirm-modal');
    const titleElem = document.getElementById('confirm-modal-title');
    const msg1Elem = document.getElementById('confirm-modal-msg1');
    const msg2Elem = document.getElementById('confirm-modal-msg2');
    const btn1 = document.getElementById('confirm-modal-btn1');
    const btn2 = document.getElementById('confirm-modal-btn2');
    const btn3 = document.getElementById('confirm-modal-btn3');

    return {
        show: show,
        hide: hide
    };

    function show(options) {
        if (!confModal) {
            console.error('ConfirmModal: Modal element not found');
            return;
        }
        // Set title and messages
        titleElem.innerHTML = sanitizeHTML(options.title) || '';
        msg1Elem.innerHTML = sanitizeHTML(options.message1) || '';
        msg2Elem.innerHTML = sanitizeHTML(options.message2) || '';

        // Set button text
        btn1.innerHTML = sanitizeHTML(options.button1Text) || 'Cancel';
        btn2.innerHTML = sanitizeHTML(options.button2Text) || 'OK';
        btn3.innerHTML = sanitizeHTML(options.button3Text) || 'Nevermind';

        // Show buttons if requested, default hidden
        btn1.style.display = options.showButton1 ? 'inline-block' : 'none';
        btn2.style.display = options.showButton2 ? 'inline-block' : 'none';
        btn3.style.display = options.showButton3 ? 'inline-block' : 'none';

        // Reset classes
        btn1.className = 'confirm-modal-button';
        btn2.className = 'confirm-modal-button';
        btn3.className = 'confirm-modal-button';
        titleElem.className = 'confirm-modal-title';
        msg1Elem.className = 'confirm-modal-message';
        msg2Elem.className = 'confirm-modal-message';

        // Apply custom classes
        if (options.titleClass) titleElem.classList.add(...options.titleClass.split(' '));
        if (options.message1Class) msg1Elem.classList.add(...options.message1Class.split(' '));
        if (options.message2Class) msg2Elem.classList.add(...options.message2Class.split(' '));
        if (options.button1Class) btn1.classList.add(...options.button1Class.split(' '));
        if (options.button2Class) btn2.classList.add(...options.button2Class.split(' '));
        if (options.button3Class) btn3.classList.add(...options.button3Class.split(' '));

        // Button callbacks
        btn1.onclick = function () {
            hide();
            if (typeof options.onButton1 === 'function') options.onButton1();
        };
        btn2.onclick = function () {
            hide();
            if (typeof options.onButton2 === 'function') options.onButton2();
        };
        btn3.onclick = function () {
            hide();
            if (typeof options.onButton3 === 'function') options.onButton3();
        };
        // Show modal
        confModal.classList.remove('hidden');
    }

    function hide() {
        confModal.classList.add('hidden');
    }
})();
