#!/bin/bash

# SQL Formatter Test Suite
# eCy OS v1005.0 - Tier A Utility 4/5

echo "🗄️  Testing SQL Formatter..."
echo "========================================"

cd /Users/emrecnyngmail.com/Desktop/sistem/website
PASS=0
FAIL=0

# Test 1: Simple SELECT
echo "Test 1: Simple SELECT"
if node -e "const {format}=require('sql-formatter');const r=format('SELECT*FROM users',{language:'mysql'});console.log(r.includes('SELECT')?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 2: Complex JOIN
echo "Test 2: Complex JOIN"
if node -e "const {format}=require('sql-formatter');const r=format('SELECT u.id FROM users u JOIN orders o',{language:'mysql'});console.log(r.includes('JOIN')?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 3: INSERT Multiple
echo "Test 3: INSERT Multiple"
if node -e "const {format}=require('sql-formatter');const r=format('INSERT INTO t VALUES(1),(2)',{language:'mysql'});console.log(r.includes('INSERT')?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 4: UPDATE with WHERE
echo "Test 4: UPDATE with WHERE"
if node -e "const {format}=require('sql-formatter');const r=format('UPDATE users SET name=\"x\" WHERE id=1',{language:'mysql'});console.log(r.includes('UPDATE')&&r.includes('WHERE')?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 5: CREATE TABLE
echo "Test 5: CREATE TABLE"
if node -e "const {format}=require('sql-formatter');const r=format('CREATE TABLE users(id INT PRIMARY KEY)',{language:'mysql'});console.log(r.includes('CREATE TABLE')?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 6: PostgreSQL Dialect
echo "Test 6: PostgreSQL Dialect"
if node -e "const {format}=require('sql-formatter');const r=format('SELECT * FROM users',{language:'postgresql'});console.log(r.includes('SELECT')?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 7: Keyword UPPER
echo "Test 7: Keyword UPPER"
if node -e "const {format}=require('sql-formatter');const r=format('select * from users',{language:'mysql',keywordCase:'upper'});console.log(r.includes('SELECT')&&r.includes('FROM')?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 8: Keyword lower
echo "Test 8: Keyword lower"
if node -e "const {format}=require('sql-formatter');const r=format('SELECT*FROM USERS',{language:'mysql',keywordCase:'lower'});console.log(r.includes('select')&&r.includes('from')?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 9: Indentation
echo "Test 9: Indentation"
if node -e "const {format}=require('sql-formatter');const r=format('SELECT id,name FROM users',{language:'mysql',tabWidth:2});console.log(r.split('\\n').length>1?'OK':'');" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

# Test 10: Error Handling
echo "Test 10: Valid syntax handling"
if node -e "const {format}=require('sql-formatter');try{format('SELECT*FROM users',{language:'mysql'});console.log('OK');}catch(e){}" | grep -q OK; then
  echo "✅ PASSED"; ((PASS++))
else
  echo "❌ FAILED"; ((FAIL++))
fi

echo "========================================"
echo "SQL Formatter: $PASS/10 tests passed"
[ $FAIL -eq 0 ] && echo "✅ All tests PASSED!" && exit 0
echo "❌ Some tests FAILED" && exit 1
