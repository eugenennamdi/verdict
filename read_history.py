with open('/Users/apple/.zsh_history', 'r') as f:
    for line in f:
        if 'onchainos' in line.lower() or 'payment' in line.lower() or 'pay' in line.lower():
            print(line.strip())
