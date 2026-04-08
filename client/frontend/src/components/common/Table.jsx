import React from 'react';
import styles from './Table.module.css';

export const Table = ({ columns, data, actions, noDataMessage = 'No data available' }) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={styles.th}>
                {column.label}
              </th>
            ))}
            {actions && actions.length > 0 && (
              <th className={styles.th}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className={styles.tr}>
                {columns.map((column) => (
                  <td key={column.key} className={styles.td}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {actions && actions.length > 0 && (
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      {actions.map((action) => (
                        <button
                          key={action.label}
                          className={`${styles.actionBtn} ${styles[action.variant || 'primary']}`}
                          onClick={() => action.onClick(row)}
                          title={action.label}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className={styles.noData}>
                {noDataMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
