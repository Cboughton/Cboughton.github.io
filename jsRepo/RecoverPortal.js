/**
 *  @author Christian Boughton 
 */

/**
 *  Function that takes the user inputs for the login
 *  form and ensures they meet the minimum criteria
 *
 *  The current criteria is no empty input boxes and a 
 *  password length of at least 8 characters
 * @returns Status of operation
 */
function validateRecoveryForm() {
	var mail = document.getElementById("logEmail").value;

	// No empty input cells
	if (mail == "") {
		document.getElementById("errorMsg").innerHTML = "Please Enter your Email"
		return false;
	}

	// All requierments have been met
	else {
		document.getElementById("errorMsg").innerHTML = ""
		return true;
	}
}

/**
 *  Helper function for POSTing data as JSON with fetch.
 *  @param {Object} options
 *  @param {string} options.url - URL to POST data to
 *  @param {FormData} options.formData - `FormData` instance
 *  @return {Object} - Response body from URL that was POSTed to
 */
async function postFormDataAsJson({ url, formData }) {
	const plainFormData = Object.fromEntries(formData.entries());
	const formDataJsonString = JSON.stringify(plainFormData);

	const fetchOptions = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
            mode: "no-cors",
		},
		body: formDataJsonString,
	};

	const response = await fetch(url, fetchOptions);

	if (!response.ok) {
		const errorMessage = await response.text();
		throw new Error(errorMessage);
	}

	return response.json();
}

/**
 *  Event handler for a Login form submit event.
 *  @param {SubmitEvent} event
 */
async function handleFormSubmitRecover(event) {
	event.preventDefault();
    var validate = validateRecoveryForm();
    if (validate === false) {

    }

    else{

        const form = event.currentTarget;
        const url = form.action;

        try {
            const formData = new FormData(form);
            const responseData = await postFormDataAsJson({ url, formData });
			var obj = JSON.parse(responseData);
			document.getElementById("recoverForm").reset();
			if (obj == "true")	{
				document.getElementById("errorMsg").innerHTML = "Please check your inbox for account recovery information";
			}
			else {
				document.getElementById("errorMsg").innerHTML = "Unable to send recovery information";
			}
        } 
        catch (error) {
            console.error(error);
        }
    }
}
const recoverForm = document.getElementById("recoverForm");
recoverForm.addEventListener("submit", handleFormSubmitRecover);