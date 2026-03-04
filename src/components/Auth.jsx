// src/components/Auth.jsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import "./Auth.css";
const API_BASE = import.meta.env.VITE_API_URL;
// ── Motion variants ──────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

// ── Reusable pieces ──────────────────────────────────────────

function Spinner() {
  return <span className="auth-spinner" />;
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="auth-error">
      <span className="auth-error-icon">⚠</span>
      <span>{message}</span>
    </div>
  );
}

function StepDots({ total, current }) {
  return (
    <div className="auth-steps">
      {Array.from({ length: total }).map((_, i) => {
        const state =
          i + 1 < current ? "done" : i + 1 === current ? "active" : "upcoming";
        return <div key={i} className={`auth-step-dot ${state}`} />;
      })}
    </div>
  );
}

function Field({ icon: Icon, children }) {
  return (
    <div className="auth-field">
      <Icon className="auth-field-icon" />
      {children}
    </div>
  );
}

// ── Sign In ──────────────────────────────────────────────────
function SignInForm({ onForgot, onLogin }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username);
        onLogin(data);
      } else {
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Cannot reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form {...fadeUp} className="auth-form" onSubmit={handleSubmit}>
      <ErrorBanner message={error} />

      <Field icon={EnvelopeIcon}>
        <input
          className="auth-input"
          type="text"
          placeholder="Email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          autoComplete="username"
        />
      </Field>

      <Field icon={LockClosedIcon}>
        <input
          className="auth-input has-right"
          type={showPw ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button
          type="button"
          className="auth-eye-btn"
          onClick={() => setShowPw(!showPw)}
          tabIndex={-1}
        >
          {showPw ? (
            <EyeSlashIcon style={{ width: 17, height: 17 }} />
          ) : (
            <EyeIcon style={{ width: 17, height: 17 }} />
          )}
        </button>
      </Field>

      <div className="auth-forgot">
        <button type="button" className="auth-forgot-btn" onClick={onForgot}>
          Forgot password?
        </button>
      </div>
      <button type="submit" className="auth-btn-primary" disabled={loading}>
        {loading ? (
          <>
            <Spinner /> Signing in…
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </motion.form>
  );
}

// ── Request OTP ──────────────────────────────────────────────
function RequestOTP({ onNext }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Verification code sent!");
        onNext(email);
      } else {
        setError(data.error || "Failed to send code. Please try again.");
      }
    } catch {
      setError("Cannot reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form {...fadeUp} className="auth-form" onSubmit={handleSubmit}>
      <StepDots total={3} current={1} />
      <p className="auth-hint">
        We'll send a 6-digit code to verify your email.
      </p>
      <ErrorBanner message={error} />

      <Field icon={EnvelopeIcon}>
        <input
          className="auth-input"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </Field>

      <button type="submit" className="auth-btn-primary" disabled={loading}>
        {loading ? (
          <>
            <Spinner /> Sending…
          </>
        ) : (
          "Send Code"
        )}
      </button>
    </motion.form>
  );
}

// ── Verify OTP ───────────────────────────────────────────────
function VerifyOTP({ email, onNext, onBack }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        onNext(data.tempToken);
      } else {
        setError(data.error || "Invalid code. Please try again.");
        setOtp("");
      }
    } catch {
      setError("Cannot reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("New code sent!");
        setCooldown(60);
      } else {
        const data = await res.json();
        toast.error(data.error || "Could not resend. Try again.");
      }
    } catch {
      toast.error("Cannot reach the server.");
    }
  };

  return (
    <motion.form {...fadeUp} className="auth-form" onSubmit={handleSubmit}>
      <StepDots total={3} current={2} />
      <p className="auth-hint">
        Code sent to <em>{email}</em>
      </p>
      <ErrorBanner message={error} />

      <input
        className="auth-otp-input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="••••••"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
        maxLength={6}
        required
      />

      <button
        type="submit"
        className="auth-btn-primary"
        disabled={loading || otp.length < 6}
      >
        {loading ? (
          <>
            <Spinner /> Verifying…
          </>
        ) : (
          "Verify Code"
        )}
      </button>

      <div className="auth-otp-actions">
        <button type="button" className="auth-link muted" onClick={onBack}>
          <ArrowLeftIcon style={{ width: 13, height: 13 }} /> Back
        </button>
        <button
          type="button"
          className="auth-link blue"
          onClick={handleResend}
          disabled={cooldown > 0}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </motion.form>
  );
}

