export class AIAssistant {
  formatCode(code: string, problemTitle: string, language: string): string {
    // Sanitize problem title
    const sanitizedTitle = problemTitle.replace(/\s+/g, '').toLowerCase();
    
    if (language === 'python') {
      return `def solve_${sanitizedTitle}(input):
    # Your code implementation here
    ${this.indentPythonCode(code)}
    return result`;
    } else if (language === 'javascript') {
      const pascalTitle = sanitizedTitle.charAt(0).toUpperCase() + sanitizedTitle.slice(1);
      return `function solve${pascalTitle}(input) {
  // Your code implementation here
  ${code}
  return result;
}`;
    }
    return code;
  }

  private indentPythonCode(code: string): string {
    // Add proper indentation for Python code
    return code.split('\n')
      .map(line => '    ' + line)
      .join('\n');
  }

  generateCodeTemplate(problemTitle: string, language: string): string {
    const sanitizedTitle = problemTitle.replace(/\s+/g, '').toLowerCase();
    
    if (language === 'python') {
      return `def solve_${sanitizedTitle}(input):
    # Parse input if needed
    # Example: if input is "nums = [1,2,3], target = 9"
    # You can parse it like:
    # nums_str, target_str = input.split(', ')
    # nums = eval(nums_str.split(' = ')[1])
    # target = int(target_str.split(' = ')[1])
    
    # Your solution logic here
    
    # Return the result in the exact format expected
    return result`;
    } else if (language === 'javascript') {
      const pascalTitle = sanitizedTitle.charAt(0).toUpperCase() + sanitizedTitle.slice(1);
      return `function solve${pascalTitle}(input) {
  // Parse input if needed
  // Example: if input is "nums = [1,2,3], target = 9"
  // You can parse it like:
  // const [numsStr, targetStr] = input.split(', ');
  // const nums = JSON.parse(numsStr.split(' = ')[1]);
  // const target = parseInt(targetStr.split(' = ')[1]);
  
  // Your solution logic here
  
  // Return the result in the exact format expected
  return result;
}`;
    }
    return '';
  }
}

export const aiAssistant = new AIAssistant(); 