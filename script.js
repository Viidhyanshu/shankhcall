document.addEventListener('DOMContentLoaded', () => {
    // --- Main container and panel toggle buttons ---
    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');

    // --- Sign Up Form Sections and Elements ---
    const signUpForm = document.getElementById('signUpForm');
    const roleOptions = document.querySelectorAll('.role-option');
    const registrationDetails = document.getElementById('registration-details');
    const otpVerificationSection = document.getElementById('otp-verification-section');
    const backArrow = document.getElementById('back-arrow');
    
    // --- Input Fields ---
    const nameInput = document.getElementById('name-input');
    const emailInput = document.getElementById('email-input');
    const phoneInput = document.getElementById('phone-input');
    const passwordInput = document.getElementById('password-input');
    const robotCheck = document.getElementById('robot-check-input');
    
    // --- OTP Elements ---
    const emailOtpGroup = document.getElementById('email-otp-group');
    const phoneOtpGroup = document.getElementById('phone-otp-group');
    const emailOtpInput = document.getElementById('email-otp-input');
    const phoneOtpInput = document.getElementById('phone-otp-input');
    const verifyEmailBtn = document.getElementById('verify-email-btn');
    const verifyPhoneBtn = document.getElementById('verify-phone-btn');

    // --- Buttons and Messages ---
    const createAccountBtn = document.getElementById('create-account-btn');
    const formError = document.getElementById('form-error');

    // --- State Variables for Verification Flow ---
    let selectedRole = null;
    let generatedEmailOtp = null;
    let generatedPhoneOtp = null;
    let isEmailVerified = false;
    let isPhoneVerified = false;
    let needsEmailVerification = false;
    let needsPhoneVerification = false;

    // --- Event Listeners for toggling Sign In/Sign Up panels ---
    if (registerBtn) {
        registerBtn.addEventListener('click', () => container.classList.add("active"));
    }
    if (loginBtn) {
        loginBtn.addEventListener('click', () => container.classList.remove("active"));
    }

    // --- Function to reset the sign-up form ---
    const resetSignUpForm = () => {
        signUpForm.reset();
        formError.textContent = '';
        roleOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Reset state variables
        selectedRole = null;
        generatedEmailOtp = null;
        generatedPhoneOtp = null;
        isEmailVerified = false;
        isPhoneVerified = false;
        needsEmailVerification = false;
        needsPhoneVerification = false;

        // Reset UI elements
        registrationDetails.classList.remove('visible-section');
        registrationDetails.classList.add('hidden-section');
        otpVerificationSection.classList.remove('visible-section');
        otpVerificationSection.classList.add('hidden-section');
        emailOtpGroup.classList.add('hidden-section');
        phoneOtpGroup.classList.add('hidden-section');
        createAccountBtn.classList.add('hidden-section');
        
        // Re-enable inputs and buttons for next time
        emailOtpInput.disabled = false;
        phoneOtpInput.disabled = false;
        verifyEmailBtn.style.display = 'inline-block';
        verifyPhoneBtn.style.display = 'inline-block';
        emailOtpGroup.querySelector('.verified-icon').style.display = 'none';
        phoneOtpGroup.querySelector('.verified-icon').style.display = 'none';

        container.classList.remove('expanded');
        backArrow.classList.remove('visible');
    };

    // 1. Handle Role Selection
    roleOptions.forEach(option => {
        option.addEventListener('click', () => {
            roleOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedRole = option.getAttribute('data-role');
            
            container.classList.add('expanded');
            registrationDetails.classList.add('visible-section');
            registrationDetails.classList.remove('hidden-section');
            backArrow.classList.add('visible');
        });
    });

    // 2. Handle "Continue" button click (Validation and OTP Generation)
    signUpForm.addEventListener('submit', (event) => {
        event.preventDefault();
        formError.textContent = '';

        const isEmailProvided = emailInput.value.trim() !== '';
        const isPhoneProvided = phoneInput.value.trim() !== '';
        
        // --- Validation ---
        if (!selectedRole) { formError.textContent = 'Please select a role.'; return; }
        if (!isEmailProvided && !isPhoneProvided) { formError.textContent = 'Please provide an email or phone number.'; return; }
        if (passwordInput.value.length < 6) { formError.textContent = 'Password must be at least 6 characters long.'; return; }
        if (!robotCheck.checked) { formError.textContent = 'Please confirm you are not a robot.'; return; }

        // --- Set Verification Requirements ---
        needsEmailVerification = isEmailProvided;
        needsPhoneVerification = isPhoneProvided;

        // --- Conditional OTP Generation ---
        if (needsEmailVerification) {
            generatedEmailOtp = Math.floor(1000 + Math.random() * 9000).toString();
            console.log(`Email OTP: ${generatedEmailOtp}`);
            alert(`Your EMAIL verification code is: ${generatedEmailOtp}`);
            emailOtpGroup.classList.remove('hidden-section');
            emailOtpGroup.querySelector('.verified-icon').style.display = 'none'; // FIX: Ensure icon is hidden
        }
        if (needsPhoneVerification) {
            generatedPhoneOtp = Math.floor(1000 + Math.random() * 9000).toString();
            console.log(`Phone OTP: ${generatedPhoneOtp}`);
            alert(`Your PHONE verification code is: ${generatedPhoneOtp}`);
            phoneOtpGroup.classList.remove('hidden-section');
            phoneOtpGroup.querySelector('.verified-icon').style.display = 'none'; // FIX: Ensure icon is hidden
        }

        // --- Move to OTP step ---
        registrationDetails.classList.add('hidden-section');
        registrationDetails.classList.remove('visible-section');
        otpVerificationSection.classList.add('visible-section');
        otpVerificationSection.classList.remove('hidden-section');
        
        // If only one verification is needed, show the final button immediately
        checkAllVerified();
    });
    
    // --- Function to check if all required verifications are complete ---
    function checkAllVerified() {
        if (needsEmailVerification === isEmailVerified && needsPhoneVerification === isPhoneVerified) {
            createAccountBtn.classList.remove('hidden-section');
            verifyEmailBtn.style.display = 'none';
            verifyPhoneBtn.style.display = 'none';
        }
    }

    // 3. Handle Individual OTP Verifications
    verifyEmailBtn.addEventListener('click', () => {
        if (emailOtpInput.value === generatedEmailOtp) {
            isEmailVerified = true;
            emailOtpInput.disabled = true;
            verifyEmailBtn.style.display = 'none';
            emailOtpGroup.querySelector('.verified-icon').style.display = 'inline-block';
            formError.textContent = '';
            checkAllVerified();
        } else {
            formError.textContent = 'Incorrect Email OTP.';
        }
    });

    verifyPhoneBtn.addEventListener('click', () => {
        if (phoneOtpInput.value === generatedPhoneOtp) {
            isPhoneVerified = true;
            phoneOtpInput.disabled = true;
            verifyPhoneBtn.style.display = 'none';
            phoneOtpGroup.querySelector('.verified-icon').style.display = 'inline-block';
            formError.textContent = '';
            checkAllVerified();
        } else {
            formError.textContent = 'Incorrect Phone OTP.';
        }
    });

    // 4. Handle Final Account Creation
    createAccountBtn.addEventListener('click', () => {
        console.log('Form is valid! Submitting data...');
        alert('Account creation successful! Please sign in.');
        
        // Reset the form and transition to the sign-in panel
        resetSignUpForm();
        container.classList.remove("active"); // FEATURE: Transition to sign-in
    });

    // 5. Handle Back Arrow Click
    backArrow.addEventListener('click', resetSignUpForm);
});
