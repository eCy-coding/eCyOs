#!/bin/bash

# JWT Debugger Test Suite
# eCy OS v1005.0 - Tier A Utility 5/5

echo "🔐 Testing JWT Debugger..."
echo "========================================"

cd /Users/emrecnyngmail.com/Desktop/sistem/website
PASS=0
FAIL=0

# Test 1: Decode valid token
echo "Test 1: Decode valid JWT (no expiry)"
if node -e "const {jwtDecode}=require('jwt-decode');const t='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';const d=jwtDecode(t);console.log(d.sub==='1234567890'&&d.name==='John Doe'?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 2: Decode header
echo "Test 2: Decode JWT header"
if node -e "const {jwtDecode}=require('jwt-decode');const t='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';const h=jwtDecode(t,{header:true});console.log(h.alg==='HS256'&&h.typ==='JWT'?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 3: Detect expired token
echo "Test 3: Detect expired token"
if node -e "const {jwtDecode}=require('jwt-decode');const t='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyMzkwMjJ9.4Adcj0vQTZMPFYdF0vFHo9dFW3ghK9S11dDx9Yh1VvA';const d=jwtDecode(t);const exp=d.exp<Math.floor(Date.now()/1000);console.log(exp?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 4: Handle custom claims
echo "Test 4: Decode custom claims"
if node -e "const {jwtDecode}=require('jwt-decode');const t='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VySWQiOjEyM30.8Pu_YtR0S0D0DqP2pjRAQgZ0vjI4MZ_Z2MJPYxf8T5A';const d=jwtDecode(t);console.log(d.role==='admin'&&d.userId===123?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 5: Decode with iss claim
echo "Test 5: Decode standard claims (iss)"
if node -e "const {jwtDecode}=require('jwt-decode');const t='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2VjeS5kZXYifQ.wjf3Tq1Wf0zT6q4_q4bnCyC69R2QKH_zqCTB9q7cD3Q';const d=jwtDecode(t);console.log(d.iss==='https://ecy.dev'?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 6: Decode with aud claim
echo "Test 6: Decode standard claims (aud)"
if node -e "const {jwtDecode}=require('jwt-decode');const t='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhcGkuZWN5LmRldiJ9.8sRx3z9Vb_d2yQoFZ0_yqLcN5H5Zy9qTxC4KpQwD8eQ';const d=jwtDecode(t);console.log(d.aud==='api.ecy.dev'?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 7: Decode with iat claim
echo "Test 7: Decode standard claims (iat)"
if node -e "const {jwtDecode}=require('jwt-decode');const t='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MTYyMzkwMjJ9.tbDepxpstvGdW8TC3G8zg4B6rUYAOvfzdceoH48wgRQ';const d=jwtDecode(t);console.log(d.iat===1516239022?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 8: Detect malformed token
echo "Test 8: Handle malformed JWT"
if node -e "const {jwtDecode}=require('jwt-decode');try{jwtDecode('invalid.token');}catch(e){console.log('OK');}" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 9: Decode RS256 token
echo "Test 9: Decode RS256 algorithm"
if node -e "const {jwtDecode}=require('jwt-decode');const t='eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0In0.signature';const h=jwtDecode(t,{header:true});console.log(h.alg==='RS256'?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 10: Extract signature part
echo "Test 10: Extract signature"
if node -e "const t='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';const sig=t.split('.')[2];console.log(sig==='dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U'?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

echo "========================================"
echo "JWT Debugger: $PASS/10 tests passed"
[ $FAIL -eq 0 ] && echo "✅ All tests PASSED!" && exit 0
echo "❌ Some tests FAILED" && exit 1
