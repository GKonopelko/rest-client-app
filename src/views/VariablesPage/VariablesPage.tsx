'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Table, Space, message, Card, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './VariablesPage.module.css';
import {
  Variable,
  loadVariablesFromStorage,
  saveVariablesToStorage,
  isValidVariableName,
} from '@/utils/variablesUtils';
import { useTranslations } from 'next-intl';

export default function VariablesPage() {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const t = useTranslations('VariablesPage');

  useEffect(() => {
    const savedVariables = loadVariablesFromStorage();
    setVariables(savedVariables);
  }, []);

  useEffect(() => {
    saveVariablesToStorage(variables);
  }, [variables]);

  const handleAddVariable = () => {
    if (!newName.trim() || !newValue.trim()) {
      message.error(t('nameValueRequired'));
      return;
    }

    if (!isValidVariableName(newName.trim())) {
      message.error(t('invalidName'));
      return;
    }

    if (variables.some((v) => v.name === newName.trim())) {
      message.error(t('duplicateName'));
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
    message.success(t('addSuccess'));
  };

  const handleDeleteVariable = (id: string) => {
    setVariables((prev) => prev.filter((v) => v.id !== id));
    message.success(t('deleteSuccess'));
  };

  const columns = [
    {
      title: t('nameColumn'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => `{{${name}}}`,
    },
    {
      title: t('valueColumn'),
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: t('actionsColumn'),
      key: 'actions',
      render: (_: unknown, record: Variable) => (
        <Space>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteVariable(record.id)}
            size="small"
          >
            {t('deleteButton')}
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
            {t('title')}
          </Typography.Title>
          <p>
            {t('description')} <code>{'{{variableName}}'}</code>{' '}
            {t('formatHint')}
          </p>
        </div>

        <div className={styles['add-section']}>
          <Typography.Title level={3}>{t('addNew')}</Typography.Title>
          <Space.Compact className={styles['input-group']}>
            <Input
              placeholder={t('namePlaceholder')}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={styles['name-input']}
            />
            <Input
              placeholder={t('valuePlaceholder')}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className={styles['value-input']}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddVariable}
              className={styles['add-button']}
            >
              {t('addButton')}
            </Button>
          </Space.Compact>
        </div>

        <div className={styles['list-section']}>
          <Typography.Title level={3}>{t('yourVariables')}</Typography.Title>
          <Table
            columns={columns}
            dataSource={variables}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: t('noVariables') }}
          />
        </div>
      </Card>
    </section>
  );
}
