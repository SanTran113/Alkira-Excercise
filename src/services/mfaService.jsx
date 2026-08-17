const OTP_TIME = 30_000;

function generateOTP() {
    return Math.floor(100000 + Math.random()*900000).toString();
}

export function sendOTP (username) {
    const code = generateOTP();
    const expiresAt = Date.now() +  OTP_TIME;

    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Sending OTP for ${username}: ${code}`);
            resolve({ code, expiresAt});
        }, 400)
    })
}

export function verifyOTP (inputCode, activeCode, expiresAt) {
    if (expiresAt < Date.now()) {
        return { success: false, error: "Code is expired. Please Try Again."}
    }

    if (inputCode !== activeCode) {
        return { success: false, error: "Incorrect code."}
    }

    return { success: true };
}