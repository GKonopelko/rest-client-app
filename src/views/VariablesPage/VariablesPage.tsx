'use client';

import React, { useState } from 'react';
import { Button, Input, Table, Space, message, Card, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './VariablesPage.module.css';
import {
  Variable,
  isValidVariableName,
  validateVariableValue,
  STORAGE_KEY,
} from '@/utils/variablesUtils';
import { useTranslations } from 'next-intl';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function VariablesPage() {
  const [variables, setVariables] = useLocalStorage<Variable[]>(
    STORAGE_KEY,
    []
  );
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [nameError, setNameError] = useState('');
  const [valueError, setValueError] = useState('');
  const t = useTranslations('VariablesPage');

  const validateName = (name: string): boolean => {
    if (!name.trim()) {
      setNameError(t('nameRequired'));
      return false;
    }

    if (!isValidVariableName(name.trim())) {
      setNameError(t('invalidName'));
      return false;
    }

    if (variables.some((v) => v.name === name.trim())) {
      setNameError(t('duplicateName'));
      return false;
    }

    setNameError('');
    return true;
  };

  const validateValue = (value: string): boolean => {
    if (!value.trim()) {
      setValueError(t('valueRequired'));
      return false;
    }

    const validationResult = validateVariableValue(value.trim());
    if (!validationResult.isValid) {
      setValueError(validationResult.message || t('invalidValue'));
      return false;
    }

    setValueError('');
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewName(value);
    if (nameError) validateName(value);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewValue(value);
    if (valueError) validateValue(value);
  };

  const handleAddVariable = () => {
    const isNameValid = validateName(newName);
    const isValueValid = validateValue(newValue);

    if (!isNameValid || !isValueValid) {
      if (!isNameValid) {
        message.error(nameError);
      }
      if (!isValueValid) {
        message.error(valueError);
      }
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
    setNameError('');
    setValueError('');
    message.success(t('addSuccess'));
  };

  const handleDeleteVariable = (id: string) => {
    setVariables((prev) => prev.filter((v) => v.id !== id));
    message.success(t('deleteSuccess'));
  };

  const handleBlurName = () => {
    validateName(newName);
  };

  const handleBlurValue = () => {
    validateValue(newValue);
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
      render: (value: string) => (
        <span title={value}>
          {value.length > 50 ? `${value.substring(0, 50)}...` : value}
        </span>
      ),
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
          <div className={styles['input-group']}>
            <div>
              <Input
                placeholder={t('namePlaceholder')}
                value={newName}
                onChange={handleNameChange}
                onBlur={handleBlurName}
                className={styles['name-input']}
                status={nameError ? 'error' : ''}
              />
              {nameError && (
                <div className={styles['error-text']}>{nameError}</div>
              )}
            </div>

            <div>
              <Input
                placeholder={t('valuePlaceholder')}
                value={newValue}
                onChange={handleValueChange}
                onBlur={handleBlurValue}
                className={styles['value-input']}
                status={valueError ? 'error' : ''}
              />
              {valueError && (
                <div className={styles['error-text']}>{valueError}</div>
              )}
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddVariable}
              className={styles['add-button']}
            >
              {t('addButton')}
            </Button>
          </div>
        </div>

        <div className={styles['list-section']}>
          <Typography.Title level={3}>{t('yourVariables')}</Typography.Title>
          <Table
            columns={columns}
            dataSource={variables}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: t('noVariables') }}
            scroll={{ x: true }}
          />
        </div>
      </Card>
    </section>
  );
}
