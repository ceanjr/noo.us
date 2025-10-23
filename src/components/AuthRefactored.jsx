import { useState } from 'react';
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Dashboard from './DashboardNew';
import Toast, { showToast } from './Toast';
import Modal from './Modal';

// Custom Hooks
import { useAuthState } from '../hooks/useAuthState';
import { usePhoneAuth } from '../hooks/usePhoneAuth';

// Services
import { emailSignup, emailLogin, phoneSignup, phoneLogin, googleSignIn, sendPasswordReset } from '../services/authService';
import { validateBrazilPhone, validatePassword, validateEmail, validateName } from '../services/validationService';

// Utils
import { formatPhoneDisplay, cleanPhone } from '../utils/formatters';

// UI Components
import AuthChoice from './auth/AuthChoice';
import EmailSignupForm from './auth/EmailSignupForm';
import PhoneSignupForm from './auth/PhoneSignupForm';
import EmailLoginForm from './auth/EmailLoginForm';
import PhoneLoginForm from './auth/PhoneLoginForm';
import PhoneVerification from './auth/PhoneVerification';
import ForgotPasswordModal from './auth/ForgotPasswordModal';

/**
 * Auth - Componente principal de autenticação
 * Gerencia todo o fluxo de login/signup (email, telefone, Google)
 */
