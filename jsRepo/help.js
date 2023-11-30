/**
 * @author Christian Boughton
 */

//Try to grab user infomration if they are logged in and change the icon to indicate they have logged in
user = JSON.parse(sessionStorage.getItem('user'));
if (user != null)   {
    document.getElementById("saveButton").classList.toggle("show");
    changeIcon(user.name);
}

/**
 *  Changes the Icon for a user that is logged in 
 *  @param {*} name 
 */
function changeIcon(name)   {
    var firstLetter = name.charAt(0);
    firstLetter.toUpperCase();
    path = "images/Letter_icons/" + firstLetter + ".png";
    document.getElementById("img").setAttribute("src", path);
}

/**
 *  Controls the location of where the icon
 *  directs when clicked based on a user being
 *  logged in or not 
 */
document.getElementById("userIcon").onclick = function()    {
    if (user != null)   {
        window.location.href = "account.html";
    }
    else{
        window.location.href = "CapturePortal.html";
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

	await fetch(url, fetchOptions);
}

/**
 *  Event handler for a submited contact
 *  @param {SubmitEvent} event
 */
async function handleFormSubmitContact(event) {
	event.preventDefault();
    const form = event.currentTarget;
    const url = form.action;

    try {
        const formData = new FormData(form);
        await postFormDataAsJson({ url, formData });
		document.getElementById("contactForm").reset();
    } 
    catch (error) {
        console.error(error);
    }
}
const recoverForm = document.getElementById("contactForm");
recoverForm.addEventListener("submit", handleFormSubmitContact);