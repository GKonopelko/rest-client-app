export function generateCode(
  language: string,
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string {
  try {
    const variablePattern = /\{\{[^}]+\}\}/;
    if (
      variablePattern.test(url) ||
      variablePattern.test(JSON.stringify(headers)) ||
      variablePattern.test(body)
    ) {
      return 'Error: Unresolved variables detected in request parameters. Please make sure all variables are defined.';
    }

    switch (language) {
      case 'curl':
        return generateCurlCode(method, url, headers, body);
      case 'javascript-fetch':
        return generateJavascriptFetchCode(method, url, headers, body);
      case 'javascript-xhr':
        return generateJavascriptXHRCode(method, url, headers, body);
      case 'nodejs':
        return generateNodeJSCode(method, url, headers, body);
      case 'python':
        return generatePythonCode(method, url, headers, body);
      case 'java':
        return generateJavaCode(method, url, headers, body);
      case 'csharp':
        return generateCSharpCode(method, url, headers, body);
      case 'go':
        return generateGoCode(method, url, headers, body);
      default:
        return 'Unsupported language';
    }
  } catch (_error) {
    return 'Error generating code';
  }
}

function generateCurlCode(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string {
  const variablePattern = /\{\{[^}]+\}\}/;
  if (
    variablePattern.test(url) ||
    variablePattern.test(JSON.stringify(headers)) ||
    variablePattern.test(body)
  ) {
    return 'Error: Unresolved variables detected in request parameters';
  }

  let command = `curl -X ${method}`;

  Object.entries(headers).forEach(([key, value]) => {
    command += ` \\\n  -H '${key}: ${value}'`;
  });

  if (body && method !== 'GET' && method !== 'HEAD') {
    command += ` \\\n  -d '${body.replace(/'/g, "\\'")}'`;
  }

  command += ` \\\n  '${url}'`;

  return command;
}

function generateJavascriptFetchCode(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string {
  const variablePattern = /\{\{[^}]+\}\}/;
  if (
    variablePattern.test(url) ||
    variablePattern.test(JSON.stringify(headers)) ||
    variablePattern.test(body)
  ) {
    return 'Error: Unresolved variables detected in request parameters';
  }

  let code = `fetch('${url}', {\n  method: '${method}'`;

  if (Object.keys(headers).length > 0) {
    code += `,\n  headers: ${JSON.stringify(headers, null, 2)}`;
  }

  if (body && method !== 'GET' && method !== 'HEAD') {
    try {
      const parsedBody = JSON.parse(body);
      code += `,\n  body: ${JSON.stringify(parsedBody, null, 2)}`;
    } catch {
      code += `,\n  body: \`${body}\``;
    }
  }

  code += '\n})';
  code += '\n  .then(response => response.json())';
  code += '\n  .then(data => console.log(data))';
  code += '\n  .catch(error => console.error("Error:", error));';

  return code;
}

function generateJavascriptXHRCode(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string {
  const variablePattern = /\{\{[^}]+\}\}/;
  if (
    variablePattern.test(url) ||
    variablePattern.test(JSON.stringify(headers)) ||
    variablePattern.test(body)
  ) {
    return 'Error: Unresolved variables detected in request parameters';
  }

  let code = 'const xhr = new XMLHttpRequest();\n';
  code += `xhr.open('${method}', '${url}');\n`;

  Object.entries(headers).forEach(([key, value]) => {
    code += `xhr.setRequestHeader('${key}', '${value}');\n`;
  });

  code += 'xhr.onreadystatechange = function() {\n';
  code += '  if (xhr.readyState === 4) {\n';
  code += '    console.log(xhr.responseText);\n';
  code += '  }\n';
  code += '};\n';

  if (body && method !== 'GET' && method !== 'HEAD') {
    code += `xhr.send(${JSON.stringify(body)});`;
  } else {
    code += 'xhr.send();';
  }

  return code;
}

function generateNodeJSCode(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string {
  const variablePattern = /\{\{[^}]+\}\}/;
  if (
    variablePattern.test(url) ||
    variablePattern.test(JSON.stringify(headers)) ||
    variablePattern.test(body)
  ) {
    return 'Error: Unresolved variables detected in request parameters';
  }

  let code = `const https = require('https');\n\n`;
  code += `const options = {\n`;
  code += `  method: '${method}',\n`;
  code += `  headers: ${JSON.stringify(headers, null, 2)}\n`;
  code += `};\n\n`;

  code += `const req = https.request('${url}', options, (res) => {\n`;
  code += `  let data = '';\n`;
  code += `  res.on('data', (chunk) => {\n`;
  code += `    data += chunk;\n`;
  code += `  });\n`;
  code += `  res.on('end', () => {\n`;
  code += `    console.log(data);\n`;
  code += `  });\n`;
  code += `});\n\n`;

  if (body && method !== 'GET' && method !== 'HEAD') {
    code += `req.write(${JSON.stringify(body)});\n`;
  }

  code += `req.end();`;

  return code;
}

function generatePythonCode(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string {
  const variablePattern = /\{\{[^}]+\}\}/;
  if (
    variablePattern.test(url) ||
    variablePattern.test(JSON.stringify(headers)) ||
    variablePattern.test(body)
  ) {
    return 'Error: Unresolved variables detected in request parameters';
  }

  let code = `import requests\n\n`;
  code += `url = '${url}'\n`;
  code += `headers = ${JSON.stringify(headers, null, 2)}\n\n`;

  if (body && method !== 'GET' && method !== 'HEAD') {
    code += `data = ${body}\n\n`;
  }

  code += `response = requests.${method.toLowerCase()}(${body && method !== 'GET' && method !== 'HEAD' ? 'url, headers=headers, json=data' : 'url, headers=headers'})\n`;
  code += `print(response.text)`;

  return code;
}