export default function Auth() {
  // Auth state (via custom hook)
  const { user, profile, loading, setProfile } = useAuthState();

  // Phone auth (via custom hook)
  const {
    showVerificationStep,
    verificationCode,
    setVerificationCode,
    sendVerification,
    verifyCode,
    cancelVerification,
  } = usePhoneAuth();

  // Navigation state
  const [step, setStep] = useState('choice'); // 'choice' | 'signup' | 'login'
  const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'phone'

  // Form state - Signup
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relationshipStart, setRelationshipStart] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Password reset
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetMethod, setResetMethod] = useState('email');

  // Validation errors
  const [passwordError, setPasswordError] = useState('');

  // Modal
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  // ==================== HANDLERS ====================

  /**
   * Handler: Email Signup
   */
  const handleEmailSignup = async (e) => {
    e.preventDefault();

    // Validações
    const nameError = validateName(name);
    if (nameError) {
      showToast(nameError, 'error');
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      showToast(emailError, 'error');
      return;
    }

    const passwordValidation = validatePassword(password, confirmPassword);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      showToast(passwordValidation, 'error');
      return;
    }

    if (!relationshipStart) {
      showToast('Selecione a data de início do relacionamento', 'error');
      return;
    }

    try {
      await emailSignup({ email, password, name, relationshipStart });
      // Auth state listener will update automatically
    } catch (error) {
      console.error('Erro no signup:', error);
      showToast(error.message || 'Erro ao criar conta', 'error');
    }
  };

  /**
   * Handler: Phone Signup
   */
  const handlePhoneSignup = async (e) => {
    e.preventDefault();

    // Validações
    const nameError = validateName(name);
    if (nameError) {
      showToast(nameError, 'error');
      return;
    }

    const phoneError = validateBrazilPhone(phoneNumber);
    if (phoneError) {
      showToast(phoneError, 'error');
      return;
    }

    const passwordValidation = validatePassword(password, confirmPassword);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      showToast(passwordValidation, 'error');
      return;
    }

    if (!relationshipStart) {
      showToast('Selecione a data de início do relacionamento', 'error');
      return;
    }

    try {
      // Enviar código SMS
      const success = await sendVerification(cleanPhone(phoneNumber));
      if (!success) {
        showToast('Erro ao enviar código de verificação', 'error');
      }
    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      showToast(error.message || 'Erro ao enviar código', 'error');
    }
  };

  /**
   * Handler: Verificar código SMS (Signup)
   */
  const handleVerifySignupCode = async () => {
    if (verificationCode.length !== 6) {
      showToast('Digite o código de 6 dígitos', 'error');
      return;
    }

    try {
      const firebaseUser = await verifyCode();
      if (!firebaseUser) {
        showToast('Código inválido', 'error');
        return;
      }

      // Criar perfil no Firestore
      await phoneSignup({
        userId: firebaseUser.uid,
        name,
        phoneNumber: cleanPhone(phoneNumber),
        password,
        relationshipStart,
      });

      // Auth state listener will update automatically
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      showToast(error.message || 'Erro ao verificar código', 'error');
    }
  };

  /**
   * Handler: Email Login
   */
  const handleEmailLogin = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(loginEmail);
    if (emailError) {
      showToast(emailError, 'error');
      return;
    }

    if (!loginPassword) {
      showToast('Digite sua senha', 'error');
      return;
    }

    try {
      // Set persistence
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);

      await emailLogin(loginEmail, loginPassword);
      // Auth state listener will update automatically
    } catch (error) {
      console.error('Erro no login:', error);
      showToast(error.message || 'Email ou senha incorretos', 'error');
    }
  };

  /**
   * Handler: Phone Login
   */
  const handlePhoneLogin = async (e) => {
    e.preventDefault();

    const phoneError = validateBrazilPhone(loginPhone);
    if (phoneError) {
      showToast(phoneError, 'error');
      return;
    }

    if (!loginPassword) {
      showToast('Digite sua senha', 'error');
      return;
    }

    try {
      // Set persistence
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);

      await phoneLogin(cleanPhone(loginPhone), loginPassword);
      // Auth state listener will update automatically
    } catch (error) {
      console.error('Erro no login:', error);
      showToast(error.message || 'Telefone ou senha incorretos', 'error');
    }
  };

  /**
   * Handler: Google Sign In
   */
  const handleGoogleSignIn = async () => {
    try {
      const isSignup = step === 'signup';
      await googleSignIn(isSignup);
      // Auth state listener will update automatically
    } catch (error) {
      console.error('Erro no Google Sign In:', error);
      // Error already handled in googleSignIn service
    }
  };

  /**
   * Handler: Forgot Password
   */
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (resetMethod === 'email') {
      const emailError = validateEmail(resetEmail);
      if (emailError) {
        showToast(emailError, 'error');
        return;
      }

      try {
        await sendPasswordReset(resetEmail);
        showToast('Email de recuperação enviado! 📧', 'success');
        setShowForgotPassword(false);
        setResetEmail('');
      } catch (error) {
        console.error('Erro ao enviar email:', error);
        showToast(error.message || 'Erro ao enviar email de recuperação', 'error');
      }
    } else {
      // Phone recovery
      const phoneError = validateBrazilPhone(resetPhone);
      if (phoneError) {
        showToast(phoneError, 'error');
        return;
      }

      showToast(
        'Para recuperar senha via telefone, entre em contato com suporte@noo.us informando seu número',
        'info'
      );
      setShowForgotPassword(false);
      setResetPhone('');
    }
  };

  /**
   * Handler: Phone number change (formatting)
   */
  const handlePhoneChange = (value, setter) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      setter(cleaned);
    }
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (user && profile) {
    return <Dashboard user={user} profile={profile} setProfile={setProfile} />;
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

      {/* Initial Choice Screen */}
      {step === 'choice' && (
        <AuthChoice
          onSignupClick={() => setStep('signup')}
          onLoginClick={() => setStep('login')}
        />
      )}

      {/* Signup Flow */}
      {step === 'signup' && !showVerificationStep && (
        <>
          {authMethod === 'email' ? (
            <EmailSignupForm
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              relationshipStart={relationshipStart}
              setRelationshipStart={setRelationshipStart}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              passwordError={passwordError}
              onSubmit={handleEmailSignup}
              onGoogleSignIn={handleGoogleSignIn}
              onBack={() => setStep('choice')}
              onSwitchToPhone={() => setAuthMethod('phone')}
            />
          ) : (
            <PhoneSignupForm
              name={name}
              setName={setName}
              phoneNumber={phoneNumber}
              onPhoneChange={(value) => handlePhoneChange(value, setPhoneNumber)}
              formatPhoneDisplay={formatPhoneDisplay}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              relationshipStart={relationshipStart}
              setRelationshipStart={setRelationshipStart}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              passwordError={passwordError}
              onSubmit={handlePhoneSignup}
              onGoogleSignIn={handleGoogleSignIn}
              onBack={() => setStep('choice')}
              onSwitchToEmail={() => setAuthMethod('email')}
            />
          )}
        </>
      )}

      {/* Phone Verification (Signup) */}
      {step === 'signup' && showVerificationStep && (
        <PhoneVerification
          verificationCode={verificationCode}
          setVerificationCode={setVerificationCode}
          onVerify={handleVerifySignupCode}
          onCancel={cancelVerification}
          phoneNumber={formatPhoneDisplay(phoneNumber)}
        />
      )}

      {/* Login Flow */}
      {step === 'login' && (
        <>
          {authMethod === 'email' ? (
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
              onBack={() => setStep('choice')}
              onSwitchToPhone={() => setAuthMethod('phone')}
              onForgotPassword={() => setShowForgotPassword(true)}
            />
          ) : (
            <PhoneLoginForm
              phoneNumber={loginPhone}
              onPhoneChange={(value) => handlePhoneChange(value, setLoginPhone)}
              formatPhoneDisplay={formatPhoneDisplay}
              password={loginPassword}
              setPassword={setLoginPassword}
              showPassword={showLoginPassword}
              setShowPassword={setShowLoginPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              onSubmit={handlePhoneLogin}
              onGoogleSignIn={handleGoogleSignIn}
              onBack={() => setStep('choice')}
              onSwitchToEmail={() => setAuthMethod('email')}
              onForgotPassword={() => setShowForgotPassword(true)}
            />
          )}
        </>
      )}

      {/* Forgot Password Modal */}
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
