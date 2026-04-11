import Loading from '@/components/ui/Loading/Loading'

export default function loading() {
  return (
    <div style={{ display: 'grid', justifyContent: 'center', alignItems: 'center', height: '70dvh' }}>
      <Loading size="lg" label="Cargando..." />
    </div>
  )
}
