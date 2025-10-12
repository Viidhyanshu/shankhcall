// Import functions from the Firebase SDKs
      import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
      import { 
        getAuth, 
        createUserWithEmailAndPassword, 
        signInWithEmailAndPassword 
      } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
      import { 
        getFirestore, 
        doc, 
        setDoc 
      } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

      // --- Your web app's Firebase configuration ---
      const firebaseConfig = {
        apiKey: "AIzaSyCa37b-LuakNl2TwsZQES2-p_DgGgIJEuA",
        authDomain: "login-db9bb.firebaseapp.com",
        projectId: "login-db9bb",
        storageBucket: "login-db9bb.firebasestorage.app",
        messagingSenderId: "132451184061",
        appId: "1:132451184061:web:972c781b670cdff773f6d4"
      };

      // --- Initialize Firebase ---
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getFirestore(app);

      // --- Get DOM Elements (from your original script.js) ---
      const container = document.getElementById('container');
      const registerBtn = document.getElementById('register');
      const loginBtn = document.getElementById('login');
      const signUpForm = document.getElementById('signUpForm');
      const signInForm = document.getElementById('signInForm');
      const roleSelectionContainer = document.querySelector('.role-selection-container');
      const registrationDetails = document.getElementById('registration-details');
      const otpVerificationSection = document.getElementById('otp-verification-section');
      const roleOptions = document.querySelectorAll('.role-option');
      const backArrow = document.getElementById('back-arrow');
      const emailInput = document.getElementById('email-input');
      const phoneInput = document.getElementById('phone-input');
      const passwordInput = document.getElementById('password-input');
      const createAccountBtn = document.getElementById('create-account-btn');
      const formError = document.getElementById('form-error');
      const signInError = document.getElementById('signInError');

      // --- State Variables ---
      let selectedRole = null;

      // --- Function to show a specific step in the sign-up form ---
      const showStep = (step) => {
        roleSelectionContainer.classList.add('hidden-section');
        registrationDetails.classList.add('hidden-section');
        otpVerificationSection.classList.add('hidden-section');
        backArrow.classList.remove('visible');
        
        // Default height is not expanded
        container.classList.remove('expanded');

        if (step === 'roles') {
            roleSelectionContainer.classList.remove('hidden-section');
        } else if (step === 'details') {
            registrationDetails.classList.remove('hidden-section');
            backArrow.classList.add('visible');
            container.classList.add('expanded');
        } else if (step === 'otp') {
            otpVerificationSection.classList.remove('hidden-section');
            backArrow.classList.add('visible');
            container.classList.add('expanded');
        }
      };

      // --- Function to reset the sign-up form ---
      const resetSignUpForm = () => {
        signUpForm.reset();
        formError.textContent = '';
        roleOptions.forEach(opt => opt.classList.remove('selected'));
        selectedRole = null;
        if (typeof grecaptcha !== 'undefined') {
            try { grecaptcha.reset(); } catch (e) { console.log('reCAPTCHA reset failed:', e); }
        }
        // This class controls the smaller banner on mobile
        container.classList.remove('form-active'); 
        showStep('roles');
      };

      // --- Initial Setup ---
      resetSignUpForm();

      // --- Event Listeners for panel toggle ---
      registerBtn.addEventListener('click', () => {
        container.classList.add("active");
        resetSignUpForm();
      });

      loginBtn.addEventListener('click', () => {
        container.classList.remove("active");
        // Also remove the form-active class when switching back to login
        container.classList.remove("form-active"); 
        resetSignUpForm();
      });

      // --- Handle Role Selection ---
      roleOptions.forEach(option => {
        option.addEventListener('click', () => {
            roleOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedRole = option.getAttribute('data-role');
            // Add class to trigger CSS for smaller banner on mobile
            container.classList.add('form-active');
            setTimeout(() => showStep('details'), 200);
        });
      });

      // --- Handle Sign-Up Form Submission (Step 1: Details) ---
      signUpForm.addEventListener('submit', (event) => {
        event.preventDefault();
        formError.textContent = '';

        if (!selectedRole) {
            formError.textContent = 'Please select a role.';
            return;
        }
        if (passwordInput.value.length < 6) {
            formError.textContent = 'Password must be at least 6 characters long.';
            return;
        }
        
        showStep('otp');
      });
      
      // --- Handle Final Account Creation ---
      createAccountBtn.addEventListener('click', async () => {
          formError.textContent = '';
          const name = signUpForm.querySelector('input[type="text"]').value;
          const email = emailInput.value;
          const password = passwordInput.value;
          const phone = phoneInput.value;

          if (!name || !email || !password || !selectedRole) {
              formError.textContent = 'Please fill all required fields.';
              return;
          }

          try {
              const userCredential = await createUserWithEmailAndPassword(auth, email, password);
              const user = userCredential.user;

              await setDoc(doc(db, "users", user.uid), {
                  uid: user.uid,
                  name: name,
                  email: email,
                  phone: phone,
                  role: selectedRole,
                  createdAt: new Date()
              });

              alert('Account created successfully! Please sign in.');
              resetSignUpForm();
              container.classList.remove("active");

          } catch (error) {
              console.error("Error creating account:", error);
              if (error.code === 'auth/email-already-in-use') {
                  formError.textContent = 'This email address is already in use.';
              } else if (error.code === 'auth/weak-password') {
                  formError.textContent = 'The password is too weak.';
              } else {
                  formError.textContent = 'An error occurred. Please try again.';
              }
          }
      });

      // --- Handle Sign-In Form Submission ---
      signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        signInError.textContent = '';
        const email = signInForm.querySelector('input[type="email"]').value;
        const password = signInForm.querySelector('input[type="password"]').value;

        if (!email || !password) {
            signInError.textContent = 'Please enter both email and password.';
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('Signed in successfully:', user.uid);
            alert('Sign in successful!');
            window.location.href = 'land.html';
        } catch (error) {
            console.error("Error signing in:", error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                signInError.textContent = 'Invalid email or password.';
            } else {
                signInError.textContent = 'An error occurred. Please try again.';
            }
        }
      });

      // --- Handle Back Arrow Click ---
      backArrow.addEventListener('click', () => {
        // If on OTP step, go back to details
        if (otpVerificationSection.classList.contains('hidden-section') === false) {
            showStep('details');
        } 
        // If at details step, go back to roles
        else if (registrationDetails.classList.contains('hidden-section') === false) {
            // Remove the class that makes the banner small
            container.classList.remove('form-active'); 
            showStep('roles');
        }
      });
