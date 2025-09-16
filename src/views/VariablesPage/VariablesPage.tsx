'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Table, Space, message, Card, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './VariablesPage.module.css';

interface Variable {
  id: string;
  name: string;
  value: string;
}

export default function VariablesPage() {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    const savedVariables = localStorage.getItem(
      'superteam-spbrest-rest-client-variables'
    );
    if (savedVariables) {
      try {
        setVariables(JSON.parse(savedVariables));
      } catch (error) {
        console.error('Failed to parse variables from local storage:', error);
        message.error('Failed to load variables');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'superteam-spbrest-rest-client-variables',
      JSON.stringify(variables)
    );
  }, [variables]);

  const handleAddVariable = () => {
    if (!newName.trim() || !newValue.trim()) {
      message.error('Name and value are required');
      return;
    }

    const newVariable: Variable = {
      id: Date.now().toString(),
      name: newName.trim(),
      value: newValue.trim(),
    };

    setVariables((prev) => [...prev, newVariable]);
    setNewName('');
    setNewValue('');
    message.success('Variable added successfully');
  };

  const handleDeleteVariable = (id: string) => {
    setVariables((prev) => prev.filter((v) => v.id !== id));
    message.success('Variable deleted successfully');
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Variable) => (
        <Space>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteVariable(record.id)}
            size="small"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <section className={styles.section}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <Typography.Title level={2} className={styles.title}>
            Variables
          </Typography.Title>
          <p>Manage your environment variables for API requests</p>
        </div>

        <div className={styles.addSection}>
          <Typography.Title level={3}>Add New Variable</Typography.Title>
          <Space.Compact className={styles.inputGroup}>
            <Input
              placeholder="Variable name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={styles.nameInput}
            />
            <Input
              placeholder="Variable value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className={styles.valueInput}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddVariable}
              className={styles.addButton}
            >
              Add
            </Button>
          </Space.Compact>
        </div>

        <div className={styles.listSection}>
          <Typography.Title level={3}>Your Variables</Typography.Title>
          <Table
            columns={columns}
            dataSource={variables}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: 'No variables added yet' }}
          />
        </div>
      </Card>
    </section>
  );
}
