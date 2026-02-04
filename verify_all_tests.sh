#!/bin/bash

# Master Verification Script
# eCy OS v1005.0

echo "🚀 Starting System Verification..."
echo "================================="

FAIL=0

# 1. Verify Tier A Utilities
echo "mj Testing Omni-Calculator..."
bash scripts/test_omni_calculator.sh
if [ $? -ne 0 ]; then ((FAIL++)); fi

echo "📝 Testing Diff Checker..."
bash scripts/test_diff_checker.sh
if [ $? -ne 0 ]; then ((FAIL++)); fi

echo "⏰ Testing Cron Builder..."
bash scripts/test_cron_builder.sh
if [ $? -ne 0 ]; then ((FAIL++)); fi

echo "🗄️ Testing SQL Formatter..."
bash scripts/test_sql_formatter.sh
if [ $? -ne 0 ]; then ((FAIL++)); fi

echo "🔐 Testing JWT Debugger..."
bash scripts/test_jwt_debugger.sh
if [ $? -ne 0 ]; then ((FAIL++)); fi

# 2. Verify TypeScript
echo "📘 Checking TypeScript..."
cd website
npx tsc --noEmit
if [ $? -ne 0 ]; then 
  echo "❌ TypeScript Errors Found"
  ((FAIL++))
else
  echo "✅ TypeScript: 0 Errors"
fi
cd ..

# Summary
echo "================================="
if [ $FAIL -eq 0 ]; then
  echo "🎉 ALL SYSTEMS GO! (100% PASS)"
  exit 0
else
  echo "❌ Verification Failed with $FAIL errors"
  exit 1
fi
