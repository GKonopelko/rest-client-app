'use client';

import React from 'react';
import { Collapse } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

export default function VariablesHelp() {
  return (
    <Collapse ghost>
      <Panel
        header={
          <span>
            <QuestionCircleOutlined /> How to use variables
          </span>
        }
        key="1"
      >
        <div
          style={{
            padding: '16px',
            background: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <h4>Variable Format</h4>
          <p>
            Use <code>&#123;&#123;variableName&#125;&#125;</code> in any field:
          </p>

          <h4>Examples:</h4>
          <ul>
            <li>
              <strong>URL:</strong>{' '}
              <code>
                https://api.example.com/&#123;&#123;endpoint&#125;&#125;
              </code>
            </li>
            <li>
              <strong>Headers:</strong>{' '}
              <code>
                &#123;&quot;Authorization&quot;: &quot;Bearer
                &#123;&#123;token&#125;&#125;&quot;&#125;
              </code>
            </li>
            <li>
              <strong>Body:</strong>{' '}
              <code>
                &#123;&quot;userId&quot;:
                &quot;&#123;&#123;userId&#125;&#125;&quot;&#125;
              </code>
            </li>
          </ul>

          <h4>Rules:</h4>
          <ul>
            <li>Variable names must start with a letter or underscore</li>
            <li>Only letters, numbers, and underscores are allowed</li>
            <li>Variable names are case-sensitive</li>
          </ul>
        </div>
      </Panel>
    </Collapse>
  );
}
