const { exec } = require('child_process');
const NG_COMMAND="npm run build --prod";

console.log(`Running: "${NG_COMMAND}"\n`);

exec(NG_COMMAND, (error, stdout, stderr) => {
  // Process stdout, stderr, and error
  // You can log them, save to a file, or handle them as needed
  if(error) {
    console.log("typeof:", typeof error);
    // console.error(error);
    // console.log("EE:", error.name)
    console.log("EE:", error.message)
  }
  if(stderr) {
    console.log("ERROR:", stderr);
  }
  if(stdout) {
    let lines = stdout.split('\n');
    console.log("--------------------");
    console.log(typeof stdout, stdout.length, lines.length);

    // let hashLine = /Build at:/.test(stdout);
    // let hashLine = stdout.match(/Build at:/);
    
    lines.forEach( (l,i) => {
      console.log(`[${i}] `, l);
    });
    let hashLine = lines.filter( p => /^Build at:/.test(p) );
    console.log({hashLine});
  }
});