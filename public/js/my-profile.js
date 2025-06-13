//js/my-profile.js
window.myProfile = window.myProfile || {};
myProfile.sectionsWrapper = document.getElementById('sections-wrapper');

const customerId = sessionStorage.getItem('customerId');
if (!customerId) {
    window.location.replace("/vibe_gym/public/");
} else {
    (async function () {
        try {
            const result = await getCustomerInfo(customerId);
            if (result.success) {
                const editBtn = document.getElementById("edit-btn");
                const delBtn = document.getElementById("delete-btn");
                const customerInfo = result.customer;

                // Brazilian States codes
                const brStatesUF = {
                    "Acre": "AC", "Alagoas": "AL", "Amapá": "AP", "Amazonas": "AM",
                    "Bahia": "BA", "Ceará": "CE", "Distrito Federal": "DF", "Espírito Santo": "ES",
                    "Goiás": "GO", "Maranhão": "MA", "Mato Grosso": "MT", "Mato Grosso do Sul": "MS",
                    "Minas Gerais": "MG", "Pará": "PA", "Paraíba": "PB", "Paraná": "PR",
                    "Pernambuco": "PE", "Piauí": "PI", "Rio de Janeiro": "RJ",
                    "Rio Grande do Norte": "RN", "Rio Grande do Sul": "RS", "Rondônia": "RO",
                    "Roraima": "RR", "Santa Catarina": "SC", "São Paulo": "SP", "Sergipe": "SE",
                    "Tocantins": "TO"
                };

                // Profile View TextField keys
                const prfViewFields = [
                    'prf-name', 'prf-cpf', 'prf-email', 'prf-phone', 'prf-dob', 'prf-gender',
                    'prf-addr', 'prf-compl', 'prf-city-uf', 'prf-cep', 'prf-plan', 'prf-unit'
                ];

                // Now loop through profileViewFields array and update each span with the corresponding values
                prfViewFields.forEach(function (key) {
                    const elem = document.getElementById(key);
                    if (elem) {
                        let value = "";
                        if (key === "prf-name") {
                            value = customerInfo.full_name;
                        } else if (key === "prf-cpf") {
                            value = formatInput("cpf", customerInfo.cpf);
                        } else if (key === "prf-email") {
                            value = customerInfo.email;
                        } else if (key === "prf-phone") {
                            value = formatInput("phone", customerInfo.phone ?? "");
                        } else if (key === "prf-dob") {
                            const dobParts = customerInfo.dob.split("-");
                            value = dobParts[2] + "/" + dobParts[1] + "/" + dobParts[0];
                        } else if (key === "prf-gender") {
                            value = customerInfo.gender === "M" ? "Masculino"
                                : customerInfo.gender === "F" ? "Feminino"
                                    : customerInfo.gender === "N/A" ? "Não Declarado"
                                        : "-----";
                        } else if (key === "prf-addr") {
                            value = customerInfo.address_num ? `${customerInfo.address_line1}, Nº${customerInfo.address_num}`
                                : `${customerInfo.address_line1}, S/N`;
                        } else if (key === "prf-compl") {
                            value = customerInfo.address_line2 ?? "";
                        } else if (key === "prf-city-uf") {
                            value = `${customerInfo.city} / ${brStatesUF[customerInfo.state]}`;
                        } else if (key === "prf-cep") {
                            value = formatInput("cep", customerInfo.cep);
                        } else if (key === "prf-plan") {
                            const planSub = `${customerInfo.plan} - R$${customerInfo.sub_price}`;
                            value = planSub.charAt(0).toUpperCase() + planSub.slice(1);
                        } else if (key === "prf-unit") {
                            value = customerInfo.location === "camboinhas" ? "Camboinhas"
                                : customerInfo.location === "icarai" ? "Icaraí"
                                    : customerInfo.location === "itaipu" ? "Itaipu"
                                        : customerInfo.location === "santarosa" ? "Santa Rosa"
                                            : customerInfo.location === "saofrancisco" ? "São Francisco"
                                                : null;
                        }
                        elem.textContent = value === "" ? "-----" : value;
                    }
                });

                // When the edit button is clicked, slide the view section out upwards and 
                // bring the edit section in from below.
                editBtn.addEventListener("click", function () {
                    myProfile.sectionsWrapper.dataset.state = 'edit';
                    UserRegisterForm.populateURegForm(customerInfo);
                });

                delBtn.addEventListener("click", function () {
                    ConfirmModal.show({
                        title: 'Tem Certeza?',
                        titleClass: 'ttl-t1',
                        message1: 'Que deseja DELETAR seu Cadastro e ENCERRAR sua Assinatura',
                        message1Class: 'msg-t5',
                        showButton1: true,
                        button1Text: '❌<br>Não, Voltar',
                        button1Class: 'btn-t1',
                        showButton2: true,
                        button2Text: '🗑️<br>Sim, Apagar e Encerrar',
                        button2Class: 'btn-t2',
                        onButton2: async function () {
                            try {
                                const response = await deleteCustomer(customerInfo.id);
                                if (response && response.success) {
                                    ConfirmModal.show({
                                        title: 'Seu cadastro foi apagado e sua assinatura cancelada!',
                                        titleClass: 'ttl-t1',
                                        message1: 'É uma pena vê-lo partir, mas esperamos que volte logo...',
                                        message1Class: 'msg-t1',
                                        message2: '😭',
                                        message2Class: 'msg-t2',
                                        showButton1: true,
                                        button1Text: 'OK',
                                        button1Class: 'solo-btn',
                                        onButton1: function () {
                                            window.location.replace("/vibe_gym/public/");
                                        }
                                    });
                                } else {
                                    ConfirmModal.show({
                                        title: '⚠️ Erro: ' + response.name,
                                        titleClass: 'ttl-t3',
                                        message1: response.message,
                                        message1Class: 'msg-t1',
                                        showButton1: true,
                                        button1Text: 'OK',
                                        button1Class: 'solo-btn',
                                        onButton1: function () {
                                            location.reload(true);
                                        }
                                    });
                                }
                            } catch (error) {
                                ConfirmModal.show({
                                    title: '❌ Erro: ' + error.name,
                                    titleClass: 'ttl-t1',
                                    message1: error.message,
                                    message1Class: 'msg-t6',
                                    showButton1: true,
                                    button1Text: 'OK',
                                    button1Class: 'solo-btn',
                                    onButton1: function () {
                                        location.reload(true);
                                    }
                                });
                            }
                        }
                    });
                });
            } else {
                window.location.replace("/vibe_gym/public/");
            }
        } catch (error) {
            window.location.replace("/vibe_gym/public/");
        }
    })();
}

// function to slide the edit section out downwards and bring the view section back in from above.
function hideFormAnim() {
    myProfile.sectionsWrapper.dataset.state = 'view';
}