function generateJavaCode(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string {
  const variablePattern = /\{\{[^}]+\}\}/;
  if (
    variablePattern.test(url) ||
    variablePattern.test(JSON.stringify(headers)) ||
    variablePattern.test(body)
  ) {
    return 'Error: Unresolved variables detected in request parameters';
  }

  let code = `import java.net.HttpURLConnection;\n`;
  code += `import java.net.URL;\n`;
  code += `import java.io.OutputStream;\n`;
  code += `import java.io.BufferedReader;\n`;
  code += `import java.io.InputStreamReader;\n\n`;

  code += `public class HttpClient {\n`;
  code += `    public static void main(String[] args) throws Exception {\n`;
  code += `        URL url = new URL("${url}");\n`;
  code += `        HttpURLConnection connection = (HttpURLConnection) url.openConnection();\n`;
  code += `        connection.setRequestMethod("${method}");\n\n`;

  Object.entries(headers).forEach(([key, value]) => {
    code += `        connection.setRequestProperty("${key}", "${value}");\n`;
  });

  if (body && method !== 'GET' && method !== 'HEAD') {
    code += `        connection.setDoOutput(true);\n`;
    code += `        try(OutputStream os = connection.getOutputStream()) {\n`;
    code += `            byte[] input = ${JSON.stringify(body)}.getBytes("utf-8");\n`;
    code += `            os.write(input, 0, input.length);\n`;
    code += `        }\n`;
  }

  code += `        int status = connection.getResponseCode();\n`;
  code += `        BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));\n`;
  code += `        String inputLine;\n`;
  code += `        StringBuffer content = new StringBuffer();\n`;
  code += `        while ((inputLine = in.readLine()) != null) {\n`;
  code += `            content.append(inputLine);\n`;
  code += `        }\n`;
  code += `        in.close();\n`;
  code += `        connection.disconnect();\n`;
  code += `        System.out.println(content.toString());\n`;
  code += `    }\n`;
  code += `}`;

  return code;
}

function generateCSharpCode(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string {
  const variablePattern = /\{\{[^}]+\}\}/;
  if (
    variablePattern.test(url) ||
    variablePattern.test(JSON.stringify(headers)) ||
    variablePattern.test(body)
  ) {
    return 'Error: Unresolved variables detected in request parameters';
  }

  let code = `using System;\n`;
  code += `using System.Net.Http;\n`;
  code += `using System.Threading.Tasks;\n\n`;

  code += `class Program\n`;
  code += `{\n`;
  code += `    static async Task Main(string[] args)\n`;
  code += `    {\n`;
  code += `        using var client = new HttpClient();\n\n`;

  Object.entries(headers).forEach(([key, value]) => {
    code += `        client.DefaultRequestHeaders.Add("${key}", "${value}");\n`;
  });

  code += `        var request = new HttpRequestMessage(HttpMethod.${method}, "${url}");\n\n`;

  if (body && method !== 'GET' && method !== 'HEAD') {
    code += `        request.Content = new StringContent(${JSON.stringify(body)}, System.Text.Encoding.UTF8, "application/json");\n`;
  }

  code += `        var response = await client.SendAsync(request);\n`;
  code += `        var responseBody = await response.Content.ReadAsStringAsync();\n`;
  code += `        Console.WriteLine(responseBody);\n`;
  code += `    }\n`;
  code += `}`;

  return code;
}

function generateGoCode(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string {
  const variablePattern = /\{\{[^}]+\}\}/;
  if (
    variablePattern.test(url) ||
    variablePattern.test(JSON.stringify(headers)) ||
    variablePattern.test(body)
  ) {
    return 'Error: Unresolved variables detected in request parameters';
  }

  let code = `package main\n\n`;
  code += `import (\n`;
  code += `    "bytes"\n`;
  code += `    "fmt"\n`;
  code += `    "net/http"\n`;
  code += `    "io/ioutil"\n`;
  code += `)\n\n`;

  code += `func main() {\n`;
  code += `    client := &http.Client{}\n\n`;

  if (body && method !== 'GET' && method !== 'HEAD') {
    code += `    var jsonStr = []byte(\`${body}\`)\n`;
    code += `    req, err := http.NewRequest("${method}", "${url}", bytes.NewBuffer(jsonStr))\n`;
  } else {
    code += `    req, err := http.NewRequest("${method}", "${url}", nil)\n`;
  }

  code += `    if err != nil {\n`;
  code += `        panic(err)\n`;
  code += `    }\n\n`;

  Object.entries(headers).forEach(([key, value]) => {
    code += `    req.Header.Set("${key}", "${value}")\n`;
  });

  code += `    resp, err := client.Do(req)\n`;
  code += `    if err != nil {\n`;
  code += `        panic(err)\n`;
  code += `    }\n`;
  code += `    defer resp.Body.Close()\n\n`;
  code += `    body, _ := ioutil.ReadAll(resp.Body)\n`;
  code += `    fmt.Println(string(body))\n`;
  code += `}`;

  return code;
}
