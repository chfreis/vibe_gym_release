//js/access-modal.js
// Validator functions like validateCpf and validateEmail are declared in form-utils.js
(async function () {
    try {
        // === Fetch page elements that open the modal ===
        const modalOpenButtons = document.querySelectorAll(".open-access-modal");

        // === Fetch all access-modal elements ===
        const accModal = document.getElementById("access-modal");
        const accModalTtl = document.getElementById("access-modal-title");
        const closeBtn = document.getElementById("close-modal-btn");

        const signupForm = document.getElementById("pre-signup-form");
        const signupFeedback = document.getElementById("pre-signup-feedback");
        const signupLoginLink = document.getElementById("signup-switch-to-login");
        const signupCpf = document.getElementById("pre-signup-cpf");
        const signupEmail = document.getElementById("pre-signup-email");
        const signupBtn = document.getElementById("pre-signup-btn");

        const loginForm = document.getElementById("login-form");
        const loginFeedback = document.getElementById("login-feedback");
        const loginSignupLink = document.getElementById("login-switch-to-signup");
        const loginCpf = document.getElementById("login-cpf");
        const loginEmail = document.getElementById("login-email");
        const loginBtn = document.getElementById("login-btn");

        let selectedPlan = null;
        let selectedLocal = null;

        // Array of input elements
        const formInputs = [
            { element: signupCpf, type: "cpf" },
            { element: signupEmail, type: "email" },
            { element: loginCpf, type: "cpf" },
            { element: loginEmail, type: "email" }
        ];

        // === Basic sanity checks ===
        if (!accModal || !accModalTtl || !closeBtn || !signupForm || !loginForm ||
            !signupFeedback || !signupLoginLink || !signupCpf || !signupEmail || !signupBtn ||
            !loginFeedback || !loginSignupLink || !loginCpf || !loginEmail || !loginBtn) {
            throw new Error("Critical modal elements missing. Aborting modal initialization.");
        }

        // === Setup modal open buttons ===
        modalOpenButtons.forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                selectedPlan = e.currentTarget.getAttribute("data-plan");
                selectedLocal = e.currentTarget.getAttribute("data-local");
                accModal.classList.remove("hidden");
                resetModalForm("login");
            });
        });

        // === Close Button inside Modal ===
        closeBtn.addEventListener("click", function () {
            accModal.classList.add("hidden");
            signupFeedback.innerHTML = 'Já tem cadastro? <a href="#" id="signup-switch-to-login">Acesse</a>';
            loginFeedback.innerHTML = 'Ainda não tem cadastro? <a href="#" id="login-switch-to-signup">Inscreva-se</a>';

        });

        // === Close modal when clicking outside the modal box ===
        accModal.addEventListener("click", function (e) {
            if (e.target === accModal) {
                accModal.classList.add("hidden");
                signupFeedback.innerHTML = 'Já tem cadastro? <a href="#" id="signup-switch-to-login">Acesse</a>';
                loginFeedback.innerHTML = 'Ainda não tem cadastro? <a href="#" id="login-switch-to-signup">Inscreva-se</a>';
            }
        });

        accModal.addEventListener("click", function (e) {
            if (e.target && e.target.id === "signup-switch-to-login") {
                e.preventDefault();
                resetModalForm("signup");
            } else if (e.target && e.target.id === "login-switch-to-signup") {
                e.preventDefault();
                resetModalForm("login");
            }
        });

        // Add event listeners to each input field
        formInputs.forEach(function (input) {
            input.element.addEventListener("input", handleInputEvent);
            input.element.addEventListener("paste", handleInputEvent);
        });

        // === Setup form submission ===
        signupForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const signupCpfValid = validateCpf(signupCpf.value);
            const signupEmailValid = validateEmail(signupEmail.value);
            let alreadyCustomer = null;

            try {
                if (signupCpfValid) {
                    alreadyCustomer = await checkCustomer(signupCpf.value.trim().replace(/\D/g, ""));
                } else if (signupEmailValid) {
                    alreadyCustomer = await checkCustomer(signupEmail.value.trim());
                }
                // If customer NOT found , start signup redirection process
                if (alreadyCustomer && !alreadyCustomer.success) {
                    // Initialize personInfo object
                    const personInfo = {
                        cpf: signupCpfValid ? signupCpf.value.trim().replace(/\D/g, "") : "",
                        email: signupEmailValid ? signupEmail.value : "",
                        plan: selectedPlan !== null ? selectedPlan : "",
                        location: selectedLocal !== null ? selectedLocal : ""
                    };
                    // Save personInfo object to sessionStorage
                    try {
                        sessionStorage.setItem("createCustomerReg", JSON.stringify(personInfo));
                        accModal.classList.add("hidden");
                        signupForm.submit();
                    } catch (e) {
                        console.error("Failed to save to Session Storage:", e);
                    }
                // If customer found, inform & abort signup proccess 
                } else if (alreadyCustomer && alreadyCustomer.success) {
                    ConfirmModal.show({
                        title: 'Credenciais Repetidas!',
                        titleClass: 'ttl-t1',
                        message1: 'Já existe um cliente na nossa base com as credenciais fornecidas...',
                        message1Class: 'msg-t1',
                        message2: 'Para acessar sua conta utilize a opção "Acesse".<br>Obrigado!',
                        message2Class: 'msg-t7',
                        showButton1: true,
                        button1Text: 'OK',
                        button1Class: 'solo-btn',
                        onButton1: function () {
                            closeBtn.dispatchEvent(new Event('click'));
                            resetModalForm("login");
                        }
                    });
                // Unexpected error, inform & abort
                } else {
                    ConfirmModal.show({
                        title: 'Erro Inesperado',
                        titleClass: 'ttl-t1',
                        message1: 'Resposta API inesperada',
                        message1Class: '',
                        showButton1: true,
                        button1Text: 'OK',
                        button1Class: 'solo-btn',
                        onButton1: function () {
                            closeBtn.dispatchEvent(new Event('click'));
                            resetModalForm("login");
                        }
                    });
                }
            } catch (e) {
                ConfirmModal.show({
                    title: '❌ Erro: ' + e.name,
                    titleClass: 'ttl-t1',
                    message1: e.message,
                    message1Class: 'msg-t6',
                    message2: 'Tivemos problemas com a conexão...<br>Vamos recarregar a pagina e pedimos que tente novamente...',
                    message2Class: '',
                    showButton1: true,
                    button1Text: 'OK',
                    button1Class: 'solo-btn',
                    onButton1: function () {
                        location.reload(true);
                    }
                });
            }
        });

        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const loginCpfValid = validateCpf(loginCpf.value);
            const loginEmailValid = validateEmail(loginEmail.value);
            let response = null;

            if (loginCpfValid) {
                response = await checkCustomer(loginCpf.value.trim().replace(/\D/g, ""));
            } else if (loginEmailValid) {
                response = await checkCustomer(loginEmail.value.trim());
            }

            if (response && response.success) {
                // Store customer ID in sessionStorage for my-profile.html
                sessionStorage.setItem('customerId', response.id);
                loginForm.submit();
            } else {
                if (response && !response.success) {
                    ConfirmModal.show({
                        title: 'Cliente não localizado!',
                        titleClass: 'ttl-t1',
                        message1: 'Não foi possível localizar seu registro.<br>Por favor, verifique seus dados e tente novamente.',
                        message1Class: '',
                        showButton1: true,
                        button1Text: 'OK',
                        button1Class: 'solo-btn',
                        onButton1: function () {
                            closeBtn.dispatchEvent(new Event('click'));
                            resetModalForm("login");
                        }
                    });
                } else {
                    ConfirmModal.show({
                        title: 'Falha na conexão!',
                        titleClass: 'ttl-t1',
                        message1: 'Ops!<br>Não foi possível conectar com nossos servidores.<br>Por favor, tente novamente.',
                        message1Class: '',
                        showButton1: true,
                        button1Text: 'OK',
                        button1Class: 'solo-btn',
                        onButton1: function () {
                            closeBtn.dispatchEvent(new Event('click'));
                            resetModalForm("login");
                        }
                    });
                }
            }
        });

        function resetModalForm(formType) {
            if (formType === "signup") {
                accModalTtl.textContent = "Acesse Sua Conta";
                signupForm.classList.add("hidden");
                loginForm.reset();
                loginForm.classList.remove("hidden");
                loginCpf.classList.remove("input-error");
                loginEmail.classList.remove("input-error");
                loginFeedback.classList.remove("invalid");
                loginBtn.disabled = true;
            } else if (formType === "login") {
                accModalTtl.textContent = "Inscreva-se";
                loginForm.classList.add("hidden");
                signupForm.reset();
                signupForm.classList.remove("hidden");
                signupCpf.classList.remove("input-error");
                signupEmail.classList.remove("input-error");
                signupFeedback.classList.remove("invalid");
                signupBtn.disabled = true;
            }
        }

        // Function to handle input events for formatting
        function handleInputEvent(e) {
            // Set inputId to "email" or "cpf", otherwise use target's id
            let inputId = "";
            const input = e.target;
            const formType = input.dataset.form; // 'signup' or 'login'

            if (input.id === "login-cpf" || input.id === "pre-signup-cpf") {
                inputId = "cpf";
            } else if (input.id === "login-email" || input.id === "pre-signup-email") {
                inputId = "email";
            } else { inputId = input.id; }

            const rawInput = e.type === "paste"
                ? e.clipboardData.getData("text")
                : input.value;

            input.value = formatInput(inputId, rawInput);

            if (formType === "signup") {
                updateModalSignupForm();
            } else if (formType === "login") {
                updateModalLoginForm();
            }
        }

        function updateModalSignupForm() {
            updateModalForm({
                submitBtn: signupBtn,
                cpfInput: signupCpf,
                emailInput: signupEmail,
                feedbackElem: signupFeedback,
                feedbackHTML: 'Já tem cadastro? <a href="#" id="signup-switch-to-login">Acesse</a>'
            });
        }
        // Add the new login form function:
        function updateModalLoginForm() {
            updateModalForm({
                submitBtn: loginBtn,
                cpfInput: loginCpf,
                emailInput: loginEmail,
                feedbackElem: loginFeedback,
                feedbackHTML: 'Ainda não tem cadastro? <a href="#" id="login-switch-to-signup">Inscreva-se</a>',
            });
        }
        // Generic function to update any modal form
        function updateModalForm(formConfig) {
            const {
                cpfInput, emailInput, feedbackElem,
                submitBtn, feedbackHTML
            } = formConfig;

            const cpfValid = validateCpf(cpfInput.value);
            const emailValid = validateEmail(emailInput.value);
            const cpfEmpty = cpfInput.value === "";
            const emailEmpty = emailInput.value === "";

            // Reset error states for empty fields
            cpfEmpty ? cpfInput.classList.remove("input-error") : null;
            emailEmpty ? emailInput.classList.remove("input-error") : null;

            // Both fields empty - show default state
            if (cpfEmpty && emailEmpty) {
                feedbackElem.innerHTML = feedbackHTML;
                feedbackElem.classList.remove("invalid");
                submitBtn.disabled = true;
                return;
            }

            // Either field is valid - success state
            if (cpfValid || emailValid) {
                feedbackElem.textContent = "✔️";
                feedbackElem.classList.remove("invalid");
                cpfInput.classList.remove("input-error");
                emailInput.classList.remove("input-error");
                submitBtn.disabled = false;
                return;
            }

            // Both fields invalid and filled
            if (!cpfValid && !cpfEmpty && !emailValid && !emailEmpty) {
                feedbackElem.textContent = "❌ Email e CPF Inválidos";
                feedbackElem.classList.add("invalid");
                cpfInput.classList.add("input-error");
                emailInput.classList.add("input-error");
                submitBtn.disabled = true;
                return;
            }

            // Only CPF invalid
            if (!cpfValid && !cpfEmpty) {
                feedbackElem.textContent = "❌ CPF Inválido";
                feedbackElem.classList.add("invalid");
                cpfInput.classList.add("input-error");
                submitBtn.disabled = true;
                return;
            }

            // Only email invalid (remaining case)
            if (!emailEmpty) {
                feedbackElem.textContent = "❌ Email Inválido";
                feedbackElem.classList.add("invalid");
                emailInput.classList.add("input-error");
                submitBtn.disabled = true;
                return;
            }
        }
    } catch (err) {
        console.error("Error during modal initialization:", err);
    }
})();