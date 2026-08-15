import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx";

function MfaPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(null);
  const [error, setError] = useState("");
  const {requestMfaCode, verifyMfaCode, cancelMfa} = useAuth();

  const handleSendCode = async () => {
    setError("");
    const sendResult = await requestMfaCode();
    setCode(sendResult);
  };

  const handleVerifyMfaCode = (code) => {
    if (!code) {
      setError("Please enter the code.");
      return;
    }

    const verifyResult = verifyMfaCode(code);
    if (!verifyResult) {
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
      <div>
        <h1>MFA Page</h1>
        {code && (
            <div>
                Code: <p id="code">code</p>
            </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerifyMfaCode(e.target.otpCode.value);
          }}
        >
          <label>Input Code:</label>
          <input
            type="text"
            id="otpCode"
            name="otpCode"
            inputMode="numeric"
            maxLength={6}
            required
          />
          {error && <p class="error-text">{error}</p>}
          <button type="submit">Verify</button>
        </form>
        <button onClick={handleSendCode}>Resend Code</button>
        <button onClick={handleCancelMfa}>Cancel`</button>
      </div>
    </>
  );
}

export default MfaPage;
