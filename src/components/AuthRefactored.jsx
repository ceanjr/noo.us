import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import {
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import Dashboard from "./Dashboard";
import Toast, { showToast } from "./Toast";
import Modal from "./Modal";

// Custom Hooks
import { useAuthState } from "../hooks/useAuthState";
import { usePhoneAuth } from "../hooks/usePhoneAuth";

// Services
import {
  emailSignup,
  emailLogin,
  phoneSignup,
  googleSignIn,
  sendPasswordReset,
  logout,
} from "../services/authService";
import {
  validateBrazilPhone,
  validatePassword,
  validateEmail,
  validateName,
} from "../services/validationService";

// Utils
import { formatPhoneDisplay, cleanPhone } from "../utils/formatters";

// UI Components
import AuthChoice from "./auth/AuthChoice";
import EmailSignupForm from "./auth/EmailSignupForm";
import PhoneSignupForm from "./auth/PhoneSignupForm";
import EmailLoginForm from "./auth/EmailLoginForm";
import PhoneLoginForm from "./auth/PhoneLoginForm";
import PhoneVerification from "./auth/PhoneVerification";
import ForgotPasswordModal from "./auth/ForgotPasswordModal";
import EmailVerificationBanner from "./EmailVerificationBanner";
import SMSLoadingSkeleton from "./auth/SMSLoadingSkeleton";
import { loadUserProfile, ensureAvatarDefaults } from "../services/userService";

export default function Auth() {
  // Auth state
  const { user, profile, loading, setProfile } = useAuthState();

  // Phone auth
  const {
    showVerificationStep,
    verificationCode,
    isSendingSMS,
    setVerificationCode,
    sendVerification,
    verifyCode,
  } = usePhoneAuth();

  // Navigation state
  const [step, setStep] = useState("choice"); // 'choice' | 'signup' | 'login'
  const [authMethod, setAuthMethod] = useState("email");

  // Restore persisted step/method
  useEffect(() => {
    try {
      const savedStep = localStorage.getItem("authStep");
      if (savedStep === "signup" || savedStep === "login") setStep(savedStep);
      const savedMethod = localStorage.getItem("authMethod");
      if (savedMethod === "email" || savedMethod === "phone") setAuthMethod(savedMethod);
    } catch {}
  }, []);

  // Persist step/method
  useEffect(() => {
    try {
      localStorage.setItem("authStep", step);
      localStorage.setItem("authMethod", authMethod);
    } catch {}
  }, [step, authMethod]);

  // Form state - Signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("Gênero Neutro");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state - Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Password reset
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPhone, setResetPhone] = useState("");
  const [resetMethod, setResetMethod] = useState("email");

  // Validation errors
  const [passwordError, setPasswordError] = useState("");

  // Modal
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });

  // Handlers
  const handleEmailSignup = async (e) => {
    e.preventDefault();

    const nameError = validateName(name);
    if (nameError) { showToast(nameError, "error"); return; }

    const emailError = validateEmail(email);
    if (emailError) { showToast(emailError, "error"); return; }

    const passwordValidation = validatePassword(password, confirmPassword);
    if (passwordValidation) { setPasswordError(passwordValidation); showToast(passwordValidation, "error"); return; }

    try {
      await emailSignup({ email, password, name, gender });
    } catch (error) {
      console.error("Erro no signup:", error);
      showToast(error.message || "Erro ao criar conta", "error");
    }
  };

  const handlePhoneSignup = async (e) => {
    e.preventDefault();

    const nameError = validateName(name);
    if (nameError) { showToast(nameError, 'error'); return; }

    const phoneError = validateBrazilPhone(phoneNumber);
    if (phoneError) { showToast(phoneError, 'error'); return; }

    try {
      const success = await sendVerification(cleanPhone(phoneNumber));
      if (!success) { showToast('Erro ao enviar código de verificação', 'error'); return; }
      setStep('signup');
    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      showToast(error.message || 'Erro ao enviar código', 'error');
    }
  };

  const handleVerifySignupCode = async () => {
    if (verificationCode.length !== 6) { showToast("Digite o código de 6 dígitos", "error"); return; }

    try {
      const firebaseUser = await verifyCode();
      if (!firebaseUser) { showToast("Código inválido", "error"); return; }

      await phoneSignup({
        userId: firebaseUser.uid,
        name,
        phoneNumber: cleanPhone(phoneNumber),
        gender,
      });

      // Eagerly hydrate profile to avoid falling back to signup screen
      try {
        let newProfile = await loadUserProfile(firebaseUser.uid);
        if (newProfile) {
          newProfile = await ensureAvatarDefaults(firebaseUser.uid, newProfile);
          setProfile(newProfile);
          showToast("Conta criada com sucesso!", "success");
        }
      } catch {}
    } catch (error) {
      console.error("Erro ao verificar código:", error);
      showToast(error.message || "Erro ao verificar código", "error");
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(loginEmail);
    if (emailError) { showToast(emailError, "error"); return; }

    if (!loginPassword) { showToast("Digite sua senha", "error"); return; }

    try {
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      await emailLogin(loginEmail, loginPassword);
    } catch (error) {
      console.error("Erro no login:", error);
      showToast(error.message || "E-mail ou senha incorretos", "error");
    }
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();

    const phoneError = validateBrazilPhone(loginPhone);
    if (phoneError) { showToast(phoneError, "error"); return; }
    const success = await sendVerification(cleanPhone(loginPhone));
    if (!success) { showToast('Erro ao enviar código de verificação', 'error'); return; }
  };

  const handleGoogleSignIn = async () => {
    try {
      const isSignup = step === "signup";
      await googleSignIn(isSignup);
    } catch (error) {
      console.error("Erro no Google Sign In:", error);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (resetMethod === "email") {
      const emailError = validateEmail(resetEmail);
      if (emailError) { showToast(emailError, "error"); return; }
      try {
        await sendPasswordReset(resetEmail);
        showToast("E-mail de recuperação enviado! ✅", "success");
        setShowForgotPassword(false);
        setResetEmail("");
      } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
        showToast(error.message || "Erro ao enviar e-mail de recuperação", "error");
      }
    } else {
      const phoneError = validateBrazilPhone(resetPhone);
      if (phoneError) { showToast(phoneError, "error"); return; }
      showToast("Para recuperar senha via telefone, entre em contato com suporte@noo.us informando seu número", "info");
      setShowForgotPassword(false);
      setResetPhone("");
    }
  };

  const handlePhoneChange = (value, setter) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) setter(cleaned);
  };

  const handleVerifyLoginCode = async () => {
    if (verificationCode.length !== 6) { showToast("Digite o código de 6 dígitos", "error"); return; }
    try {
      const firebaseUser = await verifyCode();
      if (!firebaseUser) { showToast("Código inválido", "error"); return; }
      let newProfile = await loadUserProfile(firebaseUser.uid);
      if (newProfile) {
        newProfile = await ensureAvatarDefaults(firebaseUser.uid, newProfile);
        setProfile(newProfile);
        showToast('Login realizado com sucesso!', 'success');
      } else {
        showToast('Conta não encontrada. Complete seu cadastro.', 'warning');
        setAuthMethod('phone');
        setStep('signup');
      }
    } catch (error) {
      console.error('Erro ao verificar código (login):', error);
      showToast(error.message || 'Erro ao verificar código', 'error');
    }
  };

  // Logout handler: sign out and return to choice
  const handleLogout = async () => {
    const uid = user?.uid;
    try {
      await logout();
    } finally {
      if (uid) {
        try { localStorage.removeItem(`activeLink:${uid}`); } catch {}
      }
      try {
        localStorage.setItem("authStep", "choice");
        localStorage.setItem("authMethod", "email");
      } catch {}
      setAuthMethod("email");
      setStep("choice");
    }
  };

  // Ensure avatar defaults for existing users (one-time on load)
  useEffect(() => {
    const uid = user?.uid;
    if (!uid || !profile) return;
    if (!profile.avatarBg || !profile.photoURL) {
      (async () => {
        try {
          const updated = await ensureAvatarDefaults(uid, profile);
          if (updated) setProfile(updated);
        } catch {}
      })();
    }
  }, [user?.uid, profile?.avatarBg, profile?.photoURL]);

  // Render
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (user && profile) {
    // Verificar se email precisa ser verificado (apenas para auth por email)
    if (user.providerData?.[0]?.providerId === 'password' && !user.emailVerified) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <EmailVerificationBanner user={user} onLogout={handleLogout} />
          </div>
        </div>
      );
    }
    
    return <Dashboard profile={profile} userId={user?.uid} setModal={setModal} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div id="recaptcha-container" />
      <Toast />
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      {step === "choice" && (
        <AuthChoice onSignupClick={() => setStep("signup")} onLoginClick={() => setStep("login")} />
      )}

      {step === "signup" && !showVerificationStep && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-theme-secondary rounded-3xl shadow-2xl p-6 max-w-md w-full mx-auto">
            <div className="flex items-center justify-between mb-5">
              <button type="button" onClick={() => setStep("choice")} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" aria-label="Voltar">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <img src="/images/app-icon.svg" alt="noo.us" className="w-8 h-8" />
                <img src="/images/app-title.svg" alt="noo.us" className="h-6" />
              </div>
              <div className="w-9" />
            </div>
            <div className="mb-5 grid grid-cols-2 bg-gray-100 rounded-xl p-1">
              <button type="button" className={`py-2 rounded-lg font-semibold ${authMethod === 'email' ? 'bg-white shadow' : 'text-gray-600'}`} onClick={() => setAuthMethod('email')}>Email</button>
              <button type="button" className={`py-2 rounded-lg font-semibold ${authMethod === 'phone' ? 'bg-white shadow' : 'text-gray-600'}`} onClick={() => setAuthMethod('phone')}>Telefone</button>
            </div>
            {authMethod === "email" ? (
              <EmailSignupForm
                name={name}
                setName={setName}
                gender={gender}
                setGender={setGender}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                passwordError={passwordError}
                onSubmit={handleEmailSignup}
                onGoogleSignIn={handleGoogleSignIn}
              />
            ) : (
              <PhoneSignupForm
                name={name}
                setName={setName}
                gender={gender}
                setGender={setGender}
                phoneNumber={phoneNumber}
                onPhoneChange={(value) => handlePhoneChange(value, setPhoneNumber)}
                phoneError={null}
                formatPhoneDisplay={formatPhoneDisplay}
                onSubmit={handlePhoneSignup}
                onGoogleSignIn={handleGoogleSignIn}
              />
            )}
          </div>
        </div>
      )}

      {showVerificationStep && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-theme-secondary rounded-3xl shadow-2xl p-6 max-w-md w-full mx-auto">
            <div className="flex items-center justify-between mb-5">
              <button type="button" onClick={() => setStep("choice")} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" aria-label="Voltar">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <img src="/images/app-icon.svg" alt="noo.us" className="w-8 h-8" />
                <img src="/images/app-title.svg" alt="noo.us" className="h-6" />
              </div>
              <div className="w-9" />
            </div>
            {isSendingSMS ? (
              <SMSLoadingSkeleton />
            ) : (
              <PhoneVerification
                verificationCode={verificationCode}
                setVerificationCode={setVerificationCode}
                onSubmit={(e) => { e.preventDefault(); (step === 'signup' ? handleVerifySignupCode : handleVerifyLoginCode)(); }}
                onResendCode={() => sendVerification(cleanPhone(step === 'signup' ? phoneNumber : loginPhone))}
                phoneNumber={step === 'signup' ? phoneNumber : loginPhone}
                formatPhoneDisplay={formatPhoneDisplay}
              />
            )}
          </div>
        </div>
      )}

      {step === "login" && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-theme-secondary rounded-3xl shadow-2xl p-6 max-w-md w-full mx-auto">
            <div className="flex items-center justify-between mb-5">
              <button type="button" onClick={() => setStep("choice")} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" aria-label="Voltar">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <img src="/images/app-icon.svg" alt="noo.us" className="w-8 h-8" />
                <img src="/images/app-title.svg" alt="noo.us" className="h-6" />
              </div>
              <div className="w-9" />
            </div>
            <div className="mb-5 grid grid-cols-2 bg-gray-100 rounded-xl p-1">
              <button type="button" className={`py-2 rounded-lg font-semibold ${authMethod === 'email' ? 'bg-white shadow' : 'text-gray-600'}`} onClick={() => setAuthMethod('email')}>Email</button>
              <button type="button" className={`py-2 rounded-lg font-semibold ${authMethod === 'phone' ? 'bg-white shadow' : 'text-gray-600'}`} onClick={() => setAuthMethod('phone')}>Telefone</button>
            </div>
            {authMethod === "email" ? (
              <EmailLoginForm
                email={loginEmail}
                setEmail={setLoginEmail}
                password={loginPassword}
                setPassword={setLoginPassword}
                showPassword={showLoginPassword}
                setShowPassword={setShowLoginPassword}
                rememberMe={rememberMe}
                setRememberMe={setRememberMe}
                onSubmit={handleEmailLogin}
                onGoogleSignIn={handleGoogleSignIn}
                onBack={() => setStep("choice")}
                onSwitchToPhone={() => setAuthMethod("phone")}
                onForgotPassword={() => setShowForgotPassword(true)}
              />
            ) : (
              <PhoneLoginForm
                phoneNumber={loginPhone}
                onPhoneChange={(value) => handlePhoneChange(value, setLoginPhone)}
                formatPhoneDisplay={formatPhoneDisplay}
                onSubmit={handlePhoneLogin}
                onGoogleSignIn={handleGoogleSignIn}
              />
            )}
          </div>
        </div>
      )}

      {showForgotPassword && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPassword(false)}
          resetMethod={resetMethod}
          onMethodChange={setResetMethod}
          resetEmail={resetEmail}
          setResetEmail={setResetEmail}
          resetPhone={resetPhone}
          onPhoneChange={(value) => handlePhoneChange(value, setResetPhone)}
          formatPhoneDisplay={formatPhoneDisplay}
          onSubmit={handleForgotPassword}
        />
      )}
    </div>
  );
}
