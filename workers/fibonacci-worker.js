// Child process worker for calculating Fibonacci
process.on('message', ({ n }) => {
  const startTime = Date.now();
  
  const fibonacci = (num) => {
    if (num <= 1) return num;
    return fibonacci(num - 1) + fibonacci(num - 2);
  };
  
  const result = fibonacci(n);
  const duration = Date.now() - startTime;
  
  process.send({ 
    value: result, 
    duration: `${duration}ms`,
    processId: process.pid 
  });
  
  process.exit(0);
});
