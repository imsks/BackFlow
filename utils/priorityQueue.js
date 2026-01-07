// MinHeap-based Priority Queue implementation
class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  // Get parent index
  parent(index) {
    return Math.floor((index - 1) / 2);
  }

  // Get left child index
  leftChild(index) {
    return 2 * index + 1;
  }

  // Get right child index
  rightChild(index) {
    return 2 * index + 2;
  }

  // Swap two elements
  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // Insert a task with priority (lower number = higher priority)
  enqueue(task, priority) {
    const item = { task, priority, timestamp: Date.now() };
    this.heap.push(item);
    this.heapifyUp(this.heap.length - 1);
    return item;
  }

  // Remove and return the highest priority task
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }

    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    const top = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return top;
  }

  // Move element up to maintain heap property
  heapifyUp(index) {
    while (index > 0) {
      const parentIdx = this.parent(index);
      if (this.heap[parentIdx].priority <= this.heap[index].priority) {
        break;
      }
      this.swap(parentIdx, index);
      index = parentIdx;
    }
  }

  // Move element down to maintain heap property
  heapifyDown(index) {
    while (true) {
      let smallest = index;
      const left = this.leftChild(index);
      const right = this.rightChild(index);

      if (left < this.heap.length && 
          this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }

      if (right < this.heap.length && 
          this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }

      if (smallest === index) {
        break;
      }

      this.swap(index, smallest);
      index = smallest;
    }
  }

  // Check if queue is empty
  isEmpty() {
    return this.heap.length === 0;
  }

  // Get size of queue
  size() {
    return this.heap.length;
  }

  // Peek at the highest priority task without removing it
  peek() {
    return this.isEmpty() ? null : this.heap[0];
  }
}

export const taskQueue = new PriorityQueue();
