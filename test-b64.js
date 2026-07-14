const sig = Buffer.from('eyJhZGRyZXNzIjoiMHgiLCJzaWduYXR1cmUiOiIweCIsIm5vbmNlIjoiMTIzIn0=', 'base64').toString('utf8');
const obj = JSON.parse(sig);
obj.receipt = "0xABC123";
const newSig = Buffer.from(JSON.stringify(obj)).toString('base64');
console.log(newSig);
