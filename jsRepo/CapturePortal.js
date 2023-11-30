/** 
 *  Functionality for account manipulation
 *  @author Christian Boughton
*/


/*
*  This Allows both the login and the signup page
*  to be present in the same URL path
*/
$(window).on("hashchange", function () {
	if (location.hash.slice(1) == "signup") {
		$(".page").addClass("extend");
		$("#login").removeClass("active");
		$("#signup").addClass("active");
	} else {
		$(".page").removeClass("extend");
		$("#login").addClass("active");
		$("#signup").removeClass("active");
	}
});
$(window).trigger("hashchange");

/*
*  Function that takes the user inputs for the login
*  form and ensures they meet the minimum criteria
*
*  The current criteria is no empty input boxes and a 
*  password length of at least 8 characters
*/
function validateLoginForm() {
	var name = document.getElementById("logName").value;
	var password = document.getElementById("logPassword").value;

	// No empty input cells
	if (name == "" || password == "") {
		document.getElementById("errorMsg").innerHTML = "Please fill the required fields"
		return false;
	}

	// No passwords under 8 characters
	else if (password.length < 8) {
		document.getElementById("errorMsg").innerHTML = "Your password must include atleast 8 characters"
		return false;
	}

	// All requirements have been met
	else {
		document.getElementById("errorMsg").innerHTML = ""
		return true;
	}
}


/*
*  Function that takes the user inputs for the signup
*  form and ensures they meet the minimum criteria
*
*  The current criteria is no empty input boxes and a 
*  password length of at least 8 characters. The email box 
*  automatically has input validation because of the type
*/
function validateSignupForm() {
	var mail = document.getElementById("signEmail").value;
	var name = document.getElementById("signName").value;
	var password = document.getElementById("signPassword").value;

	// No empty input cells
	if (mail == "" || name == "" || password == "") {
		document.getElementById("errorMsg").innerHTML = "Please fill the required fields"
		return false;
	}

	// No passwords under 8 characters
	else if (password.length < 8) {
		document.getElementById("errorMsg").innerHTML = "Your password must include atleast 8 characters"
		return false;
	}

	// All requirements have been met
	else {
		document.getElementById("errorMsg").innerHTML = ""
		return true;
	}
}

/**
 *  Helper function for POSTing data as JSON with fetch.
 *  @param {Object} options
 *  @param {string} options.url 			- URL to POST data to
 *  @param {FormData} options.formData 	- `FormData` instance
 *  @return {Object} 					- Response body from URL that was POSTed to
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
async function handleFormSubmitLogin(event) {
	event.preventDefault();
    var validate = validateLoginForm();
    if (validate === false) {
    }

    else{

        const form = event.currentTarget;
        const url = form.action;

        try {
            const formData = new FormData(form);
            const responseData = await postFormDataAsJson({ url, formData });
			var obj = JSON.parse(responseData);
			document.getElementById("loginForm").reset();
			if (obj == "-1")	{
				document.getElementById("errorMsg").innerHTML = "No accounts exsist with this username and password";
			}

			else if (obj == "-2")	{
				document.getElementById("errorMsg").innerHTML = "Password inccorect";
			}

			else {
				var name;
				for (var pair of formData.entries())	{
					if (pair[0] == "name")	{
						name = pair[1];
					}
				}
				var user = {"name" : name, "id" : obj};
				sessionStorage.setItem("user", JSON.stringify(user));
				window.location.href = "index.html";
			}

			document.getElementById("loginForm").reset();
        } 
        catch (error) {
            console.error(error);
        }
    }
}

/**
 *  Event handler for a Signup form submit event.
 *  @param {SubmitEvent} event
 */
async function handleFormSubmitSignup(event) {
	event.preventDefault();
    var validate = validateSignupForm();
    if (validate === false) {
    }
    else{

        const form = event.currentTarget;
        const url = form.action;

        try {
            const formData = new FormData(form);
            const responseData = await postFormDataAsJson({ url, formData });
			var obj = JSON.parse(responseData);
			if (obj == "-1")	{
				document.getElementById("errorMsg").innerHTML = "Please fill all areas of the Form";
			}

			else if (obj == "-2")	{
				document.getElementById("errorMsg").innerHTML = "User Name is taken";
			}

			else {
				document.getElementById("signupForm").reset();
				document.getElementById("errorMsg").innerHTML = "Good";
				window.location.href = "CapturePortal.html";
			}
        } 
        catch (error) {
            console.error(error);
        }
    }
}

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
loginForm.addEventListener("submit", handleFormSubmitLogin);
signupForm.addEventListener("submit", handleFormSubmitSignup);
