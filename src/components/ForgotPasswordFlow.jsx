import { useState } from 'react';
import ForgotPasswordRequest from './ForgotPasswordRequest';
import ForgotPasswordVerify from './ForgotPasswordVerify';
import ForgotPasswordReset from './ForgotPasswordReset';

function ForgotPasswordFlow({ onBackToLogin }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  return (
    <div>
      {step === 1 && (
        <ForgotPasswordRequest onNext={(email) => { setEmail(email); setStep(2); }} />
      )}
      {step === 2 && (
        <ForgotPasswordVerify
          email={email}
          onNext={(token) => { setResetToken(token); setStep(3); }}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <ForgotPasswordReset
          resetToken={resetToken}
          onComplete={onBackToLogin}
        />
      )}
    </div>
  );
}
export default ForgotPasswordFlow;