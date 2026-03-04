import { useState } from 'react';
import RequestOTP from './RequestOTP';
import VerifyOTP from './VerifyOTP';
import SetupProfile from './SetupProfile';

function SignupFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [tempToken, setTempToken] = useState('');

  const handleRequestOTP = (email) => {
    setEmail(email);
    setStep(2);
  };

  const handleVerifyOTP = (token) => {
    setTempToken(token);
    setStep(3);
  };

  const handleComplete = (userData) => {
    onComplete(userData); // pass to Auth to set user
  };

  return (
    <div>
      {step === 1 && <RequestOTP onNext={handleRequestOTP} />}
      {step === 2 && <VerifyOTP email={email} onNext={handleVerifyOTP} onBack={() => setStep(1)} />}
      {step === 3 && <SetupProfile tempToken={tempToken} email={email} onComplete={handleComplete} onBack={() => setStep(2)} />}
    </div>
  );
}
export default SignupFlow;