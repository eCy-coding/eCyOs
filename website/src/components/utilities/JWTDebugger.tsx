/**
 * JWT Debugger Utility
 * eCy OS v1005.0 - Tier A Utility 5/5
 * 
 * Features:
 * - Decode JWT header, payload, signature
 * - Verify token expiration
 * - Display all claims (iat, exp, nbf, aud, iss, sub)
 * - Highlight expired tokens
 * - Copy decoded JSON
 * - Cyberpunk aesthetic
 */

import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import styles from './JWTDebugger.module.css';

interface JWTHeader {
  alg?: string;
  typ?: string;
  kid?: string;
  [key: string]: any;
}

interface JWTPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: any;
}

interface DecodedToken {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
  isExpired: boolean;
  expiresAt?: Date;
  issuedAt?: Date;
}

export const JWTDebugger: React.FC = () => {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<DecodedToken | null>(null);
  const [error, setError] = useState('');

  const decodeToken = () => {
    setError('');
    setDecoded(null);

    if (!token.trim()) {
      setError('Please enter a JWT token');
      return;
    }

    try {
      // Split token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. Expected 3 parts separated by dots.');
      }

      // Decode header and payload
      const header = jwtDecode<JWTHeader>(token, { header: true });
      const payload = jwtDecode<JWTPayload>(token);
      const signature = parts[2];

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp ? payload.exp < now : false;

      setDecoded({
        header,
        payload,
        signature,
        isExpired,
        expiresAt: payload.exp ? new Date(payload.exp * 1000) : undefined,
        issuedAt: payload.iat ? new Date(payload.iat * 1000) : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JWT token');
    }
  };

  const handleCopy = async (data: any, label: string) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      alert(`✅ ${label} copied to clipboard!`);
    } catch (error) {
      alert('❌ Failed to copy');
    }
  };

  const handleClear = () => {
    setToken('');
    setDecoded(null);
    setError('');
  };

  const getExpiryStatus = (): 'valid' | 'expired' | 'no-exp' => {
    if (!decoded?.payload.exp) return 'no-exp';
    return decoded.isExpired ? 'expired' : 'valid';
  };

  const formatDate = (date?: Date): string => {
    if (!date) return 'N/A';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>🔐</span>
          JWT Debugger
        </h2>
        <p className={styles.subtitle}>Decode & verify JSON Web Tokens</p>
      </div>

      {/* Input Section */}
      <div className={styles.inputSection}>
        <label className={styles.label}>JWT Token</label>
        <textarea
          className={styles.textarea}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT token here (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
          rows={5}
          spellCheck={false}
        />
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button onClick={decodeToken} className={`${styles.button} ${styles.primary}`}>
          🔍 Decode JWT
        </button>
        <button onClick={handleClear} className={`${styles.button} ${styles.secondary}`}>
          🗑️ Clear
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      )}

      {/* Decoded Output */}
      {decoded && (
        <div className={styles.results}>
          {/* Status Banner */}
          <div className={`${styles.statusBanner} ${styles[getExpiryStatus()]}`}>
            <span className={styles.statusIcon}>
              {getExpiryStatus() === 'expired' ? '❌' : getExpiryStatus() === 'valid' ? '✅' : 'ℹ️'}
            </span>
            <span className={styles.statusText}>
              {getExpiryStatus() === 'expired'
                ? 'Token Expired'
                : getExpiryStatus() === 'valid'
                ? 'Token Valid'
                : 'No Expiration'}
            </span>
            {decoded.expiresAt && (
              <span className={styles.statusDetail}>
                {getExpiryStatus() === 'expired' ? 'Expired' : 'Expires'}: {formatDate(decoded.expiresAt)}
              </span>
            )}
          </div>

          {/* Header Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>📋 Header</h3>
              <button onClick={() => handleCopy(decoded.header, 'Header')} className={styles.copyButton}>
                📋 Copy
              </button>
            </div>
            <pre className={styles.json}>{JSON.stringify(decoded.header, null, 2)}</pre>
          </div>

          {/* Payload Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>📦 Payload</h3>
              <button onClick={() => handleCopy(decoded.payload, 'Payload')} className={styles.copyButton}>
                📋 Copy
              </button>
            </div>
            <pre className={styles.json}>{JSON.stringify(decoded.payload, null, 2)}</pre>

            {/* Claims Detail */}
            <div className={styles.claims}>
              <h4 className={styles.claimsTitle}>Standard Claims</h4>
              <div className={styles.claimsList}>
                {decoded.payload.iss && (
                  <div className={styles.claim}>
                    <span className={styles.claimKey}>iss (Issuer):</span>
                    <span className={styles.claimValue}>{decoded.payload.iss}</span>
                  </div>
                )}
                {decoded.payload.sub && (
                  <div className={styles.claim}>
                    <span className={styles.claimKey}>sub (Subject):</span>
                    <span className={styles.claimValue}>{decoded.payload.sub}</span>
                  </div>
                )}
                {decoded.payload.aud && (
                  <div className={styles.claim}>
                    <span className={styles.claimKey}>aud (Audience):</span>
                    <span className={styles.claimValue}>{JSON.stringify(decoded.payload.aud)}</span>
                  </div>
                )}
                {decoded.issuedAt && (
                  <div className={styles.claim}>
                    <span className={styles.claimKey}>iat (Issued At):</span>
                    <span className={styles.claimValue}>{formatDate(decoded.issuedAt)}</span>
                  </div>
                )}
                {decoded.expiresAt && (
                  <div className={styles.claim}>
                    <span className={styles.claimKey}>exp (Expires At):</span>
                    <span className={styles.claimValue}>{formatDate(decoded.expiresAt)}</span>
                  </div>
                )}
                {decoded.payload.nbf && (
                  <div className={styles.claim}>
                    <span className={styles.claimKey}>nbf (Not Before):</span>
                    <span className={styles.claimValue}>{formatDate(new Date(decoded.payload.nbf * 1000))}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>🔏 Signature</h3>
              <button onClick={() => handleCopy(decoded.signature, 'Signature')} className={styles.copyButton}>
                📋 Copy
              </button>
            </div>
            <pre className={styles.signature}>{decoded.signature}</pre>
            <p className={styles.signatureNote}>
              ℹ️ Signature verification requires the secret key or public key (not implemented in browser)
            </p>
          </div>
        </div>
      )}

      {/* Sample Tokens */}
      <div className={styles.samples}>
        <h3 className={styles.samplesTitle}>Sample Tokens</h3>
        <div className={styles.sampleButtons}>
          <button
            className={styles.sampleButton}
            onClick={() =>
              setToken(
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
              )
            }
          >
            Valid Token (No Exp)
          </button>
          <button
            className={styles.sampleButton}
            onClick={() =>
              setToken(
                `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiaXNzIjoiZUN5IE9TIiwiYXVkIjoiYXBpLmVjeS5kZXYiLCJleHAiOjE3MDcwNDgwMDAsImlhdCI6MTcwNzA0NDQwMCwibmJmIjoxNzA3MDQ0NDAwfQ.signature-here`
              )
            }
          >
            Expired Token
          </button>
        </div>
      </div>
    </div>
  );
};

export default JWTDebugger;
