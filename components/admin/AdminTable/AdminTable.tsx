'use client';

import { useState, useMemo, type ReactNode } from 'react';
import styles from './AdminTable.module.css';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  width?: string;
}

export interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  actions?: {
    label: string;
    onClick: (row: T) => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}

type SortState = {
  key: string;
  order: 'asc' | 'desc';
} | null;

export default function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  sortBy: initialSortBy,
  sortOrder: initialSortOrder = 'desc',
  onSort,
  actions = [],
  onRowClick,
  emptyMessage = 'No hay datos disponibles',
  loading = false,
}: AdminTableProps<T>) {
  const [sortState, setSortState] = useState<SortState>(
    initialSortBy
      ? { key: initialSortBy, order: initialSortOrder }
      : null
  );

  const sortedData = useMemo(() => {
    if (!sortState) return data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return [...data].sort((a: any, b: any) => {
      const aVal = a[sortState.key];
      const bVal = b[sortState.key];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortState.order === 'asc' ? comparison : -comparison;
    });
  }, [data, sortState]);

  const handleSort = (key: string) => {
    const column = columns.find((col) => col.key === key);
    if (!column?.sortable) return;

    let newOrder: 'asc' | 'desc';
    if (sortState?.key === key) {
      newOrder = sortState.order === 'asc' ? 'desc' : 'asc';
    } else {
      newOrder = 'asc';
    }

    setSortState({ key, order: newOrder });
    onSort?.(key, newOrder);
  };

  const renderSortIcon = (key: string) => {
    if (sortState?.key !== key) {
      return (
        <svg className={styles.sortIcon} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1L9 5H3L6 1Z" fill="currentColor" opacity="0.3" />
          <path d="M6 11L3 7H9L6 11Z" fill="currentColor" opacity="0.3" />
        </svg>
      );
    }
    if (sortState.order === 'asc') {
      return (
        <svg className={styles.sortIcon} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1L9 5H3L6 1Z" fill="currentColor" />
          <path d="M6 11L3 7H9L6 11Z" fill="currentColor" opacity="0.3" />
        </svg>
      );
    }
    return (
      <svg className={styles.sortIcon} width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 1L9 5H3L6 1Z" fill="currentColor" opacity="0.3" />
        <path d="M6 11L3 7H9L6 11Z" fill="currentColor" />
      </svg>
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${styles.th} ${column.sortable ? styles.sortable : ''}`}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column.key)}
                >
                  <span className={styles.thContent}>
                    {column.header}
                    {column.sortable && renderSortIcon(column.key)}
                  </span>
                </th>
              ))}
              {actions.length > 0 && <th className={styles.th}>Acciones</th>}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {loading ? (
              <tr>
                <td colSpan={columns.length + actions.length} className={styles.loadingCell}>
                  <span className={styles.loadingText}>Cargando...</span>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + actions.length} className={styles.emptyCell}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className={`${styles.tr} ${onRowClick ? styles.clickable : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={styles.td}>
                      {column.render
                        ? column.render(row)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        : ((row as any)[column.key] as ReactNode)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className={styles.td}>
                      <div className={styles.actions}>
                        {actions.map((action, index) => (
                          <button
                            key={index}
                            className={`${styles.actionButton} ${styles[action.variant || 'secondary']}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
