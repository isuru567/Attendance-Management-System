// Import the QR code generation library

import QRCode from 'qrcode';




// Function to handle form submission
async function handleFormSubmission(event) {
    event.preventDefault(); // Prevent default form submission behavior

    try {
        // Get input values from form fields
        const subject = document.querySelector('input[name="subject"]').value;
        const teacher = document.querySelector('input[name="teacher"]').value;
        const password = document.querySelector('input[name="password2"]').value;
        const enable = document.querySelector('input[name="enable"]').checked;

        // Send POST request to server with form data
        const response = await fetch('/genarate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject: subject,
                teacher: teacher,
                password: password,
                enable: enable
            })
        });

        // Handle response from server
        const data = await response.json();
        if (data.success) {
            // QR code generated successfully
            console.log('QR code generated:', data.qrImageData);
            // Optionally, display the generated QR code on the page
            const qrCodeImg = document.getElementById('qrCodeImage');
            qrCodeImg.src = data.qrImageData;
        } else {
            // Error occurred during QR code generation
            console.error('QR code generation failed:', data.error);
            // Handle the error as needed (e.g., display an error message to the user)
        }
    } catch (error) {
        console.error('Form submission failed:', error);
        // Handle any other errors
    }
}





// Attach event listener to form submission
const form = document.querySelector('qrForm');
form.addEventListener('submit', handleFormSubmission);

/** 
// Assuming 'data' is your JSON response
const qrCodeImg = document.getElementById('qrCodeImage');
qrCodeImg.src = data.qrImageData;


        const data = 'http://localhost:3001/qr.html?id=6655d460caa4498625358998&hash=%242b%2410%24uHyfzZVshiwUDxeWNVjPZOJUqskpdGWMfdDLYE4HU.mn4bSTMeWPS';
        new QRCode(document.getElementById("qrcode"), data);
        function getUrlParams() {
            const params = new URLSearchParams(window.location.search);
            return {
                id: params.get('id'),
                hash: params.get('hash')
            };
        }

        function displayParams() {
            const { id, hash } = getUrlParams();
            document.getElementById('params').innerText = `ID: ${id}, Hash: ${hash}`;
        }

        window.onload = displayParams;


        document.getElementById('qrForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(this);
        
            fetch(this.action, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('qrCodeImage').src = data.qrImageData;  // Set Base64 image data
                } else {
                    alert('Failed to generate QR code');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
        */

       

       
       



















