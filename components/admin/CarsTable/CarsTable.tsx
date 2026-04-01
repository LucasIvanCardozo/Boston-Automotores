'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Star,
  Eye,
  Pencil,
  Trash2,
  Search,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import Button from '@/components/ui/Button/Button'
import Badge from '@/components/ui/Badge/Badge'
import styles from './CarsTable.module.css'

type CarStatus = 'available' | 'sold' | 'reserved'

interface Car {
  id: string
  brand: string
  model: string
  year: number
  price: number
  status: CarStatus
  featured: boolean
  deletedAt: Date | null
  images: { url: string }[]
  createdAt: Date
}

const statusConfig: Record<CarStatus, { variant: 'success' | 'error' | 'warning'; label: string }> = {
  available: { variant: 'success', label: 'Disponible' },
  sold: { variant: 'error', label: 'Vendido' },
  reserved: { variant: 'warning', label: 'Reservado' },
}

interface CarsTableProps {
  data: Car[]
  totalCount: number
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  onDeleteCar?: (car: Car) => void
  isLoading?: boolean
}

export default function CarsTable({
  data,
  totalCount,
  page,
  pageSize,
  sortBy,
  sortOrder,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onDeleteCar,
  isLoading = false,
}: CarsTableProps) {
  const [sorting, setSorting] = useState<SortingState>(sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : [])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const handleSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(newSorting)
      if (newSorting.length > 0) {
        onSortChange(newSorting[0].id, newSorting[0].desc ? 'desc' : 'asc')
      } else {
        onSortChange('createdAt', 'desc')
      }
    },
    [sorting, onSortChange]
  )

  const columns = useMemo<ColumnDef<Car>[]>(
    () => [
      {
        accessorKey: 'brand',
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className={styles.sortHeader} onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Marca/Modelo
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className={styles.sortIcon} />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className={styles.sortIcon} />
            ) : (
              <ArrowUpDown className={styles.sortIconInactive} />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className={styles.carCell}>
            <span className={styles.brand}>{row.original.brand}</span>
            <span className={styles.model}>{row.original.model}</span>
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: 'year',
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className={styles.sortHeader} onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Año
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className={styles.sortIcon} />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className={styles.sortIcon} />
            ) : (
              <ArrowUpDown className={styles.sortIconInactive} />
            )}
          </Button>
        ),
        cell: ({ row }) => <span className={styles.year}>{row.original.year}</span>,
        enableSorting: true,
      },
      {
        accessorKey: 'price',
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className={styles.sortHeader} onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Precio
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className={styles.sortIcon} />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className={styles.sortIcon} />
            ) : (
              <ArrowUpDown className={styles.sortIconInactive} />
            )}
          </Button>
        ),
        cell: ({ row }) => <span className={styles.price}>${row.original.price.toLocaleString('es-AR')}</span>,
        enableSorting: true,
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const config = statusConfig[row.original.status]
          return (
            <Badge variant={config.variant} size="sm">
              {config.label}
            </Badge>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: 'featured',
        header: 'Destacado',
        cell: ({ row }) => (row.original.featured ? <Star className={styles.starIcon} fill="currentColor" /> : <span className={styles.noFeatured}>—</span>),
        enableSorting: false,
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className={styles.sortHeader} onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Creado
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className={styles.sortIcon} />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className={styles.sortIcon} />
            ) : (
              <ArrowUpDown className={styles.sortIconInactive} />
            )}
          </Button>
        ),
        cell: ({ row }) => <span className={styles.date}>{new Date(row.original.createdAt).toLocaleDateString('es-AR')}</span>,
        enableSorting: true,
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
          const car = row.original
          return (
            <div className={styles.actionsDropdown}>
              <Link href={`/admin/autos/${car.id}/editar`} className={styles.actionItem}>
                <Pencil className={styles.actionIcon} />
                <span>Editar</span>
              </Link>
              <Link href={`/catalogo/${car.id}`} className={styles.actionItem} target="_blank">
                <Eye className={styles.actionIcon} />
                <span>Ver</span>
              </Link>
              <button className={`${styles.actionItem} ${styles.actionDanger}`} onClick={() => onDeleteCar?.(car)}>
                <Trash2 className={styles.actionIcon} />
                <span>Eliminar</span>
              </button>
            </div>
          )
        },
        enableSorting: false,
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(totalCount / pageSize),
  })

  const totalPages = Math.ceil(totalCount / pageSize)

  if (isLoading) {
    return <TableSkeleton />
  }

  return (
    <div className={styles.container}>
      {/* Table */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className={styles.th}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className={styles.tbody}>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className={styles.emptyCell}>
                    <div className={styles.emptyState}>
                      <Search className={styles.emptyIcon} />
                      <h3 className={styles.emptyTitle}>No hay vehículos</h3>
                      <p className={styles.emptyDescription}>No se encontraron vehículos con los criterios de búsqueda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className={styles.tr}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={styles.td}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination — only rendered when there is more than one page */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            <span>
              Mostrando {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCount)} de {totalCount}
            </span>
          </div>

          <div className={styles.paginationControls}>
            <div className={styles.pageSizeSelect}>
              <label htmlFor="pageSize">Filas:</label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => {
                  onPageSizeChange(Number(e.target.value))
                  onPageChange(1)
                }}
                className={styles.select}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className={styles.pageButtons}>
              <Button variant="ghost" size="sm" onClick={() => onPageChange(1)} disabled={page === 1} aria-label="Primera página">
                <ChevronsLeft className={styles.pageButtonIcon} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Página anterior">
                <ChevronLeft className={styles.pageButtonIcon} />
              </Button>

              <div className={styles.pageNumbers}>
                {generatePageNumbers(page, totalPages).map((pageNum, idx) =>
                  pageNum === '...' ? (
                    <span key={`ellipsis-${idx}`} className={styles.ellipsis}>
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum as number)}
                      className={`${styles.pageNumber} ${page === pageNum ? styles.active : ''}`}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>

              <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Página siguiente">
                <ChevronRight className={styles.pageButtonIcon} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onPageChange(totalPages)} disabled={page === totalPages} aria-label="Última página">
                <ChevronsRight className={styles.pageButtonIcon} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>Marca/Modelo</th>
                <th className={styles.th}>Año</th>
                <th className={styles.th}>Precio</th>
                <th className={styles.th}>Estado</th>
                <th className={styles.th}>Destacado</th>
                <th className={styles.th}>Creado</th>
                <th className={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.skeletonCell}>
                      <div className={styles.skeletonText} style={{ width: '80px' }} />
                      <div className={styles.skeletonText} style={{ width: '60px', height: '12px' }} />
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.skeletonText} style={{ width: '40px' }} />
                  </td>
                  <td className={styles.td}>
                    <div className={styles.skeletonText} style={{ width: '70px' }} />
                  </td>
                  <td className={styles.td}>
                    <div className={styles.skeletonBadge} />
                  </td>
                  <td className={styles.td}>
                    <div className={styles.skeletonText} style={{ width: '20px' }} />
                  </td>
                  <td className={styles.td}>
                    <div className={styles.skeletonText} style={{ width: '80px' }} />
                  </td>
                  <td className={styles.td}>
                    <div className={styles.skeletonButton} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function generatePageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 2) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
}
