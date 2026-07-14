const sigStr = "eyJhZGRyZXNzIjoiMHgxMjM0Iiwibm9uY2UiOiI1Njc4In0=";
let sigObj = {};
try {
  sigObj = JSON.parse(Buffer.from(sigStr, 'base64').toString('utf8'));
} catch (e) {}

sigObj.receipt = "0x9999";
console.log(Buffer.from(JSON.stringify(sigObj)).toString('base64'));
