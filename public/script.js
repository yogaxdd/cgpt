document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('paymentForm');
    const input = document.getElementById('sessionToken');
    const toggleBtn = document.getElementById('toggleVisibility');
    const eyeIcon = document.getElementById('eyeIcon');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    
    const resultContainer = document.getElementById('resultContainer');
    const successState = document.getElementById('successState');
    const errorState = document.getElementById('errorState');
    const checkoutUrl = document.getElementById('checkoutUrl');
    const errorText = document.getElementById('errorText');

    toggleBtn.addEventListener('click', () => {
        if (input.type === 'password') {
            input.type = 'text';
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const token = input.value.trim();
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        if (!token) return;

        // Loading state
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnSpinner.classList.remove('hidden');
        
        resultContainer.classList.add('hidden');
        successState.classList.add('hidden');
        errorState.classList.add('hidden');

        try {
            const response = await fetch('/api/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    session_token: token,
                    payment_method: paymentMethod
                })
            });

            const data = await response.json();
            
            resultContainer.classList.remove('hidden');

            if (data.success || data.url) {
                successState.classList.remove('hidden');
                if (data.url) {
                    checkoutUrl.href = data.url;
                } else {
                    checkoutUrl.classList.add('hidden');
                }
            } else {
                errorState.classList.remove('hidden');
                errorText.textContent = data.message || "Invalid response from server.";
            }

        } catch (error) {
            resultContainer.classList.remove('hidden');
            errorState.classList.remove('hidden');
            errorText.textContent = "Connection error. Please try again later.";
        } finally {
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnSpinner.classList.add('hidden');
        }
    });
});
