export const EXAMPLES = {
  "Bubble Sort": `arr = [5, 2, 8, 1, 9, 3]\nn = len(arr)\nfor i in range(n):\n    for j in range(0, n - i - 1):\n        if arr[j] > arr[j + 1]:\n            arr[j], arr[j + 1] = arr[j + 1], arr[j]`,
  "Fibonacci": `series = []\nn = 8\na, b = 0, 1\nfor i in range(n):\n    series.append(a)\n    a, b = b, a + b\nresult = series`,
  "Binary Search": `def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\narr = [1, 3, 5, 7, 9, 11, 13]\nresult = binary_search(arr, 7)`,
  "Factorial": `def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nresult = factorial(5)`,
  "List Comp": `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\nevens = [x for x in numbers if x % 2 == 0]\nsquares = [x ** 2 for x in evens]\ntotal = sum(squares)`,
  "Dict Ops": `inventory = {}\nitems = [("apple", 3), ("banana", 5), ("cherry", 2)]\nfor name, count in items:\n    inventory[name] = count\n\ntotal = sum(inventory.values())`,
  "Stack Sim": `stack = []\nops = ["push 1", "push 2", "push 3", "pop", "push 4"]\nfor op in ops:\n    if op.startswith("push"):\n        val = int(op.split()[1])\n        stack.append(val)\n    elif op == "pop" and stack:\n        popped = stack.pop()`,
};

export const TYPE_STYLES = {
  int:   'bg-blue-500/20 text-blue-300 border-blue-500/30',
  float: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  str:   'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  bool:  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  array: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  dict:  'bg-pink-500/20 text-pink-300 border-pink-500/30',
  null:  'bg-slate-500/20 text-slate-400 border-slate-500/30',
  unknown:'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export const EVENT_STYLES = {
  line:   { bg: 'bg-blue-500/10 border-blue-500/40',    dot: 'bg-blue-400',    text: 'text-blue-300',    label: 'LINE'   },
  call:   { bg: 'bg-emerald-500/10 border-emerald-500/40', dot: 'bg-emerald-400', text: 'text-emerald-300', label: 'CALL'   },
  return: { bg: 'bg-purple-500/10 border-purple-500/40',  dot: 'bg-purple-400',  text: 'text-purple-300',  label: 'RETURN' },
};

export const SPEEDS = [{ label: '0.5×', ms: 2000 }, { label: '1×', ms: 1000 }, { label: '2×', ms: 500 }, { label: '4×', ms: 250 }];
