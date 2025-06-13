// === All field validation functions === //

// CPF validation function
function validateCpf(rawCpf) {
  let cleanCpf = rawCpf.trim().replace(/\D/g, "");
  const repeated = [
    '00000000000', '11111111111', '22222222222',
    '33333333333', '44444444444', '55555555555',
    '66666666666', '77777777777', '88888888888',
    '99999999999'];

  if (cleanCpf.length !== 11) return false;

  if (repeated.includes(cleanCpf)) return false;

  const digit1 = calcCheckDigit(cleanCpf.slice(0, 9), 10);
  const digit2 = calcCheckDigit(cleanCpf.slice(0, 10), 11);

  return (
    digit1 === parseInt(cleanCpf[9], 10) &&
    digit2 === parseInt(cleanCpf[10], 10)
  );

  function calcCheckDigit(cpfPart, factor) {
    let total = 0;
    for (let i = 0; i < cpfPart.length; i++) {
      total += parseInt(cpfPart[i], 10) * (factor - i);
    }
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  }
}

// date of birth validation function
function validateDob(dob) {
  const today = new Date();
  const yyyy = today.getFullYear().toString();
  const mmdd = (today.getMonth() + 1).toString().padStart(2, '0') + '-'
    + today.getDate().toString().padStart(2, '0');
  let age = parseInt(yyyy) - parseInt(dob.slice(0, 4), 10);

  if (dob.slice(5) > mmdd) {
    age--;
  }

  return (age >= 15 && age <= 80);
}

// Validates Brazilian landline or mobile numbers using official DDDs.
function validatePhone(rawPhone) {
  // Official valid DDDs in Brazil
  const validDdds = [
    "11", "12", "13", "14", "15", "16", "17", "18", "19",
    "21", "22", "24", "27", "28",
    "31", "32", "33", "34", "35", "37", "38",
    "41", "42", "43", "44", "45", "46",
    "47", "48", "49", "51", "53", "54", "55",
    "61", "62", "63", "64", "65", "66", "67", "68", "69",
    "71", "73", "74", "75", "77", "79",
    "81", "82", "83", "84", "85", "86", "87", "88", "89",
    "91", "92", "93", "94", "95", "96", "97", "98", "99"
  ];

  // Remove all non-digit characters from the input & Separate DDD from phone number 
  const digits = rawPhone.replace(/\D/g, "");
  const cleanDdd = digits.slice(0, 2);
  const cleanPhone = digits.slice(2);

  // Phone number must be either 10 digits (landline) or 11 digits (mobile)
  if (digits.length !== 10 && digits.length !== 11) return false;

  // DDD must be in the official list and no lesser then 11
  if (parseInt(cleanDdd, 10) < 11 || !validDdds.includes(cleanDdd)) return false;

  // For mobile phones (11 digits), the number must start with 9
  if (digits.length === 11 && cleanPhone[0] !== "9") return false;

  // For landlines (10 digits), the number must NOT start with 9
  if (digits.length === 10 && cleanPhone[0] === "9") return false;

  return true;
}

// Validate names
function validateName(rawName) {
  let cleanName = rawName.trim();
  // Fail if the string contains any character other than Latin letters and spaces
  if (!/^[A-Za-z ]+$/.test(cleanName)) {
    return false;
  }
  // Fail if it contains tab, newline, or any non-space whitespace
  if (/[\t\n\r\f\v]/.test(cleanName)) {
    return false;
  }
  // Check total length
  if (cleanName.length > 100) {
    return false;
  }
  // Split strictly on single space characters & 
  // Remove empty strings from repeated spaces (just in case)
  let words = cleanName.split(' ');
  words = words.filter(function (word) {
    return word.length > 0;
  });
  // Must have at least two words
  if (words.length < 2) {
    return false;
  }
  // Each word must be sized at least 3 letters long
  for (let i = 0; i < words.length; i++) {
    if (words[i].length < 3) {
      return false;
    }
  }
  // Fail if fewer than 4 unique letters (ignoring spaces)
  const uniqueChars = new Set(cleanName.replace(/ /g, '').toLowerCase());
  if (uniqueChars.size < 4) {
    return false;
  }
  // If all tests have passed and if the name doesnt have only equal words then return true
  for (let i = 1; i < words.length; i++) {
    if (words[0].toLowerCase() !== words[i].toLowerCase()) {
      return true;
    }
  }
  // if it didnt pass the test above then its false
  return false;
}

// Email Validation Function
function validateEmail(rawEmail) {
  const emailRegex = /^(?!.*\.\.)(?!.*\.$)(?!^\.)[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,63}$/;
  let cleanEmail = rawEmail.trim();
  
  // Check if email length is valid
  if (cleanEmail.length > 254) {
    return false;
  }
  // Return true or false based on regex test
  return emailRegex.test(cleanEmail);
}

function validateCep(rawCep, addressInfo) {
  return new Promise(function (resolve) {
    const cleanCep = rawCep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      return resolve(false);
    }

    fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.erro) {
          resolve(false);
        } else {
          Object.assign(addressInfo, data);
          resolve(true);
        }
      })
      .catch(function () {
        resolve(false);
      });
  });
}

function validateAddNum(rawNum) {
  const cleanVal = parseInt(rawNum.trim().replace(/\D/g, ""), 10);

  // Must be not empty and a positive integer between 1 and 9999
  return (cleanVal > 0 && cleanVal <= 9999);
}

