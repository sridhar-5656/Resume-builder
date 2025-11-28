// const http = require('http');
// const server = http.createServer((req ,res)=>{
//     req.writeHead(200,{'Content-Type':'text/plain'});
//     res.end('hello world');
// });
// server.listen(4000,()=>{
//     console.log('server is running on http://localhost:4000');
//     });




// console.log(process.pid); // Process ID
// console.log(process.version); // Node.js version
// console.log(process.platform); // OS platform (e.g., win32, linux, darwin)
// console.log(process.cwd()); // Current working directory


// const http = require('http');

// const server = http.createServer((req, res) => {
//     res.writeHead(200, { 'Content-Type': 'text/plain' }); // Set status and headers
//     res.end('Hello, World!'); // Send response
// });

// server.listen(4000, () => {
//     console.log('Server is running on http://localhost:4000');
// });




const EventEmitter = require('events');

const eventEmitter = new EventEmitter();

eventEmitter.once('init', () => {
    console.log('This event runs only once!');
});

eventEmitter.emit('init'); // ✅ Runs
eventEmitter.emit('init'); // ❌ Won't run again

