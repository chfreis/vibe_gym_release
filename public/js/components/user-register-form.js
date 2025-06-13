//js/components/user-register-form.js
(async function () {
    try {
        // Creating a namespace for sctructures wanted globally
        window.UserRegisterForm = window.UserRegisterForm || {};
        UserRegisterForm.isPopulating = false;
        // Global function to populate form fields (used in my-profile.js)
        UserRegisterForm.populateURegForm = function (customerInfo) {
            UserRegisterForm.isPopulating = true;

            Object.entries(fieldsMetaDataMap).forEach(function ([inputId, field]) {
                // Get database field name from data attribute or fallback to inputId
                const dbFieldName = field.elem.dataset.dbFieldName ?? inputId;
                // Get the stored value from customerInfo object
                const storedValue = customerInfo[dbFieldName];
                // Update field metadata
                field.storedVal = storedValue;
                field.currentVal = field.storedVal;

                // Field input value is formatted before loading it into the form field
                field.elem.value = formatInput(inputId, storedValue);
                field.isCurrentValValid = (field.elem.value !== "" || field.optional);
                updateFormState(inputId, field.isCurrentValValid, field.type !== "input");
            });
            // Handle gender radio button separately
            const genderRadio = genderOpts.querySelector(`input[name="gender"][value="${customerInfo.gender}"]`);
            if (genderRadio) genderRadio.checked = true;

            UserRegisterForm.isPopulating = false;
        };

        // === Fetch form ===
        const form = document.getElementById("registration-form");
        const formFBack = document.getElementById("form-feedback");
        // === Fetch all form elements ===
        const cpfInput = document.getElementById("cpf");
        const dobInput = document.getElementById("dob");
        const phoneInput = document.getElementById("phone");
        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const planSel = document.getElementById("plan");
        const localSel = document.getElementById("location");
        const genderOpts = document.getElementById('gender-options');
        const cepInput = document.getElementById("cep");
        const stateInput = document.getElementById("state");
        const cityInput = document.getElementById("city");
        const addL1input = document.getElementById("addressLine1");
        const addNumInput = document.getElementById("addressNum");
        const addL2input = document.getElementById("addressLine2");
        const registerBtn = document.getElementById("register-btn");
        const saveBtn = document.getElementById("save-btn");
        const cancelBtn = document.getElementById("cancel-btn");

        // === Basic sanity checks ===
        if (
            !form || !formFBack ||
            !cpfInput || !dobInput || !phoneInput || !nameInput || !emailInput ||
            !planSel || !localSel || !genderOpts ||
            !cepInput || !stateInput || !cityInput ||
            !addL1input || !addNumInput || !addL2input ||
            !registerBtn || !saveBtn || !cancelBtn
        ) {
            throw new Error("Critical user-register-form elements missing. Aborting initialization.");
        }

        // === Fields Meta Data Map for form fields validation and manipulation
        const fieldsMetaDataMap = {
            cpf: {
                elem: cpfInput, type: 'input', optional: false, storedVal: "",
                minLength: 14, validateFunc: validateCpf, validationTimer: null,
                currentVal: "", isCurrentValValid: false
            },
            dob: {
                elem: dobInput, type: 'input', optional: false, storedVal: "",
                minLength: 10, validateFunc: validateDob, validationTimer: null,
                currentVal: "", isCurrentValValid: false
            },
            phone: {
                elem: phoneInput, type: 'input', optional: true, storedVal: "",
                minLength: 14, validateFunc: validatePhone, validationTimer: null,
                currentVal: "", isCurrentValValid: true
            },
            name: {
                elem: nameInput, type: 'input', optional: false, storedVal: "",
                minLength: 7, validateFunc: validateName, validationTimer: null,
                currentVal: "", isCurrentValValid: false
            },
            email: {
                elem: emailInput, type: 'input', optional: false, storedVal: "",
                minLength: 9, validateFunc: validateEmail, validationTimer: null,
                currentVal: "", isCurrentValValid: false
            },
            plan: {
                elem: planSel, type: 'select', optional: false, storedVal: "",
                minLength: "N/A", validateFunc: "N/A", validationTimer: null,
                currentVal: "", isCurrentValValid: false
            },
            location: {
                elem: localSel, type: 'select', optional: false, storedVal: "",
                minLength: "N/A", validateFunc: "N/A", validationTimer: null,
                currentVal: "", isCurrentValValid: false
            },
            cep: {
                elem: cepInput, type: 'input', optional: false, storedVal: "",
                minLength: 9, validateFunc: validateCep, validationTimer: null,
                currentVal: "", isCurrentValValid: false
            },
            state: {
                elem: stateInput, type: 'input', optional: false, storedVal: "",
                minLength: "N/A", validateFunc: "N/A", validationTimer: null,
                currentVal: "", isCurrentValValid: false
            },
            city: {
                elem: cityInput, type: 'input', optional: false, storedVal: "",
                minLength: "N/A", validateFunc: "N/A", validationTimer: null,
                currentVal: "", isCurrentValValid: false
            },
            addressLine1: {
                elem: addL1input, type: 'input', optional: false, storedVal: "",
                minLength: "N/A", validateFunc: "N/A", validationTimer: null,
                currentVal: "", isCurrentValValid: false
            },
            addressNum: {
                elem: addNumInput, type: 'input', optional: true, storedVal: "",
                minLength: 1, validateFunc: validateAddNum, validationTimer: null,
                currentVal: "", isCurrentValValid: true
            },
            addressLine2: {
                elem: addL2input, type: 'input', optional: true, storedVal: "",
                minLength: 3, validateFunc: validateAddrL2, validationTimer: null,
                currentVal: "", isCurrentValValid: true
            }
        };

        // === Set dynamic date limits for DOB field ===
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 80, today.getMonth(), today.getDate());
        const maxDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
        dobInput.max = maxDate.toISOString().slice(0, 10);
        dobInput.min = minDate.toISOString().slice(0, 10);

        // === Setup text input elements listeners for typing and paste events === 
        for (let field of Object.values(fieldsMetaDataMap)) {  // Access each field object directly
            // Skip specific fields
            if (field.elem === stateInput || field.elem === cityInput || field.elem === addL1input) {
                continue;  // Skip state, city, and addressLine1 fields and move outside loop forward
            }
            // Determine appropriate event types
            const eventTypes = field.type === "input" ? ["input", "paste"] : ["change"];
            for (let type of eventTypes) {
                // Add appropriate Event listeners to fields not skipped
                field.elem.addEventListener(type, field.type === "input" ? handleInputEvent : handleSelectEvent);
            }
        }

        // Depending on the page different buttons appear and set specific logic flow for them
        const htmlPageCode = document.body.classList.contains("signup-page") ? 1
            : document.body.classList.contains("my-profile-page") ? 2
                : null;

        if (htmlPageCode === 1) {
            registerBtn.classList.remove("removed");
            formFBack.textContent = "Complete Seu Cadastro e Faça Sua Assinatura";
            // Load data saved on access-modal (if any)
            const personInfo = JSON.parse(sessionStorage.getItem("createCustomerReg"));
            if (personInfo) {
                Object.entries(fieldsMetaDataMap).forEach(function ([inputId, field]) {
                    const value = personInfo[inputId];
                    if (value && ["cpf", "email", "plan", "location"].includes(inputId)) {
                        field.elem.value = formatInput(inputId, value);
                        field.isCurrentValValid = (field.elem.value !== "");
                    } else { return; }
                    sessionStorage.removeItem("createCustomerReg");    // Clear createCustomerReg to ensure some data security/privacy
                });
            }
        } else if (htmlPageCode === 2) {
            cpfInput.disabled = true;
            cpfInput.readOnly = true;
            const radios = genderOpts.querySelectorAll('input[type="radio"]');
            radios.forEach(function (radio) {
                radio.disabled = true;
            });
            saveBtn.classList.remove("removed");
            cancelBtn.classList.remove("removed");
            formFBack.textContent = "Edite Suas Informações";

            // When the cancel button is clicked, call a my-profile.js function for animation flow
            cancelBtn.addEventListener("click", function () {
                saveBtn.disabled = true;
                form.reset();
                hideFormAnim();
            });
        }

        // === Setup form submission ===
        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            const allFieldsValid = Object.keys(fieldsMetaDataMap).every(function (key) {
                return fieldsMetaDataMap[key].isCurrentValValid;
            });
            if (form.reportValidity() && allFieldsValid) {
                if (htmlPageCode === 1) {
                    // On submit disable submit button
                    registerBtn.disabled = true;
                    // If all required fields are filled && all fields are valid populate personInfo object
                    const personInfo = {
                        cpf: cpfInput.value.replace(/\D/g, ""),
                        dob: dobInput.value,
                        phone: phoneInput.value.replace(/\D/g, ""),
                        full_name: nameInput.value,
                        email: emailInput.value,
                        plan: planSel.value,
                        sub_price: Number((
                            planSel.value === "basico" ? 299.99 :
                                planSel.value === "premium" ? 449.49 :
                                    planSel.value === "vip" ? 699.99 : 0
                        ).toFixed(2)),
                        location: localSel.value,
                        gender: genderOpts.querySelector('input[name="gender"]:checked')?.value ?? "",
                        cep: cepInput.value.replace(/\D/g, ''),
                        state: stateInput.value,
                        city: cityInput.value,
                        address_line1: addL1input.value,
                        address_num: addNumInput.value,
                        address_line2: addL2input.value
                    };
                    try {
                        // Now try to insert it into DB;
                        const response = await createCustomer(personInfo);
                        if (response.success) {
                            formFBack.textContent = "✅ Cadastro Completo - Bem-Vindo à Vibe Gym!";
                            formFBack.classList.add("success");
                            ConfirmModal.show({
                                title: 'SEJA BEM VINDO À VIBE GYM!',
                                titleClass: 'ttl-t2',
                                message1: 'Seu cadastro foi criado e sua assinatura foi ativada com sucesso.',
                                message1Class: 'msg-t4',
                                message2: 'Você pode acessar seu cadastro clicando no botão no canto superior direito da tela (opção acesse).',
                                message2Class: 'msg-t5',
                                showButton1: true,
                                button1Text: 'OK',
                                button1Class: 'solo-btn',
                                onButton1: function () {
                                    window.location.replace("/vibe_gym/public/");
                                }
                            });
                        } else {
                            formFBack.textContent = "⚠️ Suas Informações não foram salvas - Por favor, tente novamente...";
                            formFBack.classList.add("yellow-warn");
                            ConfirmModal.show({
                                title: '⚠️ Erro: ' + response.name,
                                titleClass: 'ttl-t3',
                                message1: response.message,
                                message1Class: 'msg-t1',
                                message2: 'Vamos recarregar a pagina e pedimos que tente novamente...',
                                message2Class: '',
                                showButton1: true,
                                button1Text: 'OK',
                                button1Class: 'solo-btn',
                                onButton1: function () {
                                    location.reload(true);
                                }
                            });
                        }
                    } catch (e) {
                        formFBack.textContent = "❌ Ocorreu um erro ao tentar se comunicar com nossos servidores " + e.message;
                        formFBack.classList.add("red-error");
                        ConfirmModal.show({
                            title: '❌ Erro: ' + e.name,
                            titleClass: 'ttl-t1',
                            message1: e.message,
                            message1Class: 'msg-t6',
                            message2: 'Vamos recarregar a pagina e pedimos que tente novamente...',
                            message2Class: '',
                            showButton1: true,
                            button1Text: 'OK',
                            button1Class: 'solo-btn',
                            onButton1: function () {
                                location.reload(true);
                            }
                        });
                    }
                } else if (htmlPageCode === 2) {
                    // If any field has new info, find out which ones and save them into changedFields
                    saveBtn.disabled = true;
                    cancelBtn.disabled = true;
                    const changedFields = getChangedFields();
                    const customerId = sessionStorage.getItem('customerId');
                    try {
                        const response = await updateCustomer(customerId, changedFields);
                        if (response.success) {
                            formFBack.textContent = "✅ Cadastro Atualizado Com Sucesso!";
                            formFBack.classList.add("success");
                            ConfirmModal.show({
                                title: 'Seu cadastro foi atualizado com sucesso!',
                                titleClass: 'ttl-t2',
                                message1: 'Estamos redirecionando você...',
                                message1Class: 'msg-t3',
                                showButton1: true,
                                button1Text: 'OK',
                                button1Class: 'solo-btn',
                                onButton1: function () {
                                    window.location.replace("my-profile.html");
                                }
                            });
                        } else {
                            formFBack.textContent = "⚠️ Suas alterações não foram salvas - Por favor, tente novamente...";
                            formFBack.classList.add("yellow-warn");
                            ConfirmModal.show({
                                title: '⚠️ Erro: ' + response.name,
                                titleClass: 'ttl-t3',
                                message1: response.message,
                                message1Class: 'msg-t1',
                                message2: 'Vamos recarregar a pagina e pedimos que tente novamente...',
                                message2Class: '',
                                showButton1: true,
                                button1Text: 'OK',
                                button1Class: 'solo-btn',
                                onButton1: function () {
                                    location.reload(true);
                                }
                            });
                        }
                    } catch (e) {
                        formFBack.textContent = "❌ Ocorreu um erro ao tentar se comunicar com nossos servidores " + e.message;
                        formFBack.classList.add("red-error");
                        ConfirmModal.show({
                            title: '❌ Erro: ' + e.name,
                            titleClass: 'ttl-t1',
                            message1: e.message,
                            message1Class: 'msg-t6',
                            message2: 'Vamos recarregar a pagina e pedimos que tente novamente...',
                            message2Class: '',
                            showButton1: true,
                            button1Text: 'OK',
                            button1Class: 'solo-btn',
                            onButton1: function () {
                                location.reload(true);
                            }
                        });
                    }
                }
            }
        });

        // Function to treat and validate input field events (type & paste)
        function handleInputEvent(e) {
            const inputId = e.target.id;
            const rawInput = e.type === "paste" ? e.clipboardData.getData("text") : e.target.value;
            const fieldMetaData = fieldsMetaDataMap[inputId];
            e.target.value = formatInput(inputId, rawInput);

            if (!fieldMetaData) return;  // If no validation rules are defined for this input, exit early
            // Clear the previous timer for this input (from the fieldsMetaDataMap itself)
            clearTimeout(fieldMetaData.validationTimer);

            // If field is optional and empty, consider it valid
            if (fieldMetaData.optional && e.target.value === "") {
                fieldMetaData.currentVal = "";
                fieldMetaData.isCurrentValValid = true;
                updateFormState(inputId, fieldMetaData.isCurrentValValid);
                // Otherwise, apply validation check for inputs that meet min length requirements
            } else if (e.target.value.length >= fieldMetaData.minLength) {
                fieldMetaData.validationTimer = setTimeout(async function () {
                    if (inputId === "cep") {            // Case it's CEP validation
                        const addressDataObj = {};      // Empty object to store address data from ViaCep API
                        fieldMetaData.isCurrentValValid = await fieldMetaData.validateFunc(e.target.value, addressDataObj);
                        if (addressDataObj.estado) {
                            const stateMetaData = fieldsMetaDataMap.state;
                            stateMetaData.elem.value = sanitizeHTML(addressDataObj.estado);
                            stateMetaData.currentVal = stateMetaData.elem.value;
                            stateMetaData.isCurrentValValid = true;
                        }
                        if (addressDataObj.localidade) {
                            const cityMetaData = fieldsMetaDataMap.city;
                            cityMetaData.elem.value = sanitizeHTML(addressDataObj.localidade);
                            cityMetaData.currentVal = cityMetaData.elem.value;
                            cityMetaData.isCurrentValValid = true;
                        }
                        if (addressDataObj.logradouro) {
                            const addrL1MetaData = fieldsMetaDataMap.addressLine1;
                            addrL1MetaData.elem.value = sanitizeHTML(addressDataObj.logradouro);
                            addrL1MetaData.currentVal = addrL1MetaData.elem.value;
                            addrL1MetaData.isCurrentValValid = true;
                        }
                    } else {        // For all other cases
                        fieldMetaData.isCurrentValValid = fieldMetaData.validateFunc(e.target.value);
                        fieldMetaData.currentVal = fieldMetaData.isCurrentValValid ? e.target.value : "";
                    }
                    updateFormState(inputId, fieldMetaData.isCurrentValValid);
                }, 200);
            } else {
                // If the value doesn't meet the length requirement, set it to invalid
                fieldMetaData.currentVal = e.target.value;
                fieldMetaData.isCurrentValValid = false;
                updateFormState(inputId, fieldMetaData.isCurrentValValid);
            }
        }

        // Function to treat and validate select change events
        function handleSelectEvent(e) {
            const inputId = e.target.id;
            const inputValue = e.target.value;
            const fieldMetaData = fieldsMetaDataMap[inputId];

            // Update the current value state in the map
            fieldMetaData.currentVal = inputValue;
            fieldMetaData.isCurrentValValid = inputValue !== "";
            updateFormState(inputId, fieldMetaData.isCurrentValValid, true);
        }


        // Function to update form state
        function updateFormState(inputId, isValid, isSelectField = false) {
            // === Check if all fields are valid ===
            const allFieldsValid = Object.keys(fieldsMetaDataMap).every(function (key) {
                return fieldsMetaDataMap[key].isCurrentValValid;
            });

            // === Buttons are enabled according to the page they are in
            if (htmlPageCode === 1) {
                registerBtn.disabled = !(allFieldsValid && form.checkValidity());
            } else if (htmlPageCode === 2 && !UserRegisterForm.isPopulating) {
                saveBtn.disabled = !(formHasNewInfo() && allFieldsValid && form.checkValidity());
            }

            updateFeedback();

            // Function to update form feeback for all fields (but gender)
            function updateFeedback() {
                const inputElem = fieldsMetaDataMap[inputId].elem;
                const errMsgElem = inputElem.nextElementSibling;

                if (isValid || (!isSelectField && inputElem.value === "")) {
                    inputElem.classList.remove("input-error");
                    errMsgElem.style.visibility = "hidden";
                } else {
                    inputElem.classList.add("input-error");
                    errMsgElem.style.visibility = "visible";
                }
            }
        }

        // Function to get which fields have valid changes that should be saved
        function getChangedFields() {
            const changedFields = {};
            Object.entries(fieldsMetaDataMap).forEach(function ([key, field]) {
                if (field.isCurrentValValid && field.currentVal !== field.storedVal) {
                    const dbFieldName = field.elem.dataset.dbFieldName ?? key;
                    changedFields[dbFieldName] = field.currentVal;
                    if (key === "plan") {
                        changedFields.sub_price = Number((
                            field.currentVal === "basico" ? 299.99 :
                                field.currentVal === "premium" ? 449.49 :
                                    field.currentVal === "vip" ? 699.99 : 0
                        ).toFixed(2));
                    }
                }
            });
            return changedFields;
        }

        // Function to check if current field value is different from whats stored in customerInfo
        function formHasNewInfo() {
            // Check for new info only after form has been populated
            if (UserRegisterForm.isPopulating) return false;
            // Use getChangedFields and check if any changes exist
            return Object.keys(getChangedFields()).length > 0;
        }
    } catch (err) {
        console.error("Error during form initialization:", err);
    }
})();