function validateAddrL2(rawAddrL2) {
  const cleanAddrL2 = rawAddrL2.trim();
  const uniqueChars = new Set(cleanAddrL2.replace(/\s/g, '').split(''));
  const validWord = /\b\w{3,}\b/.test(cleanAddrL2);

  return (cleanAddrL2.length >= 3 && uniqueChars.size >= 3 && validWord);
}

// Formats input values based on their field type (CPF, CEP, phone, or email) 
// and update their own field following the standard display for each one
function formatInput(inputId, value) {
  let cleanVal = "";
  let splitWords = "";

  if (!value) return "";

  switch (inputId) {
    case "cpf":
      cleanVal = value.trim().replace(/\D/g, "");
      if (cleanVal.length <= 3) {
        return cleanVal;
      } else if (cleanVal.length <= 6) {
        return cleanVal.replace(/(\d{3})(\d{0,3})/, "$1.$2");
      } else if (cleanVal.length <= 9) {
        return cleanVal.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
      } else {
        return cleanVal.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
      }

    case "phone":
      cleanVal = value.trim().replace(/\D/g, "");
      if (cleanVal.length === 0) {
        return "";
      } else if (cleanVal.length === 1) {
        return "(" + cleanVal;
      } else if (cleanVal.length === 2) {
        return "(" + cleanVal;
      } else if (cleanVal.length <= 6) {
        return cleanVal.replace(/(\d{2})(\d{0,4})/, "($1) $2");
      } else if (cleanVal.length <= 10) {
        return cleanVal.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
      } else {
        return cleanVal.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
      }

    case "name":
      cleanVal = value.replace(/[^A-Za-z ]+/g, '');  // Replace all non-letters and non-spaces with nothing
      cleanVal = cleanVal.replace(/\s+/g, ' ');      // Collapse multiple spaces into one

      splitWords = cleanVal.split(' ');                                          // split name into words
      splitWords = splitWords.filter(function (word) { return word.length > 0; });        // Remove empty strings (caused by spaces)
      for (let i = 0; i < splitWords.length; i++) {                                 // Capitalize each word
        splitWords[i] = splitWords[i].charAt(0).toUpperCase() + splitWords[i].slice(1).toLowerCase();
      }

      result = splitWords.join(' ');   // Joins the words back into a single string, 
      if (value.endsWith(' ')) {   // if clean value (after replaces) had one trailing space then
        result += ' ';               // add the one trailing space back
      }
      return result;

    case "email":
      return value.replace(/\s+/g, "").toLowerCase();

    case "cep":
      cleanVal = value.trim().replace(/\D/g, "");
      if (cleanVal.length <= 5) {
        return cleanVal;
      } else {
        return cleanVal.replace(/(\d{5})(\d{0,3})/, "$1-$2");
      }

    case "addressNum":
      cleanVal = value.trim().replace(/\D/g, ""); // Keep digits only 
      cleanVal = cleanVal.replace(/^0+/, "");     // Remove leading zeros (e.g., "0004" → "4")

      // Enforce max length of 4 digits
      if (cleanVal.length > 4) {
        return cleanVal.slice(0, 4);
      }
      // If empty or zero after cleanup, reject
      if (cleanVal === "" || parseInt(cleanVal, 10) === 0) {
        return "";
      }
      return cleanVal;

    case "addressLine2":
      cleanVal = value
        .replace(/\s+/g, ' ')    // Collapse multiple spaces into one
        .replace(/[^A-Za-z0-9\s,.'-\/@#&]+/g, '');  // Allow letters, numbers, spaces, commas, periods, apostrophes, hyphens, slashes, @, #, &

      splitWords = cleanVal.split(' ');
      splitWords = splitWords.filter(function (word) {
        return word.length > 0;
      });

      cleanVal = splitWords.join(' ');
      if (value.endsWith(' ')) {
        cleanVal += ' ';  // Preserve trailing space while typing
      }

      return cleanVal;

    default: return value;
  }
}

// Function to sanitize HTML input by removing unwanted tags and attributes
function sanitizeHTML(input) {
  if (!input) { return ""; }
  const temp = document.createElement('div');
  temp.innerHTML = input;
  const whitelistTags = {
    'b': [],
    'i': [],
    'u': [],
    'strong': [],
    'em': [],
    'br': [],
    'p': ['style'],
    'ul': [],
    'ol': [],
    'li': [],
    'span': [],
  };

  clean(temp);
  return temp.innerHTML;

  // Function to recursively clean nodes and their children
  function clean(node) {
    const children = Array.from(node.childNodes);

    children.forEach(function (child) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.nodeName.toLowerCase();
        if (!whitelistTags.hasOwnProperty(tag)) {
          // If tag is not allowed, remove but preserve its children
          const grandChildren = Array.from(child.childNodes);
          grandChildren.forEach(function (gc) {
            node.insertBefore(gc, child);
          });
          node.removeChild(child);
        } else {
          // Clean allowed attributes 
          const allowedAttrs = whitelistTags[tag];
          Array.from(child.attributes).forEach(function (attr) {
            if (!allowedAttrs.includes(attr.name)) {
              child.removeAttribute(attr.name);
            }
            // Force-remove any URL-related attributes (href/src)
            if (attr.name === 'href' || attr.name === 'src') {
              child.removeAttribute(attr.name);
            }
          });
          // Recursively clean child nodes
          clean(child);
        }
      } else if (child.nodeType === Node.COMMENT_NODE) {
        // Strip comments entirely
        node.removeChild(child);
      }
    });
  }
}
