import {
  generateCode,
  clearCodeCache,
  getCodeCacheSize,
} from './codeGenerator';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe.skip('codeGenerator', () => {
  const mockRequest = {
    method: 'POST',
    url: 'https://api.example.com/users',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer token123',
    },
    body: '{"name": "John"}',
  };

  beforeEach(() => {
    clearCodeCache();
  });

  afterEach(() => {
    clearCodeCache();
  });

  describe('generateCode', () => {
    it('should return cached code for identical requests', () => {
      const firstCall = generateCode(
        'curl',
        mockRequest.method,
        mockRequest.url,
        mockRequest.headers,
        mockRequest.body
      );

      const secondCall = generateCode(
        'curl',
        mockRequest.method,
        mockRequest.url,
        mockRequest.headers,
        mockRequest.body
      );

      expect(firstCall).toBe(secondCall);
      expect(getCodeCacheSize()).toBe(1);
    });

    it('should return error for unresolved variables in URL', () => {
      const result = generateCode(
        'curl',
        'GET',
        'https://{{API_URL}}/users',
        {},
        ''
      );

      expect(result).toContain('Error: Unresolved variables detected');
    });

    it('should return error for unresolved variables in headers', () => {
      const result = generateCode(
        'curl',
        'GET',
        'https://api.example.com/users',
        { Authorization: 'Bearer {{TOKEN}}' },
        ''
      );

      expect(result).toContain('Error: Unresolved variables detected');
    });

    it('should return error for unresolved variables in body', () => {
      const result = generateCode(
        'curl',
        'POST',
        'https://api.example.com/users',
        {},
        '{"token": "{{API_TOKEN}}"}'
      );

      expect(result).toContain('Error: Unresolved variables detected');
    });

    it('should return "Unsupported language" for unknown language', () => {
      const result = generateCode(
        'unknown',
        mockRequest.method,
        mockRequest.url,
        mockRequest.headers,
        mockRequest.body
      );

      expect(result).toBe('Unsupported language');
    });

    it('should handle errors during code generation', () => {
      const originalStringify = JSON.stringify;
      JSON.stringify = () => {
        throw new Error('Test error');
      };

      const result = generateCode(
        'curl',
        mockRequest.method,
        mockRequest.url,
        mockRequest.headers,
        mockRequest.body
      );

      expect(result).toBe('Error generating code');

      JSON.stringify = originalStringify;
    });

    describe('curl', () => {
      it('should generate curl code with all components', () => {
        const result = generateCode(
          'curl',
          mockRequest.method,
          mockRequest.url,
          mockRequest.headers,
          mockRequest.body
        );

        expect(result).toContain('curl -X POST');
        expect(result).toContain("-H 'Content-Type: application/json'");
        expect(result).toContain("-H 'Authorization: Bearer token123'");
        expect(result).toContain('-d \'{"name": "John"}\'');
        expect(result).toContain("'https://api.example.com/users'");
      });

      it('should generate curl code without body for GET requests', () => {
        const result = generateCode(
          'curl',
          'GET',
          'https://api.example.com/users',
          { Accept: 'application/json' },
          '{"name": "John"}'
        );

        expect(result).toContain('curl -X GET');
        expect(result).not.toContain('-d');
      });

      it('should handle single quotes in body', () => {
        const result = generateCode(
          'curl',
          'POST',
          'https://api.example.com/users',
          {},
          "It's a test"
        );

        expect(result).toContain("\\'It's a test\\'");
      });
    });

    describe('javascript-fetch', () => {
      it('should generate fetch code with all components', () => {
        const result = generateCode(
          'javascript-fetch',
          mockRequest.method,
          mockRequest.url,
          mockRequest.headers,
          mockRequest.body
        );

        expect(result).toContain("fetch('https://api.example.com/users'");
        expect(result).toContain("method: 'POST'");
        expect(result).toContain('"Content-Type": "application/json"');
        expect(result).toContain('"Authorization": "Bearer token123"');
        expect(result).toContain('body:');
        expect(result).toContain('.then(response => response.json())');
      });

      it('should handle JSON body parsing', () => {
        const result = generateCode(
          'javascript-fetch',
          'POST',
          'https://api.example.com/users',
          {},
          '{"name": "John"}'
        );

        expect(result).toContain('body: {"name": "John"}');
      });

      it('should handle non-JSON body as template literal', () => {
        const result = generateCode(
          'javascript-fetch',
          'POST',
          'https://api.example.com/users',
          {},
          'plain text'
        );

        expect(result).toContain('body: `plain text`');
      });

      it('should generate fetch code without body for GET requests', () => {
        const result = generateCode(
          'javascript-fetch',
          'GET',
          'https://api.example.com/users',
          { Accept: 'application/json' },
          '{"name": "John"}'
        );

        expect(result).not.toContain('body:');
      });
    });

    describe('javascript-xhr', () => {
      it('should generate XHR code with all components', () => {
        const result = generateCode(
          'javascript-xhr',
          mockRequest.method,
          mockRequest.url,
          mockRequest.headers,
          mockRequest.body
        );

        expect(result).toContain('const xhr = new XMLHttpRequest();');
        expect(result).toContain(
          "xhr.open('POST', 'https://api.example.com/users');"
        );
        expect(result).toContain(
          "xhr.setRequestHeader('Content-Type', 'application/json');"
        );
        expect(result).toContain(
          "xhr.setRequestHeader('Authorization', 'Bearer token123');"
        );
        expect(result).toContain('xhr.onreadystatechange = function() {');
        expect(result).toContain('xhr.send(');
      });

      it('should generate XHR code without body for GET requests', () => {
        const result = generateCode(
          'javascript-xhr',
          'GET',
          'https://api.example.com/users',
          { Accept: 'application/json' },
          '{"name": "John"}'
        );

        expect(result).toContain('xhr.send();');
      });
    });

    describe('nodejs', () => {
      it('should generate Node.js code with all components', () => {
        const result = generateCode(
          'nodejs',
          mockRequest.method,
          mockRequest.url,
          mockRequest.headers,
          mockRequest.body
        );

        expect(result).toContain("const https = require('https');");
        expect(result).toContain("method: 'POST'");
        expect(result).toContain('"Content-Type": "application/json"');
        expect(result).toContain('"Authorization": "Bearer token123"');
        expect(result).toContain('https.request(');
        expect(result).toContain('req.write(');
        expect(result).toContain('req.end();');
      });

      it('should generate Node.js code without body for GET requests', () => {
        const result = generateCode(
          'nodejs',
          'GET',
          'https://api.example.com/users',
          { Accept: 'application/json' },
          '{"name": "John"}'
        );

        expect(result).not.toContain('req.write(');
      });
    });

    describe('python', () => {
      it('should generate Python code with all components', () => {
        const result = generateCode(
          'python',
          mockRequest.method,
          mockRequest.url,
          mockRequest.headers,
          mockRequest.body
        );

        expect(result).toContain('import requests');
        expect(result).toContain("url = 'https://api.example.com/users'");
        expect(result).toContain('"Content-Type": "application/json"');
        expect(result).toContain('"Authorization": "Bearer token123"');
        expect(result).toContain('data = {"name": "John"}');
        expect(result).toContain('response = requests.post(');
      });

      it('should generate Python code without body for GET requests', () => {
        const result = generateCode(
          'python',
          'GET',
          'https://api.example.com/users',
          { Accept: 'application/json' },
          '{"name": "John"}'
        );

        expect(result).toContain(
          'response = requests.get(url, headers=headers)'
        );
        expect(result).not.toContain('data =');
      });
    });

    describe('java', () => {
      it('should generate Java code with all components', () => {
        const result = generateCode(
          'java',
          mockRequest.method,
          mockRequest.url,
          mockRequest.headers,
          mockRequest.body
        );

        expect(result).toContain('import java.net.HttpURLConnection;');
        expect(result).toContain('public class HttpClient {');
        expect(result).toContain(
          'URL url = new URL("https://api.example.com/users");'
        );
        expect(result).toContain('connection.setRequestMethod("POST");');
        expect(result).toContain(
          'connection.setRequestProperty("Content-Type", "application/json");'
        );
        expect(result).toContain(
          'connection.setRequestProperty("Authorization", "Bearer token123");'
        );
        expect(result).toContain('connection.setDoOutput(true);');
        expect(result).toContain(
          'byte[] input = "{\\"name\\": \\"John\\"}".getBytes("utf-8");'
        );
      });

      it('should generate Java code without body for GET requests', () => {
        const result = generateCode(
          'java',
          'GET',
          'https://api.example.com/users',
          { Accept: 'application/json' },
          '{"name": "John"}'
        );

        expect(result).not.toContain('connection.setDoOutput(true);');
        expect(result).not.toContain('byte[] input');
      });
    });

    describe('csharp', () => {
      it('should generate C# code with all components', () => {
        const result = generateCode(
          'csharp',
          mockRequest.method,
          mockRequest.url,
          mockRequest.headers,
          mockRequest.body
        );

        expect(result).toContain('using System.Net.Http;');
        expect(result).toContain('class Program');
        expect(result).toContain('using var client = new HttpClient();');
        expect(result).toContain(
          'client.DefaultRequestHeaders.Add("Content-Type", "application/json");'
        );
        expect(result).toContain(
          'client.DefaultRequestHeaders.Add("Authorization", "Bearer token123");'
        );
        expect(result).toContain(
          'var request = new HttpRequestMessage(HttpMethod.Post, "https://api.example.com/users");'
        );
        expect(result).toContain(
          'request.Content = new StringContent("{\\"name\\": \\"John\\"}", System.Text.Encoding.UTF8, "application/json");'
        );
      });

      it('should generate C# code without body for GET requests', () => {
        const result = generateCode(
          'csharp',
          'GET',
          'https://api.example.com/users',
          { Accept: 'application/json' },
          '{"name": "John"}'
        );

        expect(result).not.toContain('request.Content =');
      });
    });

    describe('go', () => {
      it('should generate Go code with all components', () => {
        const result = generateCode(
          'go',
          mockRequest.method,
          mockRequest.url,
          mockRequest.headers,
          mockRequest.body
        );

        expect(result).toContain('package main');
        expect(result).toContain('import (');
        expect(result).toContain('"net/http"');
        expect(result).toContain('var jsonStr = []byte(`{"name": "John"}`)');
        expect(result).toContain(
          'req, err := http.NewRequest("POST", "https://api.example.com/users", bytes.NewBuffer(jsonStr))'
        );
        expect(result).toContain(
          'req.Header.Set("Content-Type", "application/json")'
        );
        expect(result).toContain(
          'req.Header.Set("Authorization", "Bearer token123")'
        );
      });

      it('should generate Go code without body for GET requests', () => {
        const result = generateCode(
          'go',
          'GET',
          'https://api.example.com/users',
          { Accept: 'application/json' },
          '{"name": "John"}'
        );

        expect(result).toContain(
          'req, err := http.NewRequest("GET", "https://api.example.com/users", nil)'
        );
        expect(result).not.toContain('var jsonStr =');
      });
    });
  });

  describe('clearCodeCache', () => {
    it('should clear the code cache', () => {
      generateCode('curl', 'GET', 'https://api.example.com', {}, '');
      expect(getCodeCacheSize()).toBe(1);

      clearCodeCache();
      expect(getCodeCacheSize()).toBe(0);
    });
  });

  describe('getCodeCacheSize', () => {
    it('should return the correct cache size', () => {
      expect(getCodeCacheSize()).toBe(0);

      generateCode('curl', 'GET', 'https://api1.com', {}, '');
      expect(getCodeCacheSize()).toBe(1);

      generateCode('curl', 'GET', 'https://api2.com', {}, '');
      expect(getCodeCacheSize()).toBe(2);

      generateCode('javascript-fetch', 'GET', 'https://api1.com', {}, '');
      expect(getCodeCacheSize()).toBe(3);
    });
  });
});