// ── Setup Profile ────────────────────────────────────────────
function SetupProfile({ tempToken, email, onComplete, onBack }) {
  const [username, setUsername] = useState(email.split("@")[0]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (username.length < 3) {
      setError("Name must be atleast 3 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!terms) {
      setError("You must accept the Terms & Privacy Policy.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/auth/complete-signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tempToken,
            username,
            password,
            termsAccepted: true,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Welcome to Chit Chat! 🎉");
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username);
        onComplete(data);
      } else {
        setError(data.error || "Could not create account. Please try again.");
      }
    } catch {
      setError("Cannot reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const pwMatch = confirm.length > 0;

  return (
    <motion.form {...fadeUp} className="auth-form" onSubmit={handleSubmit}>
      <StepDots total={3} current={3} />
      <p className="auth-hint">Almost there — set up your profile.</p>
      <ErrorBanner message={error} />

      <Field icon={UserIcon}>
        <input
          className="auth-input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
      </Field>

      <Field icon={LockClosedIcon}>
        <input
          className="auth-input has-right"
          type={showPw ? "text" : "password"}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          autoComplete="new-password"
        />
        <button
          type="button"
          className="auth-eye-btn"
          onClick={() => setShowPw(!showPw)}
          tabIndex={-1}
        >
          {showPw ? (
            <EyeSlashIcon style={{ width: 17, height: 17 }} />
          ) : (
            <EyeIcon style={{ width: 17, height: 17 }} />
          )}
        </button>
      </Field>

      <Field icon={ShieldCheckIcon}>
        <input
          className="auth-input"
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />
      </Field>
      {pwMatch && (
        <p
          className={`auth-match-hint ${
            password === confirm ? "match" : "no-match"
          }`}
        >
          {password === confirm
            ? "✓ Passwords match"
            : "✗ Passwords do not match"}
        </p>
      )}

      <label className="auth-terms">
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
        />
        <span className="auth-terms-text">
          I agree to the{" "}
          <a
            href="../../public/terms.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="../../public/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
        </span>
      </label>

      <button type="submit" className="auth-btn-primary" disabled={loading}>
        {loading ? (
          <>
            <Spinner /> Creating account…
          </>
        ) : (
          "Create Account"
        )}
      </button>

      <button type="button" className="auth-btn-ghost" onClick={onBack}>
        <ArrowLeftIcon style={{ width: 14, height: 14 }} /> Back
      </button>
    </motion.form>
  );
}

// ── Forgot Password Flow ─────────────────────────────────────
function ForgotPasswordFlow({ onBack }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  const RequestStep = () => {
    const [val, setVal] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/auth/forgot-password`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: val }),
          }
        );
        const data = await res.json();
        if (res.ok) {
          toast.success("Reset code sent!");
          setEmail(val);
          setStep(2);
        } else {
          setError(data.error || "Could not send reset code. Try again.");
        }
      } catch {
        setError(
          "Cannot reach the server. Check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    return (
      <motion.form {...fadeUp} className="auth-form" onSubmit={handleSubmit}>
        <StepDots total={3} current={1} />
        <p className="auth-hint">
          Enter your email and we'll send a reset code.
        </p>
        <ErrorBanner message={error} />
        <Field icon={EnvelopeIcon}>
          <input
            className="auth-input"
            type="email"
            placeholder="your@email.com"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            required
            autoComplete="email"
          />
        </Field>
        <button type="submit" className="auth-btn-primary" disabled={loading}>
          {loading ? (
            <>
              <Spinner /> Sending…
            </>
          ) : (
            "Send Reset Code"
          )}
        </button>
        <button type="button" className="auth-btn-ghost" onClick={onBack}>
          <ArrowLeftIcon style={{ width: 14, height: 14 }} /> Back to Sign In
        </button>
      </motion.form>
    );
  };

  const VerifyStep = () => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/auth/verify-reset-otp`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
          }
        );
        const data = await res.json();
        if (res.ok) {
          setResetToken(data.resetToken);
          setStep(3);
        } else {
          setError(data.error || "Invalid code. Please try again.");
          setOtp("");
        }
      } catch {
        setError(
          "Cannot reach the server. Check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    return (
      <motion.form {...fadeUp} className="auth-form" onSubmit={handleSubmit}>
        <StepDots total={3} current={2} />
        <p className="auth-hint">
          Code sent to <em>{email}</em>
        </p>
        <ErrorBanner message={error} />
        <input
          className="auth-otp-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="••••••"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          maxLength={6}
          required
        />
        <button
          type="submit"
          className="auth-btn-primary"
          disabled={loading || otp.length < 6}
        >
          {loading ? (
            <>
              <Spinner /> Verifying…
            </>
          ) : (
            "Verify Code"
          )}
        </button>
        <button
          type="button"
          className="auth-btn-ghost"
          onClick={() => setStep(1)}
        >
          <ArrowLeftIcon style={{ width: 14, height: 14 }} /> Back
        </button>
      </motion.form>
    );
  };

  const ResetStep = () => {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/auth/reset-password`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resetToken, newPassword: password }),
          }
        );
        const data = await res.json();
        if (res.ok) {
          toast.success("Password updated! Please sign in.");
          onBack();
        } else {
          setError(data.error || "Could not update password. Try again.");
        }
      } catch {
        setError(
          "Cannot reach the server. Check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    const pwMatch = confirm.length > 0;

    return (
      <motion.form {...fadeUp} className="auth-form" onSubmit={handleSubmit}>
        <StepDots total={3} current={3} />
        <p className="auth-hint">Choose a strong new password.</p>
        <ErrorBanner message={error} />
        <Field icon={LockClosedIcon}>
          <input
            className="auth-input has-right"
            type={showPw ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            className="auth-eye-btn"
            onClick={() => setShowPw(!showPw)}
            tabIndex={-1}
          >
            {showPw ? (
              <EyeSlashIcon style={{ width: 17, height: 17 }} />
            ) : (
              <EyeIcon style={{ width: 17, height: 17 }} />
            )}
          </button>
        </Field>
        <Field icon={ShieldCheckIcon}>
          <input
            className="auth-input"
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </Field>
        {pwMatch && (
          <p
            className={`auth-match-hint ${
              password === confirm ? "match" : "no-match"
            }`}
          >
            {/* </motion.form> */}
            {password === confirm
              ? "✓ Passwords match"
              : "✗ Passwords do not match"}
          </p>
        )}
        <button type="submit" className="auth-btn-primary" disabled={loading}>
          {loading ? (
            <>
              <Spinner /> Updating…
            </>
          ) : (
            "Update Password"
          )}
        </button>
      </motion.form>
    );
  };

  return (
    <>
      <div className="auth-section-header">
        <p className="auth-section-title">
          <KeyIcon style={{ width: 17, height: 17, color: "#60a5fa" }} />
          Reset Password
        </p>
        <p className="auth-section-desc">We'll help you get back in.</p>
      </div>
      <AnimatePresence mode="wait">
        {step === 1 && <RequestStep key="fp1" />}
        {step === 2 && <VerifyStep key="fp2" />}
        {step === 3 && <ResetStep key="fp3" />}
      </AnimatePresence>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN AUTH
// ══════════════════════════════════════════════════════════════
function Auth({ onLogin }) {
  const [mode, setMode] = useState("signin");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [tempToken, setTempToken] = useState("");

  const switchMode = (newMode) => {
    setMode(newMode);
    setStep(1);
    setEmail("");
    setTempToken("");
  };

  return (
    <div className="auth-root">
      <div className="auth-grid" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <motion.div
        className="auth-card-wrap"
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="auth-card">
          {/* Brand */}
          {/* <div className="auth-brand">
            <div className="auth-logo">💬</div>
            <h1 className="auth-title">Chit Chat</h1>
            <p className="auth-subtitle">Real conversations, real connections</p>
          </div> */}
          <div className="auth-brand">
            <div className="auth-logo">
              <img src="/icon.jpg"></img>
            </div>
            <h1 className="auth-title">Chit Chat</h1>
            <p className="auth-subtitle">
              Real conversations, real connections
            </p>
          </div>
          {/* Tab toggle */}
          {mode !== "forgot" && (
            <div className="auth-toggle">
              {["signin", "signup"].map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`auth-toggle-btn ${mode === m ? "active" : ""}`}
                  onClick={() => switchMode(m)}
                >
                  {m === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <AnimatePresence mode="wait">
            {mode === "signin" && (
              <SignInForm
                key="signin"
                onForgot={() => switchMode("forgot")}
                onLogin={onLogin}
              />
            )}

            {mode === "signup" && (
              <div key="signup">
                {step === 1 && (
                  <RequestOTP
                    onNext={(e) => {
                      setEmail(e);
                      setStep(2);
                    }}
                  />
                )}
                {step === 2 && (
                  <VerifyOTP
                    email={email}
                    onNext={(t) => {
                      setTempToken(t);
                      setStep(3);
                    }}
                    onBack={() => setStep(1)}
                  />
                )}
                {step === 3 && (
                  <SetupProfile
                    tempToken={tempToken}
                    email={email}
                    onComplete={onLogin}
                    onBack={() => setStep(2)}
                  />
                )}
              </div>
            )}

            {mode === "forgot" && (
              <ForgotPasswordFlow
                key="forgot"
                onBack={() => switchMode("signin")}
              />
            )}
          </AnimatePresence>
        </div>

        <p className="auth-footer">
          Chit Chat © {new Date().getFullYear()} · Made with ❤️
        </p>
      </motion.div>
    </div>
  );
}

export default Auth;
