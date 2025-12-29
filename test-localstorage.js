// Simple localStorage test
console.log('Testing localStorage...');

// Test 1: Check if localStorage is available
if (typeof localStorage !== 'undefined') {
  console.log('✓ localStorage is available');
} else {
  console.log('✗ localStorage is NOT available');
}

// Test 2: Try to set and get a value
try {
  localStorage.setItem('test_key', 'test_value');
  const value = localStorage.getItem('test_key');
  if (value === 'test_value') {
    console.log('✓ localStorage read/write works');
  } else {
    console.log('✗ localStorage read/write failed');
  }
  localStorage.removeItem('test_key');
} catch (error) {
  console.log('✗ localStorage error:', error);
}

// Test 3: Check if we can store JSON
try {
  const testData = [{ id: 1, name: 'test' }];
  localStorage.setItem('test_json', JSON.stringify(testData));
  const parsed = JSON.parse(localStorage.getItem('test_json'));
  console.log('✓ localStorage JSON works:', parsed);
  localStorage.removeItem('test_json');
} catch (error) {
  console.log('✗ localStorage JSON error:', error);
}
