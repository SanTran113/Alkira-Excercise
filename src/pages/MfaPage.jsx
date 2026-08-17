import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx";

function MfaPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(null);
  const [error, setError] = useState("");
  const { user, pendingUser, requestMfaCode, verifyMfaCode, cancelMfa } =
    useAuth();
  const hasSentCode = useRef(false);

  useEffect(() => {
    if (!pendingUser && !user) {
      cancelMfa();
      navigate("/");
    }
  }, [user, pendingUser, navigate, cancelMfa]);

  useEffect(() => {
    if (pendingUser && !hasSentCode.current) {
      hasSentCode.current = true;
      handleSendCode();
    }
  });

  const handleSendCode = async () => {
    setError("");
    const sendResult = await requestMfaCode();

    setCode(sendResult.code);
  };

  const handleVerifyMfaCode = (code) => {
    if (!code) {
      setError("Please enter the code.");
      return;
    }

    const verifyResult = verifyMfaCode(code);
    if (!verifyResult.success) {
      setError(verifyResult.error);
      return;
    }
    navigate("/main");
  };

  const handleCancelMfa = () => {
    cancelMfa();
    navigate("/");
  };

  return (
    <>
      <div className="form-container">
        <h1>Multi-Factor Authentication</h1>
        <div className="code">
          <label>Code:</label>
          {code && <p id="code">{code}</p>}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleVerifyMfaCode(formData.get("otpCode"));
          }}
        >
          <label htmlFor="otpCode">Input Code</label>
          <input
            id="otpCode"
            name="otpCode"
            inputMode="numeric"
            maxLength={6}
            required
            type="text"
          />
          {error && <p id="error-text">{error}</p>}
          <button type="submit">Verify</button>
          <button
            className="secondary-button"
            type="submit"
            onClick={handleSendCode}
          >
            Resend Code
          </button>
          <div className="footer">
            or
            <a type="button" onClick={handleCancelMfa}>
              cancel
            </a>
          </div>
        </form>
      </div>
    </>
  );
}

export default MfaPage;
