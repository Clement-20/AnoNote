/**
 * WebAuthn local biometric verification service (Face ID / Touch ID / Android Biometrics)
 * Secures access to the AnoNote application client-side without transmitting or storing sensitive biometric data.
 */

export async function isBiometricsSupported(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
  try {
    // Check if Face ID, Fingerprint, or platform authenticator is active on this device
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function enrollBiometrics(userId: string): Promise<boolean> {
  const isSupported = await isBiometricsSupported();
  if (!isSupported) {
    throw new Error("Local biometric authentication is not supported on this browser or platform.");
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const idBuffer = new TextEncoder().encode(userId);

  const options: CredentialCreationOptions = {
    publicKey: {
      challenge,
      rp: {
        name: "AnoNote Secure Messenger",
        id: window.location.hostname || "localhost",
      },
      user: {
        id: idBuffer,
        name: userId,
        displayName: userId,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 }, // ES256 (most common for biometric authenticators)
        { type: "public-key", alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Forces Touch ID, Face ID, Fingerprint
        userVerification: "required",
      },
      timeout: 60000,
    },
  };

  try {
    const credential = await navigator.credentials.create(options);
    if (credential) {
      localStorage.setItem(`anonote_biometric_enrolled_${userId}`, "true");
      localStorage.setItem("anonote_app_lock_enabled", "true");
      return true;
    }
    return false;
  } catch (err) {
    console.error("[Biometric Enrollment Failed]:", err);
    throw err;
  }
}

export async function authenticateBiometrics(): Promise<boolean> {
  const isSupported = await isBiometricsSupported();
  if (!isSupported) return false;

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const options: CredentialRequestOptions = {
    publicKey: {
      challenge,
      rpId: window.location.hostname || "localhost",
      userVerification: "required",
      timeout: 60000,
    },
  };

  try {
    const assertion = await navigator.credentials.get(options);
    return !!assertion;
  } catch (err) {
    console.error("[Biometric Verification Failed]:", err);
    return false;
  }
}

export function isBiometricsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("anonote_app_lock_enabled") === "true";
}

export function disableBiometrics(userId: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`anonote_biometric_enrolled_${userId}`);
  localStorage.removeItem("anonote_app_lock_enabled");
}
