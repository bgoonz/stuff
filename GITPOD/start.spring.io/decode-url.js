const url = process.argv[2].replace(/-/g,'=').replace(/_/g,'/');
console.log(Buffer.from(url, 'base64').toString())
